// api/youtube-search.js
// Takes a search query (e.g. "?q=blinding lights") and returns
// real video results from YouTube: title, channel, thumbnail, video ID.
function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query (?q=...)' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  

  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(q)}&key=${apiKey}`
  );

  const searchData = await searchResponse.json();

  if (!searchResponse.ok) {
    return res.status(searchResponse.status).json({ error: searchData });
  }

  // Simplify the response to just what vibr needs
  const tracks = searchData.items.map((item) => ({
  id: item.id.videoId,
  title: decodeHtmlEntities(item.snippet.title),
  artist: item.snippet.channelTitle,
  channelId: item.snippet.channelId,
  thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
  publishedAt: item.snippet.publishedAt,
  videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
}));

  return res.status(200).json({ tracks });
}