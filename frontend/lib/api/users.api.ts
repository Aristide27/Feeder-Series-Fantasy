const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type UserProfile = {
  id: number;
  username: string;
  email: string | null;
  created_at: string;
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la récupération du profil");
  return data as UserProfile;
}

/**
 * Modifie le username de l'utilisateur connecté
 */
export async function updateUsername(token: string, username: string): Promise<{ message: string; username: string }> {
  const res = await fetch(`${API_BASE}/users/me/username`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la modification du username");
  return data;
}

/**
 * Modifie l'email de l'utilisateur connecté
 */
export async function updateEmail(token: string, email: string): Promise<{ message: string; email: string | null }> {
  const res = await fetch(`${API_BASE}/users/me/email`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la modification de l'email");
  return data;
}

/**
 * Modifie le mot de passe de l'utilisateur connecté
 */
export async function updatePassword(
  token: string,
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/users/me/password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur lors de la modification du mot de passe");
  return data;
}
