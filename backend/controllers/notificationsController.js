const pool = require('../config/database');

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, r.report_number FROM notifications n
       LEFT JOIN reports r ON n.report_id = r.id
       WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50`,
      [req.user.id]
    );

    const [[unread]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({ success: true, data: rows, unread_count: unread.count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of notification ids, or 'all'
    if (ids === 'all') {
      await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    } else if (Array.isArray(ids)) {
      await pool.query('UPDATE notifications SET is_read = 1 WHERE id IN (?) AND user_id = ?', [ids, req.user.id]);
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};
