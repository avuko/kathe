#!/usr/bin/env python3
from bottle import Bottle, HTTPResponse, response, request, \
        install, run, route, static_file, default_app

try:
    import bottle.ext.redis as redis
except:
    print("pip3 install bottle bottle-redis")

import json
import math
import urllib.parse

MYHOST = '50.116.9.93'
MYHOST = '127.0.0.1'
REDISDB = 14


plugin = redis.RedisPlugin(host='localhost', db=REDISDB, decode_responses=True)
install(plugin)

# app = application = Bottle()
# app.DEBUG=True
# default_app.push(app)


def gottacatchemall(rdb, ssdeep):
    """exhaustive function to get all related ssdeep hashes"""
    ssdeeplist = []
    length = len(ssdeeplist)
    if type(ssdeep) is str:
        ssdeeplist = [ssdeep]
    elif type(ssdeep) is list:
        ssdeeplist = ssdeep
    else:
        ssdeeplist = []
    # ssdeeplist = ssdeep
    while length != len(ssdeeplist):
        for ssdeep in ssdeeplist:
            for ssdeeps in list(rdb.zrange(ssdeep, 0, 100)):
                if ssdeeps.split(',')[0] not in ssdeeplist:
                    ssdeeplist.extend([ssdeeps.split(',')[0]])
        length = len(ssdeeplist)
    return(list(set(ssdeeplist)))


def check_verify(rdb, searchquery):
    """ check_verify does two things:
    1) check wether a searched item exists.
       If not, fail without returning user input
    2) return the type of the searched item, if an item does exist.
    """
    if rdb.sismember('names:context', searchquery):
        searchtype = 'context'
    elif rdb.sismember('hashes:ssdeep', searchquery):
        searchtype = 'ssdeep'
    elif rdb.sismember('hashes:sha256', searchquery):
        searchtype = 'sha256'
    else:
        searchtype = False
    return searchtype


@route('/')
def hello():
    """ redirect to kathe """
    return """<html>
<head>
<meta http-equiv="refresh" content="1;URL=kathe/" />
</head>
<body>Hello World!</body>
</html>"""


