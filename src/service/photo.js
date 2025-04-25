const debug = require('debug')('pmgr:service:photo');
const util = require('./util');
const tableName = 'photo';

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
	const query = self.query = () => table()

	const remove = self.remove = 
		async(actorID, photoID, justTrash = true) =>
	{
		debug('removing photo.', {actorID, photoID, deleteMethod : justTrash ? '(soft)' : '(hard)'})
		if (justTrash)
			await saveWithHistory(
				actorID,
				photoID, 
				{ trashed: true },
				{ actionType:'remove' }
			);
		else
			await table
				.del()
				.where('id', photoID);
	};

	return self;
};
