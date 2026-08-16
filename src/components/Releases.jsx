import { useState } from "react";

function Releases({ savedReleases, setSavedReleases }) {

    const [heardReleases, setHeardReleases] = useState([]);

  const releases = [
    {
      title: "Midnight Signals",
      artist: "Nova Lane",
      genre: "Indie",
      date: "Aug 14, 2026",
      emoji: "🌌"
    },
    {
      title: "City Lights",
      artist: "The Weekenders",
      genre: "Pop",
      date: "Aug 12, 2026",
      emoji: "🌃"
    },
    {
      title: "After Dark",
      artist: "Kairo",
      genre: "Hip-Hop",
      date: "Aug 10, 2026",
      emoji: "🌙"
    },
    {
      title: "Electric Dreams",
      artist: "Mira Vale",
      genre: "Electronic",
      date: "Aug 8, 2026",
      emoji: "⚡"
    }
  ];

  return (
    <section className="releases-page">

      <div className="releases-header">

        <div>
          <h1>New Releases</h1>

          <p>
            Discover what's fresh in the music world.
          </p>
        </div>

      </div>


      <div className="release-grid">

        {releases.map((release) => (

          <div
            className="release-card"
            key={release.title}
          >

            <div className="release-cover">
              {release.emoji}
            </div>

            <h2>{release.title}</h2>

            <p>
              {release.artist} · {release.genre}
            </p>

            <span>
              Released {release.date}
            </span>
            <button
  className={
    heardReleases.includes(release.title)
      ? "heard-button heard"
      : "heard-button"
  }
  onClick={() => {

    if (heardReleases.includes(release.title)) {

      setHeardReleases(
        heardReleases.filter(
          title => title !== release.title
        )
      );

    } else {

      setHeardReleases([
        ...heardReleases,
        release.title
      ]);

    }

  }}
>
  {heardReleases.includes(release.title)
    ? "✓ Heard"
    : "Mark Heard"}
</button>
<button
  className={
    savedReleases.some(
      saved => saved.title === release.title
    )
      ? "release-save saved"
      : "release-save"
  }
  onClick={() => {

    const alreadySaved = savedReleases.some(
      saved => saved.title === release.title
    );

    if (alreadySaved) {

      setSavedReleases(
        savedReleases.filter(
          saved => saved.title !== release.title
        )
      );

    } else {

      setSavedReleases([
        ...savedReleases,
        release
      ]);

    }

  }}
>
  {savedReleases.some(
    saved => saved.title === release.title
  )
    ? "✓ Saved"
    : "＋ Save"}
</button>
          </div>

        ))}

      </div>

    </section>
  );
}

export default Releases;