// Middleware para verificar se o usuário está autenticado
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware para verificar se o usuário possui um papel específico
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Middleware para verificar se o usuário é staff (Admin ou Supervisor)
const requireStaff = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!['Staff-Admin', 'Staff-Supervisor'].includes(req.session.userRole)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireStaff
};
