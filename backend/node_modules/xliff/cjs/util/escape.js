"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var map = {
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&apos;',
  '<': '&lt;',
  '>': '&gt;'
};
function _default(str) {
  Object.keys(map).forEach(function (char) {
    str = str.replace(new RegExp(char, 'g'), map[char]);
  });
  return str;
}
;
module.exports = exports.default;