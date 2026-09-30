import AnimeCard from "./AnimeCard";

function AnimeGrid({ anime = [] }) {
  if (!anime.length) {
    return null;
  }

  return (
    <div className="anime-grid">
      {anime.map((item) => (
        <AnimeCard
          key={item.id}
          anime={item}
        />
      ))}
    </div>
  );
}

export default AnimeGrid;