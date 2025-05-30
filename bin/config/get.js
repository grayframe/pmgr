const Command = require('commander').Command;
const debug = require('debug')('pmgr:bin:config:get');

const Config = require('../../src/config');

module.exports = new Command('get')
	.description('Show current configuration')
	//.option('-s, --show-sources', 'Show values from each config source')
	.action(async(options) =>
	{
		if (process.env.NODE_ENV === 'production')
		{
			console.log('will not print config in production');
			return;
		}

		//loading config manually because we don't instantiate pmgr
		let config = Config();

		/* TODO: list where config entries come from (probably very bug prone)
		let file = config.file;
		if (options.showSources)
		{
			console.log('From Environment:');
			console.log('From Files:');
			console.log('Assumed Default:');
		}*/

		console.log('Actual config:');
		console.log(config.actual);

	});

