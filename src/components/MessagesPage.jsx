import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./MessagesPage.css";

const QUICK_EMOJI = [
  "😀", "😂", "😍", "🥲", "😎", "🤔", "😭", "🙌",
  "🔥", "💜", "🎵", "🎧", "👍", "👎", "😅", "🙏",
  "💀", "✨", "😴", "😡", "🥳", "❤️", "😢", "😮",
];

function timeLabel(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesPage({ savedSongs = [] }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [myUsername, setMyUsername] = useState("Anonymous");
  const [conversations, setConversations] = useState([]); // [{id, username, lastMessage, lastAt}]
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [activeContact, setActiveContact] = useState(null); // {id, username}
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);

  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactProfile, setContactProfile] = useState(null); // {avatar_url, bio}
  const [contactStats, setContactStats] = useState({ songCount: 0, artistCount: 0, genreCount: 0 });

  const scrollRef = useRef(null);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        loadConversations(user.id);
        supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setMyUsername(data?.username || "Anonymous"));
      }
    });

    // Arrived here from a profile's "Message" button, or a "new message" notification —
    // jump straight into that chat
    if (location.state?.userId) {
      setActiveContact({
        id: location.state.userId,
        username: location.state.username,
      });
    }
  }, []);

  function summarize(m) {
    if (m.message_type === "image") return "📷 Photo";
    if (m.message_type === "song") return `🎵 ${m.song_data?.title || "Song"}`;
    return m.message_text || "";
  }

  function loadConversations(userId) {
    setLoadingConversations(true);

    supabase
      .from("messages")
      .select("sender_id, recipient_id, message_text, message_type, song_data, created_at")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error || !data || data.length === 0) {
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        const lastByContact = new Map();
        data.forEach((m) => {
          const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id;
          if (!lastByContact.has(otherId)) {
            lastByContact.set(otherId, { lastMessage: summarize(m), lastAt: m.created_at });
          }
        });

        const ids = [...lastByContact.keys()];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ids);

        const merged = (profiles || [])
          .map((p) => ({ ...p, ...lastByContact.get(p.id) }))
          .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

        setConversations(merged);
        setLoadingConversations(false);
      });
  }

  useEffect(() => {
    if (!currentUser || !activeContact) return;

    loadThread();
    loadContactProfile();
    setShowEmojiPicker(false);
    setShowSongPicker(false);
    setShowContactInfo(false);

    // Live updates: listen for new messages sent TO me, then check if they belong to this thread
    const channel = supabase
      .channel(`messages-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === activeContact.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeContact]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function loadThread() {
    supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},recipient_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},recipient_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setMessages(data || []);
      });
  }

  function loadContactProfile() {
    supabase
      .from("profiles")
      .select("avatar_url, bio")
      .eq("id", activeContact.id)
      .single()
      .then(({ data }) => setContactProfile(data || null));

    supabase
      .from("saved_songs")
      .select("artist, genre")
      .eq("user_id", activeContact.id)
      .then(({ data }) => {
        const songs = data || [];
        setContactStats({
          songCount: songs.length,
          artistCount: new Set(songs.map((s) => s.artist)).size,
          genreCount: new Set(songs.map((s) => s.genre)).size,
        });
      });
  }

  function notifyContact() {
    supabase
      .from("notifications")
      .insert({
        user_id: activeContact.id,
        actor_username: myUsername,
        type: "message",
        message: "sent you a message",
        link: "/messages",
        data: { userId: currentUser.id, username: myUsername },
      })
      .then(() => {});
  }

  function bumpConversation(summary) {
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== activeContact.id);
      return [
        { id: activeContact.id, username: activeContact.username, lastMessage: summary, lastAt: new Date().toISOString() },
        ...rest,
      ];
    });
  }

  async function sendMessage() {
    if (!messageText.trim() || !currentUser || !activeContact) return;

    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        recipient_id: activeContact.id,
        message_text: messageText.trim(),
        message_type: "text",
      })
      .select();

    setSending(false);

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      bumpConversation(messageText.trim());
      setMessageText("");
      setShowEmojiPicker(false);
      notifyContact();
    }
  }

  function addEmoji(emoji) {
    setMessageText((prev) => prev + emoji);
  }

  async function handleImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !currentUser || !activeContact) return;

    setUploadingImage(true);

    const filePath = `${currentUser.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("message-images")
      .upload(filePath, file);

    if (uploadError) {
      setUploadingImage(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("message-images")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        recipient_id: activeContact.id,
        message_type: "image",
        image_url: publicUrlData.publicUrl,
      })
      .select();

    setUploadingImage(false);

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      bumpConversation("📷 Photo");
      notifyContact();
    }
  }

  async function shareSong(song) {
    if (!currentUser || !activeContact) return;

    setShowSongPicker(false);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        recipient_id: activeContact.id,
        message_type: "song",
        song_data: {
          title: song.song_title || song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          videoId: song.id || song.videoId,
        },
      })
      .select();

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      bumpConversation(`🎵 ${song.song_title || song.title}`);
      notifyContact();
    }
  }

  async function deleteMessage(messageId) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", currentUser.id);
  }

  return (
    <section className="messages-page">
      <Link to="/" className="back-link" style={{ margin: "20px 0 0 24px" }}>
        ← Back to Discover
      </Link>

      <div className={activeContact ? "messages-layout has-active" : "messages-layout"}>
        <div className="messages-sidebar">
          <h1>Messages</h1>
          <p className="messages-sidebar__hint">Conversations</p>

          {loadingConversations && <p className="messages-empty">Loading...</p>}

          {!loadingConversations && conversations.length === 0 && !activeContact && (
            <p className="messages-empty">
              No conversations yet. Once you and someone follow each other, open their profile and hit Message to start.
            </p>
          )}

          <div className="messages-contact-list">
            {conversations.map((contact) => (
              <button
                key={contact.id}
                className={
                  activeContact?.id === contact.id
                    ? "messages-contact active"
                    : "messages-contact"
                }
                onClick={() => setActiveContact(contact)}
              >
                <div className="messages-contact__avatar">
                  {contact.username ? contact.username.slice(0, 1).toUpperCase() : "?"}
                </div>
                <div className="messages-contact__info" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ display: "block" }}>{contact.username || "Anonymous"}</span>
                  {contact.lastMessage && (
                    <small style={{ display: "block", marginTop: 2 }}>{contact.lastMessage}</small>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="messages-thread">
          {!activeContact && (
            <div className="messages-thread__placeholder">
              <p>Select someone you follow to start chatting.</p>
            </div>
          )}

          {activeContact && (
            <>
              <div className="messages-thread__header">
                <button
                  type="button"
                  className="messages-thread__back"
                  onClick={() => setActiveContact(null)}
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="messages-thread__identity"
                  onClick={() => setShowContactInfo(true)}
                >
                  <div className="messages-contact__avatar">
                    {contactProfile?.avatar_url ? (
                      <img src={contactProfile.avatar_url} alt="" />
                    ) : activeContact.username ? (
                      activeContact.username.slice(0, 1).toUpperCase()
                    ) : (
                      "?"
                    )}
                  </div>
                  <h2>{activeContact.username || "Anonymous"}</h2>
                </button>
              </div>

              <div className="messages-thread__body" ref={scrollRef}>
                {messages.length === 0 && (
                  <p className="messages-empty">No messages yet. Say hi!</p>
                )}
                {messages.map((m) => {
                  const isMine = m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={
                        isMine ? "message-bubble message-bubble--mine" : "message-bubble"
                      }
                    >
                      {isMine && (
                        <button
                          className="message-delete"
                          onClick={() => deleteMessage(m.id)}
                          aria-label="Delete message"
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}

                      {m.message_type === "image" && m.image_url && (
                        <img src={m.image_url} alt="" className="message-image" />
                      )}

                      {m.message_type === "song" && m.song_data && (
                        <div className="message-song-share">
                          {m.song_data.thumbnail && (
                            <img src={m.song_data.thumbnail} alt="" />
                          )}
                          <div>
                            <strong>{m.song_data.title}</strong>
                            <small>{m.song_data.artist}</small>
                          </div>
                        </div>
                      )}

                      {(!m.message_type || m.message_type === "text") && (
                        <p>{m.message_text}</p>
                      )}

                      <span>{timeLabel(m.created_at)}</span>
                    </div>
                  );
                })}
              </div>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  {QUICK_EMOJI.map((emoji) => (
                    <button key={emoji} onClick={() => addEmoji(emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {showSongPicker && (
                <div className="song-picker">
                  {savedSongs.length === 0 ? (
                    <p className="messages-empty">
                      Nothing in your collection yet to share.
                    </p>
                  ) : (
                    savedSongs.map((song) => (
                      <button
                        key={song.id || song.song_title}
                        className="song-picker-item"
                        onClick={() => shareSong(song)}
                      >
                        {song.thumbnail && <img src={song.thumbnail} alt="" />}
                        <div>
                          <strong>{song.song_title || song.title}</strong>
                          <small>{song.artist}</small>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="messages-thread__composer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  className="composer-icon-button"
                  onClick={() => {
                    setShowEmojiPicker((v) => !v);
                    setShowSongPicker(false);
                  }}
                  title="Emoji"
                >
                  😊
                </button>

                <button
                  type="button"
                  className="composer-icon-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  title="Send an image"
                >
                  {uploadingImage ? "…" : "🖼"}
                </button>

                <button
                  type="button"
                  className="composer-icon-button"
                  onClick={() => {
                    setShowSongPicker((v) => !v);
                    setShowEmojiPicker(false);
                  }}
                  title="Share a song"
                >
                  🎵
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} disabled={sending || !messageText.trim()}>
                  Send
                </button>
              </div>

              {showContactInfo && (
                <div className="contact-info-panel">
                  <div className="contact-info-panel__header">
                    <button
                      type="button"
                      className="contact-info-panel__close"
                      onClick={() => setShowContactInfo(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                    <span>Contact info</span>
                  </div>

                  <div className="contact-info-panel__body">
                    <div className="contact-info-panel__avatar">
                      {contactProfile?.avatar_url ? (
                        <img src={contactProfile.avatar_url} alt="" />
                      ) : activeContact.username ? (
                        activeContact.username.slice(0, 1).toUpperCase()
                      ) : (
                        "?"
                      )}
                    </div>
                    <h3>{activeContact.username || "Anonymous"}</h3>
                    {contactProfile?.bio && <p className="contact-info-panel__bio">{contactProfile.bio}</p>}

                    <Link to={`/profile/${activeContact.id}`} className="contact-info-panel__view-profile">
                      View full profile →
                    </Link>

                    <div className="contact-info-panel__stats">
                      <div>
                        <strong>{contactStats.songCount}</strong>
                        <span>Songs</span>
                      </div>
                      <div>
                        <strong>{contactStats.artistCount}</strong>
                        <span>Artists</span>
                      </div>
                      <div>
                        <strong>{contactStats.genreCount}</strong>
                        <span>Genres</span>
                      </div>
                    </div>

                    <div className="contact-info-panel__section">
                      <h4>Shared photos</h4>
                      {(() => {
                        const images = messages.filter((m) => m.message_type === "image" && m.image_url);
                        return images.length === 0 ? (
                          <p className="contact-info-panel__empty">No photos shared yet.</p>
                        ) : (
                          <div className="contact-info-panel__image-grid">
                            {images.map((m) => (
                              <img key={m.id} src={m.image_url} alt="" />
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="contact-info-panel__section">
                      <h4>Shared songs</h4>
                      {(() => {
                        const songs = messages.filter((m) => m.message_type === "song" && m.song_data);
                        return songs.length === 0 ? (
                          <p className="contact-info-panel__empty">No songs shared yet.</p>
                        ) : (
                          <div className="contact-info-panel__song-list">
                            {songs.map((m) => (
                              <div className="contact-info-panel__song" key={m.id}>
                                {m.song_data.thumbnail && <img src={m.song_data.thumbnail} alt="" />}
                                <div>
                                  <strong>{m.song_data.title}</strong>
                                  <small>{m.song_data.artist}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;