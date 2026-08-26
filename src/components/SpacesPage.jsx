import { Link } from "react-router-dom";
import { useState } from "react";
import "./SpacesPage.css";

const topics = [
  {
    id: "t1",
    tag: "Album Talk",
    emoji: "🌙",
    headline: "Luna Park's \"Paper Moons\" is getting the GOD LEVEL treatment from everyone on VIBR.",
    body: "What is it about this one that's landing so hard? Drop your take.",
  },
  {
    id: "t2",
    tag: "Fresh Drop",
    emoji: "🌃",
    headline: "47th Street's \"After Hours\" just hit PERFECT on the community meter.",
    body: "Curious if this beats their last release for you.",
  },
  {
    id: "t3",
    tag: "Hot Take",
    emoji: "🚗",
    headline: "Is Mira Vale's \"Night Drive FM\" the best late-night album on here right now?",
    body: "Make your case for or against.",
  },
  {
    id: "t4",
    tag: "Discovery",
    emoji: "🌈",
    headline: "Nia Ellis's \"Neon Weather\" is quietly one of the most slept-on tracks in Pop.",
    body: "If you haven't heard it yet, this is your sign.",
  },
];

function SpacesPage() {
  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});

  function postComment(topicId) {
    if (!commentText.trim()) return;
    setComments({
      ...comments,
      [topicId]: [...(comments[topicId] || []), commentText],
    });
    setCommentText("");
  }

  return (
    <section className="spaces-page">
      <Link to="/" className="back-link">← Back to Discover</Link>
      <div className="spaces-header">
        <h1>Spaces</h1>
        <p>What people on VIBR are talking about right now.</p>
      </div>

      <div className="spaces-list">
        {topics.map((topic) => (
          <div className="topic-card" key={topic.id}>
            <div className="topic-card__cover">{topic.emoji}</div>

            <div className="topic-card__body">
              <span className="topic-card__tag">{topic.tag}</span>
              <h2>{topic.headline}</h2>
              <p>{topic.body}</p>

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