import { useQuery } from "@tanstack/react-query";
import { searchAnime } from "../api/search";

export function useSearchAnime(query, page = 1) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => searchAnime(query, page),
    enabled: Boolean(query.trim()),
  });
}