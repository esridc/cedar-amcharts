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
    var requests = [];
    var join_keys = [];


    if(config.datasets === undefined || config.datasets === null) {
        config.datasets = [config]
    }

    // For each series, query layer for data
    for(s=0; s<config.datasets.length; s++) {
      var dataset = config.datasets[s]
      if(dataset.mappings.category !== undefined && dataset.mappings.category !== null) {
        join_keys.push(dataset.mappings.category); // foreign key lookup
      }
      var url = getLayerQueryUrl(dataset.url,dataset.query);
      requests.push(getData(url))
    }

    // Join the features into a single layer
    Promise.all(requests).then(function(datasets) {
      console.log("Promise fulfilled", datasets)
      var data = flattenFeatures(join_keys, datasets);
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

  function buildIndex(join_keys, datasets) {
    var index = {}
    for(var d=0; d<datasets.length; d++) {
      for(var f=0; f < datasets[d].features.length; f++) {
        var idx = datasets[d].features[f].attributes[join_keys[d]];
        if(index[idx] === undefined) {
          index[idx] = []
        }
        index[idx].push(datasets[d].features[f].attributes)
      }
    }
    return index;
  }
  // Join multiple layers by common keys
  function flattenFeatures(join_keys, datasets) {
    console.log("Join Keys", join_keys)
    console.log("datasets", datasets)
    var features = []

    // No Join, just merge
    if(join_keys.length == 0) {
      for(var d=0;d<datasets.length; d++) {
        for(var f=0; f<datasets[d].features.length; f++) {

          features.push(datasets[d].features[f].attributes);
        }
      }
      return features;
    }

    // Instead, join
    var index = buildIndex(join_keys, datasets)
    var key = join_keys[0]; // TODO: support different `category` keys
    var keys = Object.keys(index)
    for(var k=0;k<keys.length; k++) {
      var idx_arr = index[keys[k]];
      var feature = {"categoryField": idx_arr[0][key]}
      for(var i=0; i<idx_arr.length; i++) {
        var attr_keys = Object.keys(idx_arr[i])
        for(var ak=0; ak<attr_keys.length; ak++) {
          var attr = attr_keys[ak] + "_" + i;
          feature[attr] = idx_arr[i][attr_keys[ak]]
        }

      }
      features.push(feature)
    }


    return features;
  }
  function drawChart(elementId, config, data) {
    // FIXME Clone the spec
    console.log("drawChart", data)
    var spec = JSON.parse(JSON.stringify(specs[config.type]));
    spec.dataProvider = data;
    spec.categoryField = "categoryField";

    if(config.datasets !== undefined ){
      // Get the example graph spec
      var graphSpec = spec.graphs.pop();
      for(var s=0; s < config.datasets.length; s++) {
        for(var i=0; i < config.datasets[s].mappings.series.length; i++) {
          var series = config.datasets[s].mappings.series[i];
          var graph = JSON.parse(JSON.stringify(graphSpec));

          graph.title = series.label;
          graph.valueField = series.field + "_" + s;
          graph.balloonText = graph.title + " [[" + spec.categoryField + "]]: <b>[[" + graph.valueField + "]]</b>";
          graph.labelText = "[[" + series.field + "]]";

          spec.titleField = "categoryField";
          spec.valueField = graph.valueField

          // group vs. stack
          var group = config.datasets[s].mappings.group
          if(group !== undefined && group) {
            graph.newStack = true
          }

          // Only clone scatterplots
          if(graphSpec.xField !== undefined && series.x !== undefined && series.y !== undefined) {
            graph.xField = series.x;
            graph.yField = series.y;

            graph.balloonText = series.name + " [[" + series.label + "]]: <b>[[" + series.x + "]], [[" + series.y + "]]</b>";
            graph.labelText = "";
            console.log("X/Y Fields", [graph.xField, graph.yField])

          }
          if(graphSpec.valueField !== undefined && series.value !== undefined) {
            console.log("Value", [graph.valueField, series.value])
            graph.valueField = series.value;
            graph.balloonText += "<br/> [["+ graph.valueField +"]]";
          }
          spec.graphs.push(graph)
        } // for(mappings)
      } // for(series)
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
      "radar": {
        "theme": "light",
        "type": "radar",
        "valueAxes": [{
          "gridType": "circles",
          "minimum": 0
        }],
        "polarScatter": {
          "minimum": 0,
          "maximum": 400,
          "step": 1
        },
        "startDuration": 0,
        "graphs": [{}],
        "groupPercent": 5,
        "balloon":{
           "fixedPosition":true
          },
        "legend":{
         	"position":"right",
          "marginRight":100,
          "autoMargins":false
        },
      },
      "pie": {
        "type": "pie",
        "innerRadius": "30%",
        "startDuration": 0,
        "graphs": [{}],
        "groupPercent": 5,
        "balloon":{
           "fixedPosition":true
          },
        "legend":{
         	"position":"right",
          "marginRight":100,
          "autoMargins":false
        },
      },
      "scatter": {
        "type": "xy",
        "autoMarginOffset": 20,
        "startDuration": 0,
        "valueAxes": [ {
            "position": "bottom",
            "axisAlpha": 0
          }, {
            "axisAlpha": 0,
            "position": "left"
          } ],
          "chartScrollbar": {
            "scrollbarHeight":2,
            "offset":-1,
            "backgroundAlpha":0.1,
            "backgroundColor":"#888888",
            "selectedBackgroundColor":"#67b7dc",
            "selectedBackgroundAlpha":1
          },
          "chartCursor": {
            "fullWidth":true,
            "valueLineEabled":true,
            "valueLineBalloonEnabled":true,
            "valueLineAlpha":0.5,
            "cursorAlpha":0
          },
        "graphs": [{
          "fillAlphas": 0,
          "lineAlpha": 0,
          "bullet": "circle",
          "bulletBorderAlpha": 0.2,
          "bulletAlpha": 0.8,
          "color": "#000000",
          "valueField": null,
          "xField": null,
          "yField": null,
        }]
      }
    }
