import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar({ activePage, setActivePage }) {
  const location = useLocation();

  function isRoute(path) {
    return location.pathname === path;
  }

  return (
    <aside className="sidebar">

      <div className="logo">
        VIBR<span>•</span>
      </div>

      <nav>

        <button
        onClick={() => setActivePage("discover")}
          className={activePage === "discover" ? "active" : ""}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        Discover
         </button>

        <button
        onClick={() => setActivePage("feed")}
          className={activePage === "feed" ? "active" : ""}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        Your Feed
         </button>

        <button
         onClick={() => setActivePage("collections")}
             className={activePage === "collections" ? "active" : ""}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
        Collections
        </button>

        <button
        onClick={() => setActivePage("releases")}
         className={activePage === "releases" ? "active" : ""}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M3 9h18" />
            <path d="M8 2v4" />
            <path d="M16 2v4" />
          </svg>
          New Releases
        </button>

        <div className="nav-divider" />

        <NotificationBell variant="sidebar" />

        <Link to="/browse" className={isRoute("/browse") ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          Browse
        </Link>

        <Link to="/messages" className={isRoute("/messages") ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Messages
        </Link>

        <Link to="/trending" className={isRoute("/trending") ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Trending in Clips
        </Link>

        <Link to="/spaces" className={isRoute("/spaces") ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8l-4 4V6c0-1.1.9-2 2-2z" />
          </svg>
          Spaces
        </Link>

      </nav>

      

    </aside>
  );
}

export default Navbar;