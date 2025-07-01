// === FILE: pages/index.js ===
import { useState, useEffect } from 'react'
import NewsFeed     from '../components/NewsFeed'
import RedditFeed   from '../components/RedditFeed'
import MarketNews   from '../components/MarketNews'
import AlertsFeed   from '../components/AlertsFeed'

export default function Home() {
  const [tickers, setTickers]         = useState([])
  const [input, setInput]             = useState('')
  const [refreshKey, setRefreshKey]   = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown]     = useState(30)

  const handleSearch = () => {
    const sym = input.trim().toUpperCase()
    if (sym && !tickers.includes(sym)) setTickers(prev => [...prev, sym])
    setInput('')
  }
  const handleRemove = sym =>
    setTickers(prev => prev.filter(t => t !== sym))

  // auto‐refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return
    const iv = setInterval(() => {
      setRefreshKey(k => k + 1)
      setCountdown(30)
    }, 30000)
    return () => clearInterval(iv)
  }, [autoRefresh])

  // countdown timer
  useEffect(() => {
    if (!autoRefresh) return
    const iv = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(iv)
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          📊 Market Sentiment Tracker
        </h1>
        <p className="mt-2 text-gray-600">
          Track sentiment, market news & insider alerts
        </p>
      </header>

      {/* Three‐column grid: WATCHLIST | MARKET NEWS | INSIDER TRADES */}
      <main
        className="max-w-6xl mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1.1fr 1fr',
          gap: '1rem'
        }}
      >
        {/* LEFT (Watchlist Feeds) */}
        <section className="space-y-6">
          {/* search & controls */}
          <div className="bg-white p-4 rounded-xl shadow border mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border rounded px-3 py-1 w-32"
                  placeholder="Ticker (e.g. AAPL)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={() => setAutoRefresh(a => !a)}
                  />
                  Auto-refresh
                </label>
                {autoRefresh && <span>in {countdown}s</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tickers.map(sym => (
                <span
                  key={sym}
                  className="bg-gray-50 border rounded px-3 py-1 flex items-center gap-2"
                >
                  {sym}
                  <button
                    onClick={() => handleRemove(sym)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Watchlist Feeds */}
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 Watchlist Feeds
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <NewsFeed
                tickers={tickers}
                refreshKey={refreshKey}
                limit={10}
              />
              <RedditFeed
                tickers={tickers}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </section>

        {/* MIDDLE (Overall Market News) */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🌐 Overall Market News
            </h2>
            <MarketNews refreshKey={refreshKey} />
          </div>
        </aside>

        {/* RIGHT (Insider Trades Only) */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border h-full">
            {/* Changed heading to only “Insider Trades” */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔑 Insider Trades (Last 2 Weeks)
            </h2>
            <AlertsFeed refreshKey={refreshKey} />
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Sentiment Tracker. All rights reserved.
      </footer>
    </div>
  )
}
