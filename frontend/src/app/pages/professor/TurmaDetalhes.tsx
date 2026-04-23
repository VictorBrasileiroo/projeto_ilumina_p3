import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import {
  ArrowLeft, Users, FileText, BookOpen, Plus, Search,
  Mail, TrendingUp, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react';

interface Aluno {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  mediaGeral: number;
  provasRealizadas: number;
  status: 'ativo' | 'inativo';
}

export default function TurmaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'alunos' | 'provas' | 'flashcards'>('alunos');
  const [searchTerm, setSearchTerm] = useState('');

  const turmaId = Number(id);
  const turmas = [
    { id: 1, nome: '9º A', nivel: 'Fundamental II', turno: 'Manhã', ano: '2026', totalAlunos: 32 },
    { id: 2, nome: '8º B', nivel: 'Fundamental II', turno: 'Tarde', ano: '2026', totalAlunos: 28 },
    { id: 3, nome: '7º C', nivel: 'Fundamental II', turno: 'Manhã', ano: '2026', totalAlunos: 30 },
    { id: 4, nome: '1º A', nivel: 'Ensino Médio', turno: 'Manhã', ano: '2026', totalAlunos: 35 },
  ];
  const turma = turmas.find((item) => item.id === turmaId) ?? turmas[0];

  const alunos: Aluno[] = [
    { id: 1, nome: 'Ana Beatriz Oliveira', email: 'ana.oliveira@escola.com', matricula: '2026001', mediaGeral: 8.5, provasRealizadas: 5, status: 'ativo' },
    { id: 2, nome: 'Bruno Carlos Santos', email: 'bruno.santos@escola.com', matricula: '2026002', mediaGeral: 7.2, provasRealizadas: 5, status: 'ativo' },
    { id: 3, nome: 'Carla Dias Ferreira', email: 'carla.ferreira@escola.com', matricula: '2026003', mediaGeral: 9.1, provasRealizadas: 5, status: 'ativo' },
    { id: 4, nome: 'Daniel Eduardo Lima', email: 'daniel.lima@escola.com', matricula: '2026004', mediaGeral: 6.8, provasRealizadas: 4, status: 'ativo' },
    { id: 5, nome: 'Fernanda Gomes Costa', email: 'fernanda.costa@escola.com', matricula: '2026005', mediaGeral: 8.9, provasRealizadas: 5, status: 'ativo' },
    { id: 6, nome: 'Gabriel Henrique Souza', email: 'gabriel.souza@escola.com', matricula: '2026006', mediaGeral: 7.5, provasRealizadas: 3, status: 'inativo' },
    { id: 7, nome: 'Helena Isabela Rocha', email: 'helena.rocha@escola.com', matricula: '2026007', mediaGeral: 9.4, provasRealizadas: 5, status: 'ativo' },
    { id: 8, nome: 'João Pedro Almeida', email: 'joao.almeida@escola.com', matricula: '2026008', mediaGeral: 8.0, provasRealizadas: 5, status: 'ativo' },
  ];

  const provas = [
    { id: 1, titulo: 'Prova de Matemática - 1º Bimestre', disciplina: 'Matemática', questoes: 10, data: '15/03/2026', status: 'Publicada', mediaNotas: 7.8, realizaram: 30 },
    { id: 2, titulo: 'Avaliação de História - Roma Antiga', disciplina: 'História', questoes: 15, data: '20/03/2026', status: 'Publicada', mediaNotas: 8.2, realizaram: 28 },
    { id: 3, titulo: 'Teste de Ciências - Ecologia', disciplina: 'Ciências', questoes: 8, data: '25/03/2026', status: 'Rascunho', mediaNotas: 0, realizaram: 0 },
  ];

  const flashcards = [
    { id: 1, titulo: 'Verbos em Inglês - Básico', tema: 'Inglês', cards: 20, status: 'Publicada', estudaram: 25 },
    { id: 2, titulo: 'Fórmulas de Física - Mecânica', tema: 'Física', cards: 15, status: 'Publicada', estudaram: 18 },
    { id: 3, titulo: 'Tabela Periódica', tema: 'Química', cards: 30, status: 'Rascunho', estudaram: 0 },
  ];

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.matricula.includes(searchTerm)
  );

  const mediaTurma = alunos.reduce((sum, a) => sum + a.mediaGeral, 0) / alunos.length;

  const tabs = [
    { key: 'alunos' as const, label: 'Alunos', icon: Users, count: alunos.length },
    { key: 'provas' as const, label: 'Provas', icon: FileText, count: provas.length },
    { key: 'flashcards' as const, label: 'Flashcards', icon: BookOpen, count: flashcards.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/professor/turmas')}
            className="p-2 hover:bg-[var(--color-neutral-50)] rounded-[var(--border-radius)] transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--color-neutral-500)]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{turma.nome}</h1>
              <Badge variant="info">{turma.nivel}</Badge>
            </div>
            <p className="text-[var(--color-neutral-500)] mt-1 text-sm">
              {turma.turno} · Ano letivo {turma.ano}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-surface)]">
              <Users size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{turma.totalAlunos}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Alunos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--border-radius-lg)] bg-[var(--color-success-surface)]">
              <TrendingUp size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{mediaTurma.toFixed(1)}</p>
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
              <p className="text-[1.25rem] text-[var(--color-neutral-900)]" style={{ fontWeight: 700 }}>{flashcards.length}</p>
              <p className="text-[12px] text-[var(--color-neutral-400)]">Coleções</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-neutral-100)]">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-[14px] border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]'
                }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
                }`} style={{ fontWeight: 600 }}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Alunos */}
      {activeTab === 'alunos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
              <input
                type="text"
                placeholder="Buscar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-[7px] text-sm bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] rounded-[var(--border-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-neutral-400)]"
              />
            </div>
            <Button size="sm">
              <Plus size={14} />
              Adicionar Aluno
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-neutral-100)]">
                    <th className="text-left px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Aluno</th>
                    <th className="text-left px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Matrícula</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Média</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Provas</th>
                    <th className="text-center px-5 py-3 text-[12px] text-[var(--color-neutral-400)] uppercase tracking-wider" style={{ fontWeight: 600 }}>Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno) => (
                    <tr key={aluno.id} className="border-b border-[var(--color-neutral-100)] last:border-b-0 hover:bg-[var(--color-neutral-50)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-[11px] shrink-0" style={{ fontWeight: 700 }}>
                            {aluno.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>{aluno.nome}</p>
                            <p className="text-[11px] text-[var(--color-neutral-400)] flex items-center gap-1">
                              <Mail size={10} />
                              {aluno.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[var(--color-neutral-600)]">{aluno.matricula}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-[14px] ${
                          aluno.mediaGeral >= 7 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                        }`} style={{ fontWeight: 700 }}>
                          {aluno.mediaGeral.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-[13px] text-[var(--color-neutral-600)]">
                        {aluno.provasRealizadas}/{provas.filter(p => p.status === 'Publicada').length}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge variant={aluno.status === 'ativo' ? 'success' : 'neutral'} size="sm">
                          {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="p-1.5 hover:bg-[var(--color-neutral-100)] rounded-[var(--border-radius)] transition-colors">
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

      {/* Tab: Provas */}
      {activeTab === 'provas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Link to="/professor/provas/criar">
              <Button size="sm">
                <Plus size={14} />
                Criar Prova
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {provas.map((prova) => (
              <Card key={prova.id} className="p-5" hoverable>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-primary-darken-02)] flex items-center justify-center shrink-0">
                      <FileText className="text-white" size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] truncate" style={{ fontWeight: 600 }}>{prova.titulo}</h4>
                      <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[var(--color-neutral-400)]">
                        <span>{prova.disciplina}</span>
                        <span>{prova.questoes} questões</span>
                        <span>{prova.data}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {prova.status === 'Publicada' && (
                      <div className="text-right">
                        <p className="text-[13px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>Média: {prova.mediaNotas.toFixed(1)}</p>
                        <p className="text-[11px] text-[var(--color-neutral-400)]">{prova.realizaram}/{turma.totalAlunos} realizaram</p>
                      </div>
                    )}
                    <Badge variant={prova.status === 'Publicada' ? 'success' : 'warning'}>{prova.status}</Badge>
                    <Link to={`/professor/provas/${prova.id}/revisar`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Link to="/professor/flashcards">
              <Button size="sm">
                <Plus size={14} />
                Nova Coleção
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {flashcards.map((fc) => (
              <Card key={fc.id} hoverable className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[var(--border-radius-lg)] bg-[var(--color-secondary-green)] flex items-center justify-center">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <Badge variant={fc.status === 'Publicada' ? 'success' : 'warning'}>{fc.status}</Badge>
                </div>
                <h4 className="text-[14px] mb-1" style={{ fontWeight: 600 }}>{fc.titulo}</h4>
                <p className="text-[12px] text-[var(--color-neutral-400)] mb-3">{fc.tema} · {fc.cards} cards</p>
                {fc.status === 'Publicada' && (
                  <p className="text-[12px] text-[var(--color-neutral-500)]">
                    <span style={{ fontWeight: 600 }}>{fc.estudaram}</span> alunos estudaram
                  </p>
                )}
                <div className="pt-3 mt-3 border-t border-[var(--color-neutral-100)]">
                  <Link to={`/professor/flashcards/${fc.id}`}>
                    <Button size="sm" variant="ghost" fullWidth>Ver detalhes</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
