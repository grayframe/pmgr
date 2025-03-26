#!/usr/bin/env node

const {
	program
} = require('commander');
const createUser = require('./create-user');
const getUser = require('./get-user');
const showConfig = require('./show-config');
const serveSite = require('./serve-site');

program
	.name('pmgr')
	.description('Photo Manager CLI')
	.version('0.0.0');

program.addCommand(createUser);
program.addCommand(getUser);
program.addCommand(showConfig);
program.addCommand(serveSite);

program.parse();