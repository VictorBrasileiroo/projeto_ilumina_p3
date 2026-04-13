import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Edit, Trash2, Check, Plus } from 'lucide-react';

interface Questao {
  id: number;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  gabarito: string;
}

export default function RevisarQuestoes() {
  const navigate = useNavigate();
  const [questoes] = useState<Questao[]>([
    {
      id: 1,
      enunciado: 'Qual é o resultado da equação 2x + 5 = 13?',
      alternativas: [
        { id: 'a', texto: 'x = 3' },
        { id: 'b', texto: 'x = 4' },
        { id: 'c', texto: 'x = 5' },
        { id: 'd', texto: 'x = 6' },
      ],
      gabarito: 'b',
    },
    {
      id: 2,
      enunciado: 'Calcule a área de um retângulo com base 8cm e altura 5cm.',
      alternativas: [
        { id: 'a', texto: '13 cm²' },
        { id: 'b', texto: '26 cm²' },
        { id: 'c', texto: '40 cm²' },
        { id: 'd', texto: '80 cm²' },
      ],
      gabarito: 'c',
    },
    {
      id: 3,
      enunciado: 'Qual é o valor de √144?',
      alternativas: [
        { id: 'a', texto: '10' },
        { id: 'b', texto: '11' },
        { id: 'c', texto: '12' },
        { id: 'd', texto: '13' },
      ],
      gabarito: 'c',
    },
  ]);

  const handlePublish = () => {
    if (confirm('Deseja publicar esta prova?')) {
      navigate('/professor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Revisar Questões</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Avaliação de Matemática - 9º A</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate('/professor')}>Salvar Rascunho</Button>
          <Button onClick={handlePublish}>
            <Check size={16} />
            Publicar Prova
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-[var(--color-warning-surface)] border-[var(--color-warning)]/20" accent="warning">
        <p className="text-[13px] text-[#6B5900]">
          <strong>Rascunho</strong> — Revise as questões geradas pela IA e faça os ajustes necessários antes de publicar.
        </p>
      </Card>

      <div className="space-y-4">
        {questoes.map((questao, index) => (
          <Card key={questao.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-darken-02)] text-white flex items-center justify-center text-[13px]" style={{ fontWeight: 700 }}>
                  {index + 1}
                </div>
                <Badge variant="info">Múltipla Escolha</Badge>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded-[var(--border-radius)] transition-colors">
                  <Edit size={15} className="text-[var(--color-neutral-400)]" />
                </button>
                <button className="p-1.5 hover:bg-[var(--color-error-surface)] rounded-[var(--border-radius)] transition-colors">
                  <Trash2 size={15} className="text-[var(--color-error)]" />
                </button>
              </div>
            </div>

            <p className="text-[14px] text-[var(--color-neutral-800)] mb-4" style={{ fontWeight: 500 }}>{questao.enunciado}</p>

            <div className="space-y-2">
              {questao.alternativas.map((alt) => (
                <div
                  key={alt.id}
                  className={`px-3 py-2.5 rounded-[var(--border-radius)] border flex items-center gap-3 text-[13px] ${
                    alt.id === questao.gabarito
                      ? 'border-[var(--color-success)] bg-[var(--color-success-surface)]'
                      : 'border-[var(--color-neutral-100)]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                    alt.id === questao.gabarito
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]'
                  }`} style={{ fontWeight: 600 }}>
                    {alt.id.toUpperCase()}
                  </div>
                  <span className="flex-1 text-[var(--color-neutral-700)]">{alt.texto}</span>
                  {alt.id === questao.gabarito && <Badge variant="success" size="sm">Gabarito</Badge>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[var(--color-info-surface)] border-[var(--color-primary)]/15" accent="primary">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[var(--color-primary-dark)]">
            <strong>{questoes.length} questões</strong> prontas para revisão
          </p>
          <Button size="sm" variant="outline">
            <Plus size={14} />
            Adicionar Questão
          </Button>
        </div>
      </Card>
    </div>
  );
}
