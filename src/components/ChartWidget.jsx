import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ChartsWidget.css";

function formatViews(count) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

function ChartsWidget() {
  const [tab, setTab] = useState("songs");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube-charts")
      .then((r) => r.json())
      .then((data) => {
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topSongs = tracks.slice(0, 10);

  // "Top Albums" stand-in: group the trending list by artist channel,
  // rank by total views across their trending tracks, since no real
  // album-chart data source exists for YouTube.
  const topArtists = (() => {
    const groups = {};
    tracks.forEach((t) => {
      if (!groups[t.channelId]) {
        groups[t.channelId] = {
          channelId: t.channelId,
          artist: t.artist,
          thumbnail: t.thumbnail,
          title: t.title,
          totalViews: 0,
          trackCount: 0,
        };
      }
      groups[t.channelId].totalViews += t.viewCount;
      groups[t.channelId].trackCount += 1;
    });

    return Object.values(groups)
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);
  })();

  return (
    <section className="charts-widget">
      <div className="charts-widget__header">
        <div>
          <h2>Charts This Week</h2>
          <p>
            {tab === "songs"
              ? "Trending music right now, via YouTube."
              : "Top artists by trending views this week."}
          </p>
        </div>

        <div className="charts-widget__tabs">
          <button
            className={tab === "songs" ? "charts-tab active" : "charts-tab"}
            onClick={() => setTab("songs")}
          >
            Top Songs
          </button>
          <button
            className={tab === "albums" ? "charts-tab active" : "charts-tab"}
            onClick={() => setTab("albums")}
          >
            Top Albums
          </button>
        </div>
      </div>

      {loading && <p className="charts-widget__empty">Loading charts...</p>}

      {!loading && tab === "songs" && (
        <div className="charts-list">
          {topSongs.map((track, i) => (
            <a
              key={track.id}
              className="charts-row"
              href={track.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="charts-rank">{i + 1}</span>
              <img className="charts-thumb" src={track.thumbnail} alt={track.title} />
              <div className="charts-row__info">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </div>
              <span className="charts-views">{formatViews(track.viewCount)}</span>
            </a>
          ))}
        </div>
      )}

      {!loading && tab === "albums" && (
        <div className="charts-list">
          {topArtists.map((artist, i) => (
            <Link
              key={artist.channelId}
              className="charts-row"
              to={`/artist/${encodeURIComponent(artist.artist)}`}
              state={{ channelId: artist.channelId }}
            >
              <span className="charts-rank">{i + 1}</span>
              <img className="charts-thumb" src={artist.thumbnail} alt={artist.artist} />
              <div className="charts-row__info">
                <strong>{artist.artist}</strong>
                <small>
                  {artist.trackCount} trending track{artist.trackCount !== 1 ? "s" : ""}
                </small>
              </div>
              <span className="charts-views">{formatViews(artist.totalViews)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default ChartsWidget;