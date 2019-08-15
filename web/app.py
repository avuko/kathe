#!/usr/bin/env python3
# from bottle import Bottle
import os
import ast
import json
import logging
import sys
import urllib.parse
from itertools import cycle, islice

import bottle_redis as redis
from bottle import (HTTPResponse, default_app, install, request, response,
                    route, run, static_file, template, TEMPLATE_PATH)

import defaults
import kathe

CONTEXT_SET_LIMIT = defaults.CONTEXT_SET_LIMIT
DATA_SOURCES = defaults.DATA_SOURCES
KATHE_HOST = defaults.KATHE_HOST
KATHE_PORT = defaults.KATHE_PORT
REDIS_HOST = defaults.REDIS_HOST
SORTED_SET_LIMIT = defaults.SORTED_SET_LIMIT

try:
    REDIS_DB = sys.argv[1]
except IndexError:
    REDIS_DB = defaults.REDIS_DB

logging.info('using database #{}'.format(REDIS_DB))

plugin = redis.RedisPlugin(host=REDIS_HOST, db=REDIS_DB, decode_responses=True)
install(plugin)

base_path = os.path.abspath(os.path.dirname(__file__))
template_path = os.path.join(base_path, 'templates')
TEMPLATE_PATH.insert(0, template_path)

def aphash_color(gid):
    # AP hash function by Arash Partow
    s = str(gid)
    hash = 0xAAAAAAAA
    i = 0
    for c in s:
        if i % 2 == 0:
            hash = hash ^ ((hash << 7) ^ ord(c) * (hash >> 3))
    else:
        hash = hash ^ (~ ((hash << 11) + (ord(c) ^ (hash >> 5))))
    return f"#{hex(hash & 0xFFFFFF)[2:]}"


def roundrobin(*iterables):
    # Recipe credited to George Sakkis
    num_active = len(iterables)
    nexts = cycle(iter(it).__next__ for it in iterables)
    while num_active:
        try:
            for next in nexts:
                yield next()
        except StopIteration:
            # Remove the iterator we just exhausted from the cycle.
            num_active -= 1
            nexts = cycle(islice(nexts, num_active))


def unique_list(seq):
    """
    Returns unique values from a sequence. Modified to remove empty context entries
    https://www.peterbe.com/plog/fastest-way-to-uniquify-a-list-in-python-3.6
    """
    return list(dict.fromkeys(s for s in seq if s))


def unique_context_list(seq):
    """
    alternative implementation to allow for splitting a multiple contexts into one unique context string,
    preserving order of the various input strings
    """
    ucl = []
    splitseq = []

    # check if we have a list of context strings
    if len(seq) > 1:
        # split sublists
        for i in seq:
            splitseq.append(i.split('|'))
        # evil itertools list hacking
        rr_ucl = roundrobin(*splitseq)
        # deduplicate
        ucl = unique_list(rr_ucl)

    # if we're dealing with just one set of context
    else:
        if len(seq) > 0:
            ucl = unique_list(seq[0].split('|'))
        else:
            logging.error(f"something weird happened, seq: {seq}")
            return ""

    return ucl


def get_sortedset_count(rdb, sortedset):
    """return the number of items in a sorted set.
    This function is used to repurpose sorted sets as indices
    """
    sortedset_index = None
    if sortedset:
        sortedset_index = float(rdb.zcount(sortedset, '-inf', '+inf'))
    return sortedset_index


