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
  const [followedIds, setFollowedIds] = useState([]);
  const [commentingPost, setCommentingPost] = useState(null);
  const [commentsByReview, setCommentsByReview] = useState({});
  const [commentText, setCommentText] = useState("");

  // { reviewId, commentId } of the comment currently being replied to, or null
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // comment_id -> like count, and the set of comment ids the current user has liked
  const [commentLikeCounts, setCommentLikeCounts] = useState({});
  const [likedCommentIds, setLikedCommentIds] = useState([]);

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
      if (user) loadFollows(user);
    });
    loadReviews();
  }, []);

  function loadFollows(user) {
    supabase
      .from("followed_users")
      .select("followed_id")
      .eq("follower_id", user.id)
      .then(({ data, error }) => {
        if (!error) setFollowedIds((data || []).map((row) => row.followed_id));
      });
  }

  async function toggleFollowUser(personId) {
    if (!currentUser || personId === currentUser.id) return;

    const isFollowing = followedIds.includes(personId);

    if (isFollowing) {
      await supabase
        .from("followed_users")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("followed_id", personId);

      setFollowedIds((current) => current.filter((id) => id !== personId));
    } else {
      await supabase
        .from("followed_users")
        .insert({ follower_id: currentUser.id, followed_id: personId });

      setFollowedIds((current) => [...current, personId]);
    }
  }

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
            const comments = data || [];
            setCommentsByReview((prev) => ({ ...prev, [reviewId]: comments }));
            loadCommentLikes(comments.map((c) => c.id));
          }
        });
    }
  }

  function loadCommentLikes(commentIds) {
    if (!commentIds || commentIds.length === 0) return;

    supabase
      .from("comment_likes")
      .select("comment_id, user_id")
      .in("comment_id", commentIds)
      .then(({ data, error }) => {
        if (error || !data) return;

        const counts = {};
        const mine = [];
        data.forEach((row) => {
          counts[row.comment_id] = (counts[row.comment_id] || 0) + 1;
          if (currentUser && row.user_id === currentUser.id) mine.push(row.comment_id);
        });

        setCommentLikeCounts((prev) => ({ ...prev, ...counts }));
        setLikedCommentIds((prev) => [...new Set([...prev, ...mine])]);
      });
  }

  async function toggleCommentLike(commentId) {
    if (!currentUser) return;

    const isLiked = likedCommentIds.includes(commentId);

    if (isLiked) {
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", currentUser.id);

      setLikedCommentIds((prev) => prev.filter((id) => id !== commentId));
      setCommentLikeCounts((prev) => ({
        ...prev,
        [commentId]: Math.max(0, (prev[commentId] || 1) - 1),
      }));
    } else {
      await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: currentUser.id });

      setLikedCommentIds((prev) => [...prev, commentId]);
      setCommentLikeCounts((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + 1,
      }));
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

      // Notify whoever this comment/reply is directed at
      let recipientId = null;
      if (parentCommentId) {
        const parent = (commentsByReview[reviewId] || []).find((c) => c.id === parentCommentId);
        recipientId = parent?.user_id;
      } else {
        const review = reviews.find((r) => r.id === reviewId);
        recipientId = review?.user_id;
      }

      if (recipientId && recipientId !== currentUser.id) {
        supabase
          .from("notifications")
          .insert({
            user_id: recipientId,
            actor_username: profile?.username || "Anonymous",
            type: "comment_reply",
            message: parentCommentId ? "replied to your comment" : "commented on your review",
            link: "/?page=feed",
          })
          .then(() => {});
      }

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

          const renderComment = (c, isReply) => (
            <div className={isReply ? "comment comment--reply" : "comment"} key={c.id}>
              <strong>{c.username || "Anonymous"}</strong>
              <p>{c.comment_text}</p>

              <div className="comment-actions">
                <button
                  className={
                    likedCommentIds.includes(c.id)
                      ? "comment-like-button liked"
                      : "comment-like-button"
                  }
                  onClick={() => toggleCommentLike(c.id)}
                  disabled={!currentUser}
                >
                  {likedCommentIds.includes(c.id) ? "❤️" : "♡"}
                  {commentLikeCounts[c.id] > 0 && (
                    <span>{commentLikeCounts[c.id]}</span>
                  )}
                </button>

                {!isReply && currentUser && (
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
                    ↩ Reply
                  </button>
                )}
              </div>

              {!isReply && replyingTo?.commentId === c.id && (
                <div className="comment-box comment-box--reply">
                  <input
                    type="text"
                    placeholder={`Reply to ${c.username || "Anonymous"}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postComment(post.id, c.id)}
                    autoFocus
                  />
                  <button onClick={() => postComment(post.id, c.id)}>Post</button>
                </div>
              )}

              {!isReply && repliesOf(c.id).length > 0 && (
                <div className="comment-replies">
                  {repliesOf(c.id).map((r) => renderComment(r, true))}
                </div>
              )}
            </div>
          );

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
                      className={followedIds.includes(post.user_id) ? "following" : "follow-button"}
                      onClick={() => toggleFollowUser(post.user_id)}
                    >
                      {followedIds.includes(post.user_id) ? "Following" : "Follow"}
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
                  {topLevel.map((c) => renderComment(c, false))}
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