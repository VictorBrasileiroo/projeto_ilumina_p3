import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';

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

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/professor/provas/1/revisar');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-primary)] animate-pulse flex items-center justify-center">
            <Sparkles className="text-white" size={28} />
          </div>
          <h3 className="mb-2">Gerando questões com IA</h3>
          <p className="text-[var(--color-neutral-500)] text-sm">
            Aguarde enquanto criamos questões personalizadas para sua prova...
          </p>
          <div className="mt-6 w-full bg-[var(--color-neutral-100)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[var(--color-primary)] h-1.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1>Criar Prova</h1>
        <p className="text-[var(--color-neutral-500)] mt-1 text-sm">
          Configure sua prova e gere questões automaticamente com IA
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-0">
        {[
          { num: 1, label: 'Configurar' },
          { num: 2, label: 'Gerar Questões' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                step >= s.num
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
              }`} style={{ fontWeight: 600 }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-[13px] ${step >= s.num ? 'text-[var(--color-primary)]' : 'text-[var(--color-neutral-400)]'}`} style={{ fontWeight: step >= s.num ? 600 : 400 }}>
                {s.label}
              </span>
            </div>
            {i < 1 && <div className={`w-16 h-px mx-3 ${step > 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-neutral-200)]'}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-[15px] pb-3 border-b border-[var(--color-neutral-100)]">Informações da Prova</h3>

            <Input
              label="Título da Prova"
              placeholder="Ex: Avaliação de Matemática - 1º Bimestre"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Turma</label>
                <select
                  className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] bg-white transition-all"
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
            </div>

            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Conteúdo / Tema</label>
              <textarea
                className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] min-h-[100px] transition-all"
                placeholder="Descreva os tópicos que devem ser abordados na prova..."
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              />
            </div>

            <Input
              label="Número de Questões"
              type="number"
              min="5"
              max="50"
              value={formData.numQuestoes}
              onChange={(e) => setFormData({ ...formData, numQuestoes: parseInt(e.target.value) })}
              fullWidth
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-neutral-100)]">
              <Button variant="ghost" onClick={() => navigate('/professor')}>Cancelar</Button>
              <Button onClick={() => setStep(2)}>
                Continuar
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-primary-surface)] flex items-center justify-center">
                <Sparkles className="text-[var(--color-primary)]" size={28} />
              </div>
              <h3 className="mb-2">Gerar com Inteligência Artificial</h3>
              <p className="text-[var(--color-neutral-500)] text-sm max-w-sm mx-auto">
                Serão geradas <strong className="text-[var(--color-neutral-700)]">{formData.numQuestoes} questões</strong> sobre o conteúdo informado para revisão.
              </p>
            </div>

            <Card className="p-4 bg-[var(--color-info-surface)] border-[var(--color-primary)]/15" accent="primary">
              <p className="text-[13px] text-[var(--color-primary-dark)]">
                <strong>Dica:</strong> Após a geração, você poderá revisar, editar ou remover questões antes de publicar.
              </p>
            </Card>

            <div className="flex justify-between pt-4 border-t border-[var(--color-neutral-100)]">
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
    </div>
  );
}
