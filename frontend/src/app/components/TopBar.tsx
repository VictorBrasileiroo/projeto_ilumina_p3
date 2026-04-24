import { useEffect, useRef, useState } from "react";
import { ChevronRight, HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface TopBarProps {
  userName: string;
  userRole: string;
  onToggleSidebar?: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/professor': 'Dashboard',
  '/professor/turmas': 'Turmas',
  '/professor/provas/criar': 'Criar Prova',
  '/professor/flashcards': 'Flashcards',
  '/aluno': 'Dashboard',
  '/aluno/provas': 'Provas',
  '/aluno/flashcards': 'Flashcards',
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [];
  
  // Root
  const base = '/' + parts[0];
  crumbs.push({ label: parts[0] === 'professor' ? 'Professor' : 'Aluno', path: base });

  if (parts.length <= 1) return crumbs;

  // Build path progressively
  let currentPath = base;
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    // Skip numeric IDs for breadcrumb label but keep in path
    if (/^\d+$/.test(segment)) {
      currentPath += '/' + segment;
      continue;
    }
    currentPath += '/' + segment;
    const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, path: currentPath });
  }

  return crumbs;
}

export function TopBar({ userName, userRole, onToggleSidebar }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const searchQuery = searchParams.get('q') ?? '';

  const breadcrumbs = getBreadcrumbs(location.pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Barra institucional gov.br - verde/amarelo */}
      <div className="h-[3px] flex">
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
        <div className="w-40 bg-[var(--color-secondary-yellow)]" />
        <div className="flex-1 bg-[var(--color-secondary-green)]" />
      </div>

      {/* Main topbar */}
      <div className="bg-white border-b border-[var(--color-neutral-100)] px-4 md:px-6 h-[56px] flex items-center justify-between gap-4">
        {/* Left side: hamburger + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-[var(--border-radius)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1 text-[13px] min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.path} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={12} className="text-[var(--color-neutral-300)] shrink-0" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-[var(--color-neutral-700)] truncate" style={{ fontWeight: 500 }}>{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-[var(--color-neutral-400)] hover:text-[var(--color-primary)] transition-colors truncate"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search - desktop only */}
          <div className="hidden md:block relative w-48 lg:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchParams((prev) => {
                  if (e.target.value) prev.set('q', e.target.value);
                  else prev.delete('q');
                  return prev;
                });
              }}
              className="w-full pl-9 pr-4 py-[6px] text-sm bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] rounded-[var(--border-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--color-neutral-400)]"
            />
          </div>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-[var(--border-radius)] text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-600)] transition-colors">
                <HelpCircle size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Ajuda</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--color-neutral-100)] mx-2" />

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--border-radius)] hover:bg-[var(--color-neutral-50)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center ring-2 ring-[var(--color-primary-lighten-02)]">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] text-[var(--color-neutral-800)] leading-tight" style={{ fontWeight: 600 }}>{userName}</p>
                <p className="text-[11px] text-[var(--color-neutral-400)] leading-tight">{userRole}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[var(--color-neutral-100)] rounded-[var(--border-radius-lg)] shadow-[var(--shadow-lg)] py-1.5 z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
                  <p className="text-[13px] text-[var(--color-neutral-800)]" style={{ fontWeight: 600 }}>{userName}</p>
                  <p className="text-[12px] text-[var(--color-neutral-400)]">{userRole}</p>
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors text-left">
                    <User size={15} className="text-[var(--color-neutral-400)]" />
                    Meu Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors text-left">
                    <Settings size={15} className="text-[var(--color-neutral-400)]" />
                    Configurações
                  </button>
                </div>

                <div className="border-t border-[var(--color-neutral-100)] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--color-error)] hover:bg-[var(--color-error-surface)] transition-colors text-left"
                  >
                    <LogOut size={15} />
                    Sair da plataforma
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
