import { Trash2 } from "lucide-react";
import { Card } from "./Card";
import type { FlashcardResponse } from "../types/flashcard";

interface FlashcardEditorProps {
  card: FlashcardResponse;
  index: number;
  disabled?: boolean;
  isSaving?: boolean;
  onChange: (cardId: string, nextCard: FlashcardResponse) => void;
  onSave: (card: FlashcardResponse) => void;
  onRemove: (cardId: string) => void;
}

export function FlashcardEditor({
  card,
  index,
  disabled = false,
  isSaving = false,
  onChange,
  onSave,
  onRemove,
}: FlashcardEditorProps) {
  const inputClassName = "w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-[6px] text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] disabled:bg-[var(--color-neutral-50)] disabled:text-[var(--color-neutral-400)]";

  return (
    <Card className="p-3">
      <div
        className="flex items-center gap-3"
        onBlur={(event) => {
          const nextFocused = event.relatedTarget;
          if (!nextFocused || !event.currentTarget.contains(nextFocused as Node)) {
            onSave(card);
          }
        }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[12px] text-[var(--color-neutral-500)]" style={{ fontWeight: 600 }}>
          {index + 1}
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 500 }}>
              Frente
            </label>
            <input
              type="text"
              value={card.frente}
              onChange={(event) => onChange(card.id, { ...card, frente: event.target.value })}
              disabled={disabled || isSaving}
              placeholder="Pergunta ou termo"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 500 }}>
              Verso
            </label>
            <input
              type="text"
              value={card.verso}
              onChange={(event) => onChange(card.id, { ...card, verso: event.target.value })}
              disabled={disabled || isSaving}
              placeholder="Resposta ou explicacao"
              className={inputClassName}
            />
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(card.id)}
            disabled={isSaving}
            className="shrink-0 rounded-[var(--border-radius)] p-1.5 transition-colors hover:bg-[var(--color-error-surface)] disabled:pointer-events-none disabled:opacity-40"
            title="Remover card"
          >
            <Trash2 size={14} className="text-[var(--color-error)]" />
          </button>
        )}
      </div>
    </Card>
  );
}
