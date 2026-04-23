import { Link } from 'react-router';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Layers3,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';


export default function Dashboard() {
  const stats = [
    { label: 'Turmas Ativas', value: '8', icon: Users, bg: 'bg-[var(--color-primary-surface)]', color: 'text-[var(--color-primary)]', change: '+2 este mês' },
    { label: 'Provas Criadas', value: '24', icon: FileText, bg: 'bg-[var(--color-success-surface)]', color: 'text-[var(--color-success)]', change: '+5 este mês' },
    { label: 'Coleções de Flashcards', value: '15', icon: BookOpen, bg: 'bg-[var(--color-warning-surface)]', color: 'text-[#6B5900]', change: '+3 este mês' },
    { label: 'Total de Alunos', value: '125', icon: TrendingUp, bg: 'bg-[var(--color-info-surface)]', color: 'text-[var(--color-primary)]', change: 'matriculados' },
  ];

  const recentProvas = [
    { id: 1, title: 'Prova de Matemática - 9º Ano', turma: '9º A', status: 'Publicada', date: '15/03/2026', questoes: 10, responderam: 30, media: 7.8 },
    { id: 2, title: 'Avaliação de História - 8º Ano', turma: '8º B', status: 'Rascunho', date: '10/03/2026', questoes: 15, responderam: 0, media: 0 },
    { id: 3, title: 'Teste de Ciências - 7º Ano', turma: '7º C', status: 'Publicada', date: '08/03/2026', questoes: 8, responderam: 22, media: 8.4 },
  ];

  const turmas = [
    { id: 1, nome: '9º A', nivel: 'Fundamental II', alunos: 32, provasAtivas: 2, colecoes: 3 },
    { id: 2, nome: '8º B', nivel: 'Fundamental II', alunos: 28, provasAtivas: 1, colecoes: 2 },
    { id: 3, nome: '1º A', nivel: 'Ensino Médio', alunos: 35, provasAtivas: 3, colecoes: 4 },
  ];

  const colecoes = [
    { id: 1, titulo: 'Verbos em Inglês - Básico', turma: '7º C', cards: 20, status: 'Publicada', alunosEstudaram: 25 },
    { id: 2, titulo: 'Fórmulas de Física', turma: '1º A', cards: 15, status: 'Rascunho', alunosEstudaram: 0 },
    { id: 3, titulo: 'Tabela Periódica', turma: '9º A', cards: 30, status: 'Publicada', alunosEstudaram: 18 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Painel do Professor</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Visão geral das suas turmas, provas e materiais de estudo</p>
      </div>

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
            {recentProvas.map((prova) => {
              const isPublished = prova.status === 'Publicada';

              return (
                <Card key={prova.id} accent={isPublished ? 'primary' : 'warning'} hoverable className="group overflow-hidden p-0">
                  <div className="h-1 w-full bg-[var(--color-secondary-yellow)]" />
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] text-white ${
                          isPublished ? 'bg-[var(--color-primary-darken-02)]' : 'bg-[#6B5900]'
                        }`}>
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={isPublished ? 'success' : 'warning'}>{prova.status}</Badge>
                            <span className="inline-flex items-center rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-[11px] text-[var(--color-neutral-500)]">
                              Turma {prova.turma}
                            </span>
                          </div>

                          <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                            {prova.title}
                          </h4>
                          <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                            {isPublished ? 'Acompanhe o desempenho e a taxa de resposta da turma.' : 'Finalize a revisão e publique quando estiver pronta.'}
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-[var(--border-radius-lg)] border px-4 py-3 lg:min-w-[165px] ${
                        isPublished
                          ? 'border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)]'
                          : 'border-[var(--color-warning-surface)] bg-[var(--color-warning-surface)]'
                      }`}>
                        <p className={`text-[11px] uppercase tracking-wider ${isPublished ? 'text-[var(--color-primary)]' : 'text-[#6B5900]'}`} style={{ fontWeight: 600 }}>
                          {isPublished ? 'Média da turma' : 'Status atual'}
                        </p>
                        <p className="mt-1 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                          {isPublished ? prova.media.toFixed(1) : 'Aguardando publicação'}
                        </p>
                        <p className={`text-[11px] ${isPublished ? 'text-[var(--color-primary)]' : 'text-[#6B5900]'}`}>
                          {isPublished ? `${prova.responderam} responderam` : `${prova.questoes} questões montadas`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                          <CalendarDays size={11} />
                          Data
                        </div>
                        <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                          {prova.date}
                        </p>
                      </div>

                      <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                          <Layers3 size={11} />
                          Estrutura
                        </div>
                        <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                          {prova.questoes} questões
                        </p>
                      </div>

                      <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                          <Users size={11} />
                          Participação
                        </div>
                        <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                          {isPublished ? `${prova.responderam} alunos` : 'Ainda não iniciada'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[12px] text-[var(--color-neutral-400)]">
                        {isPublished ? 'Entre na revisão para acompanhar respostas e desempenho.' : 'Revise o conteúdo antes de compartilhar com a turma.'}
                      </p>
                      <Link to={`/professor/provas/${prova.id}/revisar`}>
                        <Button variant={isPublished ? 'ghost' : 'primary'} size="sm">
                          {isPublished ? 'Ver detalhes' : 'Continuar edição'}
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
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
              {turmas.map((turma) => (
                <Card key={turma.id} hoverable className="group p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px]" style={{ fontWeight: 700 }}>{turma.nome}</h4>
                        <Badge variant={turma.nivel === 'Ensino Médio' ? 'success' : 'info'} size="sm">
                          {turma.nivel}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                        {turma.alunos} alunos · {turma.provasAtivas} provas ativas
                      </p>
                    </div>
                    <div className="rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-2.5 py-1 text-[11px] text-[var(--color-primary)]">
                      {turma.colecoes} coleções
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
            <h3 className="text-[15px]">Coleções em Andamento</h3>
            <p className="mt-0.5 text-[12px] text-[var(--color-neutral-400)]">Materiais criados para reforçar o estudo das turmas</p>
          </div>
          <Link to="/professor/flashcards" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver coleções <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {colecoes.map((colecao) => {
            const isPublished = colecao.status === 'Publicada';

            return (
              <Card key={colecao.id} hoverable className="group overflow-hidden p-0">
                <div
                  className="relative overflow-hidden px-5 pt-5 pb-4"
                  style={{
                    background: isPublished
                      ? 'linear-gradient(135deg, var(--color-secondary-green-dark) 0%, var(--color-secondary-green) 55%, var(--color-primary) 100%)'
                      : 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
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
                        <h4 className="truncate text-[15px] text-white" style={{ fontWeight: 700 }}>{colecao.titulo}</h4>
                        <p className="mt-0.5 truncate text-[12px] text-white/80">Turma {colecao.turma}</p>
                      </div>
                    </div>

                    <Badge variant={isPublished ? 'success' : 'warning'} size="sm">
                      {colecao.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                        <Layers3 size={11} />
                        Cards
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {colecao.cards}
                      </p>
                    </div>

                    <div className={`rounded-[var(--border-radius)] border p-3 ${
                      isPublished
                        ? 'border-[var(--color-success-surface)] bg-[var(--color-success-surface)]'
                        : 'border-[var(--color-warning-surface)] bg-[var(--color-warning-surface)]'
                    }`}>
                      <div className={`flex items-center gap-1 text-[11px] ${
                        isPublished ? 'text-[var(--color-secondary-green-dark)]' : 'text-[#6B5900]'
                      }`}>
                        <Users size={11} />
                        {isPublished ? 'Estudaram' : 'Status'}
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {isPublished ? `${colecao.alunosEstudaram} alunos` : 'Rascunho'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-4">
                    <p className="text-[12px] text-[var(--color-neutral-400)]">
                      {isPublished ? 'Coleção já compartilhada com a turma.' : 'Revise antes de publicar.'}
                    </p>
                    <Link to={`/professor/flashcards/${colecao.id}`}>
                      <Button size="sm" variant="ghost">
                        Ver
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
  );
}
