const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/complete-task', async (req, res) => {
  const { category, title, description } = req.body;
  if (!category || !title) return res.status(400).json({ error: 'Category and title required' });

  const prompts = {
    writing: `You are a professional freelance writer. A client has requested the following task:\n\nTitle: ${title}\nDetails: ${description || 'No extra details'}\n\nWrite a complete, high-quality piece ready to deliver to the client. Be thorough and professional.`,
    design: `You are an AI art director. A client needs the following:\n\nTitle: ${title}\nDetails: ${description || 'No extra details'}\n\nProvide: 1) A detailed image generation prompt they can paste into Canva AI or Adobe Firefly, 2) Style tips, 3) Where to sell this image and expected price range.`,
    data: `You are a data specialist. The following data entry task needs to be completed:\n\nTitle: ${title}\nDetails: ${description || 'No extra details'}\n\nProvide a step-by-step guide on how to complete this task efficiently, including any tools or shortcuts that help.`,
    survey: `You are an online earning expert. The user wants to complete the following micro-task or survey task:\n\nTitle: ${title}\nDetails: ${description || 'No extra details'}\n\nProvide: 1) How to complete this task, 2) Tips to qualify for more surveys, 3) Estimated time and earning, 4) Best platforms for this type of task.`
  };

  const prompt = prompts[category] || `Complete this task professionally:\n\nTitle: ${title}\nDetails: ${description || 'No extra details'}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return res.status(400).json({ error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to your .env file.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const output = data.content?.[0]?.text || 'No output generated.';
    res.json({ output });
  } catch (e) {
    res.status(500).json({ error: 'AI request failed: ' + e.message });
  }
});

module.exports = router;
