export type TeamDraft = {
  season: number;
  constructor_ids: number[];
  driver_season_ids: number[];
};

const KEY_PREFIX = "fantasyF2_teamDraft_v1";

function key(leagueId: string) {
  return `${KEY_PREFIX}:${leagueId}`;
}

export function loadTeamDraft(leagueId: string) {
  try {
    const raw = localStorage.getItem(key(leagueId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTeamDraft(leagueId: string, draft: any) {
  localStorage.setItem(key(leagueId), JSON.stringify(draft));
}

export function clearTeamDraft() {
  localStorage.removeItem(KEY_PREFIX);
}
