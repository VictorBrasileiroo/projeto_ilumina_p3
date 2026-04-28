import { AUTH_ENDPOINTS, LOGIN_ROUTE, ROLE_ALUNO, ROLE_PROFESSOR } from "../lib/constants";
import { httpRequest, invalidateAuthState, refreshStoredSession } from "../lib/http";
import { isTokenExpired } from "../lib/jwt";
import { mapAuthResponseToSession } from "../lib/mappings";
import { clearAuthSession, getAuthSession, setAuthSession } from "../lib/storage";
import type { AuthResponse, AuthSession, LoginCredentials, RegisterCredentials } from "../types/auth";

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== LOGIN_ROUTE) {
    window.location.replace(LOGIN_ROUTE);
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await httpRequest<AuthResponse>(AUTH_ENDPOINTS.login, {
      method: "POST",
      body: credentials,
      auth: false,
      skipRefresh: true,
      retryOnAuthFailure: false,
    });

    const session = mapAuthResponseToSession(response);
    invalidateAuthState();
    setAuthSession(session);
    return session;
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const response = await httpRequest<AuthResponse>(AUTH_ENDPOINTS.register, {
      method: "POST",
      body: credentials,
      auth: false,
      skipRefresh: true,
      retryOnAuthFailure: false,
    });

    const session = mapAuthResponseToSession(response);

    const hasDomainLink = credentials.role === ROLE_PROFESSOR
      ? !!session.user.professorId
      : credentials.role === ROLE_ALUNO
        ? !!session.user.alunoId
        : false;

    if (!hasDomainLink) {
      clearAuthSession();
      throw new Error("Conta criada, mas o perfil ainda nao foi provisionado. Tente novamente mais tarde.");
    }

    invalidateAuthState();
    setAuthSession(session);
    return session;
  },

  async refresh(): Promise<AuthSession | null> {
    return refreshStoredSession({ redirectOnFailure: false });
  },

  async bootstrapSession(): Promise<AuthSession | null> {
    const existingSession = getAuthSession();

    if (!existingSession) {
      return null;
    }

    if (!isTokenExpired(existingSession.token)) {
      return existingSession;
    }

    return refreshStoredSession({ redirectOnFailure: false }).catch(() => null);
  },

  logout(options: { redirect?: boolean } = {}) {
    const { redirect = true } = options;

    invalidateAuthState();
    clearAuthSession();

    if (redirect) {
      redirectToLogin();
    }
  },
};
