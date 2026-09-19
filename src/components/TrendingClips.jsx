import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./TrendingClips.css";

const PLATFORMS = [
  { key: "all", label: "All" },
  { key: "instagram", label: "Instagram", icon: "📸" },
  { key: "tiktok", label: "TikTok", icon: "🎵" },
  { key: "youtube_shorts", label: "YT Shorts", icon: "▶️" },
];

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString([], { month: "short", day: "numeric" });
}

function TrendingClips() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [influencerName, setInfluencerName] = useState("");
  const [influencerHandle, setInfluencerHandle] = useState("");
  const [clipUrl, setClipUrl] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    loadClips();
  }, []);

  function loadClips() {
    setLoading(true);
    supabase
      .from("trending_clips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error) setClips(data || []);
        setLoading(false);
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!songTitle.trim() || !influencerName.trim() || !currentUser) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from("trending_clips")
      .insert({
        song_title: songTitle.trim(),
        artist: artist.trim() || null,
        platform,
        influencer_name: influencerName.trim(),
        influencer_handle: influencerHandle.trim() || null,
        clip_url: clipUrl.trim() || null,
        added_by: currentUser.id,
      })
      .select();

    setSubmitting(false);

    if (!error && data) {
      setClips((prev) => [data[0], ...prev]);
      setSongTitle("");
      setArtist("");
      setInfluencerName("");
      setInfluencerHandle("");
      setClipUrl("");
      setShowForm(false);
    }
  }

  async function handleDelete(id) {
    setClips((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("trending_clips").delete().eq("id", id);
  }

  const visibleClips = filter === "all" ? clips : clips.filter((c) => c.platform === filter);

  return (
    <section className="trending-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="trending-header">
        <div>
          <h1>Trending in Clips</h1>
          <p>
            Songs people are spotting in Reels, TikToks, and Shorts — logged by the
            community, not auto-pulled (Instagram and TikTok don't expose that data
            publicly). See a song in a clip? Add it.
          </p>
        </div>

        <button className="trending-add-button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Log a clip"}
        </button>
      </div>

      {showForm && (
        <form className="trending-form" onSubmit={handleSubmit}>
          <div className="trending-form__row">
            <input
              placeholder="Song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              required
            />
            <input
              placeholder="Artist (optional)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div className="trending-form__row">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube_shorts">YouTube Shorts</option>
            </select>
            <input
              placeholder="Influencer / creator name"
              value={influencerName}
              onChange={(e) => setInfluencerName(e.target.value)}
              required
            />
          </div>

          <div className="trending-form__row">
            <input
              placeholder="@handle (optional)"
              value={influencerHandle}
              onChange={(e) => setInfluencerHandle(e.target.value)}
            />
            <input
              placeholder="Link to the clip (optional)"
              value={clipUrl}
              onChange={(e) => setClipUrl(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add clip"}
          </button>
        </form>
      )}

      <div className="trending-filters">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            className={filter === p.key ? "trending-filter active" : "trending-filter"}
            onClick={() => setFilter(p.key)}
          >
            {p.icon ? `${p.icon} ` : ""}
            {p.label}
          </button>
        ))}
      </div>

      {loading && <p className="trending-empty">Loading...</p>}

      {!loading && visibleClips.length === 0 && (
        <p className="trending-empty">
          Nothing logged here yet. Be the first to add a clip you've spotted.
        </p>
      )}

      <div className="trending-list">
        {visibleClips.map((clip) => {
          const platformMeta = PLATFORMS.find((p) => p.key === clip.platform);
          return (
            <div className="trending-card" key={clip.id}>
              <div className="trending-card__platform">{platformMeta?.icon || "🎵"}</div>

              <div className="trending-card__body">
                <strong>{clip.song_title}</strong>
                {clip.artist && <span className="trending-card__artist">{clip.artist}</span>}
                <p className="trending-card__influencer">
                  used by <strong>{clip.influencer_name}</strong>
                  {clip.influencer_handle && ` (@${clip.influencer_handle.replace(/^@/, "")})`}
                </p>
              </div>

              <div className="trending-card__meta">
                <span className="trending-card__time">{timeAgo(clip.created_at)}</span>
                {clip.clip_url && (
                  <a href={clip.clip_url} target="_blank" rel="noreferrer" className="trending-card__link">
                    View clip ↗
                  </a>
                )}
                {currentUser?.id === clip.added_by && (
                  <button className="trending-card__delete" onClick={() => handleDelete(clip.id)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrendingClips;