const pool = require('../config/database');

// ── OVERVIEW STATS ────────────────────────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const [[totals]] = await pool.query(`
      SELECT
        COUNT(*) AS total_reports,
        SUM(status = 'completed') AS completed,
        SUM(status IN ('reported','under_review')) AS pending,
        SUM(status = 'in_progress') AS in_progress,
        SUM(severity = 'critical') AS critical_count,
        SUM(severity = 'high') AS high_count,
        SUM(DATEDIFF(NOW(), created_at) <= 7) AS this_week,
        SUM(DATEDIFF(NOW(), created_at) <= 30) AS this_month
      FROM reports
    `);

    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(role = 'citizen') AS citizens,
        SUM(role = 'inspector') AS inspectors,
        SUM(role = 'maintenance_officer') AS officers
      FROM users WHERE is_active = 1
    `);

    const [[taskStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_tasks,
        SUM(status = 'completed') AS completed_tasks,
        SUM(status = 'in_progress') AS active_tasks,
        AVG(progress_percent) AS avg_progress,
        SUM(actual_cost) AS total_cost,
        SUM(cost_estimate) AS estimated_cost
      FROM maintenance_tasks
    `);

    res.json({
      success: true,
      data: {
        reports: totals,
        users: userStats,
        tasks: taskStats,
        completion_rate: totals.total_reports
          ? Math.round((totals.completed / totals.total_reports) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('getOverview error:', error);
    res.status(500).json({ success: false, message: 'Analytics fetch failed' });
  }
};

// ── REPORTS BY REGION ─────────────────────────────────────────
exports.getByRegion = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rg.name AS region,
        COUNT(r.id) AS total,
        SUM(r.status = 'completed') AS completed,
        SUM(r.status IN ('reported','under_review','verified')) AS pending,
        SUM(r.severity = 'critical') AS critical
      FROM regions rg
      LEFT JOIN reports r ON r.region_id = rg.id
      GROUP BY rg.id, rg.name
      ORDER BY total DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch region analytics' });
  }
};

// ── MONTHLY TREND ─────────────────────────────────────────────
exports.getMonthlyTrend = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        DATE_FORMAT(created_at, '%b %Y') AS label,
        COUNT(*) AS reported,
        SUM(status = 'completed') AS completed,
        SUM(severity = 'critical') AS critical
      FROM reports
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly trend' });
  }
};

// ── BY SEVERITY ───────────────────────────────────────────────
exports.getBySeverity = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT severity, COUNT(*) AS count FROM reports GROUP BY severity
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch severity data' });
  }
};

// ── BY STATUS ─────────────────────────────────────────────────
exports.getByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS count FROM reports GROUP BY status
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch status data' });
  }
};

// ── BY ISSUE TYPE ─────────────────────────────────────────────
exports.getByIssueType = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT issue_type, COUNT(*) AS count FROM reports GROUP BY issue_type ORDER BY count DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch issue type data' });
  }
};

// ── CITIZEN STATS (personal) ──────────────────────────────────
exports.getCitizenStats = async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'completed') AS completed,
        SUM(status IN ('reported','under_review')) AS pending,
        SUM(status = 'in_progress') AS in_progress,
        SUM(severity = 'critical') AS critical
      FROM reports WHERE reported_by = ?
    `, [req.user.id]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
