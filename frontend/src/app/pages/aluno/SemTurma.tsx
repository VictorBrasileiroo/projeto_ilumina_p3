import { LogOut, RefreshCcw, Users } from "lucide-react";
import { useNavigate } from "react-router";
import logoSvg from "../../../imports/ilumina_logo.svg";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";

export default function SemTurma() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      <div className="h-[3px] flex shrink-0">
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
        <div className="w-48 bg-[var(--color-secondary-yellow)]" />
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-white p-8 shadow-[var(--shadow-md)]">
          <div className="mb-6 flex items-center justify-between">
            <img src={logoSvg} alt="Ilumina" className="h-10" />
            <span className="rounded-full bg-[var(--color-warning-surface)] px-3 py-1 text-[12px] text-[#6B5900]" style={{ fontWeight: 600 }}>
              Acesso pendente
            </span>
          </div>

          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-surface)]">
            <Users size={26} className="text-[var(--color-primary)]" />
          </div>

          <h1 className="text-[1.75rem] text-[var(--color-neutral-800)] mb-3" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Voce ainda nao esta em nenhuma turma
          </h1>

          <p className="text-[15px] leading-relaxed text-[var(--color-neutral-600)] mb-4">
            Ola{user?.name ? `, ${user.name}` : ""}. Para acessar provas, flashcards e o seu painel, voce precisa estar matriculado em uma turma.
          </p>

          <div className="rounded-[var(--border-radius)] border border-[var(--color-primary-lighten-02)] bg-[var(--color-primary-surface)] px-4 py-3 mb-6">
            <p className="text-[14px] text-[var(--color-primary-dark)]" style={{ fontWeight: 600 }}>
              O que fazer agora
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-primary-dark)] leading-relaxed">
              Procure o seu professor e peca para que ele inclua voce em uma turma. Assim que isso acontecer, basta atualizar esta pagina para entrar na plataforma.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" onClick={() => navigate("/aluno", { replace: true })}>
              <RefreshCcw size={16} />
              Ja fui matriculado
            </Button>

            <Button type="button" variant="outline" onClick={logout}>
              <LogOut size={16} />
              Sair da plataforma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
