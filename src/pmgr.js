const debug = require('debug')('pmgr:pmgr');
const path = require('path');

const DB = require('./db');
const Service = require('./service');
const MediaLib = require('./media-lib');

module.exports = function(config)
{
	let self = Object.create(module.exports);

	self.dispose = () =>
	{
		debug('Disposing of PMgr.');
		self.db.dispose();
	};

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
		allowedTypes: config.actual.MEDIA_ALLOWED_TYPES,
		destination: path.join(config.getVolatile(), 'library')
	};

	const db =
		self.db = DB(dbConf);
	const service =
		self.service = Service(self.db);
	const mediaLib =
		self.mediaLib = MediaLib(mediaLibConf);

	return self;
};

