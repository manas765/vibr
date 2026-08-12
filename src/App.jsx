import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

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

      

        <MusicSection searchTerm={searchTerm} />

      </main>

    </div>
  );
}

export default App;