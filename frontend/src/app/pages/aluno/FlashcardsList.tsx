import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { ArrowRight, BookOpen, CheckCircle, Clock, GraduationCap, Layers, Search, Sparkles } from 'lucide-react';

interface Colecao {
  id: number;
  titulo: string;
  tema: string;
  professor: string;
  cards: number;
  estudados: number;
  ultimoEstudo: string | null;
}

type StatusKey = 'todos' | 'novo' | 'em_progresso' | 'concluido';

const PER_PAGE = 6;

export default function FlashcardsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [temaFilter, setTemaFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('todos');
  const [page, setPage] = useState(1);

  const searchQuery = searchParams.get('q') ?? '';

  const colecoes: Colecao[] = [
    { id: 1, titulo: 'Verbos em Inglês - Básico', tema: 'Inglês', professor: 'Prof. Maria Silva', cards: 20, estudados: 15, ultimoEstudo: '12/04/2026' },
    { id: 2, titulo: 'Fórmulas de Física - Mecânica', tema: 'Física', professor: 'Prof. Carlos Souza', cards: 15, estudados: 8, ultimoEstudo: '10/04/2026' },
    { id: 3, titulo: 'Tabela Periódica - Elementos', tema: 'Química', professor: 'Prof. Ana Costa', cards: 30, estudados: 0, ultimoEstudo: null },
    { id: 4, titulo: 'Datas Históricas - Brasil Colônia', tema: 'História', professor: 'Prof. Maria Silva', cards: 18, estudados: 18, ultimoEstudo: '08/04/2026' },
    { id: 5, titulo: 'Vocabulário Espanhol - Básico', tema: 'Espanhol', professor: 'Prof. Lucia Fernandez', cards: 25, estudados: 5, ultimoEstudo: '11/04/2026' },
  ];

  const totalCards = colecoes.reduce((sum, c) => sum + c.cards, 0);
  const totalEstudados = colecoes.reduce((sum, c) => sum + c.estudados, 0);
  const concluidas = colecoes.filter((c) => c.estudados === c.cards).length;
  const emProgresso = colecoes.filter((c) => c.estudados > 0 && c.estudados < c.cards).length;

  const getStatusKey = (c: Colecao): StatusKey => {
    if (c.estudados === c.cards && c.cards > 0) return 'concluido';
    if (c.estudados > 0) return 'em_progresso';
    return 'novo';
  };

  const getStatus = (colecao: Colecao) => {
    if (colecao.estudados === colecao.cards && colecao.cards > 0) {
      return {
        label: 'Concluído',
        badge: 'success' as const,
        accent: 'success' as const,
        headerBg: 'linear-gradient(135deg, var(--color-secondary-green-dark) 0%, var(--color-secondary-green) 55%, var(--color-primary) 100%)',
        progressColor: 'bg-[var(--color-success)]',
        metricBg: 'bg-[var(--color-success-surface)]',
        metricText: 'text-[var(--color-secondary-green-dark)]',
        helper: 'Coleção finalizada e pronta para revisão.',
        action: 'Revisar',
      };
    }
    if (colecao.estudados > 0) {
      return {
        label: 'Em progresso',
        badge: 'info' as const,
        accent: 'primary' as const,
        headerBg: 'linear-gradient(135deg, var(--color-primary-darken-02) 0%, var(--color-primary) 100%)',
        progressColor: 'bg-[var(--color-primary)]',
        metricBg: 'bg-[var(--color-primary-surface)]',
        metricText: 'text-[var(--color-primary)]',
        helper: 'Continue do ponto em que você parou.',
        action: 'Continuar',
      };
    }
    return {
      label: 'Novo',
      badge: 'neutral' as const,
      accent: 'none' as const,
      headerBg: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-neutral-700) 100%)',
      progressColor: 'bg-[var(--color-neutral-300)]',
      metricBg: 'bg-[var(--color-neutral-50)]',
      metricText: 'text-[var(--color-neutral-500)]',
      helper: 'Coleção disponível para começar agora.',
      action: 'Começar',
    };
  };

  const temas = ['Todos', ...Array.from(new Set(colecoes.map((c) => c.tema)))];

  const filtered = colecoes.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.titulo.toLowerCase().includes(q) || c.tema.toLowerCase().includes(q);
    const matchesTema = temaFilter === 'Todos' || c.tema === temaFilter;
    const matchesStatus = statusFilter === 'todos' || getStatusKey(c) === statusFilter;
    return matchesSearch && matchesTema && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [searchQuery, temaFilter, statusFilter]);

  const statusTabs: { key: StatusKey; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: colecoes.length },
    { key: 'novo', label: 'Novos', count: colecoes.filter((c) => getStatusKey(c) === 'novo').length },
    { key: 'em_progresso', label: 'Em progresso', count: emProgresso },
    { key: 'concluido', label: 'Concluídos', count: concluidas },
  ];

  const summaryStats = [
    {
      label: 'Coleções',
      value: colecoes.length,
      detail: 'Disponíveis para estudo',
      icon: Layers,
      bg: 'bg-[var(--color-primary-surface)]',
      color: 'text-[var(--color-primary)]',
      tooltip: 'Total de coleções disponibilizadas pelos professores',
    },
    {
      label: 'Cards Estudados',
      value: `${totalEstudados}/${totalCards}`,
      detail: 'Progresso acumulado',
      icon: BookOpen,
      bg: 'bg-[var(--color-success-surface)]',
      color: 'text-[var(--color-success)]',
      tooltip: 'Quantos cards você já revisou no total',
    },
    {
      label: 'Em Progresso',
      value: emProgresso,
      detail: 'Coleções ativas no momento',
      icon: Sparkles,
      bg: 'bg-[var(--color-info-surface)]',
      color: 'text-[var(--color-primary)]',
      tooltip: 'Coleções que você começou mas ainda não concluiu',
    },
    {
      label: 'Concluídas',
      value: concluidas,
      detail: 'Prontas para revisão',
      icon: CheckCircle,
      bg: 'bg-[var(--color-warning-surface)]',
      color: 'text-[#6B5900]',
      tooltip: 'Coleções com todos os cards estudados',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Flashcards</h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Coleções de estudo disponibilizadas pelos seus professores</p>
      </div>

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
            value={temaFilter}
            onChange={(e) => setTemaFilter(e.target.value)}
            className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
            style={{ fontWeight: 500 }}
          >
            {temas.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por título ou tema..."
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((colecao) => {
            const pct = colecao.cards > 0 ? Math.round((colecao.estudados / colecao.cards) * 100) : 0;
            const restante = colecao.cards - colecao.estudados;
            const status = getStatus(colecao);

            return (
              <Card
                key={colecao.id}
                hoverable
                accent={status.accent}
                className="group overflow-hidden p-0"
                onClick={() => navigate(`/aluno/flashcards/${colecao.id}`)}
              >
                <div className="relative overflow-hidden px-5 pt-5 pb-4" style={{ background: status.headerBg }}>
                  <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 left-10 h-16 w-16 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />
                  <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-white shadow-[var(--shadow-sm)] backdrop-blur-sm">
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/70">Coleção</p>
                        <h4 className="truncate text-[16px] text-white" style={{ fontWeight: 700 }}>{colecao.titulo}</h4>
                        <p className="mt-0.5 truncate text-[13px] text-white/80">{status.helper}</p>
                      </div>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-default rounded-[var(--border-radius)] border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/85">
                          {pct}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{colecao.estudados} de {colecao.cards} cards revisados</TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="relative mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant={status.badge} size="sm">{status.label}</Badge>
                    <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/85">
                      {colecao.tema}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                      <GraduationCap size={12} />
                      Professor
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                      {colecao.professor}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
                        <Layers size={12} />
                        Progresso
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {colecao.estudados}/{colecao.cards} cards
                      </p>
                    </div>

                    <div className={`rounded-[var(--border-radius)] border p-3 ${status.metricBg} ${status.metricText}`}>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock size={12} />
                        {colecao.ultimoEstudo ? 'Último estudo' : 'Faltam'}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {colecao.ultimoEstudo ? colecao.ultimoEstudo : `${restante} cards`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[13px] text-[var(--color-neutral-500)]">
                      <span>Avanço na coleção</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-neutral-100)]">
                      <div
                        className={`h-2 rounded-full transition-all ${status.progressColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[var(--color-neutral-400)]">
                      {colecao.estudados === 0
                        ? 'Comece esta coleção para liberar seu progresso.'
                        : colecao.estudados === colecao.cards
                          ? 'Tudo revisado. Vale uma passada rápida para reforçar.'
                          : `${restante} cards restantes para concluir.`}
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
                      {status.action}
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
          <p className="text-sm text-[var(--color-neutral-400)]">Nenhuma coleção encontrada para os filtros aplicados.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('todos');
              setTemaFilter('Todos');
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
