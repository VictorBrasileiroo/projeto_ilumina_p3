import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import type { AlternativaLetra, QuestaoResponse } from "../../types/prova";

const letras: AlternativaLetra[] = ["A", "B", "C", "D"];

interface QuestaoEditorProps {
  questao: QuestaoResponse;
  disabled?: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (draft: {
    enunciado: string;
    gabarito: AlternativaLetra;
    pontuacao: number;
    alternativas: { id: string; letra: AlternativaLetra; texto: string }[];
  }) => void;
}

export function QuestaoEditor({ questao, disabled = false, isSaving = false, onCancel, onSave }: QuestaoEditorProps) {
  const [enunciado, setEnunciado] = useState(questao.enunciado);
  const [gabarito, setGabarito] = useState<AlternativaLetra>(questao.gabarito);
  const [pontuacao, setPontuacao] = useState(questao.pontuacao);
  const [alternativas, setAlternativas] = useState(
    letras.map((letra) => {
      const alternativa = questao.alternativas.find((item) => item.letra === letra);
      return {
        id: alternativa?.id ?? "",
        letra,
        texto: alternativa?.texto ?? "",
      };
    }),
  );

  useEffect(() => {
    setEnunciado(questao.enunciado);
    setGabarito(questao.gabarito);
    setPontuacao(questao.pontuacao);
    setAlternativas(
      letras.map((letra) => {
        const alternativa = questao.alternativas.find((item) => item.letra === letra);
        return {
          id: alternativa?.id ?? "",
          letra,
          texto: alternativa?.texto ?? "",
        };
      }),
    );
  }, [questao]);

  const canSave = enunciado.trim() && pontuacao > 0 && alternativas.every((alternativa) => alternativa.id && alternativa.texto.trim());

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
          Enunciado
        </label>
        <textarea
          value={enunciado}
          onChange={(event) => setEnunciado(event.target.value)}
          disabled={disabled || isSaving}
          className="min-h-[110px] w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] disabled:opacity-60"
        />
      </div>

      <div className="max-w-[180px]">
        <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
          Pontuação
        </label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={pontuacao}
          onChange={(event) => {
            const value = Number(event.target.value);
            setPontuacao(Number.isNaN(value) ? 0 : value);
          }}
          disabled={disabled || isSaving}
          className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        {alternativas.map((alternativa) => (
          <div key={alternativa.letra} className="grid gap-2 rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <label className="flex items-center gap-2 text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
              <input
                type="radio"
                name={`gabarito-${questao.id}`}
                checked={gabarito === alternativa.letra}
                onChange={() => setGabarito(alternativa.letra)}
                disabled={disabled || isSaving}
              />
              <Badge variant={gabarito === alternativa.letra ? "success" : "neutral"}>{alternativa.letra}</Badge>
            </label>
            <input
              value={alternativa.texto}
              onChange={(event) => {
                setAlternativas((current) =>
                  current.map((item) => item.letra === alternativa.letra ? { ...item, texto: event.target.value } : item),
                );
              }}
              disabled={disabled || isSaving}
              className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] disabled:opacity-60"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--color-neutral-100)] pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X size={15} />
          Cancelar
        </Button>
        <Button
          onClick={() => onSave({ enunciado: enunciado.trim(), gabarito, pontuacao, alternativas })}
          disabled={disabled || isSaving || !canSave}
        >
          <Save size={15} />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
