const debug = require('debug')('pmgr:service');

const Account = require('./account');
const User = require('./user');
const Project = require('./project');
const Permission = require('./permission');
const Photo = require('./photo');
const Album = require('./album');

const Models = db =>
{
	let self = Object.create(null);

	self.account    = Account(self);
	self.user       = User(self);
	self.project    = Project(self);
	self.photo      = Photo(self);
	self.album      = Album(self);
	self.permission = Permission(self);

	self._db = db;

	return self;
};

module.exports = Models;
