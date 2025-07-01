import { useEffect, useState } from 'react';

export default function RedditFeed({ tickers, refreshKey }) {
  const [postsData, setPostsData] = useState({});
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState('popularity');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reddit?tickers=${tickers.join(',')}`);
        const json = await res.json();
        const allPosts = json.posts || {};
        const general = json.general || [];

        const perTickerPosts = {};
        const generalFlattened = [];

        Object.entries(allPosts).forEach(([ticker, posts]) => {
          if (!Array.isArray(posts)) return;

          const maxScore = Math.max(...posts.map(p => Math.max(p.ups || 0, p.num_comments || 0)));
          const enriched = posts.map(post => {
            const score = Math.max(post.ups || 0, post.num_comments || 0);
            const popularity = maxScore > 0 ? ((score / maxScore) * 10).toFixed(1) : '0.0';
            return {
              ...post,
              popularity,
              num_comments: post.num_comments || 0,
              ups: post.ups || 0,
              subreddit: post.subreddit || 'unknown',
              created_utc: post.created_utc || null,
            };
          });

          // Filter based on min popularity
          perTickerPosts[ticker] = enriched.filter(p => parseFloat(p.popularity) >= 2);
        });

        // Normalize general posts
        const maxGeneralScore = Math.max(...general.map(p => Math.max(p.ups || 0, p.num_comments || 0)));
        const enrichedGeneral = general.map(post => {
          const score = Math.max(post.ups || 0, post.num_comments || 0);
          return {
            ...post,
            popularity: maxGeneralScore > 0 ? ((score / maxGeneralScore) * 10).toFixed(1) : '0.0',
          };
        }).filter(p => parseFloat(p.popularity) >= 2);

        setPostsData(perTickerPosts);
        setPopularPosts(enrichedGeneral.sort((a, b) => b.popularity - a.popularity));
      } catch (err) {
        console.error('Reddit fetch error:', err);
        setPostsData({});
        setPopularPosts([]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [tickers, refreshKey]);

  const getColorByRank = (rank) => {
    const num = parseFloat(rank);
    if (num >= 8) return 'text-red-600';
    if (num >= 5) return 'text-orange-500';
    if (num >= 2) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const formatDate = (utc) => new Date(utc * 1000).toLocaleString();

  const sortPosts = (posts) => {
    if (sortOption === 'upvotes') return [...posts].sort((a, b) => b.ups - a.ups);
    if (sortOption === 'comments') return [...posts].sort((a, b) => b.num_comments - a.num_comments);
    return [...posts].sort((a, b) => b.popularity - a.popularity);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="text-lg font-semibold mb-4">📢 Reddit Feed</h3>

      <div className="mb-4">
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          className="border px-2 py-1 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="popularity">Popularity</option>
          <option value="upvotes">Upvotes</option>
          <option value="comments">Comments</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading Reddit posts...</p>
      ) : (
        <>
          {[...Object.entries(postsData)].reverse().map(([ticker, posts]) => (
            <div key={ticker} className="mb-6">
              <h4 className="text-md font-bold mb-2">{ticker}</h4>
              {(!Array.isArray(posts) || posts.length === 0) ? (
                <p className="text-gray-500">No Reddit posts found for {ticker}.</p>
              ) : (
                <ul className="space-y-2">
                  {sortPosts(posts).map((post, index) => (
                    <li key={index} className="text-sm">
                      <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {post.title}
                      </a>
                      <div className={`text-xs ${getColorByRank(post.popularity)}`}>
                        Popularity Rank: {post.popularity} • Upvotes: {post.ups} • Comments: {post.num_comments}<br />
                        Subreddit: r/{post.subreddit} • Posted: {formatDate(post.created_utc)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {popularPosts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">🔥 Most Popular Reddit Posts</h3>
              <ul className="space-y-2">
                {sortPosts(popularPosts).map((post, index) => (
                  <li key={index} className="text-sm">
                    <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      [{post.ticker}] {post.title}
                    </a>
                    <div className={`text-xs ${getColorByRank(post.popularity)}`}>
                      Popularity Rank: {post.popularity} • Upvotes: {post.ups} • Comments: {post.num_comments}<br />
                      Subreddit: r/{post.subreddit} • Posted: {formatDate(post.created_utc)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
