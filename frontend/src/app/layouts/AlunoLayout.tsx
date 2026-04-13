import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export default function AlunoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      <Sidebar userType="aluno" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px] flex-1 flex flex-col min-w-0">
        <TopBar userName="João Pedro Santos" userRole="Aluno - 9º A" onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
