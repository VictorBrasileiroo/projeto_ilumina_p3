import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import logoSvg from '../../imports/ilumina_logo.svg';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'professor' | 'aluno'>('professor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(userType === 'professor' ? '/professor' : '/aluno');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top institutional bar */}
      <div className="h-[3px] flex shrink-0">
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
        <div className="w-48 bg-[var(--color-secondary-yellow)]" />
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
      </div>

      <div className="flex-1 flex">
        {/* Left - Branding */}
        <div className="hidden lg:flex lg:w-[45%] bg-[var(--color-primary-darken-02)] relative overflow-hidden items-center justify-center p-12">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--color-primary-dark)] opacity-30 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)] opacity-15 -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border-2 border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full" />

          <div className="relative z-10 text-center max-w-md">
            <img src={logoSvg} alt="Ilumina" className="h-24 mx-auto mb-10" />
            <h1 className="text-[2rem] text-white mb-4" style={{ fontWeight: 700, lineHeight: 1.2 }}>
              Plataforma de Gestão Pedagógica
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed mb-10">
              Crie avaliações inteligentes, gere questões com IA e acompanhe o desempenho dos alunos de forma prática e eficiente.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {['Provas com IA', 'Flashcards', 'Gestão de Turmas', 'Resultados'].map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1.5 bg-white/8 border border-white/10 rounded-[var(--border-radius)] text-white/70 text-[13px]"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden mb-8 text-center">
              <img src={logoSvg} alt="Ilumina" className="h-16 mx-auto mb-3" />
            </div>

            <div className="mb-8">
              <h2 className="mb-1.5">Acessar a plataforma</h2>
              <p className="text-[var(--color-neutral-500)] text-sm">Entre com suas credenciais para continuar</p>
            </div>

            {/* User type toggle */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setUserType('professor')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-[var(--border-radius-lg)] border-2 transition-all text-sm ${
                  userType === 'professor'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                    : 'border-[var(--color-neutral-100)] text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-200)]'
                }`}
                style={{ fontWeight: userType === 'professor' ? 600 : 400 }}
              >
                <GraduationCap size={18} />
                Professor
              </button>
              <button
                type="button"
                onClick={() => setUserType('aluno')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-[var(--border-radius-lg)] border-2 transition-all text-sm ${
                  userType === 'aluno'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                    : 'border-[var(--color-neutral-100)] text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-200)]'
                }`}
                style={{ fontWeight: userType === 'aluno' ? 600 : 400 }}
              >
                <BookOpen size={18} />
                Aluno
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--color-neutral-200)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-[13px] text-[var(--color-neutral-500)]">Lembrar de mim</span>
                </label>
                <a href="#" className="text-[13px] text-[var(--color-primary)] hover:underline" style={{ fontWeight: 500 }}>
                  Esqueceu a senha?
                </a>
              </div>

              <Button type="submit" fullWidth size="lg">
                Entrar
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--color-neutral-100)] text-center">
              <p className="text-[13px] text-[var(--color-neutral-500)]">
                Não tem uma conta?{' '}
                <a href="#" className="text-[var(--color-primary)] hover:underline" style={{ fontWeight: 600 }}>
                  Cadastre-se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
