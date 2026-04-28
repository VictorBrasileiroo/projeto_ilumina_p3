import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { FORBIDDEN_ROUTE, LOGIN_ROUTE } from "../lib/constants";
import { hasAnyRole } from "../lib/mappings";
import { useAuth } from "../hooks/useAuth";

interface RequireAuthProps {
  allowedRoles: readonly string[];
  children?: ReactNode;
}

function AuthLoadingState() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-white px-6 py-8 shadow-[var(--shadow-md)] text-center">
        <p className="text-[15px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
          Carregando sessao...
        </p>
        <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
          Estamos validando seu acesso antes de abrir a area protegida.
        </p>
      </div>
    </div>
  );
}

export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingState />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={LOGIN_ROUTE} replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !hasAnyRole(user.roles, allowedRoles)) {
    return <Navigate to={FORBIDDEN_ROUTE} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
