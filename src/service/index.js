const debug = require('debug')('pmgr:service');

const Account = require('./account');
const User = require('./user');
const Project = require('./project');
const Permission = require('./permission');
const Photo = require('./photo');
const Album = require('./album');

const Models = (db) =>
{
	let self = Object.create(null);

	self.user       = User(db.get('user'));
	self.photo      = Photo(db.get('photo'));
	self.project    = Project(db.get('project'));
	self.account    = Account(db.get('account'));
	self.permission = Permission(db.get('permission'));
	self.album      = Album(db.get('album'));

	return self;
};

module.exports = Models;
