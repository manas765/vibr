import { useState } from "react";
import MusicCard3D from "./MusicCard3D";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

function MusicSection({ searchTerm, savedSongs, setSavedSongs, followedArtists }) {

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
{followedArtists.length > 0 && (
  <div className="following-strip">
    <span className="following-strip__label">Following:</span>
    {followedArtists.map((name) => (
      <Link
        key={name}
        to={`/artist/${encodeURIComponent(name)}`}
        className="following-chip"
      >
        {name}
      </Link>
    ))}
  </div>
)}

     <motion.div
  className="music-grid"
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  }}
>
  {filteredMusic.map((song) => (
    <motion.div
      key={song.title}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <MusicCard3D
        title={song.title}
        artist={song.artist}
        genre={song.genre}
        verdict={song.verdict}
        emoji={song.emoji}
        savedSongs={savedSongs}
        setSavedSongs={setSavedSongs}
      />
    </motion.div>
  ))}
</motion.div>

    </section>
  );
}

export default MusicSection;