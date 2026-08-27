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

  // Strip characters that break MusicBrainz's Lucene query syntax
  const safeArtist = artist.replace(/["\\]/g, "");
  const safeTitle = title.replace(/["\\]/g, "");

  try {
    // Step 1: find the recording
    const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(
      `recording:"${safeTitle}" AND artist:"${safeArtist}"`
    )}&fmt=json&limit=1`;

    const searchRes = await fetch(searchUrl, { headers });
    if (!searchRes.ok) {
      return res.status(200).json({ credits: [], found: false });
    }
    const searchData = await searchRes.json();

    const recording = searchData.recordings?.[0];
    if (!recording) {
      return res.status(200).json({ credits: [], found: false });
    }

    // Step 2: fetch the recording with relationship + work data
    const detailUrl = `https://musicbrainz.org/ws/2/recording/${recording.id}?fmt=json&inc=artist-rels+work-rels`;
    const detailRes = await fetch(detailUrl, { headers });
    if (!detailRes.ok) {
      return res.status(200).json({ credits: [], found: false });
    }
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
      if (workRes.ok) {
        const workData = await workRes.json();
        (workData.relations || []).forEach((rel) => {
          if (rel.artist) {
            credits.push({ role: rel.type, name: rel.artist.name });
          }
        });
      }
    }

    return res.status(200).json({ credits, found: true });
  } catch (err) {
    return res.status(200).json({ credits: [], found: false });
  }
}