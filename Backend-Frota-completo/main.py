from fastapi import FastAPI, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import engine, get_db
import requests
import json
from sqlalchemy import create_engine, text


apikey = 'citrix21'

# Conexão com banco ERP
ERP_DATABASE_URL = "postgresql://postgres:postgres@192.168.1.17:5432/salutem"
erp_engine = create_engine(ERP_DATABASE_URL)

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




@app.post("/routes/", response_model=schemas.RouteWeb)
def create_route(route: schemas.RouteWeb, db: Session = Depends(get_db)):

    lista_pedidos = route.items

    nova_rota = crud.create_route(db=db, route=route.route)

    for i in lista_pedidos:

        res = requests.get(f"https://viacep.com.br/ws/{i.zipcode}/json/")
        
        dados = res.json()

        # Monta endereço completo
        logradouro = dados["logradouro"]
        bairro = dados["bairro"]
        cidade = dados["localidade"]
        estado = dados["uf"]

        endereco = f"{logradouro}, {numero}, {bairro}, {cidade}, {estado}, Brasil"

        print("Endereço:")
        print(endereco)

        # -------------------------
        # BUSCA COORDENADAS
        # -------------------------
        url_nominatim = "https://nominatim.openstreetmap.org/search"

        parametros = {
            "q": endereco,
            "format": "json",
            "limit": 1
        }

        headers = {
            "User-Agent": "MeuProjetoPython/1.0"
        }

        geo = requests.get(
            url_nominatim,
            params=parametros,
            headers=headers
        )

        resultado = geo.json()

        # -------------------------
        # EXIBE RESULTADO
        # -------------------------
        if resultado:
            latitude = resultado[0]["lat"]
            longitude = resultado[0]["lon"]

            print("\nCoordenadas:")
            print("Latitude:", latitude)
            print("Longitude:", longitude)

        else:
            print("Endereço não encontrado.")

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
            "latitude": i.latitude,
            "longitude": i.longitude
        }

        crud.create_route_item(db=db, item=item_data)

        print(i.telefone)
        mensagem("leandro", "5511975534028", f"Seu pedido já está sendo separado!\n - Número da rota: {nova_rota.id}\n - Número do pedido: {i.ordernumber}\n *STATUS*: {i.status}")
        mensagem("leandro", "5511989642157", f"Seu pedido já está sendo separado!\n - Número da rota: {nova_rota.id}\n - Número do pedido: {i.ordernumber}\n *STATUS*: {i.status}")

    return {
        "route": nova_rota,
        "items": lista_pedidos
    }

@app.get("/routes/", response_model=List[schemas.Route])
def read_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_items(db, models.Route, skip=skip, limit=limit)

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



# --- ERP PEDIDOS ENDPOINTS ---



@app.get("/erp/pedidos/{numero_pedido}")
def get_erp_pedido_by_numero(numero_pedido: str, db: Session = Depends(get_erp_db)):
    """
    Buscar pedido do banco ERP usando a tabela PEDIDO para endereço de entrega.
    """
    try:
        # Query 1: Buscar na tabela PEDIDO e EMPRESA (para telefone)
        query_pedido = text("""
            SELECT p.pedido, p.pedentend, p.pedentcid, p.pedentuf, p.pedentcep, p.pedentbair, e.emptelef as telefone
            FROM pedido p
            LEFT JOIN empresa e ON p.pedcliente = e.empresa
            WHERE p.pedido = :numero_pedido
            LIMIT 1
        """)
        result_pedido = db.execute(query_pedido, {"numero_pedido": numero_pedido})
        pedido_row = result_pedido.fetchone()
        
        if not pedido_row:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
            
        p_data = pedido_row._asdict() if hasattr(pedido_row, '_asdict') else dict(pedido_row._mapping)
        
        # Query 2: Buscar na tabela DOCTOS para nome do cliente e CNPJ
        query_doctos = text("""
            SELECT nosempant, nosempcgc FROM doctos
            WHERE notpedido = :numero_pedido
            LIMIT 1
        """)
        result_doctos = db.execute(query_doctos, {"numero_pedido": numero_pedido})
        doctos_row = result_doctos.fetchone()
        d_data = doctos_row._asdict() if doctos_row and hasattr(doctos_row, '_asdict') else dict(doctos_row._mapping) if doctos_row else {}

        # Query 3: Buscar nome da cidade
        cidade_nome = ""
        if p_data.get('pedentcid'):
            query_cidade = text("SELECT cidnome FROM cidade WHERE cidade = :cid_id LIMIT 1")
            result_cidade = db.execute(query_cidade, {"cid_id": p_data['pedentcid']})
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



# --- Dashboard ---



@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
        return crud.get_dashboard(db)

@app.get("/dashboard/vehicle-map")
def get_dashboard_map(db: Session = Depends(get_db)):
    """
    Retorna a localização atual de todos os veículos que possuem rotas em andamento,
    junto com as informações de endereço de cada item da rota (route_items).
    """
    # 1. Buscar rotas em progresso
    active_routes = db.query(models.Route).filter(models.Route.status == "in_progress").all()
    
    results = []
    for route in active_routes:
        # Pegar o último GPS
        last_gps = db.query(models.GPSTracking)\
            .filter(models.GPSTracking.routeid == route.id)\
            .order_by(models.GPSTracking.timestamp.desc())\
            .first()
            
        if not last_gps:
            continue
            
        # Pegar os itens da rota (pedidos) com endereço
        route_items = db.query(models.RouteItem)\
            .filter(models.RouteItem.routeid == route.id)\
            .all()
            
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
            "current_location": {
                "latitude": last_gps.latitude,
                "longitude": last_gps.longitude,
                "timestamp": last_gps.timestamp
            },
            "orders": [
                {
                    "id": item.id,
                    "order_number": item.ordernumber,
                    "address": f"{item.address}, {item.neighborhood}, {item.city} - {item.state}",
                    "zipcode": item.zipcode,
                    "latitude": item.latitude,
                    "longitude": item.longitude,
                    "status": item.status
                } for item in route_items if item.address # Apenas itens com endereço
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
                    status="Em rota"
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
    uvicorn.run(app, host="0.0.0.0", port=8001)

