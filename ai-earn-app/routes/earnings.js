const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const earnings = db.prepare('SELECT * FROM earnings WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(earnings);
});

router.get('/summary', (req, res) => {
  const uid = req.user.id;
  const total = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM earnings WHERE user_id = ?").get(uid).total;
  const pending = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM earnings WHERE user_id = ? AND status='pending'").get(uid).total;
  const earned = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM earnings WHERE user_id = ? AND status='earned'").get(uid).total;
  const tasksDone = db.prepare("SELECT COUNT(*) as cnt FROM tasks WHERE user_id = ? AND status='completed'").get(uid).cnt;
  const tasksPending = db.prepare("SELECT COUNT(*) as cnt FROM tasks WHERE user_id = ? AND status='pending'").get(uid).cnt;
  const byCategory = db.prepare(`
    SELECT t.category, COUNT(*) as count, COALESCE(SUM(e.amount),0) as earned
    FROM tasks t LEFT JOIN earnings e ON e.task_id = t.id
    WHERE t.user_id = ? GROUP BY t.category
  `).all(uid);
  const recent = db.prepare("SELECT * FROM earnings WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").all(uid);
  res.json({ total, pending, earned, tasksDone, tasksPending, byCategory, recent });
});

router.post('/add', (req, res) => {
  const { amount, platform, note } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  const result = db.prepare('INSERT INTO earnings (user_id, amount, platform, note, status) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, amount, platform || '', note || '', 'earned'
  );
  const entry = db.prepare('SELECT * FROM earnings WHERE id = ?').get(result.lastInsertRowid);
  res.json(entry);
});

module.exports = router;
