const db = require('../config/database');

const courseController = {
  create: (req, res) => {
    const { nome, descricao } = req.body;
    db.run('INSERT INTO Curso (nome, descricao) VALUES (?, ?)', [nome, descricao || null], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Curso criado', id_curso: this.lastID });
    });
  },
  getAll: (req, res) => {
    db.all('SELECT * FROM Curso', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },
  getById: (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Curso WHERE id_curso = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Curso não encontrado' });
      res.json(row);
    });
  },
  update: (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const fields = [];
    const values = [];
    if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
    if (descricao !== undefined) { fields.push('descricao = ?'); values.push(descricao); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    db.run(`UPDATE Curso SET ${fields.join(', ')} WHERE id_curso = ?`, values, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Curso não encontrado' });
      res.json({ message: 'Curso atualizado' });
    });
  },
  delete: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Curso WHERE id_curso = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Curso não encontrado' });
      res.json({ message: 'Curso excluído' });
    });
  }
};

module.exports = courseController;
