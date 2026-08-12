import { useState } from "react";

function MusicCard({
  title,
  artist,
  genre,
  verdict,
  emoji,
  savedSongs,
  setSavedSongs
}) {

  const [heard, setHeard] = useState(false);
  const [userVerdict, setUserVerdict] = useState(null);

  return (
    <div className="music-card">

      <div className="album-cover">
        {emoji}
      </div>

      <h3>{title}</h3>

      <p className="artist">
        {artist} · {genre}
      </p>

      <div className="verdict-section">

  <span className="verdict">
    {userVerdict || verdict}
  </span>

  <div className="verdict-buttons">

   <button onClick={() => setUserVerdict("🔥 GOD LEVEL")}>
  GOD LEVEL
</button>

<button onClick={() => setUserVerdict("💜 PERFECT")}>
  PERFECT
</button>

<button onClick={() => setUserVerdict("👍 GOOD")}>
  GOOD
</button>

<button onClick={() => setUserVerdict("😐 MEHHHHH")}>
  MEHHHHH
</button>

  </div>

</div>

      <div className="card-actions">

        <button
  onClick={() => {
    const alreadySaved = savedSongs.some(
      song => song.title === title
    );

    if (alreadySaved) {
      setSavedSongs(
        savedSongs.filter(song => song.title !== title)
      );
    } else {
      setSavedSongs([
        ...savedSongs,
        {
          title,
          artist,
          genre,
          verdict,
          emoji
        }
      ]);
    }
  }}
  className={
    savedSongs.some(song => song.title === title)
      ? "selected"
      : ""
  }
>
  {savedSongs.some(song => song.title === title)
    ? "✓ Saved"
    : "＋ Save"}
</button>

        <button
          onClick={() => setHeard(!heard)}
          className={heard ? "selected" : ""}
        >
          {heard ? "✓ Heard" : "Mark Heard"}
        </button>

      </div>

    </div>
  );
}

export default MusicCard;