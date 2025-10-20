const express = require('express');
const router = express.Router();
const projectStudentController = require('../controllers/projectStudentController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, projectStudentController.create);
router.get('/', requireAuth, projectStudentController.getAll);
router.get('/:id', requireAuth, projectStudentController.getById);
router.put('/:id', requireAuth, projectStudentController.update);
router.delete('/:id', requireAuth, projectStudentController.delete);

module.exports = router;
