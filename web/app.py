#!/usr/bin/env python3
from bottle import HTTPResponse, response, request, \
        install, run, route, static_file, default_app

# pip3 install bottle bottle-redis
import bottle.ext.redis as redis
import json


plugin = redis.RedisPlugin(host='localhost', db=0, decode_responses=True)
install(plugin)

# app = application = Bottle()
# app.DEBUG=True
# default_app.push(app)


@route('/')
def hello():
    return "<html>Hello World!</html>"


@route('/kathe/')
def construct_graph():
    return '''

    <html>
    <head>
    <meta charset="utf-8">
<link rel="stylesheet" href="https://code.cdn.mozilla.net/fonts/fira.css">
<script src="static/d3.v4.min.js"></script>
<script src="static/he.js"></script>
<script src="static/ssdeepsearch.js"></script>
<link rel="stylesheet" href="static/ssdeep.css">



</head>
<body>
<form action="/kathe/ssdeep" method="get"
  onsubmit="AJAXSubmit(this); return false;">
  <fieldset>
    <legend>ssdeep/sha256 search</legend>
<p>
<input type="text" name="ssdeephash" style='width: 100%;'/>
      <!-- <input type="submit" value="Submit" /> -->
    </p>
  </fieldset>
</form>
<div style="width: 920; height:520; margin:0 auto; border: solid 1px #999;">
<svg width='900' height='500'; style="float: center; display: block;"></svg>
</div>
<br />
<div id="ssdeepInfo" style="width: 920; margin: 0 auto; display:block;">
Single-click a node to get information.<br />
Double-click a node to center around that node and get all its siblings.</div>
<br />
<div id="breadcrumb"></div>
</body>
</html>

        '''


def getsiblings(rdb, ssdeephash):
    print(ssdeephash)
    siblings = rdb.zrangebyscore(ssdeephash, 0, 100, withscores=True)
    nodes = [{"id": ssdeephash, "group": 1}]
    links = []
    for sibling in siblings:
        print('sibling:' + str(sibling))
        links.append({'source': ssdeephash,
                      'target': '{}'.format(sibling[0].split(',')[0]),
                      'value': int(float('{}'.format(sibling[1])))})
        nodes.append({'id': sibling[0].split(",")[0], "group": 1})
    rv = json.dumps({'nodes': nodes, 'links': links})
    return rv


@route('/kathe/ssdeep', method='GET')  # or @route('/login', method='POST')
def ssdeep(rdb):
    ssdeephash = request.query.ssdeephash
    if rdb.sismember('hashes:ssdeep', ssdeephash):
        rvs = getsiblings(rdb, ssdeephash)
        response.content_type = 'application/json'
        return rvs
    elif rdb.sismember('hashes:sha256', ssdeephash):
        sha256result = rdb.smembers('info:sha256:{}'.format(ssdeephash))
        print(sha256result)
        (ssdeephash, ) = sha256result
        rvs = getsiblings(rdb, ':'.join(ssdeephash.split(':')[1:4]))
        response.content_type = 'application/json'
        return rvs
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')


@route('/kathe/ssdeepinfo', method='GET')  # or @route('/login', method='POST')
def ssdeepinfo(rdb):
    ssdeephash = request.query.ssdeephash
    response.content_type = 'application/json'
    if rdb.sismember('hashes:ssdeep', ssdeephash):
        infolist = {'ssdeep': ssdeephash}
        allinfo = rdb.smembers('info:ssdeep:{}'.format(ssdeephash))
        for infoline in allinfo:
            infolist['sha256'] = infoline.split(':')[1]
            infolist['context'] = infoline.split(':')[3]
            infolist['filename'] = infoline.split(':')[5]
        rv = {'info': infolist}
        return json.dumps(rv, sort_keys=True)
    elif rdb.sismember('hashes:sha256', ssdeephash):
        infolist = {'sha256': ssdeephash}
        allinfo = rdb.smembers('info:sha256:{}'.format(ssdeephash))
        for infoline in allinfo:
            infolist['ssdeep'] = infoline.split(':')[1:4]
            infolist['context'] = infoline.split(':')[5]
            infolist['filename'] = infoline.split(':')[7]
        rv = {'info': infolist}
        return json.dumps(rv, sort_keys=True)
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')


@route('/kathe/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')


if __name__ == '__main__':
    run(host='0.0.0.0', port=8080, debug=True)
# Run bottle in application mode.
# Required in order to get the application working with uWSGI!
else:
    app = application = default_app()
