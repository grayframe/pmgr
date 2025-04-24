const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.es2021
			}
		},
		rules: {
			'indent': ['error', 'tab'],
			'brace-style': ['error', 'allman'],
			'linebreak-style': ['error', 'unix'],
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'no-unused-vars': ['warn'],
			'no-console': ['warn'],
			'camelcase': ['error', {properties: 'never'}],
			'arrow-spacing': ['error', {
				before: true, after: true
			}],
			'no-multiple-empty-lines': ['error', {max: 1}],
			'space-before-function-paren': ['error', 'never'],
			'space-before-blocks': ['error', 'always'],
			'keyword-spacing': ['error', {
				before: true, after: true
			}],
			'space-infix-ops': ['error', {int32Hint: false}],
			'comma-spacing': ['error', {
				before: false, after: true
			}],
			'comma-dangle': ['error', 'never'],
			'no-trailing-spaces': 'error',
			'object-curly-newline': ['error', {
				'ObjectExpression': {
					'multiline': true, 'minProperties': 5
				},
				'ObjectPattern': {
					'multiline': false, 'minProperties': 5
				},
				'ImportDeclaration': {
					'multiline': true, 'minProperties': 5
				},
				'ExportDeclaration': {
					'multiline': true, 'minProperties': 5
				}
			}],
			'eol-last': ['error', 'always']
		}
	}
];
