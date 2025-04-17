const {
	Command
} = require('commander');
const debug = require('debug')('pmgr:bin:user:create');

module.exports = new Command('create')
	.description('Create a new user')
	.requiredOption('-l, --login-name <loginName>', 'User login name')
	.requiredOption('-p, --password <password>', 'User password')
	.option('-d, --display-name <displayName>', 'User display name')
	.option('-e, --email <email>', 'User email address')
	.action(async(options) =>
	{
		// Implementation will go here
		console.log('Creating user with options:', options);
	});
