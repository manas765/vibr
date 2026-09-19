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

function NotificationBell({ variant = "topbar" }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myUsername, setMyUsername] = useState("Anonymous");
  const [notifications, setNotifications] = useState([]);
  // notification id -> "accepted" | "mutual" | "declined" | "followed_back"
  const [actionedRequests, setActionedRequests] = useState({});
  const [processingIds, setProcessingIds] = useState({});
  const ref = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        loadNotifications(user.id);
        supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setMyUsername(data?.username || "Anonymous"));
      }
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
        if (!error) {
          setNotifications(data || []);

          const hydrated = {};
          (data || []).forEach((n) => {
            if (n.data?.actioned) hydrated[n.id] = n.data.actioned;
          });
          setActionedRequests((prev) => ({ ...hydrated, ...prev }));
        }
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
    navigate(n.link, { state: n.data || undefined });
  }

  async function persistActioned(n, value) {
    await supabase
      .from("notifications")
      .update({ data: { ...(n.data || {}), actioned: value } })
      .eq("id", n.id);
  }

  async function handleAccept(e, n) {
    e.stopPropagation();
    const requesterId = n.data?.requesterId;
    if (!requesterId || !currentUser || actionedRequests[n.id] || processingIds[n.id]) return;

    setProcessingIds((prev) => ({ ...prev, [n.id]: true }));

    await supabase
      .from("followed_users")
      .insert({ follower_id: requesterId, followed_id: currentUser.id });

    await supabase
      .from("follow_requests")
      .delete()
      .eq("requester_id", requesterId)
      .eq("target_id", currentUser.id);

    supabase
      .from("notifications")
      .insert({
        user_id: requesterId,
        actor_username: myUsername,
        type: "follow_accept",
        message: "accepted your follow request",
        link: `/profile/${currentUser.id}`,
        data: { accepterId: currentUser.id },
      })
      .then(() => {});

    const { data: alreadyFollowing } = await supabase
      .from("followed_users")
      .select("followed_id")
      .eq("follower_id", currentUser.id)
      .eq("followed_id", requesterId);

    const finalState = alreadyFollowing && alreadyFollowing.length > 0 ? "mutual" : "accepted";

    await persistActioned(n, finalState);

    setActionedRequests((prev) => ({ ...prev, [n.id]: finalState }));
    setProcessingIds((prev) => ({ ...prev, [n.id]: false }));
  }

  async function handleDecline(e, n) {
    e.stopPropagation();
    const requesterId = n.data?.requesterId;
    if (!requesterId || !currentUser || actionedRequests[n.id] || processingIds[n.id]) return;

    setProcessingIds((prev) => ({ ...prev, [n.id]: true }));

    await supabase
      .from("follow_requests")
      .delete()
      .eq("requester_id", requesterId)
      .eq("target_id", currentUser.id);

    await persistActioned(n, "declined");

    setActionedRequests((prev) => ({ ...prev, [n.id]: "declined" }));
    setProcessingIds((prev) => ({ ...prev, [n.id]: false }));
  }

  async function handleFollowBack(e, n) {
    e.stopPropagation();
    const requesterId = n.data?.requesterId;
    if (!requesterId || !currentUser || processingIds[n.id] || actionedRequests[n.id] === "followed_back") return;

    setProcessingIds((prev) => ({ ...prev, [n.id]: true }));

    const { error } = await supabase
      .from("follow_requests")
      .insert({ requester_id: currentUser.id, target_id: requesterId, status: "pending" });

    if (!error) {
      supabase
        .from("notifications")
        .insert({
          user_id: requesterId,
          actor_username: myUsername,
          type: "follow_request",
          message: "wants to follow you",
          link: "/",
          data: { requesterId: currentUser.id, requesterUsername: myUsername },
        })
        .then(() => {});

      await persistActioned(n, "followed_back");
      setActionedRequests((prev) => ({ ...prev, [n.id]: "followed_back" }));
    }

    setProcessingIds((prev) => ({ ...prev, [n.id]: false }));
  }

  return (
    <div className={variant === "sidebar" ? "notification-bell notification-bell--sidebar" : "notification-bell"} ref={ref}>
      <button
        className={variant === "sidebar" ? "nav-link notification-bell__sidebar-trigger" : "notification-bell__button"}
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {variant === "sidebar" && <span>Notifications</span>}
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
              {notifications.map((n) => {
                const actioned = actionedRequests[n.id];

                if (n.type === "follow_request") {
                  return (
                    <div
                      key={n.id}
                      className={n.read ? "notification-item" : "notification-item unread"}
                    >
                      <span className="notification-item__text">
                        <strong>{n.actor_username}</strong> {n.message}
                      </span>
                      <span className="notification-item__time">{timeAgo(n.created_at)}</span>

                      {!actioned && (
                        <div className="notification-item__actions">
                          <button
                            className="notification-action notification-action--accept"
                            onClick={(e) => handleAccept(e, n)}
                            disabled={processingIds[n.id]}
                          >
                            Accept
                          </button>
                          <button
                            className="notification-action notification-action--decline"
                            onClick={(e) => handleDecline(e, n)}
                            disabled={processingIds[n.id]}
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {actioned === "accepted" && (
                        <div className="notification-item__actions">
                          <span className="notification-item__status">✓ Accepted</span>
                          <button
                            className="notification-action notification-action--accept"
                            onClick={(e) => handleFollowBack(e, n)}
                            disabled={processingIds[n.id]}
                          >
                            Follow back
                          </button>
                        </div>
                      )}

                      {actioned === "mutual" && (
                        <span className="notification-item__status">
                          ✓ Accepted — you follow each other
                        </span>
                      )}

                      {actioned === "followed_back" && (
                        <span className="notification-item__status">✓ Follow request sent</span>
                      )}

                      {actioned === "declined" && (
                        <span className="notification-item__status">Declined</span>
                      )}
                    </div>
                  );
                }

                return (
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
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;