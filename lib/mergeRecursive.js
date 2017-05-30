// import adlib from 'adlib';
//
// let template = {
//   foo: '{{bar}}',
//   baz: ['one', 'two']
// };
// let result = adlib(template, {bar: "Replaced Bar"});
//
// console.log("Result", result)


function mergeRecursive(obj1, obj2) {
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

export default mergeRecursive
