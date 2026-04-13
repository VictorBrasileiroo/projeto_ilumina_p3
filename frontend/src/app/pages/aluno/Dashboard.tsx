import { Link } from 'react-router';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { FileText, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const provasDisponiveis = [
    { id: 1, titulo: 'Prova de Matemática', disciplina: 'Matemática', prazo: '20/04/2026', status: 'Disponível' },
    { id: 2, titulo: 'Avaliação de História', disciplina: 'História', prazo: '22/04/2026', status: 'Disponível' },
  ];

  const colecoesDisponiveis = [
    { id: 1, titulo: 'Verbos em Inglês', tema: 'Inglês', cards: 20 },
    { id: 2, titulo: 'Fórmulas de Física', tema: 'Física', cards: 15 },
  ];

  const resultados = [
    { id: 1, prova: 'Avaliação de Ciências', nota: 8.5, data: '15/03/2026' },
    { id: 2, prova: 'Prova de Português', nota: 9.0, data: '10/03/2026' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Olá, João Pedro!</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Acesse suas provas e materiais de estudo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Provas Disponíveis', value: provasDisponiveis.length, icon: FileText, bg: 'bg-[var(--color-primary-surface)]', color: 'text-[var(--color-primary)]' },
          { label: 'Coleções de Estudo', value: colecoesDisponiveis.length, icon: BookOpen, bg: 'bg-[var(--color-success-surface)]', color: 'text-[var(--color-success)]' },
          { label: 'Média Geral', value: '8.75', icon: Award, bg: 'bg-[var(--color-warning-surface)]', color: 'text-[#6B5900]' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[var(--color-neutral-500)] mb-1 uppercase tracking-wider" style={{ fontWeight: 500 }}>{stat.label}</p>
                  <p className="text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-[var(--border-radius-lg)] ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Provas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px]">Provas Disponíveis</h3>
          <Link to="/aluno/provas" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {provasDisponiveis.map((prova) => (
            <Card key={prova.id} className="p-4" hoverable>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-darken-02)] flex items-center justify-center shrink-0">
                    <FileText className="text-white" size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px]" style={{ fontWeight: 600 }}>{prova.titulo}</h4>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[var(--color-neutral-400)]">
                      <span>{prova.disciplina}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Prazo: {prova.prazo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="success">{prova.status}</Badge>
                  <Link to={`/aluno/prova/${prova.id}`}>
                    <Button size="sm">
                      Iniciar
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Flashcards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px]">Coleções de Estudo</h3>
          <Link to="/aluno/flashcards" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {colecoesDisponiveis.map((colecao) => (
            <Link key={colecao.id} to={`/aluno/flashcards/${colecao.id}`}>
              <Card className="p-5" hoverable>
                <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-secondary-green)] flex items-center justify-center mb-3">
                  <BookOpen className="text-white" size={18} />
                </div>
                <h4 className="text-[14px] mb-1" style={{ fontWeight: 600 }}>{colecao.titulo}</h4>
                <p className="text-[12px] text-[var(--color-neutral-400)] mb-3">{colecao.tema}</p>
                <span className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>{colecao.cards} cards</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px]">Resultados Recentes</h3>
          <Link to="/aluno/provas" className="text-[var(--color-primary)] text-[13px] hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {resultados.map((resultado) => (
              <div key={resultado.id} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--color-neutral-50)] transition-colors">
                <div>
                  <h4 className="text-[14px]" style={{ fontWeight: 600 }}>{resultado.prova}</h4>
                  <p className="text-[12px] text-[var(--color-neutral-400)] mt-0.5">{resultado.data}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[1.25rem] text-[var(--color-success)]" style={{ fontWeight: 700 }}>{resultado.nota}</div>
                    <div className="text-[11px] text-[var(--color-neutral-400)]">de 10,0</div>
                  </div>
                  <Link to={`/aluno/resultado/${resultado.id}`}>
                    <Button variant="ghost" size="sm">Ver gabarito</Button>
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
