const Config = require('./src/config');
let config = Config().actual;

module.exports = {
	client: 'pg',
	connection: {
		host: config.DB_HOST,
		user: config.DB_USER,
		password: config.DB_PASSWORD,
		database: config.DB_NAME
	},
	migrations: {directory: './migrations'},
	seeds: {directory: './seeds'}
};

