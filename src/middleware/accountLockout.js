const db = require('../config/database');

// Configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// Check if account is locked
const checkAccountLockout = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT failed_login_attempts, account_locked_until FROM users WHERE username = ?',
      [username],
      (err, user) => {
        if (err) {
          return reject(err);
        }
        if (!user) {
          // User doesn't exist, return not locked (we'll handle this in login)
          return resolve({ isLocked: false });
        }

        // Check if account is currently locked
        if (user.account_locked_until) {
          const lockoutTime = new Date(user.account_locked_until);
          const now = new Date();
          
          if (now < lockoutTime) {
            const remainingMinutes = Math.ceil((lockoutTime - now) / (1000 * 60));
            return resolve({
              isLocked: true,
              remainingMinutes: remainingMinutes
            });
          } else {
            // Lockout period has expired, reset the counters
            db.run(
              'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE username = ?',
              [username],
              (err) => {
                if (err) reject(err);
                else resolve({ isLocked: false });
              }
            );
            return;
          }
        }

        resolve({ isLocked: false, attempts: user.failed_login_attempts });
      }
    );
  });
};

// Record failed login attempt
const recordFailedLogin = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT failed_login_attempts FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        return reject(err);
      }
      if (!user) {
        // User doesn't exist, nothing to record
        return resolve();
      }

      const newAttempts = (user.failed_login_attempts || 0) + 1;
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
        
        db.run(
          'UPDATE users SET failed_login_attempts = ?, account_locked_until = ? WHERE username = ?',
          [newAttempts, lockUntil.toISOString(), username],
          (err) => {
            if (err) reject(err);
            else resolve({ accountLocked: true });
          }
        );
      } else {
        // Just increment the counter
        db.run(
          'UPDATE users SET failed_login_attempts = ? WHERE username = ?',
          [newAttempts, username],
          (err) => {
            if (err) reject(err);
            else resolve({ attemptsRemaining: MAX_LOGIN_ATTEMPTS - newAttempts });
          }
        );
      }
    });
  });
};

// Reset failed login attempts on successful login
const resetFailedLogins = (username) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE username = ?',
      [username],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

module.exports = {
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLogins,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES
};
