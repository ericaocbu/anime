import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AnimeProgress from "../components/anime/AnimeProgress";

import {
  useTrendingAnime,
  useUpcomingAnime,
} from "../hooks/useAnime";

import { useSchedule } from "../hooks/useSchedule";
import { useMyList } from "../hooks/useMyList";
import { useAuth } from "../context/AuthContext";

import "../styles/home.css";

function Home() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: trendingAnime = [],
    isLoading: trendingLoading,
    isError: trendingError,
  } = useTrendingAnime();

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

  const isLoggedIn = !authLoading && !!user;

  const continueWatching = isLoggedIn
    ? myList
        .filter((item) => item.listStatus === "watching")
        .slice(0, 6)
    : [];

  const airingThisWeek = [];
  const seenAiringIds = new Set();

  for (const anime of schedule) {
    if (!anime || seenAiringIds.has(anime.id)) {
      continue;
    }

    seenAiringIds.add(anime.id);
    airingThisWeek.push(anime);
  }

  const featuredAnime = useMemo(
    () => trendingAnime.slice(0, 5),
    [trendingAnime]
  );

  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    setFeaturedIndex(0);
  }, [featuredAnime.length]);

  useEffect(() => {
    if (featuredAnime.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setFeaturedIndex(
        (current) =>
          (current + 1) % featuredAnime.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredAnime.length]);

  const featured =
    featuredAnime[featuredIndex] || null;

  function showPreviousFeatured() {
    setFeaturedIndex((current) =>
      current === 0
        ? featuredAnime.length - 1
        : current - 1
    );
  }

  function showNextFeatured() {
    setFeaturedIndex(
      (current) =>
        (current + 1) % featuredAnime.length
    );
  }

  const moods = [
    {
      id: "intense",
      title: "Something intense",
      genres: ["Action", "Adventure", "Thriller"],
      description:
        "High stakes, battles, and nonstop momentum.",
      symbol: "01",
    },
    {
      id: "emotional",
      title: "Something emotional",
      genres: ["Romance", "Drama", "Slice of Life"],
      description:
        "Stories that stay with you after the episode ends.",
      symbol: "02",
    },
    {
      id: "magical",
      title: "Something magical",
      genres: ["Fantasy", "Supernatural"],
      description:
        "Other worlds, strange powers, and the impossible.",
      symbol: "03",
    },
    {
      id: "fun",
      title: "Something fun",
      genres: ["Comedy", "Romance", "Slice of Life"],
      description:
        "Easygoing stories when you just want to have fun.",
      symbol: "04",
    },
    {
      id: "darker",
      title: "Something darker",
      genres: ["Horror", "Psychological", "Mystery"],
      description:
        "Unsettling stories with a darker edge.",
      symbol: "05",
    },
    {
      id: "futuristic",
      title: "Something futuristic",
      genres: ["Sci-Fi", "Mecha"],
      description:
        "Technology, machines, and worlds beyond today.",
      symbol: "06",
    },
  ];

  return (
    <div className="home">
      <section className="home-welcome">
        <div className="home-welcome-line" />

        <div>
          <p className="home-welcome-eyebrow">
            {isLoggedIn
              ? "YOUR ANIME"
              : "ANIME DISCOVERY"}
          </p>

          <h1 className="home-welcome-title">
            {isLoggedIn
              ? "Welcome back."
              : "Discover your next anime."}
          </h1>

          <p className="home-welcome-subtitle">
            {isLoggedIn
              ? "Keep track of what you're watching, discover something new, and see what's airing next."
              : "Explore what's trending, see what's airing, and find your next favorite anime."}
          </p>
        </div>
      </section>

      <div className="home-top">
        {isLoggedIn ? (
          <section className="home-continue">
            <div className="home-section-header">
              <div>
                <p className="home-section-label">
                  PICK UP WHERE YOU LEFT OFF
                </p>
                <h2>Continue Watching</h2>
              </div>

              {continueWatching.length > 0 && (
                <Link to="/my-list">
                  View My List →
                </Link>
              )}
            </div>

            {continueWatching.length > 0 ? (
              <div className="home-progress-grid">
                {continueWatching.map((anime) => (
                  <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    className="home-progress-card"
                  >
                    <div className="home-progress-card-image-wrapper">
                      {anime.image ? (
                        <img
                          src={anime.image}
                          alt={`${anime.title} poster`}
                          className="home-progress-card-image"
                        />
                      ) : (
                        <div className="home-progress-card-placeholder">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="home-progress-card-content">
                      <p className="home-progress-card-label">
                        NOW WATCHING
                      </p>

                      <h3>{anime.title}</h3>

                      <AnimeProgress
                        currentEpisode={
                          anime.currentEpisode
                        }
                        totalEpisodes={anime.episodes}
                      />

                      <span className="home-progress-card-arrow">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="home-empty">
                <span className="home-empty-number">
                  00
                </span>

                <div>
                  <strong>
                    Nothing to continue yet.
                  </strong>
                  <p>
                    Start watching an anime to see
                    your progress here.
                  </p>
                </div>

                <Link
                  to="/discover"
                  className="home-empty-link"
                >
                  Explore Anime →
                </Link>
              </div>
            )}
          </section>
        ) : (
          <section className="home-featured">
            {trendingLoading ? (
              <div className="home-featured-loading">
                Loading featured anime...
              </div>
            ) : trendingError || !featured ? (
              <div className="home-featured-loading">
                Featured anime is temporarily
                unavailable.
              </div>
            ) : (
              <div className="home-featured-card">
                {featured.bannerImage && (
                  <img
                    src={featured.bannerImage}
                    alt=""
                    className="home-featured-background"
                  />
                )}

                <div className="home-featured-overlay" />

                <div className="home-featured-content">
                  <p className="home-featured-eyebrow">
                    FEATURED ANIME
                  </p>

                  <h2>{featured.title}</h2>

                  <div className="home-featured-meta">
                    {featured.format && (
                      <span>{featured.format}</span>
                    )}

                    {featured.seasonYear && (
                      <span>
                        {featured.seasonYear}
                      </span>
                    )}

                    {featured.score != null && (
                      <span>
                        ★ {featured.score.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {featured.description && (
                    <p className="home-featured-description">
                      {featured.description
                        .replace(/<[^>]*>/g, "")
                        .slice(0, 180)}
                      ...
                    </p>
                  )}

                  <Link
                    to={`/anime/${featured.id}`}
                    className="home-featured-button"
                  >
                    View Anime
                  </Link>
                </div>

                {featured.image && (
                  <img
                    src={featured.image}
                    alt={`${featured.title} poster`}
                    className="home-featured-poster"
                  />
                )}

                {featuredAnime.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="home-featured-arrow home-featured-arrow-previous"
                      onClick={
                        showPreviousFeatured
                      }
                      aria-label="Previous featured anime"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      className="home-featured-arrow home-featured-arrow-next"
                      onClick={showNextFeatured}
                      aria-label="Next featured anime"
                    >
                      ›
                    </button>

                    <div className="home-featured-dots">
                      {featuredAnime.map(
                        (anime, index) => (
                          <button
                            key={anime.id}
                            type="button"
                            className={`home-featured-dot ${
                              index === featuredIndex
                                ? "home-featured-dot-active"
                                : ""
                            }`}
                            onClick={() =>
                              setFeaturedIndex(index)
                            }
                            aria-label={`Show featured anime ${
                              index + 1
                            }`}
                          />
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        <section className="home-airing">
          <div className="home-airing-header">
            <div>
              <p className="home-section-label">
                THIS WEEK
              </p>
              <h2>Airing Now</h2>
            </div>

            <Link to="/calendar">Calendar →</Link>
          </div>

          {scheduleLoading && (
            <p className="home-muted">
              Loading schedule...
            </p>
          )}

          {scheduleError && (
            <p className="home-muted">
              The airing schedule is temporarily
              unavailable.
            </p>
          )}

          {!scheduleLoading &&
            !scheduleError &&
            airingThisWeek.length === 0 && (
              <p className="home-muted">
                No upcoming episodes found.
              </p>
            )}

          {!scheduleLoading &&
            !scheduleError &&
            airingThisWeek.length > 0 && (
              <div className="home-airing-list">
                {airingThisWeek
                  .slice(0, 5)
                  .map((anime) => {
                    const airing =
                      anime.nextAiringEpisode;

                    const airingDate =
                      airing?.airingAt
                        ? new Date(
                            airing.airingAt * 1000
                          )
                        : null;

                    return (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="home-airing-item"
                      >
                        <div className="home-airing-date">
                          <strong>
                            {airingDate
                              ? airingDate
                                  .toLocaleDateString(
                                    undefined,
                                    {
                                      weekday:
                                        "short",
                                    }
                                  )
                                  .toUpperCase()
                              : "--"}
                          </strong>

                          <span>
                            {airingDate
                              ? airingDate.getDate()
                              : "--"}
                          </span>
                        </div>

                        {anime.image && (
                          <img
                            src={anime.image}
                            alt={`${anime.title} poster`}
                            className="home-airing-poster"
                          />
                        )}

                        <div className="home-airing-info">
                          <strong>
                            {anime.title}
                          </strong>

                          <span>
                            Episode{" "}
                            {airing?.episode ?? "—"}
                          </span>
                        </div>

                        <span className="home-airing-arrow">
                          →
                        </span>
                      </Link>
                    );
                  })}
              </div>
            )}
        </section>
      </div>

      <section className="home-section home-trending">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">
              WHAT EVERYONE'S WATCHING
            </p>
            <h2>Trending</h2>
          </div>

          <Link to="/discover">
            Discover More →
          </Link>
        </div>

        {trendingLoading && (
          <p className="home-muted">
            Loading trending anime...
          </p>
        )}

        {trendingError && (
          <p className="home-muted">
            Trending anime is temporarily
            unavailable.
          </p>
        )}

        {!trendingLoading &&
          !trendingError &&
          trendingAnime.length > 0 && (
            <div className="home-trending-grid">
              {trendingAnime
                .slice(0, 6)
                .map((anime, index) => (
                  <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    className="home-trending-card"
                  >
                    <div className="home-trending-image-wrapper">
                      {anime.image ? (
                        <img
                          src={anime.image}
                          alt={`${anime.title} poster`}
                          className="home-trending-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="home-trending-placeholder">
                          No image
                        </div>
                      )}

                      <span className="home-trending-rank">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="home-trending-overlay">
                        View Anime ↗
                      </span>
                    </div>

                    <div className="home-trending-info">
                      <h3>{anime.title}</h3>

                      <div className="home-trending-meta">
                        {anime.score != null && (
                          <span>
                            ★{" "}
                            {anime.score.toFixed(1)}
                          </span>
                        )}

                        {anime.seasonYear && (
                          <span>
                            {anime.seasonYear}
                          </span>
                        )}

                        {anime.format && (
                          <span>
                            {anime.format}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
      </section>

      <section className="home-section home-moods-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">
              FIND YOUR NEXT WATCH
            </p>

            <h2>
              What are you in the mood for?
            </h2>

            <p className="home-section-description">
              Explore anime based on what you feel
              like watching.
            </p>
          </div>

          <Link to="/discover">
            Explore All →
          </Link>
        </div>

        <div className="home-moods">
          {moods.map((mood) => (
            <Link
              key={mood.id}
              to={`/discover?mood=${mood.id}&genres=${encodeURIComponent(
                mood.genres.join(",")
              )}`}
              className={`home-mood-card home-mood-card-${mood.id}`}
            >
              <span className="home-mood-number">
                {mood.symbol}
              </span>

              <div
                className="home-mood-art"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </div>

              <div className="home-mood-content">
                <h3>{mood.title}</h3>

                <p className="home-mood-description">
                  {mood.description}
                </p>

                <div className="home-mood-genres">
                  {mood.genres.map((genre) => (
                    <span key={genre}>
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <span
                className="home-mood-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-upcoming">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">
              ON THE HORIZON
            </p>
            <h2>Coming Soon</h2>
          </div>

          <Link to="/discover">
            Explore More →
          </Link>
        </div>

        {upcomingLoading && (
          <p className="home-muted">
            Loading upcoming anime...
          </p>
        )}

        {upcomingError && (
          <p className="home-muted">
            Upcoming anime is temporarily
            unavailable.
          </p>
        )}

        {!upcomingLoading &&
          !upcomingError &&
          upcomingAnime.length > 0 && (
            <div className="home-upcoming-grid">
              {upcomingAnime
                .slice(0, 4)
                .map((anime, index) => {
                  const startDate = anime.startDate;

                  const releaseDate =
                    startDate?.year
                      ? [
                          startDate.month,
                          startDate.day,
                          startDate.year,
                        ]
                          .filter(Boolean)
                          .join(".")
                      : "TBA";

                  return (
                    <Link
                      key={anime.id}
                      to={`/anime/${anime.id}`}
                      className="home-upcoming-card"
                    >
                      <div className="home-upcoming-image-wrapper">
                        {anime.image ? (
                          <img
                            src={anime.image}
                            alt={`${anime.title} poster`}
                            className="home-upcoming-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="home-upcoming-placeholder">
                            No image
                          </div>
                        )}

                        <div className="home-upcoming-overlay">
                          <span>
                            {index === 0
                              ? "NEXT UP"
                              : "COMING SOON"}
                          </span>

                          <strong>
                            {releaseDate}
                          </strong>
                        </div>
                      </div>

                      <div className="home-upcoming-info">
                        <h3>{anime.title}</h3>

                        <span>
                          {anime.format ||
                            "ANIME"}
                        </span>

                        <span className="home-upcoming-arrow">
                          ↗
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
      </section>
    </div>
  );
}

export default Home;