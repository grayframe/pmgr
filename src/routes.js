'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>
{
	res.render('index');
});

router.get('/auth', (req, res) =>
{
	res.render('auth');
});

router.get('/photos', (req, res) =>
{
	res.render('photos');
});

router.get('/tags', (req, res) =>
{
	res.render('tags');
});

module.exports = router;
