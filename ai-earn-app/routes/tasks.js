const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { category, title, description, platform, earnings } = req.body;
  if (!category || !title) return res.status(400).json({ error: 'Category and title required' });
  const result = db.prepare(
    'INSERT INTO tasks (user_id, category, title, description, platform, earnings) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, category, title, description || '', platform || '', earnings || 0);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.json(task);
});

router.patch('/:id/complete', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.prepare("UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").run(task.id);
  if (task.earnings > 0) {
    db.prepare('INSERT INTO earnings (user_id, task_id, amount, platform, status) VALUES (?, ?, ?, ?, ?)').run(
      req.user.id, task.id, task.earnings, task.platform, 'earned'
    );
  }
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
  res.json(updated);
});

router.patch('/:id/ai-output', (req, res) => {
  const { ai_output } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.prepare('UPDATE tasks SET ai_output = ? WHERE id = ?').run(ai_output, task.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
  res.json({ success: true });
});

module.exports = router;
