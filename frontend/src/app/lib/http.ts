import { AUTH_ENDPOINTS, API_BASE_URL, LOGIN_ROUTE } from "./constants";
import { mapAuthResponseToSession } from "./mappings";
import { clearAuthSession, getAuthSession, setAuthSession } from "./storage";
import type { AuthResponse, AuthSession } from "../types/auth";
import type { ApiErrorBody } from "../types/shared";

type SerializableBody = object;
type RequestBody = BodyInit | SerializableBody | null | undefined;

export interface HttpRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  auth?: boolean;
  body?: RequestBody;
  headers?: HeadersInit;
  retryOnAuthFailure?: boolean;
  skipRefresh?: boolean;
}

interface InternalHttpRequestOptions extends HttpRequestOptions {
  _retried?: boolean;
}

interface RefreshSessionOptions {
  redirectOnFailure?: boolean;
}

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<AuthSession | null> | null = null;
let authStateGeneration = 0;

export function invalidateAuthState(): number {
  authStateGeneration += 1;
  refreshPromise = null;
  return authStateGeneration;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

function buildUrl(path: string): string {
  const normalizedPath = normalizePath(path);

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return `${API_BASE_URL}/${normalizedPath}`;
}

function isJsonBody(body: RequestBody): body is SerializableBody {
  return !!body
    && typeof body === "object"
    && !(body instanceof FormData)
    && !(body instanceof URLSearchParams)
    && !(body instanceof Blob)
    && !(body instanceof ArrayBuffer);
}

function isAuthEndpoint(path: string): boolean {
  const normalizedPath = normalizePath(path);
  return normalizedPath === AUTH_ENDPOINTS.login || normalizedPath === AUTH_ENDPOINTS.refresh;
}

function redirectToLogin() {
  if (!isBrowser()) {
    return;
  }

  if (window.location.pathname !== LOGIN_ROUTE) {
    window.location.replace(LOGIN_ROUTE);
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

function resolveErrorMessage(data: unknown, fallback: string): string {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object") {
    const body = data as ApiErrorBody;

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }

    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }
  }

  return fallback;
}

function buildRequestInit(options: InternalHttpRequestOptions): RequestInit {
  const { auth = true, body, headers, ...requestInit } = options;
  const session = auth ? getAuthSession() : null;
  const nextHeaders = new Headers(headers ?? {});

  nextHeaders.set("Accept", "application/json");

  if (auth && session?.token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${session.token}`);
  }

  let nextBody = body as BodyInit | null | undefined;

  if (isJsonBody(body)) {
    if (!nextHeaders.has("Content-Type")) {
      nextHeaders.set("Content-Type", "application/json");
    }

    nextBody = JSON.stringify(body);
  }

  return {
    ...requestInit,
    headers: nextHeaders,
    body: nextBody,
  };
}

async function rawRequest<T>(path: string, options: InternalHttpRequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path), buildRequestInit(options));
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpError(
      resolveErrorMessage(data, `Falha na requisicao (${response.status}).`),
      response.status,
      data,
    );
  }

  return data as T;
}

function shouldRetryWithRefresh(
  path: string,
  options: InternalHttpRequestOptions,
  error: unknown,
): error is HttpError {
  return error instanceof HttpError
    && error.status === 401
    && options.auth !== false
    && options.retryOnAuthFailure !== false
    && !options.skipRefresh
    && !options._retried
    && !isAuthEndpoint(path);
}

export async function refreshStoredSession(
  options: RefreshSessionOptions = {},
): Promise<AuthSession | null> {
  const { redirectOnFailure = true } = options;
  const currentSession = getAuthSession();

  if (!currentSession?.refreshToken) {
    clearAuthSession();

    if (redirectOnFailure) {
      redirectToLogin();
    }

    return null;
  }

  if (!refreshPromise) {
    const generationAtStart = authStateGeneration;
    const refreshTokenAtStart = currentSession.refreshToken;

    refreshPromise = rawRequest<AuthResponse>(AUTH_ENDPOINTS.refresh, {
      method: "POST",
      body: { refreshToken: currentSession.refreshToken },
      auth: false,
      skipRefresh: true,
      retryOnAuthFailure: false,
    })
      .then((response) => {
        const nextSession = mapAuthResponseToSession(response);

        const sessionAfterRefresh = getAuthSession();
        const authStateWasInvalidated = authStateGeneration !== generationAtStart;
        const refreshTokenChanged = sessionAfterRefresh?.refreshToken !== refreshTokenAtStart;

        if (authStateWasInvalidated || refreshTokenChanged) {
          return sessionAfterRefresh;
        }

        setAuthSession(nextSession);
        return nextSession;
      })
      .catch((error) => {
        clearAuthSession();

        if (redirectOnFailure) {
          redirectToLogin();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function httpRequest<T>(
  path: string,
  options: InternalHttpRequestOptions = {},
): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (!shouldRetryWithRefresh(path, options, error)) {
      throw error;
    }

    const refreshedSession = await refreshStoredSession().catch(() => null);

    if (!refreshedSession) {
      throw error;
    }

    return rawRequest<T>(path, {
      ...options,
      _retried: true,
    });
  }
}

export function extractHttpErrorMessage(
  error: unknown,
  fallback = "Nao foi possivel concluir a operacao.",
): string {
  if (error instanceof HttpError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
