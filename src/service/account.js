const util = require('./util');
const tableName = 'account';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const get = self.get = async (id) =>
	{
		let {userID : user_id} = await service
			.select('user_id')
			.where('id', '=', id)
			.first();
		
		return service.user.get(userID);
	};

	return self;
};
