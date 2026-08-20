import { useState } from "react";
import "./Feed.css";

function Feed() {

  const [likedPosts, setLikedPosts] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [commentingPost, setCommentingPost] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");

  const posts = [
    {
      user: "Manas",
      avatar: "M",
      action: "rated a song",
      title: "Paper Moons",
      artist: "Luna Park",
      genre: "Indie",
      verdict: "🔥 GOD LEVEL",
      emoji: "🌙"
    },
    {
      user: "Akshata",
      avatar: "A",
      action: "recommended",
      title: "After Hours",
      artist: "47th Street",
      genre: "Hip-Hop",
      verdict: "💜 PERFECT",
      emoji: "🌃"
    },
    {
      user: "Pushkar",
      avatar: "P",
      action: "rated a song",
      title: "Neon Weather",
      artist: "Nia Ellis",
      genre: "Pop",
      verdict: "👍 GOOD",
      emoji: "🌈"
    },
    {
      user: "Aakash",
      avatar: "A",
      action: "discovered",
      title: "Night Drive FM",
      artist: "Mira Vale",
      genre: "Electronic",
      verdict: "💜 PERFECT",
      emoji: "🚗"
    }
  ];

  return (
    <section className="feed-page">

      <div className="feed-header">

        <div>
          <h1>Your Feed</h1>

          <p>
            See what your music community is discovering.
          </p>
        </div>

      </div>

      <div className="feed-list">

        {posts.map((post) => (

          <div
            className="feed-card"
            key={post.title}
          >

            {/* USER */}

            <div className="feed-user">

              <div className="user-avatar">
                {post.avatar}
              </div>

              <div className="user-info">

                <div>
                  <h3>{post.user}</h3>
                  <p>{post.action}</p>
                </div>

                <button
                  className={
                    followedUsers.includes(post.user)
                      ? "following"
                      : "follow-button"
                  }
                  onClick={() => {

                    if (followedUsers.includes(post.user)) {

                      setFollowedUsers(
                        followedUsers.filter(
                          user => user !== post.user
                        )
                      );

                    } else {

                      setFollowedUsers([
                        ...followedUsers,
                        post.user
                      ]);

                    }

                  }}
                >

                  {followedUsers.includes(post.user)
                    ? "Following"
                    : "Follow"}

                </button>

              </div>

            </div>


            {/* SONG */}

            <div className="feed-song">

              <div className="feed-cover">
                {post.emoji}
              </div>

              <div>

                <h2>{post.title}</h2>

                <p>
                  {post.artist} · {post.genre}
                </p>

                <span className="feed-verdict">
                  {post.verdict}
                </span>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="feed-actions">

              {/* LIKE */}

              <button
                onClick={() => {

                  if (likedPosts.includes(post.title)) {

                    setLikedPosts(
                      likedPosts.filter(
                        title => title !== post.title
                      )
                    );

                  } else {

                    setLikedPosts([
                      ...likedPosts,
                      post.title
                    ]);

                  }

                }}
                className={
                  likedPosts.includes(post.title)
                    ? "liked"
                    : ""
                }
              >

                {likedPosts.includes(post.title)
                  ? "❤️ Liked"
                  : "♡ Like"}

              </button>


              {/* COMMENT BUTTON */}

              <button
                onClick={() => {

                  setCommentingPost(
                    commentingPost === post.title
                      ? null
                      : post.title
                  );

                }}
              >
                💬 Comment
              </button>

            </div>


            {/* COMMENT INPUT */}

            {commentingPost === post.title && (

              <div className="comment-box">

                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
                />

                <button
                  onClick={() => {

                    if (!commentText.trim()) {
                      return;
                    }

                    setComments({
                      ...comments,

                      [post.title]: [
                        ...(comments[post.title] || []),
                        commentText
                      ]
                    });

                    setCommentText("");

                  }}
                >
                  Post
                </button>

              </div>

            )}


            {/* DISPLAY COMMENTS */}

            {comments[post.title]?.length > 0 && (

              <div className="comments-list">

                {comments[post.title].map(
                  (comment, index) => (

                    <div
                      className="comment"
                      key={index}
                    >

                      <strong>You</strong>

                      <p>
                        {comment}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </section>
  );
}

export default Feed;