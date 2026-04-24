export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1").replace(/\/+$/, "");

export const AUTH_STORAGE_KEY = "ilumina.auth.session";
export const LOGIN_ROUTE = "/";
export const REGISTER_ROUTE = "/cadastro";
export const FORBIDDEN_ROUTE = "/sem-permissao";
export const ACCESS_TOKEN_BUFFER_MS = 30_000;

export const AUTH_ENDPOINTS = {
  register: "auth/register",
  login: "auth/login",
  refresh: "auth/refresh",
} as const;

export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_PROFESSOR = "ROLE_PROFESSOR";
export const ROLE_ALUNO = "ROLE_ALUNO";

export const PROFESSOR_AREA_ROLES = [ROLE_ADMIN, ROLE_PROFESSOR] as const;
export const ALUNO_AREA_ROLES = [ROLE_ALUNO] as const;
