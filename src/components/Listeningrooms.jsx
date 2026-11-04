import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import SongPicker from "./SongPicker";
import "./Listeningrooms.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function Listeningrooms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [song, setSong] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function loadRooms() {
    const since = new Date(Date.now() - SIX_HOURS).toISOString();
    supabase
      .from("listening_rooms")
      .select("*")
      .eq("is_active", true)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRooms(data || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadRooms();
    const id = setInterval(loadRooms, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setUsername(data?.username || ""));
  }, [user]);

  async function createRoom(e) {
    e.preventDefault();
    if (!user || !song) return;
    setCreating(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("listening_rooms")
      .insert({
        host_id: user.id,
        host_username: username || "Someone",
        title: title.trim() || `${username || "My"}'s room`,
        song_title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        video_id: song.id,
      })
      .select()
      .single();

    setCreating(false);

    if (insertError || !data) {
      setError("Couldn't start the room. Please try again.");
      return;
    }
    navigate(`/rooms/${data.id}`);
  }

  return (
    <section className="rooms-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="rooms-header">
        <div>
          <h1>Listening Rooms</h1>
          <p>Press play together. Everyone in the room hears the same song at the same moment.</p>
        </div>
        <button className="rooms-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "Start a room"}
        </button>
      </div>

      {showCreate && (
        <form className="rooms-create" onSubmit={createRoom}>
          <label>
            Room name
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${username || "My"}'s room`}
              maxLength={60}
            />
          </label>

          <div className="rooms-create__song">
            <span>First song</span>
            {song ? (
              <div className="rooms-create__picked">
                <img src={song.thumbnail} alt="" />
                <div>
                  <strong>{song.title}</strong>
                  <small>{song.artist}</small>
                </div>
                <button type="button" onClick={() => setSong(null)}>Change</button>
              </div>
            ) : (
              <SongPicker onPick={setSong} />
            )}
          </div>

          {error && <p className="rooms-error">{error}</p>}

          <button className="rooms-primary" type="submit" disabled={!song || creating}>
            {creating ? "Starting..." : "Go live"}
          </button>
        </form>
      )}

      {loading && <p className="rooms-empty">Loading rooms...</p>}

      {!loading && rooms.length === 0 && (
        <p className="rooms-empty">No rooms are live right now. Start one and invite a friend.</p>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <Link to={`/rooms/${room.id}`} className="rooms-card" key={room.id}>
            <img src={room.thumbnail} alt="" />
            <div className="rooms-card__body">
              <span className="rooms-card__live">Live</span>
              <strong>{room.title}</strong>
              <small>
                {room.song_title} · {room.artist}
              </small>
              <small>Hosted by {room.host_username}</small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Listeningrooms;