function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function setSegment(category, srcObj, trgObj, ntObj, key) {
  var srcValue = srcObj[key];
  var trgValue = trgObj[key];
  if (_typeof(srcValue) === 'object' && _typeof(trgValue) === 'object') {
    category[key] = {
      groupUnits: {}
    };
    var grpObj = category[key].groupUnits;
    Object.keys(srcValue).forEach(function (grpKey) {
      setSegment(grpObj, srcObj[key], trgObj[key], ntObj[key], grpKey);
      if (ntObj && ntObj[key] && ntObj[key][grpKey]) {
        category[key].note = ntObj[key][grpKey];
      }
    });
  } else {
    category[key] = {
      source: srcValue,
      target: trgValue
    };
    if (ntObj && ntObj[key]) {
      category[key].note = ntObj[key];
    }
  }
}
var createjsClb = function createjsClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb) {
  var js = {
    sourceLanguage: srcLng,
    targetLanguage: trgLng,
    resources: {}
  };
  if (!cb && (!ns || typeof ns !== 'string')) {
    cb = ns;
    ns = null;
  }
  trgKeys = trgKeys || {};
  var keys = Object.keys(srcKeys);
  Object.keys(trgKeys).forEach(function (k) {
    if (keys.indexOf(k) < 0) keys.push(k);
  });
  if (ns && typeof ns === 'string') {
    js.resources[ns] = {};
    var nsObj = js.resources[ns];
    keys.forEach(function (srcKey) {
      setSegment(nsObj, srcKeys, trgKeys, ntKeys, srcKey);
    });
    if (cb) cb(null, js);
    return js;
  }
  keys.forEach(function (ns) {
    js.resources[ns] = {};
    Object.keys(srcKeys[ns]).forEach(function (srcKey) {
      setSegment(js.resources[ns], srcKeys[ns], trgKeys[ns], ntKeys && ntKeys[ns], srcKey);
    });
  });
  if (cb) cb(null, js);
  return js;
};
var createjs = function createjs(srcLng, trgLng, srcKeys, trgKeys, ns, cb, ntKeys) {
  if (!cb && ns === undefined) {
    return new Promise(function (resolve, reject) {
      return createjsClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  if (!cb && typeof ns !== 'function') {
    return new Promise(function (resolve, reject) {
      return createjsClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  return createjsClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb);
};
createjs.createjsClb = createjsClb;
export default createjs;