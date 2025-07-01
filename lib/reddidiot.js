import axios from 'axios';

const client_id = process.env.REDDIT_CLIENT_ID;
const client_secret = process.env.REDDIT_CLIENT_SECRET;
const username = 'miafk6@gmail.com';
const password = 'mikaME18!';
const user_agent = 'sentiment-tracker-script';

async function getAccessToken() {
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const res = await axios.post('https://www.reddit.com/api/v1/access_token',
    'grant_type=password&username=' + username + '&password=' + password,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': user_agent
      }
    }
  );
  return res.data.access_token;
}

export async function fetchRedditPosts(ticker) {
  const token = await getAccessToken();

  const res = await axios.get(`https://oauth.reddit.com/r/wallstreetbets/search`, {
    params: {
      q: `$${ticker}`,
      sort: 'new',
      limit: 5,
    },
    headers: {
      'Authorization': `bearer ${token}`,
      'User-Agent': user_agent
    }
  });

  return res.data.data.children.map(post => ({
    title: post.data.title,
    url: `https://reddit.com${post.data.permalink}`,
    ups: post.data.ups,
  }));
}
