import { ACCESS_TOKEN_BUFFER_MS } from "./constants";
import type { JwtPayload } from "../types/auth";

function decodeBase64Url(value: string): string | null {
  const decode = typeof globalThis.atob === "function" ? globalThis.atob : null;

  if (!decode) {
    return null;
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized + "=".repeat(4 - padding);

  try {
    return decode(padded);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  const decoded = decodeBase64Url(payload);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpirationMs(token: string): number | null {
  const payload = decodeJwtPayload(token);

  if (typeof payload?.exp !== "number") {
    return null;
  }

  return payload.exp * 1000;
}

export function isTokenExpired(token: string, bufferMs = ACCESS_TOKEN_BUFFER_MS): boolean {
  const expirationMs = getTokenExpirationMs(token);

  if (!expirationMs) {
    return true;
  }

  return expirationMs <= Date.now() + bufferMs;
}
