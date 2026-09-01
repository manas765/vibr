import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { movies } from "../data/movies";
import MusicCard3D from "./MusicCard3D";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import "./ArtistPage.css";

function ArtistPage({ savedSongs, setSavedSongs, followedArtists, toggleFollowArtist }) {
  const { artistName } = useParams();
  const location = useLocation();
  const channelId = location.state?.channelId;
  const decodedName = decodeURIComponent(artistName);
  const [channelThumbnail, setChannelThumbnail] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [activeTab, setActiveTab] = useState("tracks");
  const [playingMovie, setPlayingMovie] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/youtube-channel?channelId=${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        setArtistSongs(data.tracks || []);
        setChannelThumbnail(data.channelThumbnail || null);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [channelId]);

  const artistMovies = movies.filter((movie) => movie.artist === decodedName);
  const isFollowing = followedArtists.some((a) => a.name === decodedName);

  const heroEmoji = artistMovies[0]?.emoji || "🎵";

  if (loading) {
    return (
      <section className="artist-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <p>Loading artist...</p>
      </section>
    );
  }

  const hasAnything = artistSongs.length > 0 || artistMovies.length > 0;

  if (!hasAnything) {
    return (
      <section className="artist-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <h1>Artist not found</h1>
        <p>No content found for "{decodedName}".</p>
        {!channelId && (
          <p className="artist-empty">
            Try going back and clicking the artist link from a search result again.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="artist-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div
  className="artist-page-header"
  style={
    channelThumbnail
      ? { backgroundImage: `url(${channelThumbnail})` }
      : undefined
  }
>
  <div className="artist-page-header__overlay" />

  <div className="artist-page-header__content">
    <div className="artist-page-avatar">
  {channelThumbnail ? (
    <img src={channelThumbnail} alt={decodedName} />
  ) : (
    heroEmoji
  )}
</div>

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
      onClick={() => toggleFollowArtist(decodedName, channelId)}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  </div>
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
            <div key={song.id} onClick={() => setSelectedTrack(song)}>
              <MusicCard3D
                title={song.title}
                artist={song.artist}
                channelId={song.channelId}
                genre="Music"
                verdict="NEW"
                emoji="🎵"
                videoId={song.id}
                thumbnail={song.thumbnail}
                embedUrl={song.embedUrl}
                savedSongs={savedSongs}
                setSavedSongs={setSavedSongs}
              />
            </div>
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

            <MovieModal
        movie={
          playingMovie ||
          (selectedTrack
            ? {
                title: selectedTrack.title,
                artist: selectedTrack.artist,
                duration: "",
                type: "Music",
                videoUrl: selectedTrack.embedUrl,
                videoId: selectedTrack.id,
                emoji: "🎵",
              }
            : null)
        }
        onClose={() => {
          setPlayingMovie(null);
          setSelectedTrack(null);
        }}
      />
    </section>
  );
}

export default ArtistPage;