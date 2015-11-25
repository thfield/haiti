#!/bin/bash
SCOPE=$1
DIVISION=$2
#ogr2ogr -f GeoJSON -t_srs crs:84 $SCOPE.geojson $SCOPE.shp
topojson -o $SCOPE-$DIVISION-topo.json --id-property ID --properties name=NAME --simplify-proportion .05 osm-shapefiles/$SCOPE/$SCOPE.geojson
# echo $SCOPE-$DIVISION
