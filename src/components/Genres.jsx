function Genres() {

  const genres = [
    "Everything",
    "Indie",
    "Hip-Hop",
    "Pop",
    "Electronic",
    "R&B",
    "Rock"
  ];

  return (
    <section className="genres">

      <h2>What are you feeling?</h2>

      <p>
        Pick a lane and let the community
        do the digging.
      </p>

      <div className="genre-list">

        {genres.map((genre, index) => (

          <button
            key={genre}
            className={
              index === 0
                ? "genre active"
                : "genre"
            }
          >
            {genre}
          </button>

        ))}

      </div>

    </section>
  );
}

export default Genres;