import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";
import Collections from "./components/collections";
import Feed from "./components/feed";
import Releases from "./components/Releases";
import People from "./components/People";
import Profile from "./components/Profile";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSongs, setSavedSongs] = useState([]);
  const [activePage, setActivePage] = useState("discover");
  const [savedReleases, setSavedReleases] = useState([]);

  const toggleSavedSong = (song) => {
  setSavedSongs((current) => {
    const alreadySaved = current.some(
      (saved) => saved.title === song.title
    );

    if (alreadySaved) {
      return current.filter(
        (saved) => saved.title !== song.title
      );
    }

    return [...current, song];
  });
};

  return (
    <div className="app">

      <Navbar
       activePage={activePage}
       setActivePage={setActivePage} 
      />

      <main>

        <header className="topbar">

          <input
             type="text"
              placeholder="🔍 Search music, artists, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
/>
          <button
  className="profile"
  onClick={() => setActivePage("profile")}
>
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
{activePage === "feed" && (
  <Feed />
)}
{activePage === "releases" && (
  <Releases
    savedReleases={savedReleases}
    setSavedReleases={setSavedReleases}
  />
)}

{activePage === "people" && (
  <People />
)}
{activePage === "profile" && (
  <Profile savedSongs={savedSongs} />
)}



    </main>
    
    </div>
  );
}

export default App;