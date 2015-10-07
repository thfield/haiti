var initDataFile = 'data/2801.json',
    mapId = 'themap',
    tint = 'YlOrRd',
    cLevels = 7;

var valueToDraw = '';
var myMap;

d3.json(initDataFile, function(error, dataset) {
  myMap = new Datamap({
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
    colorMap: {},
    setProjection: function(element) {
      var projection = d3.geo.mercator()
        .center([-73.0513321, 19.0557096])
        .scale(element.offsetWidth*18)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
       var path = d3.geo.path().projection(projection);
       return {path: path, projection: projection};
    },
    done: function(){
      myMap.setColors(dataset.data);
      createButtons(myMap.options.colorMap);
      colorIn(valueToDraw);
      makeTitle();
      myMap.choroKey(myMap.options.colorPalette,{hSize: 20, vSize: 10});
    }
  });

  myMap.addPlugin('choroKey', function (layer,data,options) {
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
        .text(myMap.options.choroExtent[0])
        .attr('class','choroMin')
        .attr('x', '0')
        .attr('y', options.vSize);
    layer.append('text')
        .text(myMap.options.choroExtent[1])
        .attr('class','choroMax')
        .attr('x', options.hSize * (cLevels+1))
        .attr('y', options.vSize);
  });

});

function makeTitle(where){
  d3.select('#'+mapId+' > .datamap')
    .append('text')
      .attr('class', 'maptitle')
      .text(myMap.options.title)
      .attr('dy', function(){return myMap.options.element.offsetHeight - 5 })
      ;
};

Datamap.prototype.setColors = function (data) {
  var self = this;
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

  self.options.choroExtent = d3.extent(allVals);

  d3.keys(vals).forEach(function(d){
    colorScale[d]= d3.scale.quantize()
      .domain( self.options.choroExtent ) // use for same scale across datasets
      // .domain( d3.extent(vals[d]) ) // use for dataset to have individual color scale
      .range(self.options.colorPalette);
    self.options.colorMap[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      self.options.colorMap[d][areas[i]] = colorScale[d](data[areas[i]][d]);
    };
  });
};

function colorIn(val){
  myMap.updateChoropleth(myMap.options.colorMap[val]);
  myMap.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[val] : '') + '</div>';
  };
};


function loadAndRedraw(pathToFile){
clearElement(mapId+'-controls', 'buttons');

  d3.json(pathToFile, function(error,dataset){
    myMap.options.data = dataset.data;
    myMap.options.title = dataset.title;

    myMap.setColors(myMap.options.data);
    createButtons(myMap.options.colorMap);
    colorIn(valueToDraw);
    d3.select('.maptitle').text(myMap.options.title);
  });
};

function createButtons(obj){
  var element = document.getElementById( myMap.options.element.id + '-controls').getElementsByClassName('buttons')[0];
  d3.keys(obj).forEach(function(d){
    var button = document.createElement('button');
    button.name = d;
    button.innerHTML= d;
    button.onclick = function() { colorIn(d); }
    element.appendChild(button);
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
  var myNode = document.getElementById(elementId);
  myNode.parentNode.removeChild(myNode);
  return false;
}
