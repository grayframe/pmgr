const Command = require('commander').Command;
const debug = require('debug')('pmgr:bin:config:create');

const Config = require('../../src/config');

module.exports = new Command('create')
	.description('create a default config for user to edit')
	.action(async(options) =>
	{
		console.error('pipe output to \'.env.<desired env>\' to install the config');

		//TODO: Log the config to stdout
	});

