import { useParams } from "react-router-dom";
import { useAnime } from "../hooks/useAnime";

function AnimeDetail() {
  const { id } = useParams();

  const {
    data: anime,
    isLoading,
    isError,
    error,
  } = useAnime(id);

  if (isLoading) {
    return <p>Loading anime...</p>;
  }

  if (isError) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!anime) {
    return <p>Anime not found.</p>;
  }

  return (
    <article>
      <h1>{anime.title}</h1>

      {anime.images?.jpg?.large_image_url && (
        <img
          src={anime.images.jpg.large_image_url}
          alt={`${anime.title} poster`}
          width="300"
        />
      )}

      <p>{anime.synopsis}</p>

      <p>
        <strong>Score:</strong> {anime.score ?? "N/A"}
      </p>

      <p>
        <strong>Episodes:</strong> {anime.episodes ?? "Unknown"}
      </p>

      <p>
        <strong>Status:</strong> {anime.status}
      </p>

      <p>
        <strong>Type:</strong> {anime.type}
      </p>
    </article>
  );
}

export default AnimeDetail;