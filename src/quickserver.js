const Express    = require('express');
const path       = require('path');
const fs         = require('fs');
const debug      = require('debug')('pmgr:quickserver');

const getAbsPath = loc =>
	path.isAbsolute(loc) ?
		loc :
		path.join(process.cwd(), loc);

module.exports = (
	{
		compilerMap,
		libDir,
		volatileDir,
		writeToDiskOnAccess = false,
		watch = true
	} ) =>
{
	debug(libDir, volatileDir);
	//sanity checks
	if (!libDir)
		throw Error('param libDir is required.');
	if (writeToDiskOnAccess && !volatileDir)
		throw Error('param volatileDir is required when writing to disk is requested.');

	const typeMap = Object.create(null);

	Object.keys(compilerMap).forEach(key => typeMap[compilerMap[key].destType] = key);

	const lib        = getAbsPath(libDir);
	const volatile   = getAbsPath(volatileDir);

	debug('init quickserver, lib dir:' + libDir + writeToDiskOnAccess ? ' volatileDir:' + volatile : '');

	const self       = Express.Router();
	const cache      = Object.create(null);
	const builtFiles = Object.create(null);
	const watchers   = Object.create(null);

	const handler = (req, res, next) =>
	{
		debug('serving request: ' + req.path);

		let destFilename = req.path;
		if (destFilename[destFilename.length - 1] === '/')
			destFilename += 'index.html';
		let destExtname = path.extname(destFilename).substring(1);
		let srcExtname  = typeMap[destExtname];
		let srcFilename = destFilename.replace(destExtname, typeMap[destExtname]);
		let srcFilepath = path.join(lib, srcFilename);

		if (!Object.keys(typeMap).includes(destExtname))
		{
			debug('nothin doin, passing the buck: ' + req.path);
			return next();
		}
		if (writeToDiskOnAccess && builtFiles[srcFilepath])
		{
			debug('src already compiled, forwarding to static handler: ' + srcFilename);
			return next();
		}
		if (cache[srcFilepath])
		{
			debug('serving from cache: ' + srcFilename);
			res.type(destExtname);
			return res.send(cache[srcFilepath] + '\n');
		}

		return fs.promises.access(srcFilepath)
			.then(async() =>
			{
				return await compilerMap[srcExtname](srcFilepath);
			})
			.then(async(content) =>
			{
				if (writeToDiskOnAccess)
				{
					let destFilepath = path.join(volatile, destFilename);
					debug('writing compiled content to disk: ' + destFilepath);
					await fs.promises.mkdir(path.dirname(destFilepath), { recursive: true });
					await fs.promises.writeFile(destFilepath, content);
					builtFiles[srcFilepath] = true;
				}
				else
				{
					debug('caching compiled content in memory: ' + srcFilename);
					cache[srcFilepath] = content;
				}

				if (watch)
					watchFile(srcFilepath);

				return res.send(content + '\n');
			})
			.catch(err =>
			{
				debug('error after trying to build:', err);
				debug('file not found: ' + srcFilename);
				next(Error('404 Not Found'));
			});
	};

	const watchFile = f =>
	{
		if (watchers[f])
			return;

		const watcher = fs.watch(f, (eventType) =>
		{
			if (eventType === 'change')
			{
				if (writeToDiskOnAccess)
				{
					debug('source file changed, marking compiled volatile as stale: ' + f);
					builtFiles[f] = false;
				}
				if (cache[f])
				{
					debug('source file changed, invalidating memory cache: ' + f);
					delete cache[f];
				}
			}
		});
		watchers[f] = watcher;
	};

	const dispose = self.dispose = () =>
	{
		if (watch)
			for (const filename in watchers)
				watchers[filename].close();
	};

	try
	{
		if (writeToDiskOnAccess)
			self.use(Express.static(volatile));

		self.use(handler);
	}
	catch (e)
	{
		dispose();
		throw e;
	}

	return self;
};

