"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = xliff12ToJs;
var _xmlJs = _interopRequireDefault(require("xml-js"));
var _ElementTypes = _interopRequireDefault(require("./inline-elements/ElementTypes12.js"));
var _xmlToObject = require("./xml-js/xmlToObject.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var xliff12ToJsClb = function xliff12ToJsClb(str, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {
    captureSpacesBetweenElements: false
  };
  if (typeof str !== 'string') {
    var err = new Error('The first parameter was not a string');
    if (cb) return cb(err);
    return err;
  }
  var result = {};
  var xmlObj;
  try {
    xmlObj = _xmlJs.default.xml2js(str, options);
  } catch (err) {
    if (cb) return cb(err);
    return err;
  }
  var xliffRoot = xmlObj.elements.find(function (ele) {
    return ele.name === 'xliff';
  });
  if (xliffRoot.elements && xliffRoot.elements.length) {
    var elements = xliffRoot.elements.filter(function (e) {
      return e.type === 'element';
    });
    var srcLang = elements[0].attributes['source-language'] || xliffRoot.attributes.srcLang;
    var trgLang = elements[0].attributes['target-language'] || xliffRoot.attributes.trgLang;
    result.sourceLanguage = srcLang;
    result.targetLanguage = trgLang;
    if (!result.targetLanguage) delete result.targetLanguage;
    result.resources = elements.reduce(function (resources, file) {
      var namespace = options.namespace || file.attributes.original;
      var body = file.elements.filter(function (e) {
        return e.type === 'element';
      }).find(function (e) {
        return e.name === 'body';
      });
      body.elements = body.elements || [];
      var bodyChildren = body.elements.filter(function (child) {
        return child.type !== 'comment' && child.type === 'element';
      });
      resources[namespace] = createUnits(bodyChildren);
      return resources;
    }, {});
  } else {
    result.resources = {};
  }
  if (cb) return cb(null, result);
  return result;
};
function createUnits(childElements) {
  return childElements.reduce(function (parent, child) {
    var key = child.attributes.id;
    if (!child.elements) return parent;
    var children = child.elements.filter(function (e) {
      return e.name === 'trans-unit' || e.name === 'group';
    });
    if (children.length) {
      parent[key] = createGroupTag(child, children);
    } else {
      parent[key] = createTransUnitTag(child);
    }
    return parent;
  }, {});
}
function createTransUnitTag(transUnit) {
  var jsUnit = transUnit.elements.reduce(function (unit, element) {
    var value = (0, _xmlToObject.extractValue)(element.elements, _ElementTypes.default);
    switch (element.name) {
      case 'source':
      case 'target':
        unit[element.name] = value;
        break;
      case 'note':
        if (unit[element.name]) {
          if (!Array.isArray(unit[element.name])) {
            unit[element.name] = [unit[element.name]];
          }
          unit[element.name].push(value);
        } else {
          unit[element.name] = value;
        }
        break;
    }
    return unit;
  }, {});
  return addAdditionalAttributes(jsUnit, transUnit.attributes);
}
function createGroupTag(groupUnit, children) {
  var jsGroupUnit = {
    groupUnits: createUnits(children)
  };
  return addAdditionalAttributes(jsGroupUnit, groupUnit.attributes);
}
function addAdditionalAttributes(jsUnit, attributes) {
  var additionalAttributes = attributes;
  delete additionalAttributes.id;
  if (Object.keys(additionalAttributes).length) {
    Object.assign(jsUnit, {
      additionalAttributes: additionalAttributes
    });
  }
  return jsUnit;
}
function xliff12ToJs(str, options, cb) {
  if (!cb && options === undefined) {
    return new Promise(function (resolve, reject) {
      return xliff12ToJsClb(str, options, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  if (!cb && typeof options !== 'function') {
    return new Promise(function (resolve, reject) {
      return xliff12ToJsClb(str, options, function (err, ret) {
        return err ? reject(err) : resolve(ret);
      });
    });
  }
  xliff12ToJsClb(str, options, cb);
}
module.exports = exports.default;