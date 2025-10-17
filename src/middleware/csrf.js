const crypto = require('crypto');

// Generate CSRF token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to generate and attach CSRF token to session
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate token if not present
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateToken();
    }
    return next();
  }

  // For state-changing requests (POST, PUT, DELETE, PATCH), verify token
  const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
  
  if (!token) {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      message: 'CSRF token is required for this request'
    });
  }

  if (!req.session.csrfToken) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'No CSRF token found in session'
    });
  }

  // Check if tokens match - use constant-time comparison to prevent timing attacks
  // First check length to avoid errors with timingSafeEqual
  if (token.length !== req.session.csrfToken.length) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'Invalid CSRF token'
    });
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrfToken))) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Middleware to provide CSRF token to client
const provideCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  // Attach token to response locals for easy access
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  res.json({ csrfToken: req.session.csrfToken });
};

module.exports = {
  csrfProtection,
  provideCsrfToken,
  getCsrfToken
};
