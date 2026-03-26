export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // debug temporário
  if (req.headers['x-debug'] === 'true') {
    return res.status(200).json({
      keyExists: !!ANTHROPIC_API_KEY,
      keyLength: ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.length : 0,
      keyStart: ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 20) : 'undefined'
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(text);

  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}