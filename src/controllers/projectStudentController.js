const db = require('../config/database');

const projectStudentController = {
  create: (req, res) => {
    const { fk_projeto_id_projeto, id_usuario } = req.body;
    db.get('SELECT id_projeto FROM Projeto WHERE id_projeto = ?', [fk_projeto_id_projeto], (e1, p) => {
      if (e1) return res.status(500).json({ error: e1.message });
      if (!p) return res.status(400).json({ error: 'Projeto não encontrado' });
      db.get('SELECT id_usuario FROM Usuario WHERE id_usuario = ?', [id_usuario], (e2, u) => {
        if (e2) return res.status(500).json({ error: e2.message });
        if (!u) return res.status(400).json({ error: 'Usuário não encontrado' });
        db.run('INSERT INTO Projeto_Aluno (fk_projeto_id_projeto, id_usuario) VALUES (?, ?)', [fk_projeto_id_projeto, id_usuario], function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Vínculo criado', idprojetoaluno: this.lastID });
        });
      });
    });
  },
  getAll: (req, res) => {
    db.all(
      `SELECT pa.*, u.nome as usuario_nome, pj.titulo as projeto_titulo
       FROM Projeto_Aluno pa
       JOIN Usuario u ON pa.id_usuario = u.id_usuario
       JOIN Projeto pj ON pa.fk_projeto_id_projeto = pj.id_projeto`,
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
      `SELECT pa.*, u.nome as usuario_nome, pj.titulo as projeto_titulo
       FROM Projeto_Aluno pa
       JOIN Usuario u ON pa.id_usuario = u.id_usuario
       JOIN Projeto pj ON pa.fk_projeto_id_projeto = pj.id_projeto
       WHERE pa.idprojetoaluno = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Registro não encontrado' });
        res.json(row);
      }
    );
  },
  update: (req, res) => {
    const { id } = req.params;
    const { fk_projeto_id_projeto, id_usuario } = req.body;
    const fields = [];
    const values = [];
    if (fk_projeto_id_projeto !== undefined) { fields.push('fk_projeto_id_projeto = ?'); values.push(fk_projeto_id_projeto); }
    if (id_usuario !== undefined) { fields.push('id_usuario = ?'); values.push(id_usuario); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    const runUpdate = () => {
      values.push(id);
      db.run(`UPDATE Projeto_Aluno SET ${fields.join(', ')} WHERE idprojetoaluno = ?`, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
        res.json({ message: 'Vínculo atualizado' });
      });
    };

    if (fk_projeto_id_projeto !== undefined) {
      db.get('SELECT id_projeto FROM Projeto WHERE id_projeto = ?', [fk_projeto_id_projeto], (e1, p) => {
        if (e1) return res.status(500).json({ error: e1.message });
        if (!p) return res.status(400).json({ error: 'Projeto não encontrado' });
        if (id_usuario !== undefined) {
          db.get('SELECT id_usuario FROM Usuario WHERE id_usuario = ?', [id_usuario], (e2, u) => {
            if (e2) return res.status(500).json({ error: e2.message });
            if (!u) return res.status(400).json({ error: 'Usuário não encontrado' });
            runUpdate();
          });
        } else {
          runUpdate();
        }
      });
    } else if (id_usuario !== undefined) {
      db.get('SELECT id_usuario FROM Usuario WHERE id_usuario = ?', [id_usuario], (e2, u) => {
        if (e2) return res.status(500).json({ error: e2.message });
        if (!u) return res.status(400).json({ error: 'Usuário não encontrado' });
        runUpdate();
      });
    } else {
      runUpdate();
    }
  },
  delete: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Projeto_Aluno WHERE idprojetoaluno = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      res.json({ message: 'Vínculo excluído' });
    });
  }
};

module.exports = projectStudentController;
