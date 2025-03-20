const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Album = sequelize.define('Album', {
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
    coverPhotoId: {
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastModifiedBy: {
      type: DataTypes.UUID
    }
  });

  return Album;
}; 