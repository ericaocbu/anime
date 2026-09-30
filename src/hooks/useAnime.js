import { useQuery } from "@tanstack/react-query";
import {
  getAnime,
  getAnimeCharacters,
  getAnimeReviews,
  getAnimeRecommendations,
} from "../api/anime";

export function useAnime(id) {
  return useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnime(id),
    enabled: Boolean(id),
  });
}

export function useAnimeCharacters(id) {
  return useQuery({
    queryKey: ["anime", id, "characters"],
    queryFn: () => getAnimeCharacters(id),
    enabled: Boolean(id),
  });
}

export function useAnimeReviews(id) {
  return useQuery({
    queryKey: ["anime", id, "reviews"],
    queryFn: () => getAnimeReviews(id),
    enabled: Boolean(id),
  });
}

export function useAnimeRecommendations(id) {
  return useQuery({
    queryKey: ["anime", id, "recommendations"],
    queryFn: () => getAnimeRecommendations(id),
    enabled: Boolean(id),
  });
}