const express = require('express');
const router = express.Router();
const { Album, Photo } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const debug = require('debug')('p:routes:albums');

// Get albums page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    debug('GET / - Fetching albums for user: %O', { id: req.user.id });
    const albums = await Album.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Photo,
        attributes: ['id', 'url', 'title']
      }],
      order: [['createdAt', 'DESC']]
    });
    debug('GET / - Successfully fetched %d albums', albums.length);
    res.render('albums', { 
      title: 'Your Albums',
      albums,
      user: req.user
    });
  } catch (error) {
    debug('GET / - Error fetching albums: %O', error);
    res.status(500).render('error', { 
      message: 'Error loading albums',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Get all albums
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const albums = await Album.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Photo,
        attributes: ['id', 'url', 'title']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.render('albums', { albums });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).send('Error fetching albums');
  }
});

// Get single album
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('GET /:id - Fetching album: %O', { id: req.params.id, userId: req.user.id });
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Photo,
        attributes: ['id', 'url', 'title', 'description', 'createdAt']
      }]
    });
    if (!album) {
      debug('GET /:id - Album not found: %O', { id: req.params.id });
      return res.status(404).send('Album not found');
    }
    debug('GET /:id - Successfully fetched album with %d photos', album.Photos.length);
    res.render('album', { album });
  } catch (error) {
    debug('GET /:id - Error fetching album: %O', error);
    res.status(500).send('Error fetching album');
  }
});

// Create album
router.post('/', isAuthenticated, async (req, res) => {
  try {
    debug('POST / - Creating album for user: %O', { id: req.user.id, name: req.body.name });
    const album = await Album.create({
      name: req.body.name,
      description: req.body.description || '',
      userId: req.user.id
    });

    // Handle photo associations
    if (req.body.photos) {
      const photoIds = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
      await album.setPhotos(photoIds);
      debug('POST / - Associated album with photos: %O', { photoIds });
    }

    debug('POST / - Successfully created album: %O', { id: album.id });
    res.redirect(`/albums/${album.id}`);
  } catch (error) {
    debug('POST / - Error creating album: %O', error);
    res.status(500).send('Error creating album');
  }
});

// Update album
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('PUT /:id - Updating album: %O', { id: req.params.id, userId: req.user.id });
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!album) {
      debug('PUT /:id - Album not found: %O', { id: req.params.id });
      return res.status(404).send('Album not found');
    }

    await album.update({
      name: req.body.name,
      description: req.body.description
    });

    // Handle photo associations
    if (req.body.photos) {
      const photoIds = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
      await album.setPhotos(photoIds);
      debug('PUT /:id - Updated photo associations: %O', { photoIds });
    }

    debug('PUT /:id - Successfully updated album: %O', { id: album.id });
    res.redirect(`/albums/${album.id}`);
  } catch (error) {
    debug('PUT /:id - Error updating album: %O', error);
    res.status(500).send('Error updating album');
  }
});

// Delete album
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('DELETE /:id - Deleting album: %O', { id: req.params.id, userId: req.user.id });
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!album) {
      debug('DELETE /:id - Album not found: %O', { id: req.params.id });
      return res.status(404).send('Album not found');
    }

    await album.destroy();
    debug('DELETE /:id - Successfully deleted album');
    res.json({ success: true });
  } catch (error) {
    debug('DELETE /:id - Error deleting album: %O', error);
    res.status(500).json({ error: 'Error deleting album' });
  }
});

// Edit album page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    debug('GET /:id/edit - Fetching album for edit: %O', { id: req.params.id, userId: req.user.id });
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Photo]
    });
    if (!album) {
      debug('GET /:id/edit - Album not found: %O', { id: req.params.id });
      return res.status(404).send('Album not found');
    }
    const photos = await Photo.findAll({
      where: { userId: req.user.id }
    });
    debug('GET /:id/edit - Successfully fetched album and photos for edit');
    res.render('album-edit', { album, photos });
  } catch (error) {
    debug('GET /:id/edit - Error fetching album for edit: %O', error);
    res.status(500).send('Error fetching album');
  }
});

// Create album page
router.get('/create', isAuthenticated, async (req, res) => {
  try {
    debug('GET /create - Fetching photos for album creation: %O', { id: req.user.id });
    const photos = await Photo.findAll({
      where: { userId: req.user.id }
    });
    debug('GET /create - Successfully fetched %d photos for album creation', photos.length);
    res.render('album-create', { photos });
  } catch (error) {
    debug('GET /create - Error fetching photos for album creation: %O', error);
    res.status(500).send('Error fetching photos');
  }
});

module.exports = router; 