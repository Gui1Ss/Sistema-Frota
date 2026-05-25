import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { transformDriverToApi, transformDriverFromApi } from "@/lib/apiTransform";

interface DriverFormData {
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email: string;
  cnhValidade?: string;
  categoria?: string;
  senha?: string;
}

export default function MotoristaPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    nome: "",
    cpf: "",
    cnh: "",
    telefone: "",
    email: "",
    cnhValidade: "",
    categoria: "D",
    senha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ CORRIGIDO: Buscar motoristas com transformação de dados
  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await api.get('/drivers/');
      // Transformar dados da API para o formato do frontend (usar nomes exatos da API)
      return response.data.map((driver: any) => ({
        ...driver,
        nome: driver.name,
        cpf: driver.cpf,
        // A API retorna campos em minúsculas: licensenumber, licenseexpiry, licensecategory
        cnh: driver.licensenumber || driver.licenseNumber || "",
        telefone: driver.phone,
        email: driver.email,
        cnhValidade: driver.licenseexpiry || driver.licenseExpiry || "",
        categoria: driver.licensecategory || driver.licenseCategory || "",
      }));
    }
  });

  // ✅ CORRIGIDO: Criar motorista com transformação de dados
  const createMutation = useMutation({
    mutationFn: (newDriver: DriverFormData) => {
      const apiPayload = transformDriverToApi(newDriver);
      return api.post('/drivers/', apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success("Motorista cadastrado com sucesso");
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao cadastrar motorista");
    }
  });

  // ✅ CORRIGIDO: Atualizar motorista com transformação de dados
  const updateMutation = useMutation({
    mutationFn: (updatedDriver: DriverFormData) => {
      const apiPayload = transformDriverToApi(updatedDriver);
      return api.put(`/drivers/${editingId}`, apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success("Motorista atualizado com sucesso");
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao atualizar motorista");
    }
  });

  // ✅ Deletar motorista
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success("Motorista removido com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar:", error.response?.data);
      toast.error(error.response?.data?.detail || "Erro ao remover motorista");
    }
  });

  // ✅ Validação de formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    if (!formData.cnh.trim()) newErrors.cnh = "CNH é obrigatória";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
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

  // ✅ Editar motorista
  const handleEdit = (motorista: any) => {
    setFormData({
      nome: motorista.nome,
      cpf: motorista.cpf,
      cnh: motorista.cnh,
      telefone: motorista.telefone || "",
      email: motorista.email || "",
      cnhValidade: motorista.cnhValidade || "",
      categoria: motorista.categoria || "D",
      senha: "",
    });
    setEditingId(motorista.id);
    setIsDialogOpen(true);
  };

  // ✅ Fechar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({ 
      nome: "", 
      cpf: "", 
      cnh: "", 
      telefone: "", 
      email: "",
      cnhValidade: "",
      categoria: "D",
      senha: "",
    });
    setErrors({});
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Motoristas</h1>
            <p className="text-slate-600 mt-2">Gerenciar motoristas do sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                Novo Motorista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Motorista" : "Cadastrar Motorista"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input 
                    id="nome" 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})} 
                  />
                  {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input 
                    id="cpf" 
                    value={formData.cpf} 
                    onChange={e => setFormData({...formData, cpf: e.target.value})} 
                  />
                  {errors.cpf && <p className="text-sm text-red-600">{errors.cpf}</p>}
                </div>
                <div>
                  <Label htmlFor="cnh">CNH *</Label>
                  <Input 
                    id="cnh" 
                    value={formData.cnh} 
                    onChange={e => setFormData({...formData, cnh: e.target.value})} 
                  />
                  {errors.cnh && <p className="text-sm text-red-600">{errors.cnh}</p>}
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input 
                    id="telefone" 
                    value={formData.telefone} 
                    onChange={e => setFormData({...formData, telefone: e.target.value})} 
                  />
                  {errors.telefone && <p className="text-sm text-red-600">{errors.telefone}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="cnhValidade">Validade CNH</Label>
                  <Input 
                    id="cnhValidade" 
                    type="date"
                    value={formData.cnhValidade} 
                    onChange={e => setFormData({...formData, cnhValidade: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria CNH</Label>
                  <Input 
                    id="categoria" 
                    value={formData.categoria} 
                    onChange={e => setFormData({...formData, categoria: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="senha">{editingId ? "Nova Senha (deixe vazio para manter)" : "Senha *"}</Label>
                  <Input 
                    id="senha" 
                    type="password"
                    value={formData.senha} 
                    onChange={e => setFormData({...formData, senha: e.target.value})} 
                  />
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
          ) : motoristas && motoristas.length > 0 ? (
            motoristas.map((motorista: any) => (
              <Card key={motorista.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{motorista.nome}</h3>
                    <p className="text-sm text-slate-600"><span className="font-medium">CPF:</span> {motorista.cpf}</p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">CNH:</span> {motorista.cnh} ({motorista.categoria}) | <span className="font-bold">expira em: ({motorista.cnhValidade ? new Date(String(motorista.cnhValidade).replace(" ", "T")).toLocaleDateString("pt-BR") : '—'})</span>
                    </p>
                    <p className="text-sm text-slate-600"><span className="font-medium">Telefone:</span> {motorista.telefone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(motorista)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(motorista.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600">Nenhum motorista cadastrado</p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
