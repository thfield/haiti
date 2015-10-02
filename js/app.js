// var dataFile = 'data/sampledata.json';
//
// d3.json(dataFile, function(error, dataset) {

  var map = new Datamap({
    element: document.getElementById('themap'),
    geographyConfig: {
      borderColor: '#000',
      dataUrl: 'data/communes-topo05.json'
    },
    // scope: 'departments',
    scope: 'communes',
    fills: {
      'level0': 'rgb(247,251,255)',
      'level1': 'rgb(222,235,247)',
      'level2': 'rgb(198,219,239)',
      'level3': 'rgb(158,202,225)',
      'level4': 'rgb(107,174,214)',
      'level5': 'rgb(66,146,198)',
      'level6': 'rgb(33,113,181)',
      'level7': 'rgb(8,81,156)',
      'level8': 'rgb(8,48,107)',
      defaultFill: "#fff"
    },
    data: {
      "151":{ "value": 0, "fillKey": "level2" },
      "152":{ "value": 0, "fillKey": "level2" },
      "213":{ "value": 0, "fillKey": "level2" },
      "214":{ "value": 162, "fillKey": "level4" },
      "222":{ "value": 308, "fillKey": "level6" },
      "231":{ "value": 368, "fillKey": "level6" },
      "232":{ "value": 204, "fillKey": "level5" },
      "233":{ "value": 242, "fillKey": "level5" },
      "234":{ "value": 176, "fillKey": "level4" },
      "511":{ "value": 489, "fillKey": "level7" },
      "522":{ "value": 34, "fillKey": "level3" },
      "523":{ "value": 363, "fillKey": "level6" },
      "611":{ "value": 809, "fillKey": "level8" },
      "613":{ "value": 468, "fillKey": "level7" },
      "614":{ "value": 182, "fillKey": "level4" },
      "623":{ "value": 0, "fillKey": "level2" },
      "641":{ "value": 353, "fillKey": "level6" },
      "642":{ "value": 433, "fillKey": "level7" },
      "911":{ "value": 0, "fillKey": "level2" },
      "913":{ "value": 97, "fillKey": "level3" },
      "931":{ "value": 14, "fillKey": "level3" },
      "932":{ "value": 11, "fillKey": "level3" },
      "933":{ "value": 43, "fillKey": "level3" },
      "934":{ "value": 0, "fillKey": "level2" }
    },
    setProjection: function(element) {
      var projection = d3.geo.mercator()
        .center([-73.0513321, 19.0557096])
        .scale(element.offsetWidth*18)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
       var path = d3.geo.path().projection(projection);
       return {path: path, projection: projection};
    }
  });
// });
