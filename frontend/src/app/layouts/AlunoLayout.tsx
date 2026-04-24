import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../hooks/useAuth";
import { getRoleLabel } from "../lib/mappings";

export default function AlunoLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      <Sidebar
        userType="aluno"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[260px]'
        }`}
      >
        <TopBar
          userName={user?.name ?? "Aluno"}
          userRole={user ? getRoleLabel(user.roles) : "Aluno"}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
