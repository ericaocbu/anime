import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDiscoverAnime } from "../hooks/useDiscover";
import "../styles/discover.css";

const MOOD_INFO = {
  intense: {
    title: "Something intense",
    description: "High stakes, battles, and nonstop momentum.",
  },
  emotional: {
    title: "Something emotional",
    description: "Stories that stay with you after the episode ends.",
  },
  magical: {
    title: "Something magical",
    description: "Other worlds, strange powers, and the impossible.",
  },
  fun: {
    title: "Something fun",
    description: "Easygoing stories when you just want to have fun.",
  },
  darker: {
    title: "Something darker",
    description: "Unsettling stories with a darker edge.",
  },
  futuristic: {
    title: "Something futuristic",
    description: "Technology, machines, and worlds beyond today.",
  },
};

const CATEGORY_INFO = {
  "highly-rated": {
    eyebrow: "Collection",
    title: "Highly Rated",
    description: "Anime with some of the highest audience scores.",
  },
  popular: {
    eyebrow: "Collection",
    title: "Popular",
    description: "What anime fans are watching and talking about.",
  },
  upcoming: {
    eyebrow: "Collection",
    title: "New & Upcoming",
    description: "New releases and series worth keeping an eye on.",
  },
};

const GENRE_INFO = [
  {
    name: "Action",
    description: "Battles, rivalries, and high-stakes moments.",
    genres: "Action",
  },
  {
    name: "Adventure",
    description: "Journeys, discoveries, and new worlds.",
    genres: "Adventure",
  },
  {
    name: "Comedy",
    description: "Lighthearted stories and chaotic fun.",
    genres: "Comedy",
  },
  {
    name: "Drama",
    description: "Character-driven stories with emotional weight.",
    genres: "Drama",
  },
  {
    name: "Fantasy",
    description: "Magic, mythology, and impossible worlds.",
    genres: "Fantasy",
  },
  {
    name: "Horror",
    description: "Dark stories, fear, and unsettling worlds.",
    genres: "Horror",
  },
  {
    name: "Romance",
    description: "Relationships, connection, and complicated feelings.",
    genres: "Romance",
  },
  {
    name: "Sci-Fi",
    description: "Technology, space, and futures beyond today.",
    genres: "Sci-Fi",
  },
  {
    name: "Slice of Life",
    description: "Everyday moments and stories about growing up.",
    genres: "Slice of Life",
  },
  {
    name: "Supernatural",
    description: "Spirits, strange powers, and the unexplained.",
    genres: "Supernatural",
  },
];

