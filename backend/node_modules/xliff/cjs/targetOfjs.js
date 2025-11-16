"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = targetOfjs;
var _ofjs = _interopRequireDefault(require("./ofjs.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function targetOfjs(js, cb) {
  return (0, _ofjs.default)(js, 'target', cb);
}
module.exports = exports.default;