import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Profile.css";

function PublicProfile({ setActivePage }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedSongs, setSavedSongs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      loadProfile(user);
    });
  }, [userId]);

  function loadProfile(user) {
    setLoading(true);

    supabase
      .from("profiles")
      .select("id, username, bio, avatar_url")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(data);

        supabase
          .from("saved_songs")
          .select("*")
          .eq("user_id", userId)
          .then(({ data: songs }) => setSavedSongs(songs || []));

        if (user && user.id !== userId) {
          supabase
            .from("followed_users")
            .select("followed_id")
            .eq("follower_id", user.id)
            .eq("followed_id", userId)
            .then(({ data: followRow }) => setIsFollowing((followRow || []).length > 0));
        }

        setLoading(false);
      });
  }

  async function toggleFollow() {
    if (!currentUser) return;

    if (isFollowing) {
      await supabase
        .from("followed_users")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("followed_id", userId);
      setIsFollowing(false);
    } else {
      await supabase
        .from("followed_users")
        .insert({ follower_id: currentUser.id, followed_id: userId });
      setIsFollowing(true);
    }
  }

  if (loading) {
    return (
      <section className="profile-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <p>Loading profile...</p>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="profile-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <h1>Profile not found</h1>
      </section>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const songCount = savedSongs.length;
  const artistCount = new Set(savedSongs.map((s) => s.artist)).size;
  const genreCount = new Set(savedSongs.map((s) => s.genre)).size;
  const musicTaste = [...new Set(savedSongs.map((s) => s.genre))];

  return (
    <section className="profile-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div
        className="profile-header"
        style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
      >
        <div className="profile-header__overlay" />

        <div className="profile-header__content">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} />
            ) : profile.username ? (
              profile.username.slice(0, 2).toUpperCase()
            ) : (
              "??"
            )}
          </div>

          <div className="profile-info">
            <h1>{profile.username || "Unnamed"}</h1>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio || "No bio yet."}</p>
          </div>

          {isOwnProfile ? (
            <button
              className="profile-edit-button"
              onClick={() => {
                setActivePage?.("profile");
                navigate("/");
              }}
            >
              ✎ Edit Your Profile
            </button>
          ) : (
            <div className="public-profile-actions">
              <button
                className={isFollowing ? "public-profile-follow following" : "public-profile-follow"}
                onClick={toggleFollow}
              >
                {isFollowing ? "✓ Following" : "+ Follow"}
              </button>

              {isFollowing && (
                <button
                  className="public-profile-message"
                  onClick={() =>
                    navigate("/messages", {
                      state: { userId, username: profile.username },
                    })
                  }
                >
                  💬 Message
                </button>
              )}
            </div>
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
        <h2>Music Taste</h2>
        <div className="music-taste">
          {musicTaste.length === 0 ? (
            <p>No saved music yet.</p>
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
        <h2>Collection</h2>

        {savedSongs.length === 0 ? (
          <p className="profile-collection-empty">Nothing saved yet.</p>
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

export default PublicProfile;