def build_ssdeep_cache(rdb, ssdeep, cachename):
    """return a sorted set of all ssdeeps in a particular cache,
    where the score is the position in the sorted set, effectively creating
    an index of unique ssdeeps.
    The SORTED_SET_LIMIT is set because otherwise everything comes to a
    grinding halt.
    """
    # I get the length (at this stage always 0) to kick off the iteration
    length = 0

    if type(ssdeep) is str:
        rdb.zadd(cachename, ssdeep, get_sortedset_count(rdb, cachename))
    elif type(ssdeep) is list:
        for ssdeep_key in ssdeep:
            rdb.zadd(cachename, ssdeep_key, get_sortedset_count(rdb, cachename))
    else:
        logging.info('none result in build_ssdeep_cache')

    while length < get_sortedset_count(rdb, cachename):
        length = get_sortedset_count(rdb, cachename)
        for ssdeep in rdb.zscan_iter(cachename):
            ssdeep = ssdeep[0]
            for ssdeeps in list(rdb.zrange(ssdeep, 0, 100)):
                if get_sortedset_count(rdb, cachename) < SORTED_SET_LIMIT:
                    rdb.zadd(cachename, ssdeeps.split(',')[0],
                             get_sortedset_count(rdb, cachename))
                             
    return cachename


def cache_action(rdb, cachename, cachetype=None, info=None, action=None):
    """ 
    I needed a way to manage the caches.
    See flushcache.py
    """
    # insert type of cache into cachename
    if info is not None and action == 'add':
        if cachetype is not None:
            cachename = cachename.split(':')
            cachename[-1:-1] = [cachetype]
            cachename = ':'.join(cachename)
        rdb.sadd(cachename, info)
        cachelength = rdb.scard(cachename)
    elif action == 'delete':
        if cachetype is not None:
            cachename = cachename.split(':')
            cachename[-1:-1] = [cachetype]
            cachename = ':'.join(cachename)
        rdb.srem('cachecontrol', cachename)
        rdb.delete(cachename)
        cachelength = rdb.scard(cachename)
    return (cachename, cachelength)


def gottacatchemall(rdb, searchquery_type, searchquery_input, ssdeep, sampled):
    """
    Exhaustive function to get all related ssdeep hashes.
    This is where the core of the work is done, linking all ssdeeps together,
    with the ssdeep_compare as a score.
    """
    # get timestamp from latest update
    timestamp = str(rdb.get('timestamp'))
    logging.debug('timestamp: {}'.format(timestamp))
    if sampled is True:
        # label the cache as a sample
        cachename = 'sample:{}:{}:{}'.format('cache', timestamp, searchquery_input)
    else:
        cachename = '{}:{}:{}'.format('cache', timestamp, searchquery_input)

    # check if cache does not already exist
    # if not, create a cache name and add it to the cachecontrol.
    # This prevents both creating the cache twice,
    # and creating a cache while one is already being created.
    if rdb.sismember('cachecontrol', cachename) and 'sample:' not in cachename:
        logging.debug('{} already exists and is not a sample'.format(cachename))
        return cachename

    elif rdb.sismember('cachecontrol', cachename) and 'sample:' in cachename:
        logging.debug('{} already exists and is a sample'.format(cachename))
        for cachetype in [None, 'nodes', 'links', 'json']:
            cache_action(rdb, cachename, cachetype, None, 'delete')
        # input for this is either a single ssdeep string,
        # or a list of ssdeep strings and a cachename
        rdb.sadd('cachecontrol', cachename)
        build_ssdeep_cache(rdb, ssdeep, cachename)
        return cachename

    else:
        logging.debug('{} does not exist'.format(cachename))
        rdb.sadd('cachecontrol', cachename)
        # input for this is either a single ssdeep string,
        # or a list of ssdeep strings and a cachename
        build_ssdeep_cache(rdb, ssdeep, cachename)
        return cachename


def check_verify(rdb, searchquery):
    """
    check_verify does two things:
    1) check whether a searched item exists.
       If not, fail without returning user input
    2) return the type of the searched item, if an item does exist.
    """
    if rdb.zrank('names:context', searchquery) is not None:
        searchtype = 'context'
    elif rdb.sismember('hashes:ssdeep', searchquery):
        searchtype = 'ssdeep'
    elif rdb.sismember('hashes:sha256', searchquery):
        searchtype = 'sha256'
    else:
        searchtype = False

    logging.debug(f'searchtype: {searchtype}')
    return searchtype


