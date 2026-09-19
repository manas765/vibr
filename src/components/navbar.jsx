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
        Discover
         </button>

        <button
        onClick={() => setActivePage("feed")}
          className={activePage === "feed" ? "active" : ""}
        >
        Your Feed
         </button>

        <button
         onClick={() => setActivePage("collections")}
             className={activePage === "collections" ? "active" : ""}
        >
        Collections
        </button>

        <button
        onClick={() => setActivePage("releases")}
         className={activePage === "releases" ? "active" : ""}
        >
          New Releases
        </button>

        <div className="nav-divider" />

        <Link to="/browse" className={isRoute("/browse") ? "nav-link active" : "nav-link"}>
          Browse
        </Link>

        <Link to="/messages" className={isRoute("/messages") ? "nav-link active" : "nav-link"}>
          Messages
        </Link>

        <Link to="/trending" className={isRoute("/trending") ? "nav-link active" : "nav-link"}>
          Trending in Clips
        </Link>

        <Link to="/spaces" className={isRoute("/spaces") ? "nav-link active" : "nav-link"}>
          Spaces
        </Link>

        <NotificationBell variant="sidebar" />

      </nav>

      

    </aside>
  );
}

export default Navbar;