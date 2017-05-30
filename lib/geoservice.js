import clone from './clone'

function getData(url) {
  return fetch(url)
  .then(function(response) {
    return response.json();
  }, function(reason) {
    console.error("Error fetching data", reason);
  })
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

// Returns a promise
function get(dataset) {
  var url = getLayerQueryUrl(dataset.url,dataset.query);
  return(getData(url))
}

export default {get}
