// Each entry links to a platform SEARCH url (title + artist) rather than a
// hardcoded track ID — IDs go stale or can be wrong, search links always work.

function spotifySearch(title, artist) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
}

function appleMusicSearch(title, artist) {
  return `https://music.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}`;
}

function youtubeMusicSearch(title, artist) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(`${title} ${artist}`)}`;
}

export const platformPicks = [
  {
    platform: "Spotify",
    color: "#1DB954",
    picks: [
      { title: "Blinding Lights", artist: "The Weeknd", emoji: "🌃" },
      { title: "As It Was", artist: "Harry Styles", emoji: "🌙" },
      { title: "Flowers", artist: "Miley Cyrus", emoji: "🌸" },
      { title: "Unholy", artist: "Sam Smith, Kim Petras", emoji: "🔥" },
      { title: "Anti-Hero", artist: "Taylor Swift", emoji: "✨" },
    ].map((s) => ({ ...s, link: spotifySearch(s.title, s.artist) })),
  },
  {
    platform: "Apple Music",
    color: "#FA57C1",
    picks: [
      { title: "Cruel Summer", artist: "Taylor Swift", emoji: "☀️" },
      { title: "Stay", artist: "The Kid LAROI, Justin Bieber", emoji: "🌊" },
      { title: "Levitating", artist: "Dua Lipa", emoji: "🪩" },
      { title: "Peaches", artist: "Justin Bieber", emoji: "🍑" },
      { title: "Good 4 U", artist: "Olivia Rodrigo", emoji: "💥" },
    ].map((s) => ({ ...s, link: appleMusicSearch(s.title, s.artist) })),
  },
  {
    platform: "YouTube Music",
    color: "#FF0000",
    picks: [
      { title: "Kill Bill", artist: "SZA", emoji: "🗡️" },
      { title: "Vampire", artist: "Olivia Rodrigo", emoji: "🧛" },
      { title: "Paint The Town Red", artist: "Doja Cat", emoji: "🎨" },
      { title: "greedy", artist: "Tate McRae", emoji: "💚" },
      { title: "Espresso", artist: "Sabrina Carpenter", emoji: "☕" },
    ].map((s) => ({ ...s, link: youtubeMusicSearch(s.title, s.artist) })),
  },
];