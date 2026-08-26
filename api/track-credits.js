import { useState, useEffect } from "react";
import "./MovieModal.css";

function MovieModal({ movie, onClose }) {
  const [credits, setCredits] = useState([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsFound, setCreditsFound] = useState(true);

  useEffect(() => {
    if (!movie || movie.type !== "Music" || !movie.artist || !movie.title) {
      setCredits([]);
      return;
    }

    setCreditsLoading(true);
    fetch(
      `/api/track-credits?artist=${encodeURIComponent(
        movie.artist
      )}&title=${encodeURIComponent(movie.title)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits || []);
        setCreditsFound(data.found !== false);
        setCreditsLoading(false);
      })
      .catch(() => {
        setCredits([]);
        setCreditsLoading(false);
      });
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="movie-modal-backdrop" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <button className="movie-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="movie-modal__player">
          {movie.videoUrl ? (
            movie.videoUrl.includes("youtube.com") ||
            movie.videoUrl.includes("vimeo.com") ? (
              <iframe
                src={movie.videoUrl}
                title={movie.title}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={movie.videoUrl} controls autoPlay />
            )
          ) : (
            <div className="movie-modal__placeholder">
              <span>{movie.emoji}</span>
              <p>No video source added yet for this title.</p>
            </div>
          )}
        </div>

        <div className="movie-modal__info">
          <span className="movie-modal__type">{movie.type}</span>
          <h3>{movie.title}</h3>
          <p>{movie.artist} · {movie.duration}</p>
        </div>

        {movie.type === "Music" && (
          <div className="movie-modal__credits">
            <h4>Credits</h4>
            {creditsLoading && <p className="credits-empty">Loading credits...</p>}
            {!creditsLoading && credits.length === 0 && (
              <p className="credits-empty">
                {creditsFound
                  ? "No credit data available for this track."
                  : "This track wasn't found in the credits database."}
              </p>
            )}
            {!creditsLoading && credits.length > 0 && (
              <ul className="credits-list">
                {credits.map((c, i) => (
                  <li key={i}>
                    <span className="credits-role">{c.role}</span>
                    <span className="credits-name">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieModal;