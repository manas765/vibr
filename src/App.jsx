import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import MusicSection from "./components/MusicSection";
import ChartsWidget from "./components/ChartsWidget";
import Collections from "./components/collections";
import Feed from "./components/feed";
import Releases from "./components/Releases";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import TrendingClips from "./components/TrendingClips";
import ArtistPage from "./components/ArtistPage";
import ExplorePage from "./components/ExplorePage";
import { AnimatePresence } from "motion/react";
import PageTransition from "./components/PageTransition";
import BrowsePage from "./components/BrowsePage";
import SpacesPage from "./components/SpacesPage";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import { supabase } from "./supabaseClient";
import MessagesPage from "./components/MessagesPage";


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vibr-search-history") || "[]");
    } catch {
      return [];
    }
  });
  const [profileResults, setProfileResults] = useState([]);
  const [showProfileResults, setShowProfileResults] = useState(false);
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
    if (!searchTerm.trim()) {
      setProfileResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${searchTerm.trim()}%`)
        .limit(5)
        .then(({ data, error }) => {
          if (!error) setProfileResults(data || []);
        });
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  function commitSearch(term) {
    const trimmed = term.trim();
    if (!trimmed) return;

    setSearchHistory((prev) => {
      const next = [
        trimmed,
        ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 8);
      localStorage.setItem("vibr-search-history", JSON.stringify(next));
      return next;
    });
  }

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const voiceSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  function handleVoiceSearch() {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setShowProfileResults(true);
      commitSearch(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function removeHistoryItem(term) {
    setSearchHistory((prev) => {
      const next = prev.filter((t) => t !== term);
      localStorage.setItem("vibr-search-history", JSON.stringify(next));
      return next;
    });
  }

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
            Welcome back to <span className="greeting-vibr">VIBR</span>, <span className="greeting-name">{username}</span>
          </>
        ) : (
          <>Welcome to <span className="greeting-vibr">VIBR</span></>
        )}
      </div>

      <header className="topbar">
        <div className="topbar-search">
          <input
            type="text"
            placeholder="Search music, artists, or people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowProfileResults(true)}
            onBlur={() => setTimeout(() => setShowProfileResults(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch(searchTerm)}
          />

          <button
            type="button"
            className="topbar-search-button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => commitSearch(searchTerm)}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {voiceSupported && (
            <button
              type="button"
              className={isListening ? "topbar-search-button topbar-search-button--mic listening" : "topbar-search-button topbar-search-button--mic"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleVoiceSearch}
              aria-label={isListening ? "Stop voice search" : "Search by voice"}
              title={isListening ? "Listening..." : "Search by voice"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}

          {showProfileResults && (
            <div className="topbar-search-results">
              {!searchTerm.trim() && searchHistory.length > 0 && (
                <>
                  <div className="topbar-search-results__label">Recent searches</div>
                  {searchHistory.map((term) => (
                    <div
                      key={term}
                      className="topbar-search-history-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchTerm(term);
                        commitSearch(term);
                      }}
                    >
                      <span>🕘 {term}</span>
                      <button
                        type="button"
                        className="topbar-search-history-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(term);
                        }}
                        aria-label={`Remove "${term}" from history`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}

              {searchTerm.trim() && profileResults.length > 0 && (
                <>
                  <div className="topbar-search-results__label">People</div>
                  {profileResults.map((profile) => (
                    <Link
                      key={profile.id}
                      to={`/profile/${profile.id}`}
                      className="topbar-search-result"
                      onClick={() => {
                        commitSearch(searchTerm);
                        setShowProfileResults(false);
                      }}
                    >
                      <div className="topbar-search-result__avatar">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.username} />
                        ) : (
                          (profile.username || "?").slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <span>{profile.username}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

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

        <button className="profile" onClick={() => setActivePage("profile")}>
          {initials} ✦
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="profile"
          style={{ fontSize: "12px" }}
        >
          Log Out
        </button>
      </header>



      {activePage === "discover" && (
        <>
          <Hero />
          <ChartsWidget />
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
              path="/trending"
              element={
                <PageTransition>
                  <TrendingClips />
                </PageTransition>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <PageTransition>
                  <PublicProfile setActivePage={setActivePage} />
                </PageTransition>
              }
            />
            <Route
              path="/messages"
              element={
                <PageTransition>
                  <MessagesPage savedSongs={savedSongs} />
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