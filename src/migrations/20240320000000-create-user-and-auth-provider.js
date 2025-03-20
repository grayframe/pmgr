'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profilePicture: {
        type: Sequelize.STRING
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

    // Create AuthProviders table
    await queryInterface.createTable('AuthProviders', {
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
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      providerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      accessToken: {
        type: Sequelize.STRING
      },
      refreshToken: {
        type: Sequelize.STRING
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

    // Add unique constraint for provider + providerId combination
    await queryInterface.addIndex('AuthProviders', ['provider', 'providerId'], {
      unique: true
    });

    // Create Tags table
    await queryInterface.createTable('Tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      normalizedName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
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

    // Add case-insensitive index on normalizedName
    await queryInterface.addIndex('Tags', ['normalizedName'], {
      unique: true
    });

    // Seed initial tags
    const initialTags = [
      // Core categories
      { name: 'Figure', normalizedName: 'figure', description: 'A person in the photo' },
      { name: 'Location', normalizedName: 'location', description: 'Where the photo was taken' },
      { name: 'Event', normalizedName: 'event', description: 'A specific event or occasion' },
      { name: 'Date', normalizedName: 'date', description: 'When the photo was taken' },
      { name: 'Collection', normalizedName: 'collection', description: 'A group of related photos' },
      
      // Common figure types
      { name: 'Figure: Family', normalizedName: 'figure: family', description: 'Family members' },
      { name: 'Figure: Friends', normalizedName: 'figure: friends', description: 'Friends' },
      { name: 'Figure: Group', normalizedName: 'figure: group', description: 'Group photos' },
      
      // Common location types
      { name: 'Location: Home', normalizedName: 'location: home', description: 'Home or residence' },
      { name: 'Location: School', normalizedName: 'location: school', description: 'School or educational institution' },
      { name: 'Location: Work', normalizedName: 'location: work', description: 'Workplace' },
      { name: 'Location: Vacation', normalizedName: 'location: vacation', description: 'Vacation destination' },
      
      // Common event types
      { name: 'Event: Birthday', normalizedName: 'event: birthday', description: 'Birthday celebration' },
      { name: 'Event: Wedding', normalizedName: 'event: wedding', description: 'Wedding ceremony or reception' },
      { name: 'Event: Holiday', normalizedName: 'event: holiday', description: 'Holiday celebration' },
      { name: 'Event: Graduation', normalizedName: 'event: graduation', description: 'Graduation ceremony' },
      
      // Common date types
      { name: 'Date: 1800s', normalizedName: 'date: 1800s', description: 'Photos from the 1800s' },
      { name: 'Date: 1900s', normalizedName: 'date: 1900s', description: 'Photos from the 1900s' },
      { name: 'Date: 2000s', normalizedName: 'date: 2000s', description: 'Photos from the 2000s' },
      
      // Common collection types
      { name: 'Collection: Family History', normalizedName: 'collection: family history', description: 'Family historical photos' },
      { name: 'Collection: Military Service', normalizedName: 'collection: military service', description: 'Military service photos' },
      { name: 'Collection: Travel', normalizedName: 'collection: travel', description: 'Travel photos' }
    ];

    await queryInterface.bulkInsert('Tags', initialTags.map(tag => ({
      ...tag,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AuthProviders');
    await queryInterface.dropTable('Tags');
    await queryInterface.dropTable('Users');
  }
}; 