import {
  ALUNO_AREA_ROLES,
  FORBIDDEN_ROUTE,
  LOGIN_ROUTE,
  PROFESSOR_AREA_ROLES,
  ROLE_ADMIN,
  ROLE_ALUNO,
  ROLE_PROFESSOR,
} from "./constants";
import { getTokenExpirationMs } from "./jwt";
import type { AuthResponse, AuthSession } from "../types/auth";

const ROLE_PRIORITY: Record<string, number> = {
  [ROLE_ADMIN]: 0,
  [ROLE_PROFESSOR]: 1,
  [ROLE_ALUNO]: 2,
};

const ROLE_LABELS: Record<string, string> = {
  [ROLE_ADMIN]: "Administrador",
  [ROLE_PROFESSOR]: "Professor",
  [ROLE_ALUNO]: "Aluno",
};

export function normalizeRoles(roles: string[] = []): string[] {
  return Array.from(new Set(roles.filter(Boolean))).sort((left, right) => {
    const leftPriority = ROLE_PRIORITY[left] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = ROLE_PRIORITY[right] ?? Number.MAX_SAFE_INTEGER;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.localeCompare(right);
  });
}

export function mapAuthResponseToSession(response: AuthResponse): AuthSession {
  const roles = normalizeRoles(response.roles);

  return {
    token: response.token,
    refreshToken: response.refreshToken,
    tokenType: response.type || "Bearer",
    expiresAt: getTokenExpirationMs(response.token),
    user: {
      userId: response.userId,
      professorId: response.professorId ?? null,
      alunoId: response.alunoId ?? null,
      name: response.name,
      email: response.email,
      roles,
    },
  };
}

export function hasAnyRole(userRoles: string[] = [], allowedRoles: readonly string[] = []): boolean {
  if (allowedRoles.length === 0) {
    return true;
  }

  const roleSet = new Set(normalizeRoles(userRoles));
  return allowedRoles.some((role) => roleSet.has(role));
}

export function getDefaultHomePath(roles: string[] = []): string {
  if (hasAnyRole(roles, PROFESSOR_AREA_ROLES)) {
    return "/professor";
  }

  if (hasAnyRole(roles, ALUNO_AREA_ROLES)) {
    return "/aluno";
  }

  return LOGIN_ROUTE;
}

export function getRoleLabel(roles: string[] = []): string {
  const normalizedRoles = normalizeRoles(roles);

  if (normalizedRoles.length === 0) {
    return "Sem perfil";
  }

  return normalizedRoles
    .map((role) => ROLE_LABELS[role] ?? role.replace(/^ROLE_/, ""))
    .join(" / ");
}

export function canAccessPath(path: string | undefined, roles: string[] = []): boolean {
  if (!path || path === LOGIN_ROUTE || path === FORBIDDEN_ROUTE) {
    return false;
  }

  if (path.startsWith("/professor")) {
    return hasAnyRole(roles, PROFESSOR_AREA_ROLES);
  }

  if (path.startsWith("/aluno")) {
    return hasAnyRole(roles, ALUNO_AREA_ROLES);
  }

  return false;
}

export function resolvePostLoginPath(
  roles: string[] = [],
  fromPath?: string,
  preferredArea?: "professor" | "aluno",
): string {
  if (canAccessPath(fromPath, roles)) {
    return fromPath!;
  }

  if (preferredArea === "professor" && hasAnyRole(roles, PROFESSOR_AREA_ROLES)) {
    return "/professor";
  }

  if (preferredArea === "aluno" && hasAnyRole(roles, ALUNO_AREA_ROLES)) {
    return "/aluno";
  }

  return getDefaultHomePath(roles);
}

export function extractRedirectPath(state: unknown): string | undefined {
  if (!state || typeof state !== "object" || !("from" in state)) {
    return undefined;
  }

  const from = (state as { from?: { pathname?: unknown } }).from;
  return typeof from?.pathname === "string" ? from.pathname : undefined;
}
