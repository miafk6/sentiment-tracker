// === FILE: pages/index.js ===
import RedditFeed from '../components/RedditFeed';
import NewsFeed from '../components/NewsFeed';


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-center text-blue-700">📊 Market Sentiment Tracker</h1>
        <p className="mt-2 text-center text-gray-600">Track stock sentiment from Reddit and news headlines</p>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📰 Latest News</h2>
          <NewsFeed />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📢 Reddit Trends</h2>
          <RedditFeed />
        </section>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Sentiment Tracker. All rights reserved.
      </footer>
    </div>
  );
}
