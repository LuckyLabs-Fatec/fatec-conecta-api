const db = require('../config/database');

const ideaController = {
  // Criar uma nova proposta - apenas usuários Community
  create: (req, res) => {
    const { titulo, descricao, status, anexos } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    if (userRole !== 'Community') {
      return res.status(403).json({ error: 'Only Community users can create proposals' });
    }

    db.run(
      'INSERT INTO Proposta (titulo, descricao, data_submissao, status, anexos, id_usuario) VALUES (?, ?, DATE("now"), ?, ?, ?)',
      [titulo, descricao, status || null, anexos || null, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Proposta criada com sucesso',
          id_proposta: this.lastID
        });
      }
    );
  },

  // Obter todas as propostas
  getAll: (req, res) => {
    db.all(
      `SELECT p.*, u.nome as usuario_nome, u.perfil as usuario_perfil
       FROM Proposta p
       JOIN Usuario u ON p.id_usuario = u.id_usuario`,
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  },

  // Obter proposta por ID
  getById: (req, res) => {
    const { id } = req.params;

    db.get(
      `SELECT p.*, u.nome as usuario_nome, u.perfil as usuario_perfil
       FROM Proposta p
       JOIN Usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_proposta = ?`,
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        res.json(row);
      }
    );
  },

  // Atualizar proposta (apenas proprietário)
  update: (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, status, anexos } = req.body;
    const userId = req.session.userId;

    db.get('SELECT * FROM Proposta WHERE id_proposta = ?', [id], (err, proposta) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      if (proposta.id_usuario !== userId) {
        return res.status(403).json({ error: 'Você só pode atualizar suas próprias propostas' });
      }

      const updateFields = [];
      const values = [];

      if (titulo !== undefined) { updateFields.push('titulo = ?'); values.push(titulo); }
      if (descricao !== undefined) { updateFields.push('descricao = ?'); values.push(descricao); }
      if (status !== undefined) { updateFields.push('status = ?'); values.push(status); }
      if (anexos !== undefined) { updateFields.push('anexos = ?'); values.push(anexos); }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      db.run(
        `UPDATE Proposta SET ${updateFields.join(', ')} WHERE id_proposta = ?`,
        values,
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Proposta atualizada com sucesso' });
        }
      );
    });
  },

  // Excluir proposta (apenas proprietário)
  delete: (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    db.get('SELECT * FROM Proposta WHERE id_proposta = ?', [id], (err, proposta) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      if (proposta.id_usuario !== userId) {
        return res.status(403).json({ error: 'Você só pode excluir suas próprias propostas' });
      }

      db.run('DELETE FROM Proposta WHERE id_proposta = ?', [id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Proposta excluída com sucesso' });
      });
    });
  }
};

module.exports = ideaController;
