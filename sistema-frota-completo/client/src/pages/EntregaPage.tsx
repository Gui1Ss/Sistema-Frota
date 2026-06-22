import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EntregaPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const response = await api.get("/deliveries/");
      return response.data;
    },
  });

  const deleteDeliveryMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/deliveries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Entrega excluída com sucesso");
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(
        "Erro ao excluir entrega: " +
          (error.response?.data?.detail || error.message)
      );
      setDeleteConfirmId(null);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "entregue":
        return "bg-green-100 text-green-700";
      case "nao entregue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredDeliveries =
    deliveries?.filter((delivery: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        delivery.ordernumber.toLowerCase().includes(searchLower) ||
        (delivery.clientname || "").toLowerCase().includes(searchLower) ||
        delivery.status.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Entregas</h1>
          <p className="text-slate-600 mt-2">
            Acompanhar status de todas as entregas
          </p>
        </div>

        <Card className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Buscar por número do pedido, cliente ou status..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Pedido
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Cliente
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Data de Entrega
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td colSpan={5} className="px-6 py-4">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredDeliveries && filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((delivery: any) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        #{delivery.ordernumber}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {delivery.clientname || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${getStatusColor(delivery.status)} border-none shadow-none`}
                        >
                          {delivery.status == "in_progress"
                            ? "Em rota"
                            : delivery.status == "entregue"
                              ? "Entregue"
                              : "erro"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {delivery.deliveredat
                          ? new Date(delivery.deliveredat).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Pendente"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteConfirmId(delivery.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500 italic"
                    >
                      {searchQuery
                        ? "Nenhuma entrega encontrada com esse critério"
                        : "Nenhuma entrega registrada"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <AlertDialog
          open={deleteConfirmId !== null}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Entrega?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá o registro de entrega. Se o pedido estiver
                vinculado a uma rota ativa, você poderá removê-lo da rota após
                esta exclusão.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  deleteConfirmId &&
                  deleteDeliveryMutation.mutate(deleteConfirmId)
                }
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
