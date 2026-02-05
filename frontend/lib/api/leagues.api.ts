const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type League = {
  id: number;
  name: string;
  code: string;
  is_official: number;
  is_closed: number;
  creator_id: number;
  total_points: number;
  member_count: number;
  rank: number;
};

export type LeagueDetails = {
  id: number;
  name: string;
  code: string;
  is_official: number;
  is_closed: number;
  creator_id: number;
  creator_username: string;
  member_count: number;
  is_creator: boolean;
  created_at: string;
};

export type LeaderboardEntry = {
  id: number;
  username: string;
  total_points: number;
  joined_at: string;
  rank: number;
};

export type TeamComposition = {
  username: string;
  team: {
    name: string;
    constructor: string;
  } | null;
  drivers: Array<{
    id: number;
    name: string;
    price: number;
    rookie: number;
    constructor_name: string;
  }>;
};

/**
 * Créer une ligue
 */
export async function createLeague(token: string, name: string): Promise<{ message: string; league: any }> {
  const res = await fetch(`${API_BASE}/api/leagues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la création de la ligue");
  return data;
}

/**
 * Rejoindre une ligue via code
 */
export async function joinLeague(token: string, code: string): Promise<{ message: string; league: any }> {
  const res = await fetch(`${API_BASE}/api/leagues/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l'inscription à la ligue");
  return data;
}

/**
 * Récupérer la liste des ligues de l'utilisateur
 */
export async function getMyLeagues(token: string): Promise<League[]> {
  const res = await fetch(`${API_BASE}/api/leagues`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération des ligues");
  return data as League[];
}

/**
 * Récupérer les détails d'une ligue
 */
export async function getLeagueDetails(token: string, code: string): Promise<LeagueDetails> {
  const res = await fetch(`${API_BASE}/api/leagues/${code}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération de la ligue");
  return data as LeagueDetails;
}

/**
 * Modifier une ligue (nom ou fermeture)
 */
export async function updateLeague(
  token: string,
  code: string,
  updates: { name?: string; is_closed?: boolean }
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/leagues/${code}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la modification de la ligue");
  return data;
}

/**
 * Supprimer une ligue (admin only)
 */
export async function deleteLeague(token: string, code: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/leagues/${code}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la suppression de la ligue");
  return data;
}

/**
 * Récupérer le classement d'une ligue
 */
export async function getLeagueLeaderboard(token: string, code: string): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/leagues/${code}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération du classement");
  return data as LeaderboardEntry[];
}

/**
 * Récupérer la composition d'un membre
 */
export async function getMemberTeam(token: string, code: string, userId: number): Promise<TeamComposition> {
  const res = await fetch(`${API_BASE}/api/leagues/${code}/team/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération de l'équipe");
  return data as TeamComposition;
}