import { useRef, useState } from "react";
import "./MovieCard.css";

function getYouTubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function MovieCard({ movie, onPlay }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const posterUrl = getYouTubeThumbnail(movie.videoUrl) || movie.poster;

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

  return (
    <div
      className="movie-card-scene"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPlay(movie)}
    >
      <div
        ref={cardRef}
        className="movie-card"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
        }}
      >
        <div className="movie-card__art-overlay" />
        <div className="movie-card__glow" />
        <div className="movie-card__sheen" />

        <div className="movie-card__thumb">
          {!posterUrl && <span className="movie-card__emoji">{movie.emoji}</span>}
          <div className="movie-card__play">▶</div>
          <span className="movie-card__duration">{movie.duration}</span>
        </div>

        <div className="movie-card__body">
          <span className="movie-card__type">{movie.type}</span>
          <h4>{movie.title}</h4>
          <p>{movie.artist}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;