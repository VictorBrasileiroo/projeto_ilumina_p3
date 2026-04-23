import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { ArrowRight, Award, CalendarDays, CheckCircle, Clock, FileText, Lock, Search } from 'lucide-react';

type ProvaStatus = 'disponivel' | 'realizada' | 'bloqueada';

interface Prova {
  id: number;
  titulo: string;
  disciplina: string;
  turma: string;
  prazo: string;
  questoes: number;
  status: ProvaStatus;
  nota?: number;
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const PER_PAGE = 4;

export default function Provas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [disciplinaFilter, setDisciplinaFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<ProvaStatus | 'todas'>('todas');
  const [page, setPage] = useState(1);

  const searchQuery = searchParams.get('q') ?? '';

  const provas: Prova[] = [
    { id: 1, titulo: 'Prova de Matemática - 1º Bimestre', disciplina: 'Matemática', turma: '9º A', prazo: '20/04/2026', questoes: 10, status: 'disponivel' },
    { id: 2, titulo: 'Avaliação de História - Roma Antiga', disciplina: 'História', turma: '9º A', prazo: '22/04/2026', questoes: 15, status: 'disponivel' },
    { id: 3, titulo: 'Avaliação de Ciências - Ecologia', disciplina: 'Ciências', turma: '9º A', prazo: '10/04/2026', questoes: 12, status: 'realizada', nota: 8.5 },
    { id: 4, titulo: 'Prova de Português - Gramática', disciplina: 'Português', turma: '9º A', prazo: '05/04/2026', questoes: 10, status: 'realizada', nota: 9.0 },
    { id: 5, titulo: 'Teste de Geografia - Clima', disciplina: 'Geografia', turma: '9º A', prazo: '28/04/2026', questoes: 8, status: 'bloqueada' },
  ];

  const statusConfig = {
    disponivel: {
      label: 'Disponível',
      variant: 'success' as const,
      icon: FileText,
      iconBg: 'bg-[var(--color-primary-darken-02)]',
      metricBg: 'bg-[var(--color-primary-surface)]',
      metricBorder: 'border-[var(--color-primary-lighten-02)]',
      metricLabel: 'Prazo final',
      helper: 'Pronta para iniciar agora',
      cardAccent: 'primary' as const,
    },
    realizada: {
      label: 'Realizada',
      variant: 'info' as const,
      icon: CheckCircle,
      iconBg: 'bg-[var(--color-success)]',
      metricBg: 'bg-[var(--color-success-surface)]',
      metricBorder: 'border-[var(--color-success-surface)]',
      metricLabel: 'Sua nota',
      helper: 'Confira seu desempenho detalhado',
      cardAccent: 'success' as const,
    },
    bloqueada: {
      label: 'Bloqueada',
      variant: 'neutral' as const,
      icon: Lock,
      iconBg: 'bg-[var(--color-neutral-300)]',
      metricBg: 'bg-[var(--color-neutral-50)]',
      metricBorder: 'border-[var(--color-neutral-100)]',
      metricLabel: 'Liberação',
      helper: 'Aguarde a liberação pelo professor',
      cardAccent: 'none' as const,
    },
  };

  const disponiveis = provas.filter((p) => p.status === 'disponivel');
  const realizadas = provas.filter((p) => p.status === 'realizada');
  const bloqueadas = provas.filter((p) => p.status === 'bloqueada');

  const proximaProva = [...disponiveis].sort(
    (a, b) => parseDate(a.prazo).getTime() - parseDate(b.prazo).getTime(),
  )[0];

  const mediaNotas = realizadas.length
    ? realizadas.reduce((sum, p) => sum + (p.nota ?? 0), 0) / realizadas.length
    : 0;

  const disciplinas = ['Todas', ...Array.from(new Set(provas.map((p) => p.disciplina)))];

  const filtered = provas.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.titulo.toLowerCase().includes(q) || p.disciplina.toLowerCase().includes(q);
    const matchesDisciplina = disciplinaFilter === 'Todas' || p.disciplina === disciplinaFilter;
    const matchesStatus = statusFilter === 'todas' || p.status === statusFilter;
    return matchesSearch && matchesDisciplina && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [searchQuery, disciplinaFilter, statusFilter]);

  const statusTabs: { key: ProvaStatus | 'todas'; label: string; count: number }[] = [
    { key: 'todas', label: 'Todas', count: provas.length },
    { key: 'disponivel', label: 'Disponíveis', count: disponiveis.length },
    { key: 'realizada', label: 'Realizadas', count: realizadas.length },
    { key: 'bloqueada', label: 'Bloqueadas', count: bloqueadas.length },
  ];

