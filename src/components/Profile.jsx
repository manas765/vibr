import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import "./Profile.css";

function Profile({ savedSongs }) {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("username, bio")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setUsername(data.username || "");
          setBio(data.bio || "");
        }
        setLoading(false);
      });
  }, [user]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("id", user.id);

    setSaving(false);
    if (!error) setEditing(false);
  }

  const songCount = savedSongs.length;

  const artistCount = new Set(
    savedSongs.map((song) => song.artist)
  ).size;

  const genreCount = new Set(
    savedSongs.map((song) => song.genre)
  ).size;

  const musicTaste = [
    ...new Set(savedSongs.map((song) => song.genre))
  ];

  if (loading) {
    return (
      <section className="profile-page">
        <p>Loading profile...</p>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {username ? username.slice(0, 2).toUpperCase() : "??"}
        </div>

        <div className="profile-info">
          {editing ? (
            <>
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
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "✓ Save Profile"}
              </button>
            </>
          ) : (
            <>
              <h1>{username || "Unnamed"}</h1>

              <p className="profile-username">@{username}</p>

              <p className="profile-bio">
                {bio || "No bio yet."}
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