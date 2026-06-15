from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, aliased
from typing import List
import models, schemas, crud
from database import engine, get_db
import requests
import json
from sqlalchemy import create_engine, text, select, func, or_
from typing import Optional
from datetime import datetime, timedelta, time
import shutil
import os

apikey = 'citrix21'

# Conexão com banco ERP
ERP_DATABASE_URL = "postgresql://postgres:postgres@192.168.1.17:5432/salutem"
erp_engine = create_engine(ERP_DATABASE_URL)
UPLOAD_DIR = "/var/www/uploads/canhotos"

def get_erp_db():
    """Conexão com banco ERP"""
    from sqlalchemy.orm import sessionmaker
    ERPSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=erp_engine)
    db = ERPSessionLocal()
    try:
        yield db
    finally:
        db.close()

def mensagem(instance: str, number: str, text: str):
    r = requests.post(f"http://192.168.1.178:8080/message/sendText/{instance}", json={
        "number": number,
        "text": text
    }, headers={
        "Content-Type": "application/json",
        "apikey": apikey
    })

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Logistics Management API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WHATSAPP MESSAGES ---

@app.post("/teste/")
def send_message(db: Session = Depends(get_db)):
    mensagem("leandro", "5511948447544", "Olá, Teste de API!")
    # stmt = select(models.Driver).join(models.Route, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902")
    # stmt2 = select(func.count()).select_from(models.Route).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902")
    # res = db.execute(stmt)
    # doing = db.query(models.Delivery).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902").where(models.Delivery.deliveredat.is_(None)).count()
    # did = db.query(models.Delivery).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902").where(models.Delivery.deliveredat.is_not(None)).count()
    # rota = db.query(models.Route.id, models.Route.createdat).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902").where(models.Route.status == 'in_progress').first()
    # # res = db.query(models.Route).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902").count()
    # # print(stmt2)
    # # json_out = json.dumps(res, indent=4)
    # print(rota)
    # return {
    #     "emAndamento": doing,
    #     "concluidas": did,
    #     "rotaAtual": {
    #         "id": rota[0],
    #         "createdat": rota[1]
    #     }
    # }


# --- APP DASHBOARD ---

@app.get("/app/dashboard/{cpf}")
def get_app_dashboard(cpf: str, db: Session = Depends(get_db)):
    doing = db.query(models.Delivery).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == cpf).where(models.Delivery.deliveredat.is_(None)).count()
    did = db.query(models.Delivery).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == cpf).where(models.Delivery.status == 'entregue').count()
    stmt = select(models.Route.id, models.Route.createdat).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == cpf).where(models.Route.status == 'in_progress') 
    rota = db.query(models.Route.id, models.Route.createdat).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == cpf).where(models.Route.status == 'in_progress').first()
    # res = db.query(models.Route).join(models.Driver, models.Driver.id == models.Route.driverid).where(models.Driver.cpf == "12345678902").count()
    print(stmt)
    # json_out = json.dumps(res, indent=4)
    payload={
        "emAndamento": doing,
        "concluidas": did,
    }
    print(rota)
    if rota is not None: 
        rotaAtual = {
            "id": rota[0],
            "createdat": rota[1]
        }
        payload["rotaAtual"] = rotaAtual
    print(rota)
    return  payload





# --- DRIVERS ENDPOINTS ---



@app.post("/drivers/", response_model=schemas.Driver)
def create_driver(driver: schemas.DriverCreate, db: Session = Depends(get_db)):
    return crud.create_driver(db=db, driver=driver)

@app.get("/drivers/", response_model=List[schemas.Driver])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Driver, skip=skip, limit=limit)

@app.get("/drivers/livre", response_model=List[schemas.Driver])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    RouteSub = aliased(models.Route)

    last_route_id = (
        select(RouteSub.id)
        .where(RouteSub.driverid == models.Driver.id)
        .order_by(RouteSub.createdat.desc())
        .limit(1)
        .scalar_subquery()
    )

    return (
        db.query(models.Driver)
        .outerjoin(
            models.Route,
            models.Route.id == last_route_id
        )
        .filter(
            or_(
                models.Route.status == "entregue",
                models.Route.id.is_(None)
            )
        )
        .all()
    )

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

@app.get("/vehicles/livres", response_model=List[schemas.Vehicle])
def read_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    RouteSub = aliased(models.Route)

    last_route_id = (
        select(RouteSub.id)
        .where(RouteSub.vehicleid == models.Vehicle.id)
        .order_by(RouteSub.createdat.desc())
        .limit(1)
        .scalar_subquery()
    )

    return (
        db.query(models.Vehicle)
        .outerjoin(
            models.Route,
            models.Route.id == last_route_id
        )
        .filter(
            or_(
                models.Route.status == "entregue",
                models.Route.id.is_(None)
            )
        )
        .all()
    )
        

@app.put("/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(vehicle_id: int, vehicle: schemas.VehicleUpdate, db: Session = Depends(get_db)):
    return crud.update_vehicle(db, vehicle_id, vehicle)

@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Vehicle, vehicle_id)
    return {"message": "Vehicle deleted"}



