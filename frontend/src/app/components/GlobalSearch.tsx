import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, FileText, GraduationCap, Loader2, Search, User, Users } from "lucide-react";
import { buscaService } from "../services/buscaService";
import { useAuth } from "../hooks/useAuth";
import { hasAnyRole } from "../lib/mappings";
import { ROLE_ADMIN, ROLE_ALUNO, ROLE_PROFESSOR } from "../lib/constants";
import type { BuscaGlobalResponse, BuscaItem, BuscaTipo } from "../types/busca";

const EMPTY_RESULT: BuscaGlobalResponse = {
  turmas: [],
  provas: [],
  colecoes: [],
  alunos: [],
};

const TYPE_LABEL: Record<BuscaTipo, string> = {
  TURMA: "Turmas",
  PROVA: "Provas",
  COLECAO: "Coleções",
  ALUNO: "Alunos",
};

const TYPE_ICON: Record<BuscaTipo, typeof Users> = {
  TURMA: Users,
  PROVA: FileText,
  COLECAO: BookOpen,
  ALUNO: GraduationCap,
};

function resolveRoute(item: BuscaItem, area: "professor" | "aluno"): string {
  if (area === "aluno") {
    switch (item.tipo) {
      case "TURMA":
        return "/aluno";
      case "PROVA":
        return `/aluno/prova/${item.id}`;
      case "COLECAO":
        return `/aluno/flashcards/${item.id}`;
      default:
        return "/aluno";
    }
  }

  switch (item.tipo) {
    case "TURMA":
      return `/professor/turmas/${item.id}`;
    case "PROVA":
      return `/professor/provas`;
    case "COLECAO":
      return `/professor/flashcards/${item.id}`;
    case "ALUNO":
      return `/professor/turmas`;
    default:
      return "/professor";
  }
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<BuscaGlobalResponse>(EMPTY_RESULT);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const area: "professor" | "aluno" = useMemo(() => {
    if (!user) return "professor";
    if (hasAnyRole(user.roles, [ROLE_ALUNO]) && !hasAnyRole(user.roles, [ROLE_ADMIN, ROLE_PROFESSOR])) {
      return "aluno";
    }
    return "professor";
  }, [user]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(EMPTY_RESULT);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    buscaService
      .buscar(debouncedQuery)
      .then((data) => {
        if (!active) return;
        setResults(data);
      })
      .catch(() => {
        if (!active) return;
        setResults(EMPTY_RESULT);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: BuscaItem) {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    navigate(resolveRoute(item, area));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  const groups: { key: BuscaTipo; label: string; items: BuscaItem[] }[] = useMemo(() => {
    return [
      { key: "TURMA" as BuscaTipo, label: TYPE_LABEL.TURMA, items: results.turmas },
      { key: "PROVA" as BuscaTipo, label: TYPE_LABEL.PROVA, items: results.provas },
      { key: "COLECAO" as BuscaTipo, label: TYPE_LABEL.COLECAO, items: results.colecoes },
      { key: "ALUNO" as BuscaTipo, label: TYPE_LABEL.ALUNO, items: results.alunos },
    ].filter((group) => group.items.length > 0);
  }, [results]);

  const hasAnyResult = groups.length > 0;
  const showPanel = isOpen && debouncedQuery.length > 0;

  return (
    <div ref={containerRef} className="relative w-48 lg:w-64">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar turmas, provas, coleções..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full pl-9 pr-4 py-[6px] text-sm bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] rounded-[var(--border-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-neutral-400)]"
      />

      {showPanel && (
        <div className="absolute right-0 top-full mt-1.5 w-[360px] max-w-[90vw] bg-white border border-[var(--color-neutral-100)] rounded-[var(--border-radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden z-50">
          {isLoading ? (
            <div className="px-4 py-6 flex items-center justify-center gap-2 text-[13px] text-[var(--color-neutral-500)]">
              <Loader2 size={14} className="animate-spin" />
              Buscando...
            </div>
          ) : !hasAnyResult ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--color-neutral-500)]">
              Nenhum resultado para <strong>"{debouncedQuery}"</strong>.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto py-1">
              {groups.map((group) => {
                const Icon = TYPE_ICON[group.key];
                return (
                  <div key={group.key} className="py-1">
                    <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 600 }}>
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={`${group.key}-${item.id}`}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-[var(--color-neutral-50)] focus:bg-[var(--color-neutral-50)] focus:outline-none"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                          {group.key === "ALUNO" ? <User size={14} /> : <Icon size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                            {item.titulo}
                          </p>
                          <p className="truncate text-[12px] text-[var(--color-neutral-400)]">
                            {item.subtitulo}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
