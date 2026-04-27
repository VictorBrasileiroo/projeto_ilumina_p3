import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { alunoProvaService } from "../../services/alunoProvaService";
import { extractHttpErrorMessage } from "../../lib/http";
import { resultadoToNota } from "../../lib/mappings";
import type { AlunoProvaResumoResponse, ProvaAlunoResponse } from "../../types/prova";
import { ArrowRight, Award, CheckCircle, FileText, Search } from "lucide-react";

type ProvaStatus = "disponivel" | "realizada";
type ProvaView = ProvaAlunoResponse & { status: ProvaStatus };

const PER_PAGE = 4;

export default function Provas() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [disciplinaFilter, setDisciplinaFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<ProvaStatus | "todas">("todas");
  const [page, setPage] = useState(1);
  const [provas, setProvas] = useState<ProvaAlunoResponse[]>([]);
  const [resumo, setResumo] = useState<AlunoProvaResumoResponse | null>(null);
  const [mediaNormalizada, setMediaNormalizada] = useState<number | null>(null);
  const [notaPorProva, setNotaPorProva] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    let active = true;

    async function loadProvas() {
      setIsLoading(true);
      setError(null);

      try {
        const [provasData, resumoData] = await Promise.all([
          alunoProvaService.listar(),
          alunoProvaService.buscarResumo(),
        ]);

        if (!active) {
          return;
        }

        const resultados = await Promise.all(
          provasData
            .filter((prova) => prova.jaRespondeu)
            .map((prova) =>
              alunoProvaService.buscarResultado(prova.id)
                .then((resultado) => ({ provaId: prova.id, nota: resultadoToNota(resultado) }))
                .catch(() => null),
            ),
        );
        const resultadosValidos = resultados.filter((resultado): resultado is { provaId: string; nota: number } => resultado !== null);
        const notas = resultadosValidos.map((resultado) => resultado.nota);

        setProvas(provasData);
        setResumo(resumoData);
        setMediaNormalizada(notas.length ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length : null);
        setNotaPorProva(Object.fromEntries(resultadosValidos.map((resultado) => [resultado.provaId, resultado.nota])));
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

    loadProvas();

    return () => {
      active = false;
    };
  }, []);

  const provasView: ProvaView[] = useMemo(
    () => provas.map((prova) => ({ ...prova, status: prova.jaRespondeu ? "realizada" : "disponivel" })),
    [provas],
  );

  const disponiveis = provasView.filter((p) => p.status === "disponivel");
  const realizadas = provasView.filter((p) => p.status === "realizada");
  const disciplinas = ["Todas", ...Array.from(new Set(provasView.map((p) => p.disciplina ?? "Sem disciplina")))];

  const filtered = provasView.filter((p) => {
    const q = searchQuery.toLowerCase();
    const disciplina = p.disciplina ?? "Sem disciplina";
    const matchesSearch = !q || p.titulo.toLowerCase().includes(q) || disciplina.toLowerCase().includes(q);
    const matchesDisciplina = disciplinaFilter === "Todas" || disciplina === disciplinaFilter;
    const matchesStatus = statusFilter === "todas" || p.status === statusFilter;
    return matchesSearch && matchesDisciplina && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, disciplinaFilter, statusFilter]);

  const statusTabs: { key: ProvaStatus | "todas"; label: string; count: number }[] = [
    { key: "todas", label: "Todas", count: provasView.length },
    { key: "disponivel", label: "Disponiveis", count: disponiveis.length },
    { key: "realizada", label: "Realizadas", count: realizadas.length },
  ];

  const stats = [
    {
      label: "Disponiveis",
      value: isLoading ? "..." : disponiveis.length,
      detail: disponiveis.length ? "Liberadas para responder" : "Nenhuma pendente",
      icon: FileText,
      bg: "bg-[var(--color-primary-surface)]",
      color: "text-[var(--color-primary)]",
      tooltip: "Provas liberadas para responder agora",
    },
    {
      label: "Realizadas",
      value: isLoading ? "..." : realizadas.length,
      detail: realizadas.length ? "Resultados prontos para consulta" : "Ainda sem historico",
      icon: CheckCircle,
      bg: "bg-[var(--color-success-surface)]",
      color: "text-[var(--color-success)]",
      tooltip: "Provas concluidas com gabarito disponivel",
    },
    {
      label: "Pendentes",
      value: isLoading ? "..." : resumo?.totalPendentes ?? disponiveis.length,
      detail: "Segundo o resumo do aluno",
      icon: FileText,
      bg: "bg-[var(--color-info-surface)]",
      color: "text-[var(--color-primary)]",
      tooltip: "Total de provas ainda nao respondidas",
    },
    {
      label: "Media Geral",
      value: isLoading ? "..." : mediaNormalizada == null ? "--" : mediaNormalizada.toFixed(1),
      detail: mediaNormalizada == null ? "Sem notas lancadas" : "Calculada pelos acertos",
      icon: Award,
      bg: "bg-[var(--color-warning-surface)]",
      color: "text-[#6B5900]",
      tooltip: "Media das notas persistidas pelo backend",
    },
  ];

  const renderProva = (prova: ProvaView) => {
    const isRealizada = prova.status === "realizada";
    const Icon = isRealizada ? CheckCircle : FileText;
    const nota = notaPorProva[prova.id];

    return (
      <Card
        key={prova.id}
        accent={isRealizada ? "success" : "primary"}
        hoverable
        className="group overflow-hidden p-0"
        onClick={() => navigate(isRealizada ? `/aluno/resultado/${prova.id}` : `/aluno/prova/${prova.id}`)}
      >
        <div className="h-1 w-full bg-[var(--color-secondary-yellow)]" />
        <div className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex h-11 w-11 shrink-0 cursor-default items-center justify-center rounded-[var(--border-radius-lg)] text-white ${isRealizada ? "bg-[var(--color-success)]" : "bg-[var(--color-primary-darken-02)]"}`}>
                    <Icon size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{isRealizada ? "Realizada" : "Disponivel"}</TooltipContent>
              </Tooltip>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isRealizada ? "info" : "success"}>{isRealizada ? "Realizada" : "Disponivel"}</Badge>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-xs text-[var(--color-neutral-500)]">
                    {prova.disciplina ?? "Sem disciplina"}
                  </span>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-xs text-[var(--color-neutral-500)]">
                    Turma {prova.turmaNome}
                  </span>
                </div>

                <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                  {prova.titulo}
                </h4>
                <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                  {isRealizada ? "Confira seu desempenho detalhado." : "Pronta para iniciar agora."}
                </p>
              </div>
            </div>

            <div className={`rounded-[var(--border-radius-lg)] border px-4 py-3 xl:min-w-[160px] ${isRealizada ? "border-[var(--color-success-surface)] bg-[var(--color-success-surface)]" : "border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)]"}`}>
              <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 600 }}>
                {isRealizada ? "Sua nota" : "Estrutura"}
              </p>
              {isRealizada && nota !== undefined ? (
                <>
                  <p className="mt-1 text-[1.5rem] text-[var(--color-success)]" style={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {nota.toFixed(1)}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">de 10,0</p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {prova.totalQuestoes} questoes
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">{prova.turmaNome}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[var(--color-neutral-400)]">
              {isRealizada ? "Revise seu gabarito para entender seus acertos e erros." : "Reserve um momento tranquilo para concluir sua avaliacao."}
            </p>

            {isRealizada ? (
              <Link to={`/aluno/resultado/${prova.id}`} onClick={(event) => event.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  Ver gabarito
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            ) : (
              <Link to={`/aluno/prova/${prova.id}`} onClick={(event) => event.stopPropagation()}>
                <Button size="sm">
                  Iniciar prova
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Provas</h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Visualize suas provas disponiveis e acompanhe seus resultados</p>
      </div>

      {error && (
        <Card className="p-4" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
          {statusTabs.map((tab) => (
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

          <select
            value={disciplinaFilter}
            onChange={(e) => setDisciplinaFilter(e.target.value)}
            className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
            style={{ fontWeight: 500 }}
          >
            {disciplinas.map((disciplina) => (
              <option key={disciplina}>{disciplina}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por titulo ou disciplina..."
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
          <p className="text-sm text-[var(--color-neutral-400)]">Carregando provas...</p>
        </Card>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {paginated.map(renderProva)}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">
            {provas.length ? "Nenhuma prova encontrada para os filtros aplicados." : "Voce ainda nao esta matriculado em uma turma com provas publicadas."}
          </p>
          {provas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("todas");
                setDisciplinaFilter("Todas");
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
