'use strict';
const SYMBOL_IGNORE = Symbol('ignore');
const SYMBOL_STATE = Symbol.for('is_state');

/**
 * Determines if value is has an Object or Array constructor to preserve the prototype of classes
 * @param  {*}  value Any value that should be evaluated
 * @return {Boolean}       Returns true if value has a Array or Object constructor
 */
const isObject = function (value) {
  if (value && typeof value === 'object') {
    return (value.constructor === Object || value.constructor === Array);
  }
  return false;
};

/**
 * Convenience method of doing assignments on objects and will create objects that carry over prototypes for classes
 * @param  {Boolean} isArray Denotes that an object is an array and therefore Array constructor should be used
 * @param  {Object}  value   Any object that should be assigned
 * @return {Object}          The reassigned object value
 */
const assign = function (isArray, value) {
  let assignments = [...arguments].slice(2);
  let isClass = (value && typeof value === 'object' && !isObject(value));
  let _value;
  if (isClass) {
    _value = Object.create(value);
    _value = Object.assign(_value, value, ...assignments);
  } else  _value = Object.assign((isArray) ? [] : {}, value, ...assignments);
  return _value;
};

/**
 * Converts a state-ified object back into a normal JS object
 * @param  {Object} parent An state-ified object that should be converted
 * @return {Object}        A JS object converted from state-ified object
 */
const toObject = function (parent = {}) {
  let _parent = parent;
  let converted = Object.keys(_parent).reduce((result, key) => {
    if (_parent[key] && isState(_parent[key])) {
      result[key] = _parent[key].toObject();
      result[key][SYMBOL_STATE] = false;
    }
    else {
      if (_parent[key] && typeof _parent[key] === 'object' && !(_parent[key] instanceof Date)) {
        if (isObject(_parent[key])) result[key] = (Array.isArray(_parent[key])) ? Object.assign([], _parent[key]) : Object.assign({}, _parent[key]);
        else result[key] = assign(false, _parent[key]);
      }
      else result[key] = _parent[key];
    }
    return result;
  }, (Array.isArray(_parent)) ? [] : Object.create(_parent));
  converted[SYMBOL_STATE] = false;
  return converted;
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
 * Convenience method for determining if value is a "state", "state" Symbol is declared in global registry but is not known to end user
 * @param  {*}  data Any value that should be evaluated
 * @return {Boolean}      Returns true if value is a "state"
 */
const isState = function (data) {
  if (!data) return false;
  return (typeof data === 'object' && data[SYMBOL_STATE] === '_state_');
};

/**
 * Converts an object into an immutable "state" object which will never be directly manipulated but instead creates a new copy as necessary when a set, delete or get trap is triggered
 * @param {Object}  parent  The object to be converted
 * @param {Boolean} isArray Specifies that the object being converted is an Array. Must be true in order to properly handle arrays as they will be converted into non-iterable objects if isArray argument is not specified
 * @return {Object} Returns a "state" object which is a Proxy that indirectly accesses a copy of the initial object
 */
const STATEIFY = function (parent = {}, isArray = false) {
  if (isState(parent)) return parent;
  let _parent = assign(Array.isArray(parent), parent);
  _parent[SYMBOL_STATE] = '_state_';
  return new Proxy((isArray) ? [] : {}, {
    get: function (target, property) {
      if (property === 'inspect') return _parent;
      if (property === 'toJSON') return () => JSON.stringify(_parent);
      if (property === 'toObject') return toObject.bind(null, _parent);
      if (_parent[property] instanceof Date) _parent[property] = _parent[property].toJSON();
      if (_parent[property] && typeof _parent[property] === 'object') {
        if (isState(_parent[property]) || _parent[property][SYMBOL_IGNORE]) return _parent[property];
        _parent[property] = STATEIFY(_parent[property], Array.isArray(_parent[property]));
        return _parent[property];
      }
      else return _parent[property];
    },
    set: function (target, property, value) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      if (value instanceof Date) value = value.toJSON();
      _parent = assign(Array.isArray(_parent), _parent, { [property]: value });
      return true;
    },
    deleteProperty: function (target, property) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      _parent = assign(Array.isArray(_parent), _parent);
      delete _parent[property];
      return true;
    }
  });
};

module.exports = STATEIFY;
module.exports.setIgnore = setIgnore;
module.exports.isState = isState;
