import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { ArrowRight, BookOpen, GraduationCap, GripVertical, Layers3, Plus, Save, Sparkles, Trash2, Users, X } from 'lucide-react';

interface Flashcard {
  id: number;
  frente: string;
  verso: string;
}

export default function Flashcards() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [colecoes] = useState([
    { id: 1, titulo: 'Verbos em Inglês - Básico', tema: 'Inglês', turma: '7º C', cards: 20, status: 'Publicada', alunosEstudaram: 25 },
    { id: 2, titulo: 'Fórmulas de Física', tema: 'Física', turma: '1º A', cards: 15, status: 'Rascunho', alunosEstudaram: 0 },
    { id: 3, titulo: 'Tabela Periódica', tema: 'Química', turma: '9º A', cards: 30, status: 'Publicada', alunosEstudaram: 18 },
  ]);
  const [editingCards, setEditingCards] = useState<Flashcard[]>([]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setEditingCards([
        { id: 1, frente: 'To be', verso: 'Ser ou estar' },
        { id: 2, frente: 'To have', verso: 'Ter ou possuir' },
        { id: 3, frente: 'To do', verso: 'Fazer' },
        { id: 4, frente: 'To go', verso: 'Ir' },
        { id: 5, frente: 'To get', verso: 'Obter, conseguir' },
        { id: 6, frente: 'To make', verso: 'Fazer, produzir' },
        { id: 7, frente: 'To know', verso: 'Saber, conhecer' },
        { id: 8, frente: 'To think', verso: 'Pensar, achar' },
      ]);
    }, 2500);
  };

  const handleDeleteCard = (cardId: number) => {
    setEditingCards(editingCards.filter(c => c.id !== cardId));
  };

  const handleAddCard = () => {
    setEditingCards([...editingCards, { id: Date.now(), frente: '', verso: '' }]);
  };

  const handlePublish = () => {
    setShowForm(false);
    setGenerated(false);
    setEditingCards([]);
  };

  if (generating) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-secondary-green)] animate-pulse flex items-center justify-center">
            <Sparkles className="text-white" size={28} />
          </div>
          <h3 className="mb-2">Gerando flashcards com IA</h3>
          <p className="text-[var(--color-neutral-500)] text-sm">Criando cards personalizados para sua coleção...</p>
          <div className="mt-6 w-full bg-[var(--color-neutral-100)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[var(--color-secondary-green)] h-1.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '65%' }} />
          </div>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Nova Coleção</h1>
            <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Configure e gere cards automaticamente</p>
          </div>
          <Button variant="ghost" onClick={() => { setShowForm(false); setGenerated(false); setEditingCards([]); }}>
            <X size={16} />
            Cancelar
          </Button>
        </div>

        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título da Coleção" placeholder="Ex: Verbos em Inglês" fullWidth />
            <Input label="Tema" placeholder="Ex: Inglês - Verbos Irregulares" fullWidth />
            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Turma</label>
              <select className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] bg-white transition-all">
                <option value="">Selecione a turma</option>
                <option>9º A</option>
                <option>8º B</option>
                <option>7º C</option>
                <option>1º A</option>
              </select>
            </div>
            <Input label="Número de Cards" type="number" defaultValue={15} fullWidth />
          </div>

          <div>
            <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Descrição do Conteúdo</label>
            <textarea
              className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] min-h-[80px] transition-all"
              placeholder="Descreva o conteúdo que deve ser abordado nos flashcards. Quanto mais detalhada a descrição, melhores serão os cards gerados pela IA..."
            />
          </div>

          {!generated && (
            <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-neutral-100)]">
              <Button variant="outline" onClick={handleAddCard}>
                <Plus size={16} />
                Adicionar Manualmente
              </Button>
              <Button onClick={handleGenerate}>
                <Sparkles size={16} />
                Gerar com IA
              </Button>
            </div>
          )}
        </Card>

        {/* Generated/editing cards */}
        {editingCards.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px]">
                {generated ? 'Cards Gerados pela IA' : 'Cards'} 
                <span className="text-[var(--color-neutral-400)] text-[13px] ml-2" style={{ fontWeight: 400 }}>({editingCards.length} cards)</span>
              </h3>
              <Button size="sm" variant="outline" onClick={handleAddCard}>
                <Plus size={14} />
                Adicionar Card
              </Button>
            </div>

            {generated && (
              <Card className="p-3 mb-4 bg-[var(--color-success-surface)] border-[var(--color-success)]/15" accent="success">
                <p className="text-[13px] text-[var(--color-secondary-green-dark)]">
                  <strong>{editingCards.length} cards</strong> gerados com sucesso! Revise e edite os cards abaixo antes de publicar.
                </p>
              </Card>
            )}

            <div className="space-y-2">
              {editingCards.map((card, index) => (
                <Card key={card.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-[var(--color-neutral-300)] cursor-move shrink-0" />
                    <div className="w-6 h-6 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center text-[11px] text-[var(--color-neutral-500)] shrink-0" style={{ fontWeight: 600 }}>
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[var(--color-neutral-400)] mb-1 block uppercase tracking-wider" style={{ fontWeight: 500 }}>Frente</label>
                        <input
                          type="text"
                          value={card.frente}
                          onChange={(e) => {
                            const updated = [...editingCards];
                            updated[index].frente = e.target.value;
                            setEditingCards(updated);
                          }}
                          placeholder="Pergunta ou termo"
                          className="w-full px-3 py-[6px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--color-neutral-400)] mb-1 block uppercase tracking-wider" style={{ fontWeight: 500 }}>Verso</label>
                        <input
                          type="text"
                          value={card.verso}
                          onChange={(e) => {
                            const updated = [...editingCards];
                            updated[index].verso = e.target.value;
                            setEditingCards(updated);
                          }}
                          placeholder="Resposta ou tradução"
                          className="w-full px-3 py-[6px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 hover:bg-[var(--color-error-surface)] rounded-[var(--border-radius)] shrink-0"
                    >
                      <Trash2 size={14} className="text-[var(--color-error)]" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-between mt-5">
              <Button variant="outline" onClick={handleGenerate}>
                <Sparkles size={14} />
                Regenerar com IA
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handlePublish}>Salvar Rascunho</Button>
                <Button onClick={handlePublish}>
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
          <p className="text-[var(--color-neutral-500)] mt-1 text-sm">Gerencie coleções de estudo para suas turmas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nova Coleção
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
              <BookOpen size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecoes.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Coleções criadas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <Sparkles size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecoes.reduce((sum, c) => sum + c.cards, 0)}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Total de cards</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)]">
              <Users size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecoes.filter(c => c.status === 'Publicada').length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Publicadas</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {colecoes.map((colecao) => {
          const isPublished = colecao.status === 'Publicada';

          return (
            <Card
              key={colecao.id}
              hoverable
              className="group overflow-hidden p-0"
              onClick={() => navigate(`/professor/flashcards/${colecao.id}`)}
            >
              <div
                className="relative overflow-hidden px-5 pt-5 pb-4"
                style={{
                  background: isPublished
                    ? 'linear-gradient(135deg, var(--color-secondary-green-dark) 0%, var(--color-secondary-green) 55%, var(--color-primary) 100%)'
                    : 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                }}
              >
                <div className="absolute -top-12 -right-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 left-8 h-16 w-16 rounded-full bg-[var(--color-secondary-yellow)] opacity-20" />
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
                        {isPublished ? 'Disponível para estudo da turma' : 'Em preparação para publicação'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-[var(--border-radius)] border border-white/10 bg-white/10 p-1.5 text-white/80 transition-colors hover:bg-white/15"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={isPublished ? 'success' : 'warning'} size="sm">
                    {colecao.status}
                  </Badge>
                  <span className="inline-flex items-center rounded-[var(--border-radius)] border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/85">
                    Turma {colecao.turma}
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
                    {colecao.tema}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-400)]">
                      <Layers3 size={11} />
                      Cards
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {colecao.cards} cards
                    </p>
                  </div>
                  <div className={`rounded-[var(--border-radius)] border p-3 ${
                    isPublished
                      ? 'border-[var(--color-success-surface)] bg-[var(--color-success-surface)]'
                      : 'border-[var(--color-warning-surface)] bg-[var(--color-warning-surface)]'
                  }`}>
                    <div className={`flex items-center gap-1 text-[11px] ${
                      isPublished ? 'text-[var(--color-secondary-green-dark)]' : 'text-[#6B5900]'
                    }`}>
                      <Users size={11} />
                      {isPublished ? 'Estudaram' : 'Status'}
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 700 }}>
                      {isPublished ? `${colecao.alunosEstudaram} alunos` : 'Rascunho'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-neutral-100)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] text-[var(--color-neutral-400)]">
                      {isPublished ? 'Coleção em uso com a turma' : 'Revise e publique quando estiver pronta'}
                    </p>
                    <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
                      Abrir gestão da coleção
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
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
    </div>
  );
}
