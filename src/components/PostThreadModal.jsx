import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./PostThreadModal.css";

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

function PostThreadModal({ post, currentUser, username, channelId, onClose, onPostDeleted }) {
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!post) {
      setReplies([]);
      return;
    }

    supabase
      .from("community_replies")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setReplies(data || []);
      });
  }, [post]);

  async function submitReply() {
    if (!replyText.trim() || !currentUser || !post) return;

    setPosting(true);

    const { data, error } = await supabase
      .from("community_replies")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        username: username || "Anonymous",
        reply_text: replyText.trim(),
      })
      .select();

    setPosting(false);

    if (!error && data) {
      setReplies([...replies, data[0]]);
      setReplyText("");

      if (post.user_id !== currentUser.id) {
        const link = `/artist/${encodeURIComponent(post.artist_name)}${
          channelId ? `?channelId=${channelId}` : ""
        }`;

        supabase
          .from("notifications")
          .insert({
            user_id: post.user_id,
            actor_username: username || "Anonymous",
            type: "community_reply",
            message: `replied to your post "${post.title}"`,
            link,
          })
          .then(() => {});
      }
    }
  }

  async function deleteReply(replyId) {
    const { error } = await supabase.from("community_replies").delete().eq("id", replyId);
    if (!error) {
      setReplies(replies.filter((r) => r.id !== replyId));
    }
  }

  async function deletePost() {
    if (!post) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", post.id);
    if (!error) {
      onPostDeleted();
    }
  }

  if (!post) return null;

  return (
    <div className="post-modal-backdrop" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="post-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="post-modal__post">
          <h3>{post.title}</h3>
          <div className="post-modal__meta">
            <span>{post.username}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
          <p className="post-modal__body">{post.body}</p>

          {currentUser?.id === post.user_id && (
            <button className="post-modal__delete" onClick={deletePost}>
              Delete post
            </button>
          )}
        </div>

        <div className="post-modal__replies">
          <h4>Replies ({replies.length})</h4>

          {currentUser && (
            <div className="reply-composer">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
              />
              <button onClick={submitReply} disabled={posting || !replyText.trim()}>
                Reply
              </button>
            </div>
          )}

          <div className="reply-list">
            {replies.length === 0 && (
              <p className="post-modal__empty">No replies yet.</p>
            )}
            {replies.map((r) => (
              <div className="reply-item" key={r.id}>
                <strong>{r.username}</strong>
                <span className="reply-item__time">{timeAgo(r.created_at)}</span>
                <p>{r.reply_text}</p>
                {currentUser?.id === r.user_id && (
                  <button className="reply-delete" onClick={() => deleteReply(r.id)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostThreadModal;