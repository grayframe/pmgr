const knex = require('knex');
const debug = require('debug')('pmgr:db');

const DB = function(pmgr)
{
	let self = Object.create(null);
	let db = pmgr._db;

	db = knex({
		client: 'pg',
		connection:
		{
			host: pmgr.config.actual.DB_HOST,
			port: pmgr.config.actual.DB_PORT,
			database: pmgr.config.actual.DB_NAME,
			user: pmgr.config.actual.DB_USER,
			password: pmgr.config.actual.DB_PASSWORD
		}
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
