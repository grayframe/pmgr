'use strict';

const express = require('express');
const http = require('http');
const {Server: SocketIO} = require('socket.io');
const path = require('path');
const url = require('url');
const debug = require('debug')('pmgr:http');

const QS = require('./quickserver');
const Routes = require('./routes');
const Presence = require('./presence');

function PMHttp(pmgr, config)
{
	const self = Object.create(null);
	const app = express();

	function setupMiddleware()
	{

		//get user stuff
		//validate user, get user object (or from memcache)

		if (process.env.NODE_ENV !== 'production')
		{
			debug('init dev server stuff -- webpack middleware, statics');

			app.use(express.static(config.getStatic()));
			app.use(express.static(config.getVolatile()));

		}

		app.use(express.json());
		let qs = QS(
		{
			volatileDir : config.actual.DIR_VOLATILE,
			libDir : './lib', 
			compilerMap : 
			{
				pug  : require('./compilers/pug'),
				sass : require('./compilers/sass'),
				jsc  : require('./compilers/esbuild')
			}
		});

		app.use(Routes(pmgr));

		app.use(qs);
		app.use(express.urlencoded({extended: true}));
	}

	const start = self.start = (port = process.env.PORT || 3000, iface = config.INTERFACE || '0.0.0.0') =>
	{
		return new Promise((resolve, reject) =>
		{
			let httpServer = http.createServer(app);
			let io = new SocketIO(httpServer, {maxHttpBufferSize: 1e7});

			io.on('upgrade', (request, socket, head) =>
			{
				let { query } = url.parse(request.url, true);
				/*let token = query.token;

				if (validateToken(token))
				{
					wss.handleUpgrade(request, socket, head, (ws) =>
					{
						wss.emit('connection', ws, request);
					});
				}
				else
				{
					socket.destroy();
				}*/
			});

			io.on('connection', (socket) =>
			{
				console.log('A client connected:', socket.id);
				Presence(pmgr, null, io, socket);
			});

			httpServer.listen(port, iface, () =>
			{
				console.log(`Server running at http://${iface}:${port}`);
				resolve(httpServer);
			});

			httpServer.on('error', reject);
		});
	};

	setupMiddleware();

	self.start = start;
	return self;
}

module.exports = PMHttp;
