const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Photo, Album } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const sharp = require('sharp');
const debug = require('debug')('p:routes:photos');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      debug('Multer storage error: %O', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      debug('Invalid file type: %O', { mimetype: file.mimetype });
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get photos page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    debug('GET / - Fetching photos for user: %O', { id: req.user.id });
    const photos = await Photo.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    debug('GET / - Successfully fetched %d photos', photos.length);
    res.render('photos', { 
      title: 'Your Photos',
      photos,
      user: req.user
    });
  } catch (error) {
    debug('GET / - Error fetching photos: %O', error);
    res.status(500).render('error', { 
      message: 'Error loading photos',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Get single photo
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('GET /:id - Fetching photo: %O', { id: req.params.id, userId: req.user.id });
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Album]
    });
    if (!photo) {
      debug('GET /:id - Photo not found: %O', { id: req.params.id });
      return res.status(404).send('Photo not found');
    }
    const albums = await Album.findAll({
      where: { userId: req.user.id }
    });
    debug('GET /:id - Successfully fetched photo and albums');
    res.render('photo', { photo, albums });
  } catch (error) {
    debug('GET /:id - Error fetching photo: %O', error);
    res.status(500).send('Error fetching photo');
  }
});

// Upload photo
router.post('/', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      debug('POST / - No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    debug('POST / - Processing photo upload: %O', { 
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Process image with sharp
    const image = sharp(req.file.path);
    const metadata = await image.metadata();

    // Create photo record
    const photo = await Photo.create({
      title: req.body.title || path.parse(req.file.originalname).name,
      description: req.body.description || '',
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      width: metadata.width,
      height: metadata.height,
      userId: req.user.id
    });

    // Handle album associations
    if (req.body.albums) {
      const albumIds = Array.isArray(req.body.albums) ? req.body.albums : [req.body.albums];
      await photo.setAlbums(albumIds);
      debug('POST / - Associated photo with albums: %O', { albumIds });
    }

    debug('POST / - Successfully uploaded photo: %O', { id: photo.id });
    res.json(photo);
  } catch (error) {
    debug('POST / - Error uploading photo: %O', error);
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

// Update photo
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('PUT /:id - Updating photo: %O', { id: req.params.id, userId: req.user.id });
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!photo) {
      debug('PUT /:id - Photo not found: %O', { id: req.params.id });
      return res.status(404).send('Photo not found');
    }

    await photo.update({
      title: req.body.title,
      description: req.body.description
    });

    // Handle album associations
    if (req.body.albums) {
      const albumIds = Array.isArray(req.body.albums) ? req.body.albums : [req.body.albums];
      await photo.setAlbums(albumIds);
      debug('PUT /:id - Updated album associations: %O', { albumIds });
    }

    debug('PUT /:id - Successfully updated photo: %O', { id: photo.id });
    res.redirect(`/photos/${photo.id}`);
  } catch (error) {
    debug('PUT /:id - Error updating photo: %O', error);
    res.status(500).send('Error updating photo');
  }
});

// Delete photo
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    debug('DELETE /:id - Deleting photo: %O', { id: req.params.id, userId: req.user.id });
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!photo) {
      debug('DELETE /:id - Photo not found: %O', { id: req.params.id });
      return res.status(404).send('Photo not found');
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '../../', photo.url);
    await fs.unlink(filePath);
    debug('DELETE /:id - Deleted file from storage: %O', { filePath });

    // Delete photo record
    await photo.destroy();
    debug('DELETE /:id - Successfully deleted photo record');

    res.json({ success: true });
  } catch (error) {
    debug('DELETE /:id - Error deleting photo: %O', error);
    res.status(500).json({ error: 'Error deleting photo' });
  }
});

// Edit photo page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    debug('GET /:id/edit - Fetching photo for edit: %O', { id: req.params.id, userId: req.user.id });
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Album]
    });
    if (!photo) {
      debug('GET /:id/edit - Photo not found: %O', { id: req.params.id });
      return res.status(404).send('Photo not found');
    }
    const albums = await Album.findAll({
      where: { userId: req.user.id }
    });
    debug('GET /:id/edit - Successfully fetched photo and albums for edit');
    res.render('photo-edit', { photo, albums });
  } catch (error) {
    debug('GET /:id/edit - Error fetching photo for edit: %O', error);
    res.status(500).send('Error fetching photo');
  }
});

// Upload page
router.get('/upload', isAuthenticated, (req, res) => {
  debug('GET /upload - Rendering upload page for user: %O', { id: req.user.id });
  res.render('upload', { 
    title: 'Upload Photo',
    user: req.user
  });
});

module.exports = router; 