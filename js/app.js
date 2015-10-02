var dataFile = 'data/sampledata2.json';
var quantaColors = {};
var map;

d3.json(dataFile, function(error, dataset) {
  var values = [];
  d3.values(dataset).forEach(function(d){ values.push(d.value)})

  var cLevels = 7;  // Number of color levels
  var colorPalette = colorbrewer['Oranges'][cLevels];
  var colorScale = d3.scale.quantize()
    .domain(d3.extent(values))
    .range(colorPalette);
// debugger;
  // Data properties
  areas = d3.keys(dataset);
  n = areas.length;

  // Set up choropleth colorings
  for (var i=0; i<n; i++) {
    quantaColors[areas[i]] = colorScale(dataset[areas[i]]['value']);
  };

  map = new Datamap({
    element: document.getElementById('themap'),
    geographyConfig: {
      dataUrl: 'data/communes-topo05.json',
      borderColor: '#555555',
      popupTemplate: function(geography, data) {
        return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data.value : '') + '</div>';
      }
    },
    // scope: 'departments',
    scope: 'communes',
    fills: {
      // 'level0': 'rgb(247,251,255)',
      // 'level1': 'rgb(222,235,247)',
      // 'level2': 'rgb(198,219,239)',
      // 'level3': 'rgb(158,202,225)',
      // 'level4': 'rgb(107,174,214)',
      // 'level5': 'rgb(66,146,198)',
      // 'level6': 'rgb(33,113,181)',
      // 'level7': 'rgb(8,81,156)',
      // 'level8': 'rgb(8,48,107)',
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
    done: colorIn
  });

});

function colorIn(){
  map.updateChoropleth(quantaColors);
};
