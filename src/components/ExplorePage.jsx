import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ExplorePage.css";

const EXPLORE_CATEGORIES = [
  { label: "Trending Now", query: "trending music 2026", color: "#c6ff3d" },
  { label: "Hip-Hop", query: "hip hop hits", color: "#3d9cff" },
  { label: "Pop", query: "pop hits 2026", color: "#ff5db1" },
  { label: "Electronic", query: "electronic music mix", color: "#8b5cf6" },
];

function ExplorePage() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all(
      EXPLORE_CATEGORIES.map((cat) =>
        fetch(`/api/youtube-search?q=${encodeURIComponent(cat.query)}`)
          .then((res) => res.json())
          .then((data) => ({ label: cat.label, tracks: data.tracks || [] }))
      )
    ).then((results) => {
      const grouped = {};
      results.forEach((r) => {
        grouped[r.label] = r.tracks;
      });
      setRows(grouped);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="explore-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="explore-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="explore-header">
        <h1>Explore</h1>
        <p>Trending picks pulled straight from YouTube Music.</p>
      </div>

      {EXPLORE_CATEGORIES.map((cat) => (
        <div className="platform-row" key={cat.label}>
          <div className="platform-row__label">
            <span
              className="platform-badge"
              style={{
                color: cat.color,
                borderColor: `${cat.color}55`,
                background: `${cat.color}14`,
              }}
            >
              {cat.label}
            </span>
            <h2>{cat.label}</h2>
          </div>

          <div className="platform-scroll">
            {(rows[cat.label] || []).slice(0, 8).map((track) => (
              <a
                key={track.id}
                href={track.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pick-card"
              >
                <div className="pick-card__cover">
                  <img src={track.thumbnail} alt={track.title} />
                </div>
                <h3>{track.title}</h3>
                <p>{track.artist}</p>
                <span className="pick-card__cta" style={{ color: cat.color }}>
                  Watch on YouTube ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ExplorePage;