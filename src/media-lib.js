const path = require('path');
const debug = require('debug')('pmgr:media-lib');
const fileType = require('file-type');
const crypto = require('crypto');
const fs = require('fs');

module.exports = (config) =>
{
	const self = Object.create(module.exports);

	let dest = config.dest;
	let types = config.allowedTypes.split(',');

	const getNestedPath = (hash) =>
	{
		let dir1 = hash.substring(0, 2);
		let dir2 = hash.substring(2, 4);
		let dir3 = hash.substring(4, 6);
		return path.join(dir1, dir2, dir3);
	};

	//TODO: use streams instead of buffers, and invoke external program to determine hash and type
	//or maybe peek the first few bytews and keep using filetype, but sha's gotta go.
	self.receive = async(buffer) =>
	{
		let typeRes = await fileType.fromBuffer(buffer);
		if (!types.includes(typeRes.ext))
			throw Error(`file type not allowed: ${typeRes.mime}, extension: ${typeRes.ext}`);

		let ext = typeRes.ext;
		let hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
		let nestedPath = getNestedPath(hash);
		let fullDirPath = path.join(dest, nestedPath);
		let fileName = hash + '.' + ext;

		// Ensure the directory structure exists
		await fs.promises.mkdir(fullDirPath, { recursive: true });

		let fullFilePath = path.join(fullDirPath, fileName);

		// Save file to disk
		await fs.promises.writeFile(fullFilePath, Buffer.from(buffer));

		return nestedPath;
	};

	//don't really know if I'm going to need this honestly.
	const getPath = self.getPath = async(hash) =>
	{
		let nestedPath = getNestedPath(hash);
		let dir = path.join(dest, nestedPath);
		let files = await fs.promises.readdir(dir);
		let match = files.find(file => file.startsWith(hash));
		if (!match)
			throw new Error(`library directory doesn't contain a file with hash: ${hash}`);

		let ext = path.extName(match);
		return path.join(nestedPath, hash + '.' + ext);
	};

	const deleteFile = self.deleteFile = async(hash) =>
	{
		let path = getPath(hash);
		return fs.promises.deleteFile(path.join(dest, getNestedPath(hash)));
	};

	return self;
};

