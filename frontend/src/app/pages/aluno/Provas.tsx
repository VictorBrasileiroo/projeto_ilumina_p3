import { Link } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { FileText, Clock, ArrowRight, CheckCircle, Lock } from 'lucide-react';

export default function Provas() {
  const provas = [
    { id: 1, titulo: 'Prova de Matemática - 1º Bimestre', disciplina: 'Matemática', turma: '9º A', prazo: '20/04/2026', questoes: 10, status: 'disponivel' as const },
    { id: 2, titulo: 'Avaliação de História - Roma Antiga', disciplina: 'História', turma: '9º A', prazo: '22/04/2026', questoes: 15, status: 'disponivel' as const },
    { id: 3, titulo: 'Avaliação de Ciências - Ecologia', disciplina: 'Ciências', turma: '9º A', prazo: '10/04/2026', questoes: 12, status: 'realizada' as const, nota: 8.5 },
    { id: 4, titulo: 'Prova de Português - Gramática', disciplina: 'Português', turma: '9º A', prazo: '05/04/2026', questoes: 10, status: 'realizada' as const, nota: 9.0 },
    { id: 5, titulo: 'Teste de Geografia - Clima', disciplina: 'Geografia', turma: '9º A', prazo: '28/04/2026', questoes: 8, status: 'bloqueada' as const },
  ];

  const statusConfig = {
    disponivel: { label: 'Disponível', variant: 'success' as const, icon: FileText },
    realizada: { label: 'Realizada', variant: 'info' as const, icon: CheckCircle },
    bloqueada: { label: 'Bloqueada', variant: 'neutral' as const, icon: Lock },
  };

  const disponiveis = provas.filter(p => p.status === 'disponivel');
  const realizadas = provas.filter(p => p.status === 'realizada');
  const bloqueadas = provas.filter(p => p.status === 'bloqueada');

  const renderProva = (prova: typeof provas[0]) => {
    const config = statusConfig[prova.status];
    return (
      <Card key={prova.id} className="p-4" hoverable={prova.status === 'disponivel'}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-10 h-10 rounded-[var(--border-radius-lg)] flex items-center justify-center shrink-0 ${
              prova.status === 'disponivel' ? 'bg-[var(--color-primary-darken-02)]' :
              prova.status === 'realizada' ? 'bg-[var(--color-success)]' :
              'bg-[var(--color-neutral-300)]'
            }`}>
              <config.icon className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] truncate" style={{ fontWeight: 600 }}>{prova.titulo}</h4>
              <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[var(--color-neutral-400)]">
                <span>{prova.disciplina}</span>
                <span>{prova.questoes} questões</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {prova.status === 'realizada' ? 'Realizada em' : 'Prazo:'} {prova.prazo}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {prova.status === 'realizada' && 'nota' in prova && (
              <div className="text-right mr-2">
                <div className="text-[1.1rem] text-[var(--color-success)]" style={{ fontWeight: 700 }}>{prova.nota}</div>
                <div className="text-[11px] text-[var(--color-neutral-400)]">de 10</div>
              </div>
            )}
            <Badge variant={config.variant}>{config.label}</Badge>
            {prova.status === 'disponivel' && (
              <Link to={`/aluno/prova/${prova.id}`}>
                <Button size="sm">
                  Iniciar
                  <ArrowRight size={14} />
                </Button>
              </Link>
            )}
            {prova.status === 'realizada' && (
              <Link to={`/aluno/resultado/${prova.id}`}>
                <Button variant="ghost" size="sm">Ver gabarito</Button>
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
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Visualize suas provas disponíveis e resultados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
              <FileText size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{disponiveis.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Disponíveis</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <CheckCircle size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{realizadas.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Realizadas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-neutral-100)]">
              <Lock size={18} className="text-[var(--color-neutral-400)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{bloqueadas.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Bloqueadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Disponíveis */}
      {disponiveis.length > 0 && (
        <div>
          <h3 className="text-[15px] mb-3">Disponíveis</h3>
          <div className="space-y-3">
            {disponiveis.map(renderProva)}
          </div>
        </div>
      )}

      {/* Realizadas */}
      {realizadas.length > 0 && (
        <div>
          <h3 className="text-[15px] mb-3">Realizadas</h3>
          <div className="space-y-3">
            {realizadas.map(renderProva)}
          </div>
        </div>
      )}

      {/* Bloqueadas */}
      {bloqueadas.length > 0 && (
        <div>
          <h3 className="text-[15px] mb-3">Bloqueadas</h3>
          <div className="space-y-3">
            {bloqueadas.map(renderProva)}
          </div>
        </div>
      )}
    </div>
  );
}
