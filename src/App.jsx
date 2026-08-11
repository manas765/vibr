import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Genres from "./components/Genres";
import MusicSection from "./components/MusicSection";

function App() {

  return (
    <div className="app">

      <Navbar />

      <main>

        <header className="topbar">

          <input
            type="text"
            placeholder="🔍 Search music, artists, genres..."
          />

          <button className="profile">
            MS ✦
          </button>

        </header>

        <Hero />

        <Genres />

        <MusicSection />

      </main>

    </div>
  );
}

export default App;