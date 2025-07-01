import { useEffect, useState } from 'react';

export default function NewsFeed({ tickers, refreshKey }) {
  const [newsData, setNewsData] = useState({});
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleString();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const result = {};
        for (let i = tickers.length - 1; i >= 0; i--) {
          const ticker = tickers[i];
          const res = await fetch(`/api/news?ticker=${ticker}`);
          const json = await res.json();
          result[ticker] = json.news?.slice(0, 10) || [];
        }
        setNewsData(result);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setNewsData({});
      }
      setLoading(false);
    };

    if (tickers.length === 0) {
      setNewsData({});
    } else {
      fetchNews();
    }
  }, [tickers, refreshKey]);

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-4">📈 Latest Stock News</h3>
      {loading ? (
        <p className="text-gray-500">Loading news...</p>
      ) : (
        Object.entries(newsData).map(([ticker, newsList]) => (
          <div key={ticker} className="mb-6">
            <h4 className="text-md font-bold mb-2">{ticker}</h4>
            {(!Array.isArray(newsList) || newsList.length === 0) ? (
              <p className="text-gray-500">No news found for {ticker}.</p>
            ) : (
              <ul className="space-y-2">
                {newsList.map((item, index) => (
                  <li key={index} className="text-sm">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
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
        ))
      )}
    </div>
  );
}
