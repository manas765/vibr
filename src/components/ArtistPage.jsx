import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { music } from "../data/music";
import { movies } from "../data/movies";
import MusicCard3D from "./MusicCard3D";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import "./ArtistPage.css";

function ArtistPage({ savedSongs, setSavedSongs, followedArtists, toggleFollowArtist }) {
  const { artistName } = useParams();
  const decodedName = decodeURIComponent(artistName);

  const [activeTab, setActiveTab] = useState("tracks");
  const [playingMovie, setPlayingMovie] = useState(null);

  const artistSongs = music.filter((song) => song.artist === decodedName);
  const artistMovies = movies.filter((movie) => movie.artist === decodedName);
  const isFollowing = followedArtists.includes(decodedName);

  const heroEmoji = artistSongs[0]?.emoji || artistMovies[0]?.emoji || "🎵";
  const hasAnything = artistSongs.length > 0 || artistMovies.length > 0;

  if (!hasAnything) {
    return (
      <section className="artist-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <h1>Artist not found</h1>
        <p>No content found for "{decodedName}".</p>
      </section>
    );
  }

  return (
    <section className="artist-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="artist-page-header">
        <div className="artist-page-avatar">{heroEmoji}</div>

        <div>
          <h1>{decodedName}</h1>
          <p>
            {artistSongs.length} track{artistSongs.length !== 1 ? "s" : ""}
            {artistMovies.length > 0 &&
              ` · ${artistMovies.length} movie album${artistMovies.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <button
          className={isFollowing ? "following" : "follow-button"}
          onClick={() => toggleFollowArtist(decodedName)}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <div className="artist-page-tabs">
        <button
          className={activeTab === "tracks" ? "artist-tab active" : "artist-tab"}
          onClick={() => setActiveTab("tracks")}
        >
          Tracks
        </button>
        <button
          className={activeTab === "movies" ? "artist-tab active" : "artist-tab"}
          onClick={() => setActiveTab("movies")}
          disabled={artistMovies.length === 0}
        >
          Movie Albums {artistMovies.length > 0 && `(${artistMovies.length})`}
        </button>
      </div>

      {activeTab === "tracks" && (
        <div className="music-grid">
          {artistSongs.length === 0 && <p className="artist-empty">No tracks yet.</p>}
          {artistSongs.map((song) => (
            <MusicCard3D
              key={song.title}
              title={song.title}
              artist={song.artist}
              genre={song.genre}
              verdict={song.verdict}
              emoji={song.emoji}
              savedSongs={savedSongs}
              setSavedSongs={setSavedSongs}
            />
          ))}
        </div>
      )}

      {activeTab === "movies" && (
        <div className="music-grid">
          {artistMovies.length === 0 && <p className="artist-empty">No movie albums yet.</p>}
          {artistMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onPlay={setPlayingMovie} />
          ))}
        </div>
      )}

      <MovieModal movie={playingMovie} onClose={() => setPlayingMovie(null)} />
    </section>
  );
}

export default ArtistPage;