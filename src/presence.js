const SocketIO = require('socket.io').server;
const debug = require('debug')('pmgr:presence');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

	socket.on('file-upload', async({name, buffer}) =>
	{
		try
		{
			debug('got file upload request: ' + name);

			const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
			const extension = path.extname(name);
			const hashedFilename = hash + extension;

			// Check for duplicate hash
			const existingPhoto = await pmgr.db('photo')
				.where({
					hash: hash,
					project_id: user.project_id
				})
				.first();

			if (existingPhoto)
			{
				throw new Error(`A photo with hash ${hash} already exists in this project`);
			}

			// Create nested directory structure using first 6 characters of hash
			// This creates a structure like: /volatile/ab/cd/ef/abcdef1234...jpg
			const dir1 = hash.substring(0, 2);
			const dir2 = hash.substring(2, 4);
			const dir3 = hash.substring(4, 6);
			const nestedPath = path.join(dir1, dir2, dir3);
			const fullDirPath = path.join(pmgr.config.getVolatile(), 'uploads', nestedPath);

			// Ensure the directory structure exists
			await fs.promises.mkdir(fullDirPath, { recursive: true });

			const filePath = path.join(fullDirPath, hashedFilename);

			// Save file to disk
			await fs.promises.writeFile(filePath, Buffer.from(buffer));

			// Save to database
			const photoData = {
				filename: hashedFilename,
				title: name.slice(0, -3),
				path: nestedPath,
				original_name: name,
				hash: hash,
				project_id: user.project_id,
				uploaded_by: user.id,
				uploaded_at: new Date()
			};

			let result = await pmgr.db('photo').insert(photoData);

			debug(`Saved: ${filePath}`);
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
