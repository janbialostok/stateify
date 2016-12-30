'use strict';
const SYMBOL_IGNORE = Symbol('ignore');

/**
 * Converts a state-ified object back into a normal JS object
 * @param  {Object} parent An state-ified object that should be converted
 * @return {Object}        A JS object converted from state-ified object
 */
const toObject = function (parent = {}) {
  let _parent = parent;
  return Object.keys(_parent).reduce((result, key) => {
    if (_parent[key][Symbol.species] === '_state_') result[key] = _parent[key].toObject();
    else {
      if (_parent[key] && typeof _parent[key] === 'object') result[key] = (Array.isArray(_parent[key])) ? Object.assign([], _parent[key]) : Object.assign({}, _parent[key]);
      else result[key] = _parent[key];
    }
    return result;
  }, (Array.isArray(_parent) ? [] : {}));
};

/**
 * Sets a non-enumerable "ignore" property on an object which specifies that the field should never be treated as a "state"
 * @param {Object} toIgnore An object that should never be converted into a state
 */
const setIgnore = function (toIgnore = {}) {
  Object.defineProperty(toIgnore, SYMBOL_IGNORE, {
    value: true,
    enumerable: false
  });
  return toIgnore;
};

/**
 * Converts an object into an immutable "state" object which will never be directly manipulated but instead creates a new copy as necessary when a set, delete or get trap is triggered
 * @param {Object}  parent  The object to be converted
 * @param {Boolean} isArray Specifies that the object being converted is an Array. Must be true in order to properly handle arrays as they will be converted into non-iterable objects if isArray argument is not specified
 * @return {Object} Returns a "state" object which is a Proxy that indirectly accesses a copy of the initial object
 */
const STATEIFY = function (parent = {}, isArray = false) {
  let _parent = Object.assign((isArray) ? [] : {}, parent);
  _parent[Symbol.species] = '_state_';
  let proxy = new Proxy((isArray) ? [] : {}, {
    get: function (target, property) {
      if (property === 'inspect') return _parent;
      if (property === 'toJSON') return () => JSON.stringify(_parent);
      if (property === 'toObject') return toObject.bind(null, _parent);
      if (_parent[property] && typeof _parent[property] === 'object') {
        if (_parent[property][Symbol.species] === '_state_' || _parent[property][Symbol.for('ignore')]) return _parent[property];
        _parent[property] = STATEIFY(_parent[property], Array.isArray(_parent[property]));
        return _parent[property];
      }
      else return _parent[property];
    },
    set: function (target, property, value) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      _parent = Object.assign((Array.isArray(_parent) ? [] : {}), _parent, { [property]: value });
      return true;
    },
    deleteProperty: function (target, property) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      _parent = Object.assign(Array.isArray(_parent[property]) ? [] : {}, _parent);
      delete _parent[property];
      return true;
    }
  });
  return proxy;
};

module.exports = STATEIFY;
module.exports.setIgnore = setIgnore;
