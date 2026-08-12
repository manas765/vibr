function Navbar({ activePage, setActivePage }) {
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

        <button className="nav-item">
          ◉ Your Feed
        </button>

        <button
         onClick={() => setActivePage("collections")}
             className={activePage === "collections" ? "active" : ""}
>
        Collections
        </button>

        <button className="nav-item">
          ◷ Releases
        </button>

        <button className="nav-item">
          ♧ People
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