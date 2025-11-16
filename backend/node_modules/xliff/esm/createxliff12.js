import createjsMod from './createjs.js';
import js2xliffMod from './jsToXliff12.js';
var createjs = createjsMod.createjsClb;
var jsToXliff12 = js2xliffMod.jsToXliff12Clb;
var createxliff12Clb = function createxliff12Clb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb) {
  if (!ns || typeof ns !== 'string') {
    cb = ns;
    ns = null;
  }
  if (!cb) {
    return jsToXliff12(createjs(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns));
  }
  createjs(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, res) {
    if (err) return cb(err);
    jsToXliff12(res, cb);
  });
};
export default function createxliff12(srcLng, trgLng, srcKeys, trgKeys, ns, cb, ntKeys) {
  if (!cb && ns === undefined) {
    return new Promise(function (resolve, reject) {
      return createxliff12Clb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  if (!cb && typeof ns !== 'function') {
    return new Promise(function (resolve, reject) {
      return createxliff12Clb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  return createxliff12Clb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb);
}