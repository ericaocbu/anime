import { anilistRequest } from "./anilist";
import { normalizeAnime } from "../utils/normalizeAnime";

const ANIME_FIELDS = `
  id

  title {
    romaji
    english
    native
  }

  type
  format
  status

  description(asHtml: false)

  startDate {
    year
    month
    day
  }

  endDate {
    year
    month
    day
  }

  season
  seasonYear

  episodes
  duration

  averageScore
  meanScore
  popularity
  trending
  favourites

  genres

  synonyms

  tags {
    id
    name
    description
    category
    rank
    isGeneralSpoiler
    isMediaSpoiler
  }

  coverImage {
    extraLarge
    large
    medium
  }

  bannerImage

  isAdult
  source
  countryOfOrigin
  isLicensed

  hashtag

  trailer {
    id
    site
    thumbnail
  }

  nextAiringEpisode {
    id
    airingAt
    timeUntilAiring
    episode
  }

  relations {
    edges {
      relationType
      node {
        id
        title {
          romaji
          english
          native
        }
        type
        format
        status
        episodes
        averageScore
        coverImage {
          large
          medium
        }
      }
    }
  }

  characters(
    page: 1
    perPage: 12
    sort: [ROLE, FAVOURITES_DESC]
  ) {
    edges {
      role

      node {
        id

        name {
          full
        }

        image {
          large
          medium
        }
      }

      voiceActors(language: JAPANESE) {
        id

        name {
          full
        }

        image {
          medium
        }
      }
    }
  }

  staff(
    page: 1
    perPage: 12
  ) {
    edges {
      role

      node {
        id

        name {
          full
        }

        image {
          large
          medium
        }
      }
    }
  }

  studios {
    edges {
      isMain

      node {
        id
        name
        isAnimationStudio
      }
    }
  }

  externalLinks {
    id
    url
    site
    type
    language
    icon
  }

  streamingEpisodes {
    title
    thumbnail
    url
    site
  }

  rankings {
    id
    rank
    type
    context
    season
    year
    format
  }

  siteUrl
`;

export function getAnime(id) {
  const query = `
    query ($id: Int!) {
      Media(id: $id, type: ANIME) {
        ${ANIME_FIELDS}
      }
    }
  `;

  return anilistRequest(query, {
    id: Number(id),
  }).then((data) =>
    normalizeAnime(data.Media)
  );
}

export function getTopAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(
          type: ANIME
          sort: [SCORE_DESC, POPULARITY_DESC]
          isAdult: false
        ) {
          ${ANIME_FIELDS}
        }
      }
    }
  `;

  return anilistRequest(query).then((data) =>
    data.Page.media.map(normalizeAnime)
  );
}

export function getTrendingAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(
          type: ANIME
          sort: TRENDING_DESC
          isAdult: false
        ) {
          ${ANIME_FIELDS}
        }
      }
    }
  `;

  return anilistRequest(query).then((data) =>
    data.Page.media.map(normalizeAnime)
  );
}

export function getUpcomingAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(
          type: ANIME
          status: NOT_YET_RELEASED
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          ${ANIME_FIELDS}
        }
      }
    }
  `;

  return anilistRequest(query).then((data) =>
    data.Page.media.map(normalizeAnime)
  );
}

export function getSeasonalAnime() {
  const query = `
    query ($seasonYear: Int!) {
      Page(page: 1, perPage: 20) {
        media(
          type: ANIME
          season: WINTER
          seasonYear: $seasonYear
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          ${ANIME_FIELDS}
        }
      }
    }
  `;

  return anilistRequest(query, {
    seasonYear: new Date().getFullYear(),
  }).then((data) =>
    data.Page.media.map(normalizeAnime)
  );
}

export function getAnimeEpisodes(id, page = 1) {
  const query = `
    query ($id: Int!, $page: Int!) {
      Media(id: $id, type: ANIME) {
        airingSchedule(
          page: $page
          perPage: 25
        ) {
          pageInfo {
            currentPage
            hasNextPage
          }

          nodes {
            id
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    }
  `;

  return anilistRequest(query, {
    id: Number(id),
    page,
  }).then((data) => ({
    episodes:
      data.Media?.airingSchedule?.nodes || [],

    pageInfo:
      data.Media?.airingSchedule?.pageInfo || {
        currentPage: page,
        hasNextPage: false,
      },
  }));
}

export function getAnimeReviews(
  id,
  page = 1
) {
  const query = `
    query ($id: Int!, $page: Int!) {
      Media(id: $id, type: ANIME) {
        reviews(
          page: $page
          perPage: 10
          sort: RATING_DESC
        ) {
          pageInfo {
            currentPage
            hasNextPage
          }

          nodes {
            id
            summary
            body
            rating
            ratingAmount
            score
            createdAt

            user {
              id
              name

              avatar {
                medium
              }
            }
          }
        }
      }
    }
  `;

  return anilistRequest(query, {
    id: Number(id),
    page,
  }).then((data) => {
    const reviewData =
      data.Media?.reviews;

    return {
      reviews:
        (reviewData?.nodes || []).map(
          (review) => ({
            ...review,

            score:
              review.score != null
                ? Math.round(
                    (review.score / 10) * 10
                  ) / 10
                : null,
          })
        ),

      pageInfo:
        reviewData?.pageInfo || {
          currentPage: page,
          hasNextPage: false,
        },
    };
  });
}

export function getAnimeRecommendations(id) {
  const query = `
    query ($id: Int!) {
      Media(id: $id, type: ANIME) {
        recommendations(
          page: 1
          perPage: 10
        ) {
          nodes {
            id
            rating

            mediaRecommendation {
              ${ANIME_FIELDS}
            }
          }
        }
      }
    }
  `;

  return anilistRequest(query, {
    id: Number(id),
  }).then((data) =>
    (data.Media?.recommendations?.nodes || [])
      .map((node) => ({
        ...node,
        mediaRecommendation:
          normalizeAnime(node.mediaRecommendation),
      }))
      .filter(
        (node) => node.mediaRecommendation
      )
  );
}

export function getSchedule() {
  const now = Math.floor(Date.now() / 1000);

  const sevenDaysFromNow =
    now + 7 * 24 * 60 * 60;

  const query = `
    query (
      $page: Int!
      $perPage: Int!
      $airingAtGreater: Int!
      $airingAtLesser: Int!
    ) {
      Page(
        page: $page
        perPage: $perPage
      ) {
        airingSchedules(
          airingAt_greater: $airingAtGreater
          airingAt_lesser: $airingAtLesser
          notYetAired: true
          sort: TIME
        ) {
          id
          airingAt
          timeUntilAiring
          episode

          media {
            id

            title {
              romaji
              english
              native
            }

            type
            format
            status
            episodes

            averageScore
            popularity
            trending
            seasonYear

            coverImage {
              extraLarge
              large
              medium
            }
          }
        }
      }
    }
  `;

  return anilistRequest(query, {
    page: 1,
    perPage: 50,
    airingAtGreater: now,
    airingAtLesser: sevenDaysFromNow,
  }).then((data) => {
    return (data?.Page?.airingSchedules || [])
      .map((item) => {
        const anime = normalizeAnime(item.media);

        if (!anime) {
          return null;
        }

        return {
          ...anime,

          nextAiringEpisode: {
            id: item.id,
            airingAt: item.airingAt,
            timeUntilAiring:
              item.timeUntilAiring,
            episode: item.episode,
          },
        };
      })
      .filter(Boolean);
  });
}