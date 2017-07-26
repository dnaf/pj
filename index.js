const _ = require('lodash');
const debug = require('debug')('pj');
const fs = require('fs');

class Pj {
	constructor(path) {
		this._modified = [];
		this._filePath = path;
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
		this.updateInterval = setInterval(() => { this._update() }, 2000);
		process.on("exit", () => { return this._update() });
	}

	_update() {
		if (this._modified.length > 0) {
			debug("Data has changed; writing to disk");
			// TODO: rather than just serializing all of the data and writing it all at once, look into just updating the fields that were modified.
			// It'd probably be too tough to figure out with plain JSON, but from what I've read, it should be pretty simple to do with BSON and maybe
			// msgpack.
			return fs.writeFileSync(this._filePath, JSON.stringify(this._data));
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
					this._modified.push(_.take(a, i + 1));
				} // Make sure we're set to something
				return f[p]; // Return ourselves
			} // Otherwise
			this._modified.push(a);
			return f[p] = value;
		}, this._data);
	}
}

module.exports = Pj;

