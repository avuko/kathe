// set searchvalue in the search field
document.getElementById("search").value = searchvalue;

var container = document.getElementById("container");
var chartDiv = document.getElementById("chart");
var contextDiv = document.getElementById("contextdiv");
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
  .attr("id", 'kathe')
  .call(d3.zoom()
    .scaleExtent([1, 2])
    // because we dont have "click", we have this :/
    .on("start", zoomstart)
    .on("end", zoomend)
    .on("zoom", zoomed)
  )
  .append("g")

var contextarray = {};
var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; })
    .distance(function (d) {return ((100/d.value)*40)}).strength(0.005))
  .force("charge", d3.forceManyBody().strength(-200))
  .alphaTarget(0.1)
  .force("x", d3.forceX(width / 2).strength(0.065))
  .force("y", d3.forceY(height / 2).strength(0.065))
  .force("center", d3.forceCenter(width / 2, height / 2))

function zoomstart(){
  mousePos = d3.mouse(this);
}

function zoomend(){
  var m = d3.mouse(this);
  if (mousePos[0] ===  m[0] && mousePos[1] === m[1]){
    d3.selectAll("circle").style("fill-opacity", 1)
    d3.selectAll("circle").style("stroke-opacity", 1)
    d3.selectAll("cricle").style("fill-opacity", 1)
    d3.selectAll("circle").attr("fill", function(d) { return color(d.group); })
    d3.selectAll("line").style("stroke-opacity", 0.6)
    d3.selectAll("line").style("stroke", "#999")
  }
}

function zoomed() {
  svg.attr("transform", d3.event.transform);
}



