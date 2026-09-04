import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PostThreadModal from "./PostThreadModal";
import "./ArtistCommunity.css";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ArtistCommunity({ artistName }) {
  const [posts, setPosts] = useState([]);
  const [replyCounts, setReplyCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");

  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [posting, setPosting] = useState(false);

  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setUsername(data?.username || "Anonymous"));
      }
    });
  }, []);

  useEffect(() => {
    loadPosts();
  }, [artistName]);

  function loadPosts() {
    setLoading(true);

    supabase
      .from("community_posts")
      .select("*")
      .eq("artist_name", artistName)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          setPosts([]);
          setLoading(false);
          return;
        }

        setPosts(data);
        setLoading(false);

        const postIds = data.map((p) => p.id);
        if (postIds.length === 0) {
          setReplyCounts({});
          return;
        }

        supabase
          .from("community_replies")
          .select("post_id")
          .in("post_id", postIds)
          .then(({ data: replyRows }) => {
            const counts = {};
            (replyRows || []).forEach((r) => {
              counts[r.post_id] = (counts[r.post_id] || 0) + 1;
            });
            setReplyCounts(counts);
          });
      });
  }

  async function submitPost() {
    if (!newTitle.trim() || !newBody.trim() || !currentUser) return;

    setPosting(true);

    const { error } = await supabase.from("community_posts").insert({
      artist_name: artistName,
      user_id: currentUser.id,
      username: username || "Anonymous",
      title: newTitle.trim(),
      body: newBody.trim(),
    });

    setPosting(false);

    if (!error) {
      setNewTitle("");
      setNewBody("");
      setShowComposer(false);
      loadPosts();
    }
  }

  return (
    <div className="artist-community">
      <div className="artist-community__header">
        <div>
          <h3>Community</h3>
          <p>Discuss {artistName} with other fans.</p>
        </div>

        {currentUser && (
          <button
            className="artist-community__new-post"
            onClick={() => setShowComposer((v) => !v)}
          >
            {showComposer ? "Cancel" : "+ New Post"}
          </button>
        )}
      </div>

      {showComposer && (
        <div className="artist-community__composer">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={120}
          />
          <textarea
            placeholder="What's on your mind?"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={4}
          />
          <button onClick={submitPost} disabled={posting || !newTitle.trim() || !newBody.trim()}>
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      {loading && <p className="artist-community__empty">Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <p className="artist-community__empty">
          No posts yet. {currentUser ? "Be the first to start a discussion." : "Log in to start one."}
        </p>
      )}

      <div className="artist-community__list">
        {posts.map((post) => (
          <button
            key={post.id}
            className="artist-community__post"
            onClick={() => setOpenPost(post)}
          >
            <div className="artist-community__post-main">
              <h4>{post.title}</h4>
              <p>{post.body}</p>
            </div>
            <div className="artist-community__post-meta">
              <span>{post.username}</span>
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
              <span>·</span>
              <span>{replyCounts[post.id] || 0} repl{(replyCounts[post.id] || 0) === 1 ? "y" : "ies"}</span>
            </div>
          </button>
        ))}
      </div>

      <PostThreadModal
        post={openPost}
        currentUser={currentUser}
        username={username}
        onClose={() => {
          setOpenPost(null);
          loadPosts();
        }}
        onPostDeleted={() => {
          setOpenPost(null);
          loadPosts();
        }}
      />
    </div>
  );
}

export default ArtistCommunity;