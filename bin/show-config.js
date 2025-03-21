const { Command } = require('commander');

module.exports = (config) => {
  const command = new Command('show-config')
    .description('Show current configuration')
    .action(async () => {
      // Implementation will go here
      console.log('Current configuration:');
      console.log(JSON.stringify(config, null, 2));
    });

  return command;
}; 