def return_search_results(rdb, cachename, allssdeepnodes,
                          allssdeeplinks, allssdeepcontexts, sampled):
    """ 
    store search results as json string in redis if is doesn't already
    exist, retrieve from redis and yield results.
    This also creates a "None" json cache, which is fine by me
    """
    # handling empty queries
    if cachename is None:
        cache_count = 0
        jsoncachename = "None"  # can't split on a None object
    else:
        cache_count = get_sortedset_count(rdb, cachename)
        jsoncachename = cachename.split(':')

        # format json cache name like link and nodes caches
        jsoncachename = cachename.split(':')
        jsoncachename[-1:-1] = ['json']
        jsoncachename = ':'.join(jsoncachename)

    if rdb.exists(jsoncachename):
        logging.debug(f'json cache exists: {jsoncachename}')
        search_results = rdb.get(jsoncachename)
    else:
        dbsize = rdb.scard("hashes:sha256")
        selectioninfo = {"dbsize": '{}'.format(dbsize),
                         "nodecount": '{}'.format(int(cache_count)),
                         "linkcount": '{}'.format(len(allssdeeplinks)),
                         "sample": '{}'.format(sampled).lower()}

        rv = {'info': selectioninfo,
              'nodes': allssdeepnodes,
              'links': allssdeeplinks,
              'contexts': allssdeepcontexts
              }

        rdb.set(jsoncachename, json.dumps(rv, sort_keys=True))
        search_results = rdb.get(jsoncachename)

    yield search_results

  
def find_cachename(rdb, searchquery):
    """
    Check and find the cachename for a given search query
    """

    sampled = False

    # check for invalid input
    if (searchquery == None) or (rdb == None):
        return None

    searchquery_input = searchquery

    if check_verify(rdb, searchquery) == 'ssdeep':
        cachename = gottacatchemall(
            rdb, 'ssdeep', searchquery_input, searchquery, sampled)

    elif check_verify(rdb, searchquery) == 'sha256':
        # if the sha is the same, the ssdeep is certainly the same
        # as a result, this query will never "explode"
        searchquery = (':').join([ssdeeps.split(':')[1:4] for ssdeeps in list(
            rdb.smembers('info:sha256:{}'.format(searchquery)))][0])
        cachename = gottacatchemall(
            rdb, 'sha256', searchquery_input, searchquery, sampled)

    elif check_verify(rdb, searchquery) == 'context':
        # contexts can contain (very) large sets of ssdeeps.
        # To prevent "explosion", we set a limit on the (random) sample.
        if rdb.scard('info:context:{}'.format(searchquery)) > CONTEXT_SET_LIMIT:
            sampled = True
        searchquery = [ssdeeps.split(':')[3:6] for ssdeeps in list(
            rdb.srandmember('info:context:{}'.format(searchquery), CONTEXT_SET_LIMIT))]
        searchquery = [(':').join(splitted) for splitted in searchquery]
        # searchquery is now a list of ssdeep(s)
        cachename = gottacatchemall(
            rdb, 'context', searchquery_input, searchquery, sampled)
    else:
        cachename = None

    return cachename


def create_cache(rdb, cachename):
    """
    Create a cache based on a previously set cachename
    """
    for ssdeep in rdb.zscan_iter(cachename):
        # zrange_iter returns with a tuple (ssdeep,score)
        ssdeep = ssdeep[0]
        alllinks = rdb.zrangebyscore(
            '{}'.format(ssdeep), 0, 100, withscores=True)
        logging.debug(f'ssdeep {ssdeep} alllinks {alllinks}')
        for k in alllinks:
            linkssdeep = k[0].split(',')[0]
            # limit to prevent explosion
            if get_sortedset_count(rdb, cachename) < (SORTED_SET_LIMIT):
                if rdb.zscore(cachename, linkssdeep) is not None:
                    rdb.zadd(cachename, linkssdeep,
                             get_sortedset_count(rdb, cachename))
            # we have hit the max
            else:
                return


