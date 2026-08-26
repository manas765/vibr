import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePersistedState } from "../hooks/usePersistedState";
import "./MusicCard3D.css";
import { supabase } from "../supabaseClient";

const VERDICT_OPTIONS = [
  { key: "godLevel", label: "GOD LEVEL", display: "🔥 GOD LEVEL", color: "#c6ff3d" },
  { key: "perfect", label: "PERFECT", display: "💜 PERFECT", color: "#8b5cf6" },
  { key: "good", label: "GOOD", display: "👍 GOOD", color: "#3d9cff" },
  { key: "meh", label: "MEHHHHH", display: "😐 MEHHHHH", color: "#6b6b78" },
];

function MusicCard3D({
  title,
  artist,
  channelId,
  genre,
  verdict,
  emoji,
  videoId,
  thumbnail,
  embedUrl,
  savedSongs,
  setSavedSongs,
}) {
  const [heard, setHeard] = useState(false);

  const [allVotes, setAllVotes] = usePersistedState("verdictVotes", {});
  const entry = allVotes[title] || {
    counts: { godLevel: 0, perfect: 0, good: 0, meh: 0 },
    mine: null,
  };

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isSaved = savedSongs.some((song) => song.song_title === title || song.title === title);
  const totalVotes = Object.values(entry.counts).reduce((a, b) => a + b, 0);

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

  async function toggleSave() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (isSaved) {
    await supabase
      .from("saved_songs")
      .delete()
      .eq("user_id", user.id)
      .eq("song_title", title);

    setSavedSongs(savedSongs.filter((song) => song.title !== title));
  } else {
    const { data, error } = await supabase
      .from("saved_songs")
      .insert({
        user_id: user.id,
        song_title: title,
        artist,
        genre,
        emoji,
        video_id: videoId,
        thumbnail,
        embed_url: embedUrl,
      })
      .select();

    if (!error) {
      setSavedSongs([...savedSongs, data[0]]);
    }
  }
}

  function castVote(key) {
    if (entry.mine === key) return; // already voted this way

    const newCounts = { ...entry.counts };
    if (entry.mine) {
      newCounts[entry.mine] = Math.max(0, newCounts[entry.mine] - 1);
    }
    newCounts[key] = (newCounts[key] || 0) + 1;

    setAllVotes({
      ...allVotes,
      [title]: { counts: newCounts, mine: key },
    });
  }

  const currentVerdictDisplay =
    VERDICT_OPTIONS.find((v) => v.key === entry.mine)?.display || verdict;

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
          <div className="album-cover">
        {thumbnail ? (
        <img src={thumbnail} alt={title} className="album-cover__img" />
        ) : (
       emoji
       )}
        </div>

          <h3>{title}</h3>

          <p className="artist">
  <Link
    to={`/artist/${encodeURIComponent(artist)}`}
    state={{ channelId: channelId }}
  >
    {artist}
  </Link>{" "}
  · {genre}
</p>

          <div className="verdict-section">
            <span className="verdict">{currentVerdictDisplay}</span>

            <div className="verdict-buttons">
              {VERDICT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => castVote(option.key)}
                  className={entry.mine === option.key ? "voted" : ""}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {totalVotes > 0 && (
              <div className="verdict-meter">
                <div className="verdict-meter__bar">
                  {VERDICT_OPTIONS.map((option) => {
                    const pct = (entry.counts[option.key] / totalVotes) * 100;
                    if (pct === 0) return null;
                    return (
                      <span
                        key={option.key}
                        style={{ width: `${pct}%`, background: option.color }}
                      />
                    );
                  })}
                </div>
                <span className="verdict-meter__label">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""} on this device
                </span>
              </div>
            )}
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