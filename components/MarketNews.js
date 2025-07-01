// === FILE: components/MarketNews.js ===
import { useEffect, useState } from 'react';

export default function MarketNews() {
  const [marketNews, setMarketNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp) =>
    new Date(timestamp * 1000).toLocaleString();

  useEffect(() => {
    const fetchMarketNews = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/news?type=general'); // Update your API accordingly
        const data = await res.json();
        setMarketNews(data.news?.slice(0, 20) || []);
      } catch (err) {
        console.error('Error fetching market news:', err);
        setMarketNews([]);
      }
      setLoading(false);
    };

    fetchMarketNews();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow border mb-6">
      {loading ? (
        <p className="text-gray-500">Loading market news...</p>
      ) : marketNews.length === 0 ? (
        <p className="text-gray-500">No market news found.</p>
      ) : (
        <ul className="space-y-2">
          {marketNews.map((item, index) => (
            <li key={index} className="text-sm">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.headline}
              </a>
              <div className="text-gray-500 text-xs">
                {formatTime(item.datetime)} • Sentiment: {item.sentiment}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
