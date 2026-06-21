const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/map', authenticateToken, ctrl.getMapData);
router.get('/', authenticateToken, ctrl.getAllReports);
router.get('/:id', authenticateToken, ctrl.getReport);
router.post('/', authenticateToken, upload.array('images', 5), ctrl.createReport);
router.patch('/:id/status', authenticateToken, requireStaff, ctrl.updateStatus);
router.delete('/:id', authenticateToken, ctrl.deleteReport);

module.exports = router;
