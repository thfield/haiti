
var dataFile = dataFile || 'data/2801.json';
var mapId = 'themap';
var cLevels = 7;  // Number of color levels
var colorBrew = 'YlOrRd';
var colorPalette = colorbrewer[colorBrew][cLevels];

var valueToDraw = '';
var quantaColors = {};
var map;


d3.json(dataFile, function(error, dataset) {
  map = new Datamap({
    element: document.getElementById(mapId),
    geographyConfig: {
      dataUrl: 'data/' +  dataset.scope + '-topo05.json',
      borderColor: '#555555',
      popupTemplate: function(geography, data) {
        return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[valueToDraw] : '') + '</div>';
      }
    },
    scope: dataset.scope,
    fills: {
      defaultFill: "#fefefe"
    },
    data: dataset.data,
    title: dataset.title,
    setProjection: function(element) {
      var projection = d3.geo.mercator()
        .center([-73.0513321, 19.0557096])
        .scale(element.offsetWidth*18)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
       var path = d3.geo.path().projection(projection);
       return {path: path, projection: projection};
    },
    done: function(){
      setColors(dataset.data);
      colorIn(valueToDraw);
      makeTitle();
      map.choroplethKey(colorPalette,{hSize: 20, vSize: 10});
    }
  });

  map.addPlugin('choroplethKey', function (layer,data,options) {
    // hold this in a closure
    var self = this;
    // a class you'll add to the DOM elements
    var className = 'choroKey';
    // make a D3 selection.
    var choroKey = layer
           .selectAll(className)
           .data( data, JSON.stringify );
    choroKey
      .enter()
        .append('rect')
        .attr('class', className) //remember to set the class name
        .attr('width', options.hSize)
        .attr('height', options.vSize)
        .attr('x', function ( d, i ) { return options.hSize*i; })
        .style('fill', function ( d ) { return d; })
        ;
  });

});


function setColors(dataset) {
  var vals = {};
  var allVals = []; //makes sure the different data sets use the same color scale, for instance to compare performance across time
  var colorScale = {};
  var areas = d3.keys(dataset);
  var n = areas.length;
  clearElement(mapId, 'buttons');

  areas.forEach(function(d){
    d3.keys(dataset[d]).forEach(function(j){
      vals[j]=vals[j] || [];
      // vals[j].push(dataset[d][j]);
      allVals.push(dataset[d][j]);
      valueToDraw = j;
    });
  });

  d3.keys(vals).forEach(function(d){
    colorScale[d]= d3.scale.quantize()
      .domain( d3.extent(allVals) ) // use for same scale across datasets
      // .domain( d3.extent(vals[d]) ) // use for dataset to have individual color scale
      .range(colorPalette);
    quantaColors[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      quantaColors[d][areas[i]] = colorScale[d](dataset[areas[i]][d]);
    };
    createButton(d);
  });

};

function colorIn(val){
  map.updateChoropleth(quantaColors[val]);
  map.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[val] : '') + '</div>';
  };

  return false;
};


function loadAndRedraw(pathToFile){
  d3.json(pathToFile, function(error,dataset){
    map.options.data = dataset.data;
    map.options.title = dataset.title;
    setColors(map.options.data);
    colorIn(valueToDraw);
    d3.select('.maptitle').text(map.options.title);
  });
};

function makeTitle(){
  d3.select('#'+mapId+' > .datamap')
    .append('text')
      .attr('class', 'maptitle')
      .text(map.options.title)
      .attr('dy', function(){return map.options.element.offsetHeight - 5 })
      ;
};

function createButton(d){
  var element = d3.select('#'+ mapId + '> .buttons');
  element.append('button')
    .attr('name', d)
    .attr('onClick', 'colorIn("' + d + '")')
    .html(d);
  return false;
};

function clearElement(elementId,className) {
  if (className === undefined){
    var myNode = document.getElementById(elementId);
  } else {
    var myNode = document.getElementById(elementId).getElementsByClassName(className)[0];
  }
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  return false;
};

function removeElement(elementId) {
  var elem = document.getElementById(elementId);
  elem.parentNode.removeChild(elem);
  return false;
}
