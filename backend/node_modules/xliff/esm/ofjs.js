export default function ofjs(js, what, cb) {
  var res = {};
  var nsKeys = Object.keys(js.resources || {});
  if (nsKeys.length === 1) {
    var ns = js.resources[nsKeys[0]];
    var keys = Object.keys(ns);
    keys.forEach(function (key) {
      var value = getSegment(ns[key], what);
      if (value === undefined) return;
      res[key] = value;
    });
    if (cb) return cb(null, res);
    return res;
  }
  nsKeys.forEach(function (nsKey) {
    res[nsKey] = {};
    var ns = js.resources[nsKey];
    var keys = Object.keys(ns);
    keys.forEach(function (key) {
      var value = getSegment(ns[key], what);
      if (value !== undefined) res[nsKey][key] = value;
    });
  });
  if (cb) return cb(null, res);
  return res;
}
function getSegment(category, what) {
  var value = category[what];
  if (value === undefined && category.groupUnits) {
    value = {};
    var groupKeys = Object.keys(category.groupUnits);
    groupKeys.forEach(function (groupKey) {
      var groupValue = getSegment(category.groupUnits[groupKey], what);
      if (groupValue !== undefined) value[groupKey] = groupValue;
    });
  }
  return value;
}