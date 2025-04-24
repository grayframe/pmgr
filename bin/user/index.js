#!/usr/bin/env node

const Command = require('commander').Command;

module.exports = new Command('user')
	.addCommand(require('./create'))
	.addCommand(require('./query'));
//TODO: add ban, deactivate etc.

