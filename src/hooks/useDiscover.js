import { useQuery } from "@tanstack/react-query";
import { discoverAnime } from "../api/discover";

export function useDiscoverAnime() {
  return useQuery({
    queryKey: ["discover"],
    queryFn: discoverAnime,
  });
}