import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BellRing, Search, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EntregaPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");
  const [searchingPedido, setSearchingPedido] = useState(false);
  const [pedidosBuscados, setPedidosBuscados] = useState<any[]>([]);

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

  const handleSearchPedido = async () => {
    if (!numeroPedido.trim()) return;
    setSearchingPedido(true);
    try {
      const response = await api.get(`/erp/pedidos/${numeroPedido}`);
      const pedido = response.data;
      if (pedidosBuscados.some(p => p.pedido === pedido.pedido)) {
        toast.warning("Este pedido já foi adicionado");
      } else {
        setPedidosBuscados([
          ...pedidosBuscados,
          {
            ...pedido,
            sequencia: pedidosBuscados.length + 1,
          },
        ]);
        setNumeroPedido("");
        toast.success("Pedido adicionado");
      }
    } catch (error: any) {
      if (error.response?.status == 404) {
        toast.error("Pedido não encontrado no ERP");
      } else if (error.response?.status == 423) {
        toast.error("Já existe uma rota com esse pedido");
      } else {
        toast.error("Erro ao buscar pedido");
      }
    } finally {
      setSearchingPedido(false);
    }
  };

  useEffect(() => {
    console.log(pedidosBuscados);
  }, [pedidosBuscados]);

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
            <Button onClick={() => setNotificationDialog(true)}>
              <BellRing size={20} />
              Notificar entrega
            </Button>
          </div>
        </Card>

        <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notificar Entrega</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col w-full gap-2">
              <div className="flex flex-col w-full gap-2 items-start justify-stretch">
                <Label>Número do Pedido</Label>
                <div className="space-y-2 w-full gap-2 flex flex-row">
                  <Input
                    placeholder="Ex: 123"
                    value={numeroPedido}
                    onChange={e => setNumeroPedido(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleSearchPedido()}
                  />
                  <Button onClick={handleSearchPedido}>
                    <Search size={16} />
                  </Button>
                </div>
              </div>
              <hr className="border-2" />

              <div className="flex">
                {pedidosBuscados.length === 0 ? (
                  <div className="mt-3 flex border-2 p-6 rounded-sm flex-col justify-center items-center">
                    <X size={48} className="text-gray-500" />
                    <h1 className="font-bold text-xl mt-4 text-gray-500">
                      Vazio
                    </h1>
                    <h2 className="text-gray-500 font-light w-[60%] text-center">
                      Digite o código dos pedidos e adicione os para notificar
                      ao cliente
                    </h2>
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-2">
                    {pedidosBuscados.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 flex items-center justify-between w-full border-2 rounded-sm bg-slate-50/50"
                      >
                        <div>
                          <p className="text-sm font-bold">
                            #{p.pedido} - {p.client_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.address}
                            {p.address_number}, {p.city}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPedidosBuscados(
                              pedidosBuscados.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-red-500"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
