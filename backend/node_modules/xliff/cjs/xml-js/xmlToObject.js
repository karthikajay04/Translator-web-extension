"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractValue = extractValue;
var _typeToTagMaps = require("../inline-elements/typeToTagMaps.js");
function extractValue(valueElements, elementTypeInfo) {
  if (valueElements === undefined || valueElements === null || valueElements === '') {
    return '';
  }
  if (Array.isArray(valueElements) && valueElements.length > 1) {
    return valueElements.map(function (valueElement) {
      return extractValue(valueElement, elementTypeInfo);
    });
  }
  var valueElement = Array.isArray(valueElements) ? valueElements[0] || '' : valueElements;
  if (valueElement.type === 'text') {
    if (/\n\s*$/.test(valueElement.text)) {
      return valueElement.text.substr(0, valueElement.text.lastIndexOf('\n'));
    }
    return valueElement.text;
  }
  var elementType = (0, _typeToTagMaps.tagToElementType)(valueElement.name, elementTypeInfo);
  if (valueElement.type === 'element' && elementType !== undefined) {
    var inlineElementFactory = elementTypeInfo.factories[elementType];
    return inlineElementFactory(valueElement.attributes, extractValue(valueElement.elements, elementTypeInfo));
  }
  if (valueElement.type === 'cdata') {
    return valueElement.cdata;
  }
  return '';
}