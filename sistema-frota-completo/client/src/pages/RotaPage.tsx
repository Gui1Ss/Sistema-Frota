import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function RotaPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [pedidosBuscados, setPedidosBuscados] = useState<any[]>([]);
  const [searchingPedido, setSearchingPedido] = useState(false);

  // Buscar motoristas
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        const response = await api.get('/drivers/');
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
        toast.error("Erro ao buscar motoristas");
        return [];
      }
    }
  });

  // Buscar veículos
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        const response = await api.get('/vehicles/');
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        toast.error("Erro ao buscar veículos");
        return [];
      }
    }
  });

  // Buscar rotas
  const { data: rotas, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      try {
        const response = await api.get('/routes/');
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar rotas:", error);
        toast.error("Erro ao buscar rotas");
        return [];
      }
    }
  });

  // Criar rota
  const createRouteMutation = useMutation({
    mutationFn: (newRoute: any) => api.post('/routes/', newRoute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Rota criada com sucesso");
      setIsDialogOpen(false);
      setPedidosBuscados([]);
      setSelectedDriver("");
      setSelectedVehicle("");
      setNumeroPedido("");
    },
    onError: (error: any) => {
      console.error("Erro ao criar rota:", error);
      toast.error("Erro ao criar rota: " + (error.response?.data?.detail || error.message));
    }
  });

  // Buscar pedido do ERP
  const handleSearchPedido = async () => {
    if (!numeroPedido.trim()) {
      toast.error("Digite um número de pedido");
      return;
    }

    setSearchingPedido(true);
    try {
      // Buscar pedido do banco ERP
      const response = await api.get(`/erp/pedidos/${numeroPedido}`);
      const pedido = response.data;

      // Verificar se pedido já foi adicionado
      if (pedidosBuscados.some(p => p.pedido === pedido.pedido)) {
        toast.warning("Este pedido já foi adicionado");
        setNumeroPedido("");
        return;
      }

      // Adicionar sequência
      const pedidoComSequencia = {
        ...pedido,
        sequencia: pedidosBuscados.length + 1
      };

      setPedidosBuscados([...pedidosBuscados, pedidoComSequencia]);
      setNumeroPedido("");
      toast.success("Pedido adicionado com sucesso");
    } catch (error: any) {
      console.error("Erro ao buscar pedido:", error);
      if (error.response?.status === 404) {
        toast.error("Pedido não encontrado no ERP");
      } else {
        toast.error("Erro ao buscar pedido: " + (error.response?.data?.detail || error.message));
      }
    } finally {
      setSearchingPedido(false);
    }
  };

  // Remover pedido da lista
  const handleRemovePedido = (index: number) => {
    const novosPedidos = pedidosBuscados.filter((_, i) => i !== index);
    // Recalcular sequências
    const pedidosAtualizados = novosPedidos.map((p, i) => ({
      ...p,
      sequencia: i + 1
    }));
    setPedidosBuscados(pedidosAtualizados);
    toast.success("Pedido removido");
  };

  // Criar rota com pedidos
  const handleCreateRoute = () => {
    if (!selectedDriver) {
      toast.error("Selecione um motorista");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Selecione um veículo");
      return;
    }
    if (pedidosBuscados.length === 0) {
      toast.error("Adicione pelo menos um pedido");
      return;
    }

    // Preparar dados da rota
    const routeData = {
      items: pedidosBuscados.map((p, index) => ({
        ordernumber: p.pedido,
        sequence: index + 1,
        status: "pending",
        telefone: p.nfenfonee
      })),
      route: {
        driverid: parseInt(selectedDriver),
        vehicleid: parseInt(selectedVehicle),
        status: "pending"
      }
    };

    createRouteMutation.mutate(routeData);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rotas</h1>
            <p className="text-slate-600 mt-2">Gerenciar rotas de entrega</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus size={20} /> Nova Rota
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Rota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Seleção de Motorista e Veículo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver">Motorista *</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger id="driver" disabled={driversLoading}>
                      <SelectValue placeholder={driversLoading ? "Carregando..." : "Selecione um motorista"} />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers && drivers.length > 0 ? (
                        drivers.map((d: any) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.name || d.nome || "Sem nome"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled>Nenhum motorista disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle">Veículo *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger id="vehicle" disabled={vehiclesLoading}>
                      <SelectValue placeholder={vehiclesLoading ? "Carregando..." : "Selecione um veículo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles && vehicles.length > 0 ? (
                        vehicles.map((v: any) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.plate || v.placa || "Sem placa"} - {v.name || v.nome || "Sem nome"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled>Nenhum veículo disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Busca de Pedidos */}
              <div className="border-t pt-4">
                <Label htmlFor="pedido">Buscar Pedidos no ERP</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="pedido"
                    value={numeroPedido}
                    onChange={(e) => setNumeroPedido(e.target.value)}
                    placeholder="Digite o número do pedido"
                    onKeyPress={(e) => e.key === "Enter" && handleSearchPedido()}
                  />
                  <Button
                    onClick={handleSearchPedido}
                    disabled={searchingPedido || !numeroPedido.trim()}
                  >
                    <Search size={16} /> {searchingPedido ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              {/* Lista de Pedidos Adicionados */}
              {pedidosBuscados.length > 0 && (
                <div className="border-t pt-4">
                  <Label>Pedidos Adicionados ({pedidosBuscados.length})</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {pedidosBuscados.map((pedido, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            #{pedido.pedido} - {pedido.nosempant}
                          </div>
                          <div className="text-xs text-slate-600">
                            {pedido.nfenfanem}, {pedido.ndennumem} - {pedido.nfennomue}, {pedido.nfenesemi}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            CNPJ/CPF: {pedido.nosempcgc} | Sequência: {pedido.sequencia}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePedido(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setPedidosBuscados([]);
                    setSelectedDriver("");
                    setSelectedVehicle("");
                    setNumeroPedido("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateRoute}
                  disabled={createRouteMutation.isPending || !selectedDriver || !selectedVehicle || pedidosBuscados.length === 0}
                >
                  <Check size={16} className="mr-2" />
                  {createRouteMutation.isPending ? "Criando..." : "Criar Rota"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tabela de Rotas */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Motorista</th>
                <th className="px-6 py-3 text-left">Veículo</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ) : rotas && rotas.length > 0 ? (
                rotas.map((rota: any) => {
                  const driver = drivers?.find((d: any) => d.id === rota.driverid);
                  const vehicle = vehicles?.find((v: any) => v.id === rota.vehicleid);
                  return (
                    <tr key={rota.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold">#{rota.id}</td>
                      <td className="px-6 py-4">{driver?.name || driver?.nome || "Desconhecido"}</td>
                      <td className="px-6 py-4">{vehicle?.plate || vehicle?.placa || "Desconhecido"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rota.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          rota.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          rota.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {rota.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(rota.createdat).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                    Nenhuma rota encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </MainLayout>
  );
}
