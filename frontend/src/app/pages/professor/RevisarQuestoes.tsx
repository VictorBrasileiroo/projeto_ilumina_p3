import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmarPublicacaoDialog } from "../../components/professor/ConfirmarPublicacaoDialog";
import { QuestaoEditor } from "../../components/professor/QuestaoEditor";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import { provaService } from "../../services/provaService";
import type { AlternativaLetra, ProvaDetalheResponse, QuestaoResponse } from "../../types/prova";
import { ArrowLeft, Check, Edit, Plus, Sparkles, Trash2, Undo2 } from "lucide-react";

interface RevisarLocationState {
  detalhe?: ProvaDetalheResponse;
  needsGeneration?: boolean;
  tema?: string;
  quantidade?: number;
}

const letras: AlternativaLetra[] = ["A", "B", "C", "D"];

function sortQuestoes(questoes: QuestaoResponse[]) {
  return [...questoes].sort((a, b) => a.ordem - b.ordem);
}

export default function RevisarQuestoes() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as RevisarLocationState;
  const [prova, setProva] = useState<ProvaDetalheResponse | null>(state.detalhe ?? null);
  const [needsGeneration, setNeedsGeneration] = useState(Boolean(state.needsGeneration));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!state.detalhe);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublished = prova?.status === "PUBLICADA";
  const questoes = useMemo(() => sortQuestoes(prova?.questoes ?? []), [prova?.questoes]);

  async function loadProva(provaId = id) {
    if (!provaId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detalhe = await provaService.detalhar(provaId);
      setProva(detalhe);
      setNeedsGeneration(detalhe.questoes.length === 0 && detalhe.status === "RASCUNHO");
    } catch (nextError) {
      const message = extractHttpErrorMessage(nextError, "Nao foi possivel carregar a prova.");
      if (nextError instanceof HttpError && nextError.status === 403) {
        toast.error(message);
        navigate("/professor/provas");
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!state.detalhe) {
      void loadProva();
    }
  }, [id]);

  async function handleGenerate() {
    if (!prova) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const detalhe = await provaService.gerarQuestoes(prova.id, {
        tema: state.tema || prova.descricao || prova.titulo,
        quantidade: state.quantidade || prova.qntQuestoes || 10,
      });
      setProva(detalhe);
      setNeedsGeneration(false);
      toast.success("Questões geradas com sucesso.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel gerar questões."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (!prova) {
      return;
    }

    setIsSaving(true);

    try {
      await provaService.publicar(prova.id);
      toast.success("Prova publicada com sucesso.");
      navigate("/professor/provas");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel publicar a prova."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!prova) {
      return;
    }

    setIsSaving(true);

    try {
      await provaService.despublicar(prova.id);
      await loadProva(prova.id);
      toast.success("Prova retornou para rascunho.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel despublicar a prova."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!prova || isPublished) {
      return;
    }

    setIsSaving(true);

    try {
      await provaService.excluir(prova.id);
      toast.success("Prova excluida com sucesso.");
      navigate("/professor/provas");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel excluir a prova."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddQuestion() {
    if (!prova || isPublished) {
      return;
    }

    const ordem = questoes.length + 1;
    setIsSaving(true);

    try {
      const created = await provaService.adicionarQuestao(prova.id, {
        enunciado: `Nova questão ${ordem}`,
        gabarito: "A",
        pontuacao: 1,
        ordem,
        alternativas: letras.map((letra) => ({
          letra,
          texto: `Alternativa ${letra}`,
        })),
      });
      await loadProva(prova.id);
      setEditingId(created.id);
      toast.success("Questão adicionada.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel adicionar a questão."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveQuestion(questaoId: string) {
    if (!prova || isPublished) {
      return;
    }

    setIsSaving(true);

    try {
      await provaService.removerQuestao(prova.id, questaoId);
      await loadProva(prova.id);
      toast.success("Questão removida.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel remover a questão."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveQuestion(
    questaoId: string,
    draft: {
      enunciado: string;
      gabarito: AlternativaLetra;
      pontuacao: number;
      alternativas: { id: string; letra: AlternativaLetra; texto: string }[];
    },
  ) {
    if (!prova || isPublished) {
      return;
    }

    setIsSaving(true);

    try {
      await provaService.atualizarQuestao(prova.id, questaoId, {
        enunciado: draft.enunciado,
        gabarito: draft.gabarito,
        pontuacao: draft.pontuacao,
      });

      await Promise.all(
        draft.alternativas.map((alternativa) =>
          provaService.atualizarAlternativa(prova.id, questaoId, alternativa.id, {
            texto: alternativa.texto,
          }),
        ),
      );

      await loadProva(prova.id);
      setEditingId(null);
      toast.success("Questão atualizada.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel salvar a questão."));
      await loadProva(prova.id);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando prova...</Card>;
  }

  if (!prova) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[var(--color-neutral-500)]">{error ?? "Prova nao encontrada."}</p>
        <Button className="mt-4" variant="ghost" onClick={() => navigate("/professor/provas")}>
          <ArrowLeft size={16} />
          Voltar para provas
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <button type="button" onClick={() => navigate("/professor/provas")} className="mt-1 rounded-[var(--border-radius)] p-2 transition-colors hover:bg-[var(--color-neutral-50)]">
            <ArrowLeft size={20} className="text-[var(--color-neutral-500)]" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1>Revisar Questões</h1>
              <Badge variant={isPublished ? "success" : "warning"}>{isPublished ? "Publicada" : "Rascunho"}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              {prova.titulo} · {prova.turmaNome}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPublished ? (
            <ConfirmarPublicacaoDialog
              trigger={(
                <button type="button" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-[var(--border-radius)] border border-[var(--color-primary)] bg-transparent px-5 py-2 text-[15px] font-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-surface)] disabled:pointer-events-none disabled:opacity-40">
                  <Undo2 size={16} />
                  Despublicar
                </button>
              )}
              title="Despublicar prova?"
              description="A prova volta para rascunho e deixa de ficar disponivel para os alunos."
              confirmLabel="Despublicar"
              onConfirm={() => void handleUnpublish()}
              disabled={isSaving}
            />
          ) : (
            <>
              <ConfirmarPublicacaoDialog
                trigger={(
                  <button type="button" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-[var(--border-radius)] bg-[var(--color-error)] px-5 py-2 text-[15px] font-medium text-white transition-all hover:bg-[#C91B06] disabled:pointer-events-none disabled:opacity-40">
                    <Trash2 size={16} />
                    Excluir Rascunho
                  </button>
                )}
                title="Excluir prova?"
                description="Esta ação remove o rascunho da prova."
                confirmLabel="Excluir"
                destructive
                onConfirm={() => void handleDelete()}
                disabled={isSaving}
              />
              <ConfirmarPublicacaoDialog
                trigger={(
                  <button type="button" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-[var(--border-radius)] bg-[var(--color-primary)] px-5 py-2 text-[15px] font-medium text-white transition-all hover:bg-[var(--color-primary-dark)] disabled:pointer-events-none disabled:opacity-40">
                    <Check size={16} />
                    Publicar Prova
                  </button>
                )}
                title="Publicar prova?"
                description="Depois de publicada, a prova fica disponivel para os alunos e as edições ficam bloqueadas até despublicar."
                confirmLabel="Publicar"
                onConfirm={() => void handlePublish()}
                disabled={isSaving}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      {isPublished ? (
        <Card className="border-[var(--color-success-surface)] bg-[var(--color-success-surface)] p-4" accent="success">
          <p className="text-[13px] text-[var(--color-secondary-green-dark)]">
            <strong>Publicada</strong> — as questões estão bloqueadas para edição. Despublique para reabrir ajustes.
          </p>
        </Card>
      ) : needsGeneration || questoes.length === 0 ? (
        <Card className="bg-[var(--color-warning-surface)] p-4" accent="warning">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#6B5900]">
              <strong>Prova vazia</strong> — a geração anterior não concluiu ou ainda não há questões.
            </p>
            <Button size="sm" onClick={handleGenerate} disabled={isSaving}>
              <Sparkles size={14} />
              {isSaving ? "Gerando..." : "Gerar agora"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-[var(--color-warning-surface)] p-4" accent="warning">
          <p className="text-[13px] text-[#6B5900]">
            <strong>Rascunho</strong> — revise as questões geradas pela IA e faça os ajustes necessários antes de publicar.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {questoes.map((questao, index) => (
          <Card key={questao.id} className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-darken-02)] text-[13px] text-white" style={{ fontWeight: 700 }}>
                  {index + 1}
                </div>
                <Badge variant="info">Múltipla Escolha</Badge>
                <Badge variant="neutral">{questao.pontuacao} pts</Badge>
              </div>
              {!isPublished && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditingId(questao.id)} className="rounded-[var(--border-radius)] p-1.5 transition-colors hover:bg-[var(--color-neutral-50)]">
                    <Edit size={15} className="text-[var(--color-neutral-400)]" />
                  </button>
                  <ConfirmarPublicacaoDialog
                    trigger={(
                      <button type="button" disabled={isSaving} className="rounded-[var(--border-radius)] p-1.5 transition-colors hover:bg-[var(--color-error-surface)] disabled:pointer-events-none disabled:opacity-40">
                        <Trash2 size={15} className="text-[var(--color-error)]" />
                      </button>
                    )}
                    title="Remover questão?"
                    description="A questão será removida e a sequência será reorganizada pelo backend."
                    confirmLabel="Remover"
                    destructive
                    onConfirm={() => void handleRemoveQuestion(questao.id)}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>

            {editingId === questao.id ? (
              <QuestaoEditor
                questao={questao}
                disabled={isPublished}
                isSaving={isSaving}
                onCancel={() => setEditingId(null)}
                onSave={(draft) => void handleSaveQuestion(questao.id, draft)}
              />
            ) : (
              <>
                <p className="mb-4 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 500 }}>{questao.enunciado}</p>

                <div className="space-y-2">
                  {[...questao.alternativas].sort((a, b) => a.letra.localeCompare(b.letra)).map((alt) => (
                    <div
                      key={alt.id}
                      className={`flex items-center gap-3 rounded-[var(--border-radius)] border px-3 py-2.5 text-[13px] ${
                        alt.letra === questao.gabarito
                          ? "border-[var(--color-success)] bg-[var(--color-success-surface)]"
                          : "border-[var(--color-neutral-100)]"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        alt.letra === questao.gabarito
                          ? "bg-[var(--color-success)] text-white"
                          : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"
                      }`} style={{ fontWeight: 600 }}>
                        {alt.letra}
                      </div>
                      <span className="flex-1 text-[var(--color-neutral-700)]">{alt.texto}</span>
                      {alt.letra === questao.gabarito && <Badge variant="success" size="sm">Gabarito</Badge>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-[var(--color-info-surface)] p-4" accent="primary">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[var(--color-primary-dark)]">
            <strong>{questoes.length} questões</strong> vinculadas a esta prova
          </p>
          <Button size="sm" variant="outline" onClick={handleAddQuestion} disabled={isPublished || isSaving}>
            <Plus size={14} />
            Adicionar Questão
          </Button>
        </div>
      </Card>

    </div>
  );
}
