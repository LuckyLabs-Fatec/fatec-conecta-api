const db = require('../config/database');

const feedbackController = {
  create: (req, res) => {
    const { comentario, anexos, data, fk_usuario_id_usuario, id_projeto } = req.body;
    // validate FKs
    db.get('SELECT id_usuario FROM Usuario WHERE id_usuario = ?', [fk_usuario_id_usuario], (e1, u) => {
      if (e1) return res.status(500).json({ error: e1.message });
      if (!u) return res.status(400).json({ error: 'Usuário não encontrado' });
      db.get('SELECT id_projeto FROM Projeto WHERE id_projeto = ?', [id_projeto], (e2, p) => {
        if (e2) return res.status(500).json({ error: e2.message });
        if (!p) return res.status(400).json({ error: 'Projeto não encontrado' });
        db.run(
          'INSERT INTO Feedback (comentario, anexos, data, fk_usuario_id_usuario, id_projeto) VALUES (?, ?, ?, ?, ?)',
          [comentario || null, anexos || null, data || new Date().toISOString().slice(0,10), fk_usuario_id_usuario, id_projeto],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Feedback criado', id_feedback: this.lastID });
          }
        );
      });
    });
  },
  getAll: (req, res) => {
    db.all(
      `SELECT f.*, u.nome as usuario_nome, pj.titulo as projeto_titulo
       FROM Feedback f
       JOIN Usuario u ON f.fk_usuario_id_usuario = u.id_usuario
       JOIN Projeto pj ON f.id_projeto = pj.id_projeto`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },
  getById: (req, res) => {
    const { id } = req.params;
    db.get(
      `SELECT f.*, u.nome as usuario_nome, pj.titulo as projeto_titulo
       FROM Feedback f
       JOIN Usuario u ON f.fk_usuario_id_usuario = u.id_usuario
       JOIN Projeto pj ON f.id_projeto = pj.id_projeto
       WHERE f.id_feedback = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Feedback não encontrado' });
        res.json(row);
      }
    );
  },
  update: (req, res) => {
    const { id } = req.params;
    const { comentario, anexos, data } = req.body;
    const fields = [];
    const values = [];
    if (comentario !== undefined) { fields.push('comentario = ?'); values.push(comentario); }
    if (anexos !== undefined) { fields.push('anexos = ?'); values.push(anexos); }
    if (data !== undefined) { fields.push('data = ?'); values.push(data); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    db.run(`UPDATE Feedback SET ${fields.join(', ')} WHERE id_feedback = ?`, values, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Feedback não encontrado' });
      res.json({ message: 'Feedback atualizado' });
    });
  },
  delete: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Feedback WHERE id_feedback = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Feedback não encontrado' });
      res.json({ message: 'Feedback excluído' });
    });
  }
};

module.exports = feedbackController;
