//TODO change reDraw() to draw or redraw title and choro key values
//TODO make setColors() more efficient
//TODO redraw map if new data file has different scope
//TODO write script to autogenerate select box
//TODO tooltips not updating correctly: data-info tag is not updating with "updateChoropleth" call

var tint = 'YlOrRd',
    cLevels = 7;

var valueToDraw = '';
var myMap,
    myMap2;

(function(initialize){
  d3.json(initialize.dataFile, function(error, dataset) {
    myMap = new Datamap({
      element: document.getElementById(initialize.mapId),
      geographyConfig: {
        dataUrl: 'maps/' +  dataset.scope + '-topo05.json'
      },
      scope: dataset.scope,
      data: dataset.data,
      title: dataset.title,
      colorPalette: colorbrewer[tint][cLevels],
      done: function(self){
      drawOrRedraw.call(self);
      }
    });
  });
})({dataFile:'data/2801.json', mapId:'themap'});

(function(initialize){
  d3.json(initialize.dataFile, function(error, dataset) {
    myMap2 = new Datamap({
      element: document.getElementById(initialize.mapId),
      geographyConfig: {
        dataUrl: 'maps/' +  dataset.scope + '-topo05.json'
      },
      scope: dataset.scope,
      data: dataset.data,
      title: dataset.title,
      colorPalette: colorbrewer[tint][cLevels],
      done: function(self){
        drawOrRedraw.call(self);
      }
    });
  });
})({dataFile:'data/2802.json', mapId:'theothermap'});

function drawOrRedraw(){
  var self=this;
  setColors.call(self);
  drawButtons.call(self);
  colorIn.call(self,valueToDraw);

  //! CHANGE THIS
  //check if drawing for the first time
  if (true) {
    d3.select('#'+self.options.element.id+' > .datamap')
      .append('text')
        .attr('class', 'maptitle')
        .text(self.options.title)
        .attr('dy', function(){return self.options.element.offsetHeight - 5 })
        ;
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
  };//else (check if we are redrawing){ do the renaming things in redraw };
}

function reDraw (){
  var self = this;
  setColors.call(self);
  drawButtons.call(self);
  colorIn.call(self,valueToDraw);

  d3.select('#'+ self.options.element.id + ' .maptitle').text(self.options.title);
  d3.select('#'+ self.options.element.id + ' .choroMin').text(self.options.choroExtent[0])
  d3.select('#'+ self.options.element.id + ' .choroMax').text(self.options.choroExtent[1])
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
    // debugger;
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

  // self.updateChoropleth(self.options.colorMap);
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

function loadAndRedraw(pathToFile){
  var self = this;
  clearElement(self.options.element.id+'-controls', 'buttons');

  d3.json(pathToFile, function(error,dataset){
    self.options.data = dataset.data;
    self.options.title = dataset.title;
    reDraw.call(self);
  });
};

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