def build_graph(rdb, contexts, cachename):
    """
    Build graph data
    """
    allssdeepnodes = []
    allssdeeplinks = []
    allssdeepcontexts = []

    for ssdeep in rdb.zscan_iter(cachename):
        # zrange_iter returns with a tuple (ssdeep,score)
        ssdeep = ssdeep[0]
        alllinks = rdb.zrangebyscore(
            '{}'.format(ssdeep), 0, 100, withscores=True)
        allinfo = rdb.smembers('info:ssdeep:{}'.format(ssdeep))

        # names:context is a list with a zscore based on the number of occurences of a certain context
        # and a zrank function on an ordered set, so we can use it to get the index of a context as integer
        # for our grouping
        contexts = 'names:context'
        contextlist = []
        for infoline in allinfo:
                return_sha256 = infoline.split(':')[1]
                context = infoline.split(':')[3]
                logging.debug(f'context: {context}')
                # The first infoline will determine the "most significant" context of the ssdeep.
                contextlist.append(context)
        context = unique_context_list(contextlist)
        logging.debug(f'contextlist: {contextlist}')

        fullcontextlist = ('|').join(context)
        groupid = rdb.zrank(contexts, context[0])
        newnode = {'id': rdb.zrank(cachename, ssdeep),
                   'name': context,
                   'sha256': return_sha256,
                   'ssdeep': f'{ssdeep}',
                   'main_context': context[0],
                   'groupid': groupid,
                   'color': aphash_color(groupid),
                   'contexts': fullcontextlist}

        logging.debug(rdb.zrank(contexts, context[0]),
                      contexts, contextlist, fullcontextlist,
                      contexts, context)

        allssdeepnodes, allssdeepnodescount = cache_action(rdb,
                                                           cachename,
                                                           'nodes',
                                                           newnode,
                                                           'add')

        allssdeepcontexts = context
        allssdeepcontexts, allssdeepcontextcount = cache_action(rdb,
                                                                cachename,
                                                                'contexts',
                                                                newnode,
                                                                'add')

        for k in alllinks:
            linkssdeep = k[0].split(',')[0]
            # limit to prevent explosion
            if rdb.zscore(cachename, linkssdeep):
                source = rdb.zrank(cachename, ssdeep)
                target = rdb.zrank(cachename, linkssdeep)
                newlink = {'source': source,
                           'target': target,
                           'value': (k[1] / float(10)),
                           'ssdeepcompare': k[1],
                           'color': aphash_color(source),
                           'id': f"{source}_{target}"}
                # only uniques, so no need to verify existence
                allssdeeplinks, allssdeeplinksscount = cache_action(rdb,
                                                                    cachename,
                                                                    'links',
                                                                    newlink,
                                                                    'add')

    allssdeepnodes = list([ast.literal_eval(x)
                           for x in list(rdb.smembers(allssdeepnodes))])
    allssdeeplinks = list([ast.literal_eval(x)
                           for x in list(rdb.smembers(allssdeeplinks))])
    allssdeepcontexts = contexts

    return allssdeepnodes, allssdeeplinks, allssdeepcontexts

def get_cached_graph(rdb, cachename):
    """
    TODO: Retrieve cached graph data from redis
    """
    graph = {}

    try:
        pass

    except Exception as cache_error:
        pass

    return graph

    # reminder, cache function (accepts 'add' and 'delete'):
    # def cache_action(rdb, cachename, cachetype=None, info=None, action=None):


# web service routes begin here
@route('/')
def hello():
    """ Welcome message, redirects to the main gui """
    return template('./index.html')


