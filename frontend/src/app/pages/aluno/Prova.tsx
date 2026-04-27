import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { SubmeterProvaDialog } from "../../components/SubmeterProvaDialog";
import { alunoProvaService } from "../../services/alunoProvaService";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import type { AlternativaLetra, ProvaDetalheAlunoResponse, SubmissaoRespostasRequest } from "../../types/prova";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

type RespostasState = Record<string, AlternativaLetra>;

export default function Prova() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prova, setProva] = useState<ProvaDetalheAlunoResponse | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProva(provaId: string) {
      setIsLoading(true);
      setError(null);

      try {
        const resultado = await alunoProvaService.buscarResultado(provaId);

        if (active) {
          navigate(`/aluno/resultado/${provaId}`, { replace: true, state: { resultado } });
        }
      } catch (resultadoError) {
        if (resultadoError instanceof HttpError && resultadoError.status === 404) {
          try {
            const detalhe = await alunoProvaService.detalhar(provaId);

            if (active) {
              setProva(detalhe);
              setRespostas({});
            }
          } catch (detalheError) {
            if (active) {
              const message = extractHttpErrorMessage(detalheError, "Nao foi possivel carregar a prova.");
              setError(message);

              if (detalheError instanceof HttpError && (detalheError.status === 403 || detalheError.status === 404)) {
                toast.error(message);
                navigate("/aluno/provas", { replace: true });
              }
            }
          } finally {
            if (active) {
              setIsLoading(false);
            }
          }

          return;
        }

        if (active) {
          const message = extractHttpErrorMessage(resultadoError, "Nao foi possivel verificar se a prova ja foi respondida.");
          setError(message);
          setIsLoading(false);
        }
      }
    }

    if (!id) {
      setError("Prova nao encontrada.");
      setIsLoading(false);
      return;
    }

    loadProva(id);

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const questoes = prova?.questoes ?? [];
  const questao = questoes[questaoAtual];
  const respondidas = useMemo(() => questoes.filter((q) => respostas[q.id]).length, [questoes, respostas]);
  const todasRespondidas = prova ? respondidas === questoes.length && questoes.length > 0 : false;

  const handleResposta = (questaoId: string, letra: AlternativaLetra) => {
    setRespostas((current) => ({ ...current, [questaoId]: letra }));
  };

  const handleSubmit = async () => {
    if (!id || !prova || !todasRespondidas) {
      return;
    }

    const request: SubmissaoRespostasRequest = {
      respostas: prova.questoes.map((q) => ({
        questaoId: q.id,
        letraEscolhida: respostas[q.id],
      })),
    };

    setIsSubmitting(true);

    try {
      const resultado = await alunoProvaService.responder(id, request);
      toast.success("Respostas enviadas com sucesso.");
      navigate(`/aluno/resultado/${id}`, { state: { resultado } });
    } catch (nextError) {
      if (nextError instanceof HttpError && nextError.status === 409) {
        toast.error("Esta prova ja foi respondida. Abrindo seu resultado.");

        try {
          const resultado = await alunoProvaService.buscarResultado(id);
          navigate(`/aluno/resultado/${id}`, { replace: true, state: { resultado } });
        } catch (resultadoError) {
          toast.error(extractHttpErrorMessage(resultadoError, "Nao foi possivel abrir o resultado."));
          navigate("/aluno/provas", { replace: true });
        }

        return;
      }

      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel enviar as respostas."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Carregando prova...</p>
        </Card>
      </div>
    );
  }

  if (error || !prova || !questao) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="p-6" accent="error">
          <p className="text-sm text-[var(--color-error)]">{error ?? "Nao foi possivel carregar a prova."}</p>
        </Card>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno/provas")}>Voltar para provas</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1>{prova.titulo}</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {prova.turmaNome} - {prova.disciplina ?? "Sem disciplina"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/aluno/provas")}>Sair</Button>
      </div>

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] text-[var(--color-neutral-600)]" style={{ fontWeight: 500 }}>
            {respondidas} de {questoes.length} respondidas
          </span>
          <span className="text-[13px] text-[var(--color-neutral-400)]">
            {questoes.length ? Math.round((respondidas / questoes.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--color-neutral-100)]">
          <div
            className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${questoes.length ? (respondidas / questoes.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {questoes.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setQuestaoAtual(index)}
            className={`h-9 w-9 rounded-[var(--border-radius)] text-[13px] transition-all ${
              index === questaoAtual
                ? "bg-[var(--color-primary)] text-white"
                : respostas[item.id]
                  ? "border border-[var(--color-success)]/20 bg-[var(--color-success-surface)] text-[var(--color-success)]"
                  : "border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)]"
            }`}
            style={{ fontWeight: 600 }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-darken-02)] text-[13px] text-white" style={{ fontWeight: 700 }}>
            {questaoAtual + 1}
          </div>
          <span className="text-[13px] text-[var(--color-neutral-400)]">Questao {questaoAtual + 1} de {questoes.length}</span>
        </div>
        <p className="mb-5 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 500, lineHeight: 1.6 }}>
          {questao.enunciado}
        </p>

        <div className="space-y-2">
          {questao.alternativas.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => handleResposta(questao.id, alt.letra)}
              className={`flex w-full items-center gap-3 rounded-[var(--border-radius-lg)] border px-4 py-3 text-left text-[14px] transition-all ${
                respostas[questao.id] === alt.letra
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)]"
                  : "border-[var(--color-neutral-100)] hover:border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] ${
                  respostas[questao.id] === alt.letra
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
                }`}
                style={{ fontWeight: 600 }}
              >
                {alt.letra}
              </div>
              <span className="text-[var(--color-neutral-700)]">{alt.texto}</span>
            </button>
          ))}
        </div>
      </Card>

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
          <SubmeterProvaDialog
            respondidas={respondidas}
            totalQuestoes={questoes.length}
            disabled={!todasRespondidas}
            isSubmitting={isSubmitting}
            onConfirm={handleSubmit}
          />
        ) : (
          <Button onClick={() => setQuestaoAtual(Math.min(questoes.length - 1, questaoAtual + 1))}>
            Proxima
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {respondidas < questoes.length && (
        <Card className="border-[var(--color-warning)]/20 bg-[var(--color-warning-surface)] p-3" accent="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="shrink-0 text-[#6B5900]" size={16} />
            <p className="text-[13px] text-[#6B5900]">
              {questoes.length - respondidas} questao(oes) sem resposta.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
