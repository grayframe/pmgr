const debug = require('debug')('pmgr:service');
const db = require('../db');
const User = require('./user');
const Account = require('./account');
const Project = require('./project');
const Permission = require('./permission');
const Photo = require('./photo');
const Album = require('./album');

module.exports = db =>
{
	const self = Object.create(module.exports);
	self.table = tableName => db.get(tableName);

	self.user = User(self);
	self.account = Account(self);
	self.project = Project(self);
	self.permission = Permission(self);
	self.photo = Photo(self);
	self.album = Album(self);

	return self;
};
