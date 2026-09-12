// api/youtube-charts.js
// Pulls YouTube's official "mostPopular" chart filtered to Music (videoCategoryId=10).
// Costs 1 quota unit per call (videos.list), vs 100 units for search.list —
// this is real trending data, not a search result.

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default async function handler(req, res) {
  const regionCode = req.query.region || "US";
  const apiKey = process.env.YOUTUBE_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=25&regionCode=${regionCode}&key=${apiKey}`
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data });
  }

  const tracks = (data.items || []).map((item) => ({
    id: item.id,
    title: decodeHtmlEntities(item.snippet.title),
    artist: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail:
      item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    viewCount: parseInt(item.statistics?.viewCount || "0", 10),
    videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
    embedUrl: `https://www.youtube.com/embed/${item.id}`,
  }));

  return res.status(200).json({ tracks });
}