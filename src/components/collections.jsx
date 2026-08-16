function Collections({ savedSongs, savedReleases }) {
  return (
    <section className="collections-page">

      {/* HEADER */}
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


      {/* SAVED MUSIC */}
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


      {/* SAVED RELEASES */}
      <div className="saved-section">

        <div className="saved-header">

          <div>
            <h2>Saved Releases</h2>

            <p>
              New releases you've saved.
            </p>
          </div>

          <span className="song-count">
            {savedReleases.length} releases
          </span>

        </div>


        <div className="collection-grid">

          {savedReleases.length === 0 ? (

            <p className="empty-message">
              No saved releases yet. Check out New Releases!
            </p>

          ) : (

            savedReleases.map((release) => (

              <div
                className="collection-card"
                key={release.title}
              >

                <div className="collection-icon">
                  {release.emoji}
                </div>

                <h3>{release.title}</h3>

                <p>
                  {release.artist} · {release.genre}
                </p>

                <span>
                  Released {release.date}
                </span>

              </div>

            ))

          )}

        </div>

      </div>

    </section>
  );
}

export default Collections;