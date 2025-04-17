'use strict';

const express = require('express');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const path = require('path');
const debug = require('debug')('pmgr:http');

const Presence = require('./presence');

function PMHttp(pmgr)
{
	const self = {};
	const app = express();

	function setupMiddleware()
	{
		// Basic middleware setup
		if (process.env.NODE_ENV !== 'production') {
			debug('init dev server stuff-- statics, vite mw etc');

			[process.env.DIR_VOLATILE, process.env.DIR_STATIC].forEach( p => {
				app.use(express.static(path.isAbsolute(p) ? p : path.join(process.cwd(), p)));
			});

			/*const { createServer: createViteServer } = require('vite');

			(async () => {
				const vite = await createViteServer({
					server: { middlewareMode: 'html' },
					root: path.resolve(__dirname, '../tpl'),
					appType: 'custom', // for full control
					plugins: [
						require('vite-plugin-pug'),
					],
				});

				app.use(vite.middlewares);
			})();*/
		}


		app.use(express.json());
		app.use(express.urlencoded(
		{
			extended: true
		}));
	}

	function setupViews()
	{
		// Configure Pug templating
		app.set('view engine', 'pug');
		app.set('views', path.join(process.cwd(), 'tpl'));
	}

	/*function setupRoutes()
	{
		app.use('/', require('./routes'));
	}*/

	// TODO: figure out how to pass config around.  is process.env better than passing around a config object?
	function start(port = process.env.PORT || 3000, iface = process.env.INTERFACE || '0.0.0.0')
	{
		return new Promise((resolve, reject) => {
			const httpServer = http.createServer(app);
			const io = new SocketIO(httpServer);

			// Example connection handler
			io.on('connection', (socket) => {
				console.log('A client connected:', socket.id);
				Presence(pmgr, null, io, socket);
			});

			httpServer.listen(port, iface, () => {
				console.log(`Server running at http://${iface}:${port}`);
				resolve(httpServer);
			});

			httpServer.on('error', reject);
		});
	}

	// Initialize
	setupMiddleware();
	//setupViews();
	//setupRoutes();

	// Expose public methods
	self.start = start;

	return self;
}

module.exports = PMHttp;
