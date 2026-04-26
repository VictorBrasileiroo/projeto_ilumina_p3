import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { extractHttpErrorMessage } from '../../lib/http';
import { colecaoService } from '../../services/colecaoService';
import { provaService } from '../../services/provaService';
import { turmaService } from '../../services/turmaService';
import type { ColecaoResponse } from '../../types/flashcard';
import type { ProvaResponse } from '../../types/prova';
import type { Ensino, TurmaResponse } from '../../types/school';

const ENSINO_LABELS: Record<Ensino, string> = {
  INFANTIL: 'Infantil',
  FUNDAMENTAL: 'Fundamental',
  MEDIO: 'Ensino Médio',
  SUPERIOR: 'Superior',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TurmaResponse[]>([]);
  const [provas, setProvas] = useState<ProvaResponse[]>([]);
  const [colecoes, setColecoes] = useState<ColecaoResponse[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [turmaResult, provaResult, colecaoResult] = await Promise.allSettled([
          turmaService.list(),
          provaService.listar(),
          colecaoService.listar(),
        ]);

        const nextTurmas = turmaResult.status === "fulfilled" ? turmaResult.value : [];
        const nextProvas = provaResult.status === "fulfilled" ? provaResult.value : [];
        const nextColecoes = colecaoResult.status === "fulfilled" ? colecaoResult.value : [];

        if (active) {
          setTurmas(nextTurmas);
          setProvas(nextProvas);
          setColecoes(nextColecoes);

          if (turmaResult.status === "rejected") {
            setError(extractHttpErrorMessage(turmaResult.reason, 'Nao foi possivel carregar as turmas.'));
          } else if (provaResult.status === "rejected") {
            setError(extractHttpErrorMessage(provaResult.reason, 'Nao foi possivel carregar as provas.'));
          } else if (colecaoResult.status === "rejected") {
            setError(extractHttpErrorMessage(colecaoResult.reason, 'Nao foi possivel carregar as colecoes.'));
          }
        }

        const countResults = await Promise.allSettled(
          nextTurmas.map(async (turma) => {
            const alunos = await turmaService.listStudents(turma.id);
            return [turma.id, alunos.length] as const;
          }),
        );

        if (active) {
          const countEntries = countResults
            .filter((result): result is PromiseFulfilledResult<readonly [string, number]> => result.status === "fulfilled")
            .map((result) => result.value);
          setStudentCounts(Object.fromEntries(countEntries));
        }
      } catch (nextError) {
        if (active) {
          setError(extractHttpErrorMessage(nextError, 'Nao foi possivel carregar o painel.'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const totalStudents = useMemo(
    () => Object.values(studentCounts).reduce((total, value) => total + value, 0),
    [studentCounts],
  );

  const recentProvas = useMemo(
    () => [...provas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
    [provas],
  );

  const recentColecoes = useMemo(
    () => [...colecoes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
    [colecoes],
  );

  function countColecoesByTurmaName(turmaNome: string) {
    return colecoes.filter((colecao) => colecao.turmaNome === turmaNome).length;
  }

  const stats = [
    { label: 'Turmas Ativas', value: isLoading ? '...' : String(turmas.length), icon: Users, bg: 'bg-[var(--color-primary-surface)]', color: 'text-[var(--color-primary)]', change: 'cadastradas' },
    { label: 'Provas Criadas', value: isLoading ? '...' : String(provas.length), icon: FileText, bg: 'bg-[var(--color-success-surface)]', color: 'text-[var(--color-success)]', change: 'cadastradas' },
    { label: 'Coleções de Flashcards', value: isLoading ? '...' : String(colecoes.length), icon: BookOpen, bg: 'bg-[var(--color-warning-surface)]', color: 'text-[#6B5900]', change: 'cadastradas' },
    { label: 'Total de Alunos', value: isLoading ? '...' : String(totalStudents), icon: TrendingUp, bg: 'bg-[var(--color-info-surface)]', color: 'text-[var(--color-primary)]', change: 'matriculados' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Painel do Professor</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Visão geral das suas turmas, provas e materiais de estudo</p>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-[var(--color-neutral-500)] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">{stat.change}</p>
                </div>
                <div className={`rounded-[var(--border-radius-lg)] p-2.5 ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-[15px]">Provas Recentes</h3>
              <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Avaliações mais recentes no seu fluxo de trabalho</p>
            </div>
            <Link to="/professor/provas/criar" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
              Criar nova <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-5 text-sm text-[var(--color-neutral-500)]">Carregando provas...</Card>
            ) : recentProvas.length === 0 ? (
              <Card className="p-5" accent="primary">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      Nenhuma prova criada ainda
                    </h4>
                    <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                      Crie uma avaliação para começar o fluxo de revisão e publicação.
                    </p>
                  </div>
                </div>
              </Card>
            ) : recentProvas.map((prova) => (
              <Card
                key={prova.id}
                hoverable
                className="group p-5"
                accent={prova.status === 'PUBLICADA' ? 'success' : 'warning'}
                onClick={() => navigate(`/professor/provas/${prova.id}/revisar`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={prova.status === 'PUBLICADA' ? 'success' : 'warning'} size="sm">
                        {prova.status === 'PUBLICADA' ? 'Publicada' : 'Rascunho'}
                      </Badge>
                      <Badge variant="info" size="sm">{prova.disciplina ?? 'Sem disciplina'}</Badge>
                    </div>
                    <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {prova.titulo}
                    </h4>
                    <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                      {prova.turmaNome} · {prova.totalQuestoes} questões
                    </p>
                  </div>
                  <Link to={`/professor/provas/${prova.id}/revisar`}>
                    <Button size="sm" variant="ghost">
                      Abrir
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4 mt-14">
          <Card className="p-5" accent="primary">
            <h3 className="text-[15px]">Ações Rápidas</h3>
            <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">Atalhos para as tarefas mais frequentes do seu fluxo</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/professor/provas/criar">
                <Button variant="primary" size="sm" fullWidth>
                  <Plus size={14} />
                  Criar Prova
                </Button>
              </Link>
              <Link to="/professor/flashcards">
                <Button variant="secondary" size="sm" fullWidth>
                  <BookOpen size={14} />
                  Nova Coleção
                </Button>
              </Link>
              <Link to="/professor/turmas">
                <Button variant="outline" size="sm" fullWidth>
                  <Users size={14} />
                  Gerenciar Turmas
                </Button>
              </Link>
            </div>
          </Card>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-[15px]">Turmas em Destaque</h3>
                <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Acesso rápido às turmas com mais atividade</p>
              </div>
              <Link to="/professor/turmas" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {turmas.slice(0, 2).map((turma) => (
                <Card key={turma.id} hoverable className="group p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px]" style={{ fontWeight: 700 }}>{turma.nome}</h4>
                        <Badge variant={turma.ensino === 'MEDIO' ? 'success' : 'info'} size="sm">
                          {ENSINO_LABELS[turma.ensino]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                        {studentCounts[turma.id] ?? 0} alunos · {provas.filter((prova) => prova.turmaId === turma.id && prova.status === 'PUBLICADA').length} provas ativas
                      </p>
                    </div>
                    <div className="rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-2.5 py-1 text-[11px] text-[var(--color-primary)]">
                      {countColecoesByTurmaName(turma.nome)} coleções
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-4">
                    <p className="text-[12px] text-[var(--color-neutral-400)]">Abra a turma para acompanhar provas e materiais.</p>
                    <Link to={`/professor/turmas/${turma.id}`}>
                      <Button size="sm" variant="ghost">
                        Abrir
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[15px]">Coleções Recentes</h3>
            <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Últimas coleções criadas para reforçar o estudo das turmas</p>
          </div>
          <Link to="/professor/flashcards" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver coleções <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <Card className="p-5 text-sm text-[var(--color-neutral-500)]">Carregando coleções...</Card>
          ) : recentColecoes.length === 0 ? (
            <Card className="p-5" accent="warning">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)] text-[#6B5900]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    Nenhuma coleção criada ainda
                  </h4>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                    As últimas coleções aparecerão aqui quando forem criadas.
                  </p>
                </div>
              </div>
            </Card>
          ) : recentColecoes.map((colecao) => (
            <Card
              key={colecao.id}
              hoverable
              className="group overflow-hidden p-0"
              onClick={() => navigate(`/professor/flashcards/${colecao.id}`)}
            >
              <div
                className="relative overflow-hidden px-5 pb-5 pt-5"
                style={{
                  background: colecao.status === 'PUBLICADA'
                    ? 'linear-gradient(135deg, #04712C 0%, #0E8F3F 50%, var(--color-primary) 100%)'
                    : 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                }}
              >
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 h-1 w-28 bg-[var(--color-secondary-yellow)]" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-white shadow-[var(--shadow-sm)] backdrop-blur-sm">
                      <BookOpen size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Flashcards</p>
                      <h4 className="truncate text-[17px] text-white" style={{ fontWeight: 700 }}>{colecao.titulo}</h4>
                      <p className="mt-1 truncate text-[13px] text-white/85">Turma {colecao.turmaNome}</p>
                    </div>
                  </div>
                  <Badge variant={colecao.status === 'PUBLICADA' ? 'success' : 'warning'} size="sm">
                    {colecao.status === 'PUBLICADA' ? 'Publicada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
                    <div className="flex items-center gap-1 text-[12px] text-[var(--color-neutral-400)]">
                      <BookOpen size={12} />
                      Cards
                    </div>
                    <p className="mt-2 text-[15px] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>
                      {colecao.totalFlashcards}
                    </p>
                  </div>
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-success-surface)] bg-[var(--color-success-surface)] p-4">
                    <div className="flex items-center gap-1 text-[12px] text-[var(--color-secondary-green-dark)]">
                      <Users size={12} />
                      Status
                    </div>
                    <p className="mt-2 text-[15px] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>
                      {colecao.status === 'PUBLICADA' ? 'Publicada' : 'Rascunho'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-4">
                  <p className="text-[13px] text-[var(--color-neutral-400)]">
                    {colecao.status === 'PUBLICADA' ? 'Coleção já compartilhada com a turma.' : 'Coleção ainda em preparação.'}
                  </p>
                  <Link to={`/professor/flashcards/${colecao.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] text-[14px] hover:underline" style={{ fontWeight: 600 }}>
                    Ver
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
