import { apiFetch } from "./apiClient";

export type ScoringType = "qualifying" | "sprint" | "feature";

export function getScoring(
  type: ScoringType,
  weekendId: number
) {
  return apiFetch<{
    driverPoints: { driver_season_id: number; points: number }[];
    constructorPoints: { constructor_id: number; points: number }[];
  }>(`/api/scoring/${type}/${weekendId}`);
}
