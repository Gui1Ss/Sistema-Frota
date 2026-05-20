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

class DriverCreate(DriverBase):
    pass

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
    status: Optional[str] = "pending"

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


class RouteItemCreate(RouteItemBase):
    pass

class RouteWeb(BaseModel):
    items: list[RouteItemCreate]
    route: RouteBase

class RouteItemUpdate(BaseModel):
    routeid: Optional[int] = None
    ordernumber: Optional[str] = None
    sequence: Optional[int] = None
    status: Optional[str] = None

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
    routeid: int
    ordernumber: str
    status: Optional[str] = "pending"
    deliveredat: Optional[datetime] = None

class DeliveryCreate(DeliveryBase):
    pass

class DeliveryUpdate(BaseModel):
    routeid: Optional[int] = None
    ordernumber: Optional[str] = None
    status: Optional[str] = None
    deliveredat: Optional[datetime] = None

class Delivery(DeliveryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)