"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sourceOfjs;
var _ofjs = _interopRequireDefault(require("./ofjs.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function sourceOfjs(js, cb) {
  return (0, _ofjs.default)(js, 'source', cb);
}
module.exports = exports.default;