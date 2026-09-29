import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MovieModal from "./MovieModal";
import "./Songoftheday.css";

const QUICK_REACTIONS = ["🔥", "❤️", "😭", "💀", "👎"];

function Songoftheday() {
  const [currentUser, setCurrentUser] = useState(null);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState([]); // [{emoji, count}]
  const [myReaction, setMyReaction] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    loadTodaysSong();
  }, []);

  function loadTodaysSong() {
    setLoading(true);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    supabase
      .from("reviews")
      .select("song_title, artist, thumbnail, video_id, created_at")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setSong(null);
          setLoading(false);
          return;
        }

        // Group by song_title + artist, pick whichever has the most reviews
        const counts = new Map();
        data.forEach((r) => {
          const key = `${r.song_title}::${r.artist}`;
          if (!counts.has(key)) {
            counts.set(key, { ...r, count: 0 });
          }
          counts.get(key).count += 1;
        });

        const winner = [...counts.values()].sort((a, b) => b.count - a.count)[0];
        setSong(winner);
        loadReactions(winner.song_title);
        setLoading(false);
      });
  }

  function loadReactions(songTitle) {
    const today = new Date().toISOString().slice(0, 10);

    supabase
      .from("song_of_day_reactions")
      .select("emoji, user_id")
      .eq("reaction_date", today)
      .eq("song_title", songTitle)
      .then(({ data, error }) => {
        if (error || !data) return;

        const tally = new Map();
        data.forEach((r) => tally.set(r.emoji, (tally.get(r.emoji) || 0) + 1));
        setReactions([...tally.entries()].map(([emoji, count]) => ({ emoji, count })));

        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            const mine = data.find((r) => r.user_id === user.id);
            setMyReaction(mine?.emoji || null);
          }
        });
      });
  }

  async function react(emoji) {
    if (!currentUser || !song) return;

    setMyReaction(emoji);

    await supabase.from("song_of_day_reactions").upsert(
      {
        reaction_date: new Date().toISOString().slice(0, 10),
        user_id: currentUser.id,
        song_title: song.song_title,
        artist: song.artist,
        emoji,
      },
      { onConflict: "reaction_date,user_id" }
    );

    loadReactions(song.song_title);
  }

  if (loading || !song) return null;

  return (
    <section className="song-of-day">
      <div className="song-of-day__label">🎧 Song of the Day</div>

      <div className="song-of-day__card">
        <button
          className="song-of-day__thumb"
          onClick={() => song.video_id && setShowPlayer(true)}
          disabled={!song.video_id}
        >
          {song.thumbnail ? (
            <img src={song.thumbnail} alt={song.song_title} />
          ) : (
            <span>🎵</span>
          )}
          {song.video_id && <span className="song-of-day__play-badge">▶</span>}
        </button>

        <div className="song-of-day__info">
          <strong>{song.song_title}</strong>
          <span>{song.artist}</span>
        </div>

        <div className="song-of-day__reactions">
          {QUICK_REACTIONS.map((emoji) => {
            const found = reactions.find((r) => r.emoji === emoji);
            return (
              <button
                key={emoji}
                className={myReaction === emoji ? "song-of-day__reaction active" : "song-of-day__reaction"}
                onClick={() => react(emoji)}
              >
                {emoji}
                {found && <span>{found.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {showPlayer && song.video_id && (
        <MovieModal
          movie={{
            type: "Music",
            title: song.song_title,
            artist: song.artist,
            videoId: song.video_id,
            videoUrl: `https://www.youtube.com/embed/${song.video_id}`,
            thumbnail: song.thumbnail,
          }}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </section>
  );
}

export default Songoftheday;