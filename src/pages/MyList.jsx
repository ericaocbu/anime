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
    watching: myList.filter(
      (anime) => anime.listStatus === "watching"
    ).length,

    completed: myList.filter(
      (anime) => anime.listStatus === "completed"
    ).length,

    planned: myList.filter(
      (anime) => anime.listStatus === "planned"
    ).length,

    paused: myList.filter(
      (anime) => anime.listStatus === "paused"
    ).length,

    dropped: myList.filter(
      (anime) => anime.listStatus === "dropped"
    ).length,
  };

  const filteredList =
    activeStatus === "all"
      ? myList
      : myList.filter(
          (anime) =>
            anime.listStatus === activeStatus
        );

  return (
    <div className="my-list">
      <header className="my-list__header">
        <p className="my-list__eyebrow">
          YOUR LIBRARY
        </p>

        <h1>My List</h1>

        <p>
          Keep track of what you're watching,
          what you've finished, and what you want
          to watch next.
        </p>
      </header>

      {/* Stats */}

      <section className="my-list__stats">
        <div>
          <strong>{counts.watching}</strong>
          <span>Watching</span>
        </div>

        <div>
          <strong>{counts.completed}</strong>
          <span>Completed</span>
        </div>

        <div>
          <strong>{counts.planned}</strong>
          <span>Planned</span>
        </div>

        <div>
          <strong>{counts.paused}</strong>
          <span>Paused</span>
        </div>

        <div>
          <strong>{counts.dropped}</strong>
          <span>Dropped</span>
        </div>
      </section>

      {/* Filters */}

      <div className="my-list__filters">
        {statuses.map((status) => (
          <button
            key={status.id}
            className={
              activeStatus === status.id
                ? "my-list__filter my-list__filter--active"
                : "my-list__filter"
            }
            onClick={() =>
              setActiveStatus(status.id)
            }
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Empty state */}

      {filteredList.length === 0 && (
        <div className="my-list__empty">
          <h2>
            {activeStatus === "all"
              ? "Your list is empty"
              : `No ${activeStatus} anime`}
          </h2>

          <p>
            {activeStatus === "all"
              ? "Add anime to your list and they'll appear here."
              : "Anime with this status will appear here."}
          </p>

          {activeStatus === "all" && (
            <Link
              to="/discover"
              className="my-list__discover-button"
            >
              Discover Anime
            </Link>
          )}
        </div>
      )}

      {/* Anime */}

      {filteredList.length > 0 && (
        <div className="my-list__grid">
          {filteredList.map((anime) => {
            const image =
              anime.images?.jpg?.large_image_url ||
              anime.images?.jpg?.image_url;

            const hasEpisodes =
              typeof anime.episodes === "number" &&
              anime.episodes > 0;

            return (
              <article
                key={anime.id}
                className="my-list__card"
              >
                <Link
                  to={`/anime/${anime.id}`}
                  className="my-list__poster-wrapper"
                >
                  {anime.image ? (
                    <img
                      src={anime.image}
                      alt={`${anime.title} poster`}
                      className="my-list__poster"
                    />
                  ) : (
                    <div className="my-list__poster-placeholder">
                      No image
                    </div>
                  )}
                </Link>

                <div className="my-list__card-content">
                  <div>
                    <h2>
                      <Link
                        to={`/anime/${anime.id}`}
                      >
                        {anime.title}
                      </Link>
                    </h2>

                    <span className="my-list__status">
                      {anime.listStatus}
                    </span>
                  </div>

                  <div className="my-list__progress">
                    <div className="my-list__progress-header">
                      <span>
                        Episode{" "}
                        {anime.currentEpisode || 0}
                      </span>

                      {hasEpisodes && (
                        <span>
                          / {anime.episodes}
                        </span>
                      )}
                    </div>

                    {hasEpisodes && (
                      <div className="my-list__progress-track">
                        <div
                          className="my-list__progress-bar"
                          style={{
                            width: `${
                              Math.min(
                                ((anime.currentEpisode ||
                                  0) /
                                  anime.episodes) *
                                  100,
                                100
                              )
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="my-list__remove"
                    onClick={() =>
                      removeAnime(anime.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyList;