const util = require('./util');
const tableName = 'permission';

module.exports = service =>
{
	const self = Object.create(module.exports);
	const table = self._table = () => service.table(tableName);
	self.tableName = tableName;

	const userCan = self.userCan = 
		async({actorID, projectID, action}) => 
	{
		//TODO: keep these in a memcache, or better yet, auto populate them into the cache on user login?
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
			.where('user_id', actorID)
			.where('trashed', false)
			.first();

		if (!permission)
			return false;

		return roleHasPermission(permission.role, action);
	};
	const query = self.query = () => table()

	const updateUserRole = self.updateUserRole =
		async(actorID, {userID, projectID, role='nobody'}) =>
	{
		let authd = await userCan({actorID, projectID, action:'grant'});
		if (!authd)
			throw Error('not allowed');

		// Get the old role first
		let oldPermission = await table
			.select('role')
			.where('project_id', projectID)
			.where('user_id', userID)
			.first();

		let oldRole = oldPermission ? oldPermission.role : 'nobody';

		// Update the role
		await table
			.update({
				project_id: projectID,
				user_id: userID,
				role: role
			})
			.where('project_id', projectID)
			.where('user_id', userID);

		// Log this in the user's history
		let user = await service.user.get(userID);
		let userHist = user.history || [];
		let histEntry = util.getBlankHistoryEntry(actorID, {
			actionType: 'changeRole',
			message: 'updated user role',
			changes: [{
				key: 'role',
				old: oldRole,
				new: role
			}]
		});

		userHist.push(histEntry);
		await service.user._table
			.update({ history: userHist })
			.where('id', userID);

		return true;
	};

	const deleteUserFromRole = self.deleteUserFromRole =
		async(actorID, {userID, projectID, role}) =>
	{
		let authd = await userCan({actorID, projectID, action:'grant'});

		if (!authd)
			throw Error('not allowed');

		await table
			.update({ trashed: true })
			.where('project_id', projectID)
			.where('user_id', userID)
			.where('role', role);

		return true;
	};

	const roleHasPermission = (role, action) =>
	{
		if (!ROLES[role])
			return false;

		// Check if the role has the permission directly
		if (ROLES[role].includes(action))
			return true;

		// Check if any higher role has the permission
		let roleKeys = Object.keys(ROLES);
		let roleIndex = roleKeys.indexOf(role);
		
		for (let i = roleIndex + 1; i < roleKeys.length; i++)
		{
			if (ROLES[roleKeys[i]].includes(action))
				return true;
		}

		return false;
	};

	return self;
};

//roles in this early point in development are hierarchical
//subsequent roles also have previous eligibility-- editors automaticallt gain permissions of roles below them
//it's structured in the database so that I can do a whole ACL setup later, but this should be OK for now.
const ROLES = 
{
	nobody: [],
	viewer: ['view', 'comment'],
	editor: ['annotate', 'create', 'update'],
	admin: ['delete', 'grant'],
	owner: ['all']
};

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
