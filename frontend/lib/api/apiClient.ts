const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Déconnexion automatique en cas de token invalide
 */
function handleUnauthorized() {
  // Supprimer le token
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    
    // Rediriger vers login sauf si on est déjà sur login/register
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {  // ← CORRECTION ICI (backticks au lieu de template literals)
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // Gestion des erreurs 401 (token invalide/expiré)
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Session expirée. Reconnexion nécessaire.");
  }

  if (!res.ok) {
    const message = await res.text().catch(() => "API error");
    throw new Error(message || "API error");
  }

  return res.json();
}