const util = require('./util');
const tableName = 'user';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;
	const saveWithHistory = util.saveWithHistory(service, tableName);

	const get = self.get =
		async (id) =>
	{
		return table
			.select('user.*',
				table.raw('json_build_object(account.*) as account'),
				table.raw('json_agg(json_build_object(permission.*)) as permissions')
			)
			.leftJoin('account', 'user.account_id', 'account.id')
			.leftJoin('permission', 'user.id', 'permission.user_id')
			.where('user.id', id)
			.first();
	};

	const update = self.update =
		async (actorID, userID, data) =>
	{
		saveWithHistory(actorID, userID, data);
	};

	//only ever called by system, actorID will always be system as far as I can tell-- still gonna leave it this way
	//for standardization's sake
	const create = self.create = 
		async (actorID, 
		{
			username,
			email,
			password,
			firstName,
			lastName,
			displayName=firstName&&lastName?`${firstName} ${lastName}`||username,
			message='new user created'
		}) =>
	{
		let user = 
		{
			user.username = username;
			user.email = email;
			user.password_hash = password; //TODO (urgent): hash this
			user.displayName = displayName;
		}

		let changes = [];

		user.history = util.getBlankHistoryEntry(actorID, {actionType: 'create', message: message, });

		let userID = await table
			.insert(user)
			.returning('id')
			.first();

		let account = await service.account.create(actorID,
		{
			user_id : userID
		});

		let projectID = await service.project.create(actorID,
		{
			owner_id : userID,
			title : `{user.displayName}'s project`,
			description : 'This is your personal project.  You can add users to collaborate or just skip it and start uploading photos!'
		});

		let album = await service.album.create(actorID, projectID,
		{
			owner_id : userID,
			project_id : projectID,
			title : `{user.displayName}'s first album`,
			description : 'This is your first album. Use it to organize and show off your photos!'
		});
	};

	const deactivate = self.deactivate 
		= async (actorID, userID) =>
	{

	};
	return self;
};
