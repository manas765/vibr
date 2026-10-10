import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./TasteDNACard.css";

const VERDICT_ORDER = ["🔥 GOD LEVEL", "💜 PERFECT", "👍 GOOD", "😐 MEHHHHH"];
const BAR_COLORS = ["#c6ff3d", "#3dd6ff", "#8b5cf6", "#ff6ec7", "#ff8a3d"];

function tally(items) {
  const counts = new Map();
  items.forEach((item) => {
    if (!item) return;
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function TasteDNACard({ username, savedSongs, userId }) {
  const [verdicts, setVerdicts] = useState([]); // [[verdict, count]]
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("reviews")
      .select("verdict")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setVerdicts(tally(data.map((r) => r.verdict)));
      });
  }, [userId]);

  const topArtists = tally(savedSongs.map((s) => s.artist)).slice(0, 5);
  const topGenres = tally(savedSongs.map((s) => s.genre)).slice(0, 4);
  const maxArtist = topArtists[0]?.[1] || 1;
  const totalGenre = topGenres.reduce((sum, [, n]) => sum + n, 0) || 1;
  const hasData = savedSongs.length > 0;

  function downloadCard() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b0b12");
    bg.addColorStop(1, "#1a1030");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Soft glows
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, 500);
    glow.addColorStop(0, "rgba(139, 92, 246, 0.35)");
    glow.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 0, W * 0.1, H * 0.95, 500);
    glow2.addColorStop(0, "rgba(198, 255, 61, 0.22)");
    glow2.addColorStop(1, "rgba(198, 255, 61, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    ctx.textBaseline = "alphabetic";

    // Header
    ctx.fillStyle = "#c6ff3d";
    ctx.font = "600 32px Inter, sans-serif";
    ctx.fillText("MY TASTE DNA", 80, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "96px Anton, Impact, sans-serif";
    ctx.fillText((username || "VIBR USER").toUpperCase(), 80, 230);

    // Top artists
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText("TOP ARTISTS", 80, 330);

    topArtists.forEach(([name, count], i) => {
      const y = 380 + i * 90;
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 34px Inter, sans-serif";
      const label = name.length > 28 ? name.slice(0, 27) + "…" : name;
      ctx.fillText(label, 80, y);

      const barW = Math.max(40, (count / maxArtist) * (W - 160));
      ctx.fillStyle = BAR_COLORS[i % BAR_COLORS.length];
      ctx.fillRect(80, y + 14, barW, 14);
    });

    // Genres
    const genreTop = 380 + Math.max(topArtists.length, 1) * 90 + 50;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText("GENRE MIX", 80, genreTop);

    let x = 80;
    topGenres.forEach(([genre, count], i) => {
      const w = Math.max(80, (count / totalGenre) * (W - 160));
      ctx.fillStyle = BAR_COLORS[(i + 2) % BAR_COLORS.length];
      ctx.fillRect(x, genreTop + 24, w - 6, 26);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 24px Inter, sans-serif";
      ctx.fillText(genre, x, genreTop + 90);
      x += w;
    });

    // Verdicts
    const verdictTop = genreTop + 160;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText("MY VERDICTS", 80, verdictTop);

    VERDICT_ORDER.forEach((v, i) => {
      const found = verdicts.find(([key]) => key === v);
      const col = i % 2;
      const row = Math.floor(i / 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 34px Inter, sans-serif";
      ctx.fillText(`${v}  ×${found ? found[1] : 0}`, 80 + col * 480, verdictTop + 60 + row * 60);
    });

    // Footer
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "italic 26px Georgia, serif";
    ctx.fillText("for the vibr's, by the vibr's, to the vibr's", 80, H - 70);

    const link = document.createElement("a");
    link.download = `${(username || "vibr").toLowerCase()}-taste-dna.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="profile-section taste-dna">
      <div className="taste-dna__header">
        <h2>Taste DNA</h2>
        <button className="taste-dna__download" onClick={downloadCard} disabled={!hasData}>
          ⬇ Download card
        </button>
      </div>

      {!hasData ? (
        <p className="taste-dna__empty">Save a few songs and your Taste DNA will show up here.</p>
      ) : (
        <div className="taste-dna__preview">
          <div className="taste-dna__block">
            <span className="taste-dna__label">Top artists</span>
            {topArtists.map(([name, count], i) => (
              <div className="taste-dna__row" key={name}>
                <span>{name}</span>
                <div
                  className="taste-dna__bar"
                  style={{
                    width: `${(count / maxArtist) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            ))}
          </div>

          <div className="taste-dna__block">
            <span className="taste-dna__label">Genre mix</span>
            <div className="taste-dna__genres">
              {topGenres.map(([genre, count], i) => (
                <div
                  key={genre}
                  className="taste-dna__genre"
                  style={{
                    flex: count,
                    background: BAR_COLORS[(i + 2) % BAR_COLORS.length],
                  }}
                  title={`${genre}: ${count}`}
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>

          {verdicts.length > 0 && (
            <div className="taste-dna__block">
              <span className="taste-dna__label">Verdicts</span>
              <div className="taste-dna__verdicts">
                {verdicts.map(([v, n]) => (
                  <span key={v}>
                    {v} ×{n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default TasteDNACard;