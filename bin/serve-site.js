const { Command } = require('commander');

const config = require('../src/config');
const PMgr = require('../src/pmgr');
const PMHttp = require('../src/pm-http');

module.exports = new Command('serve-site')
	.description('Start the web server')
	.option('-p, --port <port>', 'Port to listen on', '3000')
	.option('-h, --host <host>', 'Host to listen on', 'localhost')
	.action(async (options) =>
	{
		let config = config().actual;
		let pmgr   = PMgr(config);
		let pmhttp = PMHttp(pmgr);

		console.log('Starting server with options:', options);
	});
