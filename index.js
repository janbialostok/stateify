'use strict';

const STATE = class State {
  constructor (initial_state = {}) {
    this.state = Object.assign({}, initial_state);
  }
  inspect () {
    return Object.assign({}, this.state);
  }
  copy () {
    return STATEIFY(Object.assign({}, this.state));
  }
};

const GET = function (target, property) {
  if (property === '_inspect') return target.inspect.bind(target);
  else if (property === '_copy') return target.copy.bind(target);
  else {
    if (target.state[property] && typeof target.state[property] === 'object') {
      let value = target.state[property];
      delete target.state[property];
      target.state[property] = Object.assign({}, value);
    }
    return target.state[property];
  }
};

const SET = function (target, property, value) {
  if (['_copy','_inspect'].indexOf('property') !== -1) return false;
  let state = Object.assign({}, target.state);
  state[property] = value;
  target.state = state;
  return true;
};

const DELETE = function (target, property) {
  if (['_copy','_inspect'].indexOf('property') !== -1) return false;
  let state = Object.assign({}, target.state);
  delete state[property];
  target.state = state;
  return true;
};

const STATEIFY = function stateify (data) {
  return new Proxy(new STATE(data), {
    get: GET,
    set: SET,
    deleteProperty: DELETE
  });
};

module.exports = STATEIFY;