# --- ROUTES ENDPOINTS ---




@app.post("/routes/", response_model=schemas.RouteWeb)
def create_route(route: schemas.RouteWeb, db: Session = Depends(get_db)):

    lista_pedidos = route.items

    nova_rota = crud.create_route(db=db, route=route.route)

    for i in lista_pedidos:
        # Tenta buscar geolocalização se não houver latitude/longitude
        latitude = i.latitude
        longitude = i.longitude
        
        if not latitude or not longitude:
            try:
                # 1. Tenta ViaCEP para garantir o endereço correto pelo CEP
                res_cep = requests.get(f"https://viacep.com.br/ws/{i.zipcode}/json/")
                if res_cep.status_code == 200:
                    dados_cep = res_cep.json()
                    logradouro = dados_cep.get("logradouro", i.address)
                    bairro = dados_cep.get("bairro", i.neighborhood)
                    cidade = dados_cep.get("localidade", i.city)
                    estado = dados_cep.get("uf", i.state)
                    
                    # Monta endereço completo para o Nominatim
                    # Se tiver número, adiciona na busca
                    endereco_busca = f"{logradouro}, {i.address_number if i.address_number else ''}, {bairro}, {cidade}, {estado}, Brasil"
                    
                    # 2. Busca coordenadas no Nominatim
                    url_nominatim = "https://nominatim.openstreetmap.org/search"
                    parametros = {
                        "q": endereco_busca,
                        "format": "json",
                        "limit": 1
                    }
                    headers = { "User-Agent": "SistemaFrota/1.0" }
                    print(parametros)
                    res_geo = requests.get(url_nominatim, params=parametros, headers=headers)
                    resultado = res_geo.json()
                    
                    if resultado:
                        latitude = float(resultado[0]["lat"])
                        longitude = float(resultado[0]["lon"])
            except Exception as e:
                print(f"Erro na geolocalização automática: {str(e)}")

        item_data = {
            "routeid": nova_rota.id,
            "ordernumber": i.ordernumber,
            "sequence": i.sequence,
            "status": i.status,
            "address": i.address,
            "neighborhood": i.neighborhood,
            "city": i.city,
            "state": i.state,
            "zipcode": i.zipcode,
            "address_number": i.address_number,
            "latitude": latitude,
            "longitude": longitude
        }

        crud.create_route_item(db=db, item=item_data)

        print(i.telefone)
        mensagem("leandro", "5511975534028", f"Seu pedido já está sendo separado!\n - Número da rota: {nova_rota.id}\n - Número do pedido: {i.ordernumber}\n *STATUS*: {i.status}")
        mensagem("leandro", "5511989642157", f"Seu pedido já está sendo separado!\n - Número da rota: {nova_rota.id}\n - Número do pedido: {i.ordernumber}\n *STATUS*: {i.status}")

    return {
        "route": nova_rota,
        "items": lista_pedidos
    }

@app.get("/routes/", response_model=List[schemas.RouteWebRoute])
def read_routes(db: Session = Depends(get_db)):
    result = (
    db.query(
        models.Route.id,
        models.Route.driverid,
        models.Route.vehicleid,
        models.Route.status,
        models.Route.color,
        models.Route.createdat,
        models.Route.updatedat,
        models.Vehicle.name.label("vehicle_name"),
        models.Driver.name.label("driver_name")
    )
    .join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid)
    .join(models.Driver, models.Driver.id == models.Route.driverid)
    .all()
    )

    print(result)

    return [row._asdict() for row in result]

@app.get("/routes/{id}", response_model=List[schemas.Route])
def read_routes(id: int, db: Session = Depends(get_db)):
    return crud.get_item(db, model=models.Route, item_id=id)

@app.put("/routes/{route_id}", response_model=schemas.Route)
def update_route(route_id: int, route: schemas.RouteUpdate, db: Session = Depends(get_db)):
    return crud.update_route(db, route_id, route)

@app.delete("/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    # Para remover uma rota, só será possível caso todas as entregas/deliverys tenham sido excluídos
    deliveries_count = db.query(models.Delivery).filter(models.Delivery.routeid == route_id).count()
    if deliveries_count > 0:
        raise HTTPException(status_code=400, detail="Não é possível excluir uma rota que possui entregas vinculadas. Exclua as entregas primeiro.")
    
    # Excluir itens da rota primeiro
    db.query(models.RouteItem).filter(models.RouteItem.routeid == route_id).delete()
    # Excluir rastreamento
    db.query(models.GPSTracking).filter(models.GPSTracking.routeid == route_id).delete()
    # Excluir notificações
    db.query(models.WhatsAppNotification).filter(models.WhatsAppNotification.routeid == route_id).delete()
    
    crud.delete_item(db, models.Route, route_id)
    return {"message": "Rota excluída com sucesso"}





# --- ROUTE ITEMS ENDPOINTS ---




@app.delete("/route-items/{item_id}")
def delete_route_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.RouteItem).filter(models.RouteItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    rota = db.query(models.Route).filter(models.Route.id == item.routeid).first()
    
    # Para remover um pedido, só será possível caso a rota não tenha sido despachada (status != 'in_progress')
    # Caso já tenha saído, só será possível remover se o delivery do pedido tiver sido removido
    if rota.status == "in_progress":
        delivery = db.query(models.Delivery).filter(
            models.Delivery.routeid == item.routeid,
            models.Delivery.ordernumber == item.ordernumber
        ).first()
        if delivery:
            raise HTTPException(status_code=400, detail="Não é possível remover um pedido de uma rota em andamento que ainda possui entrega vinculada. Exclua a entrega primeiro.")
            
    db.delete(item)
    db.commit()
    return {"message": "Pedido removido da rota"}


@app.post("/route-items/", response_model=schemas.RouteItem)
def create_route_item(item: schemas.RouteItemCreate, db: Session = Depends(get_db)):
    return crud.create_route_item(db=db, item=item)

@app.get("/route-items/", response_model=List[schemas.RouteItem])
def read_route_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.RouteItem, skip=skip, limit=limit)


