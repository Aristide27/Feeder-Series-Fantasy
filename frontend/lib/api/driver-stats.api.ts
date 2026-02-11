const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type Weekend = {
  weekend_id: number | null;
  season: number | null;
  round: number | null;
  weekend_name: string;
  quali_position: number | null;
  sprint_position: number | null;
  feature_position: number | null;
  quali_points: number;
  sprint_points: number;
  feature_points: number;
  total_points: number;
};

export type DriverStatsResponse = {
  driver: {
    driver_id: number;
    driver_name: string;
    driver_nationality: string;
    driver_number: number | null;
    season: number;
    rookie: number;
    driver_price: number;
    constructor_id: number;
    constructor_name: string;
  };
  hasData: boolean;
  message?: string;
  normalized?: {
    avg_quali: number;
    avg_sprint: number;
    avg_feature: number;
    points_per_million: number;
    best_weekend: number;
  };
  raw?: {
    avg_quali: number | null;
    avg_sprint: number | null;
    avg_feature: number | null;
    points_per_million: number;
    best_weekend: number;
    total_points: number;
    races_count: number;
  };
  last_weekends?: Weekend[];
};

/**
 * Récupérer les statistiques détaillées d'un pilote pour le radar
 */
export async function getDriverStats(
  token: string,
  driverId: number
): Promise<DriverStatsResponse> {
  const res = await fetch(`${API_BASE}/api/driver-stats/${driverId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur récupération stats");
  return data;
}