"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.elementTypeToTag = elementTypeToTag;
exports.tagToElementType = tagToElementType;
function elementTypeToTag(type, types) {
  return types.elementTypeToTagMap[type];
}
function tagToElementType(tagName, types) {
  return types.tagToElementTypeMap[tagName];
}