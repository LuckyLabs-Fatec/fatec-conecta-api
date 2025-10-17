const express = require('express');
const sessionMiddleware = require('./config/session');
const db = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const userRoutes = require('./routes/userRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fatec Conecta API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      ideas: '/api/ideas',
      projects: '/api/projects'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
