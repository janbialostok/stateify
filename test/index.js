'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const stateify = require(path.join(__dirname, '../index'));
const EXAMPLE = {
	hello: 'world',
	foo: 'bar',
	a: ['b', 'c', 'd'],
	one: {
		fish: {
			two: {
				fish: true
			}
		}
	},
	isTrue: () => true
};

describe('stateify', function () {
	describe('Basic assertions', function () {
		it('Should be able to create a state object', () => {
			let state = stateify(EXAMPLE);
			expect(state).to.be.an('object');
			expect(state.inspect).to.be.okay;
			expect(state.toJSON).to.be.okay;
			expect(state.toObject).to.be.okay;
			expect(state.inspect[Symbol.species]).to.equal('_state_');
		});
		it('Should be able to access all the properties of the initial object', () => {
			let state = stateify(EXAMPLE);
			expect(state.hello).to.equal('world');
			expect(state.foo).to.equal('bar');
			expect(state.a.inspect).to.deep.equal(['b', 'c', 'd']);
			expect(state.one.inspect).to.be.an('object');
			expect(state.isTrue).to.be.a('function');
		});
		it('Should be able to set unmodifiable fields', () => {
			let state = stateify(EXAMPLE);
			state.toJSON = true;
			state.toObject = true;
			state.inspect = true;
			expect(state.toJSON).to.not.equal(true);
			expect(state.toObject).to.not.equal(true);
			expect(state.inspect).to.not.equal(true);
		});
	});
	describe('Immutability and converting back to an object', function () {
		it('Should allow for manipulations of state properties without modifying original object', () => {
			let state = stateify(EXAMPLE);
			state.hello = 'earth';
			state.a[2] = 'D';
			state.one.fish.two.whale = true;
			expect(EXAMPLE.hello).to.not.equal(state.hello);
			expect(EXAMPLE.a[2]).to.not.equal(state.a[2]);
			expect(EXAMPLE.one.fish.two.whale).to.not.equal(state.one.fish.two.whale);
		});
		it('Should convert object type fields into states', () => {
			let state = stateify(EXAMPLE);
			state.one.fish = 'three';
			expect(EXAMPLE.one.fish).to.be.an('object');
			expect(state.one.fish).to.be.a('string');
			expect(state.one[Symbol.species]).to.equal('_state_');
		});
		it('Should not re-stateify a field that is already a state', () => {
			let restateExample = {
				hello: {
					world: true
				}
			};
			restateExample.hello[Symbol.species] = '_state_';
			let state = stateify(restateExample);
			expect(state.hello.inspect).to.not.be.ok;
		});
		it('Should be able to delete properties without modifying original object', () => {
			let state = stateify(EXAMPLE);
			delete state.isTrue;
			expect(EXAMPLE.isTrue).to.be.a('function');
			expect(state.isTrue).to.not.be.ok;
		});
		it('Should be able to convert state object back into a JS object', () => {
			let state = stateify(EXAMPLE);
			state.a[0] = 'blue';
			state = state.toObject();
			expect(state.a).to.deep.equal(['blue', 'c', 'd']);
			expect(EXAMPLE.one).to.deep.equal(state.one);
		});
	});
	describe('Setting fields to ignore', function () {
		it('Should set a non-enumerable ignore property on a property', () => {
			let ignoreExample = {
				hello: {
					'world': true
				}
			};
			ignoreExample.hello = stateify.setIgnore(ignoreExample.hello);
			let state = stateify(ignoreExample);
			state.hello.world = false;
			expect(state.hello.world).to.equal(ignoreExample.hello.world);
			expect(state.hello[Symbol.species]).to.not.equal('_state_');
		});
	});
});
