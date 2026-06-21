// ── maintenance.js ────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/maintenanceController');
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, requireStaff, ctrl.getAllTasks);
router.get('/:id', authenticateToken, requireStaff, ctrl.getTask);
router.post('/', authenticateToken, requireAdmin, ctrl.createTask);
router.patch('/:id', authenticateToken, requireStaff, ctrl.updateTask);

module.exports = router;
