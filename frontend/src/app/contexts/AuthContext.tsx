import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { hasAnyRole } from "../lib/mappings";
import { getAuthSession, subscribeAuthSession } from "../lib/storage";
import { authService } from "../services/authService";
import type { AuthSession, AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  register: (credentials: RegisterCredentials) => Promise<AuthSession>;
  logout: () => void;
  refreshSession: () => Promise<AuthSession | null>;
  hasRole: (roles: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return subscribeAuthSession(setSession);
  }, []);

  useEffect(() => {
    let active = true;

    authService.bootstrapSession().finally(() => {
      if (active) {
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.token,
        isLoading,
        login: authService.login,
        register: authService.register,
        logout: () => authService.logout(),
        refreshSession: authService.refresh,
        hasRole: (roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return hasAnyRole(session?.user.roles ?? [], requiredRoles);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
