#!/usr/bin/env python3
from bottle import Bottle, HTTPResponse, response, request, \
        install, run, route, static_file, default_app
import json
import math
import urllib.parse
import ast
import bottle_redis as redis

MYHOST = '127.0.0.1'
MYHOST = '0.0.0.0'

REDISDB = 1 
SORTED_SET_LIMIT = 512
CONTEXT_SET_LIMIT = 256


# XXX testing
# import json
# import math
# import redis
# REDISDB = 14
# rdb = redis.StrictRedis(host='localhost', db=REDISDB, decode_responses=True)

# app = application = Bottle(catchall=False)
# app.DEBUG=True
# app.debug=True
# decode responses is important here
plugin = redis.RedisPlugin(host='localhost', db=REDISDB, decode_responses=True)
install(plugin)


def get_sortedset_count(rdb, sortedset):
    sortedset_index = None
    if sortedset:
        sortedset_index = float(rdb.zcount(sortedset, '-inf', '+inf'))
    return sortedset_index


def build_ssdeep_cache(rdb, ssdeep, cachename):
    # insert type of cache into cachename
    cachename = cachename.split(':')
    cachename = ':'.join(cachename)
    # I get the length (at this stage always 0) to kick off the iteration
    length = rdb.zcount(cachename, '-inf', '+inf')
    if type(ssdeep) is str:
        rdb.zadd(cachename, ssdeep, get_sortedset_count(rdb, cachename))
        # ssdeeplist = [ssdeep]
    elif type(ssdeep) is list:
        # ssdeeplist = ssdeep
        for ssdeep_key in ssdeep:
            rdb.zadd(cachename, ssdeep_key, get_sortedset_count(rdb, cachename))
    else:
        print('none')
        # it will return 0 when queried?
        # see if we need to limit here
    while length < get_sortedset_count(rdb, cachename):
        length = get_sortedset_count(rdb, cachename)
        # we probably need to iterate over the sorted set, zrange
        for ssdeep in rdb.zscan_iter(cachename):
            # return ssdeep and (0) score
            ssdeep = ssdeep[0]
            for ssdeeps in list(rdb.zrange(ssdeep, 0, 100)):
                if get_sortedset_count(rdb, cachename) < SORTED_SET_LIMIT:
                    rdb.zadd(cachename, ssdeeps.split(',')[0], get_sortedset_count(rdb, cachename))
    return cachename

def cache_action(rdb, cachename, cachetype=None, info=None, action=None):
    # insert type of cache into cachename
    if info is not None and action == 'add':
        if cachetype is not None:
            cachename = cachename.split(':')
            cachename[-1:-1] = [cachetype]
            cachename = ':'.join(cachename)
        rdb.sadd(cachename, info)
        cachelength = rdb.scard(cachename)
    elif info is None and action == 'delete':
        if cachetype is not None:
            cachename = cachename.split(':')
            cachename[-1:-1] = [cachetype]
            cachename = ':'.join(cachename)
        rdb.srem('cachecontrol', cachename)
        rdb.delete(cachename)
        cachelength = rdb.scard(cachename)
    return (cachename, cachelength)

def build_links_cache(rdb, nodeinfo, cachename):
    # insert type of cache into cachename
    cachename = cachename.split(':')
    cachename[-1:-1] = ['links']
    cachename = ':'.join(cachename)
    rdb.sadd(cachename, nodeinfo)
    cachelength = rdb.scard(cachename)
    return (cachename, cachelength)

def gottacatchemall(rdb, searchquery_type, searchquery_input, ssdeep, sampled):
    # XXX def gottacatchemall(searchquery_type, searchquery_input, ssdeep, sampled):
    """exhaustive function to get all related ssdeep hashes"""
    # get timestamp from latest update
    timestamp = str(rdb.get('timestamp'))
    print('timestamp: {}'.format(timestamp))
    if sampled == True:
        # label the cache as a sample
        cachename = 'sample:{}:{}:{}'.format('cache', timestamp, searchquery_input)
    else:
        cachename = '{}:{}:{}'.format('cache', timestamp, searchquery_input)
    # I get the length (at this stage always 0) to kick off the iteration
    # check if cache does not already exist
    if rdb.sismember('cachecontrol', cachename) and 'sample:' not in cachename:
        print('{} already exists and is not a sample'.format(cachename))
        return cachename
        # XXX debug
        # rdb.srem('cachecontrol', cachename)
        # rdb.delete(cachename)
        # if not, create a cache name and add it to the cachecontrol.
        # This prevents both creating the cache twice,
        # and creating a cache while one is already being created.

    elif rdb.sismember('cachecontrol', '{}'.format(cachename)):
        print('{} already exists and is a sample'.format(cachename))
        for cachetype in [None, 'nodes', 'links']:
            cache_action(rdb, cachename, cachetype, None, 'delete')
        # input for this is either a single ssdeep string,
        # or a list of ssdeep strings and a cachename
        rdb.sadd('cachecontrol', cachename)
        build_ssdeep_cache(rdb, ssdeep, cachename)
        return cachename

    else:
        print('{} does not exist'.format(cachename))
        rdb.sadd('cachecontrol', cachename)
        # input for this is either a single ssdeep string,
        # or a list of ssdeep strings and a cachename
        build_ssdeep_cache(rdb, ssdeep, cachename)
        return cachename


