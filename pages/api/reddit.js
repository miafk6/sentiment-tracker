// === FILE: pages/api/reddit.js ===
import axios from 'axios';

const client_id = process.env.REDDIT_CLIENT_ID;
const client_secret = process.env.REDDIT_CLIENT_SECRET;
const username = process.env.REDDIT_USERNAME;
const password = process.env.REDDIT_PASSWORD;
const user_agent = 'sentiment-tracker-script';

export default async function handler(req, res) {
  const { tickers } = req.query;
  const tickerArray = tickers ? tickers.split(',').map(t => t.trim().toUpperCase()) : [];

  const generalSubreddits = ['stocks', 'investing', 'StockMarket', 'wallstreetbets', 'daytrading', 'options'];
  const allPosts = {};
  const generalPosts = [];

  try {
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const tokenRes = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      `grant_type=password&username=${username}&password=${password}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': user_agent,
        }
      }
    );

    const token = tokenRes.data.access_token;

    for (const ticker of tickerArray) {
      try {
        const postsRes = await axios.get('https://oauth.reddit.com/r/wallstreetbets/search', {
          params: {
            q: `$${ticker}`,
            sort: 'new',
            limit: 20,
          },
          headers: {
            'Authorization': `bearer ${token}`,
            'User-Agent': user_agent,
          }
        });

        const posts = Array.isArray(postsRes.data.data.children)
          ? postsRes.data.data.children.map(post => ({
              title: post.data.title,
              url: `https://reddit.com${post.data.permalink}`,
              ups: post.data.ups,
              num_comments: post.data.num_comments,
              subreddit: post.data.subreddit,
              created_utc: post.data.created_utc,
              ticker,
            }))
          : [];

        allPosts[ticker] = posts;
      } catch (err) {
        console.error(`Failed to fetch posts for ${ticker}:`, err.message);
        allPosts[ticker] = [];
      }
    }

    for (const subreddit of generalSubreddits) {
      try {
        const res = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
          params: { limit: 25 },
          headers: {
            'Authorization': `bearer ${token}`,
            'User-Agent': user_agent,
          }
        });

        const posts = res.data.data.children
          .filter(post => post.data.ups >= 50 || post.data.num_comments >= 50)
          .map(post => ({
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            ups: post.data.ups,
            num_comments: post.data.num_comments,
            subreddit: post.data.subreddit,
            created_utc: post.data.created_utc,
            ticker: post.data.title.match(/\$?[A-Z]{2,5}/)?.[0]?.replace('$', '') || 'N/A'
          }));

        generalPosts.push(...posts);
      } catch (err) {
        console.error(`Failed to fetch posts from r/${subreddit}:`, err.message);
      }
    }

    res.status(200).json({ posts: allPosts, general: generalPosts });
  } catch (error) {
    console.error('Reddit API error:', error);
    res.status(500).json({ error: 'Reddit API request failed.' });
  }
}
