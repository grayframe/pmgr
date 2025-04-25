const util = require('./util');
const tableName = 'album';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const get = self.get = async (id) =>
	{

	};

	const getMembers = self.getMembers = async (id)
	{
	}

	return self;
};
