import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SpacesPage.css";

function SpacesPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetch("/api/music-news")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function postComment(topicId) {
    if (!commentText.trim()) return;
    setComments({
      ...comments,
      [topicId]: [...(comments[topicId] || []), commentText],
    });
    setCommentText("");
  }

  if (loading) {
    return (
      <section className="spaces-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <p>Loading music news...</p>
      </section>
    );
  }

  return (
    <section className="spaces-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="spaces-header">
        <h1>Spaces</h1>
        <p>What's happening in music right now.</p>
      </div>

      <div className="spaces-list">
        {topics.map((topic) => (
          <div className="topic-card" key={topic.id}>
            <div className="topic-card__cover">
              {topic.image ? (
                <img src={topic.image} alt={topic.title} />
              ) : (
                "🎵"
              )}
            </div>

            <div className="topic-card__body">
              <span className="topic-card__tag">{topic.author || "Music News"}</span>
              <h2>
                <a href={topic.url} target="_blank" rel="noopener noreferrer">
                  {topic.title}
                </a>
              </h2>
              <p>{topic.description}</p>

              <button
                className="topic-card__comment-toggle"
                onClick={() =>
                  setOpenComments(openComments === topic.id ? null : topic.id)
                }
              >
                💬 {comments[topic.id]?.length || 0} comment
                {comments[topic.id]?.length === 1 ? "" : "s"}
              </button>

              {openComments === topic.id && (
                <div className="topic-card__comments">
                  {comments[topic.id]?.map((c, i) => (
                    <div className="topic-comment" key={i}>
                      <strong>You</strong>
                      <p>{c}</p>
                    </div>
                  ))}

                  <div className="topic-comment-box">
                    <input
                      type="text"
                      placeholder="Add to the discussion..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button onClick={() => postComment(topic.id)}>Post</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SpacesPage;