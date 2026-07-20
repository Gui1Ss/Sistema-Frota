from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Drivers ---
class DriverBase(BaseModel):
    name: str
    phone: Optional[str] = None
    cpf: Optional[str] = None
    licensenumber: Optional[str] = None
    licensecategory: Optional[str] = None
    licenseexpiry: Optional[datetime] = None
    status: Optional[str] = "active"
    email: Optional[str] = None

class DriverCreate(DriverBase):
    passwordHash: Optional[str] = None

class DriverLogin(BaseModel):
    cpf: str
    passwordHash: str

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    licensenumber: Optional[str] = None
    licensecategory: Optional[str] = None
    licenseexpiry: Optional[datetime] = None
    status: Optional[str] = None

class Driver(DriverBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    driver: Optional[Driver] = None

# --- Vehicles ---
class VehicleBase(BaseModel):
    name: str
    plate: str
    type: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[str] = "available"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    plate: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Routes ---
class RouteBase(BaseModel):
    driverid: Optional[int] = None
    vehicleid: Optional[int] = None
    helper: Optional[str] = None
    status: Optional[str] = "pending"
    color: Optional[str] = None

class RouteWebRoute(BaseModel):
    id: int
    driverid: int
    vehicleid: int
    status: str
    color: str | None = None
    createdat: datetime | None = None
    updatedat: datetime | None = None
    vehicle_name: str | None = None
    driver_name: str | None = None
    problem: bool = False

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    driverid: Optional[int] = None
    vehicleid: Optional[int] = None
    status: Optional[str] = None

class Route(RouteBase):
    id: int
    createdat: datetime
    updatedat: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)





# --- Route Items ---
class RouteItemBase(BaseModel):
    routeid: int
    ordernumber: Optional[str] = None
    sequence: Optional[int] = None
    status: Optional[str] = "pending"
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    address_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reason: Optional[str] = None
    phone: Optional[str] = None

class RouteItemCreate(BaseModel):
    ordernumber: Optional[str] = None
    sequence: Optional[int] = None
    status: Optional[str] = "pending"
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    address_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    

class RouteItemCreateWeb(BaseModel):
    ordernumber: Optional[str] = None
    sequence: Optional[int] = None
    status: Optional[str] = "pending"
    telefone: Optional[str] = None
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    address_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reason: Optional[str] = None

class RouteWeb(BaseModel):
    items: list[RouteItemCreateWeb]
    route: RouteBase

class RouteItemUpdate(BaseModel):
    status: Optional[str] = "pending"
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    address_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RouteItem(RouteItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- GPS Tracking ---
class GPSTrackingBase(BaseModel):
    routeid: int
    latitude: float
    longitude: float

class GPSTrackingCreate(GPSTrackingBase):
    pass

class GPSTracking(GPSTrackingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# --- WhatsApp Notifications ---
class WhatsAppNotificationBase(BaseModel):
    routeid: int
    phone: str
    message: str
    status: Optional[str] = "sent"

class WhatsAppNotificationCreate(WhatsAppNotificationBase):
    pass

class WhatsAppNotification(WhatsAppNotificationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Deliveries ---
class DeliveryBase(BaseModel):
    routeid: Optional[int] = None
    ordernumber: Optional[str] = None
    clientname: Optional[str] = None
    status: Optional[str] = "Pendente"
    deliveredat: Optional[datetime] = None

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryUpdate(BaseModel):
    routeid: Optional[int] = None
    clientname: Optional[str] = None
    ordernumber: Optional[str] = None
    status: Optional[str] = None
    deliveredat: Optional[datetime] = None

class Delivery(DeliveryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DeliveryApp(BaseModel):
    id: int
    routeid: int
    ordernumber: str
    clientname: str
    driver_name: str
    vehicle_name: str
    status: str
    address: str
    address_number: str
    city: str
    state: str
    zipcode: str
    latitude: float
    longitude: float
    createdat: Optional[datetime] = None

class Pedido(BaseModel):
    ordernumber: Optional[str] = None
    sequencia: Optional[int] = None
    status: Optional[str] = "pending"
    telefone: Optional[str] = None
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    address_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    client_name: Optional[str] = None
    cnpj: Optional[str] = None


class DeliveryRoteiro(BaseModel):
    id: Optional[int] = None
    route_item_id: int
    routeid: int
    routeid: Optional[int] = None
    ordernumber: Optional[str] = None
    clientname: Optional[str] = None           
    address: Optional[str] = None,
    address_number: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    sequence: int
    reason: Optional[str] = None

class Roteiro(BaseModel):
  id: int
  driverid: Optional[int] = None
  vehicleid: Optional[int] = None
  status: Optional[str] = "pending"
  color: Optional[str] = None
  createdat: Optional[datetime] = None
  updatedat: Optional[datetime] = None
  vehicle_name: Optional[str] = None
  plate: Optional[str] = None
  driver_name: Optional[str] = None
  helper: Optional[str] = None
  problem: Optional[bool] = False
  routes_items: list[DeliveryRoteiro]

