
// --------------------------------------------------
// Parameters

var dataFile = 'data/states.json';
var dataset, states, n;

var map;  // Datamap

var visWidth;  // Auto-generated

var paceColors = {},  // Colormaps
    distColors = {},
    tripColors = {};

var minPace = 11.25,
    maxPace = 10.00,
    minDist = 3.5,
    maxDist = 4.2,
    minTrip = 33,
    maxTrip = 43

var cLevels = 9;  // Number of color levels

var pacePalette = colorbrewer['Blues'][cLevels],
    distPalette = colorbrewer['Greens'][cLevels],
    tripPalette = colorbrewer['Oranges'][cLevels];

var cellWidth = 30, // Width of color legend cell
    cbarWidth = cellWidth*cLevels;
    cbarHeight = 15;  // Height of color legend

// --------------------------------------------------
// Set up scales

var paceScale = d3.scale.quantize()
  .domain([minPace, maxPace])
  .range(pacePalette);

var distScale = d3.scale.quantize()
  .domain([minDist, maxDist])
  .range(distPalette);

var tripScale = d3.scale.quantize()
  .domain([minTrip, maxTrip])
  .range(tripPalette);

// --------------------------------------------------
// Load data and generate map

d3.json(dataFile, function(error, dataset) {

    // Data properties
    states = d3.keys(dataset);
    n = states.length;

    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      paceColors[states[i]] = paceScale(dataset[states[i]]['average_pace']);
      distColors[states[i]] = distScale(dataset[states[i]]['distance_per_trip']);
      tripColors[states[i]] = tripScale(+dataset[states[i]]['trips_per_user']);
    }
// debugger;
    // Create map
    map = new Datamap({
        element: document.getElementById('vis'),
        scope: 'usa',
        fills: {defaultFill: '#ffffff'},
        data: dataset,
        geographyConfig: {
          borderWidth: 1,
          borderColor: '#999999',
          popupOnHover: true,
          highlightOnHover: true,
          highlightFillColor: '#bbaa99',
          highlightBorderColor: '#999999',
          highlightBorderWidth: 2,
          popupTemplate: function(geography, data) {return statePopup(geography, data); }
        }
    });
// debugger;
    // Build color gradients
    // buildGradient(pacePalette, 'paceGradient');
    // buildGradient(distPalette, 'distGradient');
    // buildGradient(tripPalette, 'tripGradient');
// debugger;
    // Draw colorbar
    // visWidth = document.getElementById('vis').offsetWidth;
    //
    // cbar = d3.select('#vis > .datamap').append('g')
    //   .attr('id', 'colorBar')
    //   .attr('class', 'colorbar')
    //
    // cbar.append('rect')
    //     .attr('id', 'gradientRect')
    //     .attr('width', cbarWidth)
    //     .attr('height', cbarHeight)
    //     .style('fill', 'url(#paceGradient)');
    //
    // cbar.append('text')
    //   .attr('id', 'colorBarMinText')
    //   .attr('class', 'colorbar')
    //   .attr('x', 0)
    //   .attr('y', cbarHeight + 15)
    //   .attr('dx', 0)
    //   .attr('dy', 0)
    //   .attr('text-anchor', 'start');
    //
    // cbar.append('text')
    //   .attr('id', 'colorBarMaxText')
    //   .attr('class', 'colorbar')
    //   .attr('x', cbarWidth)
    //   .attr('y', cbarHeight + 15)
    //   .attr('dx', 0)
    //   .attr('dy', 0)
    //   .attr('text-anchor', 'end');
    //
    // cbar.attr('transform', 'translate(' + (visWidth-cbarWidth)/2.0 + ', 30)');  // Shift to center

    // Default palette view
    showPace();
// debugger;
});


// ==================================================
// FUNCTIONS

// --------------------------------------------------
// Functions for updating colors

function showPace() {
  // d3.select('#gradientRect').style('fill', 'url(#paceGradient)');
  // d3.select('#colorBarMinText').text(pstr(minPace));
  // d3.select('#colorBarMaxText').text(pstr(maxPace));
  map.updateChoropleth(paceColors);
};

function showDist() {
  d3.select('#gradientRect').style('fill', 'url(#distGradient)');
  d3.select('#colorBarMinText').text(dstr(minDist));
  d3.select('#colorBarMaxText').text(dstr(maxDist));
  map.updateChoropleth(distColors);
};

function showTrips() {
  d3.select('#gradientRect').style('fill', 'url(#tripGradient)');
  d3.select('#colorBarMinText').text(tstr(minTrip));
  d3.select('#colorBarMaxText').text(tstr(maxTrip));
  map.updateChoropleth(tripColors);
};


// --------------------------------------------------
// Function to build gradients

// function buildGradient(palette, gradientId) {
//   d3.select('#vis > .datamap')
//     .append('linearGradient')
//     .attr('id', gradientId)
//         .attr("gradientUnits", "userSpaceOnUse")
//         .attr("x1", 0)
//         .attr("y1", 0)
//         .attr("x2", cbarWidth)
//         .attr("y2", 0)
//       .selectAll('stop')
//       .data(palette)
//       .enter()
//         .append('stop')
//         .attr('offset', function(d, i) {return i/(cLevels-1)*100.0 + '%'; })
//         .attr('stop-color', function(d) {return d; });
// };

// --------------------------------------------------
// Template for state popup

function statePopup(geography, data) {
  var html = '<div class="hoverinfo">'
    + '<div class="hover-state-title" align="center">'
    + '<b>' + geography.properties.name + '</b>'
    + '</div>'
    + '<div class="hover-state-stats">'
    + '<table>'
    + '<tr>'
      + '<td>Pace:</td>'
      + '<td>' + pstr(data['average_pace']) + '</td>'
      + '<td>(' + rstr(data['pace_rank']) + ')</td>'
    + '</tr>'
    + '<tr>'
      + '<td>Distance:</td>'
      + '<td>' + dstr(data['distance_per_trip']) + '</td>'
      + '<td>(' + rstr(data['distance_rank']) + ')</td>'
    + '</tr>'
    + '<tr>'
      + '<td>Frequency:</td>'
      + '<td>' + tstr(data['trips_per_user']) + '</td>'
      + '<td>(' + rstr(data['trip_rank']) + ')</td>'
    + '</tr>'
    + '</table>'
    + '</div>'
    + '</div>'
  return html;
};

// --------------------------------------------------
// Formatting functions

function rstr(r) {
  r = +r;  // Force numeric
  if (r == 11) {return '11th'; }
  else if (r == 12) {return '12th'; }
  else if (r == 13) {return '13th'; }
  else {
    ones = r % 10;
    if (ones == 1) {suff = 'st'; }
    else if (ones == 2) {suff = 'nd'; }
    else if (ones == 3) {suff = 'rd'; }
    else {suff = 'th'; }
    return r + suff;
  }
}

function pstr(t) {
  t = +t;  // Force numeric
  min = Math.floor(t);
  sec = Math.floor((t - Math.floor(t))*60.0);
  f1 = d3.format('0.0f');
  f2 = d3.format('02.0f');
  return f1(min) + ':' + f2(sec) + ' min/mile';
}

function dstr(x) {
  f = d3.format('0.1f');
  return f(+x) + ' miles/run';
}

function tstr(t) {
  t = +t;  // Force numeric
  f = d3.format('0.1f');
  return f(t/12) + ' runs/month'
}
