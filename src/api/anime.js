import { jikanRequest } from "./jikan";

export function getAnime(id) {
  return jikanRequest(`/anime/${id}`);
}

export function getAnimeCharacters(id) {
  return jikanRequest(`/anime/${id}/characters`);
}

export function getAnimeReviews(id) {
  return jikanRequest(`/anime/${id}/reviews`);
}

export function getAnimeRecommendations(id) {
  return jikanRequest(`/anime/${id}/recommendations`);
}

export function getAnimeEpisodes(id) {
  return jikanRequest(`/anime/${id}/episodes`);
}

export function getAnimeStatistics(id) {
  return jikanRequest(`/anime/${id}/statistics`);
}