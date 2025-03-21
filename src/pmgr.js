const PMgr = function (config)
{
	let self = Object.create(null);

	self._config = config;

	let _db = require('./db')(self);
	let _models = require('./models')(self);

	self.dispose = function ()
	{
		_db.dispose();
	};

	return self;
};

module.exports = PMgr;
