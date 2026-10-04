import { useState } from "react";
import { Link } from "react-router-dom";

import { useMyList } from "../hooks/useMyList";

import "../styles/my-list.css";

const statuses = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "planned", label: "Planned" },
  { id: "paused", label: "Paused" },
  { id: "dropped", label: "Dropped" },
];

function MyList() {
  const [activeStatus, setActiveStatus] = useState("all");

  const { myList, removeAnime } = useMyList();

  const counts = {
    all: myList.length,

    watching: myList.filter((anime) => anime.listStatus === "watching").length,

    completed: myList.filter((anime) => anime.listStatus === "completed")
      .length,

    planned: myList.filter((anime) => anime.listStatus === "planned").length,

    paused: myList.filter((anime) => anime.listStatus === "paused").length,

    dropped: myList.filter((anime) => anime.listStatus === "dropped").length,
  };

  const filteredList =
    activeStatus === "all"
      ? myList
      : myList.filter((anime) => anime.listStatus === activeStatus);

  const continueWatching = myList.filter(
    (anime) => anime.listStatus === "watching",
  );

  const getProgress = (anime) => {
    if (typeof anime.episodes !== "number" || anime.episodes <= 0) {
      return 0;
    }

    return Math.min(((anime.currentEpisode || 0) / anime.episodes) * 100, 100);
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="my-list">
      {/* Header */}

      <header className="my-list-header">
        <div className="my-list-header-copy">
          <p className="my-list-eyebrow">YOUR LIBRARY</p>

          <h1>My List</h1>

          <p className="my-list-description">
            Everything you're watching, planning, and coming back to.
          </p>
        </div>

        <div className="my-list-total">
          <strong>{counts.all}</strong>
          <span>Anime saved</span>
        </div>
      </header>

      {/* Stats */}

      <section className="my-list-stats">
        {statuses
          .filter((status) => status.id !== "all")
          .map((status) => (
            <button
              key={status.id}
              className="my-list-stat"
              onClick={() => setActiveStatus(status.id)}
            >
              <strong>{counts[status.id]}</strong>

              <span>{status.label}</span>
            </button>
          ))}
      </section>

      {/* Filters */}

      <nav className="my-list-filters">
        {statuses.map((status) => (
          <button
            key={status.id}
            className={
              activeStatus === status.id
                ? "my-list-filter my-list-filter-active"
                : "my-list-filter"
            }
            onClick={() => setActiveStatus(status.id)}
          >
            <span>{status.label}</span>

            <span className="my-list-filter-count">{counts[status.id]}</span>
          </button>
        ))}
      </nav>

      {/* Continue Watching */}

      {activeStatus === "all" && continueWatching.length > 0 && (
        <section className="my-list-continue">
          <div className="my-list-section-header">
            <div>
              <p className="my-list-section-label">
                PICK UP WHERE YOU LEFT OFF
              </p>

              <h2>Continue Watching</h2>
            </div>

            <button
              className="my-list-section-link"
              onClick={() => setActiveStatus("watching")}
            >
              View all
              <span>→</span>
            </button>
          </div>

          <div className="my-list-continue-grid">
            {continueWatching.slice(0, 3).map((anime) => {
              const hasEpisodes =
                typeof anime.episodes === "number" && anime.episodes > 0;

              const progress = getProgress(anime);

              return (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.id}`}
                  className="my-list-continue-card"
                >
                  <div className="my-list-continue-poster">
                    {anime.image ? (
                      <img src={anime.image} alt={`${anime.title} poster`} />
                    ) : (
                      <div className="my-list-poster-placeholder">No image</div>
                    )}
                  </div>

                  <div className="my-list-continue-content">
                    <p className="my-list-continue-label">
                      {hasEpisodes
                        ? `Episode ${anime.currentEpisode || 0}`
                        : "Currently watching"}
                    </p>

                    <h3>{anime.title}</h3>

                    {hasEpisodes && (
                      <>
                        <div className="my-list-continue-progress">
                          <div
                            className="my-list-continue-progress-bar"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="my-list-continue-meta">
                          <span>Episode {anime.currentEpisode || 0}</span>

                          <span>{anime.episodes} episodes</span>
                        </div>
                      </>
                    )}

                    <span className="my-list-continue-arrow">Continue →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Library */}

      {filteredList.length > 0 && (
        <section className="my-list-library">
          <div className="my-list-section-header">
            <div>
              <p className="my-list-section-label">
                {activeStatus === "all"
                  ? "YOUR COLLECTION"
                  : "FILTERED COLLECTION"}
              </p>

              <h2>
                {activeStatus === "all"
                  ? "All Anime"
                  : getStatusLabel(activeStatus)}
              </h2>
            </div>

            <span className="my-list-result-count">
              {filteredList.length}{" "}
              {filteredList.length === 1 ? "title" : "titles"}
            </span>
          </div>

          <div className="my-list-grid">
            {filteredList.map((anime) => {
              const hasEpisodes =
                typeof anime.episodes === "number" && anime.episodes > 0;

              const progress = getProgress(anime);

              return (
                <article key={anime.id} className="my-list-card">
                  <Link
                    to={`/anime/${anime.id}`}
                    className="my-list-poster-wrapper"
                  >
                    {anime.image ? (
                      <img
                        src={anime.image}
                        alt={`${anime.title} poster`}
                        className="my-list-poster"
                      />
                    ) : (
                      <div className="my-list-poster-placeholder">No image</div>
                    )}

                    <span
                      className={`my-list-status my-list-status-${anime.listStatus}`}
                    >
                      {getStatusLabel(anime.listStatus)}
                    </span>
                  </Link>

                  <div className="my-list-card-content">
                    <div className="my-list-card-heading">
                      <h3>
                        <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
                      </h3>

                      <button
                        className="my-list-remove"
                        onClick={() => removeAnime(anime.id)}
                        aria-label={`Remove ${anime.title} from your list`}
                      >
                        ×
                      </button>
                    </div>

                    {hasEpisodes ? (
                      <div className="my-list-progress">
                        <div className="my-list-progress-header">
                          <span>Episode {anime.currentEpisode || 0}</span>

                          <span>{anime.episodes}</span>
                        </div>

                        <div className="my-list-progress-track">
                          <div
                            className="my-list-progress-bar"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="my-list-no-progress">
                        Episode information unavailable
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}

      {filteredList.length === 0 && (
        <section className="my-list-empty">
          <div className="my-list-empty-mark">+</div>

          <p className="my-list-section-label">NOTHING HERE YET</p>

          <h2>
            {activeStatus === "all"
              ? "Your list is empty"
              : `No ${getStatusLabel(activeStatus).toLowerCase()} anime`}
          </h2>

          <p>
            {activeStatus === "all"
              ? "Start building your personal library by discovering something new."
              : `Anime you mark as ${getStatusLabel(
                  activeStatus,
                ).toLowerCase()} will appear here.`}
          </p>

          {activeStatus === "all" && (
            <Link to="/discover" className="my-list-discover-button">
              Discover Anime
              <span>→</span>
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

export default MyList;