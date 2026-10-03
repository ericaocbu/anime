import { useQuery } from "@tanstack/react-query";
import { discoverAnime } from "../api/discover";

export function useDiscoverAnime(genres = []) {
  return useQuery({
    queryKey: ["discover", genres],
    queryFn: () => discoverAnime(genres),
  });
}