@route('/add', method='POST')
@route('/add/', method='POST')
def upload_handler():
    """ This route is used to upload new hashes."""
    try:
        # parse input data
        try:
            data = request.json
        except ValueError:
            response.status = 400
            return

        if data is None:
            raise ValueError

        # extract and validate name
        try:
            info = data['info']
        except (TypeError, KeyError):
            raise ValueError

    except ValueError:
        # if bad request data, return 422 Unprocessable Entity
        response.status = 422
        return

    # add info
    if kathe.rest_add(info):
        # return 200 Success
        response.headers['Content-Type'] = 'application/json'
        return json.dumps({'ingested_count': len(info)})
    else:
        # Unsupported Media Type
        response.status = 415
        response.headers['Content-Type'] = 'application/json'
        return json.dumps(info)


@route('/kathe', method='GET')
@route('/kathe/', method='GET')
def build_context(querystring=None):
    """ 
    This route provides the main GUI.
    """
    querystring = request.query.search
    
    return template('./kathe.html', 
                    querystring=urllib.parse.quote_plus(querystring), 
                    querystring2=urllib.parse.quote_plus(querystring).replace('+', '%2B')
                    )


@route('/search', method='GET')
@route('/search/', method='GET')
def contextinfo(rdb, querystring=None):
    response.content_type = 'application/json'

    querystring = request.query.search
    contexts = 'names:context'

    allssdeepnodes = []
    allssdeeplinks = []
    allssdeepcontexts = []

    sampled = False
    cachename = None

    if querystring is not None and len(querystring) is not 0:
        searchquery = querystring
        logging.debug(f'searchquery: {querystring}')
    else:
        # no search query given, terminate with empty results
        return return_search_results(rdb, cachename, allssdeepnodes,
                                     allssdeeplinks, allssdeepcontexts, sampled)
    
    # first we create a cache
    cachename = find_cachename(rdb, searchquery)
    create_cache(rdb, cachename)

    if get_sortedset_count(rdb, cachename) >= (SORTED_SET_LIMIT):
        sampled = True

    # then we add context and links
    allthethings = build_graph(rdb, contexts, cachename)

    return return_search_results(rdb, cachename, allthethings[0],
                                 allthethings[1], allthethings[2], sampled)


@route('/info', method='GET')
@route('/info/', method='GET')
def ssdeepinfo(rdb):
    queryhash = request.query.ssdeephash
    response.content_type = 'application/json'
    if rdb.sismember('hashes:ssdeep', queryhash):
        infolist = {'ssdeep': queryhash}
        allinfo = rdb.smembers('info:ssdeep:{}'.format(queryhash))
        contextlist = []
        sha256list = []
        namelist = []
        for infoline in allinfo:
            # create an attribute to link sha256 hashes to online data sources

            # I think this causes some strange behaviour in the info0 and info1 boxes.
            # it might be necessary to remove the non-link sha256 from whatever is being used for these -L
            for data_source in DATA_SOURCES:
                if data_source in infoline.split(':')[3]:
                    sha256list.append('{}{}'.format(DATA_SOURCES[data_source],
                                      infoline.split(':')[1]))
                else:
                    sha256list.append(infoline.split(':')[1])
            namelist.append(infoline.split(':')[5])
            contextlist.append(infoline.split(':')[3])

        # I made a second unique_list function to create an ordered list of unique context terms
        infolist['context'] = ('|').join(unique_context_list(contextlist))

        infolist['name'] = ('|').join(sorted(unique_list(namelist)))
        infolist['sha256'] = ('|').join(sorted(unique_list(sha256list)))
        rv = [infolist]
        return json.dumps(rv, sort_keys=True)
    else:
        return HTTPResponse(status=404, body=f'ssdeep hash {queryhash} not found')


@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root=os.path.join(base_path, 'static'))


if __name__ == '__main__':
    run(host=KATHE_HOST, port=KATHE_PORT, debug=False)
# Run bottle in application mode.
# Required in order to get the application working with uWSGI!
else:
    app = application = default_app()