d3.json("/search/?search=" + unescaped_searchvalue, function(error, graph) {
  if (error) throw error;

  d3.select("#infospan").html("sample: " + graph.info.sample + " | nodes: " + graph.info.nodecount + " | links: " + graph.info.linkcount);
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return 10/(100/d.value); });

  link.append("title")
     .text(function(d) { return "ssdeep_compare: " + d.value; });
  // link.append("textPath") //append a textPath to the text element
   	// .attr("xlink:href", "#wavy") //place the ID of the path here
   	// .style("text-anchor","middle") //place the text halfway on the arc
   	// .attr("startOffset", "50%")
    	// .text("Yay, my text is on a wavy path");
    // .text(function(d) { return d.value; });



  link.on("mouseover", function(d){
    d3.select(this).style('stroke', '#900');
  });

  link.on("mouseout", function(d){
    d3.select(this).style('stroke', '#999');
  });

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
      .on("end", dragended))

  node.append("title")
    .text(function(d) { contextarray[d.group] = d.fam; return d.name_fam; });

  node.on("mouseover", function(d){
    d3.select(this).attr('r', '8');
    document.getElementById("info0").style.color = '#000';
    ssdeepinfo0(d.name);
  });
  node.on("mouseout", function(d){
    d3.select(this).attr('r', '5');
    document.getElementById("info0").style.color = '#999';
  });

  node.on("click", nodesOver(.2) );

  node.on("dblclick", function(d){
    window.open("/kathe/?search="+ d.name, '_blank');
  });


  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);


  // lets see if we can calm things down a bit
  const simulationDurationInMs = 5000; // 5 seconds
  let startTime = Date.now();
  let endTime = startTime + simulationDurationInMs;


  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
    // .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
    // .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    if (Date.now() < endTime) {
        /*update the simulation*/
    } else {
        simulation.stop();
    }

  }

  var legendRectSize = 15;
  var legendSpacing = 1;
  // text = svg.append('text').text(function(d) { return contextarray[d]; });
  var contextDiv = document.getElementById("contextdiv");
  var cwidth = contextDiv.clientWidth;
  // var cheight = contextDiv.clientHeight;
  d3.select('#contextdiv')
    .append("ul")
  //.attr('width', cwidth)
  // .attr('height', cheight)
    .attr('class', 'legend')

  var legend = d3.select('.legend')
    .append('li')
    .selectAll("gli")
    .data(color.domain())
    .enter()
    .append('li')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize;
      var x = 0;
      var y = i * height;
      return 'translate(' + x + ',' + y + ')'; });

  legend.append('svg')
    .attr('width', 15)
    .attr('height', 15)
    .append('rect')
    .style('fill', color)
    .style('stroke', color)
    .attr('width', 14)
    .attr('height', 14);
  legend.append('span')
    .text(' ')

  legend.append('a')
  //.attr('x', legendRectSize + legendSpacing)
  //.attr('y', legendRectSize - legendSpacing)
    .attr('href', function(d) { return '?search=' + contextarray[d]; })
    .text(function(d) { return contextarray[d]; });


  //.attr('class', 'lirect')
  //         .attr('width', legendRectSize)
  //	   .attr('height', legendRectSize)
  //	   .style('fill', color)
  //	   .style('stroke', color)


  //    .insert('span', function(d) { return contextarray[d]; })


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

  var mousePos = null;


  // nodes/edges highlighting

  // build a dictionary of nodes that are linked
  var linkedByIndex = {};
  graph.links.forEach(function(d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  // check the dictionary to see if nodes are linked
  function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index]
      || linkedByIndex[b.index + "," + a.index]
      || a.index == b.index;
  }

  // fade nodes on single click

  function nodesOver(opacity) {
    return function(d) {
      d3.event.stopPropagation();
      d3.select(this).attr('fill', '#CC6677');
      ssdeepinfo1(d.name);
      // check all other nodes to see if they're connected
      // to this one. if so, keep the opacity at 1, otherwise
      // fade
      node.style("stroke-opacity", function(o) {
        thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      node.style("fill-opacity", function(o) {
        thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      // also style link accordingly
      link.style("stroke-opacity", function(o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
      link.style("stroke", function(o){
        return o.source === d || o.target === d ? o.source.colour : "#ddd";
      });
    };
  }

});



// needed for the neatresponse in infoParser
const contextlist = {"virustotal": 'https://www.virustotal.com/#/file/', "vx": "https://www.hybrid-analysis.com/sample/"};

function responsetable (dictionary, infotarget) {
  var neatresponse = '<table>';
  for (var key in dictionary) {
    // check if the property/key is defined in the object itself, not in parent
    if (dictionary.hasOwnProperty(key)) {
      neatresponse += '<tr><td>' + key + ':</td><td class="infocontent">'
        + dictionary[key] + '</td></tr>';
      // add context link
      if (dictionary[key].startsWith('virustotal')) {
        neatresponse += '<tr><td>info:</td><td class="infocontent">';
        var sha256list = dictionary['sha256'].split(',');
        var arrayLength = sha256list.length;
        for (var i = 0; i < arrayLength; i++) {
          neatresponse += '<a href="' + contextlist['virustotal'] +
            sha256list[i] + '" title="External ref to ' +
            dictionary[key] + '" target="_blank">'+
            sha256list[i] +'</a><br />';
        };
        neatresponse += '</td></tr>';
      }
      else if (dictionary[key].startsWith('vx')) {
        neatresponse += '<tr><td>info:</td><td class="infocontent">';
        var sha256list = dictionary['sha256'].split(',');
        var arrayLength = sha256list.length;
        for (var i = 0; i < arrayLength; i++) {
          neatresponse += '<a href="' + contextlist['vx'] +
            sha256list[i] + '" title="External ref to ' +
            dictionary[key] + '" target="_blank">'+
            sha256list[i] +'</a><br />'                    };
        neatresponse += '</td></tr>';
      } } else {neatresponse = "no info found"; }
  }
  document.getElementById(infotarget).innerHTML = neatresponse + '</table>';


}
// XXX REALLY UGLY HACK, because I cant get target divs to pass to addeventlistener

// get ssdeep hash info
function infoParser0 () {
  var infodictionary = JSON.parse(this.responseText);
  var dictionary = infodictionary['info'];
  return responsetable(dictionary, "info0");
}


function infoParser1 () {
  var infodictionary = JSON.parse(this.responseText);
  var dictionary = infodictionary['info'];
  return responsetable(dictionary, "info1");
}

function ssdeepinfo0 (searchterm) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", infoParser0);
  oReq.open("GET", "/info/?ssdeephash=" + encodeURIComponent(searchterm));

  oReq.send(null);
}

function ssdeepinfo1 (searchterm) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", infoParser1);
  oReq.open("GET", "/info/?ssdeephash=" + encodeURIComponent(searchterm));
  oReq.send(null);
}
