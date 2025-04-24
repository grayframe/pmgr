const debug = require('debug')('pmgr:presence');
const path = require('path');

module.exports = (pmgr, user, io, socket) =>
{
	let self = Object.create(module.exports);

	socket.on('message', (msg) =>
	{
		debug('Received message:', msg);
		socket.emit('message', `Echo: ${msg}`);
	});

	socket.on('disconnect', () =>
	{
		debug('Client disconnected:', socket.id);
	});

	socket.on('file-upload', async({ name, buffer }) =>
	{
		try
		{
			debug('got file upload request: ' + name);

			let hash = pmgr.mediaLib.receive(buffer);

			// Check for duplicate hash-- redundant with what's done in file manager, but for the fuutre i'll leave it
			// it's possible that at some point files will live on multiple servers.
			const existingPhoto = await pmgr.db.get('photo')
				.where(
					{
						hash: hash,
						project_id: user.project_id
					})
				.first();

			if (existingPhoto)
			{
				//this should be unreachable under normal circumstances, but leaving in as a sanity check
				throw new Error(`A photo with hash ${hash} already exists in this project`);
			}

			// Save to database
			const photoData =
			{
				filename: name,
				title: path.baseName(name),
				path: pmgr.mediaLib.getPath(hash),
				original_name: name,
				hash: hash,
				project_id: user.project_id,
				uploaded_by: user.id,
				uploaded_at: new Date()
			};

			photoData.history = JSON.stringify(
				[{
					uploadedAt : new Date(),
					uploadedBy : user.id,
					newVals : structuredClone(photoData)
				}]);

			let result = await pmgr.db('photos').insert(photoData);

			debug(`Saved: ${name} to ${pmgr.mediaLib.getPath(hash)}`);
			debug(`\tSHA-256: ${hash}`);
			debug(`\tUUID: ${result.id}`);
			socket.emit('upload-status', `Uploaded ${name} (SHA-256: ${hash})`);
		}
		catch (err)
		{
			debug('Upload failed:', err);
			socket.emit('upload-status', `Upload failed: ${err.message}`);
		}
	});

	self.socket = socket;

	return self;
};
