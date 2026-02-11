import { apiFetch } from "./apiClient";

export type DriverSeasonRow = {
  driver_id: number;
  driver_name: string;
  driver_nationality: string;

  season: number;
  rookie: number;
  driver_price: number;

  constructor_id: number;
  constructor_name: string;
  constructor_nationality: string;
};

export function getDriverSeasons(season: number) {
  return apiFetch<DriverSeasonRow[]>(
    `/api/fantasy/driver-seasons?season=${season}`
  );
}

