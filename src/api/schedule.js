import { jikanRequest } from "./jikan";

export function getSchedule(day) {
  const endpoint = day
    ? `/schedules?filter=${day}`
    : "/schedules";

  return jikanRequest(endpoint);
}