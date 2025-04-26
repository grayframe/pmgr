const pug   = require('pug');
const debug = require('debug')('pmgr:compilers:pug');

module.exports = (filename, context = {}) =>
{
	debug('compiling Pug to HTML: ' + filename);
	const compiledFn = pug.compileFile(filename);
	return compiledFn(context);
};

module.exports.destType = 'html';
