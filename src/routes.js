const express = require('express');

const ID = require('./misc/short-id');
//const renderers = require('./renderers');

module.exports = ({service}) => 
{
	const self = express.Router();

	self.get('/auth', (req, res) =>
	{
	});

	self.post('/auth', (req, res) =>
	{
	});

	self.get('/:projectID/photos/:photoID.:ext(html|json)?', async (req, res) =>
	{
		let photoID = ID.decode(req.params.photoID);
		let projectID = ID.decode(req.params.projectID);
		let ext = req.params.ext;

		let photo = service.photo.get(photoID);

		/*if (!await service.permission.userCan({actorID, projectID, action : 'view'}))
			{
				next(Error('not allowed.'));
			} */


		return res.send(res.json(photo));
	});

	self.get('/projects/:projectID', async (req, res) =>
	{
		let projectID = ID.decode(req.params.projectID);

		let project = service.project.get(projectID);
		
		let ctx = { project };
	});

	self.get('/users/:userID', (req, res) =>
	{

	});

	self.get('/:projectID/photos/', async (req, res) =>
	{
		//TODO: figure out what queries are valid.
		let { query, user } = req;

	});

	self.get('/:projectID/albums/', async (req, res) =>
	{
		//TODO: figure out what queries are valid.
		let { query, user } = req;

	});

	self.get('/:projectID/albums/:albumID', async (req, res) =>
		{
			//TODO: figure out what queries are valid.
			let { query, user } = req;
	
		});
	
	return self;
};

const render = (item, ext) =>
{
	switch (ext)
	{
		case 'html':
			break;
		case 'json':
			break;
	}

};