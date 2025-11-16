import createjsMod from './createjs.js';
import js2xliffMod from './js2xliff.js';
var createjs = createjsMod.createjsClb;
var js2xliff = js2xliffMod.js2xliffClb;
var createxliffClb = function createxliffClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb) {
  if (!ns || typeof ns !== 'string') {
    cb = ns;
    ns = null;
  }
  if (!cb) {
    return js2xliff(createjs(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns));
  }
  createjs(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, res) {
    if (err) return cb(err);
    js2xliff(res, cb);
  });
};
export default function createxliff(srcLng, trgLng, srcKeys, trgKeys, ns, cb, ntKeys) {
  if (!cb && ns === undefined) {
    return new Promise(function (resolve, reject) {
      return createxliffClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  if (!cb && typeof ns !== 'function') {
    return new Promise(function (resolve, reject) {
      return createxliffClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  return createxliffClb(srcLng, trgLng, srcKeys, trgKeys, ntKeys, ns, cb);
}