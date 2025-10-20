const db = require('../config/database');

const projectController = {
  // Create a new Projeto (staff only). Requires fk_curso_id_curso and fk_proposta_id_proposta
  create: (req, res) => {
    const { titulo, descricao, prazo, status, feedback, fk_curso_id_curso, fk_proposta_id_proposta } = req.body;
    const userRole = req.session.userRole;

    const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
    if (!isStaff) {
      return res.status(403).json({ error: 'Only Staff users can create projects' });
    }

    // Validate foreign keys exist
    db.get('SELECT id_curso FROM Curso WHERE id_curso = ?', [fk_curso_id_curso], (err, curso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!curso) return res.status(400).json({ error: 'Curso not found' });

      db.get('SELECT id_proposta FROM Proposta WHERE id_proposta = ?', [fk_proposta_id_proposta], (err2, prop) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (!prop) return res.status(400).json({ error: 'Proposta not found' });

        db.run(
          'INSERT INTO Projeto (titulo, descricao, prazo, status, feedback, fk_curso_id_curso, fk_proposta_id_proposta) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [titulo, descricao || null, prazo || null, status || null, feedback || null, fk_curso_id_curso, fk_proposta_id_proposta],
          function (err3) {
            if (err3) return res.status(500).json({ error: err3.message });
            res.status(201).json({ message: 'Projeto criado com sucesso', id_projeto: this.lastID });
          }
        );
      });
    });
  },

  // Get all projetos with joins to Curso and Proposta
  getAll: (req, res) => {
    db.all(
      `SELECT pj.*, c.nome as curso_nome, pr.titulo as proposta_titulo
       FROM Projeto pj
       JOIN Curso c ON pj.fk_curso_id_curso = c.id_curso
       JOIN Proposta pr ON pj.fk_proposta_id_proposta = pr.id_proposta`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  },

  // Get projeto by id
  getById: (req, res) => {
    const { id } = req.params;
    db.get(
      `SELECT pj.*, c.nome as curso_nome, pr.titulo as proposta_titulo, pr.descricao as proposta_descricao
       FROM Projeto pj
       JOIN Curso c ON pj.fk_curso_id_curso = c.id_curso
       JOIN Proposta pr ON pj.fk_proposta_id_proposta = pr.id_proposta
       WHERE pj.id_projeto = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Projeto não encontrado' });
        res.json(row);
      }
    );
  },

  // Update projeto (staff only)
  update: (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, prazo, status, feedback, fk_curso_id_curso, fk_proposta_id_proposta } = req.body;
    const userRole = req.session.userRole;
    const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
    if (!isStaff) return res.status(403).json({ error: 'Only Staff users can update projects' });

    db.get('SELECT * FROM Projeto WHERE id_projeto = ?', [id], (err, projeto) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });

      const updateFields = [];
      const values = [];
      if (titulo !== undefined) { updateFields.push('titulo = ?'); values.push(titulo); }
      if (descricao !== undefined) { updateFields.push('descricao = ?'); values.push(descricao); }
      if (prazo !== undefined) { updateFields.push('prazo = ?'); values.push(prazo); }
      if (status !== undefined) { updateFields.push('status = ?'); values.push(status); }
      if (feedback !== undefined) { updateFields.push('feedback = ?'); values.push(feedback); }
      if (fk_curso_id_curso !== undefined) { updateFields.push('fk_curso_id_curso = ?'); values.push(fk_curso_id_curso); }
      if (fk_proposta_id_proposta !== undefined) { updateFields.push('fk_proposta_id_proposta = ?'); values.push(fk_proposta_id_proposta); }

      if (updateFields.length === 0) return res.status(400).json({ error: 'No fields to update' });

      const runUpdate = () => {
        values.push(id);
        db.run(
          `UPDATE Projeto SET ${updateFields.join(', ')} WHERE id_projeto = ?`,
          values,
          function (err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: 'Projeto atualizado com sucesso' });
          }
        );
      };

      // If FKs provided, validate
      if (fk_curso_id_curso !== undefined) {
        db.get('SELECT id_curso FROM Curso WHERE id_curso = ?', [fk_curso_id_curso], (e1, c) => {
          if (e1) return res.status(500).json({ error: e1.message });
          if (!c) return res.status(400).json({ error: 'Curso not found' });
          if (fk_proposta_id_proposta !== undefined) {
            db.get('SELECT id_proposta FROM Proposta WHERE id_proposta = ?', [fk_proposta_id_proposta], (e2, p) => {
              if (e2) return res.status(500).json({ error: e2.message });
              if (!p) return res.status(400).json({ error: 'Proposta not found' });
              runUpdate();
            });
          } else {
            runUpdate();
          }
        });
      } else if (fk_proposta_id_proposta !== undefined) {
        db.get('SELECT id_proposta FROM Proposta WHERE id_proposta = ?', [fk_proposta_id_proposta], (e2, p) => {
          if (e2) return res.status(500).json({ error: e2.message });
          if (!p) return res.status(400).json({ error: 'Proposta not found' });
          runUpdate();
        });
      } else {
        runUpdate();
      }
    });
  },

  // Delete projeto (staff only)
  delete: (req, res) => {
    const { id } = req.params;
    const userRole = req.session.userRole;
    const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
    if (!isStaff) return res.status(403).json({ error: 'Only Staff users can delete projects' });

    db.run('DELETE FROM Projeto WHERE id_projeto = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Projeto não encontrado' });
      res.json({ message: 'Projeto excluído com sucesso' });
    });
  }
};

module.exports = projectController;
