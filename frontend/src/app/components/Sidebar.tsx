import { Link, useLocation, useNavigate } from 'react-router';
import logoSvg from '../../imports/Logo_ilumina.svg';
import { BookOpen, Users, FileText, LayoutDashboard, LogOut, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  userType: 'professor' | 'aluno';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userType, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const professorLinks = [
    { path: '/professor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professor/turmas', label: 'Turmas', icon: Users },
    { path: '/professor/provas/criar', label: 'Criar Prova', icon: FileText },
    { path: '/professor/flashcards', label: 'Flashcards', icon: BookOpen },
  ];

  const alunoLinks = [
    { path: '/aluno', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/aluno/provas', label: 'Provas', icon: FileText },
    { path: '/aluno/flashcards', label: 'Flashcards', icon: BookOpen },
  ];

  const links = userType === 'professor' ? professorLinks : alunoLinks;

  const handleLogout = () => {
    navigate('/');
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt="Ilumina" className="h-9 w-auto" />
          <div className="h-5 w-px bg-white/20" />
          <span className="text-white/70 text-xs tracking-wide uppercase">
            {userType === 'professor' ? 'Professor' : 'Aluno'}
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path ||
              (link.path !== '/professor' && link.path !== '/aluno' && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`
                  group flex items-center gap-3 px-4 py-2.5 rounded transition-all relative
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-secondary-yellow)] rounded-r" />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1 text-sm">{link.label}</span>
                {isActive && <ChevronRight size={14} className="text-white/50" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded text-white/60 hover:bg-white/8 hover:text-white transition-all text-sm"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-[var(--color-primary-darken-02)] h-screen fixed left-0 top-0 flex-col z-50">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative w-[280px] bg-[var(--color-primary-darken-02)] h-screen flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
