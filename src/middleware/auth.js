// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check if user has specific role
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

// Middleware to check if user is staff (Admin or Supervisor)
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
