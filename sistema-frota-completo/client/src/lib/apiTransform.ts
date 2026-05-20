/**
 * Transformação de dados entre Frontend e Backend FastAPI
 *
 * O frontend usa nomenclatura em português (nome, cpf, cnh)
 * O backend FastAPI usa nomenclatura em inglês (name, phone, licenseNumber)
 *
 * Este arquivo mapeia automaticamente entre os dois formatos
 */

// ============================================================================
// DRIVERS - Motoristas
// ============================================================================

export interface DriverFormData {
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email?: string;
  cnhValidade?: string;
  categoria?: string;
}

export interface DriverApiPayload {
  name: string;
  phone: string;
  cpf: string;
  licensenumber: string;
  licenseexpiry?: string;
  licensecategory?: string;
  status?: string;
}

export const transformDriverToApi = (formData: DriverFormData): DriverApiPayload => {
  return {
    name: formData.nome,
    phone: formData.telefone,
    cpf: formData.cpf,
    licensenumber: formData.cnh,
    licenseexpiry: formData.cnhValidade || undefined,
    licensecategory: formData.categoria || "D",
    status: "active"
  };
};

export const transformDriverFromApi = (apiData: any): DriverFormData => {
  return {
    nome: apiData.name,
    cpf: apiData.cpf,
    cnh: apiData.licenseNumber,
    telefone: apiData.phone,
    email: apiData.email,
    cnhValidade: apiData.licenseExpiry,
    categoria: apiData.licenseCategory
  };
};

// ============================================================================
// VEHICLES - Veículos
// ============================================================================

export interface VehicleFormData {
  placa: string;
  nome: string;
  tipo: string;
  capacidade: number;
}

export interface VehicleApiPayload {
  plate: string;
  name: string;
  type: string;
  capacity: number;
  status?: string;
}

export const transformVehicleToApi = (formData: VehicleFormData): VehicleApiPayload => {
  return {
    plate: formData.placa,
    name: formData.nome,
    type: formData.tipo,
    capacity: formData.capacidade,
    status: "available"
  };
};

export const transformVehicleFromApi = (apiData: any): VehicleFormData => {
  return {
    placa: apiData.plate,
    nome: apiData.name,
    tipo: apiData.type,
    capacidade: apiData.capacity
  };
};

// ============================================================================
// ROUTES - Rotas
// ============================================================================

export interface RouteFormData {
  motorista_id: number;
  veiculo_id: number;
  status?: string;
}

export interface RouteApiPayload {
  driverId: number;
  vehicleId: number;
  status?: string;
}

export const transformRouteToApi = (formData: RouteFormData): RouteApiPayload => {
  return {
    driverId: formData.motorista_id,
    vehicleId: formData.veiculo_id,
    status: formData.status || "pending"
  };
};

export const transformRouteFromApi = (apiData: any): RouteFormData => {
  return {
    motorista_id: apiData.driverId,
    veiculo_id: apiData.vehicleId,
    status: apiData.status
  };
};

// ============================================================================
// DELIVERIES - Entregas
// ============================================================================

export interface DeliveryFormData {
  numero_pedido: string;
  rota_id: number;
  status?: string;
}

export interface DeliveryApiPayload {
  orderNumber: string;
  routeId: number;
  status?: string;
}

export const transformDeliveryToApi = (formData: DeliveryFormData): DeliveryApiPayload => {
  return {
    orderNumber: formData.numero_pedido,
    routeId: formData.rota_id,
    status: formData.status || "pending"
  };
};

export const transformDeliveryFromApi = (apiData: any): DeliveryFormData => {
  return {
    numero_pedido: apiData.orderNumber,
    rota_id: apiData.routeId,
    status: apiData.status
  };
};

// ============================================================================
// GPS TRACKING
// ============================================================================

export interface GpsTrackingFormData {
  rota_id: number;
  latitude: number;
  longitude: number;
}

export interface GpsTrackingApiPayload {
  routeId: number;
  latitude: number;
  longitude: number;
}

export const transformGpsToApi = (formData: GpsTrackingFormData): GpsTrackingApiPayload => {
  return {
    routeId: formData.rota_id,
    latitude: formData.latitude,
    longitude: formData.longitude
  };
};

export const transformGpsFromApi = (apiData: any): GpsTrackingFormData => {
  return {
    rota_id: apiData.routeId,
    latitude: apiData.latitude,
    longitude: apiData.longitude
  };
};

// ============================================================================
// WHATSAPP NOTIFICATIONS
// ============================================================================

export interface NotificationFormData {
  rota_id: number;
  telefone: string;
  mensagem: string;
}

export interface NotificationApiPayload {
  routeId: number;
  phone: string;
  message: string;
}

export const transformNotificationToApi = (formData: NotificationFormData): NotificationApiPayload => {
  return {
    routeId: formData.rota_id,
    phone: formData.telefone,
    message: formData.mensagem
  };
};

export const transformNotificationFromApi = (apiData: any): NotificationFormData => {
  return {
    rota_id: apiData.routeId,
    telefone: apiData.phone,
    mensagem: apiData.message
  };
};