'use strict'

const turf = require('turf');
const fs = require('fs');

let scope = process.argv[2],
    division = process.argv[3],
    scopeDivision = scope + '-' + division;

let inputFile = 'osm-shapefiles/' + scope + '/' + scope + '.geojson',
    inData = JSON.parse(fs.readFileSync(inputFile, 'utf8')),
    topoFile = scopeDivision + '-topo.json',
    topoData = JSON.parse(fs.readFileSync(topoFile, 'utf8')),
    outData = [],
    outKey = {};

let centroidPt = turf.center(inData);
// let centroidPt = turf.centroid(inData);

topoData.objects[scope].geometries.forEach(divis => {
  divis.id = 'P' +divis.id;
})
topoData.objects[scopeDivision] = topoData.objects[scope];
delete topoData.objects[scope];

outData.push( division + ':');
outKey[scopeDivision] = {};

inData.features.forEach(feature => {
  outData.push(' - ' + feature.properties.NAME);
  outKey[scopeDivision][feature.properties.NAME] = { id: 'P'+feature.properties.ID};
})

console.log(centroidPt);

let outYAML = outData.join('\n');

let outputYamlFile ='../_data/maps/' + scope + '.yaml',
    outputKeyFile = scope + '-key.json';

fs.writeFile(outputYamlFile, outYAML, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The YAML file was saved!");
    fs.writeFile(outputKeyFile, JSON.stringify(outKey), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The key file was saved!");
        fs.writeFile(topoFile, JSON.stringify(topoData), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The topojson file was saved!");
        });
    });
});
