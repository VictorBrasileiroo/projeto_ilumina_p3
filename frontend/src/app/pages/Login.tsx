import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import logoSvg from "../../imports/ilumina_logo.svg";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { extractHttpErrorMessage, HttpError } from "../lib/http";
import { REGISTER_ROUTE } from "../lib/constants";
import { extractRedirectPath, resolvePostLoginPath } from "../lib/mappings";
import { useAuth } from "../hooks/useAuth";

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return "E-mail ou senha invalidos.";
    }

    if (error.status === 429) {
      return "Muitas tentativas de login. Tente novamente em instantes.";
    }

    if (error.status === 400) {
      return "Revise os dados informados e tente novamente.";
    }
  }

  return extractHttpErrorMessage(error, "Nao foi possivel entrar agora.");
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = extractRedirectPath(location.state);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    navigate(resolvePostLoginPath(user.roles, redirectPath), { replace: true });
  }, [isAuthenticated, isLoading, navigate, redirectPath, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (nextError) {
      setError(getLoginErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-white px-6 py-8 shadow-[var(--shadow-md)] text-center">
          <p className="text-[15px] text-[var(--color-neutral-700)]" style={{ fontWeight: 600 }}>
            Preparando sua sessao...
          </p>
          <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Estamos validando suas credenciais antes de abrir a plataforma.
          </p>
        </div>
      </div>
    );
  }

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

            <div className="mb-8 bg-gray-50 p-4 rounded-xl pl-6">
              <h2 className="mb-1.5">Acessar a plataforma</h2>
              <p className="text-[var(--color-neutral-500)] text-sm">Entre com suas credenciais para continuar</p>
            </div>

            {redirectPath && (
              <div className="mb-5 rounded-[var(--border-radius)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] px-4 py-3 text-[13px] text-[var(--color-primary-dark)]">
                Depois do login, voce sera levado de volta para a area que tentou abrir.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                fullWidth
                required
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                fullWidth
                required
              />

              {error && (
                <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--color-neutral-100)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[var(--color-neutral-500)]">
                    Ainda nao tem uma conta?
                  </p>
                  <p className="text-[13px] text-[var(--color-neutral-400)]">
                    Crie seu acesso e escolha o perfil no cadastro.
                  </p>
                </div>

                <Link
                  to={REGISTER_ROUTE}
                  className="inline-flex items-center gap-2 text-[14px] text-[var(--color-primary)] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Cadastre-se
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
