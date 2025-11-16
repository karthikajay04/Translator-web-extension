import { elementTypeToTag } from '../inline-elements/typeToTagMaps.js';
export function makeElement(name, attributes, elements) {
  var el = {
    type: 'element',
    name: name
  };
  if (attributes !== null && attributes !== undefined) {
    el.attributes = attributes;
  }
  if (Array.isArray(elements)) {
    el.elements = elements;
  } else if (elements === true) {
    el.elements = [];
  }
  return el;
}
export function makeText(text) {
  return {
    type: 'text',
    text: text
  };
}
export function makeValue(content, elementTypeInfo) {
  if (!Array.isArray(content)) {
    if (typeof content === 'string' || content instanceof String) {
      return [makeText(content)];
    }
    var elementType = Object.keys(content)[0];
    var elementTag = elementTypeToTag(elementType, elementTypeInfo);
    if (elementTag !== undefined) {
      var attrsSrc = Object.assign({}, content[elementType]);
      delete attrsSrc.id;
      delete attrsSrc.contents;
      var contents = content[elementType].hasOwnProperty('contents') ? makeValue(content[elementType].contents, elementTypeInfo) : undefined;
      var attrs = {
        id: content[elementType].id
      };
      Object.keys(attrsSrc).forEach(function (attrKey) {
        attrs[attrKey] = attrsSrc[attrKey];
      });
      return [makeElement(elementTag, attrs, contents)];
    }
    return [makeText(content)];
  }
  return content.map(function (segment) {
    if (typeof segment === 'string' || segment instanceof String) {
      return makeText(segment);
    }
    var elementType = Object.keys(segment)[0];
    var elementTag = elementTypeToTag(elementType, elementTypeInfo);
    if (elementTag !== undefined) {
      var _attrsSrc = Object.assign({}, segment[elementType]);
      delete _attrsSrc.id;
      delete _attrsSrc.contents;
      var _contents = segment[elementType].hasOwnProperty('contents') ? makeValue(segment[elementType].contents, elementTypeInfo) : undefined;
      var _attrs = {
        id: segment[elementType].id
      };
      Object.keys(_attrsSrc).forEach(function (attrKey) {
        _attrs[attrKey] = _attrsSrc[attrKey];
      });
      return makeElement(elementTag, _attrs, _contents);
    }
    var segmentString = '{ ' + Object.keys(segment).reduce(function (result, segmentKey) {
      return result + segmentKey + ': "' + segment[segmentKey].toString() + '"';
    }, '') + ' }';
    return {
      type: 'comment',
      comment: 'Warning: unexpected segment ' + segmentString + ' was ignored'
    };
  });
}