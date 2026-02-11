const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type AuthLoginResponse = { token: string; username: string };
export type UserMe = { id: number; username: string; email: string | null };

export async function registerUser(payload: {
  username: string;
  email?: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur inscription");
  return data as { message: string };
}

export async function loginUser(payload: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur login");
  return data as AuthLoginResponse;
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Erreur profil");
  return data as UserMe;
}