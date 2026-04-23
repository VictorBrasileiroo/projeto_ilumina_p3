import { Link } from 'react-router';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

const parseDate = (date: string) => {
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export default function Dashboard() {
  const provasDisponiveis = [
    { id: 1, titulo: 'Prova de Matemática - 1º Bimestre', disciplina: 'Matemática', prazo: '20/04/2026', questoes: 10, turma: '9º A' },
    { id: 2, titulo: 'Avaliação de História - Roma Antiga', disciplina: 'História', prazo: '22/04/2026', questoes: 15, turma: '9º A' },
  ];

  const colecoesDisponiveis = [
    { id: 1, titulo: 'Verbos em Inglês - Básico', tema: 'Inglês', cards: 20, estudados: 15, professor: 'Prof. Maria Silva' },
    { id: 2, titulo: 'Fórmulas de Física - Mecânica', tema: 'Física', cards: 15, estudados: 8, professor: 'Prof. Carlos Souza' },
    { id: 3, titulo: 'Tabela Periódica - Elementos', tema: 'Química', cards: 30, estudados: 0, professor: 'Prof. Ana Costa' },
  ];

  const resultados = [
    { id: 1, prova: 'Avaliação de Ciências - Ecologia', disciplina: 'Ciências', nota: 8.5, data: '15/03/2026' },
    { id: 2, prova: 'Prova de Português - Gramática', disciplina: 'Português', nota: 9.0, data: '10/03/2026' },
  ];

  const proximaProva = [...provasDisponiveis].sort(
    (a, b) => parseDate(a.prazo).getTime() - parseDate(b.prazo).getTime(),
  )[0];

  const mediaGeral = resultados.length
    ? resultados.reduce((sum, resultado) => sum + resultado.nota, 0) / resultados.length
    : 0;

  const totalCards = colecoesDisponiveis.reduce((sum, colecao) => sum + colecao.cards, 0);
  const totalEstudados = colecoesDisponiveis.reduce((sum, colecao) => sum + colecao.estudados, 0);
  const progressoFlashcards = totalCards > 0 ? Math.round((totalEstudados / totalCards) * 100) : 0;

  const colecaoParaContinuar = [...colecoesDisponiveis]
    .filter((colecao) => colecao.estudados > 0 && colecao.estudados < colecao.cards)
    .sort((a, b) => (b.estudados / b.cards) - (a.estudados / a.cards))[0];

  return (
    <div className="space-y-6">
      <div>
        <h1>Olá, João Pedro!</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Acompanhe suas provas, estudos e resultados em um só lugar</p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Provas Disponíveis',
            value: provasDisponiveis.length,
            detail: proximaProva ? `Próxima em ${proximaProva.prazo}` : 'Sem pendências',
            icon: FileText,
            bg: 'bg-[var(--color-primary-surface)]',
            color: 'text-[var(--color-primary)]',
          },
          {
            label: 'Coleções de Estudo',
            value: colecoesDisponiveis.length,
            detail: 'Materiais liberados pelos professores',
            icon: BookOpen,
            bg: 'bg-[var(--color-success-surface)]',
            color: 'text-[var(--color-success)]',
          },
          {
            label: 'Média Geral',
            value: mediaGeral.toFixed(1),
            detail: 'Desempenho nas avaliações concluídas',
            icon: Award,
            bg: 'bg-[var(--color-warning-surface)]',
            color: 'text-[#6B5900]',
          },
          {
            label: 'Progresso Flashcards',
            value: `${progressoFlashcards}%`,
            detail: 'Avanço total nas coleções',
            icon: Sparkles,
            bg: 'bg-[var(--color-info-surface)]',
            color: 'text-[var(--color-primary)]',
          },
        ].map((stat) => {
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

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-[15px]">Próximas Provas</h3>
              <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Avaliações abertas para você priorizar agora</p>
            </div>
            <Link to="/aluno/provas" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {provasDisponiveis.map((prova) => (
              <Card key={prova.id} accent="primary" hoverable className="group overflow-hidden p-0">
                <div className="h-1 w-full bg-[var(--color-secondary-yellow)]" />
                <div className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-primary-darken-02)] text-white">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="success">Disponível</Badge>
                          <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-[11px] text-[var(--color-neutral-500)]">
                            {prova.disciplina}
                          </span>
                        </div>

                        <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                          {prova.titulo}
                        </h4>
                        <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                          Organize um momento tranquilo para concluir essa prova dentro do prazo.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] px-4 py-3 lg:min-w-[150px]">
                      <p className="text-[11px] uppercase tracking-wider text-[var(--color-primary)]" style={{ fontWeight: 600 }}>
                        Prazo final
                      </p>
                      <p className="mt-1 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {prova.prazo}
                      </p>
                      <p className="text-[11px] text-[var(--color-primary)]">{prova.questoes} questões</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-[12px] text-[var(--color-neutral-400)]">
                      <span className="inline-flex items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1">
                        <CalendarDays size={11} />
                        Prazo: {prova.prazo}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1">
                        <Layers size={11} />
                        Turma {prova.turma}
                      </span>
                    </div>

                    <Link to={`/aluno/prova/${prova.id}`}>
                      <Button size="sm">
                        Iniciar prova
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-[15px]">Ritmo de Estudo</h3>
              <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Continue de onde você parou</p>
            </div>
            <Link to="/aluno/flashcards" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {colecoesDisponiveis.slice(0, 2).map((colecao) => {
              const pct = colecao.cards > 0 ? Math.round((colecao.estudados / colecao.cards) * 100) : 0;
              const isNew = colecao.estudados === 0;

              return (
                <Card
                  key={colecao.id}
                  hoverable
                  accent={isNew ? 'none' : 'primary'}
                  className="group overflow-hidden p-0"
                >
                  <div
                    className="relative overflow-hidden px-5 pt-5 pb-4"
                    style={{
                      background: isNew
                        ? 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-neutral-700) 100%)'
                        : 'linear-gradient(135deg, var(--color-secondary-green-dark) 0%, var(--color-secondary-green) 60%, var(--color-primary) 100%)',
                    }}
                  >
                    <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-white/10" />
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
                          <p className="mt-0.5 truncate text-[12px] text-white/80">{colecao.tema}</p>
                        </div>
                      </div>

                      <div className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                        {pct}%
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                        <Sparkles size={11} />
                        Professor
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                        {colecao.professor}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[12px] text-[var(--color-neutral-500)]">
                        <span>Avanço da coleção</span>
                        <span>{colecao.estudados}/{colecao.cards} cards</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-neutral-100)]">
                        <div
                          className={`h-2 rounded-full transition-all ${isNew ? 'bg-[var(--color-neutral-300)]' : 'bg-[var(--color-primary)]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-4">
                      <p className="text-[12px] text-[var(--color-neutral-400)]">
                        {isNew ? 'Coleção pronta para começar' : 'Continue seu ritmo de revisão'}
                      </p>
                      <Link to={`/aluno/flashcards/${colecao.id}`}>
                        <Button size="sm" variant={isNew ? 'primary' : 'ghost'}>
                          {isNew ? 'Começar' : 'Continuar'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[15px]">Resultados Recentes</h3>
            <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Revise seu desempenho nas últimas avaliações</p>
          </div>
          <Link to="/aluno/provas" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <Card>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {resultados.map((resultado) => (
              <div key={resultado.id} className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--color-neutral-50)] transition-colors">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info" size="sm">Resultado</Badge>
                    <span className="text-[12px] text-[var(--color-neutral-400)]">{resultado.disciplina}</span>
                  </div>
                  <h4 className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {resultado.prova}
                  </h4>
                  <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">{resultado.data}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)] px-4 py-3 text-right">
                    <div className="text-[1.35rem] text-[var(--color-success)]" style={{ fontWeight: 700, lineHeight: 1.05 }}>
                      {resultado.nota.toFixed(1)}
                    </div>
                    <div className="text-[11px] text-[var(--color-secondary-green-dark)]">de 10,0</div>
                  </div>
                  <Link to={`/aluno/resultado/${resultado.id}`}>
                    <Button variant="ghost" size="sm">Ver gabarito</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
