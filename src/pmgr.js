const debug = require('debug')('pmgr:pmgr');
const DB = require('./db');
const Models = require('./models');
const MediaLib = require('./media-lib');

module.exports = function(config)
{
	let self = Object.create(module.exports);

	let dbConf = 
	{
		host: config.actual.DB_HOST,
		port: config.actual.DB_PORT,
		database: config.actual.DB_NAME,
		user: config.actual.DB_USER,
		password: config.actual.DB_PASSWORD
	};

	let mediaLibConf = 
	{
		types: config.actual.MEDIA_TYPES,
		destination: path.join(config.getVolatile(), 'library'),
	};

	let db = DB(self);
	let models = Models(db);
	let mediaLib = MediaLib(mediaLibConf);
	

	self.dispose = () =>
	{
		debug('Disposing of PMgr.');
		db.dispose();
	};

	self.db = db;
	self.models = models;
	self.mediaLib = mediaLib;

	return self;
};

