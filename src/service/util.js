const debug = require('debug')('pmgr:service:util');

//MUST be run before saving object.
const saveWithHistory = module.exports.saveWithHistory = (service, tableName) =>
	async(actorID, objectID, newObject, {actionType='update', message='generic update'}) =>
{
	let table = service[tableName]._table;

	let oldObject = await table()
		.select(Object.keys(newObject).join(','), 'id')
		.where('id', objectID)
		.first();

	let update = { history: oldObject.history || [] };

	let changes = getChanges(oldObject, newObject);

	let histEntry = getBlankHistoryEntry(actorID, {actionType, message, changes});

	update.history.push(histEntry);

	Object.keys(update)
		.forEach(key => 
		{
			if (Array.isArray(update[key]))
				update[key] = JSON.stringify(update[key])
		});

	await table()
		.update(update)
		.where('id', objectID);
};

//TODO: it seems important to standardize this somewhere.  if this was
//typescript this is where I'd do a schema (I forget what they call it)
//but I'm free of that hassle.  still, having it set in stone and having
//a single source of truth would be nice.  Maybe oh just realize that THIS 
//should be the only file where these entries are created, got it nvm
const getBlankHistoryEntry = module.exports.getBlankHistoryEntry = 
	(actorID, {actionType, message=actionType, changes=[]}) =>
{
	if (!actionType)
		throw Error('actionType is required for history entry!');

	let histEntry = 
	{
		date: new Date().toISOString(),
		actorID: actorID,
		changes: changes,
		actionType: actionType,
		message: message
	};
	return histEntry;
};

const isPrimitive = (value) => (value === null || typeof value !== 'object' && typeof value !== 'function');

const getChanges = (oldObject, newObject) =>
{
	let changes = [];
	let update = {};

	Object.keys(newObject)
		.filter(key => key !== 'id' && key !== 'history')
		.forEach(key => 
		{
			/* TODO: for now, just filter out non-primitives. I think most of them are going to need custom handlers to log 
			history.  actually... I should probably build a deep inspection method, that can go into subkeys and report 
			changes inside, i.e { key : 'preferences.timeout', old : 10, new : 5 }.
			dunno how to handle arrays. ah maybe something like:
			 for adding a new entry inside 
			 { key : "addresses[]", old : null, new : <full json> }
			
			 for changing one: 
			 { key : 'phone_numbers[1].areacode', old : 615, new : 423 }
			 the indexes I'm pretty sure aren't guaranteed to be consistent, but maybe this will give enough of an idea.
			 */
			if (!isPrimitive(newObject[key]))
				return;

			//sanity check...  this should never run if I use it right elsewhere
			if (newObject[key] === oldObject[key])
			{
				debug('warn: new value for object matches old, not recording.');
				return;
			}

			let change =
			{
				key: key,
				old: oldObject[key],
				new: newObject[key]
			};

			changes.push(change);
			update[key] = newObject[key];
		});

	return { changes, update };
};

const logCustomHistory = module.exports.logCustomHistory = (service, tableName) =>
	async(actorID, objectID, {actionType, message, changes}) =>
{
	let table = service[tableName];
	let histEntry = getBlankHistoryEntry(actorID, {actionType, message, changes});
	let object = await table
		.select('history')
		.where('id', objectID)
		.first();

	object.history = object.history || [];
	object.history.push(histEntry);

	object.history = JSON.stringify(object.history);

	await table
		.update(object)
		.where('id', objectID);

	return;
};