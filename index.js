const Promise = require('bluebird');

const _ = require('lodash');
const debug = require('debug')('pj');
const fs = Promise.promisifyAll(require('fs'));

class Pj {
	constructor(path) {
		try {
			this._data = JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
		} catch (e) {
			if (e.code === 'ENOENT') {
				this._data = {};
				fs.writeFileSync(path, '{}');
			} else {
				throw e;
			}
		}
	}

	_getPath(...property) {
		return _.flattenDeep(property.map(p => {
			if (typeof (p) === 'string') {
				return p.split('.').map(pp => {
					const m = pp.match(/\[(\d+|'[^']*'|"[^"]*")\]/); // Match [<whatever>] at the end
					if (m) {
						const mm = m[1].replace(/(^|)?["']($|)?/g, ''); // Scoop the quotes off either side
						if (m[1] == mm && Number(m[1])) { // It's a number
							return [pp.substr(0, pp.length - m[0].length), Number(m[1])];
						}
						// It's a string
						return [pp.substr(0, pp.length - m[0].length), mm];
					}
					return pp;
				});
			} else if (typeof (p) === 'number') {
				return p;
			}
			throw new Error('what the hell dude');
		}));
	}

	get(...property) {
		if (property.length > 0) {
			const path = this._getPath(...property);
			return path.reduce((f, p) => (f || {})[p], this._data);
		}
		return this._data;
	}
	set(...property) {
		const value = property.pop();
		const path = this._getPath(...property);
		return path.reduce((f, p, i, a) => {
			if (i < a.length - 1) { // If this isn't the last value in the array
				if (!f[p]) {
					f[p] = {};
				} // Make sure we're set to something
				return f[p]; // Return ourselves
			} // Otherwise
			return f[p] = value;
		}, this._data);
	}
}

module.exports = Pj;

