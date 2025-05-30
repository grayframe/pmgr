const { Command } = require('commander');
const debug = require('debug')('pmgr:bin:user:query');

module.exports = new Command('query')
	.description('Get user information')
	.option('-n, --match-name <name>', 'Match by name')
	.option('-e, --match-email <email>', 'Match by email')
	.option('-u, --match-uuid <uuid>', 'Match by UUID')
	.action(async(options) =>
	{
		// Validate that at least one match parameter is provided
		if (!options.matchName && !options.matchEmail && !options.matchUuid)
		{
			console.error('Error: At least one match parameter is required (--match-name, --match-email, or --match-uuid)');
			process.exit(1);
		}

		// Implementation will go here
		console.log('Getting user with options:', options);
	});

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
