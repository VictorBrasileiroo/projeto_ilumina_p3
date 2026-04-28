import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowRight, CalendarDays, FileText, Plus, Search, Users } from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { extractHttpErrorMessage } from "../../lib/http";
import { provaService } from "../../services/provaService";
import type { ProvaResponse, ProvaStatus } from "../../types/prova";

const PER_PAGE = 4;

const STATUS_CONFIG: Record<ProvaStatus, { label: string; variant: "success" | "warning"; accent: "success" | "warning" }> = {
  RASCUNHO: { label: "Rascunho", variant: "warning", accent: "warning" },
  PUBLICADA: { label: "Publicada", variant: "success", accent: "success" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function ListaProvas() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [provas, setProvas] = useState<ProvaResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProvaStatus | "TODAS">("TODAS");
  const [turmaFilter, setTurmaFilter] = useState("Todas");
  const [disciplinaFilter, setDisciplinaFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    let active = true;

    async function loadProvas() {
      setIsLoading(true);
      setError(null);

      try {
        const nextProvas = await provaService.listar();
        if (active) {
          setProvas(nextProvas);
        }
      } catch (nextError) {
        if (active) {
          setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar as provas."));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProvas();

    return () => {
      active = false;
    };
  }, []);

  const sortedProvas = useMemo(
    () => [...provas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [provas],
  );

  const turmas = useMemo(
    () => ["Todas", ...Array.from(new Set(sortedProvas.map((prova) => prova.turmaNome).filter(Boolean)))],
    [sortedProvas],
  );

  const disciplinas = useMemo(
    () => ["Todas", ...Array.from(new Set(sortedProvas.map((prova) => prova.disciplina ?? "").filter(Boolean)))],
    [sortedProvas],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sortedProvas.filter((prova) => {
      const matchesStatus = statusFilter === "TODAS" || prova.status === statusFilter;
      const matchesTurma = turmaFilter === "Todas" || prova.turmaNome === turmaFilter;
      const matchesDisciplina = disciplinaFilter === "Todas" || prova.disciplina === disciplinaFilter;
      const matchesSearch = !q
        || prova.titulo.toLowerCase().includes(q)
        || (prova.disciplina ?? "").toLowerCase().includes(q)
        || prova.turmaNome.toLowerCase().includes(q);

      return matchesStatus && matchesTurma && matchesDisciplina && matchesSearch;
    });
  }, [disciplinaFilter, searchQuery, sortedProvas, statusFilter, turmaFilter]);

  useEffect(() => {
    setPage(1);
  }, [disciplinaFilter, searchQuery, statusFilter, turmaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    TODAS: provas.length,
    RASCUNHO: provas.filter((prova) => prova.status === "RASCUNHO").length,
    PUBLICADA: provas.filter((prova) => prova.status === "PUBLICADA").length,
  };

  const tabs: { key: ProvaStatus | "TODAS"; label: string; count: number }[] = [
    { key: "TODAS", label: "Todas", count: counts.TODAS },
    { key: "RASCUNHO", label: "Rascunhos", count: counts.RASCUNHO },
    { key: "PUBLICADA", label: "Publicadas", count: counts.PUBLICADA },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1>Provas</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Gerencie rascunhos, publicações e revisões das avaliações.
          </p>
        </div>
        <Link to="/professor/provas/criar">
          <Button>
            <Plus size={16} />
            Criar Prova
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]" style={{ fontWeight: 600 }}>Total</p>
          <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : counts.TODAS}</p>
          <p className="text-[12px] text-[var(--color-neutral-400)]">provas criadas</p>
        </Card>
        <Card className="p-5" accent="warning">
          <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]" style={{ fontWeight: 600 }}>Rascunhos</p>
          <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : counts.RASCUNHO}</p>
          <p className="text-[12px] text-[var(--color-neutral-400)]">em revisão</p>
        </Card>
        <Card className="p-5" accent="success">
          <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]" style={{ fontWeight: 600 }}>Publicadas</p>
          <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : counts.PUBLICADA}</p>
          <p className="text-[12px] text-[var(--color-neutral-400)]">visiveis para alunos</p>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-[var(--border-radius)] px-3 py-1.5 text-sm transition-colors ${
                statusFilter === tab.key
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${statusFilter === tab.key ? "bg-white/20 text-white" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"}`}>
                {tab.count}
              </span>
            </button>
          ))}

          <select value={turmaFilter} onChange={(event) => setTurmaFilter(event.target.value)} className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)]">
            {turmas.map((turma) => <option key={turma}>{turma}</option>)}
          </select>

          <select value={disciplinaFilter} onChange={(event) => setDisciplinaFilter(event.target.value)} className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)]">
            {disciplinas.map((disciplina) => <option key={disciplina}>{disciplina}</option>)}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por titulo, disciplina ou turma..."
            value={searchQuery}
            onChange={(event) => {
              setSearchParams((prev) => {
                if (event.target.value) {
                  prev.set("q", event.target.value);
                } else {
                  prev.delete("q");
                }
                return prev;
              });
            }}
            className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white py-2 pl-9 pr-4 text-sm transition-all placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando provas...</Card>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {paginated.map((prova) => {
            const status = STATUS_CONFIG[prova.status];

            return (
              <Card key={prova.id} hoverable className="group p-5" accent={status.accent} onClick={() => navigate(`/professor/provas/${prova.id}/revisar`)}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant="info">{prova.disciplina ?? "Sem disciplina"}</Badge>
                    </div>
                    <h3 className="mt-3 text-[16px] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>
                      {prova.titulo}
                    </h3>
                    <div className="mt-3 grid gap-2 text-[13px] text-[var(--color-neutral-500)] sm:grid-cols-3">
                      <span className="inline-flex items-center gap-1"><Users size={13} />{prova.turmaNome}</span>
                      <span className="inline-flex items-center gap-1"><FileText size={13} />{prova.totalQuestoes} questoes</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={13} />{formatDate(prova.createdAt)}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost">
                    Revisar
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Nenhuma prova encontrada para os filtros aplicados.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("TODAS");
              setTurmaFilter("Todas");
              setDisciplinaFilter("Todas");
              setSearchParams({});
            }}
            className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Limpar filtros
          </button>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((nextPage) => (
            <button
              key={nextPage}
              type="button"
              onClick={() => setPage(nextPage)}
              className={`h-8 w-8 rounded-[var(--border-radius)] text-sm transition-colors ${
                page === nextPage
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {nextPage}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