  const stats = [
    {
      label: 'Disponíveis',
      value: disponiveis.length,
      detail: proximaProva ? `Próxima em ${proximaProva.prazo}` : 'Nenhuma pendente',
      icon: FileText,
      bg: 'bg-[var(--color-primary-surface)]',
      color: 'text-[var(--color-primary)]',
      tooltip: 'Provas liberadas para responder agora',
    },
    {
      label: 'Realizadas',
      value: realizadas.length,
      detail: realizadas.length ? 'Resultados prontos para consulta' : 'Ainda sem histórico',
      icon: CheckCircle,
      bg: 'bg-[var(--color-success-surface)]',
      color: 'text-[var(--color-success)]',
      tooltip: 'Provas concluídas com gabarito disponível',
    },
    {
      label: 'Bloqueadas',
      value: bloqueadas.length,
      detail: 'Aguardando publicação',
      icon: Lock,
      bg: 'bg-[var(--color-neutral-100)]',
      color: 'text-[var(--color-neutral-500)]',
      tooltip: 'Cadastradas pelo professor, ainda não liberadas',
    },
    {
      label: 'Média Geral',
      value: realizadas.length ? mediaNotas.toFixed(1) : '--',
      detail: realizadas.length ? 'Desempenho nas concluídas' : 'Sem notas lançadas',
      icon: Award,
      bg: 'bg-[var(--color-warning-surface)]',
      color: 'text-[#6B5900]',
      tooltip: 'Média aritmética das suas notas nas provas realizadas',
    },
  ];

  const renderProva = (prova: Prova) => {
    const config = statusConfig[prova.status];
    const Icon = config.icon;

    return (
      <Card
        key={prova.id}
        accent={config.cardAccent}
        hoverable={prova.status !== 'bloqueada'}
        className="group overflow-hidden p-0"
      >
        <div className="h-1 w-full bg-[var(--color-secondary-yellow)]" />
        <div className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex h-11 w-11 shrink-0 cursor-default items-center justify-center rounded-[var(--border-radius-lg)] text-white ${config.iconBg}`}>
                    <Icon size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{config.label}</TooltipContent>
              </Tooltip>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-xs text-[var(--color-neutral-500)]">
                    {prova.disciplina}
                  </span>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-xs text-[var(--color-neutral-500)]">
                    Turma {prova.turma}
                  </span>
                </div>

                <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                  {prova.titulo}
                </h4>
                <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                  {config.helper}
                </p>
              </div>
            </div>

            <div className={`rounded-[var(--border-radius-lg)] border px-4 py-3 xl:min-w-[160px] ${config.metricBg} ${config.metricBorder}`}>
              <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 600 }}>
                {config.metricLabel}
              </p>
              {prova.status === 'realizada' && prova.nota !== undefined ? (
                <>
                  <p className="mt-1 text-[1.5rem] text-[var(--color-success)]" style={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {prova.nota.toFixed(1)}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">de 10,0</p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {prova.status === 'bloqueada' ? 'Em breve' : prova.prazo}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    {prova.status === 'bloqueada' ? 'Aguardando professor' : 'Organize seu tempo'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
              <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                <CalendarDays size={12} />
                {prova.status === 'realizada' ? 'Data de realização' : 'Prazo'}
              </div>
              <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                {prova.prazo}
              </p>
            </div>

            <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
              <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                <FileText size={12} />
                Estrutura
              </div>
              <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                {prova.questoes} questões
              </p>
            </div>

            <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
              <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                <Clock size={12} />
                Situação
              </div>
              <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                {prova.status === 'disponivel'
                  ? 'Responder no prazo'
                  : prova.status === 'realizada'
                    ? 'Resultado liberado'
                    : 'Aguardando liberação'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[var(--color-neutral-400)]">
              {prova.status === 'disponivel'
                ? 'Reserve um momento tranquilo para concluir sua avaliação.'
                : prova.status === 'realizada'
                  ? 'Revise seu gabarito para entender seus acertos e erros.'
                  : 'A prova aparecerá aqui assim que o professor liberar.'}
            </p>

            {prova.status === 'disponivel' && (
              <Link to={`/aluno/prova/${prova.id}`}>
                <Button size="sm">
                  Iniciar prova
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            )}

            {prova.status === 'realizada' && (
              <Link to={`/aluno/resultado/${prova.id}`}>
                <Button variant="ghost" size="sm">
                  Ver gabarito
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            )}

            {prova.status === 'bloqueada' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="outline" size="sm" disabled>
                      Aguardando liberação
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">O professor ainda não liberou esta prova</TooltipContent>
              </Tooltip>
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
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Visualize suas provas disponíveis e acompanhe seus resultados</p>
      </div>

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
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
              }`}
              style={{ fontWeight: 600 }}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                }`}
              >
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
            {disciplinas.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por título ou disciplina..."
            value={searchQuery}
            onChange={(e) => {
              setSearchParams((prev) => {
                if (e.target.value) prev.set('q', e.target.value);
                else prev.delete('q');
                return prev;
              });
            }}
            className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white py-2 pl-9 pr-4 text-sm transition-all placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
          />
        </div>
      </div>

      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {paginated.map(renderProva)}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Nenhuma prova encontrada para os filtros aplicados.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('todas');
              setDisciplinaFilter('Todas');
              setSearchParams({});
            }}
            className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
            style={{ fontWeight: 500 }}
          >
            Limpar filtros
          </button>
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
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
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
