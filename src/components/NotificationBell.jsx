import { useState, useRef, useEffect } from "react";
import "./NotificationBell.css";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className="notification-bell__button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        🔔
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <h3>Notifications</h3>
          </div>

          <div className="notification-panel__empty">
            <span className="notification-panel__bell">🔔</span>
            <p>No notifications yet</p>
            <span>Follows, saves, and replies will show up here.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;