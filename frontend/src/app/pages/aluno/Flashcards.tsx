import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ChevronLeft, ChevronRight, RotateCcw, Home } from 'lucide-react';

interface Flashcard {
  id: number;
  frente: string;
  verso: string;
}

export default function Flashcards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const colecao = { titulo: 'Verbos em Inglês - Básico', tema: 'Inglês' };

  const flashcards: Flashcard[] = [
    { id: 1, frente: 'To be', verso: 'Ser ou estar' },
    { id: 2, frente: 'To have', verso: 'Ter ou possuir' },
    { id: 3, frente: 'To do', verso: 'Fazer' },
    { id: 4, frente: 'To go', verso: 'Ir' },
    { id: 5, frente: 'To get', verso: 'Obter, conseguir' },
  ];

  const card = flashcards[currentCard];

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1>{colecao.titulo}</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">{colecao.tema}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/aluno')}>
          <Home size={16} />
          Voltar
        </Button>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-[var(--color-neutral-600)]" style={{ fontWeight: 500 }}>
            Card {currentCard + 1} de {flashcards.length}
          </span>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw size={14} />
            Reiniciar
          </Button>
        </div>
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-1.5">
          <div
            className="bg-[var(--color-secondary-green)] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Flashcard */}
      <div className="relative">
        <div
          className="cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: '1000px' }}
        >
          <div
            className="transition-all duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
          >
            <Card className="min-h-[340px] p-10 flex items-center justify-center">
              <div
                className="text-center w-full"
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
              >
                {!isFlipped ? (
                  <>
                    <div className="text-[11px] text-[var(--color-neutral-400)] mb-3 uppercase tracking-widest" style={{ fontWeight: 500 }}>Frente</div>
                    <h2 className="text-[2rem] text-[var(--color-primary-darken-02)]" style={{ fontWeight: 700 }}>{card.frente}</h2>
                    <p className="text-[12px] text-[var(--color-neutral-300)] mt-8">Clique para ver a resposta</p>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] text-[var(--color-secondary-green)] mb-3 uppercase tracking-widest" style={{ fontWeight: 500 }}>Verso</div>
                    <h2 className="text-[2rem] text-[var(--color-primary-darken-02)]" style={{ fontWeight: 700 }}>{card.verso}</h2>
                    <p className="text-[12px] text-[var(--color-neutral-300)] mt-8">Clique para voltar</p>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          disabled={currentCard === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentCard === 0
              ? 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)] cursor-not-allowed'
              : 'bg-white shadow-[var(--shadow-md)] text-[var(--color-neutral-600)] hover:shadow-[var(--shadow-lg)]'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNext}
          disabled={currentCard === flashcards.length - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentCard === flashcards.length - 1
              ? 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)] cursor-not-allowed'
              : 'bg-white shadow-[var(--shadow-md)] text-[var(--color-neutral-600)] hover:shadow-[var(--shadow-lg)]'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5">
        {flashcards.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentCard(index); setIsFlipped(false); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentCard
                ? 'bg-[var(--color-secondary-green)] scale-125'
                : 'bg-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-300)]'
            }`}
          />
        ))}
      </div>

      {/* Tip */}
      <Card className="p-3 bg-[var(--color-info-surface)] border-[var(--color-primary)]/10" accent="primary">
        <p className="text-[12px] text-[var(--color-primary-dark)]">
          <strong>Dica:</strong> Clique no card para virar. Use as setas para navegar.
        </p>
      </Card>

      {currentCard === flashcards.length - 1 && (
        <Card className="p-5 bg-[var(--color-success-surface)] border-[var(--color-success)]/15 text-center" accent="success">
          <h3 className="mb-1">Parabéns!</h3>
          <p className="text-[13px] text-[var(--color-secondary-green-dark)] mb-3">Você chegou ao final da coleção!</p>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw size={14} />
            Estudar Novamente
          </Button>
        </Card>
      )}
    </div>
  );
}
