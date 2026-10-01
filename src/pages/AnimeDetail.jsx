import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AnimeCard from "../components/anime/AnimeCard";

import {
  useAnime,
  useAnimeEpisodes,
  useAnimeReviews,
  useAnimeRecommendations,
} from "../hooks/useAnime";

import { useMyList } from "../hooks/useMyList";

import "../styles/anime-detail.css";

const EPISODES_PER_PAGE = 50;

function formatDate(date) {
  if (!date?.year) {
    return null;
  }

  const parts = [date.year];

  if (date.month) {
    parts.push(String(date.month).padStart(2, "0"));
  }

  if (date.day) {
    parts.push(String(date.day).padStart(2, "0"));
  }

  return parts.join("-");
}

function formatAired(startDate, endDate) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (!start && !end) {
    return "—";
  }

  if (start && !end) {
    return start;
  }

  if (!start && end) {
    return end;
  }

  return `${start} → ${end}`;
}

function formatEpisodeDate(timestamp) {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatLabel(value) {
  if (!value) {
    return "—";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatSeason(season, year) {
  if (!season) {
    return "—";
  }

  return year
    ? `${formatLabel(season)} ${year}`
    : formatLabel(season);
}

function getRelationTitle(node) {
  return (
    node?.title?.english ||
    node?.title?.romaji ||
    node?.title?.native ||
    "Unknown Title"
  );
}

function AnimeDetail() {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState("overview");

  const [progressInput, setProgressInput] =
    useState("0");

  const [episodePage, setEpisodePage] =
    useState(1);

  const [jumpRequested, setJumpRequested] =
    useState(false);

  const {
    data: anime,
    isLoading: animeLoading,
    isError: animeError,
  } = useAnime(id);

  const {
    data: episodePages,
    isLoading: episodesLoading,
    isError: episodesError,
  } = useAnimeEpisodes(
    id,
    activeTab === "episodes"
  );

  const {
    data: reviewPages,
    isLoading: reviewsLoading,
    isError: reviewsError,
    hasNextPage: hasMoreReviews,
    isFetchingNextPage: loadingMoreReviews,
    fetchNextPage: loadMoreReviews,
  } = useAnimeReviews(
    id,
    activeTab === "reviews"
  );

  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useAnimeRecommendations(
    id,
    activeTab === "overview" ||
      activeTab === "recommendations"
  );

  const {
    addAnime,
    updateAnime,
    removeAnime,
    getAnimeFromList,
    isAnimeInList,
  } = useMyList();

  const inMyList = anime
    ? isAnimeInList(anime.id)
    : false;

  const savedAnime = anime
    ? getAnimeFromList(anime.id)
    : null;

  useEffect(() => {
    setProgressInput(
      String(savedAnime?.currentEpisode ?? 0)
    );
  }, [
    anime?.id,
    savedAnime?.currentEpisode,
  ]);

  useEffect(() => {
    setEpisodePage(1);
  }, [anime?.id]);

  useEffect(() => {
  if (
    !jumpRequested ||
    activeTab !== "episodes"
  ) {
    return;
  }

  const episodeNumber =
    Number(savedAnime?.currentEpisode ?? 0);

  if (!episodeNumber) {
    setJumpRequested(false);
    return;
  }

  const element = document.getElementById(
    `episode-${episodeNumber}`
  );

  if (!element) {
    return;
  }

  requestAnimationFrame(() => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setJumpRequested(false);
  });
}, [
  jumpRequested,
  activeTab,
  episodePage,
  episodePages,
  savedAnime?.currentEpisode,
]);

  if (animeLoading) {
    return (
      <div className="anime-detail__state">
        Loading anime...
      </div>
    );
  }

  if (animeError || !anime) {
    return (
      <div className="anime-detail__state">
        <h1>Unable to load anime</h1>

        <p>
          This anime could not be loaded right now.
          Please try again later.
        </p>
      </div>
    );
  }

  const image = anime.image;

  const genres = anime.genres ?? [];

  const tags = (anime.tags ?? [])
    .filter(
      (tag) =>
        !tag.isMediaSpoiler &&
        !tag.isGeneralSpoiler
    )
    .slice(0, 12);

  /*
   * ==================================================
   * EPISODES
   * ==================================================
   */

  const scheduledEpisodes =
    episodePages?.pages?.flatMap(
      (page) => page.episodes ?? []
    ) ?? [];

  const episodeSchedule = new Map(
    scheduledEpisodes.map((episode) => [
      episode.episode,
      episode,
    ])
  );

  const totalEpisodes = anime.episodes ?? 0;

  const episodes = Array.from(
    { length: totalEpisodes },
    (_, index) => {
      const episodeNumber = index + 1;

      const scheduled =
        episodeSchedule.get(episodeNumber);

      return {
        episode: episodeNumber,
        airingAt: scheduled?.airingAt ?? null,
      };
    }
  );

  const totalEpisodePages = Math.ceil(
    episodes.length / EPISODES_PER_PAGE
  );

  const safeEpisodePage = Math.min(
    episodePage,
    Math.max(totalEpisodePages, 1)
  );

  const episodeStart =
    (safeEpisodePage - 1) *
    EPISODES_PER_PAGE;

  const visibleEpisodes = episodes.slice(
    episodeStart,
    episodeStart + EPISODES_PER_PAGE
  );

  const currentEpisode = Number(
    savedAnime?.currentEpisode ?? 0
  );

  /*
   * ==================================================
   * REVIEWS
   * ==================================================
   */

  const displayedReviews =
    reviewPages?.pages?.flatMap(
      (page) => page.reviews ?? []
    ) ?? [];

  /*
   * ==================================================
   * RECOMMENDATIONS
   * ==================================================
   */

  const displayedRecommendations =
    (recommendations ?? [])
      .map(
        (recommendation) =>
          recommendation?.mediaRecommendation
      )
      .filter(Boolean)
      .slice(0, 6);

  /*
   * ==================================================
   * ADDITIONAL ANIME DATA
   * ==================================================
   */

  const characters =
    anime.characters ?? [];

  const studios =
    anime.studios ?? [];

  const mainStudios =
    studios.filter(
      (studio) => studio.isMain
    );

  const relations =
    anime.relations ?? [];

  const visibleRelations =
    relations
      .filter(
        (relation) =>
          relation?.node?.type === "ANIME"
      )
      .slice(0, 8);

  /*
   * ==================================================
   * PROGRESS
   * ==================================================
   */

  function saveProgress(value) {
    const parsed = Number(value);

    const safeValue = Number.isFinite(parsed)
      ? Math.max(0, Math.floor(parsed))
      : 0;

    const finalValue =
      anime.episodes != null
        ? Math.min(
            safeValue,
            anime.episodes
          )
        : safeValue;

    setProgressInput(
      String(finalValue)
    );

    if (inMyList) {
      updateAnime(anime.id, {
        currentEpisode: finalValue,
      });
    }
  }

  function handleProgressChange(event) {
    setProgressInput(
      event.target.value
    );
  }

  function handleProgressBlur() {
    saveProgress(progressInput);
  }

  function handleProgressKeyDown(event) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  function handleNextEpisode() {
    if (!inMyList) {
      return;
    }

    const current =
      Number(savedAnime?.currentEpisode ?? 0);

    const next =
      anime.episodes != null
        ? Math.min(
            current + 1,
            anime.episodes
          )
        : current + 1;

    saveProgress(next);

    if (anime.episodes) {
      const nextPage =
        Math.floor(
          Math.max(next - 1, 0) /
            EPISODES_PER_PAGE
        ) + 1;

      setEpisodePage(nextPage);
    }
  }

  function goToProgress() {
    if (!currentEpisode) {
      return;
    }

    const page =
      Math.floor(
        Math.max(currentEpisode - 1, 0) /
          EPISODES_PER_PAGE
      ) + 1;

    setActiveTab("episodes");
    setEpisodePage(page);
    setJumpRequested(true);
  }

  /*
   * ==================================================
   * TABS
   * ==================================================
   */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "episodes",
      label: "Episodes",
    },
    {
      id: "reviews",
      label: "Reviews",
    },
    {
      id: "recommendations",
      label: "Recommendations",
    },
  ];

  return (
    <div className="anime-detail">

      {/* HERO */}

      <section className="anime-detail__hero">
        <div className="anime-detail__poster-wrapper">
          {image ? (
            <img
              src={image}
              alt={`${anime.title} poster`}
              className="anime-detail__poster"
            />
          ) : (
            <div className="anime-detail__poster-placeholder">
              No image
            </div>
          )}
        </div>

        <div className="anime-detail__hero-content">
          <div className="anime-detail__eyebrow">
            {formatLabel(anime.format) ||
              "Anime"}
          </div>

          <h1 className="anime-detail__title">
            {anime.title}
          </h1>

          {anime.nativeTitle && (
            <p className="anime-detail__japanese-title">
              {anime.nativeTitle}
            </p>
          )}

          <div className="anime-detail__quick-info">
            {anime.score != null && (
              <span>
                ★ {anime.score.toFixed(1)}
              </span>
            )}

            {anime.format && (
              <span>
                {formatLabel(anime.format)}
              </span>
            )}

            {anime.episodes && (
              <span>
                {anime.episodes} episodes
              </span>
            )}

            {anime.duration && (
              <span>
                {anime.duration} min/ep
              </span>
            )}

            {anime.status && (
              <span>
                {formatLabel(anime.status)}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="anime-detail__genres">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="anime-detail__genre"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <p className="anime-detail__synopsis">
            {anime.description ||
              "No synopsis is available for this anime."}
          </p>

          {anime.nextAiringEpisode && (
            <div className="anime-detail__next-airing">
              <strong>
                Next Episode
              </strong>

              <span>
                Episode{" "}
                {anime.nextAiringEpisode.episode}
              </span>

              {anime.nextAiringEpisode
                .airingAt && (
                <time>
                  {formatEpisodeDate(
                    anime.nextAiringEpisode.airingAt
                  )}
                </time>
              )}
            </div>
          )}

          <div className="anime-detail__hero-actions">
            <button
              type="button"
              className={`anime-detail__list-button ${
                inMyList
                  ? "anime-detail__list-button--added"
                  : ""
              }`}
              onClick={() => {
                if (inMyList) {
                  removeAnime(anime.id);
                } else {
                  addAnime(anime);
                }
              }}
            >
              {inMyList
                ? "✓ In My List"
                : "+ Add to My List"}
            </button>
          </div>
        </div>
      </section>

      {/* INFORMATION */}

      <section className="anime-detail__info-grid">

        <div className="anime-detail__info-card">
          <h2>Details</h2>

          <div className="anime-detail__details">
            <div>
              <span>Format</span>
              <strong>
                {formatLabel(anime.format)}
              </strong>
            </div>

            <div>
              <span>Episodes</span>
              <strong>
                {anime.episodes || "Unknown"}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {formatLabel(anime.status)}
              </strong>
            </div>

            <div>
              <span>Aired</span>
              <strong>
                {formatAired(
                  anime.startDate,
                  anime.endDate
                )}
              </strong>
            </div>

            <div>
              <span>Season</span>
              <strong>
                {formatSeason(
                  anime.season,
                  anime.seasonYear
                )}
              </strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>
                {anime.duration
                  ? `${anime.duration} min/ep`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Source</span>
              <strong>
                {formatLabel(anime.source)}
              </strong>
            </div>

            <div>
              <span>Country</span>
              <strong>
                {anime.countryOfOrigin || "—"}
              </strong>
            </div>
          </div>
        </div>

        <div className="anime-detail__info-card">
          <h2>Your List</h2>

          {!inMyList ? (
            <>
              <p className="anime-detail__list-status">
                This anime isn't on your list yet.
              </p>

              <button
                type="button"
                className="anime-detail__secondary-button"
                onClick={() =>
                  addAnime(anime)
                }
              >
                + Add to My List
              </button>
            </>
          ) : (
            <div className="anime-detail__tracking">

              <div className="anime-detail__tracking-field">
                <label htmlFor="anime-status">
                  Status
                </label>

                <select
                  id="anime-status"
                  value={
                    savedAnime?.listStatus ||
                    "planned"
                  }
                  onChange={(event) =>
                    updateAnime(anime.id, {
                      listStatus:
                        event.target.value,
                    })
                  }
                >
                  <option value="watching">
                    Watching
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="planned">
                    Planned
                  </option>

                  <option value="paused">
                    Paused
                  </option>

                  <option value="dropped">
                    Dropped
                  </option>
                </select>
              </div>

              <div className="anime-detail__tracking-field">
                <label>Rating</label>

                <div className="anime-detail__rating">
                  {[1, 2, 3, 4, 5].map(
                    (rating) => (
                      <button
                        type="button"
                        key={rating}
                        className={
                          rating <=
                          (
                            savedAnime?.userRating ??
                            0
                          )
                            ? "anime-detail__star anime-detail__star--active"
                            : "anime-detail__star"
                        }
                        onClick={() =>
                          updateAnime(
                            anime.id,
                            {
                              userRating:
                                rating,
                            }
                          )
                        }
                        aria-label={`Rate ${rating} out of 5`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                className="anime-detail__remove-button"
                onClick={() =>
                  removeAnime(anime.id)
                }
              >
                Remove from My List
              </button>
            </div>
          )}
        </div>
      </section>

      {/* WATCH PROGRESS */}
        <section className="anime-detail__progress-section">
          <div className="anime-detail__progress-card">

            <div className="anime-detail__progress-info">
              <div>
                <span className="anime-detail__progress-label">
                  Watch progress
                </span>

                <strong>
                  {inMyList
                    ? `${currentEpisode} / ${
                        totalEpisodes || "?"
                      } episodes`
                    : "Not started"}
                </strong>
              </div>

              {inMyList && (
                <span className="anime-detail__progress-status">
                  {totalEpisodes > 0 &&
                  currentEpisode >= totalEpisodes
                    ? "Completed"
                    : currentEpisode > 0
                    ? `Up next: Episode ${
                        currentEpisode + 1
                      }`
                    : "Start watching"}
                </span>
              )}
            </div>

            {!inMyList ? (
              <button
                type="button"
                className="anime-detail__progress-save"
                onClick={() => addAnime(anime)}
              >
                Add to My List
              </button>
            ) : (
              <div className="anime-detail__progress-controls">

                <button
                  type="button"
                  className="anime-detail__progress-step"
                  onClick={() =>
                    saveProgress(
                      Math.max(
                        currentEpisode - 1,
                        0
                      )
                    )
                  }
                  disabled={currentEpisode <= 0}
                  aria-label="Decrease progress"
                >
                  −
                </button>

                <input
                  type="number"
                  min="0"
                  max={totalEpisodes || undefined}
                  value={progressInput}
                  onChange={handleProgressChange}
                  onBlur={handleProgressBlur}
                  onKeyDown={handleProgressKeyDown}
                  aria-label="Current episode"
                />

                <button
                  type="button"
                  className="anime-detail__progress-step"
                  onClick={handleNextEpisode}
                  disabled={
                    totalEpisodes > 0 &&
                    currentEpisode >= totalEpisodes
                  }
                  aria-label="Increase progress"
                >
                  +
                </button>

                <button
                  type="button"
                  className="anime-detail__progress-save"
                  onClick={() =>
                    saveProgress(progressInput)
                  }
                >
                  Save
                </button>

                {currentEpisode > 0 && (
                  <button
                    type="button"
                    className="anime-detail__episode-jump"
                    onClick={goToProgress}
                  >
                    Jump to current
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

      {/* METADATA */}

      {(tags.length > 0 ||
        mainStudios.length > 0 ||
        anime.hashtag) && (
        <section className="anime-detail__metadata">

          {tags.length > 0 && (
            <div className="anime-detail__metadata-section">
              <h2>Themes & Tags</h2>

              <div className="anime-detail__tag-list">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="anime-detail__tag"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mainStudios.length > 0 && (
            <div className="anime-detail__metadata-section">
              <h2>Studio</h2>

              <div className="anime-detail__studio-list">
                {mainStudios.map(
                  (studio) => (
                    <span
                      key={studio.node.id}
                    >
                      {studio.node.name}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {anime.hashtag && (
            <div className="anime-detail__metadata-section">
              <h2>Official Hashtag</h2>
              <span>{anime.hashtag}</span>
            </div>
          )}
        </section>
      )}

      {/* TABS */}

      <section className="anime-detail__content">

        <div className="anime-detail__tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`anime-detail__tab ${
                activeTab === tab.id
                  ? "anime-detail__tab--active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}

        {activeTab === "overview" && (
          <div className="anime-detail__tab-content">

            <section>
              <div className="anime-detail__section-header">
                <h2>Synopsis</h2>
              </div>

              <p className="anime-detail__overview-text">
                {anime.description ||
                  "No synopsis is available for this anime."}
              </p>
            </section>

            {characters.length > 0 && (
              <section className="anime-detail__overview-section">
                <div className="anime-detail__section-header">
                  <div>
                    <h2>Characters</h2>
                    <p>
                      Key characters from the series.
                    </p>
                  </div>
                </div>

                <div className="anime-detail__character-grid">
                  {characters.map(
                    (character) => {
                      const characterData =
                        character.node;

                      const voiceActor =
                        character
                          .voiceActors?.[0];

                      if (!characterData) {
                        return null;
                      }

                      return (
                        <div
                          key={characterData.id}
                          className="anime-detail__character-card"
                        >
                          {characterData.image
                            ?.medium && (
                            <img
                              src={
                                characterData
                                  .image.medium
                              }
                              alt={
                                characterData
                                  .name?.full ||
                                "Character"
                              }
                            />
                          )}

                          <div>
                            <strong>
                              {
                                characterData
                                  .name?.full
                              }
                            </strong>

                            <span>
                              {formatLabel(
                                character.role
                              )}
                            </span>

                            {voiceActor && (
                              <small>
                                Voiced by{" "}
                                {
                                  voiceActor
                                    .name?.full
                                }
                              </small>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {visibleRelations.length > 0 && (
              <section className="anime-detail__overview-section">
                <div className="anime-detail__section-header">
                  <div>
                    <h2>Related Anime</h2>
                    <p>
                      Other entries in this
                      series or universe.
                    </p>
                  </div>
                </div>

                <div className="anime-detail__related-list">
                  {visibleRelations.map(
                    (relation) => {
                      const relatedAnime =
                        relation.node;

                      if (!relatedAnime) {
                        return null;
                      }

                      return (
                        <AnimeCard
                          key={`${relation.relationType}-${relatedAnime.id}`}
                          anime={{
                            id: relatedAnime.id,
                            title:
                              getRelationTitle(
                                relatedAnime
                              ),
                            image:
                              relatedAnime
                                .coverImage
                                ?.large ||
                              relatedAnime
                                .coverImage
                                ?.medium ||
                              null,
                            type:
                              relatedAnime.type,
                            score:
                              relatedAnime
                                .averageScore !=
                              null
                                ? relatedAnime
                                    .averageScore /
                                  10
                                : null,
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </section>
            )}

            <section className="anime-detail__overview-section">
              <div className="anime-detail__section-header">
                <div>
                  <h2>More Like This</h2>
                  <p>
                    Recommendations based on
                    this anime.
                  </p>
                </div>
              </div>

              {recommendationsLoading && (
                <p className="anime-detail__muted">
                  Loading recommendations...
                </p>
              )}

              {recommendationsError && (
                <p className="anime-detail__muted">
                  Recommendations are temporarily
                  unavailable.
                </p>
              )}

              {!recommendationsLoading &&
                !recommendationsError &&
                displayedRecommendations.length >
                  0 && (
                  <div className="anime-detail__recommendations">
                    {displayedRecommendations.map(
                      (item) => (
                        <AnimeCard
                          key={item.id}
                          anime={item}
                        />
                      )
                    )}
                  </div>
                )}

              {!recommendationsLoading &&
                !recommendationsError &&
                displayedRecommendations.length ===
                  0 && (
                  <p className="anime-detail__muted">
                    No recommendations are
                    available yet.
                  </p>
                )}
            </section>
          </div>
        )}

        {/* EPISODES */}

        {activeTab === "episodes" && (
          <section className="anime-detail__section">

            <div className="anime-detail__section-heading">
              <div>
                <span className="anime-detail__eyebrow">
                  Watch progress
                </span>

                <h2>Episodes</h2>
              </div>

              {totalEpisodes > 0 && (
                <span className="anime-detail__section-count">
                  {totalEpisodes} episodes
                </span>
              )}
            </div>

            {episodesLoading ? (
              <div className="anime-detail__empty">
                Loading episodes...
              </div>
            ) : episodesError ? (
              <div className="anime-detail__empty">
                We couldn't load the episode
                schedule.
              </div>
            ) : totalEpisodes === 0 ? (
              <div className="anime-detail__empty">
                Episode information isn't
                available for this anime.
              </div>
            ) : (
              <>

                {/* EPISODE LIST */}

                <div className="anime-detail__episode-list">

                  <div className="anime-detail__episode-list-header">
                    <div>
                      <span className="anime-detail__eyebrow">
                        Episode tracker
                      </span>

                      <h3>
                        Episodes{" "}
                        {episodeStart + 1}–
                        {Math.min(
                          episodeStart +
                            EPISODES_PER_PAGE,
                          totalEpisodes
                        )}
                      </h3>
                    </div>

                    <span>
                      {currentEpisode} watched
                    </span>
                  </div>

                  <div className="anime-detail__episode-table">

                    {visibleEpisodes.map(
                      (episode) => {
                        const isWatched =
                          episode.episode <=
                          currentEpisode;

                        const isCurrent =
                          !isWatched &&
                          episode.episode ===
                            currentEpisode + 1;

                        const date =
                          formatEpisodeDate(
                            episode.airingAt
                          );

                        return (
                          <div
                            key={episode.episode}
                            id={`episode-${episode.episode}`}
                            className={`anime-detail__episode-row ${
                              isWatched
                                ? "anime-detail__episode-row--watched"
                                : ""
                            } ${
                              isCurrent
                                ? "anime-detail__episode-row--current"
                                : ""
                            }`}
                          >
                            <div className="anime-detail__episode-check">
                              {isWatched
                                ? "✓"
                                : ""}
                            </div>

                            <div className="anime-detail__episode-number">
                              Episode{" "}
                              {episode.episode}
                            </div>

                            <div className="anime-detail__episode-date">
                              {date || "—"}
                            </div>

                            <div className="anime-detail__episode-status">
                              {isWatched
                                ? "Watched"
                                : isCurrent
                                ? "Up next"
                                : "Unwatched"}
                            </div>
                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* PAGINATION */}

                  {totalEpisodePages > 1 && (
                    <div className="anime-detail__episode-pagination">

                      <button
                        type="button"
                        onClick={() =>
                          setEpisodePage(
                            (page) =>
                              Math.max(
                                page - 1,
                                1
                              )
                          )
                        }
                        disabled={
                          safeEpisodePage === 1
                        }
                      >
                        Previous
                      </button>

                      <div>
                        <span>
                          Page{" "}
                          {safeEpisodePage} of{" "}
                          {totalEpisodePages}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEpisodePage(
                            (page) =>
                              Math.min(
                                page + 1,
                                totalEpisodePages
                              )
                          )
                        }
                        disabled={
                          safeEpisodePage ===
                          totalEpisodePages
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {/* REVIEWS */}

        {activeTab === "reviews" && (
          <div className="anime-detail__tab-content">

            <div className="anime-detail__section-header">
              <div>
                <h2>Reviews</h2>

                <p>
                  See what other viewers thought.
                </p>
              </div>
            </div>

            {reviewsLoading && (
              <p className="anime-detail__muted">
                Loading reviews...
              </p>
            )}

            {reviewsError && (
              <p className="anime-detail__muted">
                Reviews are temporarily unavailable.
              </p>
            )}

            {!reviewsLoading &&
              !reviewsError &&
              displayedReviews.length > 0 && (
                <div className="review-list">

                  {displayedReviews.map(
                    (review) => (
                      <article
                        key={review.id}
                        className="review-card"
                      >
                        <div className="review-card__header">

                          <div className="review-card__user">

                            {review.user?.avatar
                              ?.medium ? (
                              <img
                                src={
                                  review.user
                                    .avatar
                                    .medium
                                }
                                alt=""
                                className="review-card__avatar"
                              />
                            ) : (
                              <div className="review-card__avatar-placeholder">
                                {review.user
                                  ?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "?"}
                              </div>
                            )}

                            <div>
                              <h3>
                                {review.user
                                  ?.name ||
                                  "Anonymous"}
                              </h3>

                              {review.createdAt && (
                                <span>
                                  {new Date(
                                    review.createdAt *
                                      1000
                                  ).toLocaleDateString(
                                    undefined,
                                    {
                                      month:
                                        "short",
                                      day: "numeric",
                                      year:
                                        "numeric",
                                    }
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="review-card__score">
                            {review.score != null ? (
                              <>
                                <strong>
                                  {Number(
                                    review.score
                                  ).toFixed(1)}
                                </strong>

                                <span>
                                  /10
                                </span>
                              </>
                            ) : (
                              "No score"
                            )}
                          </div>
                        </div>

                        {review.summary && (
                          <h4 className="review-card__summary">
                            {review.summary}
                          </h4>
                        )}

                        <p className="review-card__text">
                          {review.body ||
                            "No review text available."}
                        </p>
                      </article>
                    )
                  )}
                </div>
              )}

            {!reviewsLoading &&
              !reviewsError &&
              displayedReviews.length > 0 &&
              hasMoreReviews && (
                <div className="anime-detail__load-more">
                  <button
                    type="button"
                    className="anime-detail__load-more-button"
                    onClick={() =>
                      loadMoreReviews()
                    }
                    disabled={loadingMoreReviews}
                  >
                    {loadingMoreReviews
                      ? "Loading reviews..."
                      : "Load more reviews"}
                  </button>
                </div>
              )}

            {!reviewsLoading &&
              !reviewsError &&
              displayedReviews.length ===
                0 && (
                <p className="anime-detail__muted">
                  No reviews are available yet.
                </p>
              )}
          </div>
        )}

        {/* RECOMMENDATIONS */}

        {activeTab === "recommendations" && (
          <div className="anime-detail__tab-content">

            <div className="anime-detail__section-header">
              <div>
                <h2>Recommendations</h2>

                <p>
                  Anime you might enjoy next.
                </p>
              </div>
            </div>

            {recommendationsLoading && (
              <p className="anime-detail__muted">
                Loading recommendations...
              </p>
            )}

            {recommendationsError && (
              <p className="anime-detail__muted">
                Recommendations are temporarily
                unavailable.
              </p>
            )}

            {!recommendationsLoading &&
              !recommendationsError &&
              displayedRecommendations.length >
                0 && (
                <div className="anime-detail__recommendations">
                  {displayedRecommendations.map(
                    (item) => (
                      <AnimeCard
                        key={item.id}
                        anime={item}
                      />
                    )
                  )}
                </div>
              )}

            {!recommendationsLoading &&
              !recommendationsError &&
              displayedRecommendations.length ===
                0 && (
                <p className="anime-detail__muted">
                  No recommendations are available
                  yet.
                </p>
              )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AnimeDetail;