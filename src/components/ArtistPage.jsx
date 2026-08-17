import { useParams, Link } from "react-router-dom";
import { music } from "../data/music";
import MusicCard3D from "./MusicCard3D";

function ArtistPage({ savedSongs, setSavedSongs, followedArtists, toggleFollowArtist }) {
  const { artistName } = useParams();
  const decodedName = decodeURIComponent(artistName);

  const artistSongs = music.filter((song) => song.artist === decodedName);
  const isFollowing = followedArtists.includes(decodedName);

  if (artistSongs.length === 0) {
    return (
      <section className="artist-page">
        <Link to="/" className="back-link">← Back to Discover</Link>
        <h1>Artist not found</h1>
        <p>No songs found for "{decodedName}".</p>
      </section>
    );
  }

  return (
    <section className="artist-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="artist-page-header">
        <div className="artist-page-avatar">{artistSongs[0].emoji}</div>

        <div>
          <h1>{decodedName}</h1>
          <p>{artistSongs.length} track{artistSongs.length > 1 ? "s" : ""} on VIBR</p>
        </div>

        <button
          className={isFollowing ? "following" : "follow-button"}
          onClick={() => toggleFollowArtist(decodedName)}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <h2 className="artist-page-subheading">Tracks</h2>

      <div className="music-grid">
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
    </section>
  );
}

export default ArtistPage;