import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { extractHttpErrorMessage, HttpError } from "../../lib/http";
import { provaService } from "../../services/provaService";
import { turmaService } from "../../services/turmaService";
import type { TurmaResponse } from "../../types/school";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  Layers3,
  Sparkles,
  Users,
} from "lucide-react";

const questionOptions = [5, 10, 15, 20];

export default function CriarProva() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [turmas, setTurmas] = useState<TurmaResponse[]>([]);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<"idle" | "creating" | "generating">("idle");
  const [createdProvaId, setCreatedProvaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    turmaId: "",
    disciplina: "",
    conteudo: "",
    numQuestoes: 10,
  });

  useEffect(() => {
    let active = true;

    async function loadTurmas() {
      setIsLoadingTurmas(true);
      setError(null);

      try {
        const nextTurmas = await turmaService.list();
        if (active) {
          setTurmas(nextTurmas);
        }
      } catch (nextError) {
        if (active) {
          setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar as turmas."));
        }
      } finally {
        if (active) {
          setIsLoadingTurmas(false);
        }
      }
    }

    void loadTurmas();

    return () => {
      active = false;
    };
  }, []);

  const selectedTurma = useMemo(
    () => turmas.find((turma) => turma.id === formData.turmaId) ?? null,
    [formData.turmaId, turmas],
  );

  const completionItems = [
    formData.titulo.trim(),
    formData.turmaId.trim(),
    formData.disciplina.trim(),
    formData.conteudo.trim(),
  ];
  const canContinue = completionItems.every(Boolean) && formData.numQuestoes > 0;

  const steps = [
    {
      num: 1,
      label: "Configurar",
      description: "Defina turma, disciplina e conteúdo-base da prova.",
    },
    {
      num: 2,
      label: "Gerar Questões",
      description: "Revise o resumo e inicie a geração com IA.",
    },
  ];

  const handleGenerate = async () => {
    setError(null);
    let currentProvaId = createdProvaId;

    try {
      if (!currentProvaId) {
        setLoadingPhase("creating");
        const created = await provaService.criar({
          titulo: formData.titulo.trim(),
          descricao: formData.conteudo.trim(),
          disciplina: formData.disciplina.trim(),
          qntQuestoes: formData.numQuestoes,
          turmaId: formData.turmaId,
        });
        currentProvaId = created.id;
        setCreatedProvaId(created.id);
      }

      setLoadingPhase("generating");
      const detalhe = await provaService.gerarQuestoes(currentProvaId, {
        tema: formData.conteudo.trim(),
        quantidade: formData.numQuestoes,
      });

      toast.success("Questões geradas com sucesso.");
      navigate(`/professor/provas/${currentProvaId}/revisar`, {
        state: { detalhe },
      });
    } catch (nextError) {
      const message = extractHttpErrorMessage(nextError, "Nao foi possivel gerar a prova.");

      if (currentProvaId) {
        toast.error(message);
        navigate(`/professor/provas/${currentProvaId}/revisar`, {
          state: {
            needsGeneration: true,
            tema: formData.conteudo.trim(),
            quantidade: formData.numQuestoes,
          },
        });
        return;
      }

      if (nextError instanceof HttpError && (nextError.status === 429 || nextError.status === 503)) {
        toast.error(message);
      }

      setError(message);
    } finally {
      setLoadingPhase("idle");
    }
  };

  if (loadingPhase !== "idle") {
    const title = loadingPhase === "creating" ? "Criando rascunho" : "Gerando questões com IA";
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
                Preparando uma prova com <strong className="text-white">{formData.numQuestoes} questões</strong> para {selectedTurma?.nome ?? "a turma selecionada"}.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">{formData.disciplina || "Disciplina"}</Badge>
                <Badge variant="neutral" size="sm">{selectedTurma?.nome ?? "Turma"}</Badge>
              </div>
              <p className="mt-3 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                {formData.titulo || "Montando prova personalizada"}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-neutral-500)]">
                Você poderá revisar, editar ou remover questões antes de publicar.
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1>Criar Prova</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Configure sua prova e gere questões automaticamente com IA
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/professor/provas")}>
          Cancelar
        </Button>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {steps.map((currentStep) => {
          const isActive = step === currentStep.num;
          const isDone = step > currentStep.num;

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
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-neutral-100)] pb-4">
                <div>
                  <h3 className="text-[15px]">Informações da Prova</h3>
                  <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                    Preencha os dados principais para orientar a geração das questões.
                  </p>
                </div>
                <Badge variant="info">Etapa 1 de 2</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Título da Prova"
                  placeholder="Ex: Avaliação de Matemática - 1º Bimestre"
                  value={formData.titulo}
                  onChange={(event) => setFormData({ ...formData, titulo: event.target.value })}
                  fullWidth
                />

                <div>
                  <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                    Turma
                  </label>
                  <select
                    className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-[7px] text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                    value={formData.turmaId}
                    onChange={(event) => setFormData({ ...formData, turmaId: event.target.value })}
                    disabled={isLoadingTurmas}
                  >
                    <option value="">{isLoadingTurmas ? "Carregando turmas..." : "Selecione"}</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Disciplina"
                  placeholder="Ex: Matemática"
                  value={formData.disciplina}
                  onChange={(event) => setFormData({ ...formData, disciplina: event.target.value })}
                  fullWidth
                />

                <Input
                  label="Número de Questões"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numQuestoes}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      numQuestoes: Number.isNaN(parseInt(event.target.value, 10))
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
                  {questionOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, numQuestoes: option })}
                      className={`rounded-[var(--border-radius)] border px-3 py-2 text-[13px] transition-colors ${
                        formData.numQuestoes === option
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]"
                          : "border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-primary-lighten-02)] hover:bg-[var(--color-neutral-50)]"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {option} questões
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                  Conteúdo / Tema
                </label>
                <textarea
                  className="min-h-[160px] w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] px-3 py-[10px] text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                  placeholder="Descreva os tópicos, objetivos da avaliação, dificuldade esperada e o que a IA deve priorizar nas questões..."
                  value={formData.conteudo}
                  onChange={(event) => setFormData({ ...formData, conteudo: event.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--color-neutral-100)] pt-4">
                <Button variant="ghost" onClick={() => navigate("/professor/provas")}>Cancelar</Button>
                <Button onClick={() => setStep(2)} disabled={!canContinue}>
                  Continuar
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-neutral-100)] pb-4">
                <div>
                  <h3 className="text-[15px]">Revisar Configuração</h3>
                  <p className="mt-1 text-[12px] text-[var(--color-neutral-400)]">
                    Confira o resumo antes de enviar o conteúdo para a geração com IA.
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
                    Turma e disciplina
                  </div>
                  <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {selectedTurma?.nome ?? "Turma"} · {formData.disciplina}
                  </p>
                </div>

                <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-primary)]">
                    <Layers3 size={12} />
                    Estrutura
                  </div>
                  <p className="mt-2 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    {formData.numQuestoes} questões planejadas
                  </p>
                </div>

                <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-success-surface)] bg-[var(--color-success-surface)] p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--color-secondary-green-dark)]">
                    <CalendarDays size={12} />
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
                  {formData.conteudo}
                </p>
              </div>

              <Card className="border-[var(--color-primary)]/15 bg-[var(--color-info-surface)] p-4" accent="primary">
                <p className="text-[13px] text-[var(--color-primary-dark)]">
                  <strong>Dica:</strong> quanto mais claro o conteúdo informado, mais alinhadas as questões geradas tendem a ficar com o objetivo da sua avaliação.
                </p>
              </Card>

              <div className="flex justify-between border-t border-[var(--color-neutral-100)] pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} />
                  Voltar
                </Button>
                <Button onClick={handleGenerate} disabled={!canContinue}>
                  <Sparkles size={16} />
                  Gerar Questões
                </Button>
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
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Disciplina</p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                  {formData.disciplina || "Informe a disciplina"}
                </p>
              </div>
              <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Questões</p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                  {formData.numQuestoes} previstas
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
                  title: "Interpreta o contexto",
                  description: "Usa título, disciplina e conteúdo para orientar a prova.",
                },
                {
                  icon: Layers3,
                  title: "Monta a estrutura inicial",
                  description: "Cria a quantidade de questões que você definiu.",
                },
                {
                  icon: Sparkles,
                  title: "Entrega para revisão",
                  description: "Você revisa e ajusta tudo antes de publicar.",
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
    </div>
  );
}