function DiscoverRow({
  eyebrow = "Explore",
  title,
  anime,
  to,
  featured = false,
}) {
  if (!anime?.length) {
    return null;
  }

  return (
    <section
      className={`discover-row ${featured ? "discover-row-featured" : ""}`}
    >
      <div className="discover-row-header">
        <div>
          <p className="discover-row-label">{eyebrow}</p>

          <h2>{title}</h2>
        </div>

        {to && (
          <Link
            to={to}
            className="discover-row-arrow"
            aria-label={`View all ${title}`}
          >
            →
          </Link>
        )}
      </div>

      <div className="discover-row-track">
        {anime.map((item, index) => (
          <Link
            key={item.id}
            to={`/anime/${item.id}`}
            className={`discover-card ${
              featured && index === 0 ? "discover-card-featured" : ""
            }`}
          >
            <div className="discover-card-image-wrapper">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="discover-card-image"
                  loading="lazy"
                />
              ) : (
                <div className="discover-card-placeholder">No Image</div>
              )}

              <div className="discover-card-image-overlay" />

              {featured && index === 0 && (
                <span className="discover-card-featured-label">Featured</span>
              )}
            </div>

            <div className="discover-card-info">
              <h3>{item.title}</h3>

              <div className="discover-card-meta">
                {item.score != null && <span>★ {item.score.toFixed(1)}</span>}

                {item.seasonYear && <span>{item.seasonYear}</span>}

                {item.format && <span>{item.format}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GenreExplorer() {
  const navigate = useNavigate();

  function handleGenreChange(event) {
    const genre = event.target.value;

    if (!genre) {
      return;
    }

    navigate(`/discover?genres=${encodeURIComponent(genre)}`);
  }

  return (
    <div className="discover-header-genre">
      <label className="discover-genre-select" htmlFor="genre-select">
        <span className="discover-genre-select-label">Explore by genre</span>

        <select id="genre-select" defaultValue="" onChange={handleGenreChange}>
          <option value="" disabled>
            Choose a genre
          </option>

          {GENRE_INFO.map((genre) => (
            <option key={genre.name} value={genre.genres}>
              {genre.name}
            </option>
          ))}
        </select>

        <span className="discover-genre-select-arrow">↓</span>
      </label>
    </div>
  );
}

function Discover() {
  const [searchParams] = useSearchParams();

  const mood = searchParams.get("mood");
  const category = searchParams.get("category");

  const genres = searchParams.get("genres")
    ? searchParams.get("genres").split(",").filter(Boolean)
    : [];

  const { data, isLoading, isError, error } = useDiscoverAnime(genres);

  const moodInfo = mood ? MOOD_INFO[mood] : null;

  const categoryInfo = category ? CATEGORY_INFO[category] : null;

  if (isLoading) {
    return (
      <div className="discover">
        <header className="discover-header">
          <p className="discover-eyebrow">
            {moodInfo?.eyebrow || categoryInfo?.eyebrow || "Explore"}
          </p>

          <h1>{moodInfo?.title || categoryInfo?.title || "Discover"}</h1>

          <p className="discover-description">
            {moodInfo?.description ||
              categoryInfo?.description ||
              "Find your next anime."}
          </p>
        </header>

        <div className="discover-loading">
          <div className="discover-loading-featured" />
          <div className="discover-loading-row" />
          <div className="discover-loading-row" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="discover">
        <header className="discover-header">
          <p className="discover-eyebrow">Explore</p>

          <h1>Discover</h1>

          <p className="discover-description">Find your next anime.</p>
        </header>

        <div className="discover-error">
          <div className="discover-error-icon">!</div>

          <div>
            <h2>We couldn't load Discover.</h2>

            <p>
              {error?.message || "Something went wrong while loading anime."}
            </p>

            <button type="button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Mood destination
   */
  if (mood && genres.length > 0) {
    return (
      <div className="discover">
        <header className="discover-header discover-mood-header">
          <p className="discover-eyebrow">Your mood</p>

          <h1>{moodInfo?.title || "For your mood"}</h1>

          <p className="discover-description">
            {moodInfo?.description || "Anime selected for your mood."}
          </p>

          <div className="discover-genres">
            {genres.map((genre) => (
              <span key={genre} className="discover-genre">
                {genre}
              </span>
            ))}
          </div>
        </header>

        <div className="discover-mood-results">
          <DiscoverRow
            eyebrow="Curated for you"
            title="Recommended for you"
            anime={data.filtered}
          />
        </div>
      </div>
    );
  }

  /*
   * Category destination
   */
  if (categoryInfo) {
    const categoryAnime =
      category === "highly-rated"
        ? data.highlyRated
        : category === "popular"
          ? data.popular
          : data.upcoming;

    return (
      <div className="discover">
        <header className="discover-header discover-category-header">
          <Link to="/discover" className="discover-back-link">
            ← Back to Discover
          </Link>

          <p className="discover-eyebrow">{categoryInfo.eyebrow}</p>

          <h1>{categoryInfo.title}</h1>

          <p className="discover-description">{categoryInfo.description}</p>
        </header>

        <div className="discover-category-results">
          <div className="discover-results-grid">
            {categoryAnime.map((item) => (
              <Link
                key={item.id}
                to={`/anime/${item.id}`}
                className="discover-result-card"
              >
                <div className="discover-result-image-wrapper">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="discover-result-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="discover-card-placeholder">No Image</div>
                  )}
                </div>

                <div className="discover-result-info">
                  <h3>{item.title}</h3>

                  <div className="discover-card-meta">
                    {item.score != null && (
                      <span>★ {item.score.toFixed(1)}</span>
                    )}

                    {item.seasonYear && <span>{item.seasonYear}</span>}

                    {item.format && <span>{item.format}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * Genre destination
   */
  if (genres.length > 0) {
    return (
      <div className="discover">
        <header className="discover-header discover-category-header">
          <Link to="/discover" className="discover-back-link">
            ← Back to Discover
          </Link>

          <p className="discover-eyebrow">Genre</p>

          <h1>{genres.join(" & ")}</h1>

          <p className="discover-description">
            Explore anime that fits this genre.
          </p>

          <div className="discover-genres">
            {genres.map((genre) => (
              <span key={genre} className="discover-genre">
                {genre}
              </span>
            ))}
          </div>
        </header>

        <div className="discover-category-results">
          <div className="discover-results-grid">
            {data.filtered.map((item) => (
              <Link
                key={item.id}
                to={`/anime/${item.id}`}
                className="discover-result-card"
              >
                <div className="discover-result-image-wrapper">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="discover-result-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="discover-card-placeholder">No Image</div>
                  )}
                </div>

                <div className="discover-result-info">
                  <h3>{item.title}</h3>

                  <div className="discover-card-meta">
                    {item.score != null && (
                      <span>★ {item.score.toFixed(1)}</span>
                    )}

                    {item.seasonYear && <span>{item.seasonYear}</span>}

                    {item.format && <span>{item.format}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * Main Discover page
   */
  return (
    <div className="discover">
      <header className="discover-header discover-main-header">
        <div className="discover-main-header-content">
          <div className="discover-main-header-copy">
            <p className="discover-eyebrow">Explore</p>

            <h1>Discover something new.</h1>

            <p className="discover-description">
              Browse by what you're looking for, explore a genre, or just see
              what's getting attention right now.
            </p>
          </div>

          <GenreExplorer />
        </div>
      </header>

      <div className="discover-featured-area">
        <DiscoverRow
          eyebrow="Start here"
          title="Highly Rated"
          anime={data.highlyRated}
          to="/discover?category=highly-rated"
          featured
        />
      </div>

      <div className="discover-rows">
        <DiscoverRow
          eyebrow="What's popular"
          title="Popular"
          anime={data.popular}
          to="/discover?category=popular"
        />

        <DiscoverRow
          eyebrow="Coming next"
          title="New & Upcoming"
          anime={data.upcoming}
          to="/discover?category=upcoming"
        />
      </div>

      <div className="discover-rows discover-genre-rows">
        <DiscoverRow
          eyebrow="Genre"
          title="Action & Adventure"
          anime={data.action}
          to="/discover?genres=Action,Adventure"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Comedy"
          anime={data.comedy}
          to="/discover?genres=Comedy"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Drama"
          anime={data.drama}
          to="/discover?genres=Drama"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Fantasy"
          anime={data.fantasy}
          to="/discover?genres=Fantasy"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Horror"
          anime={data.horror}
          to="/discover?genres=Horror"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Romance"
          anime={data.romance}
          to="/discover?genres=Romance"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Sci-Fi"
          anime={data.sciFi}
          to="/discover?genres=Sci-Fi"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Slice of Life"
          anime={data.sliceOfLife}
          to="/discover?genres=Slice of Life"
        />

        <DiscoverRow
          eyebrow="Genre"
          title="Supernatural"
          anime={data.supernatural}
          to="/discover?genres=Supernatural"
        />
      </div>
    </div>
  );
}

export default Discover;