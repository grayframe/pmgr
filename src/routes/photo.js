const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Photo, User } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// REST Endpoints
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'displayName'] }]
    });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const photo = await Photo.create({
      title: req.body.title,
      description: req.body.description,
      url: `/uploads/${req.file.filename}`,
      userId: req.user.id,
      projectId: req.body.projectId
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Check if user has permission to edit
    if (photo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this photo' });
    }

    await photo.update({
      title: req.body.title,
      description: req.body.description,
      metadata: req.body.metadata,
      lastModified: new Date(),
      lastModifiedBy: req.user.id
    });

    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket handlers
const setupPhotoWebSocket = (io) => {
  io.on('connection', (socket) => {
    // Join a room for a specific photo
    socket.on('join-photo', (photoId) => {
      socket.join(`photo:${photoId}`);
      // Notify others in the room about the new presence
      socket.to(`photo:${photoId}`).emit('user-joined', {
        userId: socket.user.id,
        displayName: socket.user.displayName
      });
    });

    // Leave a photo room
    socket.on('leave-photo', (photoId) => {
      socket.leave(`photo:${photoId}`);
      // Notify others in the room about the departure
      socket.to(`photo:${photoId}`).emit('user-left', {
        userId: socket.user.id
      });
    });

    // Handle photo metadata updates
    socket.on('photo-update', async (data) => {
      const { photoId, updates } = data;
      
      try {
        const photo = await Photo.findByPk(photoId);
        if (!photo) {
          socket.emit('error', { message: 'Photo not found' });
          return;
        }

        // Update the photo
        await photo.update({
          ...updates,
          lastModified: new Date(),
          lastModifiedBy: socket.user.id
        });

        // Broadcast the update to all users in the photo's room
        socket.to(`photo:${photoId}`).emit('photo-updated', {
          photoId,
          updates: photo.toJSON()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle presence updates
    socket.on('presence-update', (data) => {
      const { photoId, status } = data;
      socket.to(`photo:${photoId}`).emit('presence-updated', {
        userId: socket.user.id,
        displayName: socket.user.displayName,
        status
      });
    });
  });
};

module.exports = {
  router,
  setupPhotoWebSocket
}; 