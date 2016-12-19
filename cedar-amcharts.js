function getLayerQueryUrl(layer, query){
  if(query === null || query === undefined) {
    query = {}
  }
  
  query.f = "json";
  if(query.where === null || query.where === undefined ) {
    query.where = "1=1";
  }
  if(query.outFields === null || query.outFields === undefined) {
    query.outFields = "*";
  }
  
  return url = layer + "/query?" + getAsUriParameters(query);
}
function getAsUriParameters(data) {
  var url = '';
  for (var prop in data) {
    url += encodeURIComponent(prop) + '=' + 
    encodeURIComponent(data[prop]) + '&';
  }
  return url.substring(0, url.length - 1)
}

function showChart(elementId, config) {
  var url = getLayerQueryUrl(config.url,config.query);
  getData(url).then(function(json) {
    var data = flattenFeatures(json);
    drawChart(elementId, config, data);
  })
}

function getData(url) { 
  return fetch(url)
  .then(function(response) {
    return response.json();
  }, function(reason) {
    console.error("Error fetching data", reason);
  })
}
function flattenFeatures(json) {
  var features = json.features;
  var data = []
  for(var i=0; i < features.length; i++) {
    data.push(features[i].attributes);
  }
  return data;
}
function drawChart(elementId, config, data) {
  // FIXME Clone the spec
  var spec = JSON.parse(JSON.stringify(specs[config.type]));
  spec.dataProvider = data;
  console.log("elementId", elementId)
  console.log("Spec", spec)
  spec.categoryField = config.mappings.category;
  for(var i=0; i < config.mappings.series.length; i++) {
    var series = config.mappings.series[i];
    spec.graphs.push({
            "title": series.label,
            "balloonText": "[[" + spec.categoryField + "]]: <b>[[" + series.field + "]]</b>",
            "labelText": "[[" + series.field + "]]",
            "valueField": series.field,
            "fillAlphas": 0.8,
            "lineAlpha": 0.2,
            "type": "column",
            "color": "#000000",
          })
  }
  var chart = AmCharts.makeChart( elementId, spec );  
}

var specs = {
  "bar": {
      "type": "serial",
      "graphs": [ ],    
      "theme": "dark",
      "legend": {
             "horizontalGap": 10,
             "maxColumns": 1,
             "position": "right",
     		"useGraphSettings": true,
     		"markerSize": 10
         },    
      "valueAxes": [ {
        "gridColor": "#FFFFFF",
        "gridAlpha": 0.2,
        "dashLength": 0,
        "stackType": "regular"
      } ],
      "gridAboveGraphs": true,
      "startDuration": 0.3,
      "startEffect": "easeInSine",
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0,
        "tickPosition": "start",
        "tickLength": 20
      },
      "export": {
        "enabled": true
      }
    }
  }