function MusicCard({ title, artist, genre, verdict, emoji }) {

  return (
    <div className="music-card">

      <div className="album-cover">
        {emoji}
      </div>

      <h3>{title}</h3>

      <p className="artist">
        {artist} · {genre}
      </p>

      <span className="verdict">
        {verdict}
      </span>

      <div className="card-actions">

        <button>
          ＋ Save
        </button>

        <button>
          ✓ Heard
        </button>

      </div>

    </div>
  );
}

export default MusicCard;