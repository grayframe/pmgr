const express = require('express');
const router = express.Router();
const { Album, Photo } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

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
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Photo,
        attributes: ['id', 'url', 'title', 'description', 'createdAt']
      }]
    });
    if (!album) {
      return res.status(404).send('Album not found');
    }
    res.render('album', { album });
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).send('Error fetching album');
  }
});

// Create album
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const album = await Album.create({
      name: req.body.name,
      description: req.body.description || '',
      userId: req.user.id
    });

    // Handle photo associations
    if (req.body.photos) {
      const photoIds = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
      await album.setPhotos(photoIds);
    }

    res.redirect(`/albums/${album.id}`);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).send('Error creating album');
  }
});

// Update album
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!album) {
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
    }

    res.redirect(`/albums/${album.id}`);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).send('Error updating album');
  }
});

// Delete album
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!album) {
      return res.status(404).send('Album not found');
    }

    await album.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ error: 'Error deleting album' });
  }
});

// Edit album page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const album = await Album.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Photo]
    });
    if (!album) {
      return res.status(404).send('Album not found');
    }
    const photos = await Photo.findAll({
      where: { userId: req.user.id }
    });
    res.render('album-edit', { album, photos });
  } catch (error) {
    console.error('Error fetching album for edit:', error);
    res.status(500).send('Error fetching album');
  }
});

// Create album page
router.get('/create', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.findAll({
      where: { userId: req.user.id }
    });
    res.render('album-create', { photos });
  } catch (error) {
    console.error('Error fetching photos for album creation:', error);
    res.status(500).send('Error fetching photos');
  }
});

module.exports = router; 