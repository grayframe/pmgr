const knex = require('knex');
const debug = require('debug')('pmgr:db');

const DB = function(config)
{
	let self = Object.create(module.exports);

	let db = knex(
	{
		client: 'pg',
		connection: config
	});

	self.get = function(table)
	{
		debug('Getting table: %s', table);
		return db(table);
	};

	self.dispose = function()
	{
		debug('Disposing of database.');
		db.destroy();
	};

	return self;
};

module.exports = DB;
