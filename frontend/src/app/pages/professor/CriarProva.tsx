import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
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
} from 'lucide-react';

const questionOptions = [5, 10, 15, 20, 25];

export default function CriarProva() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    turma: '',
    disciplina: '',
    conteudo: '',
    numQuestoes: 10,
  });

  const completionItems = [
    formData.titulo.trim(),
    formData.turma.trim(),
    formData.disciplina.trim(),
    formData.conteudo.trim(),
  ];
  const canContinue = completionItems.every(Boolean);

  const steps = [
    {
      num: 1,
      label: 'Configurar',
      description: 'Defina turma, disciplina e conteúdo-base da prova.',
    },
    {
      num: 2,
      label: 'Gerar Questões',
      description: 'Revise o resumo e inicie a geração com IA.',
    },
  ];

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/professor/provas/1/revisar');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="max-w-xl overflow-hidden p-0" accent="primary">
          <div
            className="relative overflow-hidden px-8 py-8"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-darken-02) 0%, var(--color-primary) 70%, var(--color-secondary-green) 100%)' }}
          >
            <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-12 h-20 w-20 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />

            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <h3 className="text-white">Gerando questões com IA</h3>
              <p className="mt-2 text-[13px] text-white/80">
                Preparando uma prova com <strong className="text-white">{formData.numQuestoes} questões</strong> para {formData.turma || 'a turma selecionada'}.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">{formData.disciplina || 'Disciplina'}</Badge>
                <Badge variant="neutral" size="sm">{formData.turma || 'Turma'}</Badge>
              </div>
              <p className="mt-3 text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                {formData.titulo || 'Montando prova personalizada'}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-neutral-500)]">
                Você poderá revisar, editar ou remover questões antes de publicar.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--color-neutral-500)]">
                <span>Processando conteúdo</span>
                <span>60%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                <div className="h-2 rounded-full bg-[var(--color-primary)] animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
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
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">
            Configure sua prova e gere questões automaticamente com IA
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/professor')}>
          Cancelar
        </Button>
      </div>

<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {steps.map((currentStep) => {
          const isActive = step === currentStep.num;
          const isDone = step > currentStep.num;

          return (
            <Card
              key={currentStep.num}
              accent={isActive || isDone ? 'primary' : 'none'}
              className={`p-4 transition-all ${isActive ? 'shadow-[var(--shadow-md)]' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] ${
                    isActive || isDone
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
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
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  fullWidth
                />

                <div>
                  <label className="mb-1.5 block text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                    Turma
                  </label>
                  <select
                    className="w-full rounded-[var(--border-radius)] border border-[var(--color-neutral-200)] bg-white px-3 py-[7px] text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                    value={formData.turma}
                    onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option>9º A</option>
                    <option>8º B</option>
                    <option>7º C</option>
                    <option>1º A</option>
                  </select>
                </div>

                <Input
                  label="Disciplina"
                  placeholder="Ex: Matemática"
                  value={formData.disciplina}
                  onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Número de Questões"
                  type="number"
                  min="5"
                  max="50"
                  value={formData.numQuestoes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numQuestoes: Number.isNaN(parseInt(e.target.value, 10))
                        ? 0
                        : parseInt(e.target.value, 10),
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
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                          : 'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-primary-lighten-02)] hover:bg-[var(--color-neutral-50)]'
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
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--color-neutral-100)] pt-4">
                <Button variant="ghost" onClick={() => navigate('/professor')}>Cancelar</Button>
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
                    {formData.turma} · {formData.disciplina}
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
                <Button onClick={handleGenerate}>
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
                  {formData.titulo || 'Ainda não definido'}
                </p>
              </div>
              <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Turma</p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                  {formData.turma || 'Selecione uma turma'}
                </p>
              </div>
              <div className="rounded-[var(--border-radius)] bg-[var(--color-neutral-50)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-400)]">Disciplina</p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>
                  {formData.disciplina || 'Informe a disciplina'}
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
                  title: 'Interpreta o contexto',
                  description: 'Usa título, disciplina e conteúdo para orientar a prova.',
                },
                {
                  icon: Layers3,
                  title: 'Monta a estrutura inicial',
                  description: 'Cria a quantidade de questões que você definiu.',
                },
                {
                  icon: Sparkles,
                  title: 'Entrega para revisão',
                  description: 'Você revisa e ajusta tudo antes de publicar.',
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
