import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { getDefaultHomePath } from "../lib/mappings";

export default function SemPermissao() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const destination = user ? getDefaultHomePath(user.roles) : "/";

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg rounded-[var(--border-radius-lg)] border border-[var(--color-neutral-100)] bg-white p-8 shadow-[var(--shadow-md)]">
        <div className="w-14 h-14 rounded-full bg-[var(--color-error-surface)] flex items-center justify-center mb-6">
          <ShieldAlert size={28} className="text-[var(--color-error)]" />
        </div>

        <h1 className="text-[2rem] text-[var(--color-neutral-800)] mb-3" style={{ fontWeight: 700 }}>
          Sem permissao para acessar esta area
        </h1>

        <p className="text-[15px] leading-relaxed text-[var(--color-neutral-500)] mb-8">
          Sua sessao esta ativa, mas o perfil autenticado nao pode abrir a rota solicitada. Volte para a sua area principal ou encerre a sessao para entrar com outra conta.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" onClick={() => navigate(destination, { replace: true })}>
            {user ? "Ir para minha area" : "Ir para o login"}
          </Button>

          {user && (
            <Button type="button" variant="outline" onClick={logout}>
              Sair da plataforma
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
