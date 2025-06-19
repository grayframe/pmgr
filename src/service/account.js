const debug = require('debug')('pmgr:service:account');
const util = require('./util');
const tableName = 'account';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = () => service.table(tableName);
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
		async(actorID, userID, 
			{ firstName, lastName },
			{ message = 'new account created'}) =>
	{
		debug('creating account for user: ', userID);
		let account = 
		{
			user_id : userID,
			first_name : firstName,
			last_name : lastName,
			history : JSON.stringify(
			[
				util.getBlankHistoryEntry(actorID,
				{
					actionType: 'create',
					message,
					changes : []
				})
			])
		};

		return (await table()
			.insert(account)
			.returning('id'))[0].id;
	};
	const query = self.query = () => table()
	const remove = self.remove = 
		async(actorID, accountID, justTrash = true) =>
	{
		debug('removing account.', {actorID, accountID, deleteMethod : justTrash ? '(soft)' : '(hard)'})
		if (justTrash)
			await saveWithHistory(
				actorID,
				accountID, 
				{ trashed: true },
				{ actionType:'remove' }
			);
		else
			await table()
				.del()
				.where('id', accountID);
	};

	return self;
};
