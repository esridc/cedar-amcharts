function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getLayerQueryUrl(layer, q){
  var query = clone(q);
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
    return layer + "/query?" + getAsUriParameters(query);
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
    var transformFunctions = [];

    if(config.datasets === undefined || config.datasets === null) {
        config.datasets = [config]
    }

    // For each series, query layer for data
    for(s=0; s<config.datasets.length; s++) {
      var dataset = config.datasets[s]
      if(dataset.mappings.category !== undefined && dataset.mappings.category !== null) {
        join_keys.push(dataset.mappings.category.field); // foreign key lookup
      }
      transformFunctions.push(dataset.featureTransform);
      var url = getLayerQueryUrl(dataset.url,dataset.query);
      requests.push(getData(url))
    }

    // Join the features into a single layer
    Promise.all(requests).then(function(responses) {
      var data = flattenFeatures(join_keys, responses, transformFunctions);
      drawChart(elementId, config, data);
    })
  }

  function mergeRecursive (obj1, obj2) {
    for (var p in obj2) {
      if (obj2.hasOwnProperty(p)) {
        try {
          // Property in destination object set; update its value.
          if (obj2[p].constructor === Object || obj2[p].constructor === Array) {
            obj1[p] = mergeRecursive(obj1[p], obj2[p]);
          } else {
            obj1[p] = obj2[p];
          }
        } catch (e) {
          // Property in destination object not set; create it and set its value
          obj1[p] = obj2[p];
        }
      }
    }
    return obj1;
  }

  function getData(url) {
    return fetch(url)
    .then(function(response) {
      return response.json();
    }, function(reason) {
      console.error("Error fetching data", reason);
    })
  }

  function buildIndex(join_keys, featureSets, transformFunctions) {
    var index = {}
    for(var d=0; d<featureSets.length; d++) {
      var transformFunction = getTransformFunction(transformFunctions[d]);
      for(var f=0; f < featureSets[d].features.length; f++) {
        var idx = featureSets[d].features[f].attributes[join_keys[d]];
        if(index[idx] === undefined) {
          index[idx] = []
        }
        index[idx].push(transformFunction(featureSets[d].features[f]))
      }
    }
    return index;
  }
  // Join multiple layers by common keys
  function flattenFeatures(join_keys, featureSets, transformFunctions) {
    console.log("Join Keys", join_keys)
    console.log("featureSets", featureSets)
    var features = [];

    // No Join, just merge
    if(join_keys.length == 0) {
      for(var d=0;d<featureSets.length; d++) {
        var featureSet = featureSets[d];
        var transformFunction = getTransformFunction(transformFunctions[d]);
        console.log('transformFunction', transformFunction);
        for(var f=0; f<featureSet.features.length; f++) {
          features.push(transformFunction(featureSet.features[f]));
        }
      }
      return features;
    }

    // Instead, join
    var index = buildIndex(join_keys, featureSets, transformFunctions)
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

  // get a user specified function to transform each feature,
  // or just use the default (returns feature attributes)
  function getTransformFunction (featureTransform) {
    var defaultTransformFunction = function (feature) {
      return feature.attributes;
    };
    return typeof featureTransform === 'function' ? featureTransform : defaultTransformFunction;
  }

  function drawChart(elementId, config, data) {
    // FIXME Clone the spec
    console.log("drawChart", data)
    var spec = clone(specs[config.type]);

    // set the data and defaults
    spec.dataProvider = data;
    spec.categoryField = "categoryField";

    // apply the mappings
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
            graph.xField = series.x.field;
            graph.yField = series.y.field;

            graph.balloonText = series.name + " [[" + series.label + "]] <br/>"
              + series.x.label + ": [[" + series.x.field + "]], "
              + series.y.label + ": [[" + series.y.field + "]]";

            graph.labelText = "";

          }
          if(graphSpec.valueField !== undefined && series.value !== undefined) {
            graph.valueField = series.value.field;
            graph.balloonText += "<br/> " + series.value.label + ": [["+ graph.valueField +"]]";
          }
          spec.graphs.push(graph)
        } // for(mappings)
      } // for(series)
    }

    // apply overrides
    if (config.overrides) {
      mergeRecursive(spec, config.overrides);
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
      },
      "timeline": {
        "type": "serial",
        "theme": "light",
        "marginRight": 40,
        "marginLeft": 40,
        "autoMarginOffset": 20,
        "mouseWheelZoomEnabled":true,
        "dataDateFormat": "YYYY-MM-DD",
        "valueAxes": [{
            "id": "v1",
            "axisAlpha": 0,
            "position": "left",
            "ignoreAxisWidth":true
        }],
        "balloon": {
            "borderThickness": 1,
            "shadowAlpha": 0
        },
        "graphs": [{
            "id": "g1",
            "balloon":{
              "drop":true,
              "adjustBorderColor":false,
              "color":"#ffffff"
            },
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "bulletSize": 5,
            "hideBulletsCount": 50,
            "lineThickness": 2,
            "title": "red line",
            "useLineColorForBulletBorder": true,
            "valueField": null
        }],
        "chartScrollbar": {
            "graph": "g1",
            "oppositeAxis":false,
            "offset":30,
            "scrollbarHeight": 80,
            "backgroundAlpha": 0,
            "selectedBackgroundAlpha": 0.1,
            "selectedBackgroundColor": "#888888",
            "graphFillAlpha": 0,
            "graphLineAlpha": 0.5,
            "selectedGraphFillAlpha": 0,
            "selectedGraphLineAlpha": 1,
            "autoGridCount":true,
            "color":"#AAAAAA"
        },
        "chartCursor": {
            "pan": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": true,
            "cursorAlpha":1,
            "cursorColor":"#258cbb",
            "limitToGraph":"g1",
            "valueLineAlpha":0.2,
            "valueZoomable":true
        },
        "valueScrollbar":{
          "oppositeAxis":false,
          "offset":50,
          "scrollbarHeight":10
        },
        "categoryField": "date",
        "categoryAxis": {
            "parseDates": true,
            "dashLength": 1,
            "minorGridEnabled": true
        },
        "export": {
            "enabled": true
        }
      }
    }
