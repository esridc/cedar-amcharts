function getLayerQueryUrl(layer, query){
  if(query === null || query === undefined) {
    query = {}
  } 
  
  if(query.outStatistics !== undefined 
    && query.outStatistics !== null 
    && typeof query.outStatistics != "string") {
      query.outStatistics = JSON.stringify(query.outStatistics);
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
    if(config.mappings.value !== undefined) {
      spec.valueField = config.mappings.value.field;      
    }
    if(config.mappings.title !== undefined) {
      spec.titleField = config.mappings.title.field;
    }
    
    spec.categoryField = config.mappings.category;
    if(config.mappings.series !== undefined ){
      // Get the example graph spec
      var graphSpec = spec.graphs.pop();
      for(var i=0; i < config.mappings.series.length; i++) {
        var series = config.mappings.series[i];
        var graph = JSON.parse(JSON.stringify(graphSpec));
        
        graph.title = series.label;
        graph.balloonText = "[[" + spec.categoryField + "]]: <b>[[" + series.field + "]]</b>";
        graph.labelText = "[[" + series.field + "]]";
        graph.valueField = series.field;
        
        // Only clone scatterplots
        if(graph.xField !== undefined) {
          graph.xField = series.x;
          graph.yField = series.y;          

          graph.balloonText = "[[" + series.label + "]]: <b>[[" + series.x + "]], [[" + series.y + "]]</b>";
          graph.labelText = "";
          
        }
        
        spec.graphs.push(graph)
      }
    }

      console.log("Spec", spec)
      var chart = AmCharts.makeChart( elementId, spec );  
    }

    var specs = {
      "bar": {
        "type": "serial",
        "graphs": [{
          "fillAlphas": 0.2,
          "lineAlpha": 0.8,
          "type": "column",           
          "color": "#000000"          
        }],    
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
      },
      "pie": {
        "type": "pie",
        "innerRadius": "30%",
        "startDuration": 0,
        "graphs": [],
        "groupPercent": 5,
        "balloon":{
           "fixedPosition":true
          },
      },
      "scatter": {
        "type": "xy",
        "startDuration": 0,
        "valueAxes": [ {
            "position": "bottom",
            "axisAlpha": 0
          }, {
            "axisAlpha": 0,
            "position": "left"
          } ],
        "graphs": [{
          "fillAlphas": 0,
          "lineAlpha": 0,
          "bullet": "circle",
          "bulletBorderAlpha": 0.2,
          "bulletAlpha": 0.8,
          "color": "#000000",
          "xField": null,
          "yField": null,                
        }]
      }
    }