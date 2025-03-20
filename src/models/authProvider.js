const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuthProvider = sequelize.define('AuthProvider', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., "facebook", "google", "email"'
    },
    providerId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The unique ID from the provider (e.g., Facebook UID)'
    },
    accessToken: {
      type: DataTypes.STRING
    },
    refreshToken: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    profileData: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Stores provider-specific profile data'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this is the primary auth method for the user'
    }
  });

  return AuthProvider;
}; 