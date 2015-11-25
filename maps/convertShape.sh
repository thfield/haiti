#!/bin/bash
SCOPE=$1
DIVISION=$2
SHAPEFILE=$3
JSONPATH=osm-shapefiles/$SCOPE/
ogr2ogr -f GeoJSON -t_srs crs:84 $JSONPATH/$SCOPE.geojson $JSONPATH/$SHAPEFILE
topojson -o $SCOPE-$DIVISION-topo.json --id-property ID --properties name=NAME --simplify-proportion .05 osm-shapefiles/$SCOPE/$SCOPE.geojson
node process.js $SCOPE $DIVISION
