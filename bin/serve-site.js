const { Command } = require('commander');

module.exports = (config) => {
  const command = new Command('serve-site')
    .description('Start the web server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-h, --host <host>', 'Host to listen on', 'localhost')
    .action(async (options) => {
      // Implementation will go here
      console.log('Starting server with options:', options);
    });

  return command;
}; 