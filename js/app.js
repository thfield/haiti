//TODO make setColors() more efficient
//TODO write script to autogenerate select box
//TODO why does setColors affect both Datamaps without initializing colorMap property?
//TODO re-project when different country is loaded
//TODO drawButtons seems to be called on kenya map also? probably due to "valueToDraw"
//TODO move cLevels (and other choro properties) to Datamap.options
//TODO improve styles
//TODO allow inputter to set size, basic choroKey options, title on/off, etc
//            d3.select('#themap .maptitle').style({'display':'none'/'block'})
//TODO export svg as embeddable code
//TODO zoomable map http://bl.ocks.org/biovisualize/2322933
//TODO drawChoroKey doesn't work on custom, integrate d3 keys?
//TODO commas in input not parsed correctly
//TODO allow multiple (non-cohort) data series in input?
//TODO setprojecton runs on Datamap creation
//TODO move index.html drawChoroKey calls to drawLegend calls
//TODO implement jekyll

var projections = {
  kenya: { center: [38,0.1], scale: 4.5 },
  haiti: { center: [-73.051, 19.056], scale: 18 },
  usa: { center: [-98.6, 39.8], scale: 1.3 },
  afghanistan: { center: [67.697, 33.939], scale: 3.5 },
  canada: { center: [-96.810, 67.397], scale: .5 },
  france: { center: [2.209, 46.212], scale: 3 },
  germany: { center: [10.454123599999999, 51.1644258171875], scale: 3 },
  mexico: { center: [-102.555988995, 23.62685241], scale: 1.7 },
  northamerica: { center: [-98.6, 39.8], scale: .5 }


}


function drawOrRedraw(){
  var self=this;
  setColors.call(self);
  drawButtons.call(self);
  colorIn.call(self,valueToDraw);

  if ( self.options.redraw == undefined ) {
    drawChoroKey.call(self);
    drawTitle.call(self);
  } else {
    d3.select('#'+ self.options.element.id + ' .maptitle').text(self.options.title);
    d3.select('#'+ self.options.element.id + ' .choroMin').text(self.options.choroExtent[0]);
    d3.select('#'+ self.options.element.id + ' .choroMax').text(self.options.choroExtent[1]);
  };
}

function drawChoroKey(){
  var self = this;
  var choroKeyOptions = {hSize: 20, vSize: 10};
  var className = 'choroKey';
  var layer = this.addLayer(className);
  // make a D3 selection.
  var choroKey = layer
      .selectAll(className)
      .data( self.options.colorPalette, JSON.stringify );
  choroKey
    .enter()
      .append('rect')
      .attr('class', className) //remember to set the class name
      .attr('width', choroKeyOptions.hSize)
      .attr('height', choroKeyOptions.vSize)
      .attr('x', function ( d, i ) { return choroKeyOptions.hSize*(i+1); })
      .style('fill', function ( d ) { return d; })
      ;
  layer.append('text')
      .text(self.options.choroExtent[0])
      .attr('class','choroMin')
      .attr('x', '0')
      .attr('y', choroKeyOptions.vSize);
  layer.append('text')
      .text(self.options.choroExtent[1])
      .attr('class','choroMax')
      .attr('x', choroKeyOptions.hSize * (cLevels+1))
      .attr('y', choroKeyOptions.vSize);
  self.options.redraw = true;
}

function drawLegend(){
  var self = this;

  var svg = d3.select('#'+self.options.element.id+' > .datamap');

  svg.append("g")
    // .attr("class", "legendQuant")
    .attr('class', function(){
      return (document.getElementById('legendToggle').checked) ? 'legendQuant hidden' : 'legendQuant';
    })
    .attr("transform", function(){
      var centerH = self.options.element.offsetWidth/2;
      return "translate("+ 20 + "," + 20 +")"
    });

  var legend = d3.legend.color()
    // .labelFormat(d3.format(",.0f"))
    .labelFormat(d3.format(".2s"))
    // .orient('horizontal')
    .shapeWidth(30)
    .scale(self.options.colorScale);

  svg.select(".legendQuant")
    .call(legend);
}

function drawTitle(){
  var self = this;
  d3.select('#'+self.options.element.id+' > .datamap')
    .append('text')
      .attr('class', function(){
        return (document.getElementById('titleToggle').checked) ? 'maptitle hidden' : 'maptitle';
      })
      .text(self.options.title)
      .attr('dy', function(){return self.options.element.offsetHeight - 5 })
      ;
}

function setColors() {
  var self = this;
  var vals = {};
  var allVals = []; //makes sure the different data sets use the same color scale, for instance to compare performance across time
  self.options.colorScale = {};
  var areas = d3.keys(self.options.data);
  var n = areas.length;

  areas.forEach(function(d){
    d3.keys(self.options.data[d]).forEach(function(j){
      vals[j]=vals[j] || [];
      vals[j].push(self.options.data[d][j]);
      allVals.push(self.options.data[d][j]);
      valueToDraw = j;
    });
    self.svg.select('.' + d).attr('data-info', JSON.stringify(self.options.data[d]));
  });

  self.options.choroExtent = d3.extent(allVals);
  self.options.colorScale = d3.scale.quantize()
    .domain( self.options.choroExtent ) // use for same scale across datasets
    // .domain( d3.extent(vals[d]) ) // use for dataset to have individual color scale
    .range(self.options.colorPalette);

  d3.keys(vals).forEach(function(d){
    self.options.colorMap[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      self.options.colorMap[d][areas[i]] = self.options.colorScale(self.options.data[areas[i]][d]);
    };
  });
};

