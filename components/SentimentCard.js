// components/SentimentCard.js
export default function SentimentCard({ symbol, sentimentScore, redditMentions, newsSentiment }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-gray-800">{symbol}</h3>
      <p>Sentiment Score: <span className="text-green-600 font-semibold">{sentimentScore}</span></p>
      <p>Reddit Mentions: {redditMentions}</p>
      <p>News Sentiment: {newsSentiment}</p>
    </div>
  );
}
