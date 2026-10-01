import { Link } from "react-router-dom";
import { useDiscoverAnime } from "../hooks/useDiscover";
import "../styles/discover.css";

function DiscoverRow({ title, anime }) {
  if (!anime?.length) {
    return null;
  }

  return (
    <section className="discover-row">
      <div className="discover-row__header">
        <h2>{title}</h2>

        <button
          className="discover-row__arrow"
          type="button"
          aria-label={`View more ${title}`}
        >
          →
        </button>
      </div>

      <div className="discover-row__track">
        {anime.map((item) => (
          <Link
            key={item.id}
            to={`/anime/${item.id}`}
            className="discover-card"
          >
            <div className="discover-card__image-wrapper">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="discover-card__image"
                  loading="lazy"
                />
              ) : (
                <div className="discover-card__placeholder">
                  No Image
                </div>
              )}
            </div>

            <div className="discover-card__info">
              <h3>{item.title}</h3>

              <div className="discover-card__meta">
                {item.score != null && (
                  <span>★ {item.score.toFixed(1)}</span>
                )}

                {item.seasonYear && (
                  <span>{item.seasonYear}</span>
                )}

                {item.format && (
                  <span>{item.format}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Discover() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useDiscoverAnime();

  if (isLoading) {
    return (
      <div className="discover">
        <header className="discover__header">
          <p className="discover__eyebrow">
            Explore
          </p>

          <h1>Discover</h1>

          <p>
            Find something new to watch.
          </p>
        </header>

        <div className="discover-loading">
          <div className="discover-loading__row" />
          <div className="discover-loading__row" />
          <div className="discover-loading__row" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="discover">
        <header className="discover__header">
          <p className="discover__eyebrow">
            Explore
          </p>

          <h1>Discover</h1>

          <p>
            Find something new to watch.
          </p>
        </header>

        <div className="discover-error">
          <h2>We couldn't load Discover.</h2>

          <p>
            {error?.message ||
              "Something went wrong while loading anime."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discover">
      <header className="discover__header">
        <p className="discover__eyebrow">
          Explore
        </p>

        <h1>Discover</h1>

        <p>
          Find your next anime.
        </p>
      </header>

      <div className="discover__rows">
        <DiscoverRow
          title="Highly Rated"
          anime={data.highlyRated}
        />

        <DiscoverRow
          title="Popular"
          anime={data.popular}
        />

        <DiscoverRow
          title="New & Upcoming"
          anime={data.upcoming}
        />

        <DiscoverRow
          title="Action & Adventure"
          anime={data.action}
        />

        <DiscoverRow
          title="Comedy"
          anime={data.comedy}
        />

        <DiscoverRow
          title="Drama"
          anime={data.drama}
        />

        <DiscoverRow
          title="Fantasy"
          anime={data.fantasy}
        />

        <DiscoverRow
          title="Horror"
          anime={data.horror}
        />

        <DiscoverRow
          title="Romance"
          anime={data.romance}
        />

        <DiscoverRow
          title="Sci-Fi"
          anime={data.sciFi}
        />

        <DiscoverRow
          title="Slice of Life"
          anime={data.sliceOfLife}
        />

        <DiscoverRow
          title="Supernatural"
          anime={data.supernatural}
        />
      </div>
    </div>
  );
}

export default Discover;