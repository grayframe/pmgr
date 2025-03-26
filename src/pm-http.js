'use strict';

const express = require('express');
const path = require('path');

function PMHttp(pmgr)
{
	const self = {};
	const app = express();

	function setupMiddleware()
	{
		// Basic middleware setup
		app.use(express.json());
		app.use(express.urlencoded({
			extended: true
		}));
	}

	function setupViews()
	{
		// Configure Pug templating
		app.set('view engine', 'pug');
		app.set('views', path.join(process.cwd(), 'tpl'));
	}

	function setupRoutes()
	{
		app.use('/', require('./routes'));
	}

	function start(port = process.env.PORT, host = process.env.HOST)
	{
		return new Promise((resolve, reject) =>
		{
			const server = app.listen(port, () =>
			{
				console.log(`Server running on port ${port}`);
				resolve(server);
			});

			server.on('error', (err) =>
			{
				reject(err);
			});
		});
	}

	// Initialize
	setupMiddleware();
	setupViews();
	setupRoutes();

	// Expose public methods
	self.start = start;

	return self;
}

module.exports = PMHttp;
