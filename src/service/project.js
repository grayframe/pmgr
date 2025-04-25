const util = require('./util');
const tableName = 'project';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const inviteUser = self.inviteUserToProject = (actorID, userID, projectID) =>
	{
		
	};

	return self;
};
