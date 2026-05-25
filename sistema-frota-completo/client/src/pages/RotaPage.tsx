import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Trash2, Check, Truck, AlertCircle, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
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

export default function RotaPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");
  const [numeroEndereco, setNumeroEndereco] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [pedidosBuscados, setPedidosBuscados] = useState<any[]>([]);
  const [searchingPedido, setSearchingPedido] = useState(false);
  const [confirmSaidaRotaId, setConfirmSaidaRotaId] = useState<number | null>(null);
  const [searchRouteQuery, setSearchRouteQuery] = useState("");
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<any | null>(null);
  const [routeDetailsOpen, setRouteDetailsOpen] = useState(false);
  const [deleteConfirmRouteId, setDeleteConfirmRouteId] = useState<number | null>(null);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<number | null>(null);

  // Buscar motoristas
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        const response = await api.get('/drivers/');
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
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
        return [];
      }
    }
  });

  // Buscar itens de uma rota específica
  const { data: routeItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['route-items', selectedRouteForDetails?.id],
    queryFn: async () => {
      if (!selectedRouteForDetails?.id) return [];
      try {
        const response = await api.get('/route-items/');
        return response.data.filter((item: any) => item.routeid === selectedRouteForDetails.id) || [];
      } catch (error) {
        console.error("Erro ao buscar itens da rota:", error);
        return [];
      }
    },
    enabled: !!selectedRouteForDetails?.id
  });

  // Criar rota
  const createRouteMutation = useMutation({
    mutationFn: (newRoute: any) => api.post('/routes/', newRoute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Rota criada com sucesso");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar rota: " + (error.response?.data?.detail || error.message));
    }
  });

  // Marcar rota como saiu para entrega
  const saidaEntregaMutation = useMutation({
    mutationFn: (routeId: number) => api.post(`/routes/${routeId}/saiu-entrega`).then((res) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Rota marcada como em entrega!");
      setConfirmSaidaRotaId(null);
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setConfirmSaidaRotaId(null);
    }
  });

  // Excluir rota
  const deleteRouteMutation = useMutation({
    mutationFn: (routeId: number) => api.delete(`/routes/${routeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Rota excluída com sucesso");
      setDeleteConfirmRouteId(null);
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setDeleteConfirmRouteId(null);
    }
  });

  // Remover item da rota (pedido)
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => api.delete(`/route-items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-items', selectedRouteForDetails?.id] });
      toast.success("Pedido removido da rota");
      setDeleteConfirmItemId(null);
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setDeleteConfirmItemId(null);
    }
  });

  const resetForm = () => {
    setPedidosBuscados([]);
    setSelectedDriver("");
    setSelectedVehicle("");
    setNumeroPedido("");
  };

  const handleSearchPedido = async () => {
    if (!numeroPedido.trim()) return;
    setSearchingPedido(true);
    try {
      const response = await api.get(`/erp/pedidos/${numeroPedido}`);
      const pedido = response.data;
      if (pedidosBuscados.some(p => p.pedido === pedido.pedido)) {
        toast.warning("Este pedido já foi adicionado");
      } else {
        setPedidosBuscados([...pedidosBuscados, { 
          ...pedido, 
          address_number: numeroEndereco,
          sequencia: pedidosBuscados.length + 1 
        }]);
        setNumeroPedido("");
        setNumeroEndereco("");
        toast.success("Pedido adicionado");
      }
    } catch (error: any) {
      toast.error(error.response?.status === 404 ? "Pedido não encontrado no ERP" : "Erro ao buscar pedido");
    } finally {
      setSearchingPedido(false);
    }
  };

  const handleCreateRoute = () => {
    if (!selectedDriver || !selectedVehicle || pedidosBuscados.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createRouteMutation.mutate({
      items: pedidosBuscados.map((p, index) => ({
        ordernumber: p.pedido,
        sequence: index + 1,
        status: "pending",
        telefone: p.telefone || "",
        address: p.address,
        neighborhood: p.neighborhood,
        city: p.city,
        state: p.state,
        zipcode: p.zipcode,
        address_number: p.address_number
      })),
      route: {
        driverid: parseInt(selectedDriver),
        vehicleid: parseInt(selectedVehicle),
        status: "pending"
      }
    });
  };

  const filteredRotas = rotas?.filter((rota: any) => {
    const searchLower = searchRouteQuery.toLowerCase();
    const driverName = drivers?.find((d: any) => d.id === rota.driverid)?.name || "";
    const vehiclePlate = vehicles?.find((v: any) => v.id === rota.vehicleid)?.plate || "";
    return rota.id.toString().includes(searchLower) || 
           driverName.toLowerCase().includes(searchLower) || 
           vehiclePlate.toLowerCase().includes(searchLower);
  }) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rotas</h1>
            <p className="text-slate-600 mt-1">Gerencie e despache suas rotas de entrega</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Buscar rota, motorista ou placa..." 
                className="pl-10 w-full md:w-64"
                value={searchRouteQuery}
                onChange={(e) => setSearchRouteQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} /> Nova Rota
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-700">ID</th>
                  <th className="p-4 font-semibold text-slate-700">Motorista</th>
                  <th className="p-4 font-semibold text-slate-700">Veículo</th>
                  <th className="p-4 font-semibold text-slate-700">Status</th>
                  <th className="p-4 font-semibold text-slate-700">Cor</th>
                  <th className="p-4 font-semibold text-slate-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100"><td colSpan={6} className="p-4"><Skeleton className="h-12 w-full" /></td></tr>
                  ))
                ) : filteredRotas.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma rota encontrada.</td></tr>
                ) : (
                  filteredRotas.map((rota: any) => (
                    <tr key={rota.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium">#{rota.id}</td>
                      <td className="p-4">{drivers?.find((d: any) => d.id === rota.driverid)?.name || "N/A"}</td>
                      <td className="p-4">{vehicles?.find((v: any) => v.id === rota.vehicleid)?.plate || "N/A"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rota.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          rota.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {rota.status === 'pending' ? 'Pendente' : rota.status === 'in_progress' ? 'Em Entrega' : 'Finalizada'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: rota.color }}></div>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedRouteForDetails(rota);
                            setRouteDetailsOpen(true);
                          }}
                          title="Ver Pedidos"
                        >
                          <Eye size={16} />
                        </Button>
                        {rota.status === 'pending' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setConfirmSaidaRotaId(rota.id)}
                          >
                            <Truck size={16} className="mr-1" /> Despachar
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteConfirmRouteId(rota.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal Nova Rota */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Criar Nova Rota</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Motorista *</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger><SelectValue placeholder="Selecione um motorista" /></SelectTrigger>
                    <SelectContent>
                      {drivers?.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Veículo *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger><SelectValue placeholder="Selecione um veículo" /></SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((v: any) => <SelectItem key={v.id} value={v.id.toString()}>{v.plate} - {v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buscar Pedido no ERP</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Número do pedido..." 
                      value={numeroPedido} 
                      onChange={(e) => setNumeroPedido(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchPedido()}
                    />
                    <Button onClick={handleSearchPedido} disabled={searchingPedido} variant="secondary">
                      {searchingPedido ? "Buscando..." : <Search size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número do Endereço (Opcional)</Label>
                  <Input 
                    placeholder="Ex: 123" 
                    value={numeroEndereco} 
                    onChange={(e) => setNumeroEndereco(e.target.value)}
                  />
                </div>
              </div>

              {pedidosBuscados.length > 0 && (
                <div className="space-y-3">
                  <Label>Pedidos Adicionados ({pedidosBuscados.length})</Label>
                  <div className="border rounded-lg divide-y">
                    {pedidosBuscados.map((p, i) => (
                      <div key={i} className="p-3 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <p className="text-sm font-bold">#{p.pedido} - {p.client_name}</p>
                          <p className="text-xs text-slate-500">{p.address}{p.address_number ? `, ${p.address_number}` : ''}, {p.city}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setPedidosBuscados(pedidosBuscados.filter((_, idx) => idx !== i))} className="text-red-500">
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateRoute} disabled={createRouteMutation.isPending}>
                {createRouteMutation.isPending ? "Criando..." : "Criar Rota"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes da Rota */}
        <Dialog open={routeDetailsOpen} onOpenChange={setRouteDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Pedidos da Rota #{selectedRouteForDetails?.id}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {itemsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : routeItems?.length === 0 ? (
                <p className="text-center text-slate-500">Nenhum pedido vinculado.</p>
              ) : (
                <div className="border rounded-lg divide-y max-h-[60vh] overflow-y-auto">
                  {routeItems?.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">Pedido #{item.ordernumber}</p>
                        <p className="text-sm text-slate-600">{item.address}</p>
                        <p className="text-xs text-slate-400">{item.neighborhood}, {item.city} - {item.state}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {item.status === 'pending' ? 'Pendente' : 'Finalizado'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteConfirmItemId(item.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Alertas de Confirmação */}
        <AlertDialog open={confirmSaidaRotaId !== null} onOpenChange={() => setConfirmSaidaRotaId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Despachar Rota?</AlertDialogTitle>
              <AlertDialogDescription>A rota será marcada como "Em Entrega" e os clientes serão notificados via WhatsApp.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmSaidaRotaId && saidaEntregaMutation.mutate(confirmSaidaRotaId)}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteConfirmRouteId !== null} onOpenChange={() => setDeleteConfirmRouteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Rota?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. A rota só pode ser excluída se não houver entregas vinculadas.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteConfirmRouteId && deleteRouteMutation.mutate(deleteConfirmRouteId)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteConfirmItemId !== null} onOpenChange={() => setDeleteConfirmItemId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Pedido?</AlertDialogTitle>
              <AlertDialogDescription>O pedido será removido desta rota. Se a rota já estiver em andamento, você deve excluir a entrega primeiro.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteConfirmItemId && deleteItemMutation.mutate(deleteConfirmItemId)}>Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
