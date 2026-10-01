import { anilistRequest } from "./anilist";
import { normalizeAnime } from "../utils/normalizeAnime";

const SEARCH_FIELDS = `
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
    large
    medium
  }
`;

export function searchAnime(query, page = 1) {
  const searchQuery = `
    query ($search: String!, $page: Int!) {
      Page(
        page: $page
        perPage: 20
      ) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }

        media(
          search: $search
          type: ANIME
          isAdult: false
          sort: [SEARCH_MATCH, POPULARITY_DESC]
        ) {
          ${SEARCH_FIELDS}
        }
      }
    }
  `;

  return anilistRequest(searchQuery, {
    search: query,
    page,
  }).then((data) => ({
    data: data.Page.media.map(normalizeAnime),
    pagination: data.Page.pageInfo,
  }));
}