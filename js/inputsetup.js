var colors=["YlGn","YlGnBu","GnBu","BuGn","PuBuGn","PuBu","BuPu","RdPu","PuRd","OrRd","YlOrRd","YlOrBr","Purples","Blues","Greens","Oranges","Reds","Greys","PuOr","BrBG","PRGn","PiYG","RdBu","RdGy","RdYlBu","Spectral","RdYlGn","Accent","Dark2","Paired","Pastel1","Pastel2","Set1","Set2","Set3"];

var scopes = [
  'haiti-communes',
  'haiti-departments',
  'kenya-counties'
];

var colorChooser = document.getElementById('inputColor');
var scopeChooser = document.getElementById('inputDataScope');

colors.forEach(addOption, colorChooser);
scopes.forEach(addOption, scopeChooser);

function addOption(el,i, arr){
  var option = document.createElement("option");
  option.value = el;
  option.text = el;
  this.appendChild(option);
}

// var svgel = d3.select('svg').node();


d3.select("#save").on("click", function(){
  saveSvgAsPng(d3.select('svg').node(), "diagram.png");
});
