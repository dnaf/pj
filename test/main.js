const assert = require('assert');
const fs = require('fs');
const Pj = require('..');

const initialData = {
	areCookiesGood: true
};

fs.writeFileSync('./test.json', JSON.stringify(initialData));

const pj = new Pj('./test.json');

it('should initialize the object from the given file', () => {
	assert.deepEqual(pj.get(), initialData);
});

it('should allow me to set and get shallow values', () => {
	pj.set('bool', true);
	assert.equal(pj.get('bool'), true);
});

it('should let me set and get objects', () => {
	pj.set('rodents', [
		{
			singular: 'rat',
			plural: 'rats'
		},
		{
			singular: 'mouse',
			plural: 'mice'
		},
		{
			singular: 'hamster',
			plural: 'hamsters'
		}
	]);
	pj.set('rodentIndexMap', {
		rat: 0,
		rats: 0,
		mouse: 1,
		mice: 1,
		hamster: 2,
		hamsters: 2
	});
});

it('should let me retrieve objects from an array with a single string path', () => {
	assert.equal(pj.get('rodents[0].singular'), 'rat');
});

it('should let me retrieve objects from an array with a multiple argument path', () => {
	assert.equal(pj.get('rodents', 0, 'plural'), 'rats');
});

it('should let me retrieve objects from a map with a single string path with single-quotes', () => {
	assert.equal(pj.get('rodentIndexMap[\'mouse\']', 1));
});
it('should let me retrieve objects from a map with a single string path with double-quotes', () => {
	assert.equal(pj.get('rodentIndexMap["mouse"]', 1));
});
it('should let me retrieve objects from a map with a multiple argument path', () => {
	assert.equal(pj.get('rodentIndexMap', 'mouse', 1));
});

