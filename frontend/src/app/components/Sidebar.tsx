import { BookOpen, ChevronRight, FileText, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import logoSvg from "../../imports/ilumina_logo.svg";
import { useAuth } from "../hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
  userType: 'professor' | 'aluno';
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ userType, isOpen = false, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const professorLinks = [
    { path: '/professor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professor/turmas', label: 'Turmas', icon: Users },
    { path: '/professor/provas', label: 'Provas', icon: FileText },
    { path: '/professor/flashcards', label: 'Flashcards', icon: BookOpen },
  ];

  const alunoLinks = [
    { path: '/aluno', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/aluno/provas', label: 'Provas', icon: FileText },
    { path: '/aluno/flashcards', label: 'Flashcards', icon: BookOpen },
  ];

  const links = userType === 'professor' ? professorLinks : alunoLinks;

  const handleLogout = () => {
    onClose?.();
    logout();
  };
  const handleLinkClick = () => onClose?.();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/professor' && path !== '/aluno' && location.pathname.startsWith(path));

  /* ── Desktop sidebar ─────────────────────────────────────────── */
  const desktop = (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 bg-[var(--color-primary-darken-02)] overflow-hidden transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-[260px]'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-white/10 py-4 ${
          collapsed ? 'justify-center px-0 h-[60px]' : 'justify-between px-5 h-[60px]'
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoSvg} alt="Ilumina" className="h-8 w-auto shrink-0" />
            <div className="h-4 w-px bg-white/20 shrink-0" />
            <span className="text-white/60 text-[11px] tracking-widest uppercase truncate">
              {userType === 'professor' ? 'Professor' : 'Aluno'}
            </span>
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="shrink-0 p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expandir menu' : 'Minimizar menu'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            if (collapsed) {
              return (
                <Tooltip key={link.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={link.path}
                      className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded transition-all ${
                        active
                          ? 'bg-white/15 text-white'
                          : 'text-white/60 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-secondary-yellow)] rounded-r" />
                      )}
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded transition-all ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-secondary-yellow)] rounded-r" />
                )}
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                <span className="flex-1 text-sm">{link.label}</span>
                {active && <ChevronRight size={14} className="text-white/50" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-2 py-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 mx-auto rounded text-white/50 hover:bg-white/8 hover:text-white transition-all"
              >
                <LogOut size={18} strokeWidth={1.8} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair da plataforma</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded text-white/60 hover:bg-white/8 hover:text-white transition-all text-sm"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sair</span>
          </button>
        )}
      </div>
    </aside>
  );

  /* ── Mobile overlay sidebar (always expanded) ────────────────── */
  const mobile = isOpen ? (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative w-[280px] bg-[var(--color-primary-darken-02)] h-screen flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 h-[60px]">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Ilumina" className="h-8 w-auto" />
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/60 text-[11px] tracking-widest uppercase">
              {userType === 'professor' ? 'Professor' : 'Aluno'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <div className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`group relative flex items-center gap-3 px-4 py-2.5 rounded transition-all ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-secondary-yellow)] rounded-r" />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="flex-1 text-sm">{link.label}</span>
                  {active && <ChevronRight size={14} className="text-white/50" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile footer */}
        <div className="border-t border-white/10 px-2 py-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded text-white/60 hover:bg-white/8 hover:text-white transition-all text-sm"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
