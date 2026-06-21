const pool = require('../config/database');

// ── GET ALL TASKS ─────────────────────────────────────────────
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (req.user.role === 'maintenance_officer') {
      where.push('mt.assigned_officer = ?');
      params.push(req.user.id);
    }
    if (req.user.role === 'inspector') {
      where.push('mt.inspector_id = ?');
      params.push(req.user.id);
    }

    if (status) { where.push('mt.status = ?'); params.push(status); }
    if (priority) { where.push('mt.priority = ?'); params.push(priority); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereStr = where.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM maintenance_tasks mt WHERE ${whereStr}`, params
    );

    const [tasks] = await pool.query(
      `SELECT mt.*, 
              r.report_number, r.title AS report_title, r.severity, r.status AS report_status,
              rg.name AS region_name,
              u.full_name AS officer_name,
              i.full_name AS inspector_name
       FROM maintenance_tasks mt
       JOIN reports r ON mt.report_id = r.id
       JOIN regions rg ON r.region_id = rg.id
       LEFT JOIN users u ON mt.assigned_officer = u.id
       LEFT JOIN users i ON mt.inspector_id = i.id
       WHERE ${whereStr}
       ORDER BY mt.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getAllTasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

// ── CREATE TASK ───────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { report_id, assigned_team, assigned_officer, inspector_id,
            priority, start_date, estimated_completion, notes, cost_estimate } = req.body;

    // Check report exists
    const [reports] = await pool.query('SELECT id, status FROM reports WHERE id = ?', [report_id]);
    if (!reports.length) return res.status(404).json({ success: false, message: 'Report not found' });

    const [result] = await pool.query(
      `INSERT INTO maintenance_tasks 
       (report_id, assigned_team, assigned_officer, inspector_id, priority, start_date, estimated_completion, notes, cost_estimate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [report_id, assigned_team, assigned_officer || null, inspector_id || null,
       priority || 'normal', start_date || null, estimated_completion || null, notes || null, cost_estimate || null]
    );

    // Update report status to assigned
    await pool.query(
      "UPDATE reports SET status = 'assigned', assigned_to = ?, updated_at = NOW() WHERE id = ?",
      [assigned_officer || null, report_id]
    );

    // Notify assigned officer
    if (assigned_officer) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, report_id) VALUES (?, ?, ?, ?, ?)',
        [assigned_officer, 'New Maintenance Assignment', `You have been assigned a maintenance task for report #${reports[0].id}`, 'assignment', report_id]
      );
    }

    res.status(201).json({ success: true, message: 'Task created', data: { id: result.insertId } });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

// ── UPDATE TASK PROGRESS ──────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const { progress_percent, status, notes, actual_cost, actual_completion } = req.body;
    const taskId = req.params.id;

    const [tasks] = await pool.query('SELECT * FROM maintenance_tasks WHERE id = ?', [taskId]);
    if (!tasks.length) return res.status(404).json({ success: false, message: 'Task not found' });

    const updates = {};
    if (progress_percent !== undefined) updates.progress_percent = progress_percent;
    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (actual_cost) updates.actual_cost = actual_cost;
    if (actual_completion) updates.actual_completion = actual_completion;
    updates.updated_at = new Date();

    await pool.query('UPDATE maintenance_tasks SET ? WHERE id = ?', [updates, taskId]);

    // Sync report progress
    if (progress_percent !== undefined) {
      await pool.query(
        'UPDATE reports SET progress_percent = ?, updated_at = NOW() WHERE id = ?',
        [progress_percent, tasks[0].report_id]
      );
    }

    if (status === 'completed') {
      await pool.query(
        "UPDATE reports SET status = 'completed', progress_percent = 100, resolved_at = NOW() WHERE id = ?",
        [tasks[0].report_id]
      );
    } else if (status === 'in_progress') {
      await pool.query(
        "UPDATE reports SET status = 'in_progress', updated_at = NOW() WHERE id = ?",
        [tasks[0].report_id]
      );
    }

    res.json({ success: true, message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// ── GET SINGLE TASK ───────────────────────────────────────────
exports.getTask = async (req, res) => {
  try {
    const [tasks] = await pool.query(
      `SELECT mt.*, 
              r.report_number, r.title AS report_title, r.description, r.severity, r.issue_type,
              r.latitude, r.longitude, r.address,
              rg.name AS region_name,
              u.full_name AS officer_name, u.email AS officer_email,
              i.full_name AS inspector_name
       FROM maintenance_tasks mt
       JOIN reports r ON mt.report_id = r.id
       JOIN regions rg ON r.region_id = rg.id
       LEFT JOIN users u ON mt.assigned_officer = u.id
       LEFT JOIN users i ON mt.inspector_id = i.id
       WHERE mt.id = ?`,
      [req.params.id]
    );

    if (!tasks.length) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: tasks[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
};
