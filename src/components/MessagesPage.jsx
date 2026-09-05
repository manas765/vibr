import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./MessagesPage.css";

function timeLabel(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [following, setFollowing] = useState([]); // [{id, username}]
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const [activeContact, setActiveContact] = useState(null); // {id, username}
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) loadFollowing(user.id);
    });
  }, []);

  function loadFollowing(userId) {
    setLoadingFollowing(true);
    supabase
      .from("followed_users")
      .select("followed_id")
      .eq("follower_id", userId)
      .then(async ({ data, error }) => {
        if (error || !data || data.length === 0) {
          setFollowing([]);
          setLoadingFollowing(false);
          return;
        }

        const ids = data.map((row) => row.followed_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ids);

        setFollowing(profiles || []);
        setLoadingFollowing(false);
      });
  }

  useEffect(() => {
    if (!currentUser || !activeContact) return;

    loadThread();

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

  async function sendMessage() {
    if (!messageText.trim() || !currentUser || !activeContact) return;

    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        recipient_id: activeContact.id,
        message_text: messageText.trim(),
      })
      .select();

    setSending(false);

    if (!error && data) {
      setMessages((prev) => [...prev, data[0]]);
      setMessageText("");
    }
  }

  return (
    <section className="messages-page">
      <Link to="/" className="back-link" style={{ margin: "20px 0 0 24px" }}>
        ← Back to Discover
      </Link>

      <div className="messages-layout">
        <div className="messages-sidebar">
          <h1>Messages</h1>
          <p className="messages-sidebar__hint">People you follow</p>

          {loadingFollowing && <p className="messages-empty">Loading...</p>}

          {!loadingFollowing && following.length === 0 && (
            <p className="messages-empty">
              You're not following anyone yet. Follow someone from People or your Feed to message them.
            </p>
          )}

          <div className="messages-contact-list">
            {following.map((contact) => (
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
                <span>{contact.username || "Anonymous"}</span>
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
                <div className="messages-contact__avatar">
                  {activeContact.username ? activeContact.username.slice(0, 1).toUpperCase() : "?"}
                </div>
                <h2>{activeContact.username || "Anonymous"}</h2>
              </div>

              <div className="messages-thread__body" ref={scrollRef}>
                {messages.length === 0 && (
                  <p className="messages-empty">No messages yet. Say hi!</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.sender_id === currentUser?.id
                        ? "message-bubble message-bubble--mine"
                        : "message-bubble"
                    }
                  >
                    <p>{m.message_text}</p>
                    <span>{timeLabel(m.created_at)}</span>
                  </div>
                ))}
              </div>

              <div className="messages-thread__composer">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;