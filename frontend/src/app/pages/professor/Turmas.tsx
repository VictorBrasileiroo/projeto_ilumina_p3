import { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Plus, Users, Edit, Trash2, X } from 'lucide-react';

interface Turma {
  id: number;
  nome: string;
  ano: string;
  turno: string;
  nivel: string;
  alunos: number;
}

export default function Turmas() {
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
          <Card key={turma.id} hoverable className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-darken-02)] flex items-center justify-center text-white text-[13px]" style={{ fontWeight: 700 }}>
                {turma.nome.split(' ')[0]}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded-[var(--border-radius)] transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Edit size={14} className="text-[var(--color-neutral-400)]" />
                </button>
                <button className="p-1.5 hover:bg-[var(--color-error-surface)] rounded-[var(--border-radius)] transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={14} className="text-[var(--color-error)]" />
                </button>
              </div>
            </div>
            <h4 className="text-[15px] mb-3" style={{ fontWeight: 600 }}>{turma.nome}</h4>
            <div className="space-y-1.5 text-[13px] text-[var(--color-neutral-500)]">
              <div className="flex justify-between">
                <span>Nível</span>
                <span className="text-[var(--color-neutral-700)]" style={{ fontWeight: 500 }}>{turma.nivel}</span>
              </div>
              <div className="flex justify-between">
                <span>Turno</span>
                <span className="text-[var(--color-neutral-700)]" style={{ fontWeight: 500 }}>{turma.turno}</span>
              </div>
              <div className="flex justify-between">
                <span>Ano</span>
                <span className="text-[var(--color-neutral-700)]" style={{ fontWeight: 500 }}>{turma.ano}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-neutral-100)]">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[var(--color-primary)]" />
                <span className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>{turma.alunos} alunos</span>
              </div>
              <span className="text-[13px] text-[var(--color-neutral-400)]" style={{ fontWeight: 600 }}>
                Detalhes em breve
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
