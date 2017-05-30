// get a user specified function to transform each feature,
// or just use the default (returns feature attributes)
function getTransformFunction (featureTransform) {
  var defaultTransformFunction = function (feature) {
    return feature.attributes;
  };
  return typeof featureTransform === 'function' ? featureTransform : defaultTransformFunction;
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

export default flattenFeatures
