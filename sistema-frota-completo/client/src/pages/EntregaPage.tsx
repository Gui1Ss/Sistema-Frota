import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function EntregaPage() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const response = await api.get('/deliveries/');
      return response.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-700";
      case "em_rota": return "bg-blue-100 text-blue-700";
      case "entregue": return "bg-green-100 text-green-700";
      case "nao_entregue": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Entregas</h1>
          <p className="text-slate-600 mt-2">Acompanhar status de todas as entregas</p>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Pedido</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : deliveries && deliveries.length > 0 ? (
                deliveries.map((delivery: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">#{delivery.ordernumber}</td>
                    <td className="px-6 py-4">{delivery.clientname}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhuma entrega registrada</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </MainLayout>
  );
}
