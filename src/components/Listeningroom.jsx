import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import SongPicker from "./SongPicker";
import "./ListeningRooms.css";

// --- YouTube IFrame API, loaded once ---------------------------------
let ytPromise = null;
function loadYouTube() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytPromise) {
    ytPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previous) previous();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return ytPromise;
}

const YT_PLAYING = 1;
const YT_BUFFERING = 3;

function ListeningRoom() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [ended, setEnded] = useState(false);
  const [listeners, setListeners] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const playerReady = useRef(false);
  const channelRef = useRef(null);
  const latestState = useRef(null);
  const joinedRef = useRef(false);
  const chatEndRef = useRef(null);

  const isHost = !!(room && user && room.host_id === user.id);

  // Load the room and the viewer's username
  useEffect(() => {
    supabase
      .from("listening_rooms")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else {
          setRoom(data);
          if (!data.is_active) setEnded(true);
        }
      });
  }, [roomId]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setUsername(data?.username || "Guest"));
  }, [user]);

  // Apply the host's state to our player (listeners only)
  function applyState(s) {
    const p = playerRef.current;
    if (!p || !playerReady.current || !joinedRef.current || !s) return;

    const target = s.time + (s.playing ? 0.3 : 0);
    const currentId = p.getVideoData ? p.getVideoData().video_id : null;

    if (currentId !== s.videoId) {
      p.loadVideoById(s.videoId, target);
      if (!s.playing) setTimeout(() => p.pauseVideo(), 600);
      return;
    }

    if (Math.abs(p.getCurrentTime() - target) > 2.5) p.seekTo(target, true);

    const st = p.getPlayerState();
    if (s.playing && st !== YT_PLAYING && st !== YT_BUFFERING) p.playVideo();
    if (!s.playing && st === YT_PLAYING) p.pauseVideo();
  }

  function hostBroadcast() {
    const p = playerRef.current;
    if (!p || !playerReady.current || !channelRef.current) return;
    const st = p.getPlayerState();
    channelRef.current.send({
      type: "broadcast",
      event: "state",
      payload: {
        videoId: p.getVideoData().video_id,
        playing: st === YT_PLAYING || st === YT_BUFFERING,
        time: p.getCurrentTime(),
      },
    });
  }

  // Channel + player lifecycle
  useEffect(() => {
    if (!room || !user || !username) return;

    let heartbeat = null;
    let destroyed = false;

    const channel = supabase.channel(`room:${room.id}`, {
      config: { broadcast: { self: false }, presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "state" }, ({ payload }) => {
        latestState.current = payload;
        applyState(payload);
      })
      .on("broadcast", { event: "request_state" }, () => {
        if (room.host_id === user.id) hostBroadcast();
      })
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev.slice(-99), payload]);
      })
      .on("broadcast", { event: "ended" }, () => {
        setEnded(true);
        playerRef.current?.pauseVideo?.();
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setListeners(Object.values(state).map((entries) => entries[0]));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ username, user_id: user.id });
          if (room.host_id !== user.id) {
            channel.send({ type: "broadcast", event: "request_state", payload: {} });
          }
        }
      });

    loadYouTube().then((YT) => {
      if (destroyed || !playerHostRef.current) return;
      const host = room.host_id === user.id;

      playerRef.current = new YT.Player(playerHostRef.current, {
        videoId: room.video_id,
        playerVars: {
          controls: host ? 1 : 0,
          disablekb: host ? 0 : 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerReady.current = true;
            if (host) {
              heartbeat = setInterval(hostBroadcast, 4000);
            } else if (latestState.current) {
              applyState(latestState.current);
            }
          },
          onStateChange: () => {
            if (host) hostBroadcast();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      clearInterval(heartbeat);
      playerReady.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        // player may already be gone
      }
      playerRef.current = null;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room?.id, user?.id, username]);

  // Keep the chat scrolled to the newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function joinRoom() {
    joinedRef.current = true;
    setJoined(true);
    // This click is the user gesture browsers require before audio may play
    if (latestState.current) applyState(latestState.current);
    else channelRef.current?.send({ type: "broadcast", event: "request_state", payload: {} });
  }

  function sendChat(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !channelRef.current) return;
    const message = { name: username, text, at: Date.now() };
    channelRef.current.send({ type: "broadcast", event: "chat", payload: message });
    setMessages((prev) => [...prev.slice(-99), message]);
    setDraft("");
  }

  async function changeSong(track) {
    if (!isHost) return;
    const updated = {
      video_id: track.id,
      song_title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
    };
    await supabase.from("listening_rooms").update(updated).eq("id", room.id);
    setRoom((r) => ({ ...r, ...updated }));
    playerRef.current?.loadVideoById(track.id);
    setTimeout(hostBroadcast, 1200);
  }

  async function endRoom() {
    await supabase.from("listening_rooms").update({ is_active: false }).eq("id", room.id);
    channelRef.current?.send({ type: "broadcast", event: "ended", payload: {} });
    navigate("/rooms");
  }

  if (notFound) {
    return (
      <section className="rooms-page">
        <Link to="/rooms" className="back-link">← All rooms</Link>
        <p className="rooms-empty">This room doesn't exist anymore.</p>
      </section>
    );
  }

  if (!room) return <section className="rooms-page"><p className="rooms-empty">Loading...</p></section>;

  return (
    <section className="rooms-page room">
      <Link to="/rooms" className="back-link">← All rooms</Link>

      <div className="room__header">
        <div>
          <span className="rooms-card__live">{ended ? "Ended" : "Live"}</span>
          <h1>{room.title}</h1>
          <p>
            {room.song_title} · {room.artist} — hosted by {room.host_username}
          </p>
        </div>
        <div className="room__header-actions">
          <span className="room__count">{listeners.length} listening</span>
          {isHost && !ended && (
            <button className="rooms-secondary" onClick={endRoom}>End room</button>
          )}
        </div>
      </div>

      <div className="room__layout">
        <div className="room__stage">
          <div className="room__player">
            <div ref={playerHostRef} />
            {!isHost && !joined && !ended && (
              <button className="room__join" onClick={joinRoom}>
                <span>▶</span>
                Tap to join {room.host_username}'s room
              </button>
            )}
            {ended && <div className="room__ended">This room has ended.</div>}
            {!isHost && joined && <div className="room__shield" aria-hidden="true" />}
          </div>

          {isHost && !ended && (
            <div className="room__host-tools">
              <span>Change the song for everyone</span>
              <SongPicker onPick={changeSong} placeholder="Search for the next song..." />
            </div>
          )}

          {!isHost && (
            <p className="room__hint">
              {room.host_username} controls playback. Your player stays in sync automatically.
            </p>
          )}
        </div>

        <aside className="room__side">
          <div className="room__listeners">
            <h2>In the room</h2>
            <ul>
              {listeners.map((l) => (
                <li key={l.user_id}>
                  <span className="room__avatar">{(l.username || "?").slice(0, 1).toUpperCase()}</span>
                  {l.username}
                  {l.user_id === room.host_id && <em>host</em>}
                </li>
              ))}
            </ul>
          </div>

          <div className="room__chat">
            <h2>Chat</h2>
            <div className="room__messages">
              {messages.length === 0 && <p className="rooms-empty">Say something to the room.</p>}
              {messages.map((m, i) => (
                <p key={i}>
                  <strong>{m.name}</strong> {m.text}
                </p>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} className="room__chat-form">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the room"
                maxLength={280}
                aria-label="Message the room"
              />
              <button type="submit" disabled={!draft.trim()}>Send</button>
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ListeningRoom;