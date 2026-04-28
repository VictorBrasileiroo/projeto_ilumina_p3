import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { alunoService } from "../services/alunoService";
import { useAuth } from "../hooks/useAuth";
import { ROLE_ALUNO } from "../lib/constants";
import { hasAnyRole } from "../lib/mappings";

interface RequireTurmaProps {
  children?: ReactNode;
}

type CheckState = "checking" | "has-turma" | "no-turma" | "error";

function CheckingState() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-white px-6 py-8 shadow-[var(--shadow-md)] text-center">
        <p className="text-[15px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
          Verificando sua matricula...
        </p>
        <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
          Estamos confirmando se voce ja esta vinculado a uma turma.
        </p>
      </div>
    </div>
  );
}

export function RequireTurma({ children }: RequireTurmaProps) {
  const { user } = useAuth();
  const [state, setState] = useState<CheckState>("checking");

  const isAluno = hasAnyRole(user?.roles ?? [], [ROLE_ALUNO]);
  const alunoId = user?.alunoId ?? null;

  useEffect(() => {
    let active = true;

    if (!isAluno || !alunoId) {
      setState("has-turma");
      return () => {
        active = false;
      };
    }

    setState("checking");

    alunoService
      .listMyTurmas(alunoId)
      .then((turmas) => {
        if (!active) return;
        setState(turmas.length > 0 ? "has-turma" : "no-turma");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
      });

    return () => {
      active = false;
    };
  }, [alunoId, isAluno]);

  if (state === "checking") {
    return <CheckingState />;
  }

  if (state === "no-turma") {
    return <Navigate to="/aluno/sem-turma" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
