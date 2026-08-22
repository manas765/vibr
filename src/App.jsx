import { useState } from "react";
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
import { usePersistedState } from "./hooks/usePersistedState";
import ExplorePage from "./components/ExplorePage";
import { AnimatePresence } from "motion/react";
import PageTransition from "./components/PageTransition";
import NotificationBell from "./components/NotificationBell";
import BrowsePage from "./components/BrowsePage";
import SpacesPage from "./components/SpacesPage";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSongs, setSavedSongs] = useState([]);
  const [activePage, setActivePage] = useState("discover");
  const [savedReleases, setSavedReleases] = useState([]);
  const [followedArtists, setFollowedArtists] = usePersistedState("followedArtists", []);
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleFollowArtist = (artistName) => {
    setFollowedArtists((current) =>
      current.includes(artistName)
        ? current.filter((name) => name !== artistName)
        : [...current, artistName]
    );
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

  const mainContent = (
    <>
      <header className="topbar">
        <input
          type="text"
          placeholder="🔍 Search music, artists, genres..."
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
     <button
      onClick={() => supabase.auth.signOut()}
      className="profile"
      style={{ fontSize: "12px" }}
      >
      Log Out
     </button>
     <NotificationBell />
     <button className="profile" onClick={() => setActivePage("profile")}>
       MS ✦
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
            <BrowsePage />
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
    </Routes>
  </AnimatePresence>
</main>
    </div>
  );
}

export default App;