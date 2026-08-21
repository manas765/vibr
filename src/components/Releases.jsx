import { useState } from "react";
import ReleaseCard from "./ReleaseCard";
import { motion } from "motion/react";
import "./Releases.css";

function Releases({ savedReleases, setSavedReleases }) {
  const [heardReleases, setHeardReleases] = useState([]);
  const [activeTab, setActiveTab] = useState("released");
  const [activeYear, setActiveYear] = useState("All");

  const releases = [
    {
      title: "Midnight Signals",
      artist: "Nova Lane",
      genre: "Indie",
      date: "Aug 14, 2026",
      year: 2026,
      status: "released",
      emoji: "🌌",
    },
    {
      title: "City Lights",
      artist: "The Weekenders",
      genre: "Pop",
      date: "Aug 12, 2026",
      year: 2026,
      status: "released",
      emoji: "🌃",
    },
    {
      title: "After Dark",
      artist: "Kairo",
      genre: "Hip-Hop",
      date: "Aug 10, 2026",
      year: 2026,
      status: "released",
      emoji: "🌙",
    },
    {
      title: "Electric Dreams",
      artist: "Mira Vale",
      genre: "Electronic",
      date: "Aug 8, 2026",
      year: 2026,
      status: "released",
      emoji: "⚡",
    },
    {
      title: "Glass Horizon",
      artist: "Luna Park",
      genre: "Indie",
      date: "Sep 20, 2026",
      year: 2026,
      status: "upcoming",
      emoji: "🌤️",
    },
    {
      title: "Static & Silence",
      artist: "47th Street",
      genre: "Hip-Hop",
      date: "Nov 3, 2026",
      year: 2026,
      status: "upcoming",
      emoji: "📻",
    },
    {
      title: "Untitled Project",
      artist: "Nia Ellis",
      genre: "Pop",
      date: "TBA",
      year: 2027,
      status: "announced",
      emoji: "🎤",
    },
  ];

  const years = ["All", ...new Set(releases.map((r) => r.year))].sort();

  const filteredReleases = releases.filter((release) => {
    const matchesTab = release.status === activeTab;
    const matchesYear = activeYear === "All" || release.year === activeYear;
    return matchesTab && matchesYear;
  });

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

      <div className="schedule-tabs">
        <button
          className={activeTab === "released" ? "schedule-tab active" : "schedule-tab"}
          onClick={() => setActiveTab("released")}
        >
          Released
        </button>
        <button
          className={activeTab === "upcoming" ? "schedule-tab active" : "schedule-tab"}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={activeTab === "announced" ? "schedule-tab active" : "schedule-tab"}
          onClick={() => setActiveTab("announced")}
        >
          Announced
        </button>
      </div>

      <div className="year-filter">
        {years.map((year) => (
          <button
            key={year}
            className={activeYear === year ? "year-chip active" : "year-chip"}
            onClick={() => setActiveYear(year)}
          >
            {year}
          </button>
        ))}
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
        {filteredReleases.length === 0 && (
          <p className="empty-message">Nothing here yet.</p>
        )}

        {filteredReleases.map((release) => (
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