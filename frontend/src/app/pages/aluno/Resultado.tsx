import { useNavigate, useParams } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { CheckCircle, XCircle, Home } from 'lucide-react';

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const resultado = {
    prova: 'Prova de Matemática',
    nota: 8.0,
    acertos: 8,
    total: 10,
  };

  const questoes = [
    {
      numero: 1,
      enunciado: 'Qual é o resultado da equação 2x + 5 = 13?',
      alternativas: [
        { id: 'a', texto: 'x = 3' },
        { id: 'b', texto: 'x = 4' },
        { id: 'c', texto: 'x = 5' },
        { id: 'd', texto: 'x = 6' },
      ],
      gabarito: 'b',
      resposta: 'b',
      correta: true,
    },
    {
      numero: 2,
      enunciado: 'Calcule a área de um retângulo com base 8cm e altura 5cm.',
      alternativas: [
        { id: 'a', texto: '13 cm²' },
        { id: 'b', texto: '26 cm²' },
        { id: 'c', texto: '40 cm²' },
        { id: 'd', texto: '80 cm²' },
      ],
      gabarito: 'c',
      resposta: 'd',
      correta: false,
    },
    {
      numero: 3,
      enunciado: 'Qual é o valor de √144?',
      alternativas: [
        { id: 'a', texto: '10' },
        { id: 'b', texto: '11' },
        { id: 'c', texto: '12' },
        { id: 'd', texto: '13' },
      ],
      gabarito: 'c',
      resposta: 'c',
      correta: true,
    },
  ];

  const pct = Math.round((resultado.acertos / resultado.total) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Resultado</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">{resultado.prova}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/aluno')}>
          <Home size={16} />
          Dashboard
        </Button>
      </div>

      {/* Score card */}
      <Card className="p-8">
        <div className="text-center">
          {/* Circular score */}
          <div className="relative w-28 h-28 mx-auto mb-5">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{resultado.nota}</span>
              <span className="text-[11px] text-[var(--color-neutral-400)]">de 10</span>
            </div>
          </div>

          <h2 className="mb-1">Parabéns!</h2>
          <p className="text-[var(--color-neutral-500)] text-sm mb-6">
            Você acertou {resultado.acertos} de {resultado.total} questões
          </p>

          <div className="flex items-center justify-center gap-10">
            <div>
              <div className="text-[1.5rem] text-[var(--color-success)]" style={{ fontWeight: 700 }}>{resultado.acertos}</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Acertos</div>
            </div>
            <div className="w-px h-10 bg-[var(--color-neutral-100)]" />
            <div>
              <div className="text-[1.5rem] text-[var(--color-error)]" style={{ fontWeight: 700 }}>{resultado.total - resultado.acertos}</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Erros</div>
            </div>
            <div className="w-px h-10 bg-[var(--color-neutral-100)]" />
            <div>
              <div className="text-[1.5rem] text-[var(--color-neutral-700)]" style={{ fontWeight: 700 }}>{pct}%</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Aproveitamento</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gabarito */}
      <div>
        <h3 className="text-[15px] mb-3">Gabarito</h3>
        <div className="space-y-3">
          {questoes.map((questao) => (
            <Card key={questao.numero} className="p-5" accent={questao.correta ? 'success' : 'error'}>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] shrink-0 ${
                  questao.correta
                    ? 'bg-[var(--color-success-surface)] text-[var(--color-success)]'
                    : 'bg-[var(--color-error-surface)] text-[var(--color-error)]'
                }`} style={{ fontWeight: 700 }}>
                  {questao.numero}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {questao.correta ? (
                      <>
                        <CheckCircle className="text-[var(--color-success)]" size={16} />
                        <Badge variant="success" size="sm">Correta</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-[var(--color-error)]" size={16} />
                        <Badge variant="error" size="sm">Incorreta</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-[14px] text-[var(--color-neutral-800)] mb-3" style={{ fontWeight: 500 }}>{questao.enunciado}</p>
                  <div className="space-y-1.5">
                    {questao.alternativas.map((alt) => {
                      const isGabarito = alt.id === questao.gabarito;
                      const isResposta = alt.id === questao.resposta;

                      return (
                        <div
                          key={alt.id}
                          className={`px-3 py-2 rounded-[var(--border-radius)] border flex items-center gap-2.5 text-[13px] ${
                            isGabarito
                              ? 'border-[var(--color-success)] bg-[var(--color-success-surface)]'
                              : isResposta && !questao.correta
                              ? 'border-[var(--color-error)] bg-[var(--color-error-surface)]'
                              : 'border-[var(--color-neutral-100)]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                              isGabarito
                                ? 'bg-[var(--color-success)] text-white'
                                : isResposta && !questao.correta
                                ? 'bg-[var(--color-error)] text-white'
                                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                            }`} style={{ fontWeight: 600 }}>
                            {alt.id.toUpperCase()}
                          </div>
                          <span className="flex-1 text-[var(--color-neutral-700)]">{alt.texto}</span>
                          {isGabarito && <Badge variant="success" size="sm">Gabarito</Badge>}
                          {isResposta && !questao.correta && <Badge variant="error" size="sm">Sua resposta</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
