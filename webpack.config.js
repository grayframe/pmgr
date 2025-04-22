const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TPL_DIR = path.resolve(__dirname, 'tpl');

// Get all JS files in tpl/ as entry points
const entry = {};
fs.readdirSync(TPL_DIR).forEach(file => {
	if (file.endsWith('.js')) {
		const name = path.basename(file, '.js');
		entry[name] = path.join(TPL_DIR, file);
	}
});

const htmlPlugins = Object.keys(entry).map(name => {
	return new HtmlWebpackPlugin({
		filename: `${name}.html`,
		template: path.join(TPL_DIR, `${name}.pug`),
		chunks: [name], // only include the matching JS bundle
		inject: 'body',
	});
});

module.exports = {
	mode: 'development',
	entry,
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader', // optional
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			{
				test: /\.pug$/,
				use: ['pug-loader'],
			},
		],
	},
	//plugins: htmlPlugins,
};