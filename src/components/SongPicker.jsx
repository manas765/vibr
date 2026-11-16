import { useState, useRef } from "react";
import { cachedJson, normalizeQuery } from "../lib/cachedFetch";

// Search-as-you-type song picker. Debounced + cached because every YouTube
// search costs 100 quota units.
function SongPicker({ onPick, placeholder = "Search for a song..." }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const timer = useRef(null);
  const latest = useRef("");

  function handleChange(value) {
    setQuery(value);
    latest.current = value;
    clearTimeout(timer.current);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    timer.current = setTimeout(() => {
      cachedJson(
        `/api/youtube-search?q=${encodeURIComponent(normalizeQuery(value))}`,
        60 * 60 * 1000
      ).then((data) => {
        if (latest.current === value) setResults((data.tracks || []).slice(0, 6));
      });
    }, 600);
  }

  function pick(track) {
    setQuery("");
    setResults([]);
    latest.current = "";
    onPick(track);
  }

  return (
    <div className="song-picker2">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search for a song"
      />
      {results.length > 0 && (
        <ul className="song-picker2__results">
          {results.map((track) => (
            <li key={track.id}>
              <button type="button" onClick={() => pick(track)}>
                <img src={track.thumbnail} alt="" />
                <span>
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongPicker;