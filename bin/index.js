#!/usr/bin/env node

const { program } = require('commander');
const createUser = require('./create-user');
const getUser = require('./get-user');
const showConfig = require('./show-config');
const serveSite = require('./serve-site');

const config = {};

program
  .name('pmgr')
  .description('Photo Manager CLI')
  .version('0.0.0');

program.addCommand(createUser(config));
program.addCommand(getUser(config));
program.addCommand(showConfig(config));
program.addCommand(serveSite(config));

program.parse(); 