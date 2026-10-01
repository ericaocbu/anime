import { anilistRequest } from "./anilist";
import { normalizeAnime } from "../utils/normalizeAnime";

const DISCOVER_FIELDS = `
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

  genres

  coverImage {
    extraLarge
    large
    medium
  }
`;

const DISCOVER_QUERY = `
  query {
    highlyRated: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        sort: [SCORE_DESC]
        isAdult: false
        averageScore_greater: 79
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    popular: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    upcoming: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        status: NOT_YET_RELEASED
        sort: [START_DATE_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    action: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Action"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    comedy: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Comedy"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    drama: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Drama"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    fantasy: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Fantasy"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    horror: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Horror"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    romance: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Romance"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    sciFi: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Sci-Fi"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    sliceOfLife: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Slice of Life"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }

    supernatural: Page(
      page: 1
      perPage: 12
    ) {
      media(
        type: ANIME
        genre_in: ["Supernatural"]
        sort: [POPULARITY_DESC]
        isAdult: false
      ) {
        ${DISCOVER_FIELDS}
      }
    }
  }
`;

function normalizeRow(row) {
  return (row?.media || [])
    .map(normalizeAnime)
    .filter(Boolean);
}

export function discoverAnime() {
  return anilistRequest(DISCOVER_QUERY).then((data) => ({
    highlyRated: normalizeRow(data?.highlyRated),
    popular: normalizeRow(data?.popular),
    upcoming: normalizeRow(data?.upcoming),
    action: normalizeRow(data?.action),
    comedy: normalizeRow(data?.comedy),
    drama: normalizeRow(data?.drama),
    fantasy: normalizeRow(data?.fantasy),
    horror: normalizeRow(data?.horror),
    romance: normalizeRow(data?.romance),
    sciFi: normalizeRow(data?.sciFi),
    sliceOfLife: normalizeRow(data?.sliceOfLife),
    supernatural: normalizeRow(data?.supernatural),
  }));
}