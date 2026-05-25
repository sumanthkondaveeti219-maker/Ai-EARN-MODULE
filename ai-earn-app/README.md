# AI Earn Module — Full Stack App

A complete web app to find AI-powered online work, track tasks, and monitor earnings.  
Built with Node.js + Express backend, SQLite database, and a mobile-first frontend.

---

## Features

- User registration & login (JWT auth)
- Task tracker — add, complete, delete tasks
- AI task completion — Claude API writes content, generates image prompts, guides data tasks
- Earnings dashboard — track all income, add manual entries
- Mobile-first UI — works perfectly on phone

---

## Local setup (test on your PC first)

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Edit .env — add your Anthropic API key
# Get a free key at: https://console.anthropic.com

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3000
```

---

## Deploy FREE on Render.com (get a live link)

### Step 1 — Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-earn-app.git
git push -u origin main
```

### Step 2 — Deploy on Render
1. Go to **render.com** → Sign up free
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Render auto-detects the `render.yaml` config
5. Add environment variables:
   - `JWT_SECRET` → any long random string
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com
6. Click **Deploy**
7. In ~2 minutes you get a live URL like `https://ai-earn-app.onrender.com`

### Free tier note
Render's free tier spins down after 15 min of inactivity — first load takes ~30s.  
Upgrade to $7/month for always-on hosting.

---

## Deploy FREE on Railway.app (alternative)

1. Go to **railway.app** → Sign up with GitHub
2. Click **New Project → Deploy from GitHub**
3. Select your repo
4. Add environment variables (same as above)
5. Click **Deploy** → get instant live URL

---

## Project structure

```
ai-earn-app/
├── server.js          # Express server entry point
├── package.json
├── render.yaml        # Render deployment config
├── .env.example       # Environment variables template
├── middleware/
│   ├── db.js          # SQLite database setup
│   └── auth.js        # JWT authentication middleware
├── routes/
│   ├── auth.js        # /api/auth/login + /api/auth/register
│   ├── tasks.js       # /api/tasks CRUD
│   ├── earnings.js    # /api/earnings dashboard
│   └── ai.js          # /api/ai/complete-task (Claude API)
└── public/
    └── index.html     # Full frontend SPA
```

---

## Get your Anthropic API key (free credits)

1. Go to **console.anthropic.com**
2. Sign up → go to API Keys
3. Create a new key
4. New accounts get free credits to start

---

## Withdrawal methods supported (info only)

| Method | Platforms | Speed |
|--------|-----------|-------|
| UPI (GPay/PhonePe) | Fiverr, Internshala | Instant |
| Bank transfer | MTurk, Appen | 2–5 days |
| PayPal | Upwork, Fiverr | 1–3 days |
| Gift cards | ySense, Swagbucks | Instant |
