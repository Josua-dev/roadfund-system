// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], ctrl.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], ctrl.login);

router.get('/profile', authenticateToken, ctrl.getProfile);
router.put('/profile', authenticateToken, ctrl.updateProfile);
router.put('/change-password', authenticateToken, ctrl.changePassword);

module.exports = router;
