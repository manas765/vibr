import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./MovieModal.css";

function MovieModal({ movie, onClose }) {
  const [credits, setCredits] = useState([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsFound, setCreditsFound] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!movie || movie.type !== "Music" || !movie.artist || !movie.title) {
      setCredits([]);
      return;
    }

    setCreditsLoading(true);
    fetch(
      `/api/track-credits?artist=${encodeURIComponent(
        movie.artist
      )}&title=${encodeURIComponent(movie.title)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits || []);
        setCreditsFound(data.found !== false);
        setCreditsLoading(false);
      })
      .catch(() => {
        setCredits([]);
        setCreditsLoading(false);
      });
  }, [movie]);

  useEffect(() => {
    if (!movie?.videoId) {
      setComments([]);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    supabase
      .from("comments")
      .select("*")
      .eq("video_id", movie.videoId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setComments(data || []);
      });
  }, [movie]);

  async function postComment() {
    if (!commentText.trim() || !currentUser || !movie?.videoId) return;

    setPostingComment(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", currentUser.id)
      .single();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: currentUser.id,
        username: profile?.username || "Anonymous",
        video_id: movie.videoId,
        comment_text: commentText.trim(),
      })
      .select();

    if (!error && data) {
      setComments([data[0], ...comments]);
      setCommentText("");
    }

    setPostingComment(false);
  }

  async function deleteComment(commentId) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  }

  if (!movie) return null;

  return (
    <div className="movie-modal-backdrop" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <button className="movie-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="movie-modal__player">
          {movie.videoUrl ? (
            movie.videoUrl.includes("youtube.com") ||
            movie.videoUrl.includes("vimeo.com") ? (
              <iframe
                src={movie.videoUrl}
                title={movie.title}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={movie.videoUrl} controls autoPlay />
            )
          ) : (
            <div className="movie-modal__placeholder">
              <span>{movie.emoji}</span>
              <p>No video source added yet for this title.</p>
            </div>
          )}
        </div>

        <div className="movie-modal__info">
          <span className="movie-modal__type">{movie.type}</span>
          <h3>{movie.title}</h3>
          <p>{movie.artist} · {movie.duration}</p>
        </div>

        {movie.type === "Music" && (
          <div className="movie-modal__credits">
            <h4>Credits</h4>
            {creditsLoading && <p className="credits-empty">Loading credits...</p>}
            {!creditsLoading && credits.length === 0 && (
              <p className="credits-empty">
                {creditsFound
                  ? "No credit data available for this track."
                  : "This track wasn't found in the credits database."}
              </p>
            )}
            {!creditsLoading && credits.length > 0 && (
              <ul className="credits-list">
                {credits.map((c, i) => (
                  <li key={i}>
                    <span className="credits-role">{c.role}</span>
                    <span className="credits-name">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {movie.videoId && (
          <div className="movie-modal__comments">
            <h4>Comments ({comments.length})</h4>

            <div className="comment-composer">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
              />
              <button onClick={postComment} disabled={postingComment}>
                Post
              </button>
            </div>

            <div className="comment-list">
              {comments.length === 0 && (
                <p className="credits-empty">Be the first to comment.</p>
              )}
              {comments.map((c) => (
                <div className="comment-item" key={c.id}>
                  <strong>{c.username || "Anonymous"}</strong>
                  <p>{c.comment_text}</p>
                  {currentUser?.id === c.user_id && (
                    <button
                      className="comment-delete"
                      onClick={() => deleteComment(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieModal;