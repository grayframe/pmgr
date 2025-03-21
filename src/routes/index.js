const express = require('express');
const router = express.Router();
const debug = require('debug')('p:routes:index');

router.get('/', (req, res) => {
  debug('GET / - Rendering welcome page: %O', { 
    isAuthenticated: req.isAuthenticated(),
    userId: req.user?.id,
    sessionId: req.session?.id
  });
  
  res.render('welcome', { 
    title: 'Welcome to Photo Manager',
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session,
    headers: req.headers
  });
});

module.exports = router; 