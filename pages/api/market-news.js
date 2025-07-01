import axios from 'axios';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    const response = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
    const news = response.data.slice(0, 20); // get latest 10 items
    res.status(200).json({ news });
  } catch (error) {
    console.error('Market news fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
}
