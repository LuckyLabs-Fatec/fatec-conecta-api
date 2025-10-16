const db = require('../config/database');

const ideaController = {
  // Create a new idea (only Community users)
  create: (req, res) => {
    const { title, description } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    // Check if user is Community
    if (userRole !== 'Community') {
      return res.status(403).json({ error: 'Only Community users can create ideas' });
    }

    db.run(
      'INSERT INTO ideas (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: 'Idea created successfully', 
          ideaId: this.lastID 
        });
      }
    );
  },

  // Get all ideas
  getAll: (req, res) => {
    db.all(
      `SELECT ideas.*, users.username, users.role 
       FROM ideas 
       JOIN users ON ideas.user_id = users.id`,
      [],
      (err, ideas) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(ideas);
      }
    );
  },

  // Get idea by ID
  getById: (req, res) => {
    const { id } = req.params;

    db.get(
      `SELECT ideas.*, users.username, users.role 
       FROM ideas 
       JOIN users ON ideas.user_id = users.id 
       WHERE ideas.id = ?`,
      [id],
      (err, idea) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!idea) {
          return res.status(404).json({ error: 'Idea not found' });
        }
        res.json(idea);
      }
    );
  },

  // Update idea
  update: (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.session.userId;

    // First, check if the idea belongs to the user
    db.get('SELECT * FROM ideas WHERE id = ?', [id], (err, idea) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found' });
      }
      if (idea.user_id !== userId) {
        return res.status(403).json({ error: 'You can only update your own ideas' });
      }

      let updateFields = [];
      let values = [];

      if (title) {
        updateFields.push('title = ?');
        values.push(title);
      }
      if (description) {
        updateFields.push('description = ?');
        values.push(description);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(
        `UPDATE ideas SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Idea updated successfully' });
        }
      );
    });
  },

  // Delete idea
  delete: (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    // First, check if the idea belongs to the user
    db.get('SELECT * FROM ideas WHERE id = ?', [id], (err, idea) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found' });
      }
      if (idea.user_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own ideas' });
      }

      db.run('DELETE FROM ideas WHERE id = ?', [id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Idea deleted successfully' });
      });
    });
  }
};

module.exports = ideaController;
