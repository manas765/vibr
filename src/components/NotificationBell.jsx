import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./NotificationBell.css";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) loadNotifications(user.id);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function loadNotifications(userId) {
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (!error) setNotifications(data || []);
      });
  }

  function handleOpen() {
    const opening = !open;
    setOpen(opening);

    if (opening && unreadCount > 0 && currentUser) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds)
        .then(() => {});
    }
  }

  function handleNotificationClick(n) {
    setOpen(false);
    navigate(n.link);
  }

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className="notification-bell__button"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <h3>Notifications</h3>
          </div>

          {notifications.length === 0 && (
            <div className="notification-panel__empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications yet</p>
              <span>Messages, replies, and community activity will show up here.</span>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="notification-list">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={n.read ? "notification-item" : "notification-item unread"}
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className="notification-item__text">
                    <strong>{n.actor_username}</strong> {n.message}
                  </span>
                  <span className="notification-item__time">{timeAgo(n.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;