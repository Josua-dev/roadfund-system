const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
require('dotenv').config();

// ── Route imports ───────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const reportRoutes       = require('./routes/reports');
const maintenanceRoutes  = require('./routes/maintenance');
const userRoutes         = require('./routes/users');
const analyticsRoutes    = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const regionRoutes       = require('./routes/regions');
const uploadRoutes       = require('./routes/uploads');   // secure upload serving

const app = express();

// ── Security headers (helmet) ────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'blob:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────
// Strict limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit (generous — for dashboard polling etc.)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1 minute
  max: 200,
  message: { success: false, message: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

// Report submission limit (prevent spam)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,
  message: { success: false, message: 'Report submission limit reached. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth',           authLimiter);
app.use('/api',                apiLimiter);
app.use('/api/reports', (req, res, next) => {
  if (req.method === 'POST') return reportLimiter(req, res, next);
  next();
});

// ── Body parsing (tight limits — files go through Multer) ─────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Serve uploads securely via authenticated route ────────────
// Raw static /uploads is removed — access is gated by auth middleware
app.use('/api/uploads', uploadRoutes);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/regions',       regionRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Road Fund Administration API is running',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
  });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  // Don't leak stack traces to clients in production
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n  Road Fund API  ->  http://localhost:' + PORT);
  console.log('  Helmet, rate-limiting, secure uploads: active');
  console.log('  Environment:', process.env.NODE_ENV || 'development', '\n');
});

module.exports = app;
