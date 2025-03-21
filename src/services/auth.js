const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, AuthProvider } = require('../models');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.setupSerializers();
    this.setupStrategies();
  }

  setupSerializers() {
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findByPk(id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }

  setupStrategies() {
    // Local Strategy
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        const user = await User.findOne({ 
          where: { email },
          include: [{
            model: AuthProvider,
            where: { provider: 'local' },
            required: true
          }]
        });
        
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        const authProvider = user.AuthProviders[0];
        const isValid = await bcrypt.compare(password, authProvider.profileData.passwordHash);
        
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));

    // Facebook Strategy (optional)
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email']
      }, this.handleOAuthLogin.bind(this, 'facebook')));
    }

    // Google Strategy (optional)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      }, this.handleOAuthLogin.bind(this, 'google')));
    }
  }

  async handleOAuthLogin(provider, accessToken, refreshToken, profile, done) {
    try {
      // Find or create auth provider
      const [authProvider] = await AuthProvider.findOrCreate({
        where: {
          provider,
          providerId: profile.id
        },
        defaults: {
          accessToken,
          refreshToken
        }
      });

      // If auth provider exists but no user, create user
      if (!authProvider.userId) {
        const user = await User.create({
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value
        });
        authProvider.userId = user.id;
        await authProvider.save();
      }

      // Get user
      const user = await User.findByPk(authProvider.userId);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }

  initialize() {
    return passport.initialize();
  }

  session() {
    return passport.session();
  }

  authenticate(strategy, options = {}) {
    return passport.authenticate(strategy, options);
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
module.exports = new AuthService(); 