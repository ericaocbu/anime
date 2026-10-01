import { Link } from "react-router-dom";

import AnimeRow from "../components/anime/AnimeRow";
import AnimeProgress from "../components/anime/AnimeProgress";

import {
  useTrendingAnime,
  useTopAnime,
  useUpcomingAnime,
} from "../hooks/useAnime";

import { useSchedule } from "../hooks/useSchedule";
import { useMyList } from "../hooks/useMyList";

import "../styles/home.css";

function Home() {
  const {
    data: trendingAnime = [],
    isLoading: trendingLoading,
    isError: trendingError,
  } = useTrendingAnime();

  const {
    data: topAnime = [],
    isLoading: topLoading,
    isError: topError,
  } = useTopAnime();

  const {
    data: upcomingAnime = [],
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useUpcomingAnime();

  const {
    data: schedule = [],
    isLoading: scheduleLoading,
    isError: scheduleError,
  } = useSchedule();

  const { myList } = useMyList();

  /*
   * Shows currently being watched by the user.
   */
  const continueWatching = myList
    .filter(
      (item) => item.listStatus === "watching"
    )
    .slice(0, 10);

  /*
   * Avoid showing the same anime in both
   * Trending and Highly Rated.
   */
  const trendingIds = new Set(
    trendingAnime.map((anime) => anime.id)
  );

  const highlyRatedAnime = topAnime
    .filter(
      (anime) =>
        anime.score >= 8 &&
        !trendingIds.has(anime.id)
    )
    .slice(0, 10);

/*
 * getSchedule() already returns normalized anime
 * objects with their next airing episode attached.
 *
 * Only show one entry per anime.
 */
  const airingThisWeek = [];
  const seenAiringIds = new Set();

  for (const anime of schedule) {
    if (
      !anime ||
      seenAiringIds.has(anime.id)
    ) {
      continue;
    }

    seenAiringIds.add(anime.id);

    airingThisWeek.push(anime);
  }

  return (
    <div className="home">
      {/* -------------------------------- */}
      {/* Welcome                          */}
      {/* -------------------------------- */}

      <section className="home__welcome">
        <p className="home__eyebrow">
          YOUR ANIME
        </p>

        <h1 className="home__title">
          Welcome back.
        </h1>

        <p className="home__subtitle">
          Keep track of what you're watching,
          discover something new, and see what's
          airing next.
        </p>
      </section>

      {/* -------------------------------- */}
      {/* Continue + Airing                */}
      {/* -------------------------------- */}

      <div className="home__top">
        {/* Continue Watching */}

        <section>
          <div className="home__section-header">
            <h2>Continue Watching</h2>

            {continueWatching.length > 0 && (
              <Link to="/my-list">
                View My List
              </Link>
            )}
          </div>

          <div className="home-progress-grid">
            {continueWatching.map((anime) => (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="home-progress-card"
              >
                <div className="home-progress-card__image-wrapper">
                  {anime.image ? (
                    <img
                      src={anime.image}
                      alt={`${anime.title} poster`}
                      className="home-progress-card__image"
                    />
                  ) : (
                    <div className="home-progress-card__placeholder">
                      No image
                    </div>
                  )}
                </div>

                <div className="home-progress-card__content">
                  <h3>{anime.title}</h3>

                  <AnimeProgress
                    currentEpisode={anime.currentEpisode}
                    totalEpisodes={anime.episodes}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Airing This Week */}

        <section className="home__airing">
          <div className="home__section-header">
            <h2>Airing This Week</h2>

            <Link to="/calendar">
              Calendar
            </Link>
          </div>

          {scheduleLoading && (
            <p className="home__muted">
              Loading schedule...
            </p>
          )}

          {scheduleError && (
            <p className="home__muted">
              The airing schedule is temporarily
              unavailable.
            </p>
          )}

          {!scheduleLoading &&
            !scheduleError &&
            airingThisWeek.length === 0 && (
              <p className="home__muted">
                No upcoming episodes found.
              </p>
            )}

          {!scheduleLoading &&
            !scheduleError &&
            airingThisWeek.length > 0 && (
              <div className="home__airing-list">
                {airingThisWeek
                  .slice(0, 5)
                  .map((anime) => {
                    const airing =
                      anime.nextAiringEpisode;

                    return (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="home__airing-item"
                      >
                        <div>
                          <strong>
                            {anime.title}
                          </strong>

                          <span>
                            Episode{" "}
                            {airing.episode}
                          </span>
                        </div>

                        <time>
                          {airing.airingAt
                            ? new Date(
                                airing.airingAt *
                                  1000
                              ).toLocaleDateString()
                            : ""}
                        </time>
                      </Link>
                    );
                  })}
              </div>
            )}
        </section>
      </div>

      {/* -------------------------------- */}
      {/* Trending                         */}
      {/* -------------------------------- */}

      <section className="home__section">
        <div className="home__section-header">
          <h2>Trending</h2>

          <Link to="/discover">
            Discover More
          </Link>
        </div>

        {trendingLoading && (
          <p className="home__muted">
            Loading trending anime...
          </p>
        )}

        {trendingError && (
          <p className="home__muted">
            Trending anime is temporarily
            unavailable.
          </p>
        )}

        {!trendingLoading &&
          !trendingError &&
          trendingAnime.length > 0 && (
            <AnimeRow
              anime={trendingAnime}
            />
          )}
      </section>

      {/* -------------------------------- */}
      {/* Highly Rated                     */}
      {/* -------------------------------- */}

      <section className="home__section">
        <div className="home__section-header">
          <h2>Highly Rated</h2>

          <Link to="/discover">
            Browse All
          </Link>
        </div>

        {topLoading && (
          <p className="home__muted">
            Loading highly rated anime...
          </p>
        )}

        {topError && (
          <p className="home__muted">
            Highly rated anime is temporarily
            unavailable.
          </p>
        )}

        {!topLoading &&
          !topError &&
          highlyRatedAnime.length > 0 && (
            <AnimeRow
              anime={highlyRatedAnime}
            />
          )}
      </section>

      {/* -------------------------------- */}
      {/* Upcoming                         */}
      {/* -------------------------------- */}

      <section className="home__section">
        <div className="home__section-header">
          <h2>Upcoming</h2>

          <Link to="/discover">
            Explore More
          </Link>
        </div>

        {upcomingLoading && (
          <p className="home__muted">
            Loading upcoming anime...
          </p>
        )}

        {upcomingError && (
          <p className="home__muted">
            Upcoming anime is temporarily
            unavailable.
          </p>
        )}

        {!upcomingLoading &&
          !upcomingError &&
          upcomingAnime.length > 0 && (
            <AnimeRow
              anime={upcomingAnime}
            />
          )}
      </section>
    </div>
  );
}

export default Home;