// api/youtube-search.js
// Takes a search query (e.g. "?q=blinding lights") and returns
// real video results from YouTube: title, channel, thumbnail, video ID.

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query (?q=...)' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  return res.status(200).json({ debugKeyLength: apiKey ? apiKey.length : 0, debugKeyStart: apiKey ? apiKey.slice(0, 6) : 'MISSING' });

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
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
  }));

  return res.status(200).json({ tracks });
}