// Simple logger middleware for authentication attempts
const logAuthAttempt = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  const logRequest = (body) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body.username || 'unknown';
    const endpoint = req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Log authentication attempts with relevant details
    const logMessage = `[${timestamp}] AUTH ${method} ${endpoint} - User: ${username} - IP: ${ip} - Status: ${statusCode}`;
    
    if (statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  };

  // Wrap res.send to log after response
  res.send = function(body) {
    logRequest(body);
    return originalSend.call(this, body);
  };

  // Wrap res.json to log after response
  res.json = function(body) {
    logRequest(body);
    return originalJson.call(this, body);
  };

  next();
};

module.exports = {
  logAuthAttempt
};
