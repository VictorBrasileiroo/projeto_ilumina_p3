import { Link } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Plus, Users, FileText, BookOpen, Clock, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Turmas Ativas', value: '8', icon: Users, bg: 'bg-[var(--color-primary-surface)]', color: 'text-[var(--color-primary)]', change: '+2 este mês' },
    { label: 'Provas Criadas', value: '24', icon: FileText, bg: 'bg-[var(--color-success-surface)]', color: 'text-[var(--color-success)]', change: '+5 este mês' },
    { label: 'Coleções de Flashcards', value: '15', icon: BookOpen, bg: 'bg-[var(--color-warning-surface)]', color: 'text-[#6B5900]', change: '+3 este mês' },
    { label: 'Total de Alunos', value: '125', icon: TrendingUp, bg: 'bg-[var(--color-info-surface)]', color: 'text-[var(--color-primary)]', change: 'matriculados' },
  ];

  const recentProvas = [
    { id: 1, title: 'Prova de Matemática - 9º Ano', turma: '9º A', status: 'Publicada', date: '15/03/2026', questoes: 10 },
    { id: 2, title: 'Avaliação de História - 8º Ano', turma: '8º B', status: 'Rascunho', date: '10/03/2026', questoes: 15 },
    { id: 3, title: 'Teste de Ciências - 7º Ano', turma: '7º C', status: 'Publicada', date: '08/03/2026', questoes: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Visão geral das suas turmas, provas e materiais</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[var(--color-neutral-500)] mb-1 uppercase tracking-wider" style={{ fontWeight: 500 }}>{stat.label}</p>
                  <p className="text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</p>
                  <p className="text-[12px] text-[var(--color-neutral-400)] mt-1">{stat.change}</p>
                </div>
                <div className={`p-2.5 rounded-[var(--border-radius-lg)] ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-5" accent="primary">
        <h3 className="mb-3 text-[15px]">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/professor/provas/criar">
            <Button variant="primary" size="sm">
              <Plus size={16} />
              Criar Prova
            </Button>
          </Link>
          <Link to="/professor/flashcards">
            <Button variant="secondary" size="sm">
              <Plus size={16} />
              Nova Coleção
            </Button>
          </Link>
          <Link to="/professor/turmas">
            <Button variant="outline" size="sm">
              <Users size={16} />
              Gerenciar Turmas
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Provas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px]">Provas Recentes</h3>
          <Link to="/professor/provas/criar" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {recentProvas.map((prova) => (
              <div key={prova.id} className="px-5 py-4 hover:bg-[var(--color-neutral-50)] transition-colors flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] text-[var(--color-neutral-800)] truncate" style={{ fontWeight: 600 }}>{prova.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-[12px] text-[var(--color-neutral-400)]">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {prova.turma}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} />
                      {prova.questoes} questões
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {prova.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={prova.status === 'Publicada' ? 'success' : 'warning'}>
                    {prova.status}
                  </Badge>
                  <Link to={`/professor/provas/${prova.id}/revisar`}>
                    <Button variant="ghost" size="sm">Detalhes</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}