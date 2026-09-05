import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";
import Collections from "./components/collections";
import Feed from "./components/feed";
import Releases from "./components/Releases";
import People from "./components/People";
import Profile from "./components/Profile";
import ArtistPage from "./components/ArtistPage";
import ExplorePage from "./components/ExplorePage";
import { AnimatePresence } from "motion/react";
import PageTransition from "./components/PageTransition";
import NotificationBell from "./components/NotificationBell";
import BrowsePage from "./components/BrowsePage";
import SpacesPage from "./components/SpacesPage";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import { supabase } from "./supabaseClient";
import MessagesPage from "./components/MessagesPage";


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSongs, setSavedSongs] = useState([]);
  const [activePage, setActivePage] = useState("discover");
  const [savedReleases, setSavedReleases] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Lets links like /?page=feed (used by notifications) land on the right tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get("page");
    if (page) setActivePage(page);
  }, [location.search]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("saved_songs")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setSavedSongs(data);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

        supabase
      .from("followed_artists")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setFollowedArtists(
            data.map((row) => ({ name: row.artist_name, channelId: row.channel_id }))
          );
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setUsername(data.username || "");
        }
      });
  }, [user]);

   const toggleFollowArtist = async (artistName, channelId) => {
    if (!user) return;

    const isFollowing = followedArtists.some((a) => a.name === artistName);

    if (isFollowing) {
      await supabase
        .from("followed_artists")
        .delete()
        .eq("user_id", user.id)
        .eq("artist_name", artistName);

      setFollowedArtists((current) => current.filter((a) => a.name !== artistName));
    } else {
      await supabase
        .from("followed_artists")
        .insert({ user_id: user.id, artist_name: artistName, channel_id: channelId });

      setFollowedArtists((current) => [...current, { name: artistName, channelId }]);
    }
  };
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8f8fa3",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  const mainContent = (
    <>
      <div className="topbar-greeting-row">
        {username ? (
          <>
            Hi, <span>{username}</span>
          </>
        ) : (
          ""
        )}
      </div>

      <header className="topbar">
        <input
          type="text"
          placeholder="Search your Music, Albums, Artists, Genres............."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/browse" className="notification-bell__button" style={{ textDecoration: "none" }} title="Browse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </Link>
        <Link to="/spaces" className="notification-bell__button" style={{ textDecoration: "none" }} title="Spaces">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </Link>
                <Link to="/messages" className="notification-bell__button" style={{ textDecoration: "none" }} title="Messages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8l-4 4V6c0-1.1.9-2 2-2z" />
          </svg>
        </Link>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          className="profile"
          style={{ fontSize: "12px" }}
        >
          Log Out
        </button>
        <NotificationBell />
        <button className="profile" onClick={() => setActivePage("profile")}>
          {initials} ✦
        </button>
      </header>



      {activePage === "discover" && (
        <>
          <Hero />
          <MusicSection
            searchTerm={searchTerm}
            savedSongs={savedSongs}
            setSavedSongs={setSavedSongs}
            followedArtists={followedArtists}
          />
        </>
      )}

      {activePage === "collections" && (
        <Collections
          savedSongs={savedSongs}
          setSavedSongs={setSavedSongs}
          savedReleases={savedReleases}
        />
      )}

      {activePage === "feed" && <Feed />}

      {activePage === "releases" && (
        <Releases
          savedReleases={savedReleases}
          setSavedReleases={setSavedReleases}
        />
      )}

      {activePage === "people" && <People />}

      {activePage === "profile" && <Profile savedSongs={savedSongs} />}
    </>
  );

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={<PageTransition>{mainContent}</PageTransition>}
            />
            <Route
              path="/artist/:artistName"
              element={
                <PageTransition>
                  <ArtistPage
                    savedSongs={savedSongs}
                    setSavedSongs={setSavedSongs}
                    followedArtists={followedArtists}
                    toggleFollowArtist={toggleFollowArtist}
                  />
                </PageTransition>
              }
            />
            <Route
              path="/explore"
              element={
                <PageTransition>
                  <ExplorePage />
                </PageTransition>
              }
            />
            <Route
              path="/browse"
              element={
                <PageTransition>
                  <BrowsePage setActivePage={setActivePage} />
                </PageTransition>
              }
            />
            <Route
              path="/spaces"
              element={
                <PageTransition>
                  <SpacesPage />
                </PageTransition>
              }
            />
            <Route
              path="/messages"
              element={
                <PageTransition>
                  <MessagesPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;