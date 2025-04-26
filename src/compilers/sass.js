const sass  = require('sass');
const debug = require('debug')('pmgr:compilers:sass');

module.exports = filename =>
{
	debug('compiling Sass to CSS: ' + filename);
	const result = sass.compile(filename);
	return result.css;
};

module.exports.destType = 'css';
