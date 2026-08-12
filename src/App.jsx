import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";
import Collections from "./components/Collections";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSongs, setSavedSongs] = useState([]);

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

      <Navbar />

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

        <Hero />

      

        <MusicSection
        searchTerm={searchTerm}
        savedSongs={savedSongs}
        setSavedSongs={setSavedSongs}
        />

        <Collections savedSongs={savedSongs} />

      </main>

    </div>
  );
}

export default App;