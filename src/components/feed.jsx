import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Feed.css";

const VERDICT_OPTIONS = [
  { key: "🔥 GOD LEVEL", label: "🔥 GOD LEVEL" },
  { key: "💜 PERFECT", label: "💜 PERFECT" },
  { key: "👍 GOOD", label: "👍 GOOD" },
  { key: "😐 MEHHHHH", label: "😐 MEHHHHH" },
];

function Feed() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [likedPosts, setLikedPosts] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [commentingPost, setCommentingPost] = useState(null);
  const [commentsByReview, setCommentsByReview] = useState({});
  const [commentText, setCommentText] = useState("");

  // { reviewId, commentId } of the comment currently being replied to, or null
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [showComposer, setShowComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedVerdict, setSelectedVerdict] = useState(VERDICT_OPTIONS[0].key);
  const [reviewText, setReviewText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
    loadReviews();
  }, []);

  function loadReviews() {
    setLoading(true);
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setReviews(data || []);
        setLoading(false);
      });
  }

  function toggleCommentBox(reviewId) {
    const opening = commentingPost !== reviewId;
    setCommentingPost(opening ? reviewId : null);
    setReplyingTo(null);

    if (opening && !commentsByReview[reviewId]) {
      supabase
        .from("comments")
        .select("*")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (!error) {
            setCommentsByReview((prev) => ({ ...prev, [reviewId]: data || [] }));
          }
        });
    }
  }

  async function postComment(reviewId, parentCommentId = null) {
    const text = parentCommentId ? replyText : commentText;
    if (!text.trim() || !currentUser) return;

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
        review_id: reviewId,
        comment_text: text.trim(),
        parent_comment_id: parentCommentId,
      })
      .select();

    if (!error && data) {
      setCommentsByReview((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), data[0]],
      }));

      if (parentCommentId) {
        setReplyText("");
        setReplyingTo(null);
      } else {
        setCommentText("");
      }
    }
  }

  function searchSongs(query) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data.tracks || []));
  }

  async function submitReview() {
    if (!selectedSong || !reviewText.trim() || !currentUser) return;

    setPosting(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", currentUser.id)
      .single();

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: currentUser.id,
        username: profile?.username || "Anonymous",
        song_title: selectedSong.title,
        artist: selectedSong.artist,
        genre: "Music",
        thumbnail: selectedSong.thumbnail,
        verdict: selectedVerdict,
        review_text: reviewText.trim(),
      })
      .select();

    setPosting(false);

    if (!error && data) {
      setReviews([data[0], ...reviews]);
      setShowComposer(false);
      setSelectedSong(null);
      setSearchQuery("");
      setSearchResults([]);
      setReviewText("");
      setSelectedVerdict(VERDICT_OPTIONS[0].key);
    }
  }

  async function deleteReview(reviewId) {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (!error) {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  }

  return (
    <section className="feed-page">
      <div className="feed-header">
        <div>
          <h1>Your Feed</h1>
          <p>See what your music community is discovering.</p>
        </div>

        <button
          className="write-review-button"
          onClick={() => setShowComposer(!showComposer)}
        >
          {showComposer ? "Cancel" : "✎ Write a Review"}
        </button>
      </div>

      {showComposer && (
        <div className="review-composer">
          {!selectedSong ? (
            <>
              <input
                type="text"
                placeholder="Search for a song to review..."
                value={searchQuery}
                onChange={(e) => searchSongs(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="composer-results">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="composer-result"
                      onClick={() => {
                        setSelectedSong(track);
                        setSearchResults([]);
                      }}
                    >
                      <img src={track.thumbnail} alt={track.title} />
                      <div>
                        <strong>{track.title}</strong>
                        <p>{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="composer-selected-song">
                <img src={selectedSong.thumbnail} alt={selectedSong.title} />
                <div>
                  <strong>{selectedSong.title}</strong>
                  <p>{selectedSong.artist}</p>
                </div>
                <button onClick={() => setSelectedSong(null)}>Change</button>
              </div>

              <div className="composer-verdicts">
                {VERDICT_OPTIONS.map((v) => (
                  <button
                    key={v.key}
                    className={selectedVerdict === v.key ? "verdict-pill active" : "verdict-pill"}
                    onClick={() => setSelectedVerdict(v.key)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="What did you think of this track?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <button
                className="submit-review"
                onClick={submitReview}
                disabled={posting || !reviewText.trim()}
              >
                {posting ? "Posting..." : "Post Review"}
              </button>
            </>
          )}
        </div>
      )}

      <div className="feed-list">
        {loading && <p className="feed-empty">Loading feed...</p>}
        {!loading && reviews.length === 0 && (
          <p className="feed-empty">No reviews yet. Be the first to write one!</p>
        )}

        {reviews.map((post) => {
          const allComments = commentsByReview[post.id] || [];
          const topLevel = allComments.filter((c) => !c.parent_comment_id);
          const repliesOf = (commentId) =>
            allComments.filter((c) => c.parent_comment_id === commentId);

          return (
            <div className="feed-card" key={post.id}>
              <div className="feed-user">
                <div className="user-avatar">
                  {post.username ? post.username.slice(0, 1).toUpperCase() : "?"}
                </div>

                <div className="user-info">
                  <div>
                    <h3>{post.username || "Anonymous"}</h3>
                    <p>reviewed</p>
                  </div>

                  {currentUser?.id === post.user_id ? (
                    <button className="follow-button" onClick={() => deleteReview(post.id)}>
                      Delete
                    </button>
                  ) : (
                    <button
                      className={followedUsers.includes(post.username) ? "following" : "follow-button"}
                      onClick={() => {
                        setFollowedUsers(
                          followedUsers.includes(post.username)
                            ? followedUsers.filter((u) => u !== post.username)
                            : [...followedUsers, post.username]
                        );
                      }}
                    >
                      {followedUsers.includes(post.username) ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="feed-song">
                <div className="feed-cover">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.song_title} />
                  ) : (
                    "🎵"
                  )}
                </div>

                <div>
                  <h2>{post.song_title}</h2>
                  <p>{post.artist} · {post.genre}</p>
                  <span className="feed-verdict">{post.verdict}</span>
                </div>
              </div>

              <p className="feed-review-text">{post.review_text}</p>

              <div className="feed-actions">
                <button
                  onClick={() => {
                    setLikedPosts(
                      likedPosts.includes(post.id)
                        ? likedPosts.filter((id) => id !== post.id)
                        : [...likedPosts, post.id]
                    );
                  }}
                  className={likedPosts.includes(post.id) ? "liked" : ""}
                >
                  {likedPosts.includes(post.id) ? "❤️ Liked" : "♡ Like"}
                </button>

                <button onClick={() => toggleCommentBox(post.id)}>💬 Comment</button>
              </div>

              {commentingPost === post.id && (
                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postComment(post.id)}
                  />
                  <button onClick={() => postComment(post.id)}>Post</button>
                </div>
              )}

              {topLevel.length > 0 && (
                <div className="comments-list">
                  {topLevel.map((c) => (
                    <div className="comment" key={c.id}>
                      <strong>{c.username || "Anonymous"}</strong>
                      <p>{c.comment_text}</p>

                      {currentUser && (
                        <button
                          className="comment-reply-toggle"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo?.commentId === c.id
                                ? null
                                : { reviewId: post.id, commentId: c.id }
                            )
                          }
                        >
                          Reply
                        </button>
                      )}

                      {replyingTo?.commentId === c.id && (
                        <div className="comment-box comment-box--reply">
                          <input
                            type="text"
                            placeholder={`Reply to ${c.username || "Anonymous"}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && postComment(post.id, c.id)
                            }
                            autoFocus
                          />
                          <button onClick={() => postComment(post.id, c.id)}>Post</button>
                        </div>
                      )}

                      {repliesOf(c.id).length > 0 && (
                        <div className="comment-replies">
                          {repliesOf(c.id).map((r) => (
                            <div className="comment comment--reply" key={r.id}>
                              <strong>{r.username || "Anonymous"}</strong>
                              <p>{r.comment_text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Feed;