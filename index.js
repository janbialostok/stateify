'use strict';

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

const STATEIFY = function (parent = {}, isArray = false) {
  let _parent = Object.assign((isArray) ? [] : {}, parent);
  _parent[Symbol.species] = '_state_';
  let proxy = new Proxy((isArray) ? [] : {}, {
    get: function (target, property) {
      if (property === 'inspect') return _parent;
      if (property === 'toJSON') return () => JSON.stringify(_parent);
      if (property === 'toObject') return toObject.bind(null, _parent);
      if (_parent[property] && typeof _parent[property] === 'object') {
        if (_parent[property][Symbol.species] === '_state_') return _parent[property];
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
  proxy[Symbol.toStringTag] = JSON.stringify(_parent);
  return proxy;
};

module.exports = STATEIFY;