@app.get("/route-item/{ordernumber}", response_model=List[schemas.RouteItem])
def read_route_item(ordernumber: str, db: Session = Depends(get_db)):
    return db.query(models.RouteItem).where(models.RouteItem.ordernumber == ordernumber)

@app.put("/route-item/{order_number}", response_model=schemas.RouteItemUpdate)
def update_route_item(order_number: str, route_item: schemas.RouteItemUpdate, db: Session = Depends(get_db)):
    return crud.update_route_item_for_order_number(db, order_number, route_item)


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

@app.get("/delivery/{delivery}", response_model=schemas.DeliveryApp)
def deliveries_app(delivery: str, db: Session = Depends(get_db)):
    # print(datetime.strftime(date, "%Y-%m-%d %H:%M:%S.000-03 "))
    # print(date+" 0:00:0.000-03")
    # stmt= select(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name, models.Vehicle.name, models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).where(models.Delivery.deliveredat>date)
    # print(stmt)
    return db.query(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name.label("driver_name"), models.Vehicle.name.label("vehicle_name"), models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude, models.Route.createdat).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Delivery.id == delivery).first();

@app.get("/deliveries/{driver}", response_model=List[schemas.DeliveryApp])
def deliveries_app(driver: str, db: Session = Depends(get_db)):
    # print(datetime.strftime(date, "%Y-%m-%d %H:%M:%S.000-03 "))
    # print(date+" 0:00:0.000-03")
    # stmt= select(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name, models.Vehicle.name, models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).where(models.Delivery.deliveredat>date)
    # print(stmt)
    return db.query(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name.label("driver_name"), models.Vehicle.name.label("vehicle_name"), models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).all();

@app.get("/deliveries/finish/{driver}/{date}", response_model=List[schemas.DeliveryApp])
def deliveries_app_historico(driver: str, date: str, db: Session = Depends(get_db)):
    # print(datetime.strftime(date, "%Y-%m-%d %H:%M:%S.000-03 "))
    # print(date+" 0:00:0.000-03")
    # stmt= select(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name, models.Vehicle.name, models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).where(models.Delivery.deliveredat>date)
    # print(stmt)
    date_obj = datetime.combine(
    datetime.strptime(date, "%Y-%m-%d").date(),
    time.min
    )

    tomorrow = date_obj + timedelta(days=1)
    print(date_obj)
    print(tomorrow)

    stmt = select(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name.label("driver_name"), models.Vehicle.name.label("vehicle_name"), models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).filter(
    models.Delivery.deliveredat >= date_obj,
    models.Delivery.deliveredat < tomorrow)

    print(stmt)

    res = db.query(models.Delivery.id, models.Delivery.routeid, models.Delivery.ordernumber, models.Delivery.clientname,models.Driver.name.label("driver_name"), models.Vehicle.name.label("vehicle_name"), models.Delivery.status, models.RouteItem.address, models.RouteItem.address_number, models.RouteItem.city, models.RouteItem.state, models.RouteItem.zipcode,models.RouteItem.latitude, models.RouteItem.longitude).join(models.Route, models.Route.id == models.Delivery.routeid).join(models.RouteItem, models.RouteItem.ordernumber == models.Delivery.ordernumber).join(models.Driver, models.Driver.id == models.Route.driverid).join(models.Vehicle, models.Vehicle.id == models.Route.vehicleid).where(models.Driver.cpf == driver).filter(
    models.Delivery.deliveredat >= date_obj,
    models.Delivery.deliveredat < tomorrow).all();
    print(res)
    return res

@app.put("/deliveries/{delivery_id}", response_model=schemas.Delivery)
def update_delivery(delivery_id: int, delivery: schemas.DeliveryUpdate, db: Session = Depends(get_db)):
    return crud.update_delivery(db, delivery_id, delivery)

