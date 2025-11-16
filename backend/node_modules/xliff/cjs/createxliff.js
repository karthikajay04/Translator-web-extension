"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createxliff;
var _createjs = _interopRequireDefault(require("./createjs.js"));
var _js2xliff = _interopRequireDefault(require("./js2xliff.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var createjs = _createjs.default.createjsClb;
var js2xliff = _js2xliff.default.js2xliffClb;
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
function createxliff(srcLng, trgLng, srcKeys, trgKeys, ns, cb, ntKeys) {
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
module.exports = exports.default;