const bcrypt = require('bcryptjs');
const db = require('../config/database');
const userController = {
  // Registrar um novo usuário na tabela Usuario
  register: async (req, res) => {
    const { name, email, password, role } = req.body;

    const validRoles = ['Administrador', 'Supervisor', 'Mediador', 'Aluno', 'Comunidade'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO Usuario (nome, email, senha, perfil, ativo) VALUES (?, ?, ?, ?, TRUE)',
        [name, email, hashedPassword, role],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE') || err.message.includes('duplicate key')) {
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

  // Login usando a tabela Usuario por email
  login: (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM Usuario WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (user.ativo === false || user.ativo === 0) {
        return res.status(403).json({ error: 'User is disabled' });
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
            perfil: user.perfil,
            ativo: user.ativo
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
    db.all('SELECT id_usuario, nome, email, perfil, ativo FROM Usuario', [], (err, users) => {
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
      'SELECT id_usuario, nome, email, perfil, ativo FROM Usuario WHERE id_usuario = ?',
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
    const { name, email, password, role } = req.body;

    if (role) {
      const validRoles = ['Administrador', 'Supervisor', 'Mediador', 'Aluno', 'Comunidade'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    try {
      let updateFields = [];
      let values = [];

      if (name) {
        updateFields.push('nome = ?');
        values.push(name);
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

  // Desabilitar usuário (soft delete)
  delete: (req, res) => {
    const { id } = req.params;

    db.run('UPDATE Usuario SET ativo = FALSE WHERE id_usuario = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User disabled successfully' });
    });
  }
};

module.exports = userController;
