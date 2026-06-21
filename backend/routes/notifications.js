// ── notifications.js ──────────────────────────────────────────
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, ctrl.getNotifications);
router.patch('/mark-read', authenticateToken, ctrl.markRead);

module.exports = router;
