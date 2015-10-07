var initDataFile = 'data/2801.json',
    mapId = 'themap',
    tint = 'YlOrRd',
    cLevels = 7;


var valueToDraw = '';
var colorMap = {};
var map;

d3.json(initDataFile, function(error, dataset) {
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
    colorPalette : colorbrewer[tint][cLevels],
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
      createButtons(colorMap);
      colorIn(valueToDraw);
      makeTitle();
      map.choroKey(map.options.colorPalette,{hSize: 20, vSize: 10});
    }
  });

  map.addPlugin('choroKey', function (layer,data,options) {
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
        .attr('x', function ( d, i ) { return options.hSize*(i+1); })
        .style('fill', function ( d ) { return d; })
        ;
    layer.append('text')
        .text(map.options.choroExtent[0])
        .attr('class','choroMin')
        .attr('x', '0')
        .attr('y', options.vSize);
    layer.append('text')
        .text(map.options.choroExtent[1])
        .attr('class','choroMax')
        .attr('x', options.hSize * (cLevels+1))
        .attr('y', options.vSize);
  });

});


function setColors(data) {
  var vals = {};
  var allVals = []; //makes sure the different data sets use the same color scale, for instance to compare performance across time
  var colorScale = {};
  var areas = d3.keys(data);
  var n = areas.length;

  areas.forEach(function(d){
    d3.keys(data[d]).forEach(function(j){
      vals[j]=vals[j] || [];
      vals[j].push(data[d][j]);
      allVals.push(data[d][j]);
      valueToDraw = j;
    });
  });

map.options.choroExtent = d3.extent(allVals);

  d3.keys(vals).forEach(function(d){
    colorScale[d]= d3.scale.quantize()
      .domain( map.options.choroExtent ) // use for same scale across datasets
      // .domain( d3.extent(vals[d]) ) // use for dataset to have individual color scale
      .range(map.options.colorPalette);
    colorMap[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      colorMap[d][areas[i]] = colorScale[d](data[areas[i]][d]);
    };

  });
};


function colorIn(val){
  map.updateChoropleth(colorMap[val]);
  map.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[val] : '') + '</div>';
  };
};


function loadAndRedraw(pathToFile){
clearElement(mapId, 'buttons');

  d3.json(pathToFile, function(error,dataset){
    map.options.data = dataset.data;
    map.options.title = dataset.title;

    setColors(map.options.data);
    createButtons(colorMap);
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


function createButtons(obj){
  var element = d3.select('#'+ mapId + '> .buttons');
  d3.keys(obj).forEach(function(d){
    element.append('button')
      .attr('name', d)
      .attr('onClick', 'colorIn("' + d + '")')
      .html(d);
   });
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
