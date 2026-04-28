import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { FlashcardEditor } from "../../components/FlashcardEditor";
import { AutoResizeTextarea } from "../../components/AutoResizeTextarea";
import { ConfirmarPublicacaoDialog } from "../../components/professor/ConfirmarPublicacaoDialog";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import { colecaoService } from "../../services/colecaoService";
import type { ColecaoDetalheResponse, FlashcardResponse } from "../../types/flashcard";
import { ArrowLeft, BookOpen, Check, Edit, Eye, Layers3, Plus, Save, Sparkles, X } from "lucide-react";

function sortCards(cards: FlashcardResponse[]) {
  return [...cards].sort((a, b) => a.ordem - b.ordem);
}

function statusLabel(status: ColecaoDetalheResponse["status"]) {
  return status === "PUBLICADA" ? "Publicada" : "Rascunho";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function FlashcardDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [colecao, setColecao] = useState<ColecaoDetalheResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ frente: "", verso: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cards = useMemo(() => sortCards(colecao?.flashcards ?? []), [colecao?.flashcards]);
  const isPublished = colecao?.status === "PUBLICADA";

  async function loadColecao(colecaoId = id) {
    if (!colecaoId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detalhe = await colecaoService.detalhar(colecaoId);
      setColecao(detalhe);
      if (detalhe.status === "PUBLICADA") {
        setEditing(false);
        setShowAddForm(false);
      }
    } catch (nextError) {
      const message = extractHttpErrorMessage(nextError, "Nao foi possivel carregar a colecao.");
      if (nextError instanceof HttpError && nextError.status === 403) {
        toast.error(message);
        navigate("/professor/flashcards");
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadColecao();
  }, [id]);

  function updateCardState(cardId: string, nextCard: FlashcardResponse) {
    setColecao((current) => current
      ? {
          ...current,
          flashcards: current.flashcards.map((card) => (card.id === cardId ? nextCard : card)),
        }
      : current);
  }

  async function handleSaveCard(card: FlashcardResponse) {
    if (!colecao || isPublished || isSaving) {
      return;
    }

    if (!card.frente.trim() || !card.verso.trim()) {
      toast.error("Frente e verso precisam estar preenchidos.");
      await loadColecao(colecao.id);
      return;
    }

    setIsSaving(true);

    try {
      const updated = await colecaoService.atualizarFlashcard(colecao.id, card.id, {
        frente: card.frente.trim(),
        verso: card.verso.trim(),
      });
      updateCardState(card.id, updated);
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel salvar o card."));
      await loadColecao(colecao.id);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!colecao || isPublished) {
      return;
    }

    setIsSaving(true);

    try {
      await colecaoService.removerFlashcard(colecao.id, cardId);
      setColecao({
        ...colecao,
        flashcards: colecao.flashcards.filter((card) => card.id !== cardId),
        totalFlashcards: Math.max(0, colecao.totalFlashcards - 1),
      });
      toast.success("Card removido.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel remover o card."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddCard() {
    if (!colecao || isPublished) {
      return;
    }

    if (!newCard.frente.trim() || !newCard.verso.trim()) {
      toast.error("Preencha frente e verso para adicionar o card.");
      return;
    }

    setIsSaving(true);

    try {
      const created = await colecaoService.adicionarFlashcard(colecao.id, {
        frente: newCard.frente.trim(),
        verso: newCard.verso.trim(),
      });
      setColecao({
        ...colecao,
        flashcards: sortCards([...colecao.flashcards, created]),
        totalFlashcards: colecao.totalFlashcards + 1,
      });
      setNewCard({ frente: "", verso: "" });
      setShowAddForm(false);
      toast.success("Card adicionado.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel adicionar o card."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateMore() {
    if (!colecao || isPublished) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const detalhe = await colecaoService.gerarFlashcards(colecao.id, {
        tema: colecao.tema || colecao.titulo,
        quantidade: colecao.qntCards || 5,
      });
      setColecao(detalhe);
      toast.success("Novos flashcards gerados.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel gerar flashcards."));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePublish() {
    if (!colecao) {
      return;
    }

    setIsSaving(true);

    try {
      await colecaoService.publicar(colecao.id);
      await loadColecao(colecao.id);
      toast.success("Colecao publicada com sucesso.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel publicar a colecao."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!colecao) {
      return;
    }

    setIsSaving(true);

    try {
      await colecaoService.despublicar(colecao.id);
      await loadColecao(colecao.id);
      toast.success("Colecao retornou para rascunho.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel despublicar a colecao."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isGenerating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[var(--color-secondary-green)]">
            <Sparkles className="text-white" size={28} />
          </div>
          <h3 className="mb-2">Gerando mais flashcards com IA</h3>
          <p className="text-sm text-[var(--color-neutral-500)]">
            Criando novos cards sobre "{colecao?.tema || colecao?.titulo}".
          </p>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
            <div className="h-1.5 rounded-full bg-[var(--color-secondary-green)] animate-[pulse_2s_ease-in-out_infinite]" style={{ width: "70%" }} />
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando coleção...</Card>;
  }

  if (!colecao) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[var(--color-neutral-500)]">{error ?? "Colecao nao encontrada."}</p>
        <Button className="mt-4" variant="ghost" onClick={() => navigate("/professor/flashcards")}>
          <ArrowLeft size={16} />
          Voltar para flashcards
        </Button>
      </Card>
    );
  }

  const generateTrigger = (
    <button
      type="button"
      disabled={isPublished || isSaving}
      className="inline-flex items-center justify-center gap-1.5 rounded-[var(--border-radius)] bg-[var(--color-secondary-green)] px-3 py-1.5 text-[14px] font-medium text-white transition-all hover:bg-[var(--color-secondary-green-dark)] disabled:pointer-events-none disabled:opacity-40"
    >
      <Sparkles size={14} />
      Gerar Mais com IA
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <button
            type="button"
            onClick={() => navigate("/professor/flashcards")}
            className="mt-1 rounded-[var(--border-radius)] p-2 transition-colors hover:bg-[var(--color-neutral-50)]"
          >
            <ArrowLeft size={20} className="text-[var(--color-neutral-500)]" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1>{colecao.titulo}</h1>
              <Badge variant={isPublished ? "success" : "warning"}>{statusLabel(colecao.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              {colecao.tema ?? "Sem tema"} · {colecao.turmaNome} · Criada em {formatDate(colecao.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isPublished && (
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} disabled={isSaving}>
              <Edit size={14} />
              {editing ? "Concluir Edição" : "Editar Cards"}
            </Button>
          )}
          {isPublished ? (
            <ConfirmarPublicacaoDialog
              trigger={(
                <button type="button" disabled={isSaving} className="inline-flex items-center justify-center gap-1.5 rounded-[var(--border-radius)] border border-[var(--color-primary)] bg-transparent px-3 py-1.5 text-[14px] font-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-surface)] disabled:pointer-events-none disabled:opacity-40">
                  <Eye size={14} />
                  Despublicar
                </button>
              )}
              title="Despublicar coleção?"
              description="A coleção volta para rascunho e deixa de ficar disponível para os alunos."
              confirmLabel="Despublicar"
              onConfirm={() => void handleUnpublish()}
              disabled={isSaving}
            />
          ) : (
            <ConfirmarPublicacaoDialog
              trigger={(
                <button type="button" disabled={isSaving} className="inline-flex items-center justify-center gap-1.5 rounded-[var(--border-radius)] bg-[var(--color-primary)] px-3 py-1.5 text-[14px] font-medium text-white transition-all hover:bg-[var(--color-primary-dark)] disabled:pointer-events-none disabled:opacity-40">
                  <Check size={14} />
                  Publicar
                </button>
              )}
              title="Publicar coleção?"
              description="Depois de publicada, a coleção fica disponível para os alunos e as edições ficam bloqueadas até despublicar."
              confirmLabel="Publicar"
              onConfirm={() => void handlePublish()}
              disabled={isSaving}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)] p-2.5">
              <BookOpen size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{cards.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Cards na coleção</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)] p-2.5">
              <Save size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{statusLabel(colecao.status)}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Status</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)] p-2.5">
              <Layers3 size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecao.qntCards ?? cards.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Cards planejados</p>
            </div>
          </div>
        </Card>
      </div>

      {isPublished ? (
        <Card className="bg-[var(--color-success-surface)] p-4" accent="success">
          <p className="text-[13px] text-[var(--color-secondary-green-dark)]">
            <strong>Publicada</strong> — os cards estão bloqueados para edição. Despublique para reabrir ajustes.
          </p>
        </Card>
      ) : cards.length === 0 ? (
        <Card className="bg-[var(--color-warning-surface)] p-4" accent="warning">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#6B5900]">
              <strong>Coleção vazia</strong> — adicione cards manualmente ou gere uma primeira leva com IA.
            </p>
            <Button size="sm" variant="secondary" onClick={() => void handleGenerateMore()} disabled={isSaving}>
              <Sparkles size={14} />
              Gerar agora
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-[var(--color-info-surface)] p-4" accent="primary">
          <p className="text-[13px] text-[var(--color-primary-dark)]">
            <strong>Rascunho</strong> — revise os cards antes de publicar a coleção.
          </p>
        </Card>
      )}

      {!isPublished && (
        <Card className="p-4" accent="primary">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[var(--color-primary-dark)]">
              <strong>{cards.length} cards</strong> nesta coleção
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} disabled={isSaving}>
                <Plus size={14} />
                Adicionar Card
              </Button>
              {cards.length > 0 ? (
                <ConfirmarPublicacaoDialog
                  trigger={generateTrigger}
                  title="Adicionar mais cards?"
                  description={`A IA vai adicionar ${colecao.qntCards || 5} novos cards a esta coleção.`}
                  confirmLabel="Gerar mais"
                  onConfirm={() => void handleGenerateMore()}
                  disabled={isSaving}
                />
              ) : (
                <Button size="sm" variant="secondary" onClick={() => void handleGenerateMore()} disabled={isSaving}>
                  <Sparkles size={14} />
                  Gerar Mais com IA
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {showAddForm && !isPublished && (
        <Card className="p-5" accent="primary">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px]">Novo Card</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded p-1.5 transition-colors hover:bg-[var(--color-neutral-50)]">
              <X size={16} className="text-[var(--color-neutral-400)]" />
            </button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>Frente</label>
              <AutoResizeTextarea
                value={newCard.frente}
                onChange={(event) => setNewCard({ ...newCard, frente: event.target.value })}
                placeholder="Pergunta ou termo"
                className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-[7px] text-sm leading-relaxed transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>Verso</label>
              <AutoResizeTextarea
                value={newCard.verso}
                onChange={(event) => setNewCard({ ...newCard, verso: event.target.value })}
                placeholder="Resposta ou explicacao"
                className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-[7px] text-sm leading-relaxed transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => void handleAddCard()} disabled={isSaving}>
              <Plus size={14} />
              Adicionar
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {cards.length === 0 ? (
          <Card className="p-5 text-sm text-[var(--color-neutral-500)]">Nenhum card cadastrado nesta coleção.</Card>
        ) : cards.map((card, index) => (
          editing && !isPublished ? (
            <FlashcardEditor
              key={card.id}
              card={card}
              index={index}
              isSaving={isSaving}
              onChange={updateCardState}
              onSave={(nextCard) => void handleSaveCard(nextCard)}
              onRemove={(cardId) => void handleDeleteCard(cardId)}
            />
          ) : (
            <Card key={card.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[12px] text-[var(--color-neutral-500)]" style={{ fontWeight: 600 }}>
                  {index + 1}
                </div>
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <span className="mb-0.5 block text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]" style={{ fontWeight: 500 }}>Frente</span>
                    <span className="text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 500 }}>{card.frente}</span>
                  </div>
                  <div>
                    <span className="mb-0.5 block text-[11px] uppercase tracking-wider text-[var(--color-secondary-green)]" style={{ fontWeight: 500 }}>Verso</span>
                    <span className="text-[14px] text-[var(--color-neutral-700)]">{card.verso}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
