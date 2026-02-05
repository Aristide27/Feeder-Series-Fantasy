const API_BASE_URL = "http://localhost:3000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "API error");
  }

  return res.json();
}