@route('/kathe')
@route('/kathe/')
def build_context(querystring=''):
    """ This route provides the main GUI.
It consists of glued together CSS JavaScript and python.
I use Redis for the backend and D3.js for the frontend.

    """
    querystring = request.query.search
    response = """
<!DOCTYPE html>
<meta charset="utf-8">
<link rel="stylesheet" href="/static/fira.css">
<link rel="stylesheet" href="/static/ssdeep.css">
<style>

.links line {{
  stroke: #999;
  stroke-opacity: 0.6;
}}

.nodes circle {{
  stroke: #fff;
  stroke-width: 1.5px;
}}

form {{
padding-top: 1vh;
display:block;
}}

input {{
width: 50vw;
}}

#container {{
width: 95vw;
border: solid 1px #999;
margin: 0 auto;
}}
#chart {{
width: 95vw;
height: 65vh;
bottom: 0px;
display:block;
overflow: hidden;
}}

#info0 {{
left: 0px;
float: left;
width: 44vw;
font-size: smaller;
line-height: 1.2;
height: 12em;
bottom: 0px;
display:inline-block;
padding: 0;
margin: 0;
border-top: solid 1px #999;
border-right: solid 1px #999;
}}

#info1 {{
right: 0px;
float: right;
width: 44vw;
font-size: smaller;
line-height: 1.2;
height: 12em;
bottom: 0px;
display:inline-block;
padding: 0;
margin: 0;
border-top: solid 1px #999;
}}

.infocontent {{
overflow-wrap: break-all;
word-break: break-all;
}}


table {{
margin: 5px;
}}

td {{
vertical-align: top;
}}
.legend {{
font-family: 'Fira Mono';
font-weight: 400;
text-anchor: middle;
}}
</style>
<div style="" id="container">
<form action="/kathe/" method="get">
  <fieldset>
    <legend>ssdeep | sha256 | context search</legend>
<p>
<input type="text" name="search" id="search"/>
      <!-- <input type="submit" value="Submit" /> -->
    </p>
  </fieldset>
</form>
<div id="context"</div>
<div id="chart"> </div>
<span id="info0"></span>
<span id="info1"></span>
</div>
<script src="/static/d3.v4.min.js">
<!-- see http://www.puzzlr.org/force-graphs-with-d3/ -->
</script>
<script>
// set searchvalue in the search field
var searchvalue = decodeURIComponent("{}");
document.getElementById("search").value = searchvalue;

var container = document.getElementById("container");
var chartDiv = document.getElementById("chart");
var width = chartDiv.clientWidth;
var height = chartDiv.clientHeight;
var radius = 3;
var svg = d3.select(chartDiv)
        .append("svg")

        // Extract the width and height that was computed by CSS.
        // Use the extracted size to set the size of an SVG element.
        // https://coderwall.com/p/psogia/simplest-way-to-add-zoom-pan-on-d3-js
	.attr("width", width)
	.attr("height", height)
	// .append("g")
	.call(d3.zoom()
           .scaleExtent([1, 2])
           .on("start", zoomstart)
           .on("end", zoomend)
           .on("zoom", zoomed)
           .on(".dblclick", null)
	)
	.append("g")

//svg.on("click", function() {{ d3.event.stopImmediatePropagation(); }});
// svg.on("click", function () {{ return vindmij(); }} );

var contextarray = {{}};
var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {{ return d.id; }})
       .distance(function (d) {{return ((100/d.value)*20)}}).strength(1))
    .force("charge", d3.forceManyBody().strength(-20))
    .alphaTarget(0.1)
    .force("x", d3.forceX(width / 2).strength(0.065))
    .force("y", d3.forceY(height / 2).strength(0.065))
    .force("center", d3.forceCenter(width / 2, height / 2));

function zoomstart(){{
	mousePos = d3.mouse(this);
}}

function zoomend(){{
	var m = d3.mouse(this);
	if (mousePos[0] ===  m[0] && mousePos[1] === m[1]){{
	d3.selectAll("circle").style("fill-opacity", 1)
        d3.selectAll("circle").style("stroke-opacity", 1)
	d3.selectAll("cricle").style("fill-opacity", 1)
	d3.selectAll("circle").attr("fill", function(d) {{ return color(d.group); }})
	d3.selectAll("line").style("stroke-opacity", 0.6)
	d3.selectAll("line").style("stroke", "#999")
  }}
}}

function zoomed() {{
svg.attr("transform", d3.event.transform);
}}



d3.json("/search/?search={}", function(error, graph) {{
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) {{ return 10/(100/d.value); }});

   link.append("title")
       .text(function(d) {{ return "sssdeep_compare: " + d.value; }});

   link.on("mouseover", function(d){{
      d3.select(this).style('stroke', '#900');
   }});

   link.on("mouseout", function(d){{
      d3.select(this).style('stroke', '#999');
   }});

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) {{ return color(d.group); }})
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))

  node.append("title")
      .text(function(d) {{ contextarray[d.group] = d.fam; return d.name_fam; }});

  node.on("mouseover", function(d){{
      d3.select(this).attr('r', '8');
      document.getElementById("info0").style.color = '#000';
      ssdeepinfo0(d.name);
  }});
  node.on("mouseout", function(d){{
      d3.select(this).attr('r', '5');
      document.getElementById("info0").style.color = '#999';
  }});

  node.on("click", nodesOver(.2) );

  node.on("dblclick", function(d){{
  window.open("/kathe/?search="+ d.name, '_blank');
  }});
        

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);



  function ticked() {{
    link
        .attr("x1", function(d) {{ return d.source.x; }})
        .attr("y1", function(d) {{ return d.source.y; }})
        .attr("x2", function(d) {{ return d.target.x; }})
        .attr("y2", function(d) {{ return d.target.y; }});

    node
        // .attr("cx", function(d) {{ return d.x = Math.max(radius, Math.min(width - radius, d.x)); }})
        // .attr("cy", function(d) {{ return d.y = Math.max(radius, Math.min(height - radius, d.y)); }});
        .attr("cx", function(d) {{ return d.x; }})
        .attr("cy", function(d) {{ return d.y; }});


  }}
var legend = svg.selectAll(".legend")
.data(color.domain())
.enter().append("g")
.attr("class", "legend")
.attr("transform", function(d, i) {{ return "translate(0," + i * 20 + ")"; }});

legend.append("rect")
.attr("x", width - 18)
.attr("width", 18)
.attr("height", 18)
.style("fill", color);

legend.append("text")
.attr("x", width - 24)
.attr("y", 9)
.attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d) {{ return contextarray[d]; }});


function dragstarted(d) {{
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}}

function dragged(d) {{
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}}

function dragended(d) {{
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}}

var mousePos = null;

function vindmij () {{
return alert(1);
}}


// nodes/edges highlighting

 // build a dictionary of nodes that are linked
    var linkedByIndex = {{}};
    graph.links.forEach(function(d) {{
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    }});

    // check the dictionary to see if nodes are linked
    function isConnected(a, b) {{
        return linkedByIndex[a.index + "," + b.index]
        || linkedByIndex[b.index + "," + a.index]
        || a.index == b.index;
    }}

    // fade nodes on single click

    function nodesOver(opacity) {{
        return function(d) {{
		d3.event.stopPropagation();
       		d3.select(this).attr('fill', '#CC6677');
  	    ssdeepinfo1(d.name);
            // check all other nodes to see if they're connected
            // to this one. if so, keep the opacity at 1, otherwise
            // fade
            node.style("stroke-opacity", function(o) {{
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            }});
            node.style("fill-opacity", function(o) {{
		thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            }});
            // also style link accordingly
            link.style("stroke-opacity", function(o) {{
                return o.source === d || o.target === d ? 1 : opacity;
            }});
            link.style("stroke", function(o){{
                return o.source === d || o.target === d ? o.source.colour : "#ddd";
            }});
        }};
    }}

 }});



// needed for the neatresponse in infoParser
const contextlist = {{"virustotal": 'https://www.virustotal.com/#/file/'}};

function responsetable (dictionary, infotarget) {{
    var neatresponse = '<table>';
    for (var key in dictionary) {{
        // check if the property/key is defined in the object itself, not in parent
        if (dictionary.hasOwnProperty(key)) {{
            neatresponse += '<tr><td>' + key + ':</td><td class="infocontent">'
                + dictionary[key] + '</td></tr>';
            // add context link
            if (dictionary[key] == 'virustotal') {{
                neatresponse += '<tr><td>info:</td><td class="infocontent"><a href="' + contextlist['virustotal'] + dictionary['sha256'] + '" title="virustotal" target="_blank">'+ dictionary['sha256'] +'</a></td></tr>';
            }}
        }} else {{neatresponse = "no info found"; }}
    }}
    document.getElementById(infotarget).innerHTML = neatresponse + '</table>';

}}

// XXX REALLY UGLY HACK, because I cant get targets to pass to addeventlistener

// get ssdeep hash info
function infoParser0 () {{
    var infodictionary = JSON.parse(this.responseText);
    var dictionary = infodictionary['info'];
    return responsetable(dictionary, "info0");
}}


function infoParser1 () {{
    var infodictionary = JSON.parse(this.responseText);
    var dictionary = infodictionary['info'];
    return responsetable(dictionary, "info1");
}}

function ssdeepinfo0 (searchterm) {{
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", infoParser0);
    oReq.open("GET", "/info/?ssdeephash=" + encodeURIComponent(searchterm));

    oReq.send(null);
}}

function ssdeepinfo1 (searchterm) {{
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", infoParser1);
    oReq.open("GET", "/info/?ssdeephash=" + encodeURIComponent(searchterm));
    oReq.send(null);
}}


</script>
""".format(urllib.parse.quote_plus(querystring).replace('+','%2B'), urllib.parse.quote_plus(querystring).replace('+','%2B'))

    return response



