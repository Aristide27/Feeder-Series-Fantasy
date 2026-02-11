const KEY = "token";          // ← Simplifié
const USERNAME_KEY = "username"; // ← Simplifié

export function saveAuth(token: string, username: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    
    window.dispatchEvent(new Event('localStorageChange'));
  }
}

export function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(KEY);
}

export function getUsername() {
  return typeof window === "undefined" ? null : localStorage.getItem(USERNAME_KEY);
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USERNAME_KEY);
    
    window.dispatchEvent(new Event('localStorageChange'));
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    window.location.href = "/login";
  }
}