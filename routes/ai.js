router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: 'Messages required' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return res.json({ reply: "AI assistant needs ANTHROPIC_API_KEY configured in Render. Get your free key at console.anthropic.com and add it to Render environment variables!" });
  }
  const systemPrompt = `You are an AI earning assistant helping users in India earn money online through Fiverr, MTurk, ySense, Adobe Stock and other platforms. Be practical and give step-by-step guidance.`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1024, system: systemPrompt, messages })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.content?.[0]?.text || 'No response.' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});