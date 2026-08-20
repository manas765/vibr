import { Link } from "react-router-dom";
import { platformPicks } from "../data/platformPicks";
import "./ExplorePage.css";

function ExplorePage() {
  return (
    <section className="explore-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="explore-header">
        <h1>Explore</h1>
        <p>Top picks pulled from where people are actually listening.</p>
      </div>

      {platformPicks.map((row) => (
        <div className="platform-row" key={row.platform}>
          <div className="platform-row__label">
            <span
              className="platform-badge"
              style={{
                color: row.color,
                borderColor: `${row.color}55`,
                background: `${row.color}14`,
              }}
            >
              {row.platform}
            </span>
            <h2>Worth Listening on {row.platform}</h2>
          </div>

          <div className="platform-scroll">
            {row.picks.map((pick) => (
              <a
                key={pick.title}
                href={pick.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pick-card"
              >
                <div className="pick-card__cover">{pick.emoji}</div>
                <h3>{pick.title}</h3>
                <p>{pick.artist}</p>
                <span
                  className="pick-card__cta"
                  style={{ color: row.color }}
                >
                  Listen on {row.platform} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ExplorePage;