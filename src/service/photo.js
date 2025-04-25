const util = require('./util');
const tableName = 'photo';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	return self;
};
