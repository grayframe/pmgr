const express = require('express');
const passport = require('passport');
const router = express.Router();
const authService = require('../services/auth');
const debug = require('debug')('p:routes:auth');

// Login page route
router.get('/login', (req, res) => {
  debug('GET /login - Rendering login page');
  res.render('login', { title: 'Login' });
});

// Local authentication routes
router.post('/register', async (req, res) => {
  try {
    debug('POST /register - Attempting to register user: %O', { email: req.body.email });
    const { email, password, displayName } = req.body;
    const user = await authService.registerLocalUser(email, password, displayName);
    req.login(user, (err) => {
      if (err) {
        debug('POST /register - Login error: %O', err);
        return res.status(500).json({ error: err.message });
      }
      debug('POST /register - Successfully registered and logged in user: %O', { id: user.id, email: user.email });
      res.json(user);
    });
  } catch (error) {
    debug('POST /register - Registration error: %O', error);
    res.status(400).json({ error: error.message });
  }
});

// Local login route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/photos',
  failureRedirect: '/auth/login',
  failureFlash: true
}), (req, res) => {
  debug('POST /login - Successfully logged in user: %O', { id: req.user.id, email: req.user.email });
});

// OAuth routes
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/photos',
      failureRedirect: '/auth/login'
    }),
    (req, res) => {
      debug('GET /facebook/callback - Successfully authenticated with Facebook: %O', { id: req.user.id, email: req.user.email });
    }
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
    passport.authenticate('google', {
      successRedirect: '/photos',
      failureRedirect: '/auth/login'
    }),
    (req, res) => {
      debug('GET /google/callback - Successfully authenticated with Google: %O', { id: req.user.id, email: req.user.email });
    }
  );
}

// Account management routes
router.get('/providers', async (req, res) => {
  try {
    debug('GET /providers - Fetching auth providers for user: %O', { id: req.user.id });
    const providers = await req.user.getAuthProviders();
    debug('GET /providers - Successfully fetched providers: %O', providers);
    res.json(providers);
  } catch (error) {
    debug('GET /providers - Error fetching providers: %O', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/providers/:provider/unlink', async (req, res) => {
  try {
    await authService.unlinkProvider(req.user.id, req.params.provider);
    res.json({ message: 'Provider unlinked successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  debug('GET /logout - Logging out user: %O', { id: req.user.id, email: req.user.email });
  req.logout(() => {
    debug('GET /logout - Successfully logged out user');
    res.redirect('/');
  });
});

// Session check route
router.get('/session', (req, res) => {
  if (req.isAuthenticated()) {
    debug('GET /session - User is authenticated: %O', { id: req.user.id, email: req.user.email });
    res.json(req.user);
  } else {
    debug('GET /session - User is not authenticated');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
//module.exports = (req, res) => { res.json({ message: 'Hello World' }); };