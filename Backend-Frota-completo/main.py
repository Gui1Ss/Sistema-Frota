from fastapi import FastAPI, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import engine, get_db
import requests
import json


apikey = 'citrix21'
# Nota: Em produção, você usaria migrations (Alembic). 
# Aqui, garantimos que as tabelas existam se o usuário não importar o SQL manualmente.

def mensagem(instance: str, number: str, text: str):
    r = requests.post(f"http://192.168.1.171:8080/message/sendText/{instance}", json={
        "number": number,
        "text": text
    }, headers={
        "Content-Type": "application/json",
        "apikey": apikey
    })


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Logistics Management API")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WHATSAPP MESSAGES ---

@app.post("/teste/")
def send_message():
    mensagem("leandro", "5511948447544", "Olá, Teste de API!")
    return "OK"


# --- DRIVERS ENDPOINTS ---
@app.post("/drivers/", response_model=schemas.Driver)
def create_driver(driver: schemas.DriverCreate, db: Session = Depends(get_db)):
    return crud.create_driver(db=db, driver=driver)

@app.get("/drivers/", response_model=List[schemas.Driver])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Driver, skip=skip, limit=limit)

@app.get("/drivers/{driver_id}", response_model=schemas.Driver)
def read_driver(driver_id: int, db: Session = Depends(get_db)):
    db_driver = crud.get_item(db, models.Driver, driver_id)
    if db_driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver

@app.put("/drivers/{driver_id}", response_model=schemas.Driver)
def update_driver(driver_id: int, driver: schemas.DriverUpdate, db: Session = Depends(get_db)):
    return crud.update_driver(db, driver_id, driver)

@app.delete("/drivers/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Driver, driver_id)
    return {"message": "Driver deleted"}

# --- VEHICLES ENDPOINTS ---
@app.post("/vehicles/", response_model=schemas.Vehicle)
def create_vehicle(vehicle: schemas.VehicleCreate, db: Session = Depends(get_db)):
    return crud.create_vehicle(db=db, vehicle=vehicle)

@app.get("/vehicles/", response_model=List[schemas.Vehicle])
def read_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Vehicle, skip=skip, limit=limit)

@app.put("/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(vehicle_id: int, vehicle: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    return crud.update_vehicle(db, vehicle_id, vehicle)

@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Vehicle, vehicle_id)
    return {"message": "Vehicle deleted"}

# --- ROUTES ENDPOINTS ---
@app.post("/routes/", response_model=schemas.Route)
def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db)):
    return crud.create_route(db=db, route=route)

@app.get("/routes/", response_model=List[schemas.Route])
def read_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Route, skip=skip, limit=limit)

@app.put("/routes/{route_id}", response_model=schemas.Route)
def update_route(route_id: int, route: schemas.RouteUpdate, db: Session = Depends(get_db)):
    return crud.update_route(db, route_id, route)

@app.delete("/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Route, route_id)
    return {"message": "Route deleted"}

# --- ROUTE ITEMS ENDPOINTS ---
@app.post("/route-items/", response_model=schemas.RouteItem)
def create_route_item(item: schemas.RouteItemCreate, db: Session = Depends(get_db)):
    return crud.create_route_item(db=db, item=item)

@app.get("/route-items/", response_model=List[schemas.RouteItem])
def read_route_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.RouteItem, skip=skip, limit=limit)

# --- GPS TRACKING ENDPOINTS ---
@app.post("/gps-tracking/", response_model=schemas.GPSTracking)
def create_gps_tracking(tracking: schemas.GPSTrackingCreate, db: Session = Depends(get_db)):
    return crud.create_gps_tracking(db=db, tracking=tracking)

@app.get("/gps-tracking/{route_id}", response_model=List[schemas.GPSTracking])
def read_gps_tracking(route_id: int, db: Session = Depends(get_db)):
    return db.query(models.GPSTracking).filter(models.GPSTracking.routeId == route_id).all()

# --- WHATSAPP NOTIFICATIONS ENDPOINTS ---
@app.post("/whatsapp-notifications/", response_model=schemas.WhatsAppNotification)
def create_notification(notification: schemas.WhatsAppNotificationCreate, db: Session = Depends(get_db)):
    return crud.create_whatsapp_notification(db=db, notification=notification)

# --- DELIVERIES ENDPOINTS ---
@app.post("/deliveries/", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    return crud.create_delivery(db=db, delivery=delivery)

@app.get("/deliveries/", response_model=List[schemas.Delivery])
def read_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Delivery, skip=skip, limit=limit)

@app.put("/deliveries/{delivery_id}", response_model=schemas.Delivery)
def update_delivery(delivery_id: int, delivery: schemas.DeliveryUpdate, db: Session = Depends(get_db)):
    return crud.update_delivery(db, delivery_id, delivery)

@app.delete("/deliveries/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Delivery, delivery_id)
    return {"message": "Delivery deleted"}

# --- WebSocket (GPS) ---

@app.websocket("/gps")
async def websocket_gps(websocket: WebSocket):
    await websocket.accept()

    while True:
        data= await websocket.receive_json();

        print(data)

        await websocket.send_text(f"Chegou! \n {data}")
    
        await websocket.send_text(f"Chegou! \n {data['id']}")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

