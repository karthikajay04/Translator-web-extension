"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createxliff12;
var _createjs = _interopRequireDefault(require("./createjs.js"));
var _jsToXliff = _interopRequireDefault(require("./jsToXliff12.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var createjs = _createjs.default.createjsClb;
var jsToXliff12 = _jsToXliff.default.jsToXliff12Clb;
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
function createxliff12(srcLng, trgLng, srcKeys, trgKeys, ns, cb, ntKeys) {
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
module.exports = exports.default;