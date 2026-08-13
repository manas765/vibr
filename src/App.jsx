import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";
import Collections from "./components/Collections";
import Feed from "./components/Feed";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSongs, setSavedSongs] = useState([]);
  const [activePage, setActivePage] = useState("discover");

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
          <button className="profile">
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
  <Collections savedSongs={savedSongs} />
)}
{activePage === "feed" && (
  <Feed />
)}

{["feed", "releases", "people"].includes(activePage) && (
  <section className="coming-soon">
    <h1>Coming Soon</h1>
    <p>
      We're building this part of VIBR.
    </p>
  </section>
)}

    </main>
    
    </div>
  );
}

export default App;