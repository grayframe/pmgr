const { expect } = require('chai');
const MediaLib = require('../src/media-lib');

describe('MediaLib', () =>
{
	let lib;

	beforeEach(() =>
	{
		lib = MediaLib({ dest: '/tmp', allowedTypes : 'jpg,png' });
	});

	it('initializes with a config', () =>
	{
		expect(lib.getConfig()).to.deep.equal({ dest: '/tmp', allowedTypes : 'jpg,png' });
	});

	it('adds and retrieves files', () =>
	{
		expect(lib.getFiles()).to.deep.equal(['foo.txt', 'bar.txt']);
	});

	it('clears files', () =>
	{
	});
});
