import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  ArrowLeft, BookOpen, Edit, Trash2, Plus, Save, Check,
  Users, Eye, GripVertical, Sparkles, X
} from 'lucide-react';

interface Flashcard {
  id: number;
  frente: string;
  verso: string;
}

export default function FlashcardDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ frente: '', verso: '' });
  const [generating, setGenerating] = useState(false);

  const colecao = {
    id: Number(id),
    titulo: 'Verbos em Inglês - Básico',
    tema: 'Inglês',
    turma: '9º A',
    status: 'Publicada',
    criadoEm: '10/03/2026',
    alunosEstudaram: 25,
    totalAlunos: 32,
  };

  const [cards, setCards] = useState<Flashcard[]>([
    { id: 1, frente: 'To be', verso: 'Ser ou estar' },
    { id: 2, frente: 'To have', verso: 'Ter ou possuir' },
    { id: 3, frente: 'To do', verso: 'Fazer' },
    { id: 4, frente: 'To go', verso: 'Ir' },
    { id: 5, frente: 'To get', verso: 'Obter, conseguir' },
    { id: 6, frente: 'To make', verso: 'Fazer, produzir' },
    { id: 7, frente: 'To know', verso: 'Saber, conhecer' },
    { id: 8, frente: 'To think', verso: 'Pensar, achar' },
    { id: 9, frente: 'To take', verso: 'Pegar, levar' },
    { id: 10, frente: 'To see', verso: 'Ver, enxergar' },
  ]);

  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const handleDeleteCard = (cardId: number) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const handleAddCard = () => {
    if (newCard.frente && newCard.verso) {
      setCards([...cards, { id: Date.now(), frente: newCard.frente, verso: newCard.verso }]);
      setNewCard({ frente: '', verso: '' });
      setShowAddForm(false);
    }
  };

  const handleGenerateMore = () => {
    setGenerating(true);
    setTimeout(() => {
      const newCards: Flashcard[] = [
        { id: Date.now() + 1, frente: 'To come', verso: 'Vir, chegar' },
        { id: Date.now() + 2, frente: 'To want', verso: 'Querer, desejar' },
        { id: Date.now() + 3, frente: 'To give', verso: 'Dar, entregar' },
        { id: Date.now() + 4, frente: 'To use', verso: 'Usar, utilizar' },
        { id: Date.now() + 5, frente: 'To find', verso: 'Encontrar, achar' },
      ];
      setCards([...cards, ...newCards]);
      setGenerating(false);
    }, 2000);
  };

  const handleUpdateCard = (cardId: number, field: 'frente' | 'verso', value: string) => {
    setCards(cards.map(c => c.id === cardId ? { ...c, [field]: value } : c));
  };

  if (generating) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-secondary-green)] animate-pulse flex items-center justify-center">
            <Sparkles className="text-white" size={28} />
          </div>
          <h3 className="mb-2">Gerando mais flashcards com IA</h3>
          <p className="text-[var(--color-neutral-500)] text-sm">
            Criando novos cards sobre "{colecao.tema}"...
          </p>
          <div className="mt-6 w-full bg-[var(--color-neutral-100)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[var(--color-secondary-green)] h-1.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '70%' }} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/professor/flashcards')}
            className="p-2 hover:bg-[var(--color-neutral-50)] rounded-[var(--border-radius)] transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--color-neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{colecao.titulo}</h1>
              <Badge variant={colecao.status === 'Publicada' ? 'success' : 'warning'}>{colecao.status}</Badge>
            </div>
            <p className="text-[var(--color-neutral-500)] mt-1 text-sm">
              {colecao.tema} · {colecao.turma} · Criada em {colecao.criadoEm}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Edit size={14} />
            {editing ? 'Salvar' : 'Editar Cards'}
          </Button>
          {colecao.status === 'Publicada' ? (
            <Button variant="ghost" size="sm">
              <Eye size={14} />
              Despublicar
            </Button>
          ) : (
            <Button size="sm">
              <Check size={14} />
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
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
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <Users size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{colecao.alunosEstudaram}/{colecao.totalAlunos}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Alunos estudaram</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-warning-surface)]">
              <Sparkles size={18} className="text-[#6B5900]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>78%</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Engajamento</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions bar */}
      <Card className="p-4" accent="primary">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[13px] text-[var(--color-primary-dark)]">
            <strong>{cards.length} cards</strong> nesta coleção
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
              <Plus size={14} />
              Adicionar Card
            </Button>
            <Button size="sm" variant="secondary" onClick={handleGenerateMore}>
              <Sparkles size={14} />
              Gerar Mais com IA
            </Button>
          </div>
        </div>
      </Card>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-5" accent="primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px]">Novo Card</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-[var(--color-neutral-50)] rounded transition-colors">
              <X size={16} className="text-[var(--color-neutral-400)]" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Frente</label>
              <input
                type="text"
                value={newCard.frente}
                onChange={(e) => setNewCard({ ...newCard, frente: e.target.value })}
                placeholder="Pergunta ou termo"
                className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>Verso</label>
              <input
                type="text"
                value={newCard.verso}
                onChange={(e) => setNewCard({ ...newCard, verso: e.target.value })}
                placeholder="Resposta ou tradução"
                className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddCard}>
              <Plus size={14} />
              Adicionar
            </Button>
          </div>
        </Card>
      )}

      {/* Cards list */}
      <div className="space-y-2">
        {cards.map((card, index) => (
          <Card key={card.id} className="p-3">
            <div className="flex items-center gap-3">
              {editing && (
                <GripVertical size={16} className="text-[var(--color-neutral-300)] cursor-move shrink-0" />
              )}
              <div className="w-7 h-7 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center text-[12px] text-[var(--color-neutral-500)] shrink-0" style={{ fontWeight: 600 }}>
                {index + 1}
              </div>
              {editing ? (
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={card.frente}
                    onChange={(e) => handleUpdateCard(card.id, 'frente', e.target.value)}
                    className="w-full px-3 py-[6px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                  />
                  <input
                    type="text"
                    value={card.verso}
                    onChange={(e) => handleUpdateCard(card.id, 'verso', e.target.value)}
                    className="w-full px-3 py-[6px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)]"
                  />
                </div>
              ) : (
                <div
                  className="flex-1 grid grid-cols-2 gap-3 cursor-pointer"
                  onClick={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
                >
                  <div>
                    <span className="text-[11px] text-[var(--color-neutral-400)] uppercase tracking-wider block mb-0.5" style={{ fontWeight: 500 }}>Frente</span>
                    <span className="text-[14px] text-[var(--color-neutral-800)]" style={{ fontWeight: 500 }}>{card.frente}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-secondary-green)] uppercase tracking-wider block mb-0.5" style={{ fontWeight: 500 }}>Verso</span>
                    <span className="text-[14px] text-[var(--color-neutral-700)]">{card.verso}</span>
                  </div>
                </div>
              )}
              {editing && (
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-1.5 hover:bg-[var(--color-error-surface)] rounded-[var(--border-radius)] shrink-0"
                >
                  <Trash2 size={14} className="text-[var(--color-error)]" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
