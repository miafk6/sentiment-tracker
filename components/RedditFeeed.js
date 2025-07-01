import { useEffect, useState } from 'react';
import SentimentCard from './SentimentCard'; // Adjust the path if needed

const tickers = ['GME', 'TSLA', 'AMC', 'AAPL', 'NVDA', 'META'];

export default function RedditFeed() {
  const [data, setData] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        tickers.map(async (ticker) => {
          const res = await fetch(`/api/reddit?ticker=${ticker}`);
          const json = await res.json();
          return {
            ticker,
            mentions: json.mentions || 0,
            posts: json.posts || [],
            sentimentScore: '+0.45', // Placeholder — replace with real score logic if available
            newsSentiment: 'Positive' // Placeholder
          };
        })
      );

      setData(results);

      // Collect trending posts (first 2 per ticker)
      const trending = results.flatMap(item =>
        item.posts.slice(0, 2).map(post => ({
          ...post,
          ticker: item.ticker,
        }))
      );
      setTrendingPosts(trending);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">?? Market Sentiment Tracker</h1>
      <p className="mb-6 text-gray-600">Track stock sentiment from Reddit and news headlines</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <SentimentCard
            key={index}
            symbol={item.ticker}
            sentimentScore={item.sentimentScore}
            redditMentions={item.mentions}
            newsSentiment={item.newsSentiment}
          />
        ))}
      </div>

      <div className="bg-white p-4 mt-8 border rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">?? Reddit Trends</h3>
        <ul className="space-y-2">
          {trendingPosts.map((post, index) => (
            <li key={index}>
              <a href={post.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                [{post.ticker}] {post.title}
              </a> ({post.ups} upvotes)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
