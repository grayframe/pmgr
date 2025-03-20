const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/auth');

// Local authentication routes
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const user = await authService.registerLocalUser(email, password, displayName);
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(user);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

// OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Account management routes
router.get('/providers', async (req, res) => {
  try {
    const providers = await req.user.getAuthProviders();
    res.json(providers);
  } catch (error) {
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
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Session check route
router.get('/session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router; 