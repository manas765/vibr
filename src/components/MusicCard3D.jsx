import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import "./MusicCard3D.css";

function MusicCard3D({
  title,
  artist,
  genre,
  verdict,
  emoji,
  savedSongs,
  setSavedSongs,
}) {
  const [heard, setHeard] = useState(false);
  const [userVerdict, setUserVerdict] = useState(null);

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isSaved = savedSongs.some((song) => song.title === title);

  function handleMouseMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 10,
      y: (px - 0.5) * 10,
    });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  function toggleSave() {
    if (isSaved) {
      setSavedSongs(savedSongs.filter((song) => song.title !== title));
    } else {
      setSavedSongs([...savedSongs, { title, artist, genre, verdict, emoji }]);
    }
  }

  return (
    <div
      className="music-card-scene"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="music-card"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="music-card__glow" />
        <div className="music-card__sheen" />

        <div className="music-card__body">
          <div className="album-cover">{emoji}</div>

          <h3>{title}</h3>

          <p className="artist">
          <Link to={`/artist/${encodeURIComponent(artist)}`} className="artist-link">
         {artist}
         </Link>{" "}
        · {genre}
        </p>

          <div className="verdict-section">
            <span className="verdict">{userVerdict || verdict}</span>

            <div className="verdict-buttons">
              <button onClick={() => setUserVerdict("🔥 GOD LEVEL")}>
                GOD LEVEL
              </button>
              <button onClick={() => setUserVerdict("💜 PERFECT")}>
                PERFECT
              </button>
              <button onClick={() => setUserVerdict("👍 GOOD")}>GOOD</button>
              <button onClick={() => setUserVerdict("😐 MEHHHHH")}>
                MEHHHHH
              </button>
            </div>
          </div>

          <div className="card-actions">
            <button
              onClick={toggleSave}
              className={isSaved ? "selected" : ""}
            >
              {isSaved ? "✓ Saved" : "＋ Save"}
            </button>

            <button
              onClick={() => setHeard(!heard)}
              className={heard ? "selected" : ""}
            >
              {heard ? "✓ Heard" : "Mark Heard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicCard3D;