@app.delete("/deliveries/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    crud.delete_item(db, models.Delivery, delivery_id)
    return {"message": "Delivery deleted"}

# --- AUTH ENDPOINTS ---

from datetime import timedelta
import jwt
from fastapi import status

SECRET_KEY = "SuaChaveSecretaSuperSegura" # Em produção, use uma variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/drivers/login", response_model=schemas.Token)
def login_driver(login_data: schemas.DriverLogin, db: Session = Depends(get_db)):
    driver = crud.get_driver_by_cpf(db, cpf=login_data.cpf)
    if not driver or not crud.verify_password(login_data.passwordHash, driver.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": driver.email, "id": driver.id, "name": driver.name}, 
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "driver": driver
    }

    


# --- ERP PEDIDOS ENDPOINTS ---



@app.get("/erp/pedidos/{numero_pedido}")
def get_erp_pedido_by_numero(numero_pedido: str, db: Session = Depends(get_db), db_erp: Session = Depends(get_erp_db)):
    """
    Buscar pedido do banco ERP usando a tabela PEDIDO para endereço de entrega.
    """

    stmt = select(func.count()).select_from(models.RouteItem).where(models.RouteItem.ordernumber==numero_pedido)
    print(stmt)
    res = db.scalar(stmt)
    print(res)
    if(res==0):
        try:
            # Query 1: Buscar na tabela PEDIDO e EMPRESA (para telefone)
            query_pedido = text("""
                SELECT p.pedido, p.pedentend, p.pedentcid, p.pedentuf, p.pedentcep, p.pedentbair, e.emptelef as telefone
                FROM pedido p
                LEFT JOIN empresa e ON p.pedcliente = e.empresa
                WHERE p.pedido = :numero_pedido AND p.deposito = 1 AND p.pedusu NOT LIKE '%MICHELE%'
                LIMIT 1
            """)
            result_pedido = db_erp.execute(query_pedido, {"numero_pedido": numero_pedido})
            pedido_row = result_pedido.fetchone()
            
            if not pedido_row:
                raise HTTPException(status_code=404, detail="Pedido não encontrado! ")
                
            p_data = pedido_row._asdict() if hasattr(pedido_row, '_asdict') else dict(pedido_row._mapping)
            
            # Query 2: Buscar na tabela DOCTOS para nome do cliente e CNPJ
            query_doctos = text("""
                SELECT nosempant, nosempcgc FROM doctos
                WHERE notpedido = :numero_pedido
                LIMIT 1
            """)
            result_doctos = db_erp.execute(query_doctos, {"numero_pedido": numero_pedido})
            doctos_row = result_doctos.fetchone()
            d_data = doctos_row._asdict() if doctos_row and hasattr(doctos_row, '_asdict') else dict(doctos_row._mapping) if doctos_row else {}

            # Query 3: Buscar nome da cidade
            cidade_nome = ""
            if p_data.get('pedentcid'):
                query_cidade = text("SELECT cidnome FROM cidade WHERE cidade = :cid_id LIMIT 1")
                result_cidade = db_erp.execute(query_cidade, {"cid_id": p_data['pedentcid']})
                cidade_row = result_cidade.fetchone()
                if cidade_row:
                    cidade_nome = cidade_row[0]

            # Retornar em snake_case para o frontend
            return {
                "pedido": numero_pedido,
                "client_name": d_data.get('nosempant'),
                "cnpj": d_data.get('nosempcgc'),
                "telefone": p_data.get('telefone'),
                "address": p_data.get('pedentend').strip() if p_data.get('pedentend') else None,
                "neighborhood": p_data.get('pedentbair').strip() if p_data.get('pedentbair') else None,
                "city": cidade_nome.strip() if cidade_nome else None,
                "state": p_data.get('pedentuf').strip() if p_data.get('pedentuf') else None,
                "zipcode": p_data.get('pedentcep').strip() if p_data.get('pedentcep') else None
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Erro ao buscar pedido: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erro ao buscar pedido do ERP: {str(e)}")
    else:
        raise HTTPException(status_code=423, detail=f"Já existe uma rota com esse pedido!")



# --- Dashboard ---



@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
        return crud.get_dashboard(db)


# import httpx

# @app.get("/dashboard/vehicle-map")
# async def get_dashboard_map(db: Session = Depends(get_db)):
#     """
#     Retorna a localização atual de todos os veículos que possuem rotas em andamento,
#     junto com as informações de endereço de cada item da rota (route_items).
#     """
#     response = {}
#     async with httpx.AsyncClient() as client:
#         response = await client.get(
#             "https://api.mobiltracker.com.br/trackers/last-locations", headers={
#             "Authorization": "AuthDevice aa4a6dbc0484446dbff5b25ba44685df"
#             }
#         )

#         # Criamos um gerenciador de contexto usando a sua função get_erp_db (ou get_db)
#         # Se get_erp_db for um generator (com yield), usamos contextlib.contextmanager
#     #     from contextlib import contextmanager
        
#     #     # Criando o gerenciador de contexto para abrir e fechar o banco com segurança
#     #     managed_get_db = contextmanager(get_db) # ou get_db, dependendo de qual tabela 'models.Route' usa
        
#     # with managed_get_db() as db:
#     #     for car in response.json():
#     #         print(car)
            
#     #         query = db.scalars(select(models.Route.id).where(models.Route.vehicleid == int(car['trackerId'])).where(models.Route.status.like('%in_progress%'))).first()
#     #         print(query)
#     #         if(query is not None):
#     #             tracking: schemas.GPSTrackingCreate = {
#     #                 "routeid": query,
#     #                 "latitude": car['latitude'],
#     #                 "longitude": car['longitude']
#     #             }
#     # # 1. Buscar rotas em progresso
#     active_routes = db.query(models.Route).filter(models.Route.status == "in_progress").all()
#     # print(response.json())
#     results = []
#     # print(enumerate(active_routes))
#     data = response.json()
#     for index, route in enumerate(active_routes):
#         # Pegar o último GPS
#         last_gps = {}
#         for car in data:
#             # print(type(car["trackerId"]))
#             if(car["trackerId"]==route.vehicleid):
#                 last_gps = car 
#         # print(last_gps)
#         if not last_gps:
#             continue

        
            
#         # Pegar os itens da rota (pedidos) com endereço
#         route_items = db.query(models.RouteItem)\
#             .filter(models.RouteItem.routeid == route.id)\
#             .all()

#         # print(car['speed'])

#         rota = {}

#         # print("\nCarro: ", last_gps['trackerId'], "Velocidade: ", last_gps['speed'])
#         if(last_gps['speed'] != 0):    
#             coordPayloadJobs = []
#             for item in route_items:
#                 # print(item)
#                 coordPayloadJobs.append({
#                     "id": item.id,
#                     "location": [item.longitude, item.latitude]
#                 })

#             # print(coordPayloadJobs)

#             payload={
#                 "jobs": coordPayloadJobs,
#                 "vehicles": [
#                     {
#                         "id": index,
#                         "profile": "driving-hgv",
#                         "start": [last_gps["longitude"], last_gps["latitude"]] 
#                     }
#                 ]
#             }
#             # print(payload)

            
#             response = requests.post(
#                 "https://api.openrouteservice.org/optimization", json=payload, headers={
#                 "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
#                 "Content-Type": "application/json"
#                 }
#             )
#             print("\n\n\n---nOTIMIZOU---\n\n\n")
#             rota = response.json()
#             # Fim do if



#         coordinates = {
#             "coordinates": []
#         }
#         values = {}

#         if not rota:
#             coordinates["coordinates"].append([last_gps["longitude"], last_gps['latitude']])
#             for items in route_items:
#                 coordinates['coordinates'].append([items.longitude, items.latitude])
#         # print(rota)
#         else:
#             for ponto in rota['routes'][0]['steps']:
#                 if(ponto["type"]!="end"):
#                     coordinates['coordinates'].append([ponto['location'][0], ponto['location'][1]])
#         # print(rota)
#         # print(coordinates)

#         rotaResponse = requests.post("https://api.openrouteservice.org/v2/directions/driving-hgv/geojson", json=coordinates, headers={
#             "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
#             "Content-Type": "application/json"
#         })

#         # print("Resultado da rota: ", rotaResponse.json())

#         rotaSource = rotaResponse.json()

#         results.append({
#             "route_id": route.id,
#             "color": route.color,
#             "vehicle": {
#                 "id": route.vehicle.id,
#                 "name": route.vehicle.name,
#                 "plate": route.vehicle.plate
#             },
#             "driver": {
#                 "id": route.driver.id,
#                 "name": route.driver.name
#             },
#             "car_status": {
#                 **last_gps
#             },
#             "route_source": {
#                 **rotaSource
#             },
#             "orders": [
#                 {
#                     "id": item.id,
#                     "order_number": item.ordernumber,
#                     "address": f"{item.address}, {item.neighborhood}, {item.city} - {item.state}",
#                     "zipcode": item.zipcode,
#                     "latitude": item.latitude,
#                     "longitude": item.longitude,
#                     "status": item.status
#                 } for item in route_items if item.address # Apenas itens com endereço
#             ]
#         })
        
#     return results

from sqlalchemy.orm import selectinload
import httpx

@app.get("/dashboard/vehicle-map")
async def get_dashboard_map(db: Session = Depends(get_db)):

    async with httpx.AsyncClient(timeout=14) as client:

        tracker_response = await client.get(
            "https://api.mobiltracker.com.br/trackers/last-locations",
            headers={
                "Authorization": "AuthDevice aa4a6dbc0484446dbff5b25ba44685df"
            }
        )

        tracker_response.raise_for_status()

        tracker_data = tracker_response.json()

    gps_map = {
        int(car["trackerId"]): car
        for car in tracker_data
    }

    active_routes = (
        db.query(models.Route)
        .options(
            selectinload(models.Route.items),
            selectinload(models.Route.vehicle),
            selectinload(models.Route.driver)
        )
        .filter(models.Route.status == "in_progress")
        .all()
    )

    results = []

    async with httpx.AsyncClient(timeout=14) as client:

        for index, route in enumerate(active_routes):

            last_gps = gps_map.get(route.vehicleid)

            if not last_gps:
                continue

            route_items = route.items

            rota_otimizada = {}


            if (
                len(route_items) > 0
            ):

                jobs = [
                    {
                        "id": item.id,
                        "location": [
                            item.longitude,
                            item.latitude
                        ]
                    }
                    for item in route_items
                    if item.latitude and item.longitude
                ]

                if jobs:

                    payload = {
                        "jobs": jobs,
                        "vehicles": [
                            {
                                "id": index,
                                "profile": "driving-hgv",
                                "start": [
                                    last_gps["longitude"],
                                    last_gps["latitude"]
                                ]
                            }
                        ]
                    }

                    try:

                        optimization_response = await client.post(
                            "https://api.openrouteservice.org/optimization",
                            json=payload,
                            headers={
                                "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
                                "Content-Type": "application/json"
                            }
                        )
                        # print("\n Rota: ", route.id, "\n ", optimization_response.json(), "\n\n")
                        if optimization_response.status_code == 200:
                            rota_otimizada = optimization_response.json()

                    except Exception as e:
                        print(
                            f"Erro ao otimizar rota {route.id}: {e}"
                        )

            coordinates = {
                "coordinates": []
            }

            if not rota_otimizada:

                coordinates["coordinates"].append(
                    [
                        last_gps["longitude"],
                        last_gps["latitude"]
                    ]
                )

                for item in route_items:

                    if item.latitude and item.longitude:

                        coordinates["coordinates"].append(
                            [
                                item.longitude,
                                item.latitude
                            ]
                        )

            else:

                try:

                    for ponto in rota_otimizada["routes"][0]["steps"]:

                        if ponto["type"] != "end":

                            coordinates["coordinates"].append(
                                [
                                    ponto["location"][0],
                                    ponto["location"][1]
                                ]
                            )

                except Exception as e:

                    print(
                        f"Erro ao montar coordenadas da rota {route.id}: {e}"
                    )

            rota_source = {}

            if len(coordinates["coordinates"]) >= 2:

                try:

                    directions_response = await client.post(
                        "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
                        json=coordinates,
                        headers={
                            "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
                            "Content-Type": "application/json"
                        }
                    )
                    # print(directions_response)
                    if directions_response.status_code == 200:
                        rota_source = directions_response.json()

                except Exception as e:

                    print(
                        f"Erro ao gerar geometria da rota {route.id}: {e}"
                    )

            results.append({
                "route_id": route.id,
                "color": route.color,

                "vehicle": {
                    "id": route.vehicle.id,
                    "name": route.vehicle.name,
                    "plate": route.vehicle.plate
                },

                "driver": {
                    "id": route.driver.id,
                    "name": route.driver.name
                },

                "car_status": last_gps,

                "route_source": rota_source,

                "orders": [
                    {
                        "id": item.id,
                        "order_number": item.ordernumber,
                        "address": f"{item.address}, {item.neighborhood}, {item.city} - {item.state}",
                        "zipcode": item.zipcode,
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "status": item.status
                    }
                    for item in route_items
                    if item.address
                ]
            })

    return results


@app.get("/dashboard/vehicle-map/driver/{id_motorista}")
async def get_dashboard_map_by_driver(id_motorista: int, db: Session = Depends(get_db)):

    # Pegar veiculo da rota pelo id do motorista
    active_route_by_driver = db.query(models.Route).where(models.Route.driverid==id_motorista).where(models.Route.status=="in_progress").first()
    print(active_route_by_driver.driverid)
    active_routes = [active_route_by_driver]
    async with httpx.AsyncClient(timeout=14) as client:

        tracker_response = await client.get(
            "https://api.mobiltracker.com.br/trackers/last-locations",
            headers={
                "Authorization": "AuthDevice aa4a6dbc0484446dbff5b25ba44685df"
            }
        )

        tracker_response.raise_for_status()

        tracker_data = tracker_response.json()

    carS = next((u for u in tracker_data if u['trackerId']==active_route_by_driver.vehicleid))

    gps_map = {
        int(carS['trackerId']): carS    
    }

    print(gps_map)

    results = []

    async with httpx.AsyncClient(timeout=40) as client:

        for index, route in enumerate(active_routes):

            last_gps = gps_map.get(route.vehicleid)

            if not last_gps:
                continue

            route_items = route.items

            rota_otimizada = {}


            if (
                len(route_items) > 0
            ):

                jobs = [
                    {
                        "id": item.id,
                        "location": [
                            item.longitude,
                            item.latitude
                        ]
                    }
                    for item in route_items
                    if item.latitude and item.longitude
                ]

                if jobs:

                    payload = {
                        "jobs": jobs,
                        "vehicles": [
                            {
                                "id": index,
                                "profile": "driving-hgv",
                                "start": [
                                    last_gps["longitude"],
                                    last_gps["latitude"]
                                ]
                            }
                        ]
                    }

                    try:

                        optimization_response = await client.post(
                            "https://api.openrouteservice.org/optimization",
                            json=payload,
                            headers={
                                "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
                                "Content-Type": "application/json"
                            }
                        )
                        # print("\n Rota: ", route.id, "\n ", optimization_response.json(), "\n\n")
                        if optimization_response.status_code == 200:
                            rota_otimizada = optimization_response.json()

                    except Exception as e:
                        print(
                            f"Erro ao otimizar rota {route.id}: {e}"
                        )

            coordinates = {
                "coordinates": []
            }

            if not rota_otimizada:

                coordinates["coordinates"].append(
                    [
                        last_gps["longitude"],
                        last_gps["latitude"]
                    ]
                )

                for item in route_items:

                    if item.latitude and item.longitude:

                        coordinates["coordinates"].append(
                            [
                                item.longitude,
                                item.latitude
                            ]
                        )

            else:

                try:

                    for ponto in rota_otimizada["routes"][0]["steps"]:

                        if ponto["type"] != "end":

                            coordinates["coordinates"].append(
                                [
                                    ponto["location"][0],
                                    ponto["location"][1]
                                ]
                            )

                except Exception as e:

                    print(
                        f"Erro ao montar coordenadas da rota {route.id}: {e}"
                    )

            rota_source = {}

            if len(coordinates["coordinates"]) >= 2:

                try:

                    directions_response = await client.post(
                        "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
                        json=coordinates,
                        headers={
                            "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
                            "Content-Type": "application/json"
                        }
                    )
                    # print(directions_response)
                    if directions_response.status_code == 200:
                        rota_source = directions_response.json()

                except Exception as e:

                    print(
                        f"Erro ao gerar geometria da rota {route.id}: {e}"
                    )

            results.append({
                "route_id": route.id,
                "color": route.color,

                "vehicle": {
                    "id": route.vehicle.id,
                    "name": route.vehicle.name,
                    "plate": route.vehicle.plate
                },

                "driver": {
                    "id": route.driver.id,
                    "name": route.driver.name
                },

                "car_status": last_gps,

                "route_source": rota_source,

                "orders": [
                    {
                        "id": item.id,
                        "order_number": item.ordernumber,
                        "address": f"{item.address}, {item.neighborhood}, {item.city} - {item.state}",
                        "zipcode": item.zipcode,
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "status": item.status
                    }
                    for item in route_items
                    if item.address
                ]
            })

    return results





@app.post("/routes/{route_id}/saiu-entrega")
def route_saiu_entrega(route_id: int, db: Session = Depends(get_db), erp_db: Session = Depends(get_erp_db)):
    """
    Atualizar rota para 'em entrega' e enviar WhatsApp para cada pedido
    """
    try:
        # 1. Buscar rota
        rota = db.query(models.Route).filter(models.Route.id == route_id).first()
        if not rota:
            raise HTTPException(status_code=404, detail="Rota não encontrada")
        
        # 2. Buscar itens da rota
        itens = db.query(models.RouteItem).filter(models.RouteItem.routeid == route_id).all()
        if not itens:
            raise HTTPException(status_code=404, detail="Nenhum pedido encontrado nesta rota")
        
        # 3. Para cada pedido, buscar dados do ERP e enviar WhatsApp
        pedidos_processados = []
        deliverys = []
        for item in itens:
            try:
                # Buscar dados do pedido no ERP usando a tabela pedido para endereço
                query_pedido = text("""
                    SELECT p.pedentend, p.pedentcid, p.pedentuf, p.pedentcep, p.pedentbair, e.emptelef as telefone
                    FROM pedido p
                    LEFT JOIN empresa e ON p.pedcliente = e.empresa
                    WHERE p.pedido = :numero_pedido
                    LIMIT 1
                """)
                result_pedido = erp_db.execute(query_pedido, {"numero_pedido": item.ordernumber})
                pedido_row = result_pedido.fetchone()
                
                if not pedido_row:
                    continue
                
                p_data = pedido_row._asdict() if hasattr(pedido_row, '_asdict') else dict(pedido_row._mapping)

                # Buscar nome do cliente na tabela doctos
                query_doctos = text("""
                    SELECT nosempant, nosempcgc FROM doctos
                    WHERE notpedido = :numero_pedido
                    LIMIT 1
                """)
                result_doctos = erp_db.execute(query_doctos, {"numero_pedido": item.ordernumber})
                doctos_row = result_doctos.fetchone()
                d_data = doctos_row._asdict() if doctos_row and hasattr(doctos_row, '_asdict') else dict(doctos_row._mapping) if doctos_row else {}

                # Buscar nome da cidade
                cidade_nome = ""
                if p_data.get('pedentcid'):
                    query_cidade = text("SELECT cidnome FROM cidade WHERE cidade = :cid_id LIMIT 1")
                    result_cidade = erp_db.execute(query_cidade, {"cid_id": p_data['pedentcid']})
                    cidade_row = result_cidade.fetchone()
                    if cidade_row:
                        cidade_nome = cidade_row[0]
                
                # Preparar dados do pedido (snake_case)
                pedido_data = {
                    "numero_pedido": item.ordernumber,
                    "client_name": d_data.get('nosempant'),
                    "cnpj": d_data.get('nosempcgc'),
                    "telefone": p_data.get('telefone'),
                    "address": p_data.get('pedentend').strip() if p_data.get('pedentend') else None,
                    "neighborhood": p_data.get('pedentbair').strip() if p_data.get('pedentbair') else None,
                    "city": cidade_nome.strip() if cidade_nome else None,
                    "state": p_data.get('pedentuf').strip() if p_data.get('pedentuf') else None,
                    "zipcode": p_data.get('pedentcep').strip() if p_data.get('pedentcep') else None,
                }
                
                delivery = schemas.DeliveryCreate(
                    routeid=item.routeid,
                    ordernumber=item.ordernumber,
                    clientname=d_data.get('nosempant'),
                    status="in_progress"
                )

                entrega = crud.create_delivery(db=db, delivery=delivery)
                # Enviar WhatsApp se houver telefone

                deliverys.append(entrega)

                # if telefone:
                #     try:
                #         mensagem("leandro", "5511975534028", f"Seu pedido já está sendo separado!\n - Número da rota: {item.id}\n - Número do pedido: {item.ordernumber}\n *STATUS*: {item.status}")
                #         mensagem("leandro", "5511989642157", f"Seu pedido já está sendo separado!\n - Número da rota: {item.id}\n - Número do pedido: {item.ordernumber}\n *STATUS*: {item.status}")
                #     except Exception as e:
                #         print(f"Erro ao enviar WhatsApp para {telefone}: {str(e)}")
                
                pedidos_processados.append(pedido_data)
                
                # Atualizar status do item
                item.status = "in_progress"
                db.add(item)
                
            except Exception as e:
                print(f"Erro ao processar pedido {item.ordernumber}: {str(e)}")
                continue
        
        # 4. Atualizar status da rota
        rota.status = "in_progress"
        db.add(rota)
        db.commit()
        
        

        return {
            "success": True,
            "message": f"Rota {route_id} marcada como em entrega",
            "pedidos_notificados": len(pedidos_processados),
            "pedidos": pedidos_processados,
            "entregas": deliverys
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Erro ao marcar rota como saiu para entrega: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

# -----------



@app.post("/upload-canhoto/{order_number}/{chave_acesso}/{id_deliveries}")
async def upload_canhoto(order_number: str, chave_acesso: str, id_deliveries: int,file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Cria a pasta se não existir
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    # Define o caminho do arquivo (ex: /var/www/uploads/canhotos/44digitos.jpg)
    file_path = os.path.join(UPLOAD_DIR, f"{chave_acesso}.jpg")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    crud.update_route_item_for_order_number(db, order_number, schemas.RouteItemUpdate(status="entregue"))
    

    with db as db:
    # 2. Retrieve the object you want to update
        delivery = db.get(models.Delivery, id_deliveries)  # Fetches User where id=1
        
        if delivery:
            # date_obj = datetime.combine(
            #     datetime.strptime(str(datetime.now()), "%Y-%m-%d").date(),
            #     time.min
            # )
            # 3. Modify the attribute directly
            delivery.deliveredat = datetime.now()
            
            # 4. Commit to persist changes
            db.commit()

    return {"status": "sucesso", "path": file_path}




# --- (GPS) ---

# from apscheduler.schedulers.asyncio import AsyncIOScheduler

# scheduler = AsyncIOScheduler()
# import httpx
# @app.post("gps")
# async def atualizar_localizacao(db: Session = Depends(get_db)):
#     async with httpx.AsyncClient() as client:
#         response = await client.get(
#             "https://api.mobiltracker.com.br/trackers/last-locations", headers={
#             "Authorization": "AuthDevice aa4a6dbc0484446dbff5b25ba44685df"
#             }
#         )

#         # Criamos um gerenciador de contexto usando a sua função get_erp_db (ou get_db)
#         # Se get_erp_db for um generator (com yield), usamos contextlib.contextmanager
#         from contextlib import contextmanager
        
#         # Criando o gerenciador de contexto para abrir e fechar o banco com segurança
#         managed_get_db = contextmanager(get_db) # ou get_db, dependendo de qual tabela 'models.Route' usa
        
#         with managed_get_db() as db:
#             for car in response.json():
#                 print(car)
                
#                 query = db.scalars(select(models.Route.id).where(models.Route.vehicleid == int(car['trackerId'])).where(models.Route.status.like('%in_progress%'))).first()
#                 print(query)
#                 if(query is not None):
#                     tracking: schemas.GPSTrackingCreate = {
#                         "routeid": query,
#                         "latitude": car['latitude'],
#                         "longitude": car['longitude']
#                     }

#                     db_tracking = models.GPSTracking(**tracking)
#                     db.add(db_tracking)
#                     db.commit()
#                     db.refresh(db_tracking)

#             # Agora 'db' será uma sessão válida do SQLAlchemy!
            


# @app.on_event("startup")
# async def startup():
#     scheduler.add_job(
#         atualizar_localizacao,
#         "interval",
#         seconds=10
#     )
#     scheduler.start()

# @app.on_event("shutdown")
# async def shutdown():
#     scheduler.shutdown()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

