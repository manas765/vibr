function Navbar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        VIBR<span>•</span>
      </div>

      <nav>

        <button className="nav-item active">
          🏠 Discover
        </button>

        <button className="nav-item">
          ◉ Your Feed
        </button>

        <button className="nav-item">
          ▣ Collections
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