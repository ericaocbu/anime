import AnimeCard from "./AnimeCard";

function AnimeRow({ anime = [] }) {
  if (!anime.length) {
    return null;
  }

  return (
    <div className="anime-row">
      <div className="anime-row__content">
        {anime.map((item) => (
          <AnimeCard
            key={item.id}
            anime={item}
          />
        ))}
      </div>
    </div>
  );
}

export default AnimeRow;