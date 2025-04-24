const {Command} = require('commander');

const Config = require('../src/config');
const PMgr = require('../src/pmgr');
const PMHttp = require('../src/http');
const debug = require('debug')('pmgr:bin:serve');

module.exports = new Command('serve')
	.description('Start the web server')
	.option('-p, --port <port>', 'Port to listen on', '3000')
	.option('-a, --addr <addr>', 'Address to bind to', '0.0.0.0')
	.action(async(options) =>
	{
		let config = Config();
		let pmgr   = PMgr(config);
		let pmhttp = PMHttp(pmgr, config);

		console.log('Starting server.');

		pmhttp.start(options.port, options.addr);
	});
