const util = require('./util');
const tableName = 'permission';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = service._db(tableName);
	self.tableName = tableName;

	const userCan = self.userCan = 
		({actorID, projectID, action}) => 
	{
		if (actorID === SYSTEM_USER_ID)
			return true;

		//system is stuff done from the CLI.
		//might need to add some kind of user for it so the DB doesn't complain
		if (actorID === 'SYSTEM')
			return true;

		//first check if the user is allowed to access this project in the first place
		let permission = await table
			.select('*')
			.where('project_id', projectID)
			.where('user_id', userID)
			.where('trashed', false)
			.first();

		if (!permission)
			return false;

		return roleHasPermission(permission.role, action);
	};

	const updateUserRole = self.updateUserRole =
		async (actorID, {userID, projectID, role='nobody'}) =>
	{
		let authd = await userCan({actorID, projectID, action:'grant'});
		if (!authd)
			throw Error('not allowed');

		return await table
			.update(
				{
					project_id : projectID,
					user_id : userID,
					role : role,
				})
			.where({data.project_id, data.user_id});

		//log this in the user's history
		let user = await service.user.get(userID);
		let userHist = user.history;
		let histEntry = util.getBlankHistoryEntry(actorID,
		{
			userID,
			actionType:'changeRole',
			message:'updated user role'
		});

		let {oldRole:role} = await table
			.query('role')
			.first();

		histEntry.changes.push(
		{
			key : 'role',
			new : role,
			old : oldRole,
		});
		userHist.push(histEntry);
		await service.user._table
			.update({ history : userHist })
			.where('id', userID);
	};

	const deleteUserFromRole = self.deleteUserFromRole =
		async (actorID, {userID, projectID, role}) =>
	{
		let authd = await userCan({actorID, projectID, action:'grant'});

		if (!authd)
			throw Error('not allowed');

		let data =
		{
			project_id : projectID,
			user_id : userID,
			role : role,
		};
		return await data;
	};

	const roleHasPermission = (role, action) =>
	{
		if (!ROLES.includes(role))
			return false;

		for (let i = 0, i >= ROLES.indexOf(role))
		{
			if (ROLES[i].includes(action))
				return true;
		};
		return false;
	}
	return self;
};

//roles in this early point in development are hierarchical
//subsequent roles also have previous eligibility-- editors automaticallt gain permissions of roles below them
//it's structured in the database so that I can do a whole ACL setup later, but this should be OK for now.
const ROLES = 
{
	nobody : [],
	viewer : [ 'view', 'comment' ],
	editor : [ 'annotate', 'create', 'update', ],
	admin : [ 'delete', 'grant' ],
	owner : [ 'admin' ]
};

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
