import { useState } from "react";
import MusicCard3D from "./MusicCard3D";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect } from "react";
import MovieModal from "./MovieModal";

function MusicSection({ searchTerm, savedSongs, setSavedSongs, followedArtists }) {

  const [selectedGenre, setSelectedGenre] = useState("Everything");

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

useEffect(() => {
  if (!searchTerm) {
    setTracks([]);
    return;
  }

  const timeoutId = setTimeout(() => {
    setLoading(true);
    fetch(`/api/youtube-search?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.tracks || []);
        setLoading(false);
      });
  }, 500);

  return () => clearTimeout(timeoutId);
}, [searchTerm]);

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
  {tracks.map((song) => (
    <motion.div
      key={song.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setSelectedTrack(song)}
    >
      <MusicCard3D
      title={song.title}
      artist={song.artist}
      genre="Music"
      verdict="NEW"
      emoji="🎵"
      savedSongs={savedSongs}
      setSavedSongs={setSavedSongs}
      />
    </motion.div>
  ))}
</motion.div>
  <MovieModal
  movie={
    selectedTrack
      ? {
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          duration: "",
          type: "Music",
          videoUrl: selectedTrack.embedUrl,
          emoji: "🎵",
        }
      : null
  }
  onClose={() => setSelectedTrack(null)}
  />

    </section>
  );
}

export default MusicSection;