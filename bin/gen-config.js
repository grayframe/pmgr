const { Command } = require('commander');

module.exports = new Command('show-config')
	.description('Show current configuration')
	.action(async () => {
		//loading config manually because we don't instantiate pmgr
		require('../src/config')();

		console.log('Current configuration:');
		console.log(JSON.stringify(process.env, null, 2));
	});

