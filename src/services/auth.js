const { User, AuthProvider } = require('../models');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.strategies = new Map();
    this.setupStrategies();
  }

  setupStrategies() {
    // Facebook Strategy
    this.strategies.set('facebook', new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email']
    }, this.handleOAuthCallback.bind(this)));

    // Google Strategy
    this.strategies.set('google', new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    }, this.handleOAuthCallback.bind(this)));

    // Local Strategy (email/password)
    this.strategies.set('local', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, this.handleLocalCallback.bind(this)));
  }

  async handleOAuthCallback(accessToken, refreshToken, profile, done) {
    try {
      // Find or create user
      let user = await User.findOne({
        where: { email: profile.emails[0].value },
        include: [AuthProvider]
      });

      if (!user) {
        // Create new user
        user = await User.create({
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value
        });
      }

      // Find or create auth provider
      const [authProvider] = await AuthProvider.findOrCreate({
        where: {
          userId: user.id,
          provider: profile.provider,
          providerId: profile.id
        },
        defaults: {
          accessToken,
          refreshToken,
          profileData: profile._json,
          isPrimary: !user.AuthProviders?.length // Make primary if first provider
        }
      });

      // Update tokens if they've changed
      if (authProvider.accessToken !== accessToken) {
        await authProvider.update({
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  async handleLocalCallback(email, password, done) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [AuthProvider]
      });

      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      const authProvider = user.AuthProviders?.find(ap => ap.provider === 'local');
      if (!authProvider) {
        return done(null, false, { message: 'Please use a different login method' });
      }

      const isValid = await bcrypt.compare(password, authProvider.profileData.passwordHash);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  async registerLocalUser(email, password, displayName) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      email,
      displayName
    });

    await AuthProvider.create({
      userId: user.id,
      provider: 'local',
      providerId: email,
      profileData: { passwordHash: hashedPassword },
      isPrimary: true
    });

    return user;
  }

  async linkProvider(userId, provider, profile, tokens) {
    const existingProvider = await AuthProvider.findOne({
      where: {
        userId,
        provider,
        providerId: profile.id
      }
    });

    if (existingProvider) {
      return existingProvider;
    }

    return AuthProvider.create({
      userId,
      provider,
      providerId: profile.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profileData: profile._json,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    });
  }

  async unlinkProvider(userId, provider) {
    const authProvider = await AuthProvider.findOne({
      where: { userId, provider }
    });

    if (authProvider?.isPrimary) {
      throw new Error('Cannot unlink primary authentication method');
    }

    await authProvider?.destroy();
  }
}

module.exports = new AuthService(); 