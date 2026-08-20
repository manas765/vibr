import "./MovieModal.css";

function MovieModal({ movie, onClose }) {
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
      </div>
    </div>
  );
}

export default MovieModal;