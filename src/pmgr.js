const debug = require('debug')('pmgr:pmgr');
const DB = require('./db');
const Models = require('./models');

const PMgr = function(config)
{
	let self = Object.create(null);

	self._config = config;

	let db = DB(self);

	let models = Models(db);

	self.dispose = function()
	{
		debug('Disposing of PMgr.');
		db.dispose();
	};

	//self._models = models;
	//self._db = db;

	return self;
};

module.exports = PMgr;
