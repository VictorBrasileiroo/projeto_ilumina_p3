import { Link } from 'react-router';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { BookOpen, Layers, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';

export default function FlashcardsList() {
  const colecoes = [
    { id: 1, titulo: 'Verbos em Inglês - Básico', tema: 'Inglês', professor: 'Prof. Maria Silva', cards: 20, estudados: 15, ultimoEstudo: '12/04/2026' },
    { id: 2, titulo: 'Fórmulas de Física - Mecânica', tema: 'Física', professor: 'Prof. Carlos Souza', cards: 15, estudados: 8, ultimoEstudo: '10/04/2026' },
    { id: 3, titulo: 'Tabela Periódica - Elementos', tema: 'Química', professor: 'Prof. Ana Costa', cards: 30, estudados: 0, ultimoEstudo: null },
    { id: 4, titulo: 'Datas Históricas - Brasil Colônia', tema: 'História', professor: 'Prof. Maria Silva', cards: 18, estudados: 18, ultimoEstudo: '08/04/2026' },
    { id: 5, titulo: 'Vocabulário Espanhol - Básico', tema: 'Espanhol', professor: 'Prof. Lucia Fernandez', cards: 25, estudados: 5, ultimoEstudo: '11/04/2026' },
  ];

  const getProgressColor = (estudados: number, total: number) => {
    const pct = total > 0 ? (estudados / total) * 100 : 0;
    if (pct === 100) return 'bg-[var(--color-success)]';
    if (pct > 0) return 'bg-[var(--color-primary)]';
    return 'bg-[var(--color-neutral-200)]';
  };

  const getStatusBadge = (estudados: number, total: number) => {
    if (estudados === total && total > 0) return <Badge variant="success" size="sm">Concluído</Badge>;
    if (estudados > 0) return <Badge variant="info" size="sm">Em progresso</Badge>;
    return <Badge variant="neutral" size="sm">Novo</Badge>;
  };

  const totalCards = colecoes.reduce((sum, c) => sum + c.cards, 0);
  const totalEstudados = colecoes.reduce((sum, c) => sum + c.estudados, 0);
  const concluidas = colecoes.filter(c => c.estudados === c.cards).length;

  return (
    <div className="space-y-6">
      <div>
        <h1>Flashcards</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Coleções de estudo disponibilizadas pelos seus professores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
              <Layers size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecoes.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Coleções disponíveis</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <BookOpen size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{totalEstudados}/{totalCards}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Cards estudados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)]">
              <Clock size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{concluidas}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Concluídas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Collections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {colecoes.map((colecao) => {
          const pct = colecao.cards > 0 ? Math.round((colecao.estudados / colecao.cards) * 100) : 0;
          return (
            <Card key={colecao.id} hoverable className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-secondary-green)] flex items-center justify-center">
                  <BookOpen size={18} className="text-white" />
                </div>
                {getStatusBadge(colecao.estudados, colecao.cards)}
              </div>

              <h4 className="text-[14px] mb-1" style={{ fontWeight: 600 }}>{colecao.titulo}</h4>
              <p className="text-[12px] text-[var(--color-neutral-400)] mb-1">{colecao.tema} · {colecao.professor}</p>

              {colecao.ultimoEstudo && (
                <p className="text-[11px] text-[var(--color-neutral-300)] mb-3 flex items-center gap-1">
                  <Clock size={10} />
                  Último estudo: {colecao.ultimoEstudo}
                </p>
              )}

              {/* Progress */}
              <div className="mt-auto pt-3 border-t border-[var(--color-neutral-100)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--color-neutral-500)]">{colecao.estudados}/{colecao.cards} cards</span>
                  <span className="text-[12px] text-[var(--color-neutral-400)]">{pct}%</span>
                </div>
                <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-1.5 mb-3">
                  <div
                    className={`${getProgressColor(colecao.estudados, colecao.cards)} h-1.5 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Link to={`/aluno/flashcards/${colecao.id}`}>
                  <Button size="sm" variant={colecao.estudados === 0 ? 'primary' : 'outline'} fullWidth>
                    {colecao.estudados === 0 ? 'Começar' : colecao.estudados === colecao.cards ? 'Revisar' : 'Continuar'}
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