# def check_verify(rdb, searchquery):
def check_verify(rdb, searchquery):
    """ check_verify does two things:
    1) check wether a searched item exists.
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
    return searchtype


def return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled):
    # handling empty queries
    if cachename is not None:
        cache_count = get_sortedset_count(rdb, cachename)
    else:
        cache_count = 0
    selectioninfo = {"nodecount": '{}'.format(int(cache_count)), "linkcount": '{}'.format(len(allssdeeplinks)), "sample": '{}'.format(sampled).lower()}
    rv = {'info': selectioninfo, 'nodes': allssdeepnodes, 'links': allssdeeplinks}
    yield json.dumps(rv, sort_keys=True)


@route('/')
def hello():
    """ redirect to kathe """
    return """<html>
<head>
<meta http-equiv="refresh" content="3;URL=kathe/" />
<style>
object {display: block; width: 60%; height: 50vh; border: 0; overflow: hidden; margin: auto; margin-top: 10vh;}
</style>
<link rel="stylesheet" href="/static/fira.css">
<link rel="stylesheet" href="/static/ssdeep.css">
<link rel="stylesheet" href="/static/kathe.css">
</head>
<body>
<!--[if IE]>
<object classid="clsid:25336920-03F9-11CF-8FD0-00AA00686F13" data="static/katherine.html">
</object>
<![endif]-->

<!--[if !IE]> <-->
<object type="text/html" data="static/katherine.html">
</object>
<!--> <![endif]-->
</body>
</html>"""


@route('/kathe')
@route('/kathe/')
def build_context(querystring=None):
    # def build_context(querystring):
    """ This route provides the main GUI.
It consists of glued together CSS, JavaScript and python.
I use Redis for the backend and D3.js for the frontend.
    """
    querystring = request.query.search
    response = """
<!DOCTYPE html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/static/fira.css">
<link rel="stylesheet" href="/static/ssdeep.css">
<link rel="stylesheet" href="/static/kathe.css">
</head>
<body>
 <div id="contextdiv"></div>
 <div style="" id="container">
  <form action="/kathe/" method="get">
   <fieldset>
     <legend>ssdeep | sha256 | context search</legend><p>
     <input type="text" name="search" id="search"/> </p>
   </fieldset>
  </form>

  <div id="chart"><span id="infospan"></span></div>
  <span id="info0"></span>
  <span id="info1"></span>
 </div>
 <script src="/static/d3.v4.min.js"> </script>
 <script>
  var searchvalue = decodeURIComponent("{}");
  var unescaped_searchvalue = "{}";
 </script>
 <script src="/static/kathe.js"> </script>
