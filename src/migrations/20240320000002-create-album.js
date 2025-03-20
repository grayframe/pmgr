'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Albums table
    await queryInterface.createTable('Albums', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create AlbumPhotos join table
    await queryInterface.createTable('AlbumPhotos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      albumId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Albums',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      photoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Photos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint for album + photo combination
    await queryInterface.addIndex('AlbumPhotos', ['albumId', 'photoId'], {
      unique: true
    });

    // Add GIN index for tags array
    await queryInterface.sequelize.query(
      'CREATE INDEX albums_tags_idx ON "Albums" USING GIN (tags)'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AlbumPhotos');
    await queryInterface.dropTable('Albums');
  }
}; 