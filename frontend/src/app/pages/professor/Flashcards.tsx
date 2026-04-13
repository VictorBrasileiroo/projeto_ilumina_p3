import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Plus, Sparkles, GripVertical, Trash2, Save, X, BookOpen, Users } from 'lucide-react';

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
        {colecoes.map((colecao) => (
          <Card key={colecao.id} hoverable className="p-5">
            <div className="flex items-start justify-between mb-4">
              <Badge variant={colecao.status === 'Publicada' ? 'success' : 'warning'}>
                {colecao.status}
              </Badge>
              <button className="p-1.5 hover:bg-[var(--color-error-surface)] rounded-[var(--border-radius)]">
                <Trash2 size={14} className="text-[var(--color-neutral-400)]" />
              </button>
            </div>
            <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-secondary-green)] flex items-center justify-center mb-3">
              <BookOpen size={18} className="text-white" />
            </div>
            <h4 className="text-[14px] mb-1" style={{ fontWeight: 600 }}>{colecao.titulo}</h4>
            <div className="space-y-1 text-[12px] text-[var(--color-neutral-400)] mb-1">
              <p>{colecao.tema} · {colecao.turma}</p>
            </div>
            {colecao.status === 'Publicada' && (
              <p className="text-[12px] text-[var(--color-neutral-500)] mb-3">
                <span style={{ fontWeight: 600 }}>{colecao.alunosEstudaram}</span> alunos estudaram
              </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-neutral-100)]">
              <span className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>{colecao.cards} cards</span>
              <Link to={`/professor/flashcards/${colecao.id}`}>
                <Button size="sm" variant="ghost">Ver detalhes</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
