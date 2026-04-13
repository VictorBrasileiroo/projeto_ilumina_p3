import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Questao {
  id: number;
  enunciado: string;
  alternativas: { id: string; texto: string }[];
  resposta?: string;
}

export default function Prova() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [questoes, setQuestoes] = useState<Questao[]>([
    {
      id: 1,
      enunciado: 'Qual é o resultado da equação 2x + 5 = 13?',
      alternativas: [
        { id: 'a', texto: 'x = 3' },
        { id: 'b', texto: 'x = 4' },
        { id: 'c', texto: 'x = 5' },
        { id: 'd', texto: 'x = 6' },
      ],
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
    },
  ]);

  const handleResposta = (alternativaId: string) => {
    const novasQuestoes = [...questoes];
    novasQuestoes[questaoAtual].resposta = alternativaId;
    setQuestoes(novasQuestoes);
  };

  const handleSubmit = () => {
    const respondidas = questoes.filter(q => q.resposta).length;
    if (respondidas < questoes.length) {
      if (!confirm(`Você respondeu ${respondidas} de ${questoes.length} questões. Finalizar mesmo assim?`)) return;
    }
    navigate(`/aluno/resultado/${id}`);
  };

  const questao = questoes[questaoAtual];
  const respondidas = questoes.filter(q => q.resposta).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1>Prova de Matemática</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">9º A - Matemática</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/aluno')}>Salvar e Sair</Button>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-[var(--color-neutral-600)]" style={{ fontWeight: 500 }}>
            {respondidas} de {questoes.length} respondidas
          </span>
          <span className="text-[13px] text-[var(--color-neutral-400)]">
            {Math.round((respondidas / questoes.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-1.5">
          <div
            className="bg-[var(--color-primary)] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(respondidas / questoes.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Question pills */}
      <div className="flex flex-wrap gap-1.5">
        {questoes.map((_, index) => (
          <button
            key={index}
            onClick={() => setQuestaoAtual(index)}
            className={`w-9 h-9 rounded-[var(--border-radius)] text-[13px] transition-all ${
              index === questaoAtual
                ? 'bg-[var(--color-primary)] text-white'
                : questoes[index].resposta
                ? 'bg-[var(--color-success-surface)] text-[var(--color-success)] border border-[var(--color-success)]/20'
                : 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)] border border-[var(--color-neutral-100)]'
            }`}
            style={{ fontWeight: 600 }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-darken-02)] text-white flex items-center justify-center text-[13px]" style={{ fontWeight: 700 }}>
            {questaoAtual + 1}
          </div>
          <span className="text-[13px] text-[var(--color-neutral-400)]">Questão {questaoAtual + 1} de {questoes.length}</span>
        </div>
        <p className="text-[15px] text-[var(--color-neutral-800)] mb-5" style={{ fontWeight: 500, lineHeight: 1.6 }}>{questao.enunciado}</p>

        <div className="space-y-2">
          {questao.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => handleResposta(alt.id)}
              className={`w-full px-4 py-3 rounded-[var(--border-radius-lg)] border text-left transition-all flex items-center gap-3 text-[14px] ${
                questao.resposta === alt.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]'
                  : 'border-[var(--color-neutral-100)] hover:border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0 ${
                  questao.resposta === alt.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                }`}
                style={{ fontWeight: 600 }}
              >
                {alt.id.toUpperCase()}
              </div>
              <span className="text-[var(--color-neutral-700)]">{alt.texto}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
          disabled={questaoAtual === 0}
        >
          <ChevronLeft size={16} />
          Anterior
        </Button>

        {questaoAtual === questoes.length - 1 ? (
          <Button onClick={handleSubmit}>Finalizar Prova</Button>
        ) : (
          <Button onClick={() => setQuestaoAtual(Math.min(questoes.length - 1, questaoAtual + 1))}>
            Próxima
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {respondidas < questoes.length && (
        <Card className="p-3 bg-[var(--color-warning-surface)] border-[var(--color-warning)]/20" accent="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#6B5900] shrink-0" size={16} />
            <p className="text-[13px] text-[#6B5900]">
              {questoes.length - respondidas} questão(ões) sem resposta.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
