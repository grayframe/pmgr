const esbuild = require('esbuild');
const debug   = require('debug')('pmgr:compilers:esbuild');

module.exports = async filename =>
{
	debug('compiling JSC to JS: ' + filename);
	const result = await esbuild.build(
		{
			entryPoints: [filename],
			bundle: true,
			write: false,
			format: 'iife',
			loader : { '.jsc' : 'js' }
		});
	return result.outputFiles[0].text;
};

module.exports.destType = 'js';
