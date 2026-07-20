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
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Trash2,
  Check,
  Truck,
  AlertCircle,
  Eye,
  X,
  Pencil,
  CircleAlert,
  Printer,
  Camera,
  FileInput,
  MapPinned,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
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
import { Sortable } from "@/components/ui/Sortable";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { isDesktop } from "react-device-detect";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RotaPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedHelper, setSelectedHelper] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [pedidoBuscado, setPedidoBuscado] = useState<any>(null);
  const [pedidosBuscados, setPedidosBuscados] = useState<any[]>([]);
  // const [pedidoRoteiro, setPedidosRoteiro] = useState<any[]>([]);
  const [searchingPedido, setSearchingPedido] = useState(false);
  const [confirmSaidaRotaId, setConfirmSaidaRotaId] = useState<number | null>(
    null
  );
  const [searchRouteQuery, setSearchRouteQuery] = useState("");
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<
    any | null
  >(null);
  const [routeDetailsOpen, setRouteDetailsOpen] = useState(false);
  const [deleteConfirmRouteId, setDeleteConfirmRouteId] = useState<
    number | null
  >(null);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<number | null>(
    null
  );
  const [editRouteItemId, setEditRouteItemId] = useState<number | null>(null);
  const [sendPhotoRoute, setSendPhotoRoute] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  const [editStatus, setEditStatus] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editCEP, setEditCEP] = useState("");
  const [editLatitude, setEditLatitude] = useState(0);
  const [editLongitude, setEditLongitude] = useState(0);
  const [editNumero, setEditNumero] = useState("");
  const [editRoutePending, setEditRoutePending] = useState(false);
  const [tabValue, setTabValue] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [itemsLimit, setItemsLimit] = useState(10);
  const [itemsPage, setItemsPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState(".");

  useEffect(() => {
    setItemsPage(0);
  }, [itemsLimit]);

  // const [dadosFicticios, setDadosFicticios] = useState([
  //   {
  //     id: 1,
  //     ordernumber: "Lorem1",
  //     status: "Lorem",
  //     address: "Lorem",
  //     neighborhood: "Lorem",
  //     city: "Lorem",
  //     state: "Lorem",
  //     zipcode: "Lorem",
  //     address_number: "Lorem",
  //     sequence: 1,
  //     client_name: "Lorem",
  //     pedido: "Lorem",
  //   },
  //   {
  //     id: 2,
  //     ordernumber: "Lorem2",
  //     status: "Lorem",
  //     address: "Lorem",
  //     neighborhood: "Lorem",
  //     city: "Lorem",
  //     state: "Lorem",
  //     zipcode: "Lorem",
  //     address_number: "Lorem",
  //     sequence: 2,
  //     client_name: "Lorem",
  //     pedido: "Lorem",
  //   },
  //   {
  //     id: 3,
  //     ordernumber: "Lorem3",
  //     status: "Lorem",
  //     address: "Lorem",
  //     neighborhood: "Lorem",
  //     city: "Lorem",
  //     state: "Lorem",
  //     zipcode: "Lorem",
  //     address_number: "Lorem",
  //     sequence: 3,
  //     client_name: "Lorem",
  //     pedido: "Lorem",
  //   },
  // ]);

  interface RouteItem {
    id?: number;
    routeid?: number;
    ordernumber?: string;
    sequence?: number;
    status?: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
    latitude?: number;
    longitude?: number;
    address_number: string;
    reason?: string;
  }

  // Buscar motoristas
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      try {
        const response = await api.get("/drivers/livre");
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
        return [];
      }
    },
  });

  // Buscar veículos
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const response = await api.get("/vehicles/livres");
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        return [];
      }
    },
  });

  // Buscar rotas
  const { data: rotas, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      try {
        const response = await api.get("/routes/");
        console.log(response.data);
        return response.data || [];
      } catch (error) {
        console.error("Erro ao buscar rotas:", error);
        return [];
      }
    },
  });

  // Buscar itens de uma rota específica
  const { data: routeItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["route-items", selectedRouteForDetails?.id],
    queryFn: async () => {
      if (!selectedRouteForDetails?.id) return [];
      try {
        const response = await api.get("/route-items/");
        // console.log(response.data[4].latitude)
        return (
          response.data.filter(
            (item: any) => item.routeid === selectedRouteForDetails.id
          ) || []
        );
      } catch (error) {
        console.error("Erro ao buscar itens da rota:", error);
        return [];
      }
    },
    enabled: !!selectedRouteForDetails?.id,
  });

  // Criar rota
  const createRouteMutation = useMutation({
    mutationFn: (newRoute: any) => api.post("/routes/", newRoute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota criada com sucesso");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        "Erro ao criar rota: " + (error.response?.data?.detail || error.message)
      );
    },
  });

  // Marcar rota como saiu para entrega
  const saidaEntregaMutation = useMutation({
    mutationFn: (routeId: number) =>
      api.post(`/routes/${routeId}/saiu-entrega`).then(res => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota marcada como em entrega!");
      setConfirmSaidaRotaId(null);
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setConfirmSaidaRotaId(null);
    },
  });

  // Excluir rota
  const deleteRouteMutation = useMutation({
    mutationFn: (routeId: number) => api.delete(`/routes/${routeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota excluída com sucesso");
      setDeleteConfirmRouteId(null);
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setDeleteConfirmRouteId(null);
    },
  });

  // Remover item da rota (pedido)
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => api.delete(`/route-items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["route-items", selectedRouteForDetails?.id],
      });
      toast.success("Pedido removido da rota");
      setDeleteConfirmItemId(null);
    },
    onError: (error: any) => {
      toast.error("Erro: " + (error.response?.data?.detail || error.message));
      setDeleteConfirmItemId(null);
    },
  });

  const resetForm = () => {
    setPedidosBuscados([]);
    setSelectedDriver("");
    setSelectedHelper("");
    setSelectedVehicle("");
    setNumeroPedido("");
    setPedidoBuscado(null);
  };

  const handleAddList = async () => {
    try {
      if (
        pedidosBuscados.some(
          p =>
            p.ordernumber != "" &&
            pedidoBuscado.nota != "" &&
            p.ordernumber === pedidoBuscado.nota
        )
      ) {
        toast.warning("Este pedido já foi adicionado");
      } else {
        setPedidosBuscados([
          ...pedidosBuscados,
          {
            id: pedidosBuscados.length,
            ordernumber: pedidoBuscado.nota ?? "",
            status: "pending",
            address: pedidoBuscado.address,
            neighborhood: pedidoBuscado.neighborhood,
            city: pedidoBuscado.city,
            state: pedidoBuscado.state,
            zipcode: pedidoBuscado.zipcode,
            address_number: pedidoBuscado.address_number,
            sequence: pedidosBuscados.length + 1,
            client_name: pedidoBuscado.client_name,
            pedido: pedidoBuscado.pedido,
            reason: motivo.toUpperCase(),
          },
        ]);
        setMotivo("");
        setNumeroPedido("");
        setPedidoBuscado(null);
        toast.success("Pedido adicionado");
      }
    } catch (error: any) {
      toast.error("Erro ao buscar pedido");
      console.log(error);
    } finally {
      setSearchingPedido(false);
    }
  };

  //
  interface EnderecoViaCEP {
    cep?: string;
    logradouro?: string;
    complemento?: string;
    unidade?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    estado?: string;
    regiao?: string;
    ibge?: string;
    gia?: string;
    ddd?: string;
    siafi?: string;
  }

  const handleSearchCEP = async (cep?: string) => {
    const zipcode = cep === undefined ? pedidoBuscado?.zipcode : cep;
    if (!zipcode.trim()) {
      console.log(zipcode + "cortou");
      return {};
    }
    console.log(zipcode);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${zipcode.replace("-", "")}/json/`
      );
      const endereco = await response.json();
      console.log(endereco);

      if (endereco.erro == "true") throw new Error("not_exists");

      if (!cep)
        setPedidoBuscado({
          ...pedidoBuscado,
          address: endereco?.logradouro
            ? endereco?.logradouro.toUpperCase()
            : "",
          neighborhood: endereco?.bairro ? endereco?.bairro.toUpperCase() : "",
          city: endereco?.localidade ? endereco?.localidade.toUpperCase() : "",
          state: endereco?.uf ? endereco?.uf.toUpperCase() : "",
          zipcode: endereco?.cep,
        });

      return endereco;
    } catch (error: any) {
      if (error.response?.status == 404) {
        toast.error(
          "CEP não encontrado, CEP possivelmente incorreto, se persistir, adicione as informações de endereço manualmente"
        );
        // } else if (error.response?.status == 423) {
        //   toast.error("Já existe uma rota com esse pedido");
      } else if ((error.message = "not_exists")) {
        toast.error("Não existe esse CEP");
      } else {
        toast.error("Erro ao buscar CEP");
      }
      console.log(error);
    }
  };
  //

  const handleSearchPedido = async () => {
    if (!numeroPedido.trim()) return;
    setSearchingPedido(true);
    try {
      const response = await api.get(`/erp/pedidos/${numeroPedido}`);
      const pedido = response.data;
      const endereco = await handleSearchCEP(pedido?.zipcode);
      console.log(endereco);

      console.log({
        ...pedido,
        address: endereco?.logradouro ? endereco?.logradouro.toUpperCase() : "",
        neighborhood: endereco?.bairro ? endereco?.bairro.toUpperCase() : "",
        city: endereco?.localidade ? endereco?.localidade.toUpperCase() : "",
        state: endereco?.uf ? endereco?.uf.toUpperCase() : "",
        zipcode: endereco?.cep,
      });

      setPedidoBuscado({
        ...pedido,
        address: endereco?.logradouro ? endereco?.logradouro.toUpperCase() : "",
        neighborhood: endereco?.bairro ? endereco?.bairro.toUpperCase() : "",
        city: endereco?.localidade ? endereco?.localidade.toUpperCase() : "",
        state: endereco?.uf ? endereco?.uf.toUpperCase() : "",
        zipcode: endereco?.cep,
      });

      // const cep =
      //   String(pedido?.zipcode).slice(0, 5) +
      //   "-" +
      //   String(pedido?.zipcode).slice(5);
      // setPedidoBuscado({
      //   ...pedido,
      //   zipcode: cep,
      // });

      //   if (pedidosBuscados.some(p => p.pedido === pedido.pedido)) {
      //     toast.warning("Este pedido já foi adicionado");
      //   } else {
      //     setPedidosBuscados([
      //       ...pedidosBuscados,
      //       {
      //         ...pedido,
      //         sequencia: pedidosBuscados.length + 1,
      //       },
      //     ]);
      //     setNumeroPedido("");
      //     setNumeroEndereco("");
      //     toast.success("Pedido adicionado");
      //   }
      // } catch (error: any) {
      //   if (error.response?.status == 404) {
      //     toast.error("Pedido não encontrado no ERP");
      //   } else if (error.response?.status == 423) {
      //     toast.error("Já existe uma rota com esse pedido");
      //   } else {
      //     toast.error("Erro ao buscar pedido");
      //   }
      // } finally {
      //   setSearchingPedido(false);
    } catch (error: any) {
      if (error.response?.status == 404) {
        toast.error("Pedido não encontrado no ERP");
      } else if (error.response?.status == 423) {
        toast.error("Já existe uma rota com esse pedido");
      } else {
        toast.error("Erro ao buscar pedido" + error);
        console.log(error);
      }
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
        ordernumber: p.ordernumber ?? undefined,
        reason: p.reason,
        sequence: index + 1,
        status: "pending",
        telefone: p.telefone || "",
        address: p.address,
        neighborhood: p.neighborhood,
        city: p.city,
        state: p.state,
        zipcode: String(p.zipcode),
        address_number: p.address_number,
      })),
      route: {
        driverid: parseInt(selectedDriver),
        vehicleid: parseInt(selectedVehicle),
        helper: selectedHelper,
        status: "pending",
      },
    });
  };
  const filteredRotas =
    rotas?.filter((rota: any) => {
      const search = searchRouteQuery.toLowerCase();

      const matchesSearch =
        rota.id.toString().includes(search) ||
        rota.driver_name?.toLowerCase().includes(search) ||
        rota.vehicle_name?.toLowerCase().includes(search) ||
        rota.plate?.toLowerCase().includes(search) ||
        rota.routes_items?.some((item: any) =>
          item.clientname?.toLowerCase().includes(search)
        );

      const matchesDate =
        !dateFilter || rota.createdat.slice(0, 10) == dateFilter;
      const matchesStatus =
        statusFilter == "." ? rota.status : rota.status == statusFilter;
      // console.log(Math.ceil(22 / 10));
      // let fArray: any[] = matchesSearch && matchesDate;
      // const fArrayA = fArray.slice(0, itemsLimit);
      // console.log(fArrayA);
      return matchesSearch && matchesDate && matchesStatus;
    }) || [];

  useEffect(() => {
    setRouteDetailsOpen(false);

    async function query() {
      if (editRouteItemId !== null)
        try {
          const response = await api.get(`/route-item/id/${editRouteItemId}`);
          console.log(response.data[0]);
          const resObj: RouteItem = response.data[0];
          setEditStatus(resObj.status ?? "pending");
          setEditEndereco(resObj.address);
          setEditBairro(resObj.neighborhood);
          setEditCidade(resObj.city);
          setEditEstado(resObj.state);
          setEditCEP(resObj.zipcode);
          setEditLatitude(resObj.latitude ?? 0);
          setEditLongitude(resObj.longitude ?? 0);
          setEditNumero(resObj.address_number);
          setEditRoutePending(false);
        } catch (error) {
          console.error("Erro ao buscar itens da rota:", error);
          return [];
        }
    }
    query();
  }, [editRouteItemId]);

  const PasteCoordenate = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    console.log("Pasted content:", pastedText);
    const coordenates = pastedText.trim().split(",");
    console.log(coordenates);
    setEditLatitude(Number(coordenates[0]));
    setEditLongitude(Number(coordenates[1]));
  };

  const handleEditRouteItem = async () => {
    setEditRoutePending(true);
    try {
      const payload = {
        address: editEndereco,
        address_number: editNumero,
        neighborhood: editBairro,
        city: editCidade,
        state: editEstado,
        status: editStatus,
        zipcode: editCEP,
        latitude: editLatitude,
        longitude: editLongitude,
      };
      const response = await api.put(
        `/route-item/${editRouteItemId}`,
        JSON.stringify(payload)
      );
      if (response.status == 200) {
        toast.success("Pedido Alterado!");
      } else toast.error("Houve um erro ao alterar o pedido!");

      setEditRouteItemId(null);
      setEditRoutePending(false);

      console.log(response.data[0]);
    } catch (e) {
      console.log(e);
      setEditRouteItemId(null);
      setEditRoutePending(false);
      return [];
    } finally {
      window.location.reload();
    }
  };

  const BaixarRoteiro = async (rota: any) => {
    try {
      console.log(JSON.stringify(rota, null, 2));
      const response = await fetch(
        "http://192.168.1.178:8000/planilha-roteiro/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rota),
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 3. Create a hidden anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = "roteiro" + rota.id + ".xlsx";
      document.body.appendChild(link);
      link.click();

      // 4. Trigger the download and clean up
      link.remove();
      window.URL.revokeObjectURL(url); // Free up memory
      // console.log(rota);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];

    console.log(file);
    console.log(file.type);

    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const ConfirmarEntrega = async (id: number) => {
    console.log("FOTO RECUPERADA", selectedFile);
    const blob = selectedFile as Blob;
    // continuar upload aqui
    const formData = new FormData();
    formData.append("file", blob, `foto.${selectedFile?.type}`);

    const response = await fetch(
      `http://192.168.1.178:8000/upload-roteiro/${id}`,
      {
        method: "POST",
        body: formData,
      }
    );
    console.log(await response.text());
    toast.success("Upload realizado com sucesso!");
    setSendPhotoRoute(null);
    window.location.reload();
  };

  useEffect(() => {
    console.log(dateFilter);
  }, [dateFilter]);

  //

  useEffect(() => {
    if (tabValue == 1) setMotivo("");
    else {
      setNumeroPedido("");
      setPedidoBuscado({
        ...pedidoBuscado,
        nota: "",
      });
    }
    console.log(pedidoBuscado);
  }, [tabValue]);

  useEffect(() => {
    if (isDialogOpen) {
      setTabValue(1);
    }
  }, [isDialogOpen]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col flex-wrap justify-between gap-4">
          <div className="">
            <h1 className="text-3xl font-bold text-slate-900">Rotas</h1>
            <p className="text-slate-600 mt-1">
              Gerencie e despache suas rotas de entrega
            </p>
          </div>
          <Card className="px-4">
            <div className="flex items-center gap-3 w-full flex-col md:flex-row">
              <div className="relative flex-2 w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  placeholder="Buscar rota, motorista ou placa..."
                  className="pl-10 w-full"
                  value={searchRouteQuery}
                  onChange={e => setSearchRouteQuery(e.target.value)}
                />
              </div>
              <Input
                value={dateFilter}
                type="date"
                onChange={e => {
                  setDateFilter(e.target.value);
                  setSearchRouteQuery("");
                }}
                className="flex-1"
              />

              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2 flex-1 w-full"
              >
                <Plus size={20} /> Nova Rota
              </Button>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="w-full px-3 flex flex-row gap-10 items-center justify-between">
            <div className="flex-1 w-50"></div>
            <div className="bg-blue-500 rounded-lg overflow-hidden flex flex-row border-2 border-gray-300">
              <Button
                className="rounded-none bg-blue-30"
                onClick={e => {
                  if (itemsPage > 0) {
                    setItemsPage(itemsPage - 1);
                  }
                }}
              >
                {"<"}
              </Button>
              <div className="flex flex-row divide-x-3 divide-gray-300 flex-1">
                {Array.from(
                  {
                    length: Math.ceil(
                      Array.isArray(rotas) ? rotas.length / itemsLimit : 0
                    ),
                  },
                  (_, i) => i
                ).map((v, i) => (
                  <Button
                    key={i}
                    onClick={e => setItemsPage(v)}
                    className={`rounded-none bg-muted text-blue-600 hover:text-white ${itemsPage == v && `bg-blue-700 text-white`}`}
                  >
                    {v + 1}
                  </Button>
                ))}
              </div>
              <Button className="rounded-none bg-blue-30">{">"}</Button>
            </div>
            <div className="flex justify-end flex-1 ">
              <div className="flex pr-3">
                <Select
                  value={String(itemsLimit)}
                  onValueChange={e => setItemsLimit(Number(e))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {["10", "50", "100", "150", "200"]?.map((d: string, i) => (
                      <SelectItem key={i} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isDesktop ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-700 pl-7">
                      ID
                    </th>
                    <th className="p-4 font-semibold text-slate-700">
                      Motorista
                    </th>
                    <th className="p-4 font-semibold text-slate-700">
                      Veículo
                    </th>
                    <th className="p-4 font-semibold text-slate-700 text-center">
                      <div className="flex items-center gap-2">
                        <p>Status</p>
                        <div className="flex max-w-50 w-30 rounded-3xl overflow-hidden border-gray-400 border-1">
                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="..." />
                            </SelectTrigger>
                            <SelectContent>
                              {[".", "pending", "in_progress", "entregue"]?.map(
                                (d: string, i) => (
                                  <SelectItem key={i} value={d}>
                                    {d == "pending"
                                      ? "Pendente"
                                      : d == "in_progress"
                                        ? "Entregando"
                                        : d == "entregue"
                                          ? "Entregue"
                                          : "Todos"}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-slate-700 text-center">
                      Data
                    </th>
                    <th className="p-4 font-semibold text-slate-700 text-right pr-7">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td colSpan={6} className="p-4">
                            <Skeleton className="h-12 w-full" />
                          </td>
                        </tr>
                      ))
                  ) : filteredRotas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-500"
                      >
                        Nenhuma rota encontrada.
                      </td>
                    </tr>
                  ) : (
                    filteredRotas
                      .sort((a: any, b: any) => a.id - b.id)
                      .slice(
                        itemsPage * itemsLimit,
                        itemsLimit + itemsPage * itemsLimit
                      )
                      .map((rota: any) => (
                        <tr
                          key={rota.id}
                          className={`border-l-6 border-b-1 border-b-slate-80/80 hover:bg-slate-50/50 transition-colors ${rota.problem ? "bg-red-100" : ""}`}
                          style={{ borderLeftColor: rota.color }}
                        >
                          <td className="p-4 font-medium">#{rota.id}</td>
                          <td className="p-4">{rota.driver_name}</td>
                          <td className="p-4">{rota.vehicle_name}</td>
                          <td className="p-4 flex justify-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rota.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : rota.status === "in_progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {rota.status === "pending"
                                ? "Pendente"
                                : rota.status === "in_progress"
                                  ? "Entregando"
                                  : "Finalizada"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="text-sm text-center">
                              {rota.createdat
                                .slice(0, 10)
                                .split("-")
                                .reverse()
                                .join("/")}
                            </span>
                          </td>
                          {/* <td className="p-4 text-center">
                          <div
                            className="w-3 h-3 rounded-full m-auto border border-slate-200"
                            style={{ backgroundColor: rota.color }}
                          ></div>
                        </td> */}
                          <td className="p-4 text-right flex justify-end items-center gap-2">
                            {rota.problem && <CircleAlert color="red" />}

                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                rota.problem && `border-2 border-red-600`
                              }
                              onClick={() => {
                                setSelectedRouteForDetails(rota);
                                setRouteDetailsOpen(true);
                              }}
                              title="Ver Pedidos"
                            >
                              <Eye
                                size={16}
                                color={rota.problem ? `red` : `black`}
                              />
                            </Button>
                            {rota.status === "pending" && (
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
                            <Button
                              className="h-10"
                              onClick={e => BaixarRoteiro(rota)}
                            >
                              <Printer size={18} />
                            </Button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col p-4 bg-slate-70/70 gap-3">
                {filteredRotas.map((rota: any) => {
                  const hsl = rota.color.replace(/\s/g, "");
                  const hslText = `border-[color:${hsl.replaceAll(",", ",_")}]`;
                  console.log("loopando rotas fltradas: " + rota.id);
                  return (
                    rota.status == "in_progress" && (
                      <div
                        key={rota.id}
                        className={`border-t-3 rounded-b-lg p-3 bg-linear-to-b from-slate-200 to-slate-300`}
                        style={{ borderColor: rota.color }}
                      >
                        <p className="flex gap-3 items-center flex-col">
                          <span className="mb-3">
                            #{rota.id}
                            {" - "}
                            <span className=" text-xl font-bold">
                              {" "}
                              {rota.driver_name}
                              {" - "}
                              {`(${rota.vehicle_name})`}
                            </span>{" "}
                          </span>
                        </p>
                        <ul className="flex flex-col divide-y-2 divide-slate-300 bg-white rounded-sm mt-2">
                          {rota.routes_items.map((v: any, i: number) => (
                            <li
                              key={i}
                              className="p-3 flex gap-4 justify-center items-center"
                            >
                              {!v.ordernumber
                                ? `${v.reason} - ${v.address}, ${v.address_number}, ${v.city} - ${v.state}`
                                : `Nota: ${v.ordernumber} - ${v.clientname}`}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="mt-3 bg-blue-500 p-4 max-h-40 w-full pointer-click justify-center flex items-center rounded-lg"
                          onClick={() => setSendPhotoRoute(rota)}
                        >
                          <Camera size={80} />
                        </Button>
                      </div>
                    )
                  );
                })}
              </div>
            )}
          </div>
          <div className="w-full px-3 flex flex-row gap-10 items-center justify-between">
            <div className="bg-blue-500 rounded-lg overflow-hidden flex flex-row border-2 border-gray-300">
              <Button
                className="rounded-none bg-blue-30"
                onClick={e => {
                  if (itemsPage > 0) {
                    setItemsPage(itemsPage - 1);
                  }
                }}
              >
                {"<"}
              </Button>
              <div className="flex flex-row divide-x-3 divide-gray-300">
                {Array.from(
                  {
                    length: Math.ceil(
                      Array.isArray(rotas) ? rotas.length / itemsLimit : 0
                    ),
                  },
                  (_, i) => i
                ).map((v, i) => (
                  <Button
                    key={i}
                    onClick={e => setItemsPage(v)}
                    className={`rounded-none bg-muted text-blue-600 hover:text-white ${itemsPage == v && `bg-blue-700 text-white`}`}
                  >
                    {v + 1}
                  </Button>
                ))}
              </div>
              <Button className="rounded-none bg-blue-30">{">"}</Button>
            </div>
            {/*  */}
            <div className="flex justify-center">
              <h3 className="flex-1 text-center">
                Mostrando{" "}
                <b>{`${itemsPage * itemsLimit + 1}-${itemsPage * itemsLimit + itemsLimit} de ${Array.isArray(rotas) && rotas.length} itens`}</b>
              </h3>
            </div>
            {/*  */}
            <div className="bg-blue-500 rounded-lg overflow-hidden border-2 border-gray-300 divide-x-3 divide-gray-300 flex flex-nowrap">
              <Button
                onClick={e => setItemsLimit(10)}
                className={`rounded-none ounded-none bg-muted text-blue-600 hover:text-white ${itemsLimit == 10 && `bg-blue-500 text-white`}`}
              >
                10
              </Button>
              <Button
                onClick={e => setItemsLimit(50)}
                className={`rounded-none ounded-none bg-muted text-blue-600 hover:text-white ${itemsLimit == 50 && `bg-blue-500 text-white`}`}
              >
                50
              </Button>
              <Button
                onClick={e => setItemsLimit(100)}
                className={`rounded-none ounded-none bg-muted text-blue-600 hover:text-white ${itemsLimit == 100 && `bg-blue-500 text-white`}`}
              >
                100
              </Button>
              <Button
                onClick={e => setItemsLimit(150)}
                className={`rounded-none ounded-none bg-muted text-blue-600 hover:text-white ${itemsLimit == 150 && `bg-blue-500 text-white`}`}
              >
                150
              </Button>
              <Button
                onClick={e => setItemsLimit(200)}
                className={`rounded-none ounded-none bg-muted text-blue-600 hover:text-white ${itemsLimit == 200 && `bg-blue-500 text-white`}`}
              >
                200
              </Button>
            </div>
          </div>
        </Card>

        <Dialog open={sendPhotoRoute} onOpenChange={setSendPhotoRoute}>
          <DialogContent size="xl" className="p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex p-4 h-full">
              {previewUrl ? (
                <div className="flex flex-col w-[100%] gap-4 justify-center align-center p-5">
                  <div className="m-auto flex justify-center align-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="rounded-xl max-w-full background-center"
                    />
                  </div>
                  <div className="w-full bg-blue-600 hover:bg-blue-400 active:hover:bg-blue-700 rounded-xl flex items-center justify-center">
                    <label className="text-white font-bold m-auto p-2 w-full pointer-click justify-center flex relative gap-4 flex-row-reverse items-center">
                      <span className="font-sm">Pegar outra foto</span>
                      <svg
                        className="w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="var(--color-white)"
                        version="1.1"
                        id="Layer_1"
                        viewBox="0 0 501.333 501.333"
                      >
                        <g>
                          <g>
                            <path d="M250.667,182.4c-61.867,0-112,50.133-112,112s50.133,112,112,112c61.867,0,112-50.133,112-112    C362.667,232.533,312.534,182.4,250.667,182.4z M250.667,364.8c-38.4,0-70.4-32-70.4-70.4s32-70.4,70.4-70.4    c38.4,0,70.4,32,70.4,70.4S289.067,364.8,250.667,364.8z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M425.6,101.333h-48l-1.067-10.667C371.2,53.333,336,24.533,294.4,24.533h-73.6c-41.6,0-76.8,28.8-82.133,66.133    l-1.067,10.667h-35.2V90.667c0-11.733-9.6-21.333-21.333-21.333s-21.333,9.6-21.333,21.333V102.4C25.6,108.8,0,136.534,0,170.667    v236.8c0,38.4,34.133,69.333,75.733,69.333H425.6c41.6,0,75.733-30.933,75.733-69.333v-236.8    C501.334,132.267,467.2,101.333,425.6,101.333z M425.6,435.2H75.734c-19.2,0-34.133-12.8-34.133-27.733v-236.8    c0-16,14.933-27.733,34.133-27.733h80c9.6,0,19.2-7.467,20.267-18.133l4.267-28.8c2.133-17.067,19.2-29.867,40.533-29.867h73.6    c20.267,0,38.4,12.8,40.533,29.867l4.267,28.8c1.067,10.667,9.6,18.133,20.267,18.133H425.6c19.2,0,34.133,12.8,34.133,27.733    v236.8h0C459.734,423.467,444.8,435.2,425.6,435.2z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M404.267,170.667h-9.6c-11.733,0-21.333,9.6-21.333,21.333s9.6,21.333,21.333,21.333h9.6    c11.733,0,21.333-9.6,21.333-21.333S416,170.667,404.267,170.667z" />
                          </g>
                        </g>
                      </svg>
                      <input
                        id="dropzone-file"
                        accept="image/*"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <Button
                    className="bg-green-600 text-white font-bold p-5 border-5 text-base border-green-600 hover:bg-green-700 hover:text-white disabled:bg-gray-400"
                    onClick={() => ConfirmarEntrega(sendPhotoRoute.id)}
                  >
                    ✓ Confirmar Entrega
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[30vh] w-full p-3 grow-1">
                  <label className="flex flex-col items-center justify-center w-full h-full bg-neutral-secondary-medium border-4 border-dashed rounded-xl border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                    <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                      <Camera size={32} className="mb-3" />
                      <p className="mb-2 text-sm">
                        <span className="font-semibold">
                          Clique para selecionar ou tirar uma foto
                        </span>{" "}
                      </p>
                      <p className="text-xs">PNG ou JPG(MAX. 800x400px)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      accept="image/*"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Nova Rota */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            size="xl"
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Criar Nova Rotas</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-6 md:grid-cols-6 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label>Motorista *</Label>
                  <Select
                    value={selectedDriver}
                    onValueChange={setSelectedDriver}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers?.map((d: any) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Ajudante</Label>
                  <Input
                    placeholder="Ex: José Augusto"
                    value={selectedHelper}
                    onChange={e => setSelectedHelper(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Veículo *</Label>
                  <Select
                    value={selectedVehicle}
                    onValueChange={setSelectedVehicle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((v: any) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.plate} - {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 ">
                <Tabs
                  className="col-span-2"
                  value={tabValue === 1 ? "pedido" : "parada"}
                  onValueChange={value =>
                    setTabValue(value === "pedido" ? 1 : 2)
                  }
                >
                  <TabsList
                    className="w-full gap-10"
                    tab={tabValue}
                    setTab={setTabValue}
                  >
                    <TabsTrigger className="group p-3" value="pedido">
                      <label className="cursor-pointer hover:bg-gray-200 hover:group-data-[state=active]:bg-none rounded-lg p-2 w-full flex items-center justify-center gap-2">
                        <FileInput size={24} />
                        <span className="hidden md:inline">
                          Adicionar Pedido
                        </span>
                      </label>
                    </TabsTrigger>
                    <TabsTrigger className="group p-3" value="parada">
                      <label className="cursor-pointer hover:bg-gray-200 rounded-lg p-2 w-full flex items-center justify-center gap-2">
                        <MapPinned size={24} />
                        <span className="hidden md:inline">
                          Adicionar Parada
                        </span>
                      </label>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pedido">
                    <div className="space-y-2 col-span-2 mt-4">
                      <Label>Buscar Pedido no ERP</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Número do pedido..."
                          value={numeroPedido}
                          onChange={e => setNumeroPedido(e.target.value)}
                          onKeyPress={e =>
                            e.key === "Enter" && handleSearchPedido()
                          }
                        />
                        <Button
                          onClick={handleSearchPedido}
                          disabled={searchingPedido}
                          variant="secondary"
                        >
                          {searchingPedido ? (
                            "Buscando..."
                          ) : (
                            <Search size={18} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="parada" className="flex justify-center">
                    <div className="flex gap-5 w-[50%] mt-4">
                      <Label>MOTIVO:</Label>
                      <div className="flex gap-2 w-full">
                        <Input
                          maxLength={30}
                          placeholder="Número do pedido..."
                          value={motivo}
                          onChange={e => setMotivo(e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* <div className="space-y-2">
                  <Label>Número do Endereço (Opcional)</Label>
                  <Input
                    placeholder="Ex: 123"
                    value={numeroEndereco}
                    onChange={e => setNumeroEndereco(e.target.value)}
                  />
                </div> */}
              </div>

              <div className="grid grid-cols-6 gap-3 justify-item-stretch">
                <div className="space-y-2 sm:col-span-2 col-span-3">
                  <Label>CEP</Label>
                  <div className="flex flex-row gap-3">
                    <Input
                      maxLength={9}
                      placeholder="Ex: 123"
                      value={
                        String(pedidoBuscado?.zipcode) === "undefined"
                          ? ""
                          : String(pedidoBuscado?.zipcode).includes("-")
                            ? String(pedidoBuscado?.zipcode)
                            : String(pedidoBuscado?.zipcode).length > 5
                              ? String(pedidoBuscado?.zipcode).slice(0, 5) +
                                "-" +
                                String(pedidoBuscado?.zipcode).slice(5)
                              : pedidoBuscado?.zipcode
                      }
                      onChange={e =>
                        setPedidoBuscado({
                          ...pedidoBuscado,
                          zipcode: e.target.value,
                        })
                      }
                      onKeyPress={e => e.key === "Enter" && handleSearchCEP()}
                    />
                    <Button
                      onClick={e => handleSearchCEP()}
                      disabled={searchingPedido}
                      variant="secondary"
                    >
                      {searchingPedido ? "Buscando..." : <Search size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-4 col-span-3">
                  <Label>Logradouro</Label>
                  <Input
                    placeholder="Ex: 123"
                    value={pedidoBuscado?.address ?? ""}
                    onChange={e =>
                      setPedidoBuscado({
                        ...pedidoBuscado,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 col-span-4">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Ex: 123"
                    value={pedidoBuscado?.neighborhood ?? ""}
                    onChange={e =>
                      setPedidoBuscado({
                        ...pedidoBuscado,
                        neighborhood: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-1 col-span-2">
                  <Label className="relative">
                    Número
                    <span className="text-red-600 absolute left-14 ">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: 123"
                    value={pedidoBuscado?.address_number ?? ""}
                    onChange={e =>
                      setPedidoBuscado({
                        ...pedidoBuscado,
                        address_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-3 col-span-4">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Ex: 123"
                    value={pedidoBuscado?.city ?? ""}
                    onChange={e =>
                      setPedidoBuscado({
                        ...pedidoBuscado,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:basis-20 col-span-2">
                  <Label>Estado</Label>
                  <Select
                    value={pedidoBuscado?.state ?? ""}
                    onValueChange={e =>
                      setPedidoBuscado({
                        ...pedidoBuscado,
                        state: e,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "AC - Acre",
                        "AL - Alagoas",
                        "AP - Amapá",
                        "AM - Amazona",
                        "BA - Bahia",
                        "CE - Ceará",
                        "DF - Distrito Federal",
                        "ES - Espírito Santo",
                        "GO - Goiás",
                        "MA - Maranhão",
                        "MT - Mato Grosso",
                        "MS - Mato Grosso do Sul",
                        "MG - Minas Gerais",
                        "PA - Pará",
                        "PB - Paraíba",
                        "PR - Paraná",
                        "PE - Pernambuco",
                        "PI - Piauí",
                        "RJ - Rio de Janeiro",
                        "RN - Rio Grande do Norte",
                        "RS - Rio Grande do Sul",
                        "RO - Rondônia",
                        "RR - Roraima",
                        "SC - Santa Catarina",
                        "SP - São Paulo",
                        "SE - Sergipe",
                        "TO - Tocantins",
                      ].map((v, i) => (
                        <SelectItem key={i} value={v.substring(0, 2)}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="p-5 col-end-7 col-span-3 mt-5"
                  onClick={handleAddList}
                >
                  <span>Adicionar Entrega</span>
                </Button>
              </div>

              {/* {pedidosBuscados.length > 0 && ( */}
              {pedidosBuscados.length > 0 && (
                <div className="space-y-3">
                  <Label>Pedidos Adicionados ({pedidosBuscados.length})</Label>
                  <DragDropProvider
                    onDragEnd={event => {
                      if (event.canceled) return;

                      const { source } = event.operation;

                      if (!isSortable(source)) return;

                      const { initialIndex, index } = source;

                      if (initialIndex === index) return;

                      setPedidosBuscados(items => {
                        // setpedidosBuscados(items => {
                        const copy = [...items];
                        const [item] = copy.splice(initialIndex, 1);
                        copy.splice(index, 0, item);
                        const updateSequence = copy.map((v, i) => ({
                          ...v,
                          sequence: i + 1,
                        }));
                        console.log(updateSequence);
                        return move(updateSequence, event);
                      });
                    }}
                  >
                    <ul className="border rounded-lg p-2 divide-y list flex flex-col gap-5 ">
                      {/* {pedidosBuscados.map((p, i) => (
                        <Sortable
                          id={p.id}
                          p={p}
                          pA={pedidosBuscados}
                          setP={setPedidoBuscado}
                          setPA={setPedidosBuscados}
                          index={p.id}
                          key={p.id}
                        />
                      ))} */}
                      {pedidosBuscados.map((p, i) => (
                        <Sortable
                          id={p.id}
                          p={p}
                          pA={pedidosBuscados}
                          setP={setPedidoBuscado}
                          setPA={setPedidosBuscados}
                          index={i}
                          key={p.id}
                        />
                      ))}
                    </ul>
                  </DragDropProvider>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRoute}
                disabled={createRouteMutation.isPending}
              >
                {createRouteMutation.isPending ? "Criando..." : "Criar Rota"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes da Rota */}
        <Dialog open={routeDetailsOpen} onOpenChange={setRouteDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Pedidos da Rota #{selectedRouteForDetails?.id}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 ">
              {itemsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : routeItems?.length === 0 ? (
                <p className="text-center text-slate-500">
                  Nenhum pedido vinculado.
                </p>
              ) : (
                <div className="border rounded-lg divide-y max-h-[60vh] overflow-y-auto">
                  {routeItems?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center relative justify-between hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {!item.ordernumber
                            ? item.reason
                            : `Pedido #${item.ordernumber}`}
                        </p>
                        {item.latitude == null ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 absolute right-46 top-[18px]">
                            Não tem coordernada
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <p className="text-sm text-slate-600 pt-2">
                          {item.address}, {item.address_number}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.neighborhood}, {item.city} - {item.state}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status == "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.status === "pending"
                              ? "Pendente"
                              : item.status == "in_progress"
                                ? "Entregando"
                                : "Finalizado"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 absolute right-10 bottom-7"
                        onClick={() => setDeleteConfirmItemId(item.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-black hover:bg-gray-200 absolute right-10 top-7"
                        onClick={() => setEditRouteItemId(item.id)}
                      >
                        <Pencil size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editRouteItemId !== null}
          onOpenChange={() => setEditRouteItemId(null)}
        >
          <DialogContent className="">
            <DialogHeader className="sm:max-w-sm">
              <DialogTitle>Editar Pedido #{editRouteItemId}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-6 gap-3 justify-item-stretch">
              <div className="space-y-2 col-span-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Status do pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Entregando</SelectItem>
                    <SelectItem value="entregue">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-4">
                <Label>Logradouro</Label>
                <Input
                  placeholder="Ex: 123"
                  value={editEndereco}
                  onChange={e => setEditEndereco(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-4">
                <Label>Bairro</Label>
                <Input
                  placeholder="Ex: 123"
                  value={editBairro}
                  onChange={e => setEditBairro(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="relative">
                  Número
                  <span className="text-red-600 absolute left-14 ">*</span>
                </Label>
                <Input
                  placeholder="Ex: 123"
                  value={editNumero}
                  onChange={e => setEditNumero(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-3">
                <Label>Cidade</Label>
                <Input
                  placeholder="Ex: 123"
                  value={editCidade}
                  onChange={e => setEditCidade(e.target.value)}
                />
              </div>
              <div className="space-y-2 basis-20">
                <Label>Estado</Label>
                <Select value={editEstado} onValueChange={setEditEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "AC - Acre",
                      "AL - Alagoas",
                      "AP - Amapá",
                      "AM - Amazona",
                      "BA - Bahia",
                      "CE - Ceará",
                      "DF - Distrito Federal",
                      "ES - Espírito Santo",
                      "GO - Goiás",
                      "MA - Maranhão",
                      "MT - Mato Grosso",
                      "MS - Mato Grosso do Sul",
                      "MG - Minas Gerais",
                      "PA - Pará",
                      "PB - Paraíba",
                      "PR - Paraná",
                      "PE - Pernambuco",
                      "PI - Piauí",
                      "RJ - Rio de Janeiro",
                      "RN - Rio Grande do Norte",
                      "RS - Rio Grande do Sul",
                      "RO - Rondônia",
                      "RR - Roraima",
                      "SC - Santa Catarina",
                      "SP - São Paulo",
                      "SE - Sergipe",
                      "TO - Tocantins",
                    ].map((v, i) => (
                      <SelectItem key={i} value={v.substring(0, 2)}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>CEP</Label>
                <Input
                  placeholder="Ex: 123"
                  value={editCEP}
                  onChange={e => setEditCEP(e.target.value)}
                />
              </div>
              <div className="grid grid-row-2 grid-cols-2 gap-3 row-span-1 col-span-6 justify-items-stretch mt-2">
                <Label className="relative col-span-2">
                  Cordenadas
                  <span className="text-red-600 absolute left-20 ">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    onPaste={PasteCoordenate}
                    className="placeholder-shown:border-2 placeholder-shown:border-red-400 "
                    placeholder="Ex: 123"
                    value={editLatitude == 0 ? "" : String(editLatitude)}
                    onChange={e => setEditLatitude(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    className="placeholder-shown:border-2 placeholder-shown:border-red-400 "
                    onPaste={PasteCoordenate}
                    placeholder="Ex: 123"
                    value={editLongitude == 0 ? "" : String(editLongitude)}
                    onChange={e => setEditLongitude(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                variant={"outline"}
                className="p-5 col-end-4 col-span-3 mt-5 border-gray-400 hover:bg-gray-200 hover:border-gray-600"
                disabled={editRoutePending}
                onClick={() => setEditRouteItemId(null)}
              >
                <span className="">Cancelar</span>
              </Button>
              <Button
                className="p-5 col-end-7 col-span-3 mt-5"
                disabled={editRoutePending}
                onClick={handleEditRouteItem}
              >
                <span>
                  {editRoutePending ? "Editando..." : "Editar Pedido"}
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alertas de Confirmação */}
        <AlertDialog
          open={confirmSaidaRotaId !== null}
          onOpenChange={() => setConfirmSaidaRotaId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Despachar Rota?</AlertDialogTitle>
              <AlertDialogDescription>
                A rota será marcada como "Em Entrega" e os clientes serão
                notificados via WhatsApp.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  confirmSaidaRotaId &&
                  saidaEntregaMutation.mutate(confirmSaidaRotaId)
                }
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={deleteConfirmRouteId !== null}
          onOpenChange={() => setDeleteConfirmRouteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Rota?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A rota só pode ser excluída se
                não houver entregas vinculadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  deleteConfirmRouteId &&
                  deleteRouteMutation.mutate(deleteConfirmRouteId)
                }
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={deleteConfirmItemId !== null}
          onOpenChange={() => setDeleteConfirmItemId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                O pedido será removido desta rota. Se a rota já estiver em
                andamento, você deve excluir a entrega primeiro.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  deleteConfirmItemId &&
                  deleteItemMutation.mutate(deleteConfirmItemId)
                }
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
