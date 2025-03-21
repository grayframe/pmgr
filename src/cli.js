#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { program } = require('commander');
const { User, Photo, AuthProvider, sequelize } = require('./models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Debug database configuration
console.log('Database Configuration:', {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT || 'postgres'
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

program
  .version('1.0.0')
  .description('Photo Manager CLI');

// User management commands
program
  .command('user:create')
  .description('Create a new user')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-p, --password <password>', 'User password')
  .requiredOption('-n, --name <name>', 'User name')
  .option('-d, --display-name <displayName>', 'Display name (defaults to name if not specified)')
  .action(async (options) => {
    try {
      const hashedPassword = await bcrypt.hash(options.password, 10);
      
      // Create user
      const user = await User.create({
        email: options.email,
        displayName: options.displayName || options.name
      });

      // Create auth provider
      await AuthProvider.create({
        userId: user.id,
        provider: 'local',
        providerId: options.email,
        profileData: { passwordHash: hashedPassword },
        isPrimary: true
      });

      console.log('User created successfully:', user.email);
    } catch (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }
    process.exit(0);
  });

program
  .command('user:list')
  .description('List all users')
  .action(async () => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'displayName', 'createdAt']
      });
      console.table(users.map(user => user.toJSON()));
    } catch (error) {
      console.error('Error listing users:', error.message);
      process.exit(1);
    }
    process.exit(0);
  });

program
  .command('user:delete')
  .description('Delete a user')
  .requiredOption('-e, --email <email>', 'User email')
  .action(async (options) => {
    try {
      const user = await User.findOne({ where: { email: options.email } });
      if (!user) {
        console.error('User not found');
        process.exit(1);
      }
      await user.destroy();
      console.log('User deleted successfully:', options.email);
    } catch (error) {
      console.error('Error deleting user:', error.message);
      process.exit(1);
    }
    process.exit(0);

  });

// Photo search commands
program
  .command('photo:search')
  .description('Search photos')
  .option('-q, --query <query>', 'Search query (searches title and description)')
  .option('-u, --user <email>', 'Filter by user email')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(async (options) => {
    try {
      const where = {};
      
      if (options.query) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${options.query}%` } },
          { description: { [Op.iLike]: `%${options.query}%` } }
        ];
      }

      if (options.user) {
        const user = await User.findOne({ where: { email: options.user } });
        if (!user) {
          console.error('User not found');
          process.exit(1);
        }
        where.userId = user.id;
      }

      const photos = await Photo.findAll({
        where,
        include: [{
          model: User,
          attributes: ['email', 'name']
        }],
        limit: parseInt(options.limit),
        order: [['createdAt', 'DESC']]
      });

      console.table(photos.map(photo => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        user: photo.User.email,
        createdAt: photo.createdAt,
        url: photo.url
      })));
    } catch (error) {
      console.error('Error searching photos:', error.message);
      process.exit(1);
    }
    process.exit(0);
  });

program.parse(process.argv); 