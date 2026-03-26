export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // RSS proxy — GET request with ?team=Patriots
  if (req.method === 'GET') {
    const team = req.query.team;
    if (!team) return res.status(400).json({ error: 'Missing team param' });

    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(team + ' NFL')}&hl=en-US&gl=US&ceid=US:en`;
      const response = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const xml = await response.text();
      res.setHeader('Content-Type', 'application/xml');
      return res.status(200).send(xml);
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  // Anthropic proxy — POST request
  if (req.method === 'POST') {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
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
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).send(text);
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
