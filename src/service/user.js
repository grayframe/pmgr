const debug = require('debug')('pmgr:service:user');
const account = require('./account');
const util = require('./util');
const tableName = 'user';

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
				.select('user.*',
					table().raw('json_build_object(account.*) as account'),
					table().raw('json_agg(json_build_object(permission.*)) as permissions')
				)
				.leftJoin('account', 'user.account_id', 'account.id')
				.leftJoin('permission', 'user.id', 'permission.user_id')
				.where('user.id', id)
				.first();
		};

	const update = self.update =
		async(actorID, userID, data) =>
		{
			await saveWithHistory(actorID, userID, data);
		};

	//only ever called by system, actorID will always be system as far as I can tell-- still gonna leave it this way
	//for standardization's sake
	const create = self.create =
		async(actorID,
			{
				username,
				email,
				password,
				firstName,
				lastName,
				displayName = firstName && lastName ? `${firstName} ${lastName}` : username,
				message = 'new user created'
			}) =>
		{
			debug('creating user', {username, email, password, firstName,lastName,displayName, username, message})

			let userID, accountID, projectID, albumID;
			//try
			{
				let user =
				{
					username,
					email,
					password_hash: password,
					display_name: displayName
				};

				let changes = [];

				user.history =
				JSON.stringify([
					util.getBlankHistoryEntry(actorID,
						{
							actionType: 'create',
							message,
							changes
						})
				]);

				userID = (await table()
					.insert(user)
					.returning('id'))[0].id;

				accountID = await service.account.create(actorID, userID, {firstName, lastName}, { message });

				projectID = await service.project.create(actorID, userID,
				{
					ownerID: userID,
					title: `${user.displayName}'s project`,
					description: 'This is your personal project.  You can add users to collaborate or just skip it and start uploading photos!',
				},
				{ message }
				);

				albumID = await service.album.create(actorID, projectID, 
				{
					owner_id: userID,
					project_id: projectID,
					title: `${user.displayName}'s first album`,
					description: 'This is your first album. Use it to organize and show off your photos!',
				},
				{message}
				);
			}
			/*catch (err)
			{
				if (albumID)
					await service.album.remove(actorID, albumID, false);
				if (projectID)
					await service.project.remove(actorID, projectID, false);
				if (userID)
					await remove(actorID, userID, false);

				console.log(userID, accountID, projectID, albumID);

				throw Error('row for user (or one of its dependencies) failed to insert. Original error follows:' + err.message);
			}*/
			return userID;
		};

	const deactivate = self.deactivate =
		async(actorID, userID) =>
		{
			
		};

	const query = self.query = () => table();

	const remove = self.remove =
		async(actorID, userID, justTrash = true) =>
		{
			debug('removing user.', {actorID, userID, deleteMethod : justTrash ? '(soft)' : '(hard)'})
			let { id : accountID } = await service.account
				.query()
				.where('user_id', userID)
				.first();

			if (accountID)
				await service.account.remove(actorID, accountID, justTrash);

			if (justTrash)
			{
				debug('just trashing.');
				await saveWithHistory(
					actorID,
					userID,
					{ trashed: true },
					{ actionType:'remove' }
				);
			}
			else
			{
				debug('full deleting.');
				await table()
					.del()
					.where('id', userID);
			}
		};

	return self;
};
