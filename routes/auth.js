const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../middleware/db');

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const db = getDb();
  if (db.users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });
  const id = Date.now();
  const hash = bcrypt.hashSync(password, 10);
  db.users.push({ id, name, email, password: hash });
  saveDb(db);
  const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.json({ token, user: { id, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  const db = getDb();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;