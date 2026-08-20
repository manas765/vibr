import { useRef, useState } from "react";
import "./ReleaseCard.css";

function ReleaseCard({ release, isHeard, onToggleHeard, isSaved, onToggleSave }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 10,
      y: (px - 0.5) * 10,
    });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className="release-card-scene"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="release-card"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="release-card__glow" />
        <div className="release-card__sheen" />

        <div className="release-card__body">
          <div className="release-cover">{release.emoji}</div>

          <h2>{release.title}</h2>

          <p>
            {release.artist} · {release.genre}
          </p>

          <span className="release-date">Released {release.date}</span>

          <div className="release-card__actions">
            <button
              className={isHeard ? "heard-button heard" : "heard-button"}
              onClick={onToggleHeard}
            >
              {isHeard ? "✓ Heard" : "Mark Heard"}
            </button>

            <button
              className={isSaved ? "release-save saved" : "release-save"}
              onClick={onToggleSave}
            >
              {isSaved ? "✓ Saved" : "＋ Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReleaseCard;