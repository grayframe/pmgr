const debug = require('debug')('pmgr:models');

const User = require('./user');
const Picture = require('./picture');
const Project = require('./project');

const Models = function(db)
{
	let self = Object.create(null);

	//self.user    = User(db.get('users'));
	//self.picture = Picture(db.get('pictures'));
	//self.project = Project(db.get('projects'));

	return self;
};

module.exports = Models;
