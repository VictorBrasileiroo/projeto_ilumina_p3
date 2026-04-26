import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { FlashcardEditor } from "../../components/FlashcardEditor";
import { ConfirmarPublicacaoDialog } from "../../components/professor/ConfirmarPublicacaoDialog";
import { extractHttpErrorMessage } from "../../lib/http";
import { colecaoService } from "../../services/colecaoService";
import { turmaService } from "../../services/turmaService";
import type { ColecaoResponse, ColecaoStatus, FlashcardResponse } from "../../types/flashcard";
import type { TurmaResponse } from "../../types/school";
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, GraduationCap, Layers3, Plus, Save, Search, Sparkles, Trash2, Users, X } from "lucide-react";

const cardOptions = [5, 10, 15, 20];
const PER_PAGE = 6;

const initialFormData = {
  titulo: "",
  tema: "",
  turmaId: "",
  conteudo: "",
  numCards: 10,
};

function sortCards(cards: FlashcardResponse[]) {
  return [...cards].sort((a, b) => a.ordem - b.ordem);
}

function statusLabel(status: ColecaoResponse["status"]) {
  return status === "PUBLICADA" ? "Publicada" : "Rascunho";
}

export default function Flashcards() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [colecoes, setColecoes] = useState<ColecaoResponse[]>([]);
  const [turmas, setTurmas] = useState<TurmaResponse[]>([]);
  const [editingCards, setEditingCards] = useState<FlashcardResponse[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [createdColecaoId, setCreatedColecaoId] = useState<string | null>(null);
  const [manualCard, setManualCard] = useState({ frente: "", verso: "" });
  const [showManualCardForm, setShowManualCardForm] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ColecaoStatus | "TODAS">("TODAS");
  const [turmaFilter, setTurmaFilter] = useState("Todas");
  const [temaFilter, setTemaFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<"idle" | "creating" | "generating" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  const selectedTurma = useMemo(
    () => turmas.find((turma) => turma.id === formData.turmaId) ?? null,
    [formData.turmaId, turmas],
  );

  const canCreateColecao = Boolean(formData.titulo.trim() && formData.turmaId);
  const generationTheme = formData.conteudo.trim() || formData.tema.trim() || formData.titulo.trim();
  const canGenerate = canCreateColecao && Boolean(generationTheme) && formData.numCards > 0;
  const canContinueCreation = canCreateColecao && formData.numCards > 0;
  const isBusy = loadingPhase !== "idle";

  async function loadPageData() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextColecoes, nextTurmas] = await Promise.all([
        colecaoService.listar(),
        turmaService.list(),
      ]);
      setColecoes(nextColecoes);
      setTurmas(nextTurmas);
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar as colecoes."));
    } finally {
      setIsLoading(false);
    }
  }

  async function refetchColecoes() {
    try {
      setColecoes(await colecaoService.listar());
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel atualizar as colecoes."));
    }
  }

  useEffect(() => {
    void loadPageData();
  }, []);

  async function resetForm() {
    if (createdColecaoId) {
      await refetchColecoes().catch(() => undefined);
    }
    setShowForm(false);
    setCreationStep(1);
    setGenerated(false);
    setEditingCards([]);
    setCreatedColecaoId(null);
    setManualCard({ frente: "", verso: "" });
    setShowManualCardForm(false);
    setFormData(initialFormData);
    setError(null);
  }

  function validateBaseForm() {
    if (!formData.titulo.trim()) {
      const message = "Informe o titulo da colecao.";
      setError(message);
      toast.error(message);
      return false;
    }

    if (!formData.turmaId) {
      const message = "Selecione uma turma para a colecao.";
      setError(message);
      toast.error(message);
      return false;
    }

    return true;
  }

  async function ensureColecao() {
    if (createdColecaoId) {
      return createdColecaoId;
    }

    if (!validateBaseForm()) {
      throw new Error("Dados obrigatorios ausentes.");
    }

    setLoadingPhase("creating");
    const created = await colecaoService.criar({
      titulo: formData.titulo.trim(),
      tema: formData.tema.trim() || null,
      qntCards: formData.numCards,
      turmaId: formData.turmaId,
    });
    setCreatedColecaoId(created.id);
    return created.id;
  }

  async function handleGenerate() {
    if (!canGenerate) {
      const message = "Preencha titulo, turma e conteudo antes de gerar.";
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);

    try {
      const colecaoId = await ensureColecao();
      setLoadingPhase("generating");
      const detalhe = await colecaoService.gerarFlashcards(colecaoId, {
        tema: generationTheme,
        quantidade: formData.numCards,
      });
      setCreatedColecaoId(detalhe.id);
      setEditingCards(sortCards(detalhe.flashcards));
      setGenerated(true);
      toast.success("Flashcards gerados com sucesso.");
    } catch (nextError) {
      if (nextError instanceof Error && nextError.message === "Dados obrigatorios ausentes.") {
        return;
      }

      const message = extractHttpErrorMessage(nextError, "Nao foi possivel gerar flashcards.");
      setError(message);
      toast.error(message);
    } finally {
      setLoadingPhase("idle");
    }
  }

  async function handlePrepareManualCard() {
    setError(null);

    try {
      await ensureColecao();
      setShowManualCardForm(true);
    } catch (nextError) {
      if (nextError instanceof Error && nextError.message === "Dados obrigatorios ausentes.") {
        return;
      }

      const message = extractHttpErrorMessage(nextError, "Nao foi possivel criar o rascunho da colecao.");
      setError(message);
      toast.error(message);
    } finally {
      setLoadingPhase("idle");
    }
  }

  async function handleAddManualCard() {
    if (!createdColecaoId) {
      return;
    }

    if (!manualCard.frente.trim() || !manualCard.verso.trim()) {
      toast.error("Preencha frente e verso para adicionar o card.");
      return;
    }

    setLoadingPhase("saving");

    try {
      const created = await colecaoService.adicionarFlashcard(createdColecaoId, {
        frente: manualCard.frente.trim(),
        verso: manualCard.verso.trim(),
      });
      setEditingCards((current) => sortCards([...current, created]));
      setManualCard({ frente: "", verso: "" });
      setShowManualCardForm(false);
      toast.success("Card adicionado.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel adicionar o card."));
    } finally {
      setLoadingPhase("idle");
    }
  }

  async function reloadEditingCards(colecaoId = createdColecaoId) {
    if (!colecaoId) {
      return;
    }

    const detalhe = await colecaoService.detalhar(colecaoId);
    setEditingCards(sortCards(detalhe.flashcards));
  }

  async function handleSaveCard(card: FlashcardResponse) {
    if (!createdColecaoId || loadingPhase === "saving") {
      return;
    }

    if (!card.frente.trim() || !card.verso.trim()) {
      toast.error("Frente e verso precisam estar preenchidos.");
      await reloadEditingCards().catch(() => undefined);
      return;
    }

    setLoadingPhase("saving");

    try {
      const updated = await colecaoService.atualizarFlashcard(createdColecaoId, card.id, {
        frente: card.frente.trim(),
        verso: card.verso.trim(),
      });
      setEditingCards((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel salvar o card."));
      await reloadEditingCards().catch(() => undefined);
    } finally {
      setLoadingPhase("idle");
    }
  }

  async function handleRemoveCard(cardId: string) {
    if (!createdColecaoId) {
      return;
    }

    setLoadingPhase("saving");

    try {
      await colecaoService.removerFlashcard(createdColecaoId, cardId);
      setEditingCards((current) => current.filter((card) => card.id !== cardId));
      toast.success("Card removido.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel remover o card."));
    } finally {
      setLoadingPhase("idle");
    }
  }

  function handleChangeCard(cardId: string, nextCard: FlashcardResponse) {
    setEditingCards((current) => current.map((card) => (card.id === cardId ? nextCard : card)));
  }

  async function handleSaveDraft() {
    await resetForm();
    toast.success("Rascunho salvo.");
  }

  async function handlePublish() {
    if (!createdColecaoId) {
      toast.error("Crie ou gere cards antes de publicar.");
      return;
    }

    setLoadingPhase("saving");

    try {
      await colecaoService.publicar(createdColecaoId);
      await resetForm();
      toast.success("Colecao publicada com sucesso.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel publicar a colecao."));
    } finally {
      setLoadingPhase("idle");
    }
  }

  async function handleDeleteColecao(id: string) {
    if (!window.confirm("Excluir esta colecao?")) {
      return;
    }

    try {
      await colecaoService.excluir(id);
      setColecoes((current) => current.filter((colecao) => colecao.id !== id));
      toast.success("Colecao excluida.");
    } catch (nextError) {
      toast.error(extractHttpErrorMessage(nextError, "Nao foi possivel excluir a colecao."));
    }
  }

  const totalCards = colecoes.reduce((sum, colecao) => sum + colecao.totalFlashcards, 0);
  const publishedCount = colecoes.filter((colecao) => colecao.status === "PUBLICADA").length;
  const draftCount = colecoes.filter((colecao) => colecao.status === "RASCUNHO").length;

  const sortedColecoes = useMemo(
    () => [...colecoes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [colecoes],
  );

  const turmaOptions = useMemo(
    () => ["Todas", ...Array.from(new Set(sortedColecoes.map((colecao) => colecao.turmaNome).filter(Boolean)))],
    [sortedColecoes],
  );

  const temaOptions = useMemo(
    () => ["Todas", ...Array.from(new Set(sortedColecoes.map((colecao) => colecao.tema ?? "").filter(Boolean)))],
    [sortedColecoes],
  );

  const filteredColecoes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedColecoes.filter((colecao) => {
      const matchesStatus = statusFilter === "TODAS" || colecao.status === statusFilter;
      const matchesTurma = turmaFilter === "Todas" || colecao.turmaNome === turmaFilter;
      const matchesTema = temaFilter === "Todas" || colecao.tema === temaFilter;
      const matchesSearch = !query
        || colecao.titulo.toLowerCase().includes(query)
        || (colecao.tema ?? "").toLowerCase().includes(query)
        || colecao.turmaNome.toLowerCase().includes(query);

      return matchesStatus && matchesTurma && matchesTema && matchesSearch;
    });
  }, [searchQuery, sortedColecoes, statusFilter, temaFilter, turmaFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, temaFilter, turmaFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredColecoes.length / PER_PAGE));
  const paginatedColecoes = filteredColecoes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filterTabs: { key: ColecaoStatus | "TODAS"; label: string; count: number }[] = [
    { key: "TODAS", label: "Todas", count: colecoes.length },
    { key: "RASCUNHO", label: "Rascunhos", count: draftCount },
    { key: "PUBLICADA", label: "Publicadas", count: publishedCount },
  ];

  const creationSteps = [
    {
      num: 1,
      label: "Configurar",
      description: "Defina turma, tema e quantidade de cards.",
    },
    {
      num: 2,
      label: "Gerar Cards",
      description: "Revise o resumo e escolha como montar a coleção.",
    },
  ];

  if (loadingPhase === "creating" || loadingPhase === "generating") {
    const title = loadingPhase === "creating" ? "Criando rascunho" : "Gerando flashcards com IA";
    const progress = loadingPhase === "creating" ? "30%" : "60%";

    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="max-w-xl overflow-hidden p-0" accent="primary">
          <div
            className="relative overflow-hidden px-8 py-8"
            style={{ background: "linear-gradient(135deg, var(--color-primary-darken-02) 0%, var(--color-primary) 70%, var(--color-secondary-green) 100%)" }}
          >
            <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-12 h-20 w-20 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />

            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <h3 className="text-white">{title}</h3>
              <p className="mt-2 text-[13px] text-white/80">
                Preparando uma coleção com <strong className="text-white">{formData.numCards} cards</strong> para {selectedTurma?.nome ?? "a turma selecionada"}.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">{formData.tema || "Flashcards"}</Badge>
                <Badge variant="neutral" size="sm">{selectedTurma?.nome ?? "Turma"}</Badge>
              </div>
              <p className="mt-3 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                {formData.titulo || "Montando coleção personalizada"}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-neutral-500)]">
                Você poderá revisar, editar ou remover cards antes de publicar.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--color-neutral-500)]">
                <span>{loadingPhase === "creating" ? "Salvando rascunho" : "Processando conteúdo"}</span>
                <span>{progress}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                <div className="h-2 rounded-full bg-[var(--color-primary)] animate-[pulse_2s_ease-in-out_infinite]" style={{ width: progress }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showForm) {
    const generateButton = (
      <button
        type="button"
        disabled={!canGenerate || isBusy}
        className="inline-flex items-center justify-center gap-2 rounded-[var(--border-radius)] bg-[var(--color-primary)] px-5 py-2 text-[15px] font-medium text-white transition-all hover:bg-[var(--color-primary-dark)] disabled:pointer-events-none disabled:opacity-40"
      >
        <Sparkles size={16} />
        {editingCards.length > 0 ? "Gerar Mais com IA" : "Gerar com IA"}
      </button>
    );

    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1>Nova Coleção</h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              Configure sua coleção e gere flashcards automaticamente com IA
            </p>
          </div>
          <Button variant="ghost" onClick={() => void resetForm()} disabled={isBusy}>
            Cancelar
          </Button>
        </div>

        {error && (
          <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {creationSteps.map((currentStep) => {
            const isActive = creationStep === currentStep.num;
            const isDone = creationStep > currentStep.num;

            return (
              <Card
                key={currentStep.num}
                accent={isActive || isDone ? "primary" : "none"}
                className={`p-4 transition-all ${isActive ? "shadow-[var(--shadow-md)]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] ${
                      isActive || isDone
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {isDone ? <Check size={15} /> : currentStep.num}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px]">{currentStep.label}</h3>
                      {isActive && <Badge variant="info" size="sm">Atual</Badge>}
                      {isDone && <Badge variant="success" size="sm">Concluída</Badge>}
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">{currentStep.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="p-6">
            {creationStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-neutral-100)] pb-4">
                  <div>
                    <h3 className="text-[15px]">Informações da Coleção</h3>
                    <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                      Preencha os dados principais para orientar a geração dos cards.
                    </p>
                  </div>
                  <Badge variant="info">Etapa 1 de 2</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Título da Coleção"
                    placeholder="Ex: Verbos em Inglês"
                    value={formData.titulo}
                    onChange={(event) => setFormData({ ...formData, titulo: event.target.value })}
                    disabled={Boolean(createdColecaoId)}
                    fullWidth
                  />
                  <Input
                    label="Tema"
                    placeholder="Ex: Inglês - Verbos Irregulares"
                    value={formData.tema}
                    onChange={(event) => setFormData({ ...formData, tema: event.target.value })}
                    disabled={Boolean(createdColecaoId)}
                    fullWidth
                  />
                  <div>
                    <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>Turma</label>
                    <select
                      className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-[7px] text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] disabled:bg-[var(--color-neutral-50)] disabled:text-[var(--color-neutral-400)]"
                      value={formData.turmaId}
                      onChange={(event) => setFormData({ ...formData, turmaId: event.target.value })}
                      disabled={Boolean(createdColecaoId)}
                    >
                      <option value="">{isLoading ? "Carregando turmas..." : "Selecione"}</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>{turma.nome}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Número de Cards"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numCards}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        numCards: Number.isNaN(parseInt(event.target.value, 10))
                          ? 0
                          : Math.min(20, Math.max(1, parseInt(event.target.value, 10))),
                      })
                    }
                    fullWidth
                  />
                </div>

                <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
                  <div className="flex items-center gap-2">
                    <Layers3 size={16} className="text-[var(--color-primary)]" />
                    <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                      Quantidade sugerida
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cardOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, numCards: option })}
                        className={`rounded-[var(--border-radius)] border px-3 py-2 text-[13px] transition-colors ${
                          formData.numCards === option
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]"
                            : "border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-primary-lighten-02)] hover:bg-[var(--color-neutral-50)]"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {option} cards
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>Conteúdo / Tema</label>
                  <textarea
                    className="min-h-[160px] w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-[10px] text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                    placeholder="Descreva os tópicos, conceitos, exemplos e o que a IA deve priorizar nos flashcards..."
                    value={formData.conteudo}
                    onChange={(event) => setFormData({ ...formData, conteudo: event.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[var(--color-neutral-100)] pt-4">
                  <Button variant="ghost" onClick={() => void resetForm()}>Cancelar</Button>
                  <Button onClick={() => setCreationStep(2)} disabled={!canContinueCreation}>
                    Continuar
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {creationStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-neutral-100)] pb-4">
                  <div>
                    <h3 className="text-[15px]">Revisar Configuração</h3>
                    <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                      Confira o resumo antes de gerar ou adicionar cards manualmente.
                    </p>
                  </div>
                  <Badge variant="success">Etapa 2 de 2</Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">
                      <FileText size={12} />
                      Título
                    </div>
                    <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {formData.titulo}
                    </p>
                  </div>

                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">
                      <Users size={12} />
                      Turma e tema
                    </div>
                    <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {selectedTurma?.nome ?? "Turma"} · {formData.tema || "Sem tema específico"}
                    </p>
                  </div>

                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] p-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-primary)]">
                      <Layers3 size={12} />
                      Estrutura
                    </div>
                    <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {formData.numCards} cards planejados
                    </p>
                  </div>

                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-success-surface)] bg-[var(--color-success-surface)] p-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-secondary-green-dark)]">
                      <BookOpen size={12} />
                      Revisão posterior
                    </div>
                    <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      Edição antes de publicar
                    </p>
                  </div>
                </div>

                <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-5">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[var(--color-primary)]" />
                    <h4 className="text-[14px]" style={{ fontWeight: 700 }}>Conteúdo base para a IA</h4>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[13px] text-[var(--color-neutral-600)]">
                    {generationTheme}
                  </p>
                </div>

                {createdColecaoId && (
                  <Card className="bg-[var(--color-warning-surface)] p-4" accent="warning">
                    <p className="text-[13px] text-[#6B5900]">
                      <strong>Rascunho criado</strong> — se a geração falhar, esta coleção continua salva para nova tentativa.
                    </p>
                  </Card>
                )}

                <Card className="border-[var(--color-primary)]/15 bg-[var(--color-info-surface)] p-4" accent="primary">
                  <p className="text-[13px] text-[var(--color-primary-dark)]">
                    <strong>Dica:</strong> flashcards funcionam melhor com conceitos curtos, exemplos claros e pares de pergunta/resposta objetivos.
                  </p>
                </Card>

                <div className="flex flex-col justify-between gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row">
                  <Button variant="ghost" onClick={() => setCreationStep(1)}>
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => void handlePrepareManualCard()} disabled={!canCreateColecao || isBusy}>
                      <Plus size={16} />
                      Adicionar Manualmente
                    </Button>
                    {createdColecaoId && editingCards.length === 0 && (
                      <Button variant="ghost" onClick={() => void handleSaveDraft()} disabled={isBusy}>Salvar Rascunho</Button>
                    )}
                    {editingCards.length > 0 ? (
                      <ConfirmarPublicacaoDialog
                        trigger={generateButton}
                        title="Adicionar mais cards?"
                        description={`A IA vai adicionar ${formData.numCards} novos cards a esta colecao.`}
                        confirmLabel="Gerar mais"
                        onConfirm={() => void handleGenerate()}
                        disabled={!canGenerate || isBusy}
                      />
                    ) : (
                      <Button onClick={() => void handleGenerate()} disabled={!canGenerate || isBusy}>
                        <Sparkles size={16} />
                        Gerar com IA
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-5" accent="primary">
              <h3 className="text-[15px]">Resumo da Configuração</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Título</p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {formData.titulo || "Ainda não definido"}
                  </p>
                </div>
                <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Turma</p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {selectedTurma?.nome ?? "Selecione uma turma"}
                  </p>
                </div>
                <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Tema</p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {formData.tema || "Informe um tema"}
                  </p>
                </div>
                <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Cards</p>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                    {formData.numCards} previstos
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-[15px]">Como a IA vai ajudar</h3>
              <div className="mt-4 space-y-3">
                {[
                  {
                    icon: FileText,
                    title: "Interpreta o conteúdo",
                    description: "Usa título, tema e contexto para montar os cards.",
                  },
                  {
                    icon: Layers3,
                    title: "Cria pares de estudo",
                    description: "Gera frente e verso na quantidade definida.",
                  },
                  {
                    icon: Sparkles,
                    title: "Entrega para revisão",
                    description: "Você ajusta tudo antes de publicar para a turma.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-3 rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {showManualCardForm && (
          <Card className="p-5" accent="primary">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px]">Novo Card</h3>
              <button type="button" onClick={() => setShowManualCardForm(false)} className="rounded p-1.5 transition-colors hover:bg-[var(--color-neutral-50)]">
                <X size={16} className="text-[var(--color-neutral-400)]" />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Frente"
                placeholder="Pergunta ou termo"
                value={manualCard.frente}
                onChange={(event) => setManualCard({ ...manualCard, frente: event.target.value })}
                fullWidth
              />
              <Input
                label="Verso"
                placeholder="Resposta ou explicacao"
                value={manualCard.verso}
                onChange={(event) => setManualCard({ ...manualCard, verso: event.target.value })}
                fullWidth
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowManualCardForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={() => void handleAddManualCard()} disabled={isBusy}>
                <Plus size={14} />
                Adicionar
              </Button>
            </div>
          </Card>
        )}

        {editingCards.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px]">
                {generated ? "Cards Gerados pela IA" : "Cards"}
                <span className="ml-2 text-[13px] text-[var(--color-neutral-400)]" style={{ fontWeight: 400 }}>({editingCards.length} cards)</span>
              </h3>
              <Button size="sm" variant="outline" onClick={() => void handlePrepareManualCard()} disabled={isBusy}>
                <Plus size={14} />
                Adicionar Card
              </Button>
            </div>

            {generated && (
              <Card className="mb-4 bg-[var(--color-success-surface)] p-3" accent="success">
                <p className="text-[13px] text-[var(--color-secondary-green-dark)]">
                  <strong>{editingCards.length} cards</strong> na coleção. Revise e edite antes de publicar.
                </p>
              </Card>
            )}

            <div className="space-y-2">
              {editingCards.map((card, index) => (
                <FlashcardEditor
                  key={card.id}
                  card={card}
                  index={index}
                  isSaving={isBusy}
                  onChange={handleChangeCard}
                  onSave={(nextCard) => void handleSaveCard(nextCard)}
                  onRemove={(cardId) => void handleRemoveCard(cardId)}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row">
              <div />
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={() => void handleSaveDraft()} disabled={isBusy}>Salvar Rascunho</Button>
                <Button onClick={() => void handlePublish()} disabled={isBusy}>
                  <Save size={16} />
                  Publicar Coleção
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Flashcards</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Gerencie coleções de estudo para suas turmas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nova Coleção
        </Button>
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
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : colecoes.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Coleções criadas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)] p-2.5">
              <Sparkles size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : totalCards}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Total de cards</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)] p-2.5">
              <Layers3 size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{isLoading ? "..." : publishedCount}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Publicadas</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-[var(--border-radius)] px-3 py-1.5 text-sm transition-colors ${
                statusFilter === tab.key
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${statusFilter === tab.key ? "bg-white/20 text-white" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"}`}>
                {tab.count}
              </span>
            </button>
          ))}

          <select
            value={turmaFilter}
            onChange={(event) => setTurmaFilter(event.target.value)}
            className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)]"
          >
            {turmaOptions.map((turma) => <option key={turma}>{turma}</option>)}
          </select>

          <select
            value={temaFilter}
            onChange={(event) => setTemaFilter(event.target.value)}
            className="rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm text-[var(--color-neutral-700)]"
          >
            {temaOptions.map((tema) => <option key={tema}>{tema}</option>)}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="text"
            placeholder="Buscar por titulo, tema ou turma..."
            value={searchQuery}
            onChange={(event) => {
              setSearchParams((prev) => {
                if (event.target.value) {
                  prev.set("q", event.target.value);
                } else {
                  prev.delete("q");
                }
                return prev;
              });
            }}
            className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white py-2 pl-9 pr-4 text-sm transition-all placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando coleções...</Card>
      ) : colecoes.length === 0 ? (
        <Card className="p-5" accent="primary">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
              <BookOpen size={18} />
            </div>
            <div>
              <h4 className="text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>Nenhuma coleção criada</h4>
              <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">Crie uma coleção para começar a publicar flashcards.</p>
            </div>
          </div>
        </Card>
      ) : paginatedColecoes.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">Nenhuma coleção encontrada para os filtros aplicados.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("TODAS");
              setTurmaFilter("Todas");
              setTemaFilter("Todas");
              setSearchParams({});
            }}
            className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Limpar filtros
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedColecoes.map((colecao) => {
            const isPublished = colecao.status === "PUBLICADA";

            return (
              <Card
                key={colecao.id}
                hoverable
                className="group overflow-hidden p-0"
                onClick={() => navigate(`/professor/flashcards/${colecao.id}`)}
              >
                <div
                  className="relative overflow-hidden px-5 pb-4 pt-5"
                  style={{
                    background: isPublished
                      ? "linear-gradient(135deg, var(--color-secondary-green-dark) 0%, var(--color-secondary-green) 55%, var(--color-primary) 100%)"
                      : "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)",
                  }}
                >
                  <div className="absolute -right-8 -top-12 h-28 w-28 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-white shadow-[var(--shadow-sm)] backdrop-blur-sm">
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Coleção</p>
                        <h4 className="truncate text-[17px] text-white" style={{ fontWeight: 700 }}>{colecao.titulo}</h4>
                        <p className="mt-0.5 truncate text-[12px] text-white/80">
                          {isPublished ? "Disponível para estudo da turma" : "Em preparação para publicação"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteColecao(colecao.id);
                      }}
                      className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15"
                      title="Excluir coleção"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="relative mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant={isPublished ? "success" : "warning"} size="sm">
                      {statusLabel(colecao.status)}
                    </Badge>
                    <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                      Turma {colecao.turmaNome}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                      <GraduationCap size={11} />
                      Tema principal
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                      {colecao.tema ?? "Sem tema definido"}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                        <Layers3 size={11} />
                        Cards
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {colecao.totalFlashcards} cards
                      </p>
                    </div>
                    <div className={`rounded-[var(--border-radius)] border p-3 ${
                      isPublished
                        ? "border-[var(--color-success-surface)] bg-[var(--color-success-surface)]"
                        : "border-[var(--color-warning-surface)] bg-[var(--color-warning-surface)]"
                    }`}>
                      <div className={`flex items-center gap-1 text-[11px] ${
                        isPublished ? "text-[var(--color-secondary-green-dark)]" : "text-[#6B5900]"
                      }`}>
                        <Save size={11} />
                        Status
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {statusLabel(colecao.status)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[12px] text-[var(--color-neutral-400)]">
                        {isPublished ? "Coleção disponível para a turma" : "Revise e publique quando estiver pronta"}
                      </p>
                      <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                        Abrir gestão da coleção
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/professor/flashcards/${colecao.id}`);
                      }}
                      className="inline-flex self-start items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-3 py-2 text-[13px] text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-lighten-02)] sm:self-auto"
                      style={{ fontWeight: 600 }}
                    >
                      Ver detalhes
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && !isLoading && paginatedColecoes.length > 0 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((nextPage) => (
            <button
              key={nextPage}
              type="button"
              onClick={() => setPage(nextPage)}
              className={`h-8 w-8 rounded-[var(--border-radius)] text-sm transition-colors ${
                page === nextPage
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]"
              }`}
              style={{ fontWeight: 600 }}
            >
              {nextPage}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
