const db = require('../config/database');

const notificationController = {
  create: (req, res) => {
    const { mensagem, id_usuario, dataNotif } = req.body;
    // validate user exists
    db.get('SELECT id_usuario FROM Usuario WHERE id_usuario = ?', [id_usuario], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

      db.run('INSERT INTO Notificacao (mensagem, dataNotif, id_usuario) VALUES (?, ?, ?)', [mensagem, dataNotif || new Date().toISOString().slice(0,10), id_usuario], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: 'Notificação criada', id_notificacao: this.lastID });
      });
    });
  },
  getAll: (req, res) => {
    db.all('SELECT n.*, u.nome as usuario_nome FROM Notificacao n JOIN Usuario u ON n.id_usuario = u.id_usuario', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },
  getById: (req, res) => {
    const { id } = req.params;
    db.get('SELECT n.*, u.nome as usuario_nome FROM Notificacao n JOIN Usuario u ON n.id_usuario = u.id_usuario WHERE id_notificacao = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Notificação não encontrada' });
      res.json(row);
    });
  },
  update: (req, res) => {
    const { id } = req.params;
    const { mensagem, dataNotif, id_usuario } = req.body;
    const fields = [];
    const values = [];
    if (mensagem !== undefined) { fields.push('mensagem = ?'); values.push(mensagem); }
    if (dataNotif !== undefined) { fields.push('dataNotif = ?'); values.push(dataNotif); }
    if (id_usuario !== undefined) { fields.push('id_usuario = ?'); values.push(id_usuario); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    db.run(`UPDATE Notificacao SET ${fields.join(', ')} WHERE id_notificacao = ?`, values, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
      res.json({ message: 'Notificação atualizada' });
    });
  },
  delete: (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Notificacao WHERE id_notificacao = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
      res.json({ message: 'Notificação excluída' });
    });
  }
};

module.exports = notificationController;
