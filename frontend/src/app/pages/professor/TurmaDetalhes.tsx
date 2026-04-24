import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Users, FileText, BookOpen, Plus, Search,
  Mail, TrendingUp, MoreVertical, Edit, Trash2, X
} from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { extractHttpErrorMessage } from "../../lib/http";
import { provaService } from "../../services/provaService";
import { turmaService } from "../../services/turmaService";
import type { ProvaResponse } from "../../types/prova";
import type { AlunoResponse, Ensino, TurmaResponse, Turno } from "../../types/school";

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

export default function TurmaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turma, setTurma] = useState<TurmaResponse | null>(null);
  const [alunos, setAlunos] = useState<AlunoResponse[]>([]);
  const [provas, setProvas] = useState<ProvaResponse[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AlunoResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"alunos" | "provas" | "flashcards">("alunos");
  const [searchTerm, setSearchTerm] = useState("");
  const [discoveryTerm, setDiscoveryTerm] = useState("");
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTurma() {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextTurma, nextAlunos] = await Promise.all([
        turmaService.getById(id),
        turmaService.listStudents(id),
      ]);
      const nextProvas = await provaService.listar();
      setTurma(nextTurma);
      setAlunos(nextAlunos);
      setProvas(nextProvas.filter((prova) => prova.turmaId === id));
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel carregar a turma."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTurma();
  }, [id]);

  async function discoverStudents(query = discoveryTerm) {
    if (!id) {
      return;
    }

    setIsDiscovering(true);
    setError(null);

    try {
      setAvailableStudents(await turmaService.listAvailableStudents(id, query));
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel buscar alunos disponiveis."));
    } finally {
      setIsDiscovering(false);
    }
  }

  async function enrollStudent(alunoId: string) {
    if (!id) {
      return;
    }

    setError(null);

    try {
      await turmaService.enrollStudent(id, alunoId);
      setIsEnrollmentOpen(false);
      setDiscoveryTerm("");
      setAvailableStudents([]);
      await loadTurma();
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel matricular o aluno."));
    }
  }

  async function unenrollStudent(alunoId: string) {
    if (!id) {
      return;
    }

    setError(null);

    try {
      await turmaService.unenrollStudent(id, alunoId);
      setAlunos((current) => current.filter((aluno) => aluno.id !== alunoId));
    } catch (nextError) {
      setError(extractHttpErrorMessage(nextError, "Nao foi possivel remover a matricula."));
    }
  }

  const filteredAlunos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return alunos;
    }

    return alunos.filter((aluno) =>
      aluno.name.toLowerCase().includes(term)
        || aluno.email.toLowerCase().includes(term)
        || aluno.matricula.toLowerCase().includes(term),
    );
  }, [alunos, searchTerm]);

  const tabs = [
    { key: "alunos" as const, label: "Alunos", icon: Users, count: alunos.length },
    { key: "provas" as const, label: "Provas", icon: FileText, count: provas.length },
    { key: "flashcards" as const, label: "Flashcards", icon: BookOpen, count: 0 },
  ];

  if (isLoading) {
    return <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Carregando turma...</Card>;
  }

  if (!turma) {
    return <Card className="p-6 text-sm text-[var(--color-neutral-500)]">Turma nao encontrada.</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate("/professor/turmas")} className="p-2 hover:bg-[var(--color-neutral-50)] rounded-[var(--border-radius)] transition-colors">
            <ArrowLeft size={20} className="text-[var(--color-neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{turma.nome}</h1>
              <Badge variant={turma.ensino === "MEDIO" ? "success" : "info"}>{ENSINO_LABELS[turma.ensino]}</Badge>
            </div>
            <p className="text-[var(--color-neutral-500)] mt-1 text-sm">
              {TURNO_LABELS[turma.turno]} · Ano {turma.ano}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit size={14} />
            Editar Turma
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
              <Users size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem]" style={{ fontWeight: 700 }}>{alunos.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Matriculados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <TrendingUp size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>--</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Média da turma</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)]">
              <FileText size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{provas.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Provas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-info-surface)]">
              <BookOpen size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>--</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Coleções</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="border-b border-[var(--color-neutral-100)]">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-3 text-[14px] border-b-2 transition-colors ${isActive ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"}`} style={{ fontWeight: isActive ? 600 : 400 }}>
                <Icon size={16} />
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-[var(--color-primary-surface)] text-[var(--color-primary)]" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]"}`} style={{ fontWeight: 600 }}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "alunos" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
              <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full pl-9 pr-4 py-[7px] text-sm bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] rounded-[var(--border-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]" />
            </div>
            <Button size="sm" onClick={() => { setIsEnrollmentOpen(true); void discoverStudents(""); }}>
              <Plus size={14} />
              Adicionar Aluno
            </Button>
          </div>

          {isEnrollmentOpen && (
            <Card className="p-5" accent="primary">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-[15px]">Adicionar aluno</h3>
                <button type="button" onClick={() => setIsEnrollmentOpen(false)} className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded transition-colors">
                  <X size={16} className="text-[var(--color-neutral-400)]" />
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
                  <input value={discoveryTerm} onChange={(event) => setDiscoveryTerm(event.target.value)} placeholder="Buscar por nome, email ou matricula" className="w-full pl-9 pr-4 py-[8px] text-sm border border-[var(--color-neutral-200)] rounded-[var(--border-radius)]" />
                </div>
                <Button variant="outline" onClick={() => void discoverStudents()} disabled={isDiscovering}>
                  {isDiscovering ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-[var(--color-neutral-500)]">Nenhum aluno disponivel encontrado.</p>
                ) : availableStudents.map((aluno) => (
                  <div key={aluno.id} className="flex flex-col gap-3 rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>{aluno.name}</p>
                      <p className="text-[11px] text-[var(--color-neutral-400)]">{aluno.email} · {aluno.matricula}</p>
                    </div>
                    <Button size="sm" onClick={() => void enrollStudent(aluno.id)}>Matricular</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-neutral-100)]">
                    <th className="text-left px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Aluno</th>
                    <th className="text-left px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Matricula</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Média</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Provas</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-6 text-sm text-[var(--color-neutral-500)]">Nenhum aluno matriculado encontrado.</td></tr>
                  ) : filteredAlunos.map((aluno) => (
                    <tr key={aluno.id} className="border-b border-[var(--color-neutral-100)] last:border-b-0 hover:bg-[var(--color-neutral-50)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-[11px] shrink-0" style={{ fontWeight: 700 }}>
                            {aluno.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>{aluno.name}</p>
                            <p className="text-[11px] text-[var(--color-neutral-400)] flex items-center gap-1"><Mail size={10} />{aluno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[var(--color-neutral-600)]">{aluno.matricula}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-[14px] text-[var(--color-neutral-400)]" style={{ fontWeight: 700 }}>--</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-[13px] text-[var(--color-neutral-600)]">
                        --
                      </td>
                      <td className="px-5 py-3.5 text-center"><Badge variant={aluno.active ? "success" : "neutral"} size="sm">{aluno.active ? "Ativo" : "Inativo"}</Badge></td>
                      <td className="px-5 py-3.5 text-right">
                        {/* TROCAR O ICONE DESSE BOTAO */}
                        <button type="button" title="Remover matricula" className="p-1.5 hover:bg-[var(--color-neutral-100)] rounded-[var(--border-radius)] transition-colors" onClick={() => void unenrollStudent(aluno.id)}>
                          <MoreVertical size={14} className="text-[var(--color-neutral-400)]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "provas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Link to="/professor/provas/criar">
              <Button size="sm">
                <Plus size={14} />
                Criar Prova
              </Button>
            </Link>
          </div>

          {provas.length === 0 ? (
            <Card className="p-5" accent="primary">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                    Nenhuma prova vinculada
                  </h4>
                  <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                    Crie uma prova para esta turma para iniciar o acompanhamento.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {provas.map((prova) => (
                <Card key={prova.id} hoverable className="group p-5" accent={prova.status === "PUBLICADA" ? "success" : "warning"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={prova.status === "PUBLICADA" ? "success" : "warning"} size="sm">
                          {prova.status === "PUBLICADA" ? "Publicada" : "Rascunho"}
                        </Badge>
                        <Badge variant="info" size="sm">{prova.disciplina ?? "Sem disciplina"}</Badge>
                      </div>
                      <h4 className="mt-3 text-[15px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                        {prova.titulo}
                      </h4>
                      <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                        {prova.totalQuestoes} questões · médias indisponíveis
                      </p>
                    </div>
                    <Link to={`/professor/provas/${prova.id}/revisar`}>
                      <Button size="sm" variant="ghost">
                        Abrir
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "flashcards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Link to="/professor/flashcards">
              <Button size="sm">
                <Plus size={14} />
                Nova Coleção
              </Button>
            </Link>
          </div>

          <Card className="p-5" accent="warning">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)] text-[#6B5900]">
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                  Dados de flashcards indisponíveis neste bloco
                </h4>
                <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
                  Esta seção será preenchida com dados reais quando a integração de flashcards estiver concluída.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
