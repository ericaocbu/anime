import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../api/anime";

export function useSchedule() {
  return useQuery({
    queryKey: ["anime", "schedule"],
    queryFn: getSchedule,
  });
}