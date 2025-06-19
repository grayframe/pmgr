const debug = require('debug')('pmgr:service');
const db = require('../db');
const User = require('./user');
const Account = require('./account');
const Project = require('./project');
const Permission = require('./permission');
const Photo = require('./photo');
const Album = require('./album');

module.exports = () =>
{
  const self = Object.create(module.exports);

  self.user = User(self);
  self.account = Account(self);
  self.project = Project(self);
  self.permission = Permission(self);
  self.photo = Photo(self);
  self.album = Album(self);

  return self;
};