@route('/search', method='GET')  # or @route('/login', method='POST')
@route('/search/', method='GET')  # or @route('/login', method='POST')
def contextinfo(rdb, querystring=None):
    querystring = request.query.search
    try:
        if querystring is not None:
            searchquery = querystring
    except:
        searchquery = ''
    # here we check and build the list of involved ssdeep hashes
    if check_verify(rdb, searchquery) == 'ssdeep':
        allssdeep = gottacatchemall(rdb, searchquery)
    elif check_verify(rdb, searchquery) == 'sha256':
        # if the sha is the same, the ssdeep is certainly the same
        searchquery = (':').join([ssdeeps.split(':')[1:4] for ssdeeps in list(rdb.smembers('info:sha256:{}'.format(searchquery)))][0])
        allssdeep = gottacatchemall(rdb, searchquery)
    elif check_verify(rdb, searchquery) == 'context':
        # if the sha is the same, the ssdeep is certainly the same
        searchquery = [ssdeeps.split(':')[3:6] for ssdeeps in list(rdb.smembers('info:context:{}'.format(searchquery)))]
        searchquery = [(':').join(splitted) for splitted in searchquery]
        allssdeep = gottacatchemall(rdb, searchquery)

    else:
        # allssdeep = list(rdb.smembers('hashes:ssdeep'))
        allssdeep = []

    response.content_type = 'application/json'
    allcontext = list(rdb.smembers("names:context"))
    allssdeeplist = []
    allssdeeplinks = []
    allssdeep = list(allssdeep)
    for ssdeep in allssdeep:
        allinfo = rdb.smembers('info:ssdeep:{}'.format(ssdeep))
        alllinks = rdb.zrangebyscore('{}'.format(ssdeep), 0, 100, withscores=True)
        contextlist = []
        for infoline in allinfo:
                context = infoline.split(':')[3].split('|')
                # get the second last (or the only) element
                if len(context) == 2:
                    context = context[1:][0]
                else:
                    context = context[len(context)-2:][0]
                contextlist.append(context)

        contextlist = (':').join(sorted(contextlist))
        allcontext.append(contextlist)
        allssdeeplist.append({'id': allssdeep.index(ssdeep), 'name': '{}'.format(ssdeep), 'name_fam': '{} ({})'.format(ssdeep,contextlist) ,'group': allcontext.index(contextlist), 'fam': contextlist})
        contextlist = []
        for k in alllinks:
            # kcontext = k[0].split(',')[2].split('|')
            # get the second last (or the only) element
            # kcontext = kcontext[len(kcontext)-2:][0]
            # contextlist.append(kcontext)

            # contextlist = (':').join(contextlist)
            allssdeeplinks.append({'source': allssdeep.index(ssdeep), 'target': allssdeep.index(k[0].split(',')[0]), 'value': math.ceil(k[1])})
    rv = {'nodes': allssdeeplist, 'links': allssdeeplinks}
    return json.dumps(rv, sort_keys=True)


@route('/info', method='GET')  # or @route('/login', method='POST')
@route('/info/', method='GET')  # or @route('/login', method='POST')
def ssdeepinfo(rdb):
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


        infolist['context'] = ('<br />').join(sorted(contextlist))
        infolist['name'] = ('<br />').join(sorted(filenamelist))
        infolist['sha256'] = ('<br />').join(sorted(sha256list))
        rv = {'info': infolist}
        return json.dumps(rv, sort_keys=True)
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')


@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')


if __name__ == '__main__':
    run(host=MYHOST, port=8080, debug=True)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = default_app()
