const Command = require('commander').Command;

module.exports = new Command('config')
	.addCommand(require('./get'))
	.addCommand(require('./create'));
