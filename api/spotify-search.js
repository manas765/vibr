// api/spotify-search.js
// Takes a search query (e.g. "?q=blinding lights") and returns
// real track results from Spotify's catalog: title, artist, album art.

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query (?q=...)' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  console.log('DEBUG - clientId:', JSON.stringify(clientId));
  console.log('DEBUG - clientSecret:', JSON.stringify(clientSecret));
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Step 1: get a fresh access token (same logic as spotify-token.js)
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return res.status(tokenResponse.status).json({ error: tokenData });
  }

  // Step 2: use that token to search Spotify's track catalog
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    }
  );

  const searchData = await searchResponse.json();

  if (!searchResponse.ok) {
    return res.status(searchResponse.status).json({ error: searchData });
  }

  // Step 3: simplify the response to just what vibr needs
  const tracks = searchData.tracks.items.map((track) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    coverArt: track.album.images[0]?.url || null,
    spotifyUrl: track.external_urls.spotify,
    previewUrl: track.preview_url,
  }));

  return res.status(200).json({ tracks });
}