import { useState } from "react";

function People() {

  const [followedUsers, setFollowedUsers] = useState([]);

  const people = [
    {
      name: "Manas",
      username: "@manas",
      avatar: "M",
      bio: "Indie, late-night drives & discovering hidden gems.",
      favoriteGenre: "Indie"
    },
    {
      name: "Akshata",
      username: "@akshata",
      avatar: "A",
      bio: "Always looking for the next perfect track.",
      favoriteGenre: "Pop"
    },
    {
      name: "Pushkar",
      username: "@pushkar",
      avatar: "P",
      bio: "Hip-Hop enthusiast. Music on repeat.",
      favoriteGenre: "Hip-Hop"
    },
    {
      name: "Aakash",
      username: "@aakash",
      avatar: "A",
      bio: "Electronic sounds and midnight playlists.",
      favoriteGenre: "Electronic"
    }
  ];

  const toggleFollow = (username) => {

    if (followedUsers.includes(username)) {

      setFollowedUsers(
        followedUsers.filter(
          user => user !== username
        )
      );

    } else {

      setFollowedUsers([
        ...followedUsers,
        username
      ]);

    }

  };

  return (
    <section className="people-page">

      <div className="people-header">

        <div>
          <h1>People</h1>

          <p>
            Discover people with music taste worth following.
          </p>
        </div>

      </div>


      <div className="people-grid">

        {people.map((person) => (

          <div
            className="person-card"
            key={person.username}
          >

            <div className="person-avatar">
              {person.avatar}
            </div>


            <h2>{person.name}</h2>

            <span className="username">
              {person.username}
            </span>


            <p className="person-bio">
              {person.bio}
            </p>


            <span className="favorite-genre">
              🎵 {person.favoriteGenre}
            </span>


            <button
              className={
                followedUsers.includes(person.username)
                  ? "following"
                  : "follow-button"
              }

              onClick={() =>
                toggleFollow(person.username)
              }
            >

              {followedUsers.includes(person.username)
                ? "Following"
                : "Follow"}

            </button>

          </div>

        ))}

      </div>

    </section>
  );
}

export default People;