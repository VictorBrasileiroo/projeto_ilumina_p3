import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import logoSvg from "../../imports/ilumina_logo.svg";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import {
  LOGIN_ROUTE,
  REGISTER_ALUNO_ROUTE,
  REGISTER_PROFESSOR_ROUTE,
  ROLE_ALUNO,
  ROLE_PROFESSOR,
} from "../lib/constants";
import { extractHttpErrorMessage, HttpError } from "../lib/http";
import { getDefaultHomePath } from "../lib/mappings";
import { alunoService } from "../services/alunoService";
import { professorService } from "../services/professorService";
import type { RegisterRole } from "../types/auth";

function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return extractHttpErrorMessage(error, "Revise os dados informados antes de tentar novamente.");
    }

    if (error.status === 409) {
      return "Ja existe uma conta cadastrada com estes dados.";
    }
  }

  return extractHttpErrorMessage(error, "Nao foi possivel concluir o cadastro agora.");
}

function getFixedRole(pathname: string): RegisterRole | null {
  if (pathname === REGISTER_PROFESSOR_ROUTE) {
    return ROLE_PROFESSOR;
  }

  if (pathname === REGISTER_ALUNO_ROUTE) {
    return ROLE_ALUNO;
  }

  return null;
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const fixedRole = useMemo(() => getFixedRole(location.pathname), [location.pathname]);
  const [role, setRole] = useState<RegisterRole>(fixedRole ?? ROLE_PROFESSOR);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [matricula, setMatricula] = useState("");
  const [sexo, setSexo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixedRole) {
      setRole(fixedRole);
    }
  }, [fixedRole]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    navigate(getDefaultHomePath(user.roles), { replace: true });
  }, [isAuthenticated, isLoading, navigate, user]);

  const isProfessor = role === ROLE_PROFESSOR;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais para concluir o cadastro.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isProfessor) {
        await professorService.register({
          name: name.trim(),
          email: email.trim(),
          password,
          disciplina: disciplina.trim(),
          sexo: sexo.trim(),
        });
      } else {
        await alunoService.register({
          name: name.trim(),
          email: email.trim(),
          password,
          matricula: matricula.trim(),
          sexo: sexo.trim(),
        });
      }
    } catch (nextError) {
      setError(getRegisterErrorMessage(nextError));
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
            Estamos confirmando seus dados antes de abrir a plataforma.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-[3px] flex shrink-0">
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
        <div className="w-48 bg-[var(--color-secondary-yellow)]" />
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
      </div>

      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-[45%] bg-[var(--color-primary-darken-02)] relative overflow-hidden items-center justify-center p-12">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--color-primary-dark)] opacity-30 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)] opacity-15 -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border-2 border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full" />

          <div className="relative z-10 text-center max-w-md">
            <img src={logoSvg} alt="Ilumina" className="h-24 mx-auto mb-10" />
            <h1 className="text-[2rem] text-white mb-4" style={{ fontWeight: 700, lineHeight: 1.2 }}>
              Crie sua conta na plataforma
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed mb-10">
              Escolha seu perfil no cadastro e, depois disso, o login passa a reconhecer automaticamente para qual area voce deve entrar.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {["Perfil definido no cadastro", "Entrada automatica", "Sessao persistida", "Acesso protegido"].map((feat) => (
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

        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-[440px]">
            <div className="lg:hidden mb-8 text-center">
              <img src={logoSvg} alt="Ilumina" className="h-16 mx-auto mb-3" />
            </div>

            <div className="mb-8">
              <Link
                to={LOGIN_ROUTE}
                className="inline-flex items-center gap-2 text-[13px] text-[var(--color-primary)] hover:underline mb-4"
                style={{ fontWeight: 600 }}
              >
                <ArrowLeft size={15} />
                Voltar para o login
              </Link>

              <h2 className="mb-1.5">Criar nova conta</h2>
              <p className="text-[var(--color-neutral-500)] text-sm">
                Escolha seu perfil agora. Depois do cadastro, esse passo nao aparece mais no login.
              </p>
            </div>

            {!fixedRole && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setRole(ROLE_PROFESSOR)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-[var(--border-radius-lg)] border-2 transition-all text-sm ${
                    isProfessor
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]"
                      : "border-[var(--color-neutral-100)] text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-200)]"
                  }`}
                  style={{ fontWeight: isProfessor ? 600 : 400 }}
                >
                  <GraduationCap size={18} />
                  Professor
                </button>

                <button
                  type="button"
                  onClick={() => setRole(ROLE_ALUNO)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-[var(--border-radius-lg)] border-2 transition-all text-sm ${
                    !isProfessor
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]"
                      : "border-[var(--color-neutral-100)] text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-200)]"
                  }`}
                  style={{ fontWeight: !isProfessor ? 600 : 400 }}
                >
                  <BookOpen size={18} />
                  Aluno
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting} fullWidth required />
              <Input type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} fullWidth required />
              <Input type="password" label="Senha" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} fullWidth required />
              <Input type="password" label="Confirmar senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isSubmitting} fullWidth required />

              {isProfessor ? (
                <Input label="Disciplina" placeholder="Ex: Matematica" value={disciplina} onChange={(event) => setDisciplina(event.target.value)} disabled={isSubmitting} fullWidth required />
              ) : (
                <Input label="Matricula" placeholder="Ex: 2026001" value={matricula} onChange={(event) => setMatricula(event.target.value)} disabled={isSubmitting} fullWidth required />
              )}

              <div>
                <label className="block text-[14px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>
                  Sexo/genero
                </label>
                <select
                  value={sexo}
                  onChange={(event) => setSexo(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-[7px] text-sm border rounded-[var(--border-radius)] border-[var(--color-neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all bg-white disabled:bg-[var(--color-neutral-50)] disabled:cursor-not-allowed disabled:text-[var(--color-neutral-400)]"
                  required
                >
                  <option value="">Selecione uma opcao</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>

              <div className="rounded-[var(--border-radius)] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-4 py-3 text-[13px] text-[var(--color-neutral-600)]">
                Depois de criar a conta, voce entra direto na area correspondente ao perfil escolhido aqui.
              </div>

              {error && (
                <div className="rounded-[var(--border-radius)] border border-[var(--color-error)] bg-[var(--color-error-surface)] px-4 py-3 text-[13px] text-[var(--color-error)]">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--color-neutral-100)] text-center">
              <p className="text-[13px] text-[var(--color-neutral-500)]">
                Ja tem uma conta?{" "}
                <Link
                  to={LOGIN_ROUTE}
                  className="text-[var(--color-primary)] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Entrar na plataforma
                </Link>
              </p>
              <p className="mt-3 text-[13px] text-[var(--color-neutral-500)]">
                {isProfessor ? (
                  <Link to={REGISTER_ALUNO_ROUTE} className="text-[var(--color-primary)] hover:underline" style={{ fontWeight: 600 }}>
                    Criar conta de aluno
                  </Link>
                ) : (
                  <Link to={REGISTER_PROFESSOR_ROUTE} className="text-[var(--color-primary)] hover:underline" style={{ fontWeight: 600 }}>
                    Criar conta de professor
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
