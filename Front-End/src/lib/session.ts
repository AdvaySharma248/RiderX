export type AccountType = "rider" | "driver";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
}

export interface SessionData {
  token: string;
  user: SessionUser;
}

const SESSION_STORAGE_KEY = "ridex-session";

const isBrowser = () => typeof window !== "undefined";

export const getSession = (): SessionData | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionData;
    if (!parsed?.token || !parsed?.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const setSession = (session: SessionData) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getSessionUser = () => getSession()?.user ?? null;
