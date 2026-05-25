from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_dashboard(db: Session):
        countDriver = db.query(models.Driver).count()
        countVehicle = db.query(models.Vehicle).count()
        countRoute = db.query(models.Route).count()
        countDelivery = db.query(models.Delivery).count()
        countDeliveryPendent = db.query(models.Delivery).filter(models.Delivery.deliveredat.is_(None)).count()
        countDeliveryFinish = db.query(models.Delivery).filter(models.Delivery.deliveredat.isnot(None)).count()
        return{
                'motoristas': countDriver,
                'veiculos': countVehicle,
                'rotas': countRoute,
                'entregas': countDelivery,
                'entregasPendentes': countDeliveryPendent,
                'entregasConcluidas': countDeliveryFinish
}

# Generic CRUD helper functions
def get_item(db: Session, model, item_id: int):
    return db.query(model).filter(model.id == item_id).first()

def get_items(db: Session, model, skip: int = 0, limit: int = 100):
    return db.query(model).offset(skip).limit(limit).all()

def delete_item(db: Session, model, item_id: int):
    db_item = get_item(db, model, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

# --- Drivers ---
def create_driver(db: Session, driver: schemas.DriverCreate):
    driver_data = driver.model_dump()
    password = driver_data.pop("password", None)
    if password:
        driver_data["password_hash"] = get_password_hash(password)
    db_driver = models.Driver(**driver_data)
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def get_driver_by_cpf(db: Session, cpf: str):
    return db.query(models.Driver).filter(models.Driver.cpf == cpf).first()

def update_driver(db: Session, driver_id: int, driver: schemas.DriverUpdate):
    db_driver = get_item(db, models.Driver, driver_id)
    if db_driver:
        for key, value in driver.model_dump(exclude_unset=True).items():
            setattr(db_driver, key, value)
        db.commit()
        db.refresh(db_driver)
    return db_driver

# --- Vehicles ---
def create_vehicle(db: Session, vehicle: schemas.VehicleCreate):
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle(db: Session, vehicle_id: int, vehicle: schemas.VehicleUpdate):
    db_vehicle = get_item(db, models.Vehicle, vehicle_id)
    if db_vehicle:
        for key, value in vehicle.model_dump(exclude_unset=True).items():
            setattr(db_vehicle, key, value)
        db.commit()
        db.refresh(db_vehicle)
    return db_vehicle

# --- Routes ---
import random

def create_route(db: Session, route: schemas.RouteCreate):
    route_data = route.model_dump()
    if not route_data.get('color'):
        # Gerar cor aleatória em formato HSL para garantir boa visibilidade
        h = random.randint(0, 360)
        s = random.randint(60, 90)
        l = random.randint(40, 60)
        route_data['color'] = f"hsl({h}, {s}%, {l}%)"
        
    db_route = models.Route(**route_data)
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

def update_route(db: Session, route_id: int, route: schemas.RouteUpdate):
    db_route = get_item(db, models.Route, route_id)
    if db_route:
        for key, value in route.model_dump(exclude_unset=True).items():
            setattr(db_route, key, value)
        db.commit()
        db.refresh(db_route)
    return db_route

# --- Route Items ---
def create_route_item(db: Session, item):
    db_item = models.RouteItem(**item)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item

def update_route_item(db: Session, item_id: int, item: schemas.RouteItemUpdate):
    db_item = get_item(db, models.RouteItem, item_id)
    if db_item:
        for key, value in item.model_dump(exclude_unset=True).items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# --- GPS Tracking ---
def create_gps_tracking(db: Session, tracking: schemas.GPSTrackingCreate):
    db_tracking = models.GPSTracking(**tracking.model_dump())
    db.add(db_tracking)
    db.commit()
    db.refresh(db_tracking)
    return db_tracking

# --- WhatsApp Notifications ---
def create_whatsapp_notification(db: Session, notification: schemas.WhatsAppNotificationCreate):
    db_notification = models.WhatsAppNotification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

# --- Deliveries ---
def create_delivery(db: Session, delivery: schemas.DeliveryCreate):
    db_delivery = models.Delivery(**delivery.model_dump())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

def update_delivery(db: Session, delivery_id: int, delivery: schemas.DeliveryUpdate):
    db_delivery = get_item(db, models.Delivery, delivery_id)
    if db_delivery:
        for key, value in delivery.model_dump(exclude_unset=True).items():
            setattr(db_delivery, key, value)
        db.commit()
        db.refresh(db_delivery)
    return db_delivery