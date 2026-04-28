import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Clock, Edit, Plus, Trash2, Users, X } from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { extractHttpErrorMessage } from "../../lib/http";
import { turmaService } from "../../services/turmaService";
import type { Ensino, TurmaResponse, Turno } from "../../types/school";

const TURNO_LABELS: Record<Turno, string> = {
  MATUTINO: "Manha",
  VESPERTINO: "Tarde",
  NOTURNO: "Noite",
  INTEGRAL: "Integral",
};

const ENSINO_LABELS: Record<Ensino, string> = {
  INFANTIL: "Infantil",
  FUNDAMENTAL: "Fundamental",
  MEDIO: "Medio",
  SUPERIOR: "Superior",
};

const initialForm = {
  nome: "",
  ano: "1",
  turno: "MATUTINO" as Turno,
  ensino: "FUNDAMENTAL" as Ensino,
  qntAlunos: "0",
};

export default function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TurmaResponse[]>([]);
  const [editingTurma, setEditingTurma] = useState<TurmaResponse | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTurmas() {
    setIsLoading(true);
    setError(null);

    try {
      setTurmas(await turmaService.list());
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar as turmas."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTurmas();
  }, []);

  function openCreateForm() {
    setEditingTurma(null);
    setForm(initialForm);
    setIsFormOpen(true);
  }

  function openEditForm(turma: TurmaResponse) {
    setEditingTurma(turma);
    setForm({
      nome: turma.nome,
      ano: String(turma.ano),
      turno: turma.turno,
      ensino: turma.ensino,
      qntAlunos: String(turma.qntAlunos),
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      nome: form.nome.trim(),
      ano: Number(form.ano),
      turno: form.turno,
      ensino: form.ensino,
      qntAlunos: Number(form.qntAlunos),
    };

    try {
      if (editingTurma) {
        await turmaService.update(editingTurma.id, payload);
      } else {
        await turmaService.create(payload);
      }

      setIsFormOpen(false);
      await loadTurmas();
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel salvar a turma."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    setError(null);

    try {
      await turmaService.deactivate(id);
      setTurmas((current) => current.filter((turma) => turma.id !== id));
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel desativar a turma."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1>Turmas</h1>
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Organize e gerencie suas turmas</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Nova Turma
        </Button>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      {isFormOpen && (
        <Card className="p-6" accent="primary">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px]">{editingTurma ? "Editar Turma" : "Nova Turma"}</h3>
            <button type="button" onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded transition-colors">
              <X size={16} className="text-[var(--color-neutral-400)]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da turma" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} disabled={isSubmitting} fullWidth required />
            <Input label="Ano escolar" type="number" min={1} max={9} value={form.ano} onChange={(event) => setForm({ ...form, ano: event.target.value })} disabled={isSubmitting} fullWidth required />

            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Nivel de ensino</label>
              <select value={form.ensino} onChange={(event) => setForm({ ...form, ensino: event.target.value as Ensino })} disabled={isSubmitting} className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] bg-white">
                {Object.entries(ENSINO_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Turno</label>
              <select value={form.turno} onChange={(event) => setForm({ ...form, turno: event.target.value as Turno })} disabled={isSubmitting} className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] bg-white">
                {Object.entries(TURNO_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <Input label="Capacidade planejada" type="number" min={0} value={form.qntAlunos} onChange={(event) => setForm({ ...form, qntAlunos: event.target.value })} disabled={isSubmitting} fullWidth required />

            <div className="md:col-span-2 flex gap-2 justify-end pt-3 border-t border-[var(--color-neutral-100)]">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Turma"}</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando turmas...</Card>
      ) : turmas.length === 0 ? (
        <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Nenhuma turma ativa encontrada.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {turmas.map((turma) => (
            <Card key={turma.id} hoverable className="group overflow-hidden p-0" onClick={() => navigate(`/professor/turmas/${turma.id}`)}>
              <div className="relative overflow-hidden px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg, var(--color-primary-darken-02) 0%, var(--color-primary) 100%)" }}>
                <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 left-10 h-16 w-16 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />
                <div className="absolute bottom-0 left-0 h-1 w-24 bg-[var(--color-secondary-yellow)]" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] border border-white/15 bg-white/10 text-[14px] text-white shadow-[var(--shadow-sm)] backdrop-blur-sm" style={{ fontWeight: 700 }}>
                      {turma.nome.charAt(0).toUpperCase() + (turma.nome.charAt(1) || "").toUpperCase() || "T"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Turma</p>
                      <h4 className="truncate text-[18px] text-white" style={{ fontWeight: 700 }}>{turma.nome}</h4>
                      <p className="mt-0.5 truncate text-[12px] text-white/80">
                        Acompanhe desempenho, provas e materiais
                      </p>
                    </div>
                  </div>

                  <div className="relative flex gap-1">
                    <button type="button" title="Editar turma" className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15" onClick={(event) => { event.stopPropagation(); openEditForm(turma); }}>
                      <Edit size={14} />
                    </button>
                    <button type="button" title="Desativar turma" className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15" onClick={(event) => { event.stopPropagation(); void handleDeactivate(turma.id); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={turma.ensino === "MEDIO" ? "success" : "info"} size="sm">{ENSINO_LABELS[turma.ensino]}</Badge>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                    Ano {turma.ano}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                    <p className="text-[11px] text-[var(--color-neutral-400)]">Ano</p>
                    <p className="mt-1 text-[13px]" style={{ fontWeight: 600 }}>{turma.ano}</p>
                  </div>
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]"><Clock size={11} />Turno</div>
                    <p className="mt-1 truncate text-[13px]" style={{ fontWeight: 600 }}>{TURNO_LABELS[turma.turno]}</p>
                  </div>
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-primary-surface)] p-3">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-primary)]"><Users size={11} />Capacidade</div>
                    <p className="mt-1 text-[13px]" style={{ fontWeight: 700 }}>{turma.qntAlunos}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] text-[var(--color-neutral-400)]">Acompanhe alunos, provas e materiais</p>
                    <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                      Abrir visão da turma
                    </p>
                  </div>
                  <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/professor/turmas/${turma.id}`); }} className="inline-flex items-center gap-1 rounded-[var(--border-radius)] bg-[var(--color-primary-surface)] px-3 py-2 text-[13px] text-[var(--color-primary)] hover:bg-[var(--color-primary-lighten-02)]" style={{ fontWeight: 600 }}>
                    Ver detalhes
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
