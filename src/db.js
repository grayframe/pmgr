const knex = require('knex');
const debug = require('debug')('pmgr:db');

const DB = function(pmgr)
{
	let self = Object.create(null);
	let db = pmgr._db;

	db = knex({
		client: 'pg',
		connection: {
			host: pmgr._config.DB_HOST,
			port: pmgr._config.DB_PORT,
			database: pmgr._config.DB_NAME,
			user: pmgr._config.DB_USER,
			password: pmgr._config.DB_PASSWORD
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
