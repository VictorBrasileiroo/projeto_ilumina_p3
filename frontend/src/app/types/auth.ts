import type { Nullable } from "./shared";

export interface LoginCredentials {
  email: string;
  password: string;
}

export type RegisterRole = "ROLE_PROFESSOR" | "ROLE_ALUNO";

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  userId: string;
  professorId: Nullable<string>;
  alunoId: Nullable<string>;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthUser {
  userId: string;
  professorId: Nullable<string>;
  alunoId: Nullable<string>;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Nullable<number>;
  user: AuthUser;
}

export interface JwtPayload {
  sub?: string;
  exp?: number;
  userId?: string;
  roles?: string[];
  professorId?: string;
  alunoId?: string;
  tokenType?: string;
  [key: string]: unknown;
}
