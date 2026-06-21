const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB to ensure they're still active
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, region_id, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User account is inactive or not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

// Require specific role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// Require admin
const requireAdmin = requireRole('admin');

// Require admin or inspector
const requireInspector = requireRole('admin', 'inspector');

// Require admin or maintenance officer
const requireOfficer = requireRole('admin', 'maintenance_officer');

// Require any staff role (not citizen)
const requireStaff = requireRole('admin', 'inspector', 'maintenance_officer');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireInspector,
  requireOfficer,
  requireStaff,
};
