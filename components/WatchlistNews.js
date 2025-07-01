import { useEffect, useState } from 'react';

export default function WatchlistNews() {
  const [tickerInput, setTickerInput] = useState('');
  const [watchlist, setWatchlist] = useState(['AAPL', 'TSLA']);
  const [newsData, setNewsData] = useState({});

  // Fetch news for all watchlist items
  useEffect(() => {
    const fetchAllNews = async () => {
      const data = {};
      for (const ticker of watchlist) {
        try {
          const res = await fetch(`/api/news?ticker=${ticker}`);
          const json = await res.json();
          data[ticker] = json.news || [];
        } catch (err) {
          data[ticker] = [];
        }
      }
      setNewsData(data);
    };

    if (watchlist.length > 0) fetchAllNews();
  }, [watchlist]);

  const handleAddTicker = () => {
    const newTicker = tickerInput.toUpperCase().trim();
    if (newTicker && !watchlist.includes(newTicker)) {
      setWatchlist([...watchlist, newTicker]);
      setTickerInput('');
    }
  };

  const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleString();

  return (
    <div className="bg-white p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📈 Watchlist News</h2>

      {/* Add Ticker */}
      <div className="mb-4 flex items-center gap-2">
        <input
          value={tickerInput}
          onChange={(e) => setTickerInput(e.target.value)}
          placeholder="Enter ticker (e.g. MSFT)"
          className="border px-2 py-1 rounded w-40"
        />
        <button
          onClick={handleAddTicker}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* News per Ticker */}
      {watchlist.map((ticker) => (
        <div key={ticker} className="mb-6">
          <h3 className="text-lg font-semibold text-blue-700">{ticker}</h3>
          <ul className="space-y-1 text-sm mt-1">
            {newsData[ticker]?.length > 0 ? (
              newsData[ticker].slice(0, 3).map((item, i) => (
                <li key={i}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {item.headline}
                  </a>
                  <div className="text-gray-500">{formatTime(item.datetime)}</div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No news found.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
