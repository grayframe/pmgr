const { Server: SocketIO } = require('socket.io');

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

	self.socket = socket;

	return self;
};
