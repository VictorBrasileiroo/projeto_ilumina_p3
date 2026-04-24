import { AUTH_STORAGE_KEY } from "./constants";
import type { AuthSession } from "../types/auth";

type AuthSessionListener = (session: AuthSession | null) => void;

let cachedSession: AuthSession | null | undefined;

const listeners = new Set<AuthSessionListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<AuthSession>;
  const user = session.user as AuthSession["user"] | undefined;

  return typeof session.token === "string"
    && typeof session.refreshToken === "string"
    && typeof session.tokenType === "string"
    && (typeof session.expiresAt === "number" || session.expiresAt === null)
    && !!user
    && typeof user.userId === "string"
    && (typeof user.professorId === "string" || user.professorId === null)
    && (typeof user.alunoId === "string" || user.alunoId === null)
    && typeof user.name === "string"
    && typeof user.email === "string"
    && Array.isArray(user.roles);
}

function notifyListeners(session: AuthSession | null) {
  listeners.forEach((listener) => listener(session));
}

function readPersistedSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!isAuthSession(parsed)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  if (cachedSession === undefined) {
    cachedSession = readPersistedSession();
  }

  return cachedSession;
}

export function setAuthSession(session: AuthSession) {
  cachedSession = session;

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  notifyListeners(session);
}

export function clearAuthSession() {
  cachedSession = null;

  if (isBrowser()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  notifyListeners(null);
}

export function subscribeAuthSession(listener: AuthSessionListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
