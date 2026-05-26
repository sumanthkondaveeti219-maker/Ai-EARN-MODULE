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

router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: 'Messages required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    const fallbacks = [
      "I'm your AI earning assistant! To use me fully, add your ANTHROPIC_API_KEY in Render environment variables. Get a free key at console.anthropic.com",
      "For Fiverr: Go to fiverr.com → Join → Create a seller account → Click 'Become a Seller' → Set up your gig with a clear title like 'I will write SEO blog posts using AI' → Price it at ₹500-₹1000 to start.",
      "For ySense: Register at ysense.com → Complete your profile fully → Go to Surveys section → Take 3-5 surveys daily → Minimum payout is $10 via PayPal.",
      "For Amazon MTurk from India: Go to mturk.com → Click 'Get started with Amazon Mechanical Turk' → Sign in with Amazon → Complete worker registration → Start with HITs paying $0.10-$1.00.",
    ];
    return res.json({ reply: fallbacks[Math.floor(Math.random()*fallbacks.length)] });
  }

  const systemPrompt = `You are an AI earning assistant helping users in India earn money online through legitimate part-time work. You help with:
1. Freelance writing - write blog posts, product descriptions, emails for clients on Fiverr/Upwork/Internshala
2. AI image/design - generate prompts for Canva AI, Adobe Firefly to sell on Adobe Stock/Shutterstock
3. Data entry - guide users through Amazon MTurk, Appen, Clickworker tasks
4. Surveys - help with ySense, Swagbucks, Toluna strategies
5. Platform setup - step by step account creation guides for all platforms
Be practical, specific and encouraging. Give actionable steps. Format responses clearly with line breaks.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1024, system: systemPrompt, messages })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.content?.[0]?.text || 'No response generated.';
    res.json({ reply });
  } catch(e) {
    res.status(500).json({ error: 'AI request failed: ' + e.message });
  }
});
