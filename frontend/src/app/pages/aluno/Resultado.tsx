import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ResultadoQuestaoCard } from "../../components/ResultadoQuestaoCard";
import { alunoProvaService } from "../../services/alunoProvaService";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import { resultadoToNota } from "../../lib/mappings";
import type { ProvaDetalheAlunoResponse, ResultadoProvaResponse } from "../../types/prova";
import { Home } from "lucide-react";
import { toast } from "sonner";

function getResultadoFromState(state: unknown): ResultadoProvaResponse | null {
  if (!state || typeof state !== "object" || !("resultado" in state)) {
    return null;
  }

  const resultado = (state as { resultado?: unknown }).resultado;

  if (!resultado || typeof resultado !== "object" || !("provaId" in resultado)) {
    return null;
  }

  return resultado as ResultadoProvaResponse;
}

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resultado, setResultado] = useState<ResultadoProvaResponse | null>(() => getResultadoFromState(location.state));
  const [detalhe, setDetalhe] = useState<ProvaDetalheAlunoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!getResultadoFromState(location.state));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResultado(provaId: string) {
      setIsLoading(true);
      setError(null);

      try {
        const [resultadoResult, detalheResult] = await Promise.allSettled([
          resultado ? Promise.resolve(resultado) : alunoProvaService.buscarResultado(provaId),
          alunoProvaService.detalhar(provaId),
        ]);

        if (!active) {
          return;
        }

        if (detalheResult.status === "fulfilled") {
          setDetalhe(detalheResult.value);
        }

        if (resultadoResult.status === "fulfilled") {
          setResultado(resultadoResult.value);
        } else {
          throw resultadoResult.reason;
        }
      } catch (nextError) {
        if (!active) {
          return;
        }

        const message = extractHttpErrorMessage(nextError, "Nao foi possivel carregar o resultado.");
        setError(message);

        if (nextError instanceof HttpError && (nextError.status === 403 || nextError.status === 404)) {
          toast.error(message);
          navigate("/aluno/provas", { replace: true });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (!id) {
      setIsLoading(false);
      return;
    }

    loadResultado(id);

    return () => {
      active = false;
    };
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Carregando resultado...</p>
        </Card>
      </div>
    );
  }

  if (error || !resultado) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="p-6" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error ?? "Resultado nao encontrado."}</p>
        </Card>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno/provas")}>Voltar para provas</Button>
      </div>
    );
  }

  const nota = resultadoToNota(resultado);
  const pct = resultado.totalQuestoes > 0 ? Math.round((resultado.totalAcertos / resultado.totalQuestoes) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Resultado</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{resultado.provaTitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno")}>
          <Home size={16} />
          Dashboard
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center">
          <div className="relative mx-auto mb-5 h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[1.75rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>
                {nota.toFixed(1)}
              </span>
              <span className="text-[11px] text-[var(--color-neutral-400)]">de 10</span>
            </div>
          </div>

          <h2 className="mb-1">Resultado registrado</h2>
          <p className="mb-6 text-sm text-[var(--color-neutral-500)]">
            Voce acertou {resultado.totalAcertos} de {resultado.totalQuestoes} questoes
          </p>

          <div className="flex items-center justify-center gap-10">
            <div>
              <div className="text-[1.5rem] text-[var(--color-success)]" style={{ fontWeight: 700 }}>{resultado.totalAcertos}</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Acertos</div>
            </div>
            <div className="h-10 w-px bg-[var(--color-neutral-100)]" />
            <div>
              <div className="text-[1.5rem] text-[var(--color-error)]" style={{ fontWeight: 700 }}>{resultado.totalQuestoes - resultado.totalAcertos}</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Erros</div>
            </div>
            <div className="h-10 w-px bg-[var(--color-neutral-100)]" />
            <div>
              <div className="text-[1.5rem] text-[var(--color-neutral-700)]" style={{ fontWeight: 700 }}>{pct}%</div>
              <div className="text-[12px] text-[var(--color-neutral-400)]">Aproveitamento</div>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-[15px]">Gabarito</h3>
        <div className="space-y-3">
          {resultado.questoes.map((questao, index) => (
            <ResultadoQuestaoCard
              key={questao.questaoId}
              questao={questao}
              numero={index + 1}
              alternativas={detalhe?.questoes.find((item) => item.id === questao.questaoId)?.alternativas}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
