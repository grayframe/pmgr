const dotenv = require('dotenv');
const path   = require('path');
const fs = require('fs');

// Load environment variables from .env file
module.exports = () =>
{
	const self = Object.create(module.exports);

	process.env.NODE_ENV = process.env.NODE_ENV || 'development';

	const file = self.file = dotenv.config({path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)});
	const actual = self.actual = Object.create(null);

	Object.keys(DEFAULT_CONFIG).forEach( key =>
	{
		self.actual[key] = process.env[key] || DEFAULT_CONFIG[key];
	});

	const resolvePath = p => path.isAbsolute(p) ? p : path.join(process.cwd(), p);

	const getStatic = self.getStatic =
		() => resolvePath(actual.DIR_STATIC);
	const getVolatile = self.getVolatile =
		() => resolvePath(actual.DIR_VOLATILE);

	const saveConfig = self.saveConfig = () =>
	{
		let dest = path.join(process.cwd(), '.env.' + actual.NODE_ENV);
		if (fs.existsSync(dest))
			throw Error('file already exists: ' + dest);
		let stream = fs.createWriteStream(dest, { flags: 'w' });
		Object.keys(DEFAULT_CONFIG).forEach( key =>
		{
			stream.write(`${key}=${actual[key]}`);
		});
		stream.end();
	};

	return self;
};

const DEFAULT_CONFIG = module.exports.default =
{
	// Development Environment Configuration
	NODE_ENV : 'development',

	DIR_STATIC : '',
	DIR_VOLATILE : '',
	MEDIA_TYPES : 'jpg,png,gif,jpeg,tiff',

	// Database Configuration
	DB_HOST : 'localhost',
	DB_PORT : '5432',
	DB_NAME : '',
	DB_USER : '',
	DB_PASSWORD : '',

	// HTTP Configuration
	PORT : '3000',
	HOST : 'localhost',

	//Authentication
	SESSION_SECRET : '',
	SESSION_MAX_AGE : 86400000, //24 hours

	// File Storage
	MAX_FILE_SIZE : 10485760, //10mb

	// Development-specific settings
	DEBUG : true,
	LOG_LEVEL : 'debug'
};
