const User = require('./user');
const Picture = require('./picture');
const Project = require('./project');

const Models = function (db)
{
	let self = Object.create(null);

	self.user    = User(db);
	self.picture = Picture(db);
	self.project = Project(db);

	return self;
}

module.export = Models;
