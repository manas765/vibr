export default async function handler(req, res) {
  const { channelId } = req.query;

  if (!channelId) {
    return res.status(400).json({ error: "channelId is required" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=20&key=${apiKey}`;
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;

  const [searchResponse, channelResponse] = await Promise.all([
    fetch(searchUrl),
    fetch(channelUrl),
  ]);

  const searchData = await searchResponse.json();

  if (!searchResponse.ok) {
    return res.status(searchResponse.status).json({ error: searchData });
  }

  const tracks = searchData.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
  }));

  let channelThumbnail = null;
  if (channelResponse.ok) {
    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];
    channelThumbnail =
      channel?.snippet?.thumbnails?.high?.url ||
      channel?.snippet?.thumbnails?.default?.url ||
      null;
  }

  return res.status(200).json({ tracks, channelThumbnail });
}