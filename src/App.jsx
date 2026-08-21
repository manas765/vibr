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

  const toggleFollowArtist = (artistName) => {
    setFollowedArtists((current) =>
      current.includes(artistName)
        ? current.filter((name) => name !== artistName)
        : [...current, artistName]
    );
  };

  const mainContent = (
    <>
      <header className="topbar">
        <input
          type="text"
          placeholder="🔍 Search music, artists, genres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/browse" className="profile" style={{ textDecoration: "none" }}>
    ⊞
  </Link>
  <Link to="/spaces" className="profile" style={{ textDecoration: "none" }}>
    ☕
  </Link>
          
     
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