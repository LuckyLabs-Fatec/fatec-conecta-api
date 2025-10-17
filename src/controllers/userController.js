const bcrypt = require('bcryptjs');
const db = require('../config/database');

const userController = {
  // Register a new user
  register: async (req, res) => {
    const { username, email, password, role } = req.body;

    // Validate role
    const validRoles = ['Student', 'Community', 'Staff-Admin', 'Staff-Supervisor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Username or email already exists' });
            }
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ 
            message: 'User registered successfully', 
            userId: this.lastID 
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Import account lockout functions
      const {
        checkAccountLockout,
        recordFailedLogin,
        resetFailedLogins
      } = require('../middleware/accountLockout');

      // Check if account is locked
      const lockoutStatus = await checkAccountLockout(username);
      if (lockoutStatus.isLocked) {
        return res.status(403).json({
          error: 'Account is locked due to too many failed login attempts',
          remainingMinutes: lockoutStatus.remainingMinutes
        });
      }

      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            // Record failed login attempt
            const result = await recordFailedLogin(username);
            if (result && result.accountLocked) {
              return res.status(403).json({
                error: 'Account is locked due to too many failed login attempts. Please try again after 30 minutes.'
              });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Reset failed login attempts on successful login
          await resetFailedLogins(username);

          // Set session
          req.session.userId = user.id;
          req.session.userRole = user.role;
          req.session.username = user.username;

          res.json({
            message: 'Login successful',
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  },

  // Get all users
  getAll: (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users', [], (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(users);
    });
  },

  // Get user by ID
  getById: (req, res) => {
    const { id } = req.params;

    db.get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
      }
    );
  },

  // Update user
  update: async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Validate role if provided
    if (role) {
      const validRoles = ['Student', 'Community', 'Staff-Admin', 'Staff-Supervisor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    try {
      let updateFields = [];
      let values = [];

      if (username) {
        updateFields.push('username = ?');
        values.push(username);
      }
      if (email) {
        updateFields.push('email = ?');
        values.push(email);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('password = ?');
        values.push(hashedPassword);
      }
      if (role) {
        updateFields.push('role = ?');
        values.push(role);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Username or email already exists' });
            }
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.json({ message: 'User updated successfully' });
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  delete: (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    });
  }
};

module.exports = userController;
