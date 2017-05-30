import geoservice from './geoservice'
import draw from './draw'
import flatten from './flatten'

function cedar(elementId, config) {
  if(config.type == "custom") {
    return draw(elementId, config);
  }

  // Change single object to an array
  if(config.datasets === undefined || config.datasets === null) {
      config.datasets = [config]
  }

  let requests = [];
  let join_keys = [];
  let transformFunctions = [];

  // For each series, query layer for data
  for(let s=0; s<config.datasets.length; s++) {
    let dataset = config.datasets[s]
    if(dataset.mappings.category !== undefined && dataset.mappings.category !== null) {
      join_keys.push(dataset.mappings.category.field); // foreign key lookup
    }
    transformFunctions.push(dataset.featureTransform);

    requests.push(geoservice.get(dataset))
  }

  // Join the features into a single layer
  Promise.all(requests).then(function(responses) {
    let data = flatten(join_keys, responses, transformFunctions);
    draw(elementId, config, data);
  })
}

export default cedar;
