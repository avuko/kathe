#!/usr/bin/env python3
from bottle import HTTPResponse, get, response, request, install, run, route  # or route
# pip3 install bottle bottle-redis
import bottle.ext.redis as redis
import json

plugin = redis.RedisPlugin(host='localhost', decode_responses=True)
install(plugin)


#<script>
#
#
#</script>
#    '''

@route('/')
def construct_graph():
    return '''

    <html>
    <head>
    <meta charset="utf-8">
<link rel="stylesheet" href="https://code.cdn.mozilla.net/fonts/fira.css">
<style>
body {font-family: 'Fira Sans';}
.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}
</style>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script type="text/javascript">
"use strict";

// get ssdeep hash info

function infoParser () {
document.getElementById("ssdeepInfo").innerHTML = this.responseText;
console.log(this.responseText);
  }

function ssdeepinfo (ssdeephash) {
// alert(ssdeephash);
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", infoParser);
oReq.open("GET", "/ssdeepinfo?ssdeephash=" + encodeURIComponent(ssdeephash));
oReq.send(null);
}

// build form

function reqListener () {
calld3(this.responseText);
  }

function buildform (ssdeephash) {
// alert(ssdeephash);
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "/ssdeep?ssdeephash=" + encodeURIComponent(ssdeephash));
oReq.send(null);
}

function dist(d)
{
 alert(d.value);
return d.value;
}

// d3 function
function  calld3(siblings) {
  console.log(siblings);


d3.selectAll("svg > *").remove();
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);





var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

  var graph = JSON.parse(siblings);
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")

    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));


  node.append("title")
      .text(function(d) { return d.id; }
    );

node.on("click", function(d){
      console.log(d);
             // here you can access data of node using d.key
                   ssdeepinfo(d.id);
                       });


node.on("dblclick", function(d){
      console.log(d);
             // here you can access data of node using d.key
                   calld3(buildform(d.id));
                       });


  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
                    document.getElementById("responseDiv").innerHTML = siblings;

}


// trigger on success

function ajaxSuccess () {
calld3(this.responseText);
}

function AJAXSubmit (oFormElement) {
  if (!oFormElement.action) { return; }
  var oReq = new XMLHttpRequest();
  oReq.onload = ajaxSuccess;
  if (oFormElement.method.toLowerCase() === "post") {
    oReq.open("post", oFormElement.action);
    oReq.send(new FormData(oFormElement));
  } else {
    var oField, sFieldType, nFile, sSearch = "";
    for (var nItem = 0; nItem < oFormElement.elements.length; nItem++) {
      oField = oFormElement.elements[nItem];
      if (!oField.hasAttribute("name")) { continue; }
      sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
          oField.getAttribute("type").toUpperCase() : "TEXT";
      if (sFieldType === "FILE") {
        for (nFile = 0; nFile < oField.files.length;
            sSearch += "&" + escape(oField.name) + "=" + escape(oField.files[nFile++].name));
      } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
        sSearch += "&" + escape(oField.name) + "=" + escape(oField.value);
      }
    }
    ssdeepinfo(oField.value);
    oReq.open("get", oFormElement.action.replace(/(?:\?.*)?$/, sSearch.replace(/^&/, "?")), true);
    oReq.send(null);
  }
}
</script>
</script>

</head>
<body>
<form action="/ssdeep" method="get" onsubmit="AJAXSubmit(this); return false;">
  <fieldset>
    <legend>ssdeep search</legend>
	<p>
      <input type="text" name="ssdeephash" style='width: 100%;'/>
      <!-- <input type="submit" value="Submit" /> -->
    </p>
  </fieldset>
</form>
<svg width= "900" height="500" style="float: left; display: block;"></svg>
<div id="ssdeepInfo" style="width: 100%; height: 5vw; overflow:hidden; display:block;">ssdeep hash Information</div>

</body>
</html>

        '''



@route('/ssdeep', method='GET')  # or @route('/login', method='POST')
def ssdeep(rdb):
    ssdeephash = request.query.ssdeephash
    if rdb.sismember('hashes:ssdeep', ssdeephash):
        siblings = rdb.zrangebyscore(ssdeephash, 0, 100, withscores=True)
        nodes = [{"id": ssdeephash, "group": 1}]
        links = []
        for sibling in siblings:
            print('sibling:' + str(sibling))
            infolist = []
            links.append({'source': ssdeephash, 'target': '{}'.format(sibling[0].split(',')[0]), 'value': int(float('{}'.format(sibling[1])))})
            nodes.append({'id': sibling[0].split(",")[0], "group": 1})
            rv = {'nodes': nodes, 'links': links}
            response.content_type = 'application/json'
        return json.dumps(rv)
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')

@route('/ssdeepinfo', method='GET')  # or @route('/login', method='POST')
def ssdeep(rdb):
    ssdeephash = request.query.ssdeephash
    if rdb.sismember('hashes:ssdeep', ssdeephash):
        infolist = {'ssdeep': ssdeephash}
        allinfo = rdb.smembers('info:ssdeep:{}'.format(ssdeephash))
        for infoline in allinfo:
            infolist['sha256'] = infoline.split(':')[1]
            infolist['context'] =infoline.split(':')[3]
            infolist['filename'] = infoline.split(':')[5]

        rv = {'info': infolist}
        response.content_type = 'application/json'
        return json.dumps(rv)
    else:
        return HTTPResponse(status=404, body='ssdeep hash not found')

run(host='localhost', port=8080, debug=True)
