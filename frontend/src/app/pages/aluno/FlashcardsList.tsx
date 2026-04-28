import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { alunoColecaoService } from "../../services/alunoColecaoService";
import { extractHttpErrorMessage } from "../../lib/http";
import {
  getAllFlashcardProgress,
  getFlashcardProgressPercent,
  isFlashcardCollectionCompleted,
  type FlashcardProgress,
} from "../../lib/flashcardProgress";
import type { ColecaoAlunoResponse } from "../../types/flashcard";
import { ArrowRight, BookOpen, GraduationCap, Layers, Search, Sparkles } from "lucide-react";

const PER_PAGE = 6;

export default function FlashcardsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [temaFilter, setTemaFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [colecoes, setColecoes] = useState<ColecaoAlunoResponse[]>([]);
  const [progressByColecao, setProgressByColecao] = useState<Record<string, FlashcardProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    let active = true;

    async function loadColecoes() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await alunoColecaoService.listar();

        if (active) {
          setColecoes(data);
          setProgressByColecao(getAllFlashcardProgress());
        }
      } catch (nextError) {
        if (active) {
          setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar as colecoes."));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadColecoes();

    return () => {
      active = false;
    };
  }, []);

  const totalCards = colecoes.reduce((sum, c) => sum + c.totalFlashcards, 0);
  const totalVistos = colecoes.reduce((sum, c) => {
    const progress = progressByColecao[c.id] ?? null;
    return sum + Math.min(c.totalFlashcards, progress ? progress.maxSeenIndex + 1 : 0);
  }, 0);
  const concluidas = colecoes.filter((c) => isFlashcardCollectionCompleted(progressByColecao[c.id] ?? null, c.totalFlashcards)).length;
  const temas = ["Todos", ...Array.from(new Set(colecoes.map((c) => c.tema ?? "Sem tema")))];

  const filtered = colecoes.filter((c) => {
    const q = searchQuery.toLowerCase();
    const tema = c.tema ?? "Sem tema";
    const matchesSearch = !q || c.titulo.toLowerCase().includes(q) || tema.toLowerCase().includes(q);
    const matchesTema = temaFilter === "Todos" || tema === temaFilter;
    return matchesSearch && matchesTema;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, temaFilter]);

  const summaryStats = [
    {
      label: "Colecoes",
      value: isLoading ? "..." : colecoes.length,
      detail: "Disponiveis para estudo",
      icon: Layers,
      bg: "bg-[var(--color-primary-surface)]",
      color: "text-[var(--color-primary)]",
      tooltip: "Total de colecoes disponibilizadas pelos professores",
    },
    {
      label: "Flashcards",
      value: isLoading ? "..." : `${totalVistos}/${totalCards}`,
      detail: "Vistos neste navegador",
      icon: BookOpen,
      bg: "bg-[var(--color-success-surface)]",
      color: "text-[var(--color-success)]",
      tooltip: "Total de cards disponiveis nas suas colecoes",
    },
    {
      label: "Temas",
      value: isLoading ? "..." : Math.max(0, temas.length - 1),
      detail: "Assuntos disponiveis",
      icon: Sparkles,
      bg: "bg-[var(--color-info-surface)]",
      color: "text-[var(--color-primary)]",
      tooltip: "Quantidade de temas diferentes para estudo",
    },
    {
      label: "Concluidas",
      value: isLoading ? "..." : concluidas,
      detail: "Finalizadas localmente",
      icon: Sparkles,
      bg: "bg-[var(--color-warning-surface)]",
      color: "text-[#6B5900]",
      tooltip: "Progresso salvo neste navegador",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Flashcards</h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Colecoes de estudo disponibilizadas pelos seus professores</p>
      </div>

      {error && (
        <Card className="p-4" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-400)]">{stat.detail}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`cursor-default rounded-[var(--border-radius-lg)] p-2.5 ${stat.bg}`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">{stat.tooltip}</TooltipContent>
                </Tooltip>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={temaFilter}
            onChange={(e) => setTemaFilter(e.target.value)}
            className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
            style={{ fontWeight: 500 }}
          >
            {temas.map((tema) => (
              <option key={tema}>{tema}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por titulo ou tema..."
            value={searchQuery}
            onChange={(e) => {
              setSearchParams((prev) => {
                if (e.target.value) prev.set("q", e.target.value);
                else prev.delete("q");
                return prev;
              });
            }}
            className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white py-2 pl-9 pr-4 text-sm transition-all placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Carregando colecoes...</p>
        </Card>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((colecao) => {
            const progress = progressByColecao[colecao.id] ?? null;
            const percent = getFlashcardProgressPercent(progress, colecao.totalFlashcards);
            const completed = isFlashcardCollectionCompleted(progress, colecao.totalFlashcards);
            const actionLabel = completed ? "Revisar" : percent > 0 ? "Continuar" : "Estudar";

            return (
              <Card
              key={colecao.id}
              hoverable
              className="group overflow-hidden p-0"
              onClick={() => navigate(`/aluno/flashcards/${colecao.id}`)}
            >
              <div className="relative overflow-hidden px-5 pb-4 pt-5" style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-neutral-700) 100%)" }}>
                <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-white shadow-[var(--shadow-sm)] backdrop-blur-sm">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/70">Colecao</p>
                      <h4 className="truncate text-[16px] text-white" style={{ fontWeight: 700 }}>{colecao.titulo}</h4>
                      <p className="mt-0.5 truncate text-[13px] text-white/80">Disponivel para estudo</p>
                    </div>
                  </div>

                  <div className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/85">
                    {percent > 0 ? `${percent}%` : `${colecao.totalFlashcards} cards`}
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" size="sm">{colecao.tema ?? "Sem tema"}</Badge>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/85">
                    {colecao.turmaNome}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                    <GraduationCap size={12} />
                    Turma
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {colecao.turmaNome}
                  </p>
                </div>

                <div className="mt-3 rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                    <Layers size={12} />
                    Estrutura
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {colecao.totalFlashcards} cards
                  </p>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[13px] text-[var(--color-neutral-500)]">
                    <span>{completed ? "Concluida" : percent > 0 ? "Progresso local" : "Nao iniciada"}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-neutral-100)]">
                    <div
                      className={`h-2 rounded-full transition-all ${completed ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] text-[var(--color-neutral-400)]">
                    {completed ? "Colecao finalizada neste navegador." : percent > 0 ? "Continue de onde parou." : "Comece esta colecao quando quiser estudar."}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/aluno/flashcards/${colecao.id}`);
                    }}
                    className="inline-flex self-start items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-3 py-2 text-sm text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-lighten-02)] sm:self-auto"
                    style={{ fontWeight: 600 }}
                  >
                    {actionLabel}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">
            {colecoes.length ? "Nenhuma colecao encontrada para os filtros aplicados." : "Voce ainda nao esta matriculado em uma turma com colecoes publicadas."}
          </p>
          {colecoes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setTemaFilter("Todos");
                setSearchParams({});
              }}
              className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
              style={{ fontWeight: 500 }}
            >
              Limpar filtros
            </button>
          )}
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-[var(--border-radius)] text-sm transition-colors ${
                page === p
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
