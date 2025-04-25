const {Command} = require('commander');
const debug = require('debug')('pmgr:bin:user:create');

const Config = require('../src/config');
const PMgr = require('../src/pmgr');

module.exports = new Command('create')
	.description('Create a new user')
	.requiredOption('-l, --username <username>', 'User login name')
	.requiredOption('-p, --password <password>', 'User password')
	.option('-d, --display-name <displayName>', 'User display name')
	.option('-e, --email <email>', 'User email address')
	.action(async(options) =>
	{
		// Implementation will go here
		console.log('Creating user with options:', options);

		let config = Config();
		let pmgr   = PMgr(config);

		let userID = await pmgr.service.user.create(SYSTEM_USER_ID, {options, message : 'created new user via CLI'});

		console.log('Created user, assigned ID:', userID);

		pmgr.dispose();

	});

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
