import specs from './specs'
import clone from './clone'
import mergeRecursive from './mergeRecursive'
import adlib from 'adlib';

// Renders with AmCharts
export default function (elementId, config, data) {
  if(config.type == "custom") {
    var chart = AmCharts.makeChart( elementId, config.specification );
    return;
  }
  const specTemplate = clone(specs[config.type]);
  let graphs = [];

  // apply the mappings
  if(config.datasets !== undefined ){
    // Get the example graph spec
    let graphTemplate = specTemplate.graphTemplate.pop();
    for(let s=0; s < config.datasets.length; s++) {
      for(let i=0; i < config.series.length; i++) {
        let series = config.series[i];
        let graph = clone(graphTemplate)

        graph.title = series.label;

        // TODO: look at all fields
        graph.valueField = `${series.value.field}_${s}`;
        // TODO: fix hard-coded `categoryField` to be from external reference?
        graph.balloonText = `${graph.title} [[categoryField]]: <b>[[${graph.valueField}]]</b>`;
        graph.labelText = `[[${series.value.field}]]`;
        // graph.colorField = graph.valueField;
        // graph.alphaField = graph.valueField;


        // group vs. stack
        var group = config.datasets[s].group
        if(group !== undefined && group) {
          graph.newStack = true
        }

        // Only clone scatterplots
        if(graphTemplate.xField !== undefined && series.x !== undefined && series.y !== undefined) {
          graph.xField = series.x.field;
          graph.yField = series.y.field;

          graph.balloonText = `${series.name}: [[${series.label}]] <br/>`
            + `${series.x.label}: [[${series.x.field}]], `
            + `${series.y.label}: [[${series.y.field}]]`;

          graph.labelText = "";
        }
        if(graphTemplate.valueField !== undefined && series.value !== undefined) {
          graph.valueField = series.value.field;
          graph.balloonText += `<br/> ${series.value.label}: [[${graph.valueField}]]`;
        }
        graphs.push(graph)
      } // for(mappings)
    } // for(series)
  }

  let spec = adlib(specTemplate, {
    data: data,
    category: "categoryField",
    title: "categoryField",
    graphs: graphs,
    valueField: graphs[0].valueField
  });

  // apply overrides
  if (config.overrides) {
    mergeRecursive(spec, config.overrides);
  }

  console.log("Spec", JSON.stringify(spec))
  var chart = AmCharts.makeChart( elementId, spec );
}
