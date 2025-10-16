const db = require('../config/database');

const projectController = {
  // Create a new project
  create: (req, res) => {
    const { title, description, ideaId } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    // Business rules:
    // - Staff users (Admin and Supervisor) can create projects with or without ideas
    // - Students and Community users cannot create projects without ideas
    const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
    
    if (!isStaff && !ideaId) {
      return res.status(403).json({ 
        error: 'Students and Community users must create projects from existing ideas' 
      });
    }

    if (!isStaff) {
      return res.status(403).json({ 
        error: 'Only Staff users can create projects' 
      });
    }

    // If ideaId is provided, verify it exists
    if (ideaId) {
      db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], (err, idea) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!idea) {
          return res.status(404).json({ error: 'Idea not found' });
        }

        // Create project with idea
        db.run(
          'INSERT INTO projects (title, description, user_id, idea_id) VALUES (?, ?, ?, ?)',
          [title, description, userId, ideaId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
              message: 'Project created successfully from idea', 
              projectId: this.lastID 
            });
          }
        );
      });
    } else {
      // Create project without idea (staff only)
      db.run(
        'INSERT INTO projects (title, description, user_id) VALUES (?, ?, ?)',
        [title, description, userId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ 
            message: 'Project created successfully', 
            projectId: this.lastID 
          });
        }
      );
    }
  },

  // Get all projects
  getAll: (req, res) => {
    db.all(
      `SELECT projects.*, users.username, users.role,
              ideas.title as idea_title
       FROM projects 
       JOIN users ON projects.user_id = users.id
       LEFT JOIN ideas ON projects.idea_id = ideas.id`,
      [],
      (err, projects) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(projects);
      }
    );
  },

  // Get project by ID
  getById: (req, res) => {
    const { id } = req.params;

    db.get(
      `SELECT projects.*, users.username, users.role,
              ideas.title as idea_title, ideas.description as idea_description
       FROM projects 
       JOIN users ON projects.user_id = users.id
       LEFT JOIN ideas ON projects.idea_id = ideas.id
       WHERE projects.id = ?`,
      [id],
      (err, project) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
      }
    );
  },

  // Update project
  update: (req, res) => {
    const { id } = req.params;
    const { title, description, ideaId } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    // Check if user has permission to update
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Only the creator or staff can update
      const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
      if (project.user_id !== userId && !isStaff) {
        return res.status(403).json({ error: 'You do not have permission to update this project' });
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
      if (ideaId !== undefined) {
        updateFields.push('idea_id = ?');
        values.push(ideaId);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Project updated successfully' });
        }
      );
    });
  },

  // Delete project
  delete: (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    // Check if user has permission to delete
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Only the creator or staff can delete
      const isStaff = ['Staff-Admin', 'Staff-Supervisor'].includes(userRole);
      if (project.user_id !== userId && !isStaff) {
        return res.status(403).json({ error: 'You do not have permission to delete this project' });
      }

      db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Project deleted successfully' });
      });
    });
  }
};

module.exports = projectController;
