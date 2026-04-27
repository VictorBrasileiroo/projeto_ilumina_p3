import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { alunoColecaoService } from "../../services/alunoColecaoService";
import { alunoProvaService } from "../../services/alunoProvaService";
import { useAuth } from "../../hooks/useAuth";
import { extractHttpErrorMessage } from "../../lib/http";
import { resultadoToNota } from "../../lib/mappings";
import {
  getAllFlashcardProgress,
  getFlashcardProgressPercent,
  isFlashcardCollectionCompleted,
  type FlashcardProgress,
} from "../../lib/flashcardProgress";
import type { AlunoProvaResumoResponse, ProvaAlunoResponse, ResultadoProvaResponse } from "../../types/prova";
import type { ColecaoAlunoResponse } from "../../types/flashcard";
import { ArrowRight, Award, BookOpen, CheckCircle, FileText, Layers, Sparkles } from "lucide-react";

interface ResultadoRecente {
  prova: ProvaAlunoResponse;
  resultado: ResultadoProvaResponse;
  nota: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provas, setProvas] = useState<ProvaAlunoResponse[]>([]);
  const [colecoes, setColecoes] = useState<ColecaoAlunoResponse[]>([]);
  const [resumo, setResumo] = useState<AlunoProvaResumoResponse | null>(null);
  const [mediaNormalizada, setMediaNormalizada] = useState<number | null>(null);
  const [resultadosRecentes, setResultadosRecentes] = useState<ResultadoRecente[]>([]);
  const [flashcardProgress, setFlashcardProgress] = useState<Record<string, FlashcardProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [provasData, colecoesData, resumoData] = await Promise.all([
          alunoProvaService.listar(),
          alunoColecaoService.listar(),
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
                .then((resultado) => ({ prova, resultado, nota: resultadoToNota(resultado) }))
                .catch(() => null),
            ),
        );
        const resultadosValidos = resultados.filter((item): item is ResultadoRecente => item !== null);
        const notas = resultadosValidos.map((item) => item.nota);

        setProvas(provasData);
        setColecoes(colecoesData);
        setResumo(resumoData);
        setMediaNormalizada(notas.length ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length : null);
        setResultadosRecentes(resultadosValidos);
        setFlashcardProgress(getAllFlashcardProgress());
      } catch (nextError) {
        if (active) {
          setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar o painel do aluno."));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const provasDisponiveis = useMemo(() => provas.filter((prova) => !prova.jaRespondeu), [provas]);
  const provasRealizadas = useMemo(() => provas.filter((prova) => prova.jaRespondeu), [provas]);
  const primeirasProvas = provasDisponiveis.slice(0, 2);
  const primeirasColecoes = useMemo(() => {
    return [...colecoes]
      .sort((left, right) => {
        const leftProgress = flashcardProgress[left.id] ?? null;
        const rightProgress = flashcardProgress[right.id] ?? null;
        const leftCompleted = isFlashcardCollectionCompleted(leftProgress, left.totalFlashcards);
        const rightCompleted = isFlashcardCollectionCompleted(rightProgress, right.totalFlashcards);

        if (leftCompleted !== rightCompleted) {
          return leftCompleted ? 1 : -1;
        }

        return getFlashcardProgressPercent(rightProgress, right.totalFlashcards)
          - getFlashcardProgressPercent(leftProgress, left.totalFlashcards);
      })
      .slice(0, 2);
  }, [colecoes, flashcardProgress]);

  const mediaGeral = mediaNormalizada;

  return (
    <div className="space-y-6">
      <div>
        <h1>Ola, {user?.name ?? "aluno"}!</h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Acompanhe suas provas, estudos e resultados em um so lugar</p>
      </div>

      {error && (
        <Card className="p-4" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Provas Disponiveis",
            value: isLoading ? "..." : provasDisponiveis.length,
            detail: provasDisponiveis.length ? "Avaliacoes abertas para responder" : "Sem pendencias",
            icon: FileText,
            bg: "bg-[var(--color-primary-surface)]",
            color: "text-[var(--color-primary)]",
          },
          {
            label: "Provas Realizadas",
            value: isLoading ? "..." : provasRealizadas.length,
            detail: "Resultados ja disponiveis",
            icon: CheckCircle,
            bg: "bg-[var(--color-success-surface)]",
            color: "text-[var(--color-success)]",
          },
          {
            label: "Media Geral",
            value: isLoading ? "..." : mediaGeral === null ? "--" : mediaGeral.toFixed(1),
            detail: mediaGeral === null ? "Sem notas registradas" : "Calculada pelos acertos",
            icon: Award,
            bg: "bg-[var(--color-warning-surface)]",
            color: "text-[#6B5900]",
          },
          {
            label: "Colecoes de Estudo",
            value: isLoading ? "..." : colecoes.length,
            detail: "Materiais liberados pelos professores",
            icon: Sparkles,
            bg: "bg-[var(--color-info-surface)]",
            color: "text-[var(--color-primary)]",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] uppercase tracking-wider text-[var(--color-neutral-500)]" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">{stat.detail}</p>
                </div>
                <div className={`rounded-[var(--border-radius-lg)] p-2.5 ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-[15px]">Provas Disponiveis</h3>
              <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Avaliacoes abertas para voce priorizar agora</p>
            </div>
            <Link to="/aluno/provas" className="flex items-center gap-1 text-[13px] text-[var(--color-primary)] hover:underline" style={{ fontWeight: 500 }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-5">
                <p className="text-sm text-[var(--color-neutral-400)]">Carregando provas...</p>
              </Card>
            ) : primeirasProvas.length ? (
              primeirasProvas.map((prova) => (
                <Card
                  key={prova.id}
                  accent="primary"
                  hoverable
                  className="group overflow-hidden p-0"
                  onClick={() => navigate(`/aluno/prova/${prova.id}`)}
                >
                  <div className="h-1 w-full bg-[var(--color-secondary-yellow)]" />
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-primary-darken-02)] text-white">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="success">Disponivel</Badge>
                            <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-[11px] text-[var(--color-neutral-500)]">
                              {prova.disciplina ?? "Sem disciplina"}
                            </span>
                          </div>

                          <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                            {prova.titulo}
                          </h4>
                          <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                            {prova.totalQuestoes} questoes liberadas para a turma {prova.turmaNome}.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] px-4 py-3 lg:min-w-[150px]">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--color-primary)]" style={{ fontWeight: 600 }}>
                          Estrutura
                        </p>
                        <p className="mt-1 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                          {prova.totalQuestoes} questoes
                        </p>
                        <p className="text-[11px] text-[var(--color-primary)]">{prova.turmaNome}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2 text-[12px] text-[var(--color-neutral-400)]">
                        <span className="inline-flex items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1">
                          <Layers size={11} />
                          Turma {prova.turmaNome}
                        </span>
                      </div>

                      <Link to={`/aluno/prova/${prova.id}`} onClick={(event) => event.stopPropagation()}>
                        <Button size="sm">
                          Iniciar prova
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="min-h-[270px] p-6" accent="success">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)] text-[var(--color-success)]">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        Tudo em dia por aqui
                      </h4>
                      <p className="mt-1 max-w-xl text-sm text-[var(--color-neutral-500)]">
                        Voce nao tem provas pendentes no momento. Quando uma avaliacao for publicada para sua turma, ela aparece nesta area.
                      </p>
                    </div>
                  </div>

                  <Link to="/aluno/provas">
                    <Button variant="outline" size="sm">
                      {provasRealizadas.length ? "Ver resultados" : "Ver provas"}
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 border-t border-[var(--color-neutral-100)] pt-5 sm:grid-cols-2">
                  <Link
                    to="/aluno/provas"
                    className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4 transition-colors hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-[var(--border-radius)] bg-[var(--color-success-surface)] p-2 text-[var(--color-success)]">
                        <Award size={16} />
                      </div>
                      <div>
                        <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                          Revisar desempenho
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                          Veja gabaritos e notas das provas ja concluidas.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/aluno/flashcards"
                    className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4 transition-colors hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] p-2 text-[var(--color-primary)]">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                          Manter o ritmo
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                          Continue as colecoes enquanto aguarda novas avaliacoes.
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-[15px]">Ritmo de Estudo</h3>
              <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Colecoes disponiveis para estudar</p>
            </div>
            <Link to="/aluno/flashcards" className="flex items-center gap-1 text-[13px] text-[var(--color-primary)] hover:underline" style={{ fontWeight: 500 }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-5">
                <p className="text-sm text-[var(--color-neutral-400)]">Carregando colecoes...</p>
              </Card>
            ) : primeirasColecoes.length ? (
              primeirasColecoes.map((colecao) => {
                const progress = flashcardProgress[colecao.id] ?? null;
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
                  <div
                    className="relative overflow-hidden px-5 pb-4 pt-5"
                    style={{ background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-neutral-700) 100%)" }}
                  >
                    <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-white">
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Flashcards</p>
                          <h4 className="truncate text-[15px] text-white" style={{ fontWeight: 700 }}>
                            {colecao.titulo}
                          </h4>
                          <p className="mt-0.5 truncate text-[12px] text-white/80">{colecao.tema ?? "Sem tema"}</p>
                        </div>
                      </div>

                      <div className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                        {percent > 0 ? `${percent}%` : `${colecao.totalFlashcards} cards`}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                        <Sparkles size={11} />
                        Turma
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                        {colecao.turmaNome}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[12px] text-[var(--color-neutral-500)]">
                        <span>{completed ? "Colecao concluida" : percent > 0 ? "Progresso local" : "Ainda nao iniciada"}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-neutral-100)]">
                        <div
                          className={`h-2 rounded-full transition-all ${completed ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-4">
                      <p className="text-[12px] text-[var(--color-neutral-400)]">
                        {completed ? "Disponivel para revisao" : percent > 0 ? "Retome de onde parou neste navegador" : "Colecao pronta para estudar"}
                      </p>
                      <Link to={`/aluno/flashcards/${colecao.id}`} onClick={(event) => event.stopPropagation()}>
                        <Button size="sm" variant={completed ? "ghost" : "primary"}>{actionLabel}</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
                );
              })
            ) : (
              <Card className="p-5">
                <p className="text-sm text-[var(--color-neutral-400)]">Voce ainda nao tem colecoes disponiveis.</p>
              </Card>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[15px]">Resultados Recentes</h3>
            <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Revise seu desempenho nas avaliacoes concluidas</p>
          </div>
          <Link to="/aluno/provas" className="flex items-center gap-1 text-[13px] text-[var(--color-primary)] hover:underline" style={{ fontWeight: 500 }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <Card>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {isLoading ? (
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-neutral-400)]">Carregando resultados...</p>
              </div>
            ) : resultadosRecentes.length ? (
              resultadosRecentes.slice(0, 3).map(({ prova, resultado, nota }) => (
                <div key={prova.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-neutral-50)] sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info" size="sm">Resultado</Badge>
                      <span className="text-[12px] text-[var(--color-neutral-400)]">{prova.disciplina ?? "Sem disciplina"}</span>
                    </div>
                    <h4 className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {prova.titulo}
                    </h4>
                    <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">{prova.turmaNome}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)] px-4 py-3 text-right">
                      <div className="text-[1.35rem] text-[var(--color-success)]" style={{ fontWeight: 700, lineHeight: 1.05 }}>
                        {nota.toFixed(1)}
                      </div>
                      <div className="text-[11px] text-[var(--color-secondary-green-dark)]">
                        {resultado.totalAcertos}/{resultado.totalQuestoes} acertos
                      </div>
                    </div>
                    <Link to={`/aluno/resultado/${prova.id}`}>
                      <Button variant="ghost" size="sm">Ver gabarito</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-neutral-400)]">Voce ainda nao concluiu nenhuma prova.</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
