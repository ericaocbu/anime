import { Link } from "react-router-dom";


function AnimeCard({ anime }) {
  if (!anime) {
    return null;
  }

  const image =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;

  return (
    <Link to={`/anime/${anime.mal_id}`} className="anime-card">
      <div className="anime-card__image-wrapper">
        {image ? (
          <img
            src={image}
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
        <h3 className="anime-card__title">{anime.title}</h3>

        <div className="anime-card__meta">
          {anime.score && <span>★ {anime.score}</span>}

          {anime.type && <span>{anime.type}</span>}
        </div>
      </div>
    </Link>
  );
}

export default AnimeCard;