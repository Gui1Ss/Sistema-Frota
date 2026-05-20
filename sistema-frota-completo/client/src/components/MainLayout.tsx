import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BarChart3, Truck, Users, MapPin, Package, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = { name: "Admin", email: "admin@frota.local" };
  const logout = () => setLocation("/");

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Motoristas", path: "/motoristas" },
    { icon: Truck, label: "Veículos", path: "/veiculos" },
    { icon: MapPin, label: "Rotas", path: "/rotas" },
    { icon: Package, label: "Entregas", path: "/entregas" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-white transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">Logística</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {sidebarOpen && (
            <div className="mb-4 text-sm text-slate-300">
              <p className="font-semibold">{user?.name || "Usuário"}</p>
              <p className="text-xs text-slate-400">{user?.email || ""}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full text-slate-900 hover:text-slate-900"
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Sistema de Logística</h2>
            <div className="text-sm text-slate-600">
              {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
