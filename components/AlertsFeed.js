// === FILE: components/AlertsFeed.js ===
import { useEffect, useState } from 'react';

export default function AlertsFeed({ refreshKey }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/alerts');
        const json = await res.json();

        if (!res.ok) {
          console.error('AlertsFeed error payload:', json);
          throw new Error(
            typeof json.error === 'object'
              ? JSON.stringify(json.error)
              : json.error || 'Unknown error from API'
          );
        }

        setTrades(Array.isArray(json.trades) ? json.trades : []);
      } catch (err) {
        console.error('AlertsFeed error:', err);
        setError(err.message || 'Failed to load alerts');
      }

      setLoading(false);
    };

    load();
  }, [refreshKey]);

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-4">🕵️ Insider Trades (SEC Filings)</h3>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && trades.length === 0 && (
        <p className="text-gray-500">No insider trades found in the last 2 weeks.</p>
      )}

      <ul className="space-y-3">
        {trades.map((t, idx) => (
          <li key={idx} className="text-sm border-b pb-2">
            <a href={t.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {t.ticker || 'N/A'} ·{' '}
              <span className={t.transactionType?.toLowerCase() === 'buy' ? 'text-green-600' : 'text-red-600'}>
                {t.transactionType || 'N/A'}
              </span>{' '}
              {t.shares?.toLocaleString() || 0} shares on {t.date || 'N/A'}
            </a>
            <div className="text-gray-500 text-xs">Insider: {t.insider || 'Unknown'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
