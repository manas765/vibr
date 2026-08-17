import { useState } from "react";
import MusicCard3D from "./MusicCard3D";

function MusicSection({ searchTerm, savedSongs, setSavedSongs }) {

  const [selectedGenre, setSelectedGenre] = useState("Everything");

  const music = [
  {
    title: "Paper Moons",
    artist: "Luna Park",
    genre: "Indie",
    verdict: "GOD LEVEL",
    emoji: "🌙"
  },
  {
    title: "After Hours",
    artist: "47th Street",
    genre: "Hip-Hop",
    verdict: "PERFECT",
    emoji: "🌃"
  },
  {
    title: "Neon Weather",
    artist: "Nia Ellis",
    genre: "Pop",
    verdict: "GOOD",
    emoji: "🌈"
  },
  {
    title: "Night Drive FM",
    artist: "Mira Vale",
    genre: "Electronic",
    verdict: "PERFECT",
    emoji: "🚗"
  }
];
  const filteredMusic = music.filter((song) => {
  const matchesGenre =
    selectedGenre === "Everything" ||
    song.genre === selectedGenre;

  const matchesSearch =
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesGenre && matchesSearch;
});
  return (
    <section className="music-section">

      <div className="section-heading">

        <div>
          <h2>Picked for you</h2>

          <p>
            Community-first recommendations
            matched to your taste.
          </p>
        </div>

        <button className="refresh">
          Refresh ↻
        </button>

      </div>
      <div className="genre-list">

  {[
    "Everything",
    "Indie",
    "Hip-Hop",
    "Pop",
    "Electronic",
    "R&B",
    "Rock"
  ].map(genre => (

    <button
      key={genre}
      className={
        selectedGenre === genre
          ? "genre active"
          : "genre"
      }
      onClick={() => setSelectedGenre(genre)}
    >
      {genre}
    </button>

  ))}

</div>

     <div className="music-grid">

  {filteredMusic.map((song) => (

    <MusicCard
      key={song.title}
      title={song.title}
      artist={song.artist}
      genre={song.genre}
      verdict={song.verdict}
      emoji={song.emoji}
      savedSongs={savedSongs}
      setSavedSongs={setSavedSongs}
    />

  ))}

</div>

    </section>
  );
}

export default MusicSection;