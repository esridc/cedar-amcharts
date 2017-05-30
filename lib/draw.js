import specs from './specs'
import clone from './clone'
import mergeRecursive from './mergeRecursive'


// Renders with AmCharts
export default function (elementId, config, data) {
  if(config.type == "custom") {
    var chart = AmCharts.makeChart( elementId, config.specification );
    return;
  }
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

        // TODO: look at all fields
        graph.valueField = series.field + "_" + s;
        graph.balloonText = graph.title + " [[" + spec.categoryField + "]]: <b>[[" + graph.valueField + "]]</b>";
        graph.labelText = "[[" + series.field + "]]";
        // graph.colorField = graph.valueField;
        // graph.alphaField = graph.valueField;

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
  console.log("Overrides?", config)
  if (config.overrides) {
    mergeRecursive(spec, config.overrides);
  }

  console.log("Spec", spec)
  var chart = AmCharts.makeChart( elementId, spec );
}
