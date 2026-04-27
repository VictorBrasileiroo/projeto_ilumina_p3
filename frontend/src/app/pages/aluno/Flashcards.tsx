import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { alunoColecaoService } from "../../services/alunoColecaoService";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import { getFlashcardProgress, saveFlashcardProgress } from "../../lib/flashcardProgress";
import type { ColecaoDetalheAlunoResponse } from "../../types/flashcard";
import { ChevronLeft, ChevronRight, RotateCcw, Home } from "lucide-react";

export default function Flashcards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [colecao, setColecao] = useState<ColecaoDetalheAlunoResponse | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadColecao(colecaoId: string) {
      setIsLoading(true);
      setError(null);

      try {
        const data = await alunoColecaoService.detalhar(colecaoId);

        if (active) {
          setColecao(data);
          const progress = getFlashcardProgress(colecaoId);
          const savedIndex = progress ? Math.min(progress.currentIndex, Math.max(0, data.flashcards.length - 1)) : 0;
          setCurrentCard(savedIndex);
          setIsFlipped(false);
        }
      } catch (nextError) {
        if (!active) {
          return;
        }

        const message = extractHttpErrorMessage(nextError, "Nao foi possivel carregar a colecao.");
        setError(message);

        if (nextError instanceof HttpError && (nextError.status === 403 || nextError.status === 404)) {
          toast.error(message);
          navigate("/aluno/flashcards", { replace: true });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (!id) {
      setError("Colecao nao encontrada.");
      setIsLoading(false);
      return;
    }

    loadColecao(id);

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const flashcards = colecao?.flashcards ?? [];
  const card = flashcards[currentCard];

  useEffect(() => {
    if (!colecao || flashcards.length === 0) {
      return;
    }

    saveFlashcardProgress(colecao.id, currentCard, flashcards.length);
  }, [colecao, currentCard, flashcards.length]);

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Carregando colecao...</p>
        </Card>
      </div>
    );
  }

  if (error || !colecao) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="p-6" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error ?? "Colecao nao encontrada."}</p>
        </Card>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno/flashcards")}>Voltar para colecoes</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1>{colecao.titulo}</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {colecao.tema ?? "Sem tema"} - {colecao.turmaNome}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno/flashcards")}>
          <Home size={16} />
          Voltar
        </Button>
      </div>

      {flashcards.length === 0 || !card ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Esta colecao ainda nao possui flashcards publicados.</p>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] text-[var(--color-neutral-600)]" style={{ fontWeight: 500 }}>
                Card {currentCard + 1} de {flashcards.length}
              </span>
              <Button size="sm" variant="ghost" onClick={handleReset}>
                <RotateCcw size={14} />
                Reiniciar
              </Button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-neutral-100)]">
              <div
                className="h-1.5 rounded-full bg-[var(--color-secondary-green)] transition-all duration-300"
                style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </Card>

          <div className="relative">
            <div className="cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: "1000px" }}>
              <div
                className="transition-all duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                }}
              >
                <Card className="flex min-h-[340px] items-center justify-center p-10">
                  <div className="w-full text-center" style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)" }}>
                    {!isFlipped ? (
                      <>
                        <div className="mb-3 text-[11px] uppercase tracking-widest text-[var(--color-neutral-400)]" style={{ fontWeight: 500 }}>Frente</div>
                        <h2 className="text-[2rem] text-[var(--color-primary-darken-02)]" style={{ fontWeight: 700 }}>{card.frente}</h2>
                        <p className="mt-8 text-[12px] text-[var(--color-neutral-300)]">Clique para ver a resposta</p>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 text-[11px] uppercase tracking-widest text-[var(--color-secondary-green)]" style={{ fontWeight: 500 }}>Verso</div>
                        <p className="mx-auto max-h-[220px] max-w-xl overflow-y-auto whitespace-pre-wrap break-words text-[1.1rem] leading-8 text-[var(--color-primary-darken-02)]" style={{ fontWeight: 500 }}>
                          {card.verso}
                        </p>
                        <p className="mt-8 text-[12px] text-[var(--color-neutral-300)]">Clique para voltar</p>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrev}
              disabled={currentCard === 0}
              className={`absolute left-0 top-1/2 flex h-10 w-10 -translate-x-14 -translate-y-1/2 items-center justify-center rounded-full transition-all ${
                currentCard === 0
                  ? "cursor-not-allowed bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)]"
                  : "bg-white text-[var(--color-neutral-600)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentCard === flashcards.length - 1}
              className={`absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 translate-x-14 items-center justify-center rounded-full transition-all ${
                currentCard === flashcards.length - 1
                  ? "cursor-not-allowed bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)]"
                  : "bg-white text-[var(--color-neutral-600)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex justify-center gap-1.5">
            {flashcards.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentCard(index);
                  setIsFlipped(false);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === currentCard
                    ? "scale-125 bg-[var(--color-secondary-green)]"
                    : "bg-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-300)]"
                }`}
              />
            ))}
          </div>

          <Card className="border-[var(--color-primary)]/10 bg-[var(--color-info-surface)] p-3" accent="primary">
            <p className="text-[12px] text-[var(--color-primary-dark)]">
              <strong>Dica:</strong> Clique no card para virar. Use as setas para navegar.
            </p>
          </Card>

          {currentCard === flashcards.length - 1 && (
            <Card className="border-[var(--color-success)]/15 bg-[var(--color-success-surface)] p-5 text-center" accent="success">
              <h3 className="mb-1">Voce chegou ao final da colecao.</h3>
              <p className="mb-3 text-[13px] text-[var(--color-secondary-green-dark)]">Reinicie quando quiser revisar novamente.</p>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                <RotateCcw size={14} />
                Estudar novamente
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
