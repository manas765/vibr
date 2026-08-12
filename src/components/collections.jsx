function Collections({ savedSongs }) {
  return (
    <section className="collections-page">

      <div className="collections-header">
        <div>
          <h1>My Collections</h1>
          <p>
            Your saved music, all in one place.
          </p>
        </div>

        <button className="create-collection">
          ＋ New Collection
        </button>
      </div>

      <div className="saved-section">

        <div className="saved-header">
          <div>
            <h2>Saved Music</h2>
            <p>
              Songs you've saved on VIBR.
            </p>
          </div>

          <span className="song-count">
            {savedSongs.length} songs
          </span>
        </div>

        <div className="collection-grid">

          {savedSongs.length === 0 ? (
            <p className="empty-message">
              No saved songs yet. Start discovering music!
            </p>
          ) : (
            savedSongs.map((song) => (
              <div
                className="collection-card"
                key={song.title}
              >

                <div className="collection-icon">
                  {song.emoji}
                </div>

                <h3>{song.title}</h3>

                <p>
                  {song.artist} · {song.genre}
                </p>

              </div>
            ))
          )}

        </div>

      </div>

    </section>
  );
}

export default Collections;