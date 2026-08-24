// api/spotify-token.js
// This function's ONLY job: ask Spotify for a temporary access token
// using your Client ID + Secret. This token is required for any
// search/metadata request we make to Spotify later.

export default async function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Spotify wants Client ID + Secret combined and base64-encoded
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data });
  }

  // data.access_token is what we'll use in the next step to search Spotify
  return res.status(200).json(data);
}