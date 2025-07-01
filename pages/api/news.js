import axios from 'axios';

export default async function handler(req, res) {
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
  const { ticker = 'AAPL' } = req.query;

  if (!FINNHUB_API_KEY) {
    console.error('❌ Missing FINNHUB_API_KEY in environment variables');
    return res.status(500).json({ error: 'API key missing' });
  }

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol: ticker,
        from: getDateNDaysAgo(5),
        to: getDateNDaysAgo(0),
        token: FINNHUB_API_KEY,
      },
    });

    const news = response.data.map(item => ({
      ...item,
      sentiment: 'Positive' // placeholder
    }));

    res.status(200).json({ news });
  } catch (error) {
    console.error('❌ Finnhub News API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
