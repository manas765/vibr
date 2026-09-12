import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import "./Profile.css";

function Profile({ savedSongs }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("username, bio, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || null);
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

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    const filePath = `${user.id}/avatar.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Cache-bust so the new image shows immediately instead of a stale cached one
    const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: freshUrl }).eq("id", user.id);

    setAvatarUrl(freshUrl);
    setUploadingAvatar(false);
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
        <button
          className="profile-avatar profile-avatar--editable"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          title="Change profile picture"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} />
          ) : username ? (
            username.slice(0, 2).toUpperCase()
          ) : (
            "??"
          )}
          <span className="profile-avatar__edit-badge">
            {uploadingAvatar ? "…" : "✎"}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />

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

      <div className="profile-section">
        <h2>My Collection</h2>

        {savedSongs.length === 0 ? (
          <p className="profile-collection-empty">
            Nothing saved yet — songs you save will show up here, visible on your public profile too.
          </p>
        ) : (
          <div className="profile-collection-grid">
            {savedSongs.map((song) => (
              <div className="profile-collection-item" key={song.id || song.song_title}>
                <div className="profile-collection-item__art">
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={song.song_title || song.title} />
                  ) : (
                    "🎵"
                  )}
                </div>
                <strong>{song.song_title || song.title}</strong>
                <small>{song.artist}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Profile;