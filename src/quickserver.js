const Express    = require('express');
const path       = require('path');
const fs         = require('fs');
const pug        = require('pug');
const sass       = require('sass');
const esbuild    = require('esbuild');
const debug      = require('debug')('karass:quickserver');

module.exports = ( {rootDir, staticDir, volatileDir} ) =>
{
	let self = Express.Router();

	debug('init quickserver, root dir:' + rootDir);

	const handler = async(req, res, next) =>
	{
		debug('serving request: ' + req.path);

		let virtFilename = path.join(rootDir, req.path);
		if (virtFilename[virtFilename.length -1] === '/')
			virtFilename += 'index.html';
		let reqExtname = path.extname(virtFilename).substring(1);
		let extname = typeMap[reqExtname];
		let filename = virtFilename.replace(reqExtname, extname);

		if (!['pug', 'sass', 'jsc'].includes(extname))
		{
			debug('nothin doin, passing the buck: ' + req.path);
			return next();
		}

		if (!await fs.promises.access(filename).catch(()=>true))
			return res.send(compilerMap[extname](filename));
		else
			return next(Error('404 Not Found'));
	};

	const compilePug = self.compilePug = 
		(filename) =>
	{
		debug('compiling HTML file: ' + filename);
		return 'trying html';
	};
	const compileSass = self.compileSass =
		(filename) =>
	{
		debug('compiling CSS: ' + filename);
		return 'trying css';
	};
	const compileJSc = self.compileJSc =
		(filename) =>
	{
		debug('compiling JSc: ' + filename);
		return 'trying js';
	};

	let typeMap = 
	{
		html : 'pug',
		css  : 'sass',
		js   : 'jsc',
	};

	let compilerMap = 
	{
		pug  : compilePug,
		sass : compileSass,
		jsc  : compileJSc,
	};

	self.use(handler);

	return self;
};

