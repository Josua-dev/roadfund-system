const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usersController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, requireAdmin, ctrl.getAllUsers);
router.post('/', authenticateToken, requireAdmin, ctrl.createUser);
router.put('/:id', authenticateToken, requireAdmin, ctrl.updateUser);
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, ctrl.toggleStatus);
router.patch('/:id/reset-password', authenticateToken, requireAdmin, ctrl.resetPassword);

module.exports = router;
