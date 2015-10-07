
var map = new Datamap({
  scope: 'usa',
  element: document.getElementById('container1'),
});
var cLevels = 7;  // Number of color levels
var colorBrew = 'YlOrRd';
var colorPalette = colorbrewer[colorBrew][cLevels];
      // ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"]

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



map.addPlugin('bigCircle', function ( layer, data, options ) {
  // hold this in a closure
  var self = this;

  // a class you'll add to the DOM elements
  var className = 'bigCircles';

  // make a D3 selection.
  var bubbles = layer
         .selectAll(className)
         .data( data, JSON.stringify );

  bubbles
    .enter()
      .append('circle')
      .attr('class', className) //remember to set the class name
      .attr('cx', function ( datum ) {
        return self.latLngToXY(datum.lat, datum.lng)[0];
      })
      .attr('cy', function ( datum ) {
        return self.latLngToXY(datum.lat, datum.lng)[1];
      })
      .attr('r', 10)
      .style('fill', options.makeTheBubbleThisColor);
 });

var bubbles = [
  {lng: -72.42, lat: 42.11},
  {lng: -91.53, lat: 37.44},
  {lng: -100.55, lat: 31.43}
];

// map.labels()
map.bigCircle(bubbles, {makeTheBubbleThisColor: 'blue'}, console.log("callback"));
map.choroplethKey(colorPalette,{hSize: 20, vSize: 10});
