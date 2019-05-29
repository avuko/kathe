#!/usr/bin/env python3
# from bottle import Bottle
from bottle import HTTPResponse, response, request, \
    install, run, route, static_file, default_app
import json
import urllib.parse
import ast
import bottle_redis as redis
import sys

MYHOST = '127.0.0.1'
# MYHOST = '0.0.0.0'

try:
    REDISDB = sys.argv[1]
except IndexError:
    REDISDB = 14

SORTED_SET_LIMIT = 500
CONTEXT_SET_LIMIT = 2000
print('using database #{}'.format(REDISDB))

# data sources of analysed binaries, used under /info/:
data_sources = {'hybridanalysis': 'https://www.hybrid-analysis.com/sample/',
                'malpedia': 'https://malpedia.caad.fkie.fraunhofer.de/',
                'virustotal': 'https://www.virustotal.com/#/file/'}

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

def unique_list(seq):
    """
    https://www.peterbe.com/plog/fastest-way-to-uniquify-a-list-in-python-3.6
    """
    return list(dict.fromkeys(seq))

def get_sortedset_count(rdb, sortedset):
    """
    Return the number of items in a sorted set.
    This function is used to repurpose sorted sets as indices
    """
    sortedset_index = None
    if sortedset:
        sortedset_index = float(rdb.zcount(sortedset, '-inf', '+inf'))
    return sortedset_index

def build_ssdeep_cache(rdb, ssdeep, cachename):
    """
    return a sorted set of all ssdeeps in a particular cache,
    where the score is the position in the sorted set, effectively creating
    an index of unique ssdeeps.
    The SORTED_SET_LIMIT is set because otherwise everything comes to a
    grinding halt.
    """
    # I get the length (at this stage always 0) to kick off the iteration
    length = rdb.zcount(cachename, '-inf', '+inf')
    if type(ssdeep) is str:
        rdb.zadd(cachename, ssdeep, get_sortedset_count(rdb, cachename))
    elif type(ssdeep) is list:
        for ssdeep_key in ssdeep:
            rdb.zadd(cachename, ssdeep_key, get_sortedset_count(rdb, cachename))
    else:
        print('none')

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
    XXX I think this is not working as a think it does.
    """
    # insert type of cache into cachename
    if info is not None and action == 'add':
        if cachetype is not None:
            cachename = cachename.split(':')
            cachename[-1:-1] = [cachetype]
            cachename = ':'.join(cachename)
            # print('adding', cachename, info)
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
    """exhaustive function to get all related ssdeep hashes.
    This is where the core of the work is done, linking all ssdeeps together,
    with the ssdeep_compare as a score.
    """
    # get timestamp from latest update
    timestamp = str(rdb.get('timestamp'))
    print('timestamp: {}'.format(timestamp))
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
        print('{} already exists and is not a sample'.format(cachename))
        return cachename

    elif rdb.sismember('cachecontrol', cachename) and 'sample:' in cachename:
        """Aparently I refresh the cache if it is a sample.
        I wonder if this really works?
        """
        print('{} already exists and is a sample'.format(cachename))
        for cachetype in [None, 'nodes', 'links', 'json']:
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

    #print(f'searchtype: {searchtype}')
    return searchtype

def return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled):
    """ 
    Store search results as json string in redis if is doesn't already
    exist, retrieve from redis and yield results.
    This also creates a "None" json cache, which is fine by me
    """
    # handling empty queries
    if cachename is not None:
        cache_count = get_sortedset_count(rdb, cachename)
        jsoncachename = cachename.split(':')
    else:
        cache_count = 0
        jsoncachename = []

    # format json cache name like link and nodes caches
    jsoncachename[-1:-1] = ['json']
    jsoncachename = ':'.join(jsoncachename)
    # jsoncachename = "json:{}".format(cachename)
    # if rdb.exists(jsoncachename):
    #     print('json cache exists')
    #     print(jsoncachename)
    #     search_results = rdb.get(jsoncachename)
    # else:
    #     selectioninfo = {"nodecount": '{}'.format(int(cache_count)), "linkcount": '{}'.format(len(allssdeeplinks)), "sample": '{}'.format(sampled).lower()}
    #     rv = {'info': selectioninfo, 'nodes': allssdeepnodes, 'links': allssdeeplinks}
    #     rdb.set(jsoncachename, json.dumps(rv, sort_keys=True))
    #     search_results = rdb.get(jsoncachename)
    selectioninfo = {"nodecount": '{}'.format(int(cache_count)), "linkcount": '{}'.format(len(allssdeeplinks)), "sample": '{}'.format(sampled).lower()}
    rv = {'info': selectioninfo, 'nodes': allssdeepnodes, 'links': allssdeeplinks}
    rdb.set(jsoncachename, json.dumps(rv, sort_keys=True))
    search_results = rdb.get(jsoncachename)
    yield search_results

# web service routes begin here
@route('/')
def hello():
    """ redirect to kathe """
    return """<html>
