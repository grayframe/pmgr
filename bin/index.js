#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
const config = require('../src/config.js');

const createUser = require('./create-user');
const getUser = require('./get-user');
const showConfig = require('./show-config');
const serveSite = require('./serve-site');

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version);

program.addCommand(createUser);
program.addCommand(getUser);
program.addCommand(showConfig);
program.addCommand(serveSite);

program.parse(); 
