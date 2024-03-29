// function to show fetch status
function handleStatus(res_status, res_statustext, res_url) {
  {
	document.getElementById('httpcode').innerHTML = '<a target="_blank" href="' + res_url + '">' + res_status + '</a>';
	document.getElementById("httpcode").title = res_statustext;
	console.log(res_statustext);
	console.log(res_url);
  }
}

// function to turn 'http://<something>' strings into hrefs
function string_to_href(inputstring) {
  {
	var splitstring = inputstring.split('|');
	var returnstring = '';
	for (i = 0; i < splitstring.length; i++) {
	  {
		var splstr = splitstring[i];
		if (splstr.startsWith('http')) {
		  {
			returnstring += ('<a href=\"' + splstr + '\" target=\"_blank\">' + splstr.split('/').pop() + '</a><br />')
		  }
		}
		else {
		  {
			returnstring += (splstr + ' ')
		  }
		}
	  }
	}
	return returnstring;
  }
}

// fetch ssdeephash info
function ssdeepinfo(ssdeep) {
  {
	return fetch("/info/?ssdeephash=" + encodeURIComponent(ssdeep), { cache: "no-store" })
	// .then(handleErrors)
	  .then(response => {
		{
		  if (response.ok) {
			{
			  handleStatus(response.status, response.statusText, response.url);
			  return response.json();
			}
		  } else {
			{
			  return response.text().then(function(text) {
				res_statustext = text;
				handleStatus(response.status, res_statustext, response.url);
			  });
			}
		  }
		}
	  })
	  .then(jsonresponse => json2table(jsonresponse));
  }
}

// table from json script
function json2table(json, classes) {
  {
	var cols = Object.keys(json[0]);
	var headerRow = '';
	var bodyRows = '';
	classes = classes || '';
	json.map(function (row) {
	  {
		cols.map(function (colName) {
		  {
			bodyRows += '<tr><td><b>' + colName + '</b></td><td>' + string_to_href(row[colName]) + '</td></tr>'
		  }
		})
	  }
	});
	return '<table class="' +
	  classes +
	  '"><thead><tr>' +
	  headerRow +
	  '</tr></thead><tbody>' +
	  bodyRows +
	  '</tbody></table>';
  }
};

// infoblocks scripts
// info0
function katheclickleft(ssdeep) {
  {
	ssdeepinfo(ssdeep).then(function (info0) { { document.getElementById('info0').innerHTML = info0 } })
	  .catch(error => console.error(error));
  }
};

// info1
function katheclickright(ssdeep) {
  {
	ssdeepinfo(ssdeep).then(function (info1) { { document.getElementById('info1').innerHTML = info1 } })
	  .catch(error => console.error(error));
  }
};

function getsetinfo(setinfodata) {
  {
	document.getElementById('setinfo').innerHTML =
	  '<span data-toggle="tooltip" data-placement="top" title="Database size"> ' + setinfodata.dbsize + ' </span>' +
	  '|<span data-toggle="tooltip" data-placement="top" title="Link count"> ' + setinfodata.linkcount + ' </span>' +
	  '|<span data-toggle="tooltip" data-placement="top" title="Node count"> ' + setinfodata.nodecount + ' </span>' +
	  '|<span data-toggle="tooltip" data-placement="top" title="Sample"> ' + setinfodata.sample + ' </span>' +
	  '|<span data-toggle="tooltip" data-placement="top" title="Last DB update"> ' + setinfodata.timestamp + ' </span>|'
	;
  }
};

function contextselect(contextslist) {

  var ctxlist = document.getElementById('contextlist');
  if (contextslist.length > 0) {
	for (var i = 0; i < contextslist.length; i++) {
	  var listItem = document.createElement('li');
	  var listBullet = document.createElement('span');
	  var listHref = document.createElement('a');
	  var attspan = document.createAttribute("style");
	  var atthref = document.createAttribute("href");
	  attspan.value = 'color: ' + contextslist[i][2].color ;
	  atthref.value = '/kathe/?search=' + contextslist[i][0];
	  listBullet.setAttributeNode(attspan);
	  listBullet.textContent = '⬤ ';
	  listHref.setAttributeNode(atthref);
	  listHref.textContent = contextslist[i][0] + ' (' + contextslist[i][1].count + ')';
	  listItem.appendChild(listBullet);
	  listItem.appendChild(listHref);
	  ctxlist.appendChild(listItem);
	}
  }
};

var graphDiv = document.getElementById("graph");
// we need to grab these to set them hard, otherwise the graph is window.height
// var graphwidth = window.innerWidth;
var divheight = document.getElementById("graphcol");
graphheight = (divheight.clientHeight - 30);
graphwidth = (divheight.clientWidth - 30);
//console.log(divheight);
fetch("/search/?search=" + unescaped_searchvalue, { cache: "no-store" })
  .then(response => {
	{
	  if (response.ok) {
		{
		  handleStatus(response.status, response.statusText, response.url);
		  return response.json();
		}
	  } else {
		{
		  return response.text().then(function(text) {
			res_statustext = text;
			handleStatus(response.status, res_statustext, response.url);
		  });
		}
	  }
	}
  })
  .then((out) => {
	{
	  var myData = out;
	  var setinfo = JSON.parse(JSON.stringify(myData._info));
	  var contextinfo = JSON.parse(JSON.stringify(myData.contexts));
	  contextselect(contextinfo);
	  getsetinfo(setinfo);
	  const elem = document.getElementById('graph');
	  const Graph = ForceGraph({ alpha: true })
	  (elem)
		.height(graphheight)
		.width(graphwidth)
		.backgroundColor('none transparent')
		.nodeColor(d => d.color)
		.nodeLabel(d => d.inputname)
		.linkLabel(d => d.ssdeepcompare)
		.linkHoverPrecision(1)
		.linkWidth('value')
		.graphData(myData)
		.onNodeClick(node => {
		  {
			if (node !== null) {
			  {
				katheclickleft(node.ssdeep);
				Graph.centerAt(node.x, node.y, 1000);
				Graph.zoom(8, 2000);
			  }
			}

		  }
		})
		.onNodeRightClick(node => {
		  {
			if (node !== null) {
			  {
				katheclickright(node.ssdeep);
				Graph.centerAt(node.x, node.y, 1000);
				Graph.zoom(8, 2000);
			  }
			}
		  }
		})
	}
  }).catch(err => console.log(err));
