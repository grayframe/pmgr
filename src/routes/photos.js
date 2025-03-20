const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Photo, Album } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const sharp = require('sharp');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
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
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all photos
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.render('index', { photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).send('Error fetching photos');
  }
});

// Get single photo
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Album]
    });
    if (!photo) {
      return res.status(404).send('Photo not found');
    }
    const albums = await Album.findAll({
      where: { userId: req.user.id }
    });
    res.render('photo', { photo, albums });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).send('Error fetching photo');
  }
});

// Upload photo
router.post('/', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

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
    }

    res.json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

// Update photo
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!photo) {
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
    }

    res.redirect(`/photos/${photo.id}`);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).send('Error updating photo');
  }
});

// Delete photo
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '../../', photo.url);
    await fs.unlink(filePath);

    // Delete photo record
    await photo.destroy();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Error deleting photo' });
  }
});

// Edit photo page
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [Album]
    });
    if (!photo) {
      return res.status(404).send('Photo not found');
    }
    const albums = await Album.findAll({
      where: { userId: req.user.id }
    });
    res.render('photo-edit', { photo, albums });
  } catch (error) {
    console.error('Error fetching photo for edit:', error);
    res.status(500).send('Error fetching photo');
  }
});

module.exports = router; 