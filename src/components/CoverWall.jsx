import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MovieModal from "./MovieModal";
import "./CoverWall.css";
import { cachedJson } from "../lib/cachedFetch";

const ROWS = 3;
const PER_ROW = 12;

function CoverWall() {
  const [covers, setCovers] = useState([]);
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const charts = cachedJson("/api/youtube-charts", 30 * 60 * 1000)
      .then((d) => d.tracks || [])
      .catch(() => []);

    const community = supabase
      .from("reviews")
      .select("song_title, artist, thumbnail, video_id")
      .not("thumbnail", "is", null)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) =>
        (data || []).map((r) => ({
          id: r.video_id || r.thumbnail,
          title: r.song_title,
          artist: r.artist,
          thumbnail: r.thumbnail,
          videoId: r.video_id,
        }))
      )
      .catch(() => []);

    Promise.all([charts, community]).then(([chartTracks, reviewTracks]) => {
      if (cancelled) return;

      const seen = new Set();
      const merged = [...chartTracks, ...reviewTracks]
        .filter((t) => t.thumbnail)
        .map((t) => ({ ...t, videoId: t.videoId || t.id }))
        .filter((t) => {
          const key = t.thumbnail;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      setCovers(merged);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (covers.length === 0) {
    return loaded ? null : <div className="cover-wall cover-wall--empty" aria-hidden="true" />;
  }

  const rows = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: PER_ROW }, (_, k) => covers[(k + r * 5) % covers.length])
  );

  return (
    <section className="cover-wall" aria-label="Trending music">
      <div className="cover-wall__rows">
        {rows.map((row, r) => (
          <div className={`cover-wall__row cover-wall__row--${r}`} key={r}>
            {row.map((song, k) => (
              <button
                key={`${r}-${k}`}
                className="cover-wall__item"
                style={{ "--i": r * PER_ROW + k }}
                onClick={() => song.videoId && setActive(song)}
                aria-label={`Play ${song.title} by ${song.artist}`}
              >
                <img src={song.thumbnail} alt="" loading="lazy" width="168" height="168" />
                <span className="cover-wall__caption">
                  <strong>{song.title}</strong>
                  <small>{song.artist}</small>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {active && (
        <MovieModal
          movie={{
            type: "Music",
            title: active.title,
            artist: active.artist,
            videoId: active.videoId,
            videoUrl: `https://www.youtube.com/embed/${active.videoId}`,
            thumbnail: active.thumbnail,
          }}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}

export default CoverWall;