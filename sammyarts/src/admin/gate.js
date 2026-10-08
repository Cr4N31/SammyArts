export const ADMIN_PASSWORD = "sammyarts";

const KEY = "sammyarts-admin";

export function isAuthed() {
  return sessionStorage.getItem(KEY) === "1";
}

export function login(password) {
  if (password !== ADMIN_PASSWORD) return false;
  sessionStorage.setItem(KEY, "1");
  return true;
}

export function logout() {
  sessionStorage.removeItem(KEY);
}