function colorIn(val){
  var self = this;
  self.updateChoropleth(self.options.colorMap[val]);
  self.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + d3.format(',')(data[val]) : '') + '</div>';
  };
};

function drawButtons(){
  var self = this;
  var element = document.getElementById( self.options.element.id + '-controls').getElementsByClassName('buttons')[0];
  d3.keys(self.options.colorMap).forEach(function(d){
    var button = document.createElement('button');
    button.name = d;
    button.innerHTML= d;
    button.onclick = function() { colorIn.call(self,d); }
    element.appendChild(button);
   });
};

function getDataAndDraw(){
  clearElement('themap'); // empty old map
  var dataset = processInputData();
  var country = /(\w+)/.exec(dataset.scope)[0];
  var tint = document.getElementById('inputColor').value,
      cLevels = 7;
  var mapel = document.getElementById('themap');
  mapel.style.display = "block";
  mapel.style.width = document.getElementById('mapWidth').value + "px";
  mapel.style.height = document.getElementById('mapHeight').value + "px";

  customMap = new Datamap({
    element: mapel,
    geographyConfig: {
      dataUrl: 'maps/' +  dataset.scope + '-topo.json'
    },
    setProjection: function(element) {
      if (dataset.scope == 'usa-states'){
        var projection = d3.geo.albersUsa()
        .scale(element.offsetWidth*projections[country].scale);
      } else {
        var projection = d3.geo.mercator()
        .center(projections[country].center)
        .scale(element.offsetWidth*projections[country].scale);
      };
      projection
      .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
     var path = d3.geo.path().projection(projection);
     return {path: path, projection: projection};
    },
    scope: dataset.scope,
    data: dataset.data,
    title: dataset.title,
    colorPalette: colorbrewer[tint][cLevels],
    done: function(self){
      setColors.call(self);
      colorIn.call(self,valueToDraw);
      drawTitle.call(self);
      // drawChoroKey.call(self);
      drawLegend.call(self);
      self.options.redraw = true;
    }
  });
}

function processInputData(){
  var finalData = {};
  var inputData = document.getElementById('inputDataField').value;
  finalData.title = document.getElementById('inputDataTitle').value;
  finalData.scope = document.getElementById('inputDataScope').value;
  finalData.data = {};
  var inputRows = [];
  inputRows = d3.csv.parseRows(inputData);
  inputRows.forEach(function(el){
    removeLeadingSpaceArr(el);
  });
  var headings = inputRows.shift();
  inputRows.forEach(function(inputrow){
    inputrow.forEach(function(el,i,row){
      if (i==0){
        finalData.data[el] = {} ;
      } else {
        finalData.data[row[0]][headings[i]] = +el;
      };
    });
  });
  scrubData(finalData);
  transformKeys(finalData);
  return finalData;
}

function transformKeys(dataset){
  var country = /(\w+)/.exec(dataset.scope)[0];
  d3.json('maps/'+ country + '-key.json', function(error,keydata){
    for (el in dataset.data) {
      if (keydata[dataset.scope][el.toLowerCase()]) {
        var newkey = keydata[dataset.scope][el.toLowerCase()].id;
        dataset.data[newkey] = dataset.data[el];
        delete dataset.data[el];
      };
    };
  });
  return dataset;
}

function scrubData(data){
  delete data.data[''];
}

function loadAndRedraw(pathToFile){
  var self = this;
  clearElement(self.options.element.id+'-controls', 'buttons'); //get rid of buttons
  d3.json(pathToFile, function(error,dataset){ //load new data
    self.options.data = dataset.data;
    self.options.title = dataset.title;

    if (self.options.scope != dataset.scope){//check if the map needs to be redrawn with new borders
      self.options.scope = dataset.scope;
      self.options.geographyConfig.dataUrl = 'maps/' +  dataset.scope + '-topo.json';
      clearElement(self.options.element.id, 'datamap'); // empty old map
      self.options.redraw = undefined; //prepare for choropleth color
      self.draw(); // draw new map
    } else {
      drawOrRedraw.call(self); //if the map uses the same borders just redraw
    };
  });
};

function hideLegend(map){
  var legend = d3.select('#'+map.options.element.id+' .legendQuant');
  legend.classed('hidden', !legend.classed("hidden"));
}
function hideTitle(map){
  var title = d3.select('#'+map.options.element.id+' .maptitle');
  title.classed('hidden', !title.classed("hidden"));
}

function clearElement(elementId,className) {
  //empty element by #elementId, or by parent #elementId then first child with .className
  if (className === undefined){
    var myNode = document.getElementById(elementId);
  } else  {
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
function removeLeadingSpaceObj(obj) {
  for (var prop in obj) {
    var newKey = prop.trim();
    if (typeof obj[prop] === 'string')
    { obj[newKey] = obj[prop].trim(); }
    if (newKey !== prop)
    { delete obj[prop]; }
  };
  return obj;
}
function removeLeadingSpaceArr(arr){
  arr.forEach(function(el,i,arr){
    arr[i] = el.trim();
  });
  return arr;
}
function outputUpdate(num,target) {
	document.querySelector(target).value = num;
}
