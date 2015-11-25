---
---
var colors=["YlGn","YlGnBu","GnBu","BuGn","PuBuGn","PuBu","BuPu","RdPu","PuRd","OrRd","YlOrRd","YlOrBr","Purples","Blues","Greens","Oranges","Reds","Greys","PuOr","BrBG","PRGn","PiYG","RdBu","RdGy","RdYlBu","Spectral","RdYlGn","Accent","Dark2","Paired","Pastel1","Pastel2","Set1","Set2","Set3"];

var scopes = [
  {% for country in site.data.maps %}{% for unit in country[1]%}
  '{{ country[0] }}-{{ unit[0] }}'{% if forloop.rindex != 0 %},{% endif %}
  {% endfor %}{% endfor %}
];

var colorChooser = document.getElementById('inputColor');
var scopeChooser = document.getElementById('inputDataScope');

colors.forEach(addOption, colorChooser);
scopes.forEach(addOption, scopeChooser);

function addOption(el,i, arr){
  var option = document.createElement("option");
  option.value = el;
  option.text = el;
  if (el == 'usa-states')
    option.selected = true;
  this.appendChild(option);
}

d3.select("#save").on("click", function(){
  saveSvgAsPng(d3.select('svg').node(), "diagram.png");
});
