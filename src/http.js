'use strict';

const express = require('express');
const http = require('http');
const {Server: SocketIO} = require('socket.io');
const path = require('path');
const url = require('url');
const debug = require('debug')('pmgr:http');

const Presence = require('./presence');

function PMHttp(pmgr, config)
{
	const self = Object.create(null);
	const app = express();

	function setupMiddleware()
	{
		if (process.env.NODE_ENV !== 'production')
		{
			debug('init dev server stuff -- webpack middleware, statics');
			app.use(express.static(config.getStatic()));
			app.use(express.static(config.getVolatile()));

			const webpack = require('webpack');
			const webpackDevMiddleware = require('webpack-dev-middleware');
			const compiler = webpack(require('../webpack.config.js'));

			app.use(
				webpackDevMiddleware(compiler, {
					publicPath: '/',
					writeToDisk: false
				})
			);

			/*app.use((req, res, next) => {
				// Force / to index.html (compiled from pug)
				if (req.url === '/' || req.url === '/index.html') {
					req.url = '/index.html';
				}
				next();
			});*/
		}

		app.use(express.json());
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
