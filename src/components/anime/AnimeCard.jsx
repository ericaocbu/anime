import { Link } from "react-router-dom";

function AnimeCard({ anime }) {
  if (!anime) return null;

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="anime-card"
    >
      <div className="anime-card__image-wrapper">
        {anime.image ? (
          <img
            src={anime.image}
            alt={`${anime.title} poster`}
            className="anime-card__image"
          />
        ) : (
          <div className="anime-card__image-placeholder">
            No image
          </div>
        )}
      </div>

      <div className="anime-card__content">
        <h3 className="anime-card__title">
          {anime.title}
        </h3>

        <div className="anime-card__meta">
          {anime.score != null && (
            <span>
              ★ {anime.score.toFixed(1)}
            </span>
          )}

          {anime.type && (
            <span>{anime.type}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default AnimeCard;