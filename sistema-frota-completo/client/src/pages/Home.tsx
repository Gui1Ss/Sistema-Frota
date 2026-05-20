import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Truck className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-slate-900">Logistica</h1>
        </div>
        
        <p className="text-center text-slate-600 mb-8">
          Sistema de Logistica e Roteirizacao para Veiculos Urbanos de Carga
        </p>
        
        <Button
          onClick={() => setLocation('/dashboard')}
          className="w-full py-6 text-lg font-semibold"
        >
          Entrar no Sistema
        </Button>
        
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Funcionalidades:</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>✓ Gerenciamento de motoristas</li>
            <li>✓ Controle de frota</li>
            <li>✓ Planejamento de rotas</li>
            <li>✓ Rastreamento de entregas</li>
            <li>✓ Relatorios e analises</li>
          </ul>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p>Modo Integrado: Conectando ao Backend FastAPI</p>
        </div>
      </Card>
    </div>
  );
}
