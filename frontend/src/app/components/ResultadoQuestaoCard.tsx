import { Badge } from "./Badge";
import { Card } from "./Card";
import type { AlternativaAlunoResponse, QuestaoResultadoResponse } from "../types/prova";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultadoQuestaoCardProps {
  questao: QuestaoResultadoResponse;
  numero: number;
  alternativas?: AlternativaAlunoResponse[];
}

export function ResultadoQuestaoCard({ questao, numero, alternativas = [] }: ResultadoQuestaoCardProps) {
  return (
    <Card className="p-5" accent={questao.acertou ? "success" : "error"}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] ${
                questao.acertou
                  ? "bg-[var(--color-success-surface)] text-[var(--color-success)]"
                  : "bg-[var(--color-error-surface)] text-[var(--color-error)]"
              }`}
              style={{ fontWeight: 700 }}
            >
              {numero}
            </div>
            {questao.acertou ? (
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

          <p className="mb-3 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 500 }}>
            {questao.enunciado}
          </p>

          {alternativas.length > 0 ? (
            <div className="space-y-1.5">
              {alternativas.map((alt) => {
                const isGabarito = alt.letra === questao.gabarito;
                const isResposta = alt.letra === questao.letraEscolhida;

                return (
                  <div
                    key={alt.id}
                    className={`flex items-center gap-2.5 rounded-[var(--border-radius)] border px-3 py-2 text-[13px] ${
                      isGabarito
                        ? "border-[var(--color-success)] bg-[var(--color-success-surface)]"
                        : isResposta && !questao.acertou
                          ? "border-[var(--color-error)] bg-[var(--color-error-surface)]"
                          : "border-[var(--color-neutral-100)]"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isGabarito
                          ? "bg-[var(--color-success)] text-white"
                          : isResposta && !questao.acertou
                            ? "bg-[var(--color-error)] text-white"
                            : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {alt.letra}
                    </div>
                    <span className="flex-1 text-[var(--color-neutral-700)]">{alt.texto}</span>
                    {isGabarito && <Badge variant="success" size="sm">Gabarito</Badge>}
                    {isResposta && !questao.acertou && <Badge variant="error" size="sm">Sua resposta</Badge>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 600 }}>
                  Sua resposta
                </p>
                <p className={`mt-1 text-sm ${questao.acertou ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} style={{ fontWeight: 700 }}>
                  {questao.letraEscolhida}
                </p>
              </div>
              <div className="rounded-[var(--border-radius)] border border-[var(--color-success)]/20 bg-[var(--color-success-surface)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-secondary-green-dark)]" style={{ fontWeight: 600 }}>
                  Gabarito
                </p>
                <p className="mt-1 text-sm text-[var(--color-success)]" style={{ fontWeight: 700 }}>
                  {questao.gabarito}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
