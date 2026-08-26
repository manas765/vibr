// api/track-credits.js
// Looks up composer/lyricist/performer credits for a track via MusicBrainz (free, no key required)

export default async function handler(req, res) {
  const { artist, title } = req.query;

  if (!artist || !title) {
    return res.status(400).json({ error: "artist and title are required" });
  }

  const headers = {
    "User-Agent": "vibr/1.0 (https://vibr-tau.vercel.app)",
  };

  try {
    // Step 1: find the recording
    const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(
      `recording:"${title}" AND artist:"${artist}"`
    )}&fmt=json&limit=1`;

    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    const recording = searchData.recordings?.[0];
    if (!recording) {
      return res.status(200).json({ credits: [], found: false });
    }

    // Step 2: fetch the recording with relationship + work data
    const detailUrl = `https://musicbrainz.org/ws/2/recording/${recording.id}?fmt=json&inc=artist-rels+work-rels`;
    const detailRes = await fetch(detailUrl, { headers });
    const detailData = await detailRes.json();

    const credits = [];

    // Direct artist relationships on the recording (e.g. performer, producer)
    (detailData.relations || []).forEach((rel) => {
      if (rel.artist) {
        credits.push({ role: rel.type, name: rel.artist.name });
      }
    });

    // If there's a linked work, fetch its relationships (composer, lyricist)
    const work = (detailData.relations || []).find((r) => r.work)?.work;
    if (work) {
      const workUrl = `https://musicbrainz.org/ws/2/work/${work.id}?fmt=json&inc=artist-rels`;
      const workRes = await fetch(workUrl, { headers });
      const workData = await workRes.json();

      (workData.relations || []).forEach((rel) => {
        if (rel.artist) {
          credits.push({ role: rel.type, name: rel.artist.name });
        }
      });
    }

    return res.status(200).json({ credits, found: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch credits" });
  }
}