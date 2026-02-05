const KEY = "fsf_token";
const USERNAME_KEY = "fsf_username";

export function saveAuth(token: string, username: string) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

export function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(KEY);
}

export function getUsername() {
  return typeof window === "undefined" ? null : localStorage.getItem(USERNAME_KEY);
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USERNAME_KEY);
}
