const express = require('express');
const router = express.Router();
const { Project, User, Photo, Album } = require('../models');

// REST Endpoints
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'displayName', 'profilePicture'] },
        { model: Photo, attributes: ['id', 'title', 'url', 'coverPhotoId'] },
        { model: Album, attributes: ['id', 'title', 'description', 'coverPhotoId'] }
      ]
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      ownerId: req.user.id,
      settings: req.body.settings || {}
    });
    
    // Add the creator as a project member
    await project.addUser(req.user.id);
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has permission to edit
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this project' });
    }

    await project.update({
      name: req.body.name,
      description: req.body.description,
      settings: req.body.settings,
      status: req.body.status
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project member management
router.post('/:id/members', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { userId } = req.body;
    await project.addUser(userId);
    
    res.json({ message: 'User added to project' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.removeUser(req.params.userId);
    res.json({ message: 'User removed from project' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket handlers
const setupProjectWebSocket = (io) => {
  io.on('connection', (socket) => {
    // Join a project room
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      // Notify others in the room about the new presence
      socket.to(`project:${projectId}`).emit('user-joined', {
        userId: socket.user.id,
        displayName: socket.user.displayName
      });
    });

    // Leave a project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
      // Notify others in the room about the departure
      socket.to(`project:${projectId}`).emit('user-left', {
        userId: socket.user.id
      });
    });

    // Handle project updates
    socket.on('project-update', async (data) => {
      const { projectId, updates } = data;
      
      try {
        const project = await Project.findByPk(projectId);
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        // Update the project
        await project.update({
          ...updates,
          lastModified: new Date(),
          lastModifiedBy: socket.user.id
        });

        // Broadcast the update to all users in the project's room
        socket.to(`project:${projectId}`).emit('project-updated', {
          projectId,
          updates: project.toJSON()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle member updates
    socket.on('member-update', async (data) => {
      const { projectId, userId, action } = data;
      
      try {
        const project = await Project.findByPk(projectId);
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        if (action === 'add') {
          await project.addUser(userId);
        } else if (action === 'remove') {
          await project.removeUser(userId);
        }

        // Broadcast the member update to all users in the project's room
        socket.to(`project:${projectId}`).emit('member-updated', {
          projectId,
          userId,
          action
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
};

module.exports = {
  router,
  setupProjectWebSocket
}; 