import MusicCard from "./MusicCard";

function MusicSection() {

  return (
    <section className="music-section">

      <div className="section-heading">

        <div>
          <h2>Picked for you</h2>

          <p>
            Community-first recommendations
            matched to your taste.
          </p>
        </div>

        <button className="refresh">
          Refresh ↻
        </button>

      </div>

      <div className="music-grid">

        <MusicCard
          title="Paper Moons"
          artist="Luna Park"
          genre="Indie"
          verdict="🔥 GOD LEVEL"
          emoji="🌙"
        />

        <MusicCard
          title="After Hours"
          artist="47th Street"
          genre="Hip-Hop"
          verdict="💜 PERFECT"
          emoji="🌃"
        />

        <MusicCard
          title="Neon Weather"
          artist="Nia Ellis"
          genre="Pop"
          verdict="👍 GOOD"
          emoji="🌈"
        />

        <MusicCard
          title="Night Drive FM"
          artist="Mira Vale"
          genre="Electronic"
          verdict="💜 PERFECT"
          emoji="🚗"
        />

      </div>

    </section>
  );
}

export default MusicSection;