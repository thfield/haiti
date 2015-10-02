var dataFile = 'data/sampledata2.json';
var topodata = 'data/communes-topo05.json';
var mapScope = 'communes';
var pageId = 'themap';
var cLevels = 7;  // Number of color levels
var colorBrew = 'YlOrRd';
var valueToDraw = 'Q1';

var quantaColors = {};
var map;

d3.json(dataFile, function(error, dataset) {
  setColors(dataset);
  map = new Datamap({
    element: document.getElementById(pageId),
    geographyConfig: {
      dataUrl: topodata,
      borderColor: '#555555',
      popupTemplate: function(geography, data) {
        return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[valueToDraw] : '') + '</div>';
      }
    },
    // scope: 'departments',
    scope: mapScope,
    fills: {
      defaultFill: "#fefefe"
    },
    data: dataset,
    setProjection: function(element) {
      var projection = d3.geo.mercator()
        .center([-73.0513321, 19.0557096])
        .scale(element.offsetWidth*18)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
       var path = d3.geo.path().projection(projection);
       return {path: path, projection: projection};
    },
    done: function(){colorIn(valueToDraw)}
  });
});

function setColors(dataset) {
  var vals = {};
  var colorScale = {};
  var areas = d3.keys(dataset);

  areas.forEach(function(d){
    d3.keys(dataset[d]).forEach(function(j){
      vals[j]=vals[j] || [];
      vals[j].push(dataset[d][j]);
    });
  });
  var colorPalette = colorbrewer[colorBrew][cLevels];
  var n = areas.length;
  d3.keys(vals).forEach(function(d){
    colorScale[d]= d3.scale.quantize()
      .domain(d3.extent(vals[d]))
      .range(colorPalette);
    quantaColors[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      quantaColors[d][areas[i]] = colorScale[d](dataset[areas[i]][d]);
    };
    createButtons(d);
  });
};

function colorIn(val){
  map.updateChoropleth(quantaColors[val]);
  map.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[val] : '') + '</div>';
  };
};

function createButtons(d){
  var element = d3.select('#'+pageId);
  element.append('button')
    .attr('name', d)
    .attr('onClick', 'colorIn("' + d + '")')
    .html(d);
// <button type="button" name="Q1" onClick="colorIn('Q1')">Quarter 1</button>
};
