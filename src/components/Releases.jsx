import { useState, useEffect } from "react";
import ReleaseCard from "./ReleaseCard";
import { motion } from "motion/react";
import { supabase } from "../supabaseClient";
import "./Releases.css";

const upcomingReleases = [
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

function Releases({ savedReleases, setSavedReleases }) {
  const [heardReleases, setHeardReleases] = useState([]);
  const [activeTab, setActiveTab] = useState("released");
  const [activeYear, setActiveYear] = useState("All");
  const [liveReleases, setLiveReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (!user) return;

      supabase
        .from("release_tracking")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (error || !data) return;

          setHeardReleases(data.filter((r) => r.heard).map((r) => r.title));

          setSavedReleases(
            data
              .filter((r) => r.saved)
              .map((r) => ({
                title: r.title,
                artist: r.artist,
                genre: r.genre,
                date: r.date,
                year: r.year,
                status: r.status,
                emoji: r.emoji,
                thumbnail: r.thumbnail,
                videoUrl: r.video_url,
              }))
          );
        });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/youtube-search?q=${encodeURIComponent("official music video 2026")}`)
      .then((res) => res.json())
      .then((data) => {
        const tracks = (data.tracks || []).map((t) => ({
          title: t.title,
          artist: t.artist,
          genre: "Music",
          date: new Date(t.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          year: new Date(t.publishedAt).getFullYear(),
          status: "released",
          emoji: "🎵",
          thumbnail: t.thumbnail,
          videoUrl: t.videoUrl,
        }));
        setLiveReleases(tracks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allReleases = [...liveReleases, ...upcomingReleases];
  const years = ["All", ...new Set(allReleases.map((r) => r.year))].sort();

  const filteredReleases = allReleases.filter((release) => {
    const matchesTab = release.status === activeTab;
    const matchesYear = activeYear === "All" || release.year === activeYear;
    return matchesTab && matchesYear;
  });

  function toggleHeard(release) {
    const nowHeard = !heardReleases.includes(release.title);

    setHeardReleases((current) =>
      nowHeard
        ? [...current, release.title]
        : current.filter((t) => t !== release.title)
    );

    if (!currentUser) return;

    supabase
      .from("release_tracking")
      .upsert(
        {
          user_id: currentUser.id,
          title: release.title,
          artist: release.artist,
          genre: release.genre,
          date: release.date,
          year: release.year,
          status: release.status,
          emoji: release.emoji,
          thumbnail: release.thumbnail,
          video_url: release.videoUrl,
          heard: nowHeard,
        },
        { onConflict: "user_id,title" }
      )
      .then(() => {});
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

    if (!currentUser) return;

    supabase
      .from("release_tracking")
      .upsert(
        {
          user_id: currentUser.id,
          title: release.title,
          artist: release.artist,
          genre: release.genre,
          date: release.date,
          year: release.year,
          status: release.status,
          emoji: release.emoji,
          thumbnail: release.thumbnail,
          video_url: release.videoUrl,
          saved: !alreadySaved,
        },
        { onConflict: "user_id,title" }
      )
      .then(() => {});
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

      {activeTab !== "released" && (
        <p className="empty-message" style={{ marginBottom: 16 }}>
          Preview data — real release-calendar tracking is coming soon.
        </p>
      )}

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

      {loading && activeTab === "released" ? (
        <p className="empty-message">Loading releases...</p>
      ) : (
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
                onToggleHeard={() => toggleHeard(release)}
                isSaved={savedReleases.some(
                  (saved) => saved.title === release.title
                )}
                onToggleSave={() => toggleSave(release)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

export default Releases;