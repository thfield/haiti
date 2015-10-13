
var finalData = {};

function getData(){
  processData();
}

function processData(){
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
        finalData.data[row[0]][headings[i]] = el;
      }
    });
  });
  console.log(finalData);

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
