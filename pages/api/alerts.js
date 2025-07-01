import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export default async function handler(req, res) {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const rssUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&owner=only&count=100&output=atom';

    const { data } = await axios.get(rssUrl, {
      headers: {
        'User-Agent': 'SentimentTracker/1.0 (miafk6@gmail.com)', // Replace this
        'Accept-Encoding': 'gzip, deflate',
      }
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(data);
    const entries = parsed.feed?.entry || [];

    const trades = entries
      .map(entry => {
        const title = entry.title || '';
        const summaryText = entry.summary?.['#text'] || '';
        const updated = new Date(entry.updated);
        const link = entry.link?.['@_href'] || '';

        if (updated < twoWeeksAgo) return null;

        const cikMatch = link.match(/CIK=(\d+)/);
        const cik = cikMatch?.[1] || 'N/A';

        const companyMatch = title.match(/4 - (.+?)\s*\(/);
        const company = companyMatch?.[1]?.trim() || 'Unknown';

        const tickerMatch = title.match(/\((.+?)\)/);
        const ticker = tickerMatch?.[1]?.trim() || 'N/A';

        const transactionType = /purchase/i.test(summaryText) ? 'Buy' :
                                /sale/i.test(summaryText) ? 'Sell' : 'N/A';

        const sharesMatch = summaryText.match(/(\d[\d,]*)\s+shares/i);
        const shares = sharesMatch ? sharesMatch[1].replace(/,/g, '') : '0';

        return {
          ticker,
          shares,
          transactionType,
          date: updated.toLocaleDateString(),
          insider: company,
          link,
        };
      })
      .filter(Boolean);

    res.status(200).json({ trades });
  } catch (err) {
    console.error('SEC API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch insider trades' });
  }
}
