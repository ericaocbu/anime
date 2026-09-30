import { jikanRequest } from "./jikan";

export function searchAnime(query, page = 1) {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
  });

  return jikanRequest(`/anime?${params.toString()}`);
}