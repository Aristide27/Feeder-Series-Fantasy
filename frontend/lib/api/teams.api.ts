const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type Team = {
  id: number;
  user_id: number;
  league_id: number;
  season: number;
  name: string;
  is_validated: number;
  validated_at: string | null;
  created_at: string;
};

export type TeamDriver = {
  driver_id: number;
  driver_name: string;
  driver_price: number;
  rookie: number;
  constructor_name: string;
};

export type TeamConstructor = {
  constructor_id: number;
  constructor_name: string;
  constructor_price: number;
  slug: string;
};

export type TeamData = {
  team: {
    id: number;
    name: string;
    budget: number;
  } | null;
  league: {
    id: number;
    name: string;
  } | null;
  constructors: TeamConstructor[];
  drivers: TeamDriver[];
};

/* Récupérer l'équipe de l'utilisateur pour une ligue */
export async function getTeam(token: string, leagueId: number): Promise<TeamData> {
  const res = await fetch(`${API_BASE}/api/teams/${leagueId}`, {  // ✅ Corrigé les backticks
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur chargement");
  return data;
}

/* Sauvegarder l'équipe (auto-save) */
export async function saveTeam(
  token: string,
  leagueId: number,
  teamData: {
    teamName: string;
    constructorIds: number[];
    driverIds: number[];
  }
): Promise<{ message: string; teamId: number; totalCost: string }> {
  const res = await fetch(`${API_BASE}/api/teams/${leagueId}/save`, {  // ✅ Corrigé les backticks
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur sauvegarde");
  return data;
}

/* Récupérer le statut de la deadline */
export async function getDeadlineStatus(
  token: string,
  leagueId: number
): Promise<{
  state: "open" | "urgent" | "locked";
  canEdit: boolean;
  deadline: string | null;
  unlockAt: string | null;
  weekendName: string | null;
  round?: number;
  timeRemaining: string | null;
}> {
  const res = await fetch(`${API_BASE}/api/teams/${leagueId}/deadline-status`, {  // ✅ Corrigé les backticks
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur");
  return data;
}

/* Modifier le nom de l'équipe */
export async function updateTeamName(
  token: string,
  leagueId: number,
  name: string
): Promise<{ message: string; name: string }> {
  const res = await fetch(`${API_BASE}/api/teams/${leagueId}/name`, {  // ✅ Corrigé les backticks
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur modification nom");
  return data;
}