<head>
<meta http-equiv="refresh" content="0;URL=kathe/" />
<style>
object {display: block; width: 60%; height: 50vh; border: 0; overflow: hidden; margin: auto; margin-top: 10vh;}
</style>
<link rel="stylesheet" href="/static/fira.css">
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
    I use Redis for the backend and force-graph.js for the frontend.
    """
    querystring = request.query.search
    response = """
<!DOCTYPE html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/static/fira.css">
<link rel="stylesheet" href="/static/kathe.css">
</head>
<body>
 <script>
 var urlParams = new URLSearchParams(window.location.search);
 var searchparam = urlParams.get('search');
 </script>
 <div id="searchform">
  <form action="/kathe/" method="get">
   <fieldset>
     <legend>ssdeep | sha256 | context</legend><p>
     <input type="text" name="search" id="search" value="{}" onFocus="this.value=''" onBlur="this.value=searchparam"/></p>
   </fieldset>
  </form>
  </div>

  <div id="graph"></div>
<div id="info0">info0</div><div id="info1">info1</div>
 <script>
  var searchvalue = decodeURIComponent("{}");
  var unescaped_searchvalue = "{}";

 // function to turn 'http://<something>' strings into hrefs
 function string_to_href(inputstring) {{
 var splitstring = inputstring.split('|');
 var returnstring = '';
 for (i = 0; i < splitstring.length; i++) {{
    var splstr = splitstring[i];
    if (splstr.startsWith('http')) {{
    returnstring += ('<a href=\"' + splstr + '\" target=\"_blank\">' + splstr.split('/').pop() + '</a><br />')
    }}
    else {{
    returnstring += (splstr + '<br />')
    }}
    }}
 return returnstring;
 }}
 </script>
 <!--script src="/static/2d/force-graph.js"></script> -->
 <!-- 2d -->
 <script src="https://unpkg.com/force-graph"></script>
 <!-- 3d -->
 <!-- <script src="https://unpkg.com/3d-force-graph"></script> -->
 <script>
// fetch ssdeephash info
function ssdeepinfo(ssdeep) {{
 return fetch("/info/?ssdeephash=" + encodeURIComponent(ssdeep), {{cache: "no-store"}})
    .then(response => response.json())
    .then(jsonresponse => json2table(jsonresponse));
}}


// table from json script
function json2table(json, classes) {{
  var cols = Object.keys(json[0]);
  var headerRow = '';
  var bodyRows = '';
  classes = classes || '';

  json.map(function(row) {{
  cols.map(function(colName) {{
    bodyRows += '<tr><td><b>'+ colName + '</b></td><td>' + string_to_href(row[colName]) + '</td></tr>'
  }})
  }});

  return '<table class="' +
         classes +
         '"><thead><tr>' +
         headerRow +
         '</tr></thead><tbody>' +
         bodyRows +
         '</tbody></table>';
}};

// infoblocks scripts
// info0
 function kathehover(ssdeep){{
 ssdeepinfo(ssdeep).then(function(info0){{document.getElementById('info0').innerHTML = info0}})
              .catch(error => console.error(error));

 }};
// info1
 function katheclick(ssdeep){{
 ssdeepinfo(ssdeep).then(function(info1){{document.getElementById('info1').innerHTML = info1}})
              .catch(error => console.error(error));
 }};


 </script>
 <script>
    var graphDiv = document.getElementById("graph");
    // we need to grab these to set them later
    var graphwidth =  '98px';
    var graphheight = '98px';
    fetch("/search/?search=" + unescaped_searchvalue, {{cache: "no-store"}})
    .then(res => res.json())
    .then((out) => {{
    var myData = out;
    const elem = document.getElementById('graph');
    const Graph = ForceGraph( {{ alpha: true }} )
        (elem)
        // comment backgroundcolor out for 3d
        .backgroundColor('#fdfdfc')
        .nodeAutoColorBy('groupid')
        // linking to target.id makes the link colouring work
        .linkAutoColorBy(d => myData.nodes[d.target].id)
        .linkLabel('ssdeepcompare')
        .linkHoverPrecision('1')
        .linkWidth('value')
        .graphData(myData)
        .onNodeHover(node => {{
          if (node !== null ) {{kathehover(node.ssdeep);}}
        }})
        .onNodeRightClick(node => {{
          // comment zoom stuff out for 3d
          Graph.centerAt(node.x, node.y, 1000);
          Graph.zoom(8, 2000);
        }})
        .onNodeClick(node => {{
          if (node !== null ) {{katheclick(node.ssdeep);}}

        }})

    }}).catch(err => console.error(err));
 </script>
