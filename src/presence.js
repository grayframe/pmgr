const {
	Server: SocketIO
} = require('socket.io');
const debug = require('debug')('pmgr:presence');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = (pmgr, user, io, socket) =>
{
	let self = Object.create(module.exports);

	socket.on('message', (msg) =>
	{
		console.log('Received message:', msg);
		socket.emit('message', `Echo: ${msg}`);
	});

	socket.on('disconnect', () =>
	{
		console.log('Client disconnected:', socket.id);
	});

	socket.on('file-upload', async({
		name, buffer
	}) =>
	{
		try
		{
			debug('got file upload request: ' + name);

			const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
			console.log(pmgr.config.getVolatile());

			const filePath = path.join(pmgr.config.getVolatile(), name);

			fs.writeFile(filePath, Buffer.from(buffer), (err) =>
			{
				if (err)
				{
					console.error('Error saving file:', err);
					socket.emit('upload-status', 'Error saving file.');
					return;
				}
				console.log(`Saved: ${filePath}`);
				console.log(`SHA-256: ${hash}`);
				socket.emit('upload-status', `Uploaded ${name} (SHA-256: ${hash})`);
			});
		}
		catch (err)
		{
			console.error('Upload failed:', err);
			socket.emit('upload-status', 'Upload failed.');
		}
	});

	self.socket = socket;

	return self;
};
