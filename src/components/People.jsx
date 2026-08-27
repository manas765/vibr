import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./People.css";

function People() {
  const [people, setPeople] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      loadPeople(user);
      if (user) loadFollows(user);
    });
  }, []);

  function loadPeople(user) {
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, username, bio")
      .then(({ data, error }) => {
        if (!error) {
          const others = user
            ? (data || []).filter((p) => p.id !== user.id)
            : data || [];
          setPeople(others);
        }
        setLoading(false);
      });
  }

  function loadFollows(user) {
    supabase
      .from("followed_users")
      .select("followed_id")
      .eq("follower_id", user.id)
      .then(({ data, error }) => {
        if (!error) {
          setFollowedIds((data || []).map((row) => row.followed_id));
        }
      });
  }

  async function toggleFollow(personId) {
    if (!currentUser) return;

    const isFollowing = followedIds.includes(personId);

    if (isFollowing) {
      await supabase
        .from("followed_users")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("followed_id", personId);

      setFollowedIds(followedIds.filter((id) => id !== personId));
    } else {
      await supabase
        .from("followed_users")
        .insert({ follower_id: currentUser.id, followed_id: personId });

      setFollowedIds([...followedIds, personId]);
    }
  }

  return (
    <section className="people-page">
      <div className="people-header">
        <div>
          <h1>People</h1>
          <p>Discover people with music taste worth following.</p>
        </div>
      </div>

      {loading && <p>Loading people...</p>}

      {!loading && people.length === 0 && (
        <p>No other members have joined yet — invite some friends!</p>
      )}

      <div className="people-grid">
        {people.map((person) => (
          <div className="person-card" key={person.id}>
            <div className="person-avatar">
              {person.username ? person.username.slice(0, 1).toUpperCase() : "?"}
            </div>

            <h2>{person.username || "Unnamed"}</h2>

            <span className="username">@{person.username}</span>

            <p className="person-bio">{person.bio || "No bio yet."}</p>

            <button
              className={followedIds.includes(person.id) ? "following" : "follow-button"}
              onClick={() => toggleFollow(person.id)}
            >
              {followedIds.includes(person.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default People;