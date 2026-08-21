import { Link } from "react-router-dom";
import "./BrowsePage.css";

const categories = [
  { label: "Discover", icon: "🧭", to: "/" },
  { label: "Top Picks", icon: "👑", to: "/explore" },
  { label: "Released", icon: "🗓️", to: "/releases" },
  { label: "Upcoming", icon: "⏳", to: "/releases" },
  { label: "People", icon: "👥", to: "/people" },
  { label: "Your Feed", icon: "📡", to: "/feed" },
  { label: "Collections", icon: "🔖", to: "/collections" },
  { label: "Profile", icon: "👤", to: "/profile" },
];

function BrowsePage() {
  return (
    <section className="browse-page">
      <div className="browse-header">
        <h1>Browse</h1>
        <p>Jump straight to any part of VIBR.</p>
      </div>

      <div className="browse-grid">
        {categories.map((cat) => (
          <Link to={cat.to} key={cat.label} className="browse-tile">
            <span className="browse-tile__icon">{cat.icon}</span>
            <span className="browse-tile__label">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BrowsePage;