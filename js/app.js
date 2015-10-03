
var dataFile = dataFile || 'data/2801.json';
var pageId = 'themap';
var cLevels = 7;  // Number of color levels
var colorBrew = 'YlOrRd';
var colorPalette = colorbrewer[colorBrew][cLevels];

var valueToDraw = '';
var quantaColors = {};
var map;

var cellWidth = 30, // Width of color legend cell
    cbarWidth = cellWidth*cLevels;
    cbarHeight = 10;  // Height of color legend

function haitimap(dataFile){
  d3.json(dataFile, function(error, dataset) {
    map = new Datamap({
      element: document.getElementById(pageId),
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
        buildGradient(colorPalette, 'gradient');
      }
    });
    //set title
    d3.select('#'+pageId).append('h3').text(dataset.title);
  });
};

function setColors(dataset) {
  var vals = {};
  var allVals = []; //makes sure the different data sets use the same color scale, for instance to compare performance across time
  var colorScale = {};
  var areas = d3.keys(dataset);
  var n = areas.length;

  areas.forEach(function(d){
    d3.keys(dataset[d]).forEach(function(j){
      vals[j]=vals[j] || [];
      vals[j].push(dataset[d][j]);
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
    createButtons(d);
  });

  //draw key
  visWidth = document.getElementById(pageId).offsetWidth;

  cbar = d3.select('#' + pageId + ' > .datamap').append('g')
    .attr('id', 'colorBar')
    .attr('class', 'colorbar')

  cbar.append('rect')
      .attr('id', 'gradientRect')
      .attr('width', cbarWidth)
      .attr('height', cbarHeight)
      .style('fill', 'url(#gradient)');

  cbar.append('text')
    .attr('id', 'colorBarMinText')
    .attr('class', 'colorbar')
    .attr('x', 0)
    .attr('y', cbarHeight + 15)
    .attr('dx', 0)
    .attr('dy', 0)
    .attr('text-anchor', 'start');

  cbar.append('text')
    .attr('id', 'colorBarMaxText')
    .attr('class', 'colorbar')
    .attr('x', cbarWidth)
    .attr('y', cbarHeight + 15)
    .attr('dx', 0)
    .attr('dy', 0)
    .attr('text-anchor', 'end');

  cbar.attr('transform', 'translate(' + (visWidth-cbarWidth)/2.0 + ', 0)');  // Shift to center

  d3.select('#gradientRect').style('fill', 'url(#gradient)');
  d3.select('#colorBarMinText').text(d3.extent(allVals)[0]);
  d3.select('#colorBarMaxText').text(d3.extent(allVals)[1]);

};

function buildGradient(palette, gradientId) {
  d3.select('#' + pageId + ' > .datamap' )
    .append('linearGradient')
    .attr('id', gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", cbarWidth)
        .attr("y2", 0)
      .selectAll('stop')
      .data(palette)
      .enter()
        .append('stop')
        .attr('offset', function(d, i) {return i/(cLevels-1)*100.0 + '%'; })
        .attr('stop-color', function(d) {return d; });
};

function colorIn(val){
  d3.select('#gradientRect').style('fill', 'url(#gradient)');
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
};

haitimap('data/2801.json');

function clearMap(){
  var myNode = document.getElementById("themap");
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }
}
