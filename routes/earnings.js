const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../middleware/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.earnings.filter(e => e.user_id === req.user.id).reverse());
});

router.get('/summary', (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const myEarnings = db.earnings.filter(e => e.user_id === uid);
  const myTasks = db.tasks.filter(t => t.user_id === uid);
  const total = myEarnings.reduce((s, e) => s + e.amount, 0);
  const earned = myEarnings.filter(e => e.status === 'earned').reduce((s, e) => s + e.amount, 0);
  const pending = myEarnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const tasksDone = myTasks.filter(t => t.status === 'completed').length;
  const tasksPending = myTasks.filter(t => t.status === 'pending').length;
  const recent = myEarnings.slice(-5).reverse();
  res.json({ total, earned, pending, tasksDone, tasksPending, recent });
});

router.post('/add', (req, res) => {
  const { amount, platform, note } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  const db = getDb();
  const entry = { id: Date.now(), user_id: req.user.id, amount: parseFloat(amount), platform: platform || '', note: note || '', status: 'earned', created_at: new Date().toISOString() };
  db.earnings.push(entry);
  saveDb(db);
  res.json(entry);
});

module.exports = router;