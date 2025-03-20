const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Photo = sequelize.define('Photo', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastModifiedBy: {
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    }
  });

  // Add hooks for real-time updates
  Photo.addHook('afterUpdate', async (photo) => {
    // This will be used to emit WebSocket events when a photo is updated
    // The actual WebSocket emission will be handled in the routes
  });

  return Photo;
}; 