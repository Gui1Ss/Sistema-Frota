import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  transformVehicleToApi,
  transformVehicleFromApi,
} from "@/lib/apiTransform";

interface VehicleFormData {
  placa: string;
  nome: string;
  tipo: string;
  capacidade: string;
}

export default function VeiculoPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    placa: "",
    nome: "Hyundai HR",
    tipo: "VUC",
    capacidade: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ CORRIGIDO: Buscar veículos com transformação de dados
  const { data: veiculos, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await api.get("/vehicles/");
      // Transformar dados da API para o formato do frontend
      return response.data.map((vehicle: any) => ({
        ...vehicle,
        placa: vehicle.plate,
        nome: vehicle.name,
        tipo: vehicle.type,
        capacidade: vehicle.capacity,
      }));
    },
  });

  // ✅ CORRIGIDO: Criar veículo com transformação de dados
  const createMutation = useMutation({
    mutationFn: (newVehicle: VehicleFormData) => {
      const apiPayload = transformVehicleToApi({
        placa: newVehicle.placa,
        nome: newVehicle.nome,
        tipo: newVehicle.tipo,
        capacidade: parseFloat(newVehicle.capacidade),
      });
      return api.post("/vehicles/", apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Veículo cadastrado com sucesso");
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao cadastrar veículo");
    },
  });

  // ✅ CORRIGIDO: Atualizar veículo com transformação de dados
  const updateMutation = useMutation({
    mutationFn: (updatedVehicle: VehicleFormData) => {
      const apiPayload = transformVehicleToApi({
        placa: updatedVehicle.placa,
        nome: updatedVehicle.nome,
        tipo: updatedVehicle.tipo,
        capacidade: parseFloat(updatedVehicle.capacidade),
      });
      return api.put(`/vehicles/${editingId}`, apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Veículo atualizado com sucesso");
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao atualizar veículo");
    },
  });

  // ✅ Deletar veículo
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Veículo removido com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao remover veículo");
    },
  });

  // ✅ Validação de formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.placa.trim()) newErrors.placa = "Placa é obrigatória";
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.tipo.trim()) newErrors.tipo = "Tipo é obrigatório";
    if (!formData.capacidade.trim())
      newErrors.capacidade = "Capacidade é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // ✅ Editar veículo
  const handleEdit = (veiculo: any) => {
    setFormData({
      placa: veiculo.placa,
      nome: veiculo.nome,
      tipo: veiculo.tipo,
      capacidade: veiculo.capacidade.toString(),
    });
    setEditingId(veiculo.id);
    setIsDialogOpen(true);
  };

  // ✅ Fechar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({ placa: "", nome: "Hyundai HR", tipo: "VUC", capacidade: "" });
    setErrors({});
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Veículos</h1>
            <p className="text-slate-600 mt-2">Gerenciar veículos da frota</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Veículo" : "Cadastrar Veículo"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    onChange={e =>
                      setFormData({ ...formData, placa: e.target.value })
                    }
                    placeholder="ABC1234"
                  />
                  {errors.placa && (
                    <p className="text-sm text-red-600">{errors.placa}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={e =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Hyundai HR"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={tipo => setFormData({ ...formData, tipo })}
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VUC">VUC</SelectItem>
                      <SelectItem value="VAN">VAN</SelectItem>
                      <SelectItem value="CAMINHAO">CAMINHÃO</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo && (
                    <p className="text-sm text-red-600">{errors.tipo}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="capacidade">Capacidade (kg) *</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade}
                    onChange={e =>
                      setFormData({ ...formData, capacidade: e.target.value })
                    }
                    placeholder="1000"
                  />
                  {errors.capacidade && (
                    <p className="text-sm text-red-600">{errors.capacidade}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar" : "Cadastrar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))
          ) : veiculos && veiculos.length > 0 ? (
            veiculos.map((veiculo: any) => (
              <Card key={veiculo.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{veiculo.nome}</h3>
                    <p className="text-sm text-slate-600">
                      Placa: {veiculo.placa}
                    </p>
                    <p className="text-sm text-slate-600">
                      Tipo: {veiculo.tipo}
                    </p>
                    <p className="text-sm text-slate-600">
                      Capacidade: {veiculo.capacidade} kg
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(veiculo)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(veiculo.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600">Nenhum veículo cadastrado</p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
