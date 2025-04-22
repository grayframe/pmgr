'use strict';

const express = require('express');
const http = require('http');
const {
	Server: SocketIO
} = require('socket.io');
const path = require('path');
const debug = require('debug')('pmgr:http');

const Presence = require('./presence');

function PMHttp(pmgr)
{
	const self = {};
	const app = express();

	function setupMiddleware()
	{
		if (process.env.NODE_ENV !== 'production')
		{
			debug('init dev server stuff -- webpack middleware, statics');
			app.use(express.static(pmgr.config.getStatic()));
			app.use(express.static(pmgr.config.getVolatile()));

			const webpack = require('webpack');
			const webpackDevMiddleware = require('webpack-dev-middleware');
			const config = require('../webpack.config.js');

			const compiler = webpack(config);

			app.use(
				webpackDevMiddleware(compiler, {
					publicPath: '/', // Serve from root
					writeToDisk: false // Keep in-memory
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
		app.use(express.urlencoded({
			extended: true
		}));
	}

	function start(port = process.env.PORT || 3000, iface = process.env.INTERFACE || '0.0.0.0')
	{
		return new Promise((resolve, reject) =>
		{
			const httpServer = http.createServer(app);
			const io = new SocketIO(httpServer);

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
	}

	setupMiddleware();

	self.start = start;
	return self;
}

module.exports = PMHttp;
