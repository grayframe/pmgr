#!/usr/bin/env node

const { program } = require('commander');
const user = require('./user');
const config = require('./config');
const serve = require('./serve');

program
	.name('pmgr')
	.description('Photo Manager CLI')
	.version('0.0.0');

program.addCommand(user);
program.addCommand(config);
program.addCommand(serve);

program.parse();
