const { Command } = require('commander');

module.exports = (config) => {
  const command = new Command('create-user')
    .description('Create a new user')
    .requiredOption('-l, --login-name <loginName>', 'User login name')
    .requiredOption('-p, --password <password>', 'User password')
    .option('-d, --display-name <displayName>', 'User display name')
    .option('-e, --email <email>', 'User email address')
    .action(async (options) => {
      // Implementation will go here
      console.log('Creating user with options:', options);
    });

  return command;
}; 