import { useInfiniteQuery, useQuery, } from "@tanstack/react-query";

import {
  getAnime,
  getAnimeEpisodes,
  getAnimeReviews,
  getAnimeRecommendations,
  getTopAnime,
  getTrendingAnime,
  getUpcomingAnime,
} from "../api/anime";

export function useAnime(id) {
  return useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnime(id),
    enabled: Boolean(id),
  });
}

export function useAnimeEpisodes(id, enabled = true) {
  return useQuery({
    queryKey: ["anime", id, "episodes"],
    queryFn: () => getAnimeEpisodes(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useAnimeReviews(
  id,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ["anime", id, "reviews"],

    queryFn: ({ pageParam = 1 }) =>
      getAnimeReviews(id, pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage?.pageInfo?.hasNextPage
        ? lastPage.pageInfo.currentPage + 1
        : undefined,

    enabled: Boolean(id) && enabled,
  });
}

export function useAnimeRecommendations(id, enabled = true) {
  return useQuery({
    queryKey: ["anime", id, "recommendations"],
    queryFn: () => getAnimeRecommendations(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useTopAnime() {
  return useQuery({
    queryKey: ["anime", "top"],
    queryFn: getTopAnime,
  });
}

export function useTrendingAnime() {
  return useQuery({
    queryKey: ["anime", "trending"],
    queryFn: getTrendingAnime,
  });
}

export function useUpcomingAnime() {
  return useQuery({
    queryKey: ["anime", "upcoming"],
    queryFn: getUpcomingAnime,
  });
}