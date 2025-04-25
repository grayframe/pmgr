const debug = require('debug')('pmgr:service:project');
const util = require('./util');
const tableName = 'project';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = () => service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const get = self.get = 
		async(id) =>
	{
		return table()
			.select('*')
			.where('id', id)
			.first();
	};

	const create = self.create = 
		async(actorID, ownerID, 
			{ title, description },
			{ message = 'new project created' }) =>
	{
		debug('creating project for', ownerID);
		let project = 
		{
			owner_id : ownerID,
			title,
			description
		};

		project.history = 
		JSON.stringify([
			util.getBlankHistoryEntry(actorID,
			{
				actionType: 'create',
				message,
				changes : []
			})
		]);

		console.log(project);

		return (await table()
			.insert(project)
			.returning('id'))[0].id;
	};
	const query = self.query = () => table()

	const remove = self.remove = 
		async(actorID, projectID, justTrash = true) =>
	{
		debug('removing project.', {actorID, projectID, deleteMethod : justTrash ? '(soft)' : '(hard)'})
		if (justTrash)
			await saveWithHistory(
				actorID,
				projectID, 
				{ trashed: true },
				{ actionType:'remove' }
			);
		else
			await table()
				.del()
				.where('id', projectID);
	};

	const inviteUser = self.inviteUserToProject = (actorID, userID, projectID) =>
	{
		
	};

	return self;
};
