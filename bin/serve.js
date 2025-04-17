const {
	Command
} = require('commander');

const Config = require('../src/config');
const PMgr = require('../src/pmgr');
const PMHttp = require('../src/pm-http');
const debug = require('debug')('pmgr:bin:serve');

module.exports = new Command('serve')
	.description('Start the web server')
	.option('-p, --port <port>', 'Port to listen on', '3000')
	.option('-h, --host <host>', 'Host to listen on', 'localhost')
	.action(async(options) =>
	{
		let config = Config();
		let pmgr   = PMgr(config);
		let pmhttp = PMHttp(pmgr);

		console.log('Starting server.');

		pmhttp.start(options.port, options.host);
	});
