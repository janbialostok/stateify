(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var SYMBOL_IGNORE = global && global.Symbol || window && window.Symbol ? Symbol('ignore') : '__ignore__';
var SYMBOL_STATE = global && global.Symbol || window && window.Symbol ? Symbol.for('is_state') : '__is_state__';

/**
 * Converts a state-ified object back into a normal JS object
 * @param  {Object} parent An state-ified object that should be converted
 * @return {Object}        A JS object converted from state-ified object
 */
var toObject = function toObject() {
  var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _parent = parent;
  return Object.keys(_parent).reduce(function (result, key) {
    if (_parent[key][SYMBOL_STATE] === '_state_') result[key] = _parent[key].toObject();else {
      if (_parent[key] && _typeof(_parent[key]) === 'object') result[key] = Array.isArray(_parent[key]) ? Object.assign([], _parent[key]) : Object.assign({}, _parent[key]);else result[key] = _parent[key];
    }
    return result;
  }, Array.isArray(_parent) ? [] : {});
};

/**
 * Sets a non-enumerable "ignore" property on an object which specifies that the field should never be treated as a "state"
 * @param {Object} toIgnore An object that should never be converted into a state
 */
var setIgnore = function setIgnore() {
  var toIgnore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
var STATEIFY = function STATEIFY() {
  var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var isArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _parent = Object.assign(isArray ? [] : {}, parent);
  Object.defineProperty(_parent, SYMBOL_STATE, {
    value: '_state_',
    enumerable: false
  });
  return new Proxy(isArray ? [] : {}, {
    get: function get(target, property) {
      if (property === 'inspect') return _parent;
      if (property === 'toJSON') return function () {
        return JSON.stringify(_parent);
      };
      if (property === 'toObject') return toObject.bind(null, _parent);
      if (_parent[property] && _typeof(_parent[property]) === 'object') {
        if (_parent[property][SYMBOL_STATE] === '_state_' || _parent[property][SYMBOL_IGNORE]) return _parent[property];
        _parent[property] = STATEIFY(_parent[property], Array.isArray(_parent[property]));
        return _parent[property];
      } else return _parent[property];
    },
    set: function set(target, property, value) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      _parent[property] = value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? STATEIFY(value, Array.isArray(value)) : value;
      return true;
    },
    deleteProperty: function deleteProperty(target, property) {
      if (property === 'inspect' || property === 'toJSON' || property === 'toObject') return true;
      _parent = Object.assign(Array.isArray(_parent[property]) ? [] : {}, _parent);
      delete _parent[property];
      return true;
    }
  });
};

module.exports = STATEIFY;
module.exports.setIgnore = setIgnore;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
