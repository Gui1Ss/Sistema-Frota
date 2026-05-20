import { useState } from "react";
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

  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: async () => (await api.get('/drivers/')).data });
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: async () => (await api.get('/vehicles/')).data });
  const { data: rotas, isLoading } = useQuery({ queryKey: ['routes'], queryFn: async () => (await api.get('/routes/')).data });

  const createRouteMutation = useMutation({
    mutationFn: (newRoute: any) => api.post('/routes/', newRoute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Rota criada com sucesso");
      setIsDialogOpen(false);
      setPedidosBuscados([]);
    },
    onError: () => toast.error("Erro ao criar rota")
  });

  const handleSearchPedido = async () => {
    if (!numeroPedido) return;
    setSearchingPedido(true);
    try {
      // Mock para o FastAPI (ou endpoint real se existir)
      const mockPedido = {
        numeroPedido: parseInt(numeroPedido),
        nomeCliente: "Cliente Exemplo",
        rua: "Rua Exemplo",
        numero: "123",
        cidade: "São Paulo",
        estado: "SP",
        sequencia: pedidosBuscados.length + 1
      };
      setPedidosBuscados([...pedidosBuscados, mockPedido]);
      setNumeroPedido("");
      toast.success("Pedido adicionado");
    } catch (e) {
      toast.error("Pedido não encontrado");
    } finally {
      setSearchingPedido(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rotas</h1>
            <p className="text-slate-600 mt-2">Gerenciar rotas de entrega</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2"><Plus size={20} /> Nova Rota</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Criar Nova Rota</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Motorista *</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {drivers?.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Veículo *</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((v: any) => <SelectItem key={v.id} value={v.id.toString()}>{v.placa}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={numeroPedido} onChange={e => setNumeroPedido(e.target.value)} placeholder="Número do pedido" />
                <Button onClick={handleSearchPedido} disabled={searchingPedido}><Search size={16} /> Buscar</Button>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => createRouteMutation.mutate({ motoristaId: selectedDriver, veiculoId: selectedVehicle, pedidos: pedidosBuscados })}>Criar Rota</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Motorista</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
              ) : rotas && rotas.length > 0 ? (
                rotas.map((rota: any) => (
                  <tr key={rota.id} className="border-b">
                    <td className="px-6 py-4">#{rota.id}</td>
                    <td className="px-6 py-4">{rota.motoristaId}</td>
                    <td className="px-6 py-4">{rota.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-6 py-8 text-center">Nenhuma rota encontrada</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </MainLayout>
  );
}
