const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type GlobalRankingEntry = {
  user_id: number;
  username: string;
  total_points: number;
  joined_at: string;
  rank: number;
  is_me: boolean;
};

/**
 * Récupérer le classement mondial (Top 50 + position de l'utilisateur)
 */
export async function getGlobalRankings(token: string): Promise<GlobalRankingEntry[]> {
  const res = await fetch(`${API_BASE}/api/rankings/global`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération du classement");
  return data as GlobalRankingEntry[];
}