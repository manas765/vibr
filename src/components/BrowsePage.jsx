import { useNavigate, Link } from "react-router-dom";
import "./BrowsePage.css";

const categories = [
  { label: "Discover", icon: "🧭", type: "route", to: "/" },
  { label: "Top Picks", icon: "👑", type: "route", to: "/explore" },
  { label: "Released", icon: "🗓️", type: "page", page: "releases" },
  { label: "Upcoming", icon: "⏳", type: "page", page: "releases" },
  { label: "People", icon: "👥", type: "page", page: "people" },
  { label: "Your Feed", icon: "📡", type: "page", page: "feed" },
  { label: "Collections", icon: "🔖", type: "page", page: "collections" },
  { label: "Profile", icon: "👤", type: "page", page: "profile" },
];

function BrowsePage({ setActivePage }) {
  const navigate = useNavigate();

  function handleClick(cat) {
    if (cat.type === "route") {
      navigate(cat.to);
    } else {
      setActivePage(cat.page);
      navigate("/");
    }
  }

  return (
    <section className="browse-page">
      <Link to="/" className="back-link">← Back to Discover</Link>

      <div className="browse-header">
        <h1>Browse</h1>
        <p>Jump straight to any part of VIBR.</p>
      </div>

      <div className="browse-grid">
        {categories.map((cat) => (
          <button
            onClick={() => handleClick(cat)}
            key={cat.label}
            className="browse-tile"
          >
            <span className="browse-tile__icon">{cat.icon}</span>
            <span className="browse-tile__label">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default BrowsePage;