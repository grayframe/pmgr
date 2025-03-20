const express = require('express');
const router = express.Router();
const { Album, Photo, User } = require('../models');

// REST Endpoints
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'displayName'] },
        { model: Photo, attributes: ['id', 'title', 'url', 'coverPhotoId'] }
      ]
    });
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const album = await Album.create({
      title: req.body.title,
      description: req.body.description,
      userId: req.user.id,
      projectId: req.body.projectId
    });
    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    // Check if user has permission to edit
    if (album.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this album' });
    }

    await album.update({
      title: req.body.title,
      description: req.body.description,
      coverPhotoId: req.body.coverPhotoId,
      lastModified: new Date(),
      lastModifiedBy: req.user.id
    });

    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket handlers
const setupAlbumWebSocket = (io) => {
  io.on('connection', (socket) => {
    // Join an album room
    socket.on('join-album', (albumId) => {
      socket.join(`album:${albumId}`);
      // Notify others in the room about the new presence
      socket.to(`album:${albumId}`).emit('user-joined', {
        userId: socket.user.id,
        displayName: socket.user.displayName
      });
    });

    // Leave an album room
    socket.on('leave-album', (albumId) => {
      socket.leave(`album:${albumId}`);
      // Notify others in the room about the departure
      socket.to(`album:${albumId}`).emit('user-left', {
        userId: socket.user.id
      });
    });

    // Handle album updates
    socket.on('album-update', async (data) => {
      const { albumId, updates } = data;
      
      try {
        const album = await Album.findByPk(albumId);
        if (!album) {
          socket.emit('error', { message: 'Album not found' });
          return;
        }

        // Update the album
        await album.update({
          ...updates,
          lastModified: new Date(),
          lastModifiedBy: socket.user.id
        });

        // Broadcast the update to all users in the album's room
        socket.to(`album:${albumId}`).emit('album-updated', {
          albumId,
          updates: album.toJSON()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle photo reordering in album
    socket.on('album-reorder', async (data) => {
      const { albumId, photoOrder } = data;
      
      try {
        // Update the order of photos in the album
        // This would typically involve updating a position/order field in a join table
        // Implementation depends on your specific needs

        // Broadcast the new order to all users in the album's room
        socket.to(`album:${albumId}`).emit('album-reordered', {
          albumId,
          photoOrder
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
};

module.exports = {
  router,
  setupAlbumWebSocket
}; 