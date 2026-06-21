const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Helper: generate JWT
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper: log audit
const auditLog = async (userId, action, entityType, entityId, ip) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, ip]
    );
  } catch (_) {}
};

// ── REGISTER ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { full_name, email, password, role = 'citizen', region_id, phone } = req.body;

  try {
    // Check if email taken
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Only allow citizen role from public registration; staff created by admin
    const safeRole = ['citizen'].includes(role) ? role : 'citizen';

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, region_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, password_hash, safeRole, region_id || null, phone || null]
    );

    const userId = result.insertId;
    await auditLog(userId, 'REGISTER', 'users', userId, req.ip);

    const token = generateToken(userId);

    const [user] = await pool.query(
      'SELECT id, full_name, email, role, region_id, phone, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({ success: true, message: 'Account created successfully', token, user: user[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, role, region_id, phone, avatar_url, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    await auditLog(user.id, 'LOGIN', 'users', user.id, req.ip);

    const token = generateToken(user.id);
    const { password_hash, ...safeUser } = user;

    res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ── GET PROFILE ───────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.region_id, u.phone, u.avatar_url, 
              u.is_active, u.last_login, u.created_at, r.name AS region_name
       FROM users u LEFT JOIN regions r ON u.region_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { full_name, phone, region_id } = req.body;

  try {
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ?, region_id = ?, updated_at = NOW() WHERE id = ?',
      [full_name, phone || null, region_id || null, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT id, full_name, email, role, region_id, phone, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Profile updated', user: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
};
