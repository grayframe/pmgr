require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { sequelize } = require('./models');
const authService = require('./services/auth');
const methodOverride = require('method-override');

// Import routes
const authRouter = require('./routes/auth');
const { router: photoRouter, setupPhotoWebSocket } = require('./routes/photo');
const { router: albumRouter, setupAlbumWebSocket } = require('./routes/album');
const { router: projectRouter, setupProjectWebSocket } = require('./routes/project');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await sequelize.models.User.findByPk(id, {
      include: [sequelize.models.AuthProvider]
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Register passport strategies
authService.strategies.forEach((strategy, name) => {
  passport.use(name, strategy);
});

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/photos');
  } else {
    res.render('welcome', { title: 'Welcome to Photo Manager' });
  }
});

// Auth routes
app.use('/auth', authRouter);

// API routes (protected)
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

app.use('/api/photos', requireAuth, photoRouter);
app.use('/api/albums', requireAuth, albumRouter);
app.use('/api/projects', requireAuth, projectRouter);

// WebSocket authentication middleware
io.use((socket, next) => {
  const session = socket.request.session;
  if (!session || !session.passport || !session.passport.user) {
    return next(new Error('Unauthorized'));
  }
  socket.user = session.passport.user;
  next();
});

// Setup WebSocket handlers
setupPhotoWebSocket(io);
setupAlbumWebSocket(io);
setupProjectWebSocket(io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    // Implement socket authentication if needed
  });

  // Handle photo updates
  socket.on('photo-update', (data) => {
    // Broadcast photo updates to all connected clients
    io.emit('photo-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Database sync and server start
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
