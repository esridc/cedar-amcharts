export default function(obj) {
  console.log("clone", obj)
  return JSON.parse(JSON.stringify(obj));
}