</body>
</html>
""".format(urllib.parse.quote_plus(querystring).replace('+', '%2B'),
           urllib.parse.quote_plus(querystring).replace('+', '%2B'))
    return response


@route('/search', method='GET')
@route('/search/', method='GET')
def contextinfo(rdb, querystring=None):
# def contextinfo(querystring):
    querystring = request.query.search
    contexts = 'names:context'
    allcontexts = []
    allssdeepnodes = []
    allssdeeplinks = []
    selectioninfo = []
    sampled = False

    if querystring is not None and len(querystring) is not 0:
        searchquery = querystring
    else:
        searchquery = None
    # here we check and build the list of involved ssdeep hashes
    if searchquery is not None:
        if check_verify(rdb, searchquery) == 'ssdeep':
            searchquery_input = searchquery
            print("ssdeepsearchquery", len(searchquery))
            cachename = gottacatchemall(rdb, 'ssdeep', searchquery_input, searchquery, sampled)
        elif check_verify(rdb, searchquery) == 'sha256':
            # if the sha is the same, the ssdeep is certainly the same
            # as a result, this query will never "explode"
            searchquery_input = searchquery
            searchquery = (':').join([ssdeeps.split(':')[1:4] for ssdeeps in list(rdb.smembers('info:sha256:{}'.format(searchquery)))][0])
            print("sha256searchquery", len(searchquery))
            cachename = gottacatchemall(rdb, 'sha256', searchquery_input, searchquery, sampled)
        elif check_verify(rdb, searchquery) == 'context':
            searchquery_input = searchquery
            # contexts can contain (very) large sets of ssdeeps.
            # To prevent "explosion", we set a limit on the (random) sample.
            if rdb.scard('info:context:{}'.format(searchquery)) > CONTEXT_SET_LIMIT:
                sampled = True
            searchquery = [ssdeeps.split(':')[3:6] for ssdeeps in list(rdb.srandmember('info:context:{}'.format(searchquery), CONTEXT_SET_LIMIT))]
            searchquery = [(':').join(splitted) for splitted in searchquery]
            print("contextsearchquery", len(searchquery))
            # searchquery is now a list of ssdeep(s)
            cachename = gottacatchemall(rdb, 'context', searchquery_input, searchquery, sampled)

        else:
            # return empty values
            cachename = None
            return return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled)

        # firt we create the cache
        for ssdeep in rdb.zscan_iter(cachename):
            # zrange_iter returns with a tuple (ssdeep,score)
            ssdeep = ssdeep[0]
            alllinks = rdb.zrangebyscore('{}'.format(ssdeep), 0, 100, withscores=True)
            for k in alllinks:
                linkssdeep = k[0].split(',')[0]
                # limit to prevent explosion
                if get_sortedset_count(rdb, cachename) < (SORTED_SET_LIMIT):
                    if rdb.zscore(cachename, linkssdeep) is not None:
                        rdb.zadd(cachename, linkssdeep, get_sortedset_count(rdb, cachename))
                # we have hit max, report the selection is a sample
                else:
                    sampled = True

        # then we add context and links
        for ssdeep in rdb.zscan_iter(cachename):
            # zrange_iter returns with a tuple (ssdeep,score)
            ssdeep = ssdeep[0]
            alllinks = rdb.zrangebyscore('{}'.format(ssdeep), 0, 100, withscores=True)
            allinfo = rdb.smembers('info:ssdeep:{}'.format(ssdeep))
            # names:context is a list with a zscore based on the number of occurences of a certain context
            # and a zrank function on an ordered set, so we can use it to get the index of a context as integer
            # for our grouping
            contexts = 'names:context'
            contextlist = []
            for infoline in allinfo:
                    context = infoline.split(':')[3].split('|')
                    # The first infoline will determine the "most significant" context of the ssdeep.
                    # the first item of the contextlist created from the first infoline will be the
                    # most significant context used below.
                    # get the second last (or the only) element
                    # probably needs <=, not ==
                    # this is still an ugly hack to get a single "family context"
                    # based on location of that "family context" in the original
                    # kathe contexts list. TODO
                    if context[0] not in contextlist:
                        contextlist.append(context[0])

                    # if len(context) <= 2:
                    #    context = context[1:][0]
                    # else:
                    #    context = context[len(context)-2:][0]
                    # contextlist.append(context)

            # allcontexts = (':').join(sorted(contextlist))
            # allcontext.append(contexts)
            # allssdeepnodes.append({'id': rdb.zrank(cachename, ssdeep),
            #                         'name': '{}'.format(ssdeep),
            #                         'name_fam': '{} ({})'.format(ssdeep,contextlist),
            #                         'group': allcontext.index(contextlist),
            #                         'fam': contextlist})

            # if a contextlist exists of multiple different "most significant" contexts,
            # that combined contextlist string should already be a separate context in
            # "names:contexts" as created by "kathe.py"
            contextlist = ('/').join(sorted(contextlist))
            newnode = {'id': rdb.zrank(cachename, ssdeep),
                                  'name': '{}'.format(ssdeep),
                                  'name_fam': '{} ({})'.format(ssdeep,contextlist),
                                  'group': rdb.zrank(contexts, contextlist),
                                  'fam': contextlist}
            allssdeepnodes, allssdeepnodescount = cache_action(rdb, cachename, 'nodes', newnode, 'add')
            for k in alllinks:
                linkssdeep = k[0].split(',')[0]
                # limit to prevent explosion
                if rdb.zscore(cachename, linkssdeep):
                    newlink = {'source': rdb.zrank(cachename, ssdeep), 'target': rdb.zrank(cachename, linkssdeep), 'value': math.ceil(k[1])}
                    # only uniques, so no need to verify existance
                    allssdeeplinks, allssdeeplinksscount = cache_action(rdb, cachename, 'links', newlink, 'add')
                    # if newlink not in allssdeeplinks:
                    #    allssdeeplinks.append(newlink)

        # print(sampled)
        allssdeepnodes = list([ast.literal_eval(x) for x in list(rdb.smembers(allssdeepnodes))])
        allssdeeplinks = list([ast.literal_eval(x) for x in list(rdb.smembers(allssdeeplinks))])
        # print(allssdeepnodes, allssdeeplinks)
        return return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled)

    else:
        # if searchquery is None, return empty json
        cachename = None
        return return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled)

@route('/info', method='GET')
@route('/info/', method='GET')
def ssdeepinfo(rdb):
# def ssdeepinfo(queryhash):
    queryhash = request.query.ssdeephash
    response.content_type = 'application/json'
    if rdb.sismember('hashes:ssdeep', queryhash):
        infolist = {'ssdeep': queryhash}
        allinfo = rdb.smembers('info:ssdeep:{}'.format(queryhash))
        contextlist = []
        sha256list = []
        filenamelist = []
        for infoline in allinfo:
            sha256list.append(infoline.split(':')[1])
            filenamelist.append(infoline.split(':')[5])
            contextlist.append(infoline.split(':')[3])


        infolist['context'] = (':').join(sorted(contextlist))
        infolist['name'] = ('<br />').join(sorted(filenamelist))
        infolist['sha256'] = (',').join(sorted(sha256list))
        rv = {'info': infolist}
        return json.dumps(rv, sort_keys=True)
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')


@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')


if __name__ == '__main__':
    run(host=MYHOST, port=8888, debug=True)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = default_app()

