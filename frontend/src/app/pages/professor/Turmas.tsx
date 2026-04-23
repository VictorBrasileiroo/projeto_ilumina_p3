import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { ArrowRight, Clock, Edit, Plus, Trash2, Users, X } from 'lucide-react';

interface Turma {
  id: number;
  nome: string;
  ano: string;
  turno: string;
  nivel: string;
  alunos: number;
}

export default function Turmas() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [turmas] = useState<Turma[]>([
    { id: 1, nome: '9º A', ano: '2026', turno: 'Manhã', nivel: 'Fundamental II', alunos: 32 },
    { id: 2, nome: '8º B', ano: '2026', turno: 'Tarde', nivel: 'Fundamental II', alunos: 28 },
    { id: 3, nome: '7º C', ano: '2026', turno: 'Manhã', nivel: 'Fundamental II', alunos: 30 },
    { id: 4, nome: '1º A', ano: '2026', turno: 'Manhã', nivel: 'Ensino Médio', alunos: 35 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Turmas</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Organize e gerencie suas turmas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Nova Turma
        </Button>
      </div>

      {showForm && (
        <Card className="p-6" accent="primary">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px]">Nova Turma</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded transition-colors">
              <X size={16} className="text-[var(--color-neutral-400)]" />
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da Turma" placeholder="Ex: 9º A" fullWidth />
            <Input label="Ano Letivo" placeholder="2026" type="number" fullWidth />
            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>
                Nível de Ensino
              </label>
              <select className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all bg-white">
                <option>Fundamental I</option>
                <option>Fundamental II</option>
                <option>Ensino Médio</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>
                Turno
              </label>
              <select className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all bg-white">
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
                <option>Integral</option>
              </select>
            </div>
            <Input label="Número de Alunos" placeholder="30" type="number" fullWidth />
            <div className="md:col-span-2 flex gap-2 justify-end pt-3 border-t border-[var(--color-neutral-100)]">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">Criar Turma</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {turmas.map((turma) => (
          <Card
            key={turma.id}
            hoverable
            className="group overflow-hidden p-0"
            onClick={() => navigate(`/professor/turmas/${turma.id}`)}
          >
            <div
              className="relative overflow-hidden px-5 pt-5 pb-4"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-darken-02) 0%, var(--color-primary) 100%)' }}
            >
              <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 left-10 h-16 w-16 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />
              <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-[14px] text-white shadow-[var(--shadow-sm)] backdrop-blur-sm" style={{ fontWeight: 700 }}>
                    {turma.nome.split(' ')[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Turma</p>
                    <h4 className="truncate text-[18px] text-white" style={{ fontWeight: 700 }}>
                      {turma.nome}
                    </h4>
                    <p className="mt-0.5 truncate text-[12px] text-white/80">
                      Acompanhe desempenho, provas e materiais
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-1">
                  <button
                    className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={turma.nivel === 'Ensino Médio' ? 'success' : 'info'} size="sm">
                  {turma.nivel}
                </Badge>
                <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                  Ano letivo {turma.ano}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                  <p className="text-[11px] text-[var(--color-neutral-400)]">Ano</p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {turma.ano}
                  </p>
                </div>
                <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                    <Clock size={11} />
                    Turno
                  </div>
                  <p className="mt-1 truncate text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {turma.turno}
                  </p>
                </div>
                <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-primary-surface)] p-3">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-primary)]">
                    <Users size={11} />
                    Alunos
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {turma.alunos}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] text-[var(--color-neutral-400)]">Acompanhe alunos, provas e materiais</p>
                  <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                    Abrir visão da turma
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/professor/turmas/${turma.id}`);
                  }}
                  className="inline-flex self-start items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-3 py-2 text-[13px] text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-lighten-02)] sm:self-auto"
                  style={{ fontWeight: 600 }}
                >
                  Ver detalhes
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
