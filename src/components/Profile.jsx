
import { useState } from "react";
import "./Profile.css";

function Profile({ savedSongs }) {

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("Manas");
  const [username, setUsername] = useState("@manas");
  const [bio, setBio] = useState(
    "Music enthusiast · VIBR explorer · Always discovering something new."
  );
  const songCount = savedSongs.length;

const artistCount = new Set(
  savedSongs.map((song) => song.artist)
).size;

const genreCount = new Set(
  savedSongs.map((song) => song.genre)
).size;
const musicTaste = [
  ...new Set(
    savedSongs.map((song) => song.genre)
  )
];

  return (
    <section className="profile-page">

      <div className="profile-header">

        <div className="profile-avatar">
          MS
        </div>

        <div className="profile-info">

          {editing ? (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profile-edit-input"
                placeholder="Name"
              />

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="profile-edit-input"
                placeholder="Username"
              />

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="profile-edit-input"
                placeholder="Bio"
              />

              <button
                className="profile-edit-button"
                onClick={() => setEditing(false)}
              >
                ✓ Save Profile
              </button>
            </>
          ) : (
            <>
              <h1>{name}</h1>

              <p className="profile-username">
                {username}
              </p>

              <p className="profile-bio">
                {bio}
              </p>

              <button
                className="profile-edit-button"
                onClick={() => setEditing(true)}
              >
                ✎ Edit Profile
              </button>
            </>
          )}

        </div>

      </div>


      <div className="profile-stats">

        <div className="profile-stat">
          <strong>{songCount}</strong>
          <span>Songs</span>
        </div>

        <div className="profile-stat">
         <strong>{artistCount}</strong>
          <span>Artists</span>
        </div>

        <div className="profile-stat">
         <strong>{genreCount}</strong>
          <span>Genres</span>
        </div>

      </div>


      <div className="profile-section">

        <h2>My Music Taste</h2>

        <div className="music-taste">

  {musicTaste.length === 0 ? (
    <p>No saved music yet. Start discovering!</p>
  ) : (
    musicTaste.map((genre) => (
      <span key={genre} className="taste-tag">
        🎵 {genre}
      </span>
    ))
  )}

</div>

      </div>

    </section>
  );
}

export default Profile;
