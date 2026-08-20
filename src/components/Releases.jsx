import { useState } from "react";
import ReleaseCard from "./ReleaseCard";
import "./Releases.css";
import { motion } from "motion/react";

function Releases({ savedReleases, setSavedReleases }) {
  const [heardReleases, setHeardReleases] = useState([]);

  const releases = [
    {
      title: "Midnight Signals",
      artist: "Nova Lane",
      genre: "Indie",
      date: "Aug 14, 2026",
      emoji: "🌌",
    },
    {
      title: "City Lights",
      artist: "The Weekenders",
      genre: "Pop",
      date: "Aug 12, 2026",
      emoji: "🌃",
    },
    {
      title: "After Dark",
      artist: "Kairo",
      genre: "Hip-Hop",
      date: "Aug 10, 2026",
      emoji: "🌙",
    },
    {
      title: "Electric Dreams",
      artist: "Mira Vale",
      genre: "Electronic",
      date: "Aug 8, 2026",
      emoji: "⚡",
    },
  ];

  function toggleHeard(title) {
    setHeardReleases((current) =>
      current.includes(title)
        ? current.filter((t) => t !== title)
        : [...current, title]
    );
  }

  function toggleSave(release) {
    const alreadySaved = savedReleases.some(
      (saved) => saved.title === release.title
    );

    if (alreadySaved) {
      setSavedReleases(
        savedReleases.filter((saved) => saved.title !== release.title)
      );
    } else {
      setSavedReleases([...savedReleases, release]);
    }
  }

  return (
    <section className="releases-page">
      <div className="releases-header">
        <div>
          <h1>New Releases</h1>
          <p>Discover what's fresh in the music world.</p>
        </div>
      </div>

      <motion.div
  className="release-grid"
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  }}
>
  {releases.map((release) => (
    <motion.div
      key={release.title}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <ReleaseCard
        release={release}
        isHeard={heardReleases.includes(release.title)}
        onToggleHeard={() => toggleHeard(release.title)}
        isSaved={savedReleases.some(
          (saved) => saved.title === release.title
        )}
        onToggleSave={() => toggleSave(release)}
      />
    </motion.div>
  ))}
</motion.div>
    </section>
  );
}

export default Releases;