</body>
</html>
""".format(urllib.parse.quote_plus(querystring),
           urllib.parse.quote_plus(querystring).replace('+', '%2B'),
           urllib.parse.quote_plus(querystring).replace('+', '%2B'))
    return response

@route('/search', method='GET')
@route('/search/', method='GET')
def contextinfo(rdb, querystring=None):
    response.content_type = 'application/json'
    # def contextinfo(querystring):
    querystring = request.query.search
    contexts = 'names:context'
    # allcontexts = []
    allssdeepnodes = []
    allssdeeplinks = []
    # selectioninfo = []
    sampled = False

    if querystring is not None and len(querystring) is not 0:
        searchquery = querystring
        #print(f'searchquery: {querystring}')
    else:
        searchquery = None
    # here we check and build the list of involved ssdeep hashes
    if searchquery is not None:
        if check_verify(rdb, searchquery) == 'ssdeep':
            searchquery_input = searchquery
            cachename = gottacatchemall(rdb, 'ssdeep', searchquery_input, searchquery, sampled)
        elif check_verify(rdb, searchquery) == 'sha256':
            # if the sha is the same, the ssdeep is certainly the same
            # as a result, this query will never "explode"
            searchquery_input = searchquery
            searchquery = (':').join([ssdeeps.split(':')[1:4] for ssdeeps in list(rdb.smembers('info:sha256:{}'.format(searchquery)))][0])
            cachename = gottacatchemall(rdb, 'sha256', searchquery_input, searchquery, sampled)
        elif check_verify(rdb, searchquery) == 'context':
            searchquery_input = searchquery
            # contexts can contain (very) large sets of ssdeeps.
            # To prevent "explosion", we set a limit on the (random) sample.
            if rdb.scard('info:context:{}'.format(searchquery)) > CONTEXT_SET_LIMIT:
                sampled = True
            searchquery = [ssdeeps.split(':')[3:6] for ssdeeps in list(rdb.srandmember('info:context:{}'.format(searchquery), CONTEXT_SET_LIMIT))]
            searchquery = [(':').join(splitted) for splitted in searchquery]
            # searchquery is now a list of ssdeep(s)
            cachename = gottacatchemall(rdb, 'context', searchquery_input, searchquery, sampled)
        else:
            # return empty values
            cachename = None
            return return_search_results(rdb, cachename, allssdeepnodes, allssdeeplinks, sampled)

        # first we create the cache
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
            #print(f'allinfo: {allinfo}')
            # names:context is a list with a zscore based on the number of occurences of a certain context
            # and a zrank function on an ordered set, so we can use it to get the index of a context as integer
            # for our grouping
            contexts = 'names:context'
            contextlist = []
            for infoline in allinfo:
                    return_sha256 = infoline.split(':')[1]
                    prettycontext = infoline.split(':')[3]
                    context = prettycontext.split('|')
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
            # if a contextlist exists of multiple different "most significant" contexts,
            # that combined contextlist string should already be a separate context in
            # "names:contexts" as created by "kathe.py"
            print(context)
            fullcontextlist = ('|').join(context)
            newnode = {
                       'id': rdb.zrank(cachename, ssdeep),
                       'name': '{}'.format(contextlist),
                       'sha256': return_sha256,
                       'ssdeep': '{}'.format(ssdeep),
                       'ssdeep_contexts': '{} ({})'.format(ssdeep, contextlist),
                       'groupid': rdb.zrank(contexts, contextlist),
                       'contexts': fullcontextlist}
            allssdeepnodes, allssdeepnodescount = cache_action(rdb,
                                                               cachename,
                                                               'nodes',
                                                               newnode,
                                                               'add')
            for k in alllinks:
                linkssdeep = k[0].split(',')[0]
                # limit to prevent explosion
                if rdb.zscore(cachename, linkssdeep):
                    newlink = {'source': rdb.zrank(cachename, ssdeep),
                               'target': rdb.zrank(cachename, linkssdeep),
                               'value': (k[1] / float(10)),
                               'ssdeepcompare': k[1]}
                    # only uniques, so no need to verify existence
                    allssdeeplinks, allssdeeplinksscount = cache_action(rdb,
                                                                        cachename,
                                                                        'links',
                                                                        newlink,
                                                                        'add')

        allssdeepnodes = list([ast.literal_eval(x) for x in list(rdb.smembers(allssdeepnodes))])
        allssdeeplinks = list([ast.literal_eval(x) for x in list(rdb.smembers(allssdeeplinks))])
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
        splitlist = []
        sha256list = []
        namelist = []
        for infoline in allinfo:
            # create an attribute to link sha256 hashes to online data sources
            for data_source in data_sources:
                if data_source in infoline.split(':')[3]:
                    sha256list.append('{}{}'.format(data_sources[data_source],
                                      infoline.split(':')[1]))
                else:
                    sha256list.append(infoline.split(':')[1])
            namelist.append(infoline.split(':')[5])
            # get context from infoline
            splitlist.append(infoline.split(':')[3].split('|'))
            # flatten infolines to get a list of context terms, dump empty strings as well.
            contextlist = unique_list([i for l in splitlist for i in l if i!=''])

        infolist['context'] = ('|').join(contextlist)
        infolist['name'] = ('|').join(sorted(unique_list(namelist)))
        infolist['sha256'] = ('|').join(sorted(unique_list(sha256list)))
        # rv = {'info': infolist}
        rv = [infolist]
        return json.dumps(rv, sort_keys=True)
    else:
        return HTTPResponse(status=404, body=f'ssdeep hash {queryhash} not found')

@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')

if __name__ == '__main__':
    run(host=MYHOST, port=8888, debug=True)
# Run bottle in application mode.
# Required in order to get the application working with uWSGI!
else:
    app = application = default_app()
