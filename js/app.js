//TODO make setColors() more efficient
//TODO write script to autogenerate select box
//TODO why does setColors affect both Datamaps without initializing colorMap property?
//TODO re-project when different country is loaded
//TODO drawButtons seems to be called on kenya map also? probably due to "valueToDraw"
//TODO move cLevels (and other choro properties) to Datamap.options
//TODO improve styles
//TODO allow inputter to set size, basic choroKey options, title on/off, etc
//            d3.select('#themap .maptitle').style({'display':'none'/'block'})
//TODO make


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

function drawTitle(){
  var self = this;
  d3.select('#'+self.options.element.id+' > .datamap')
    .append('text')
      .attr('class', 'maptitle')
      .text(self.options.title)
      .attr('dy', function(){return self.options.element.offsetHeight - 5 })
      ;
}

function setColors() {
  var self = this;
  var vals = {};
  var allVals = []; //makes sure the different data sets use the same color scale, for instance to compare performance across time
  var colorScale = {};
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

  d3.keys(vals).forEach(function(d){
    colorScale[d]= d3.scale.quantize()
      .domain( self.options.choroExtent ) // use for same scale across datasets
      // .domain( d3.extent(vals[d]) ) // use for dataset to have individual color scale
      .range(self.options.colorPalette);
    self.options.colorMap[d] = {};
    // Set up choropleth colorings
    for (var i=0; i<n; i++) {
      self.options.colorMap[d][areas[i]] = colorScale[d](self.options.data[areas[i]][d]);
    };
  });
};

function colorIn(val){
  var self = this;
  self.updateChoropleth(self.options.colorMap[val]);
  self.options.geographyConfig.popupTemplate = function(geography, data) {
      return '<div class="hoverinfo">' + geography.properties.name +  (data ? ': ' + data[val] : '') + '</div>';
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

  customMap = new Datamap({
    element: document.getElementById('themap'),
    geographyConfig: {
      dataUrl: 'maps/' +  dataset.scope + '-topo05.json'
    },
    setProjection: function(element) {
      var projection = d3.geo.mercator()
        .center(projections[country].center)
        .scale(element.offsetWidth*projections[country].scale)
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
  // debugger;
  var headings = inputRows.shift();
  inputRows.forEach(function(inputrow){
    inputrow.forEach(function(el,i,row){
      if (i==0){
        finalData.data[el] = {} ;
      } else {
        finalData.data[row[0]][headings[i]] = +el;
      }
    });
  });
  scrubData(finalData);
  return finalData;
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
      self.options.geographyConfig.dataUrl = 'maps/' +  dataset.scope + '-topo05.json';
      clearElement(self.options.element.id, 'datamap'); // empty old map
      self.options.redraw = undefined; //prepare for choropleth color
      self.draw(); // draw new map
    } else {
      drawOrRedraw.call(self); //if the map uses the same borders just redraw
    };
  });
};


var projections = {
  kenya: { center: [38,0.1], scale: 4.5 },
  haiti: { center: [-73.0513321, 19.0557096], scale: 18 }
}
function clearElement(elementId,className) {
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
