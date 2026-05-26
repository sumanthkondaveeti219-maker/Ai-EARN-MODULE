const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../middleware/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const tasks = db.tasks.filter(t => t.user_id === req.user.id).reverse();
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { category, title, description, platform, earnings } = req.body;
  if (!category || !title) return res.status(400).json({ error: 'Category and title required' });
  const db = getDb();
  const task = { id: Date.now(), user_id: req.user.id, category, title, description: description || '', platform: platform || '', earnings: earnings || 0, status: 'pending', ai_output: '', created_at: new Date().toISOString() };
  db.tasks.push(task);
  saveDb(db);
  res.json(task);
});

router.patch('/:id/complete', (req, res) => {
  const db = getDb();
  const task = db.tasks.find(t => t.id == req.params.id && t.user_id === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = 'completed';
  task.completed_at = new Date().toISOString();
  if (task.earnings > 0) {
    db.earnings.push({ id: Date.now(), user_id: req.user.id, task_id: task.id, amount: task.earnings, platform: task.platform, status: 'earned', note: task.title, created_at: new Date().toISOString() });
  }
  saveDb(db);
  res.json(task);
});

router.patch('/:id/ai-output', (req, res) => {
  const db = getDb();
  const task = db.tasks.find(t => t.id == req.params.id && t.user_id === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.ai_output = req.body.ai_output;
  saveDb(db);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const idx = db.tasks.findIndex(t => t.id == req.params.id && t.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  db.tasks.splice(idx, 1);
  saveDb(db);
  res.json({ success: true });
});

module.exports = router;