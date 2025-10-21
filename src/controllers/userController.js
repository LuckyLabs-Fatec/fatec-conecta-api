const bcrypt = require('bcryptjs');
const db = require('../config/database');

const userController = {
  // Registrar um novo usuário na tabela Usuario
  register: async (req, res) => {
    const { username, email, password, role } = req.body;

    const validRoles = ['Student', 'Community', 'Staff-Admin', 'Staff-Supervisor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO Usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Name or email already exists' });
            }
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            message: 'User registered successfully',
            id_usuario: this.lastID
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login usando a tabela Usuario (username -> nome)
  login: (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM Usuario WHERE nome = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        const isValidPassword = await bcrypt.compare(password, user.senha);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

          // Definir sessão
        req.session.userId = user.id_usuario;
        req.session.userRole = user.perfil;
        req.session.username = user.nome;

        res.json({
          message: 'Login successful',
          user: {
            id_usuario: user.id_usuario,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
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

  // Obter todos os usuários da tabela Usuario
  getAll: (req, res) => {
    db.all('SELECT id_usuario, nome, email, perfil FROM Usuario', [], (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(users);
    });
  },

  // Obter usuário por ID
  getById: (req, res) => {
    const { id } = req.params;

    db.get(
      'SELECT id_usuario, nome, email, perfil FROM Usuario WHERE id_usuario = ?',
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

  // Atualizar usuário
  update: async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

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
        updateFields.push('nome = ?');
        values.push(username);
      }
      if (email) {
        updateFields.push('email = ?');
        values.push(email);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('senha = ?');
        values.push(hashedPassword);
      }
      if (role) {
        updateFields.push('perfil = ?');
        values.push(role);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      db.run(
        `UPDATE Usuario SET ${updateFields.join(', ')} WHERE id_usuario = ?`,
        values,
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Name or email already exists' });
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

  // Excluir usuário
  delete: (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM Usuario WHERE id_usuario = ?', [id], function (err) {
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
