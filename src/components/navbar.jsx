function Navbar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar liquid-glass">

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

        <button
        onClick={() => setActivePage("people")}
         className={activePage === "people" ? "active" : ""}
        >
        People
        </button>

      </nav>

      <div className="sidebar-note">
        <strong>Stop scrolling.</strong>

        <p>
          Find something worth hearing,
          from people whose taste you trust.
        </p>
      </div>

    </aside>
  );
}

export default Navbar;