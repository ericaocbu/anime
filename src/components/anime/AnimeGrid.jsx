import AnimeCard from "./AnimeCard";

function AnimeGrid({ anime = [] }) {
  return (
    <div className="anime-grid">
      {anime.map((item) => (
        <AnimeCard key={item.mal_id} anime={item} />
      ))}
    </div>
  );
}

export default AnimeGrid;