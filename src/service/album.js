const debug = require('debug')('pmgr:service:album');
const util = require('./util');
const tableName = 'album';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = () => service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const get = self.get = 
		async(id) =>
	{
		return table
			.select('*')
			.where('id', id)
			.first();
	};

	const create = self.create = 
		async(actorID, projectID, title, { message = 'new album created' }) =>
	{

		let changes = [];

		let album = 
		{
			project_id : projectID,
			title : title,
		};

		album.history = 
		JSON.stringify([
			util.getBlankHistoryEntry(actorID,
			{
				actionType: 'create',
				message,
				changes
			})
		]);

		return (await table()
			.insert(album)
			.returning('id'))[0].id;
	};
	const query = self.query = () => table()

	const remove = self.remove = 
		async(actorID, albumID, justTrash = true) =>
	{
		debug('removing album.', {actorID, albumID, deleteMethod : justTrash ? '(soft)' : '(hard)'})
		if (justTrash)
			await saveWithHistory(
				actorID,
				albumID, 
				{ trashed: true },
				{ actionType:'remove' }
			);
		else
			await table
				.del()
				.where('id', albumID);
	};

	const getMembers = self.getMembers = async (albumID, offset, length) =>
	{
		
	};

	return self;
};
