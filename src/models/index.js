const { Sequelize } = require('sequelize');

console.log('Models Database Configuration:', {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT || 'postgres'
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const models = {
  User: require('./user')(sequelize),
  AuthProvider: require('./authProvider')(sequelize),
  Photo: require('./photo')(sequelize),
  Album: require('./album')(sequelize),
  Project: require('./project')(sequelize)
};

// Define relationships
// User relationships
models.User.hasMany(models.AuthProvider);
models.AuthProvider.belongsTo(models.User);

models.User.hasMany(models.Photo);
models.Photo.belongsTo(models.User);

models.User.hasMany(models.Album);
models.Album.belongsTo(models.User);

// Project relationships
models.Project.hasMany(models.Photo);
models.Photo.belongsTo(models.Project);

models.Project.hasMany(models.Album);
models.Album.belongsTo(models.Project);

models.Project.belongsToMany(models.User, { through: 'ProjectUsers' });
models.User.belongsToMany(models.Project, { through: 'ProjectUsers' });

module.exports = {
  sequelize,
  ...models
}; 