const express = require('express');
const sessionMiddleware = require('./config/session');
const db = require('./config/database');

// Importar rotas
const userRoutes = require('./routes/userRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const projectRoutes = require('./routes/projectRoutes');
const courseRoutes = require('./routes/courseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const projectStudentRoutes = require('./routes/projectStudentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes); 
app.use('/api/projects', projectRoutes); 
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/project-students', projectStudentRoutes);

// Endpoint de verificação (health check)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fatec Conecta API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      ideas: '/api/ideas',
      projects: '/api/projects',
      courses: '/api/courses',
      notifications: '/api/notifications',
      feedbacks: '/api/feedbacks',
      projectStudents: '/api/project-students'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
