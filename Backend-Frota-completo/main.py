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
    r = requests.post(f"http://192.168.1.171:8080/message/sendText/{instance}", json={
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
        item_data = {
            "routeid": nova_rota.id,
            "ordernumber": i.ordernumber,
            "sequence": i.sequence,
            "status": i.status
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



# --- ERP PEDIDOS ENDPOINTS ---



@app.get("/erp/pedidos/{numero_pedido}")
def get_erp_pedido_by_numero(numero_pedido: str, db: Session = Depends(get_erp_db)):
    """
    Buscar pedido do banco ERP com 3 queries:
    1. PEDIDO - informações do pedido
    2. DOCTOS - informações da nota (cliente, CNPJ, código de acesso)
    3. nfenotas - endereço da nota
    """
    try:
        # Query 1: Buscar na tabela PEDIDO
        query_pedido = text("""
            SELECT *, empresa.emptelef as telefone FROM pedido, empresa
            WHERE pedido = :numero_pedido
            LIMIT 1
        """)
        result_pedido = db.execute(query_pedido, {"numero_pedido": numero_pedido})
        pedido_row = result_pedido.fetchone()
        telefone = pedido_row.telefone
        if not pedido_row:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        # Query 2: Buscar na tabela DOCTOS usando o número do pedido
        query_doctos = text("""
            SELECT * FROM doctos
            WHERE notpedido = :numero_pedido
            LIMIT 1
        """)
        result_doctos = db.execute(query_doctos, {"numero_pedido": numero_pedido})
        doctos_row = result_doctos.fetchone()
        
        if not doctos_row:
            raise HTTPException(status_code=404, detail="Nota fiscal não encontrada para este pedido")
        
        # Extrair notcodac para buscar endereço
        notcodac = doctos_row._mapping.get('notcodac') if hasattr(doctos_row, '_mapping') else doctos_row[doctos_row.keys().index('notcodac')] if hasattr(doctos_row, 'keys') else None
        
        # Query 3: Buscar na tabela nfenotas usando notcodac
        endereco_data = {}
        if notcodac:
            query_nfenotas = text("""
                SELECT nfenfanem, nfenmuemi, nfenbaiem, nfennomue, nfenesemi
                FROM nfenotas
                WHERE nfencodac = :notcodac
                LIMIT 1
            """)
            result_nfenotas = db.execute(query_nfenotas, {"notcodac": notcodac})
            nfenotas_row = result_nfenotas.fetchone()
            
            if nfenotas_row:
                endereco_data = {
                    "nfenfanem": nfenotas_row[0],
                    "nfenmuemi": nfenotas_row[1],
                    "nfenbaiem": nfenotas_row[2],
                    "nfennomue": nfenotas_row[3],
                    "nfenesemi": nfenotas_row[4],
                    "telefone": telefone
                }
        
        # Juntar dados de DOCTOS
        doctos_data = {
            "nosempant": doctos_row._mapping.get('nosempant') if hasattr(doctos_row, '_mapping') else doctos_row[doctos_row.keys().index('nosempant')] if hasattr(doctos_row, 'keys') else None,
            "nosempcgc": doctos_row._mapping.get('nosempcgc') if hasattr(doctos_row, '_mapping') else doctos_row[doctos_row.keys().index('nosempcgc')] if hasattr(doctos_row, 'keys') else None,
        }
        
        # Retornar dados combinados
        return {
            "pedido": numero_pedido,
            **doctos_data,
            **endereco_data
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

# Adicionar este endpoint ao main.py

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
        
        for item in itens:
            try:
                # Buscar dados do pedido no ERP
                query_doctos = text("""
                    SELECT d.nosempant, d.nosempcgc, d.notcodac
                    FROM doctos d
                    WHERE d.notpedido = :numero_pedido
                    LIMIT 1
                """)
                result_doctos = erp_db.execute(query_doctos, {"numero_pedido": item.ordernumber})
                doctos_row = result_doctos.fetchone()
                
                if not doctos_row:
                    continue
                
                # Buscar endereço
                query_nfenotas = text("""
                    SELECT nfenfanem, ndennumem, nfenbaiem, nfennomue, nfenesemi
                    FROM nfenotas
                    WHERE nfencodac = :notcodac
                    LIMIT 1
                """)
                result_nfenotas = erp_db.execute(query_nfenotas, {"notcodac": doctos_row[2]})
                nfenotas_row = result_nfenotas.fetchone()
                
                # Buscar telefone do cliente (pode estar em outra tabela)
                # Ajuste conforme sua estrutura de banco
                
                query_empresa = text("""
                    SELECT pedido.pedcliente
                    FROM pedido
                    WHERE pedido.pedido = :numero_pedido
                    LIMIT 1
                """)
                result_empresa = erp_db.execute(query_empresa, {"numero_pedido": item.ordernumber})
                empresatelef = result_empresa.fetchone()
                
                
                query_telefone = text("""
                    SELECT empresa.emptelef as telef
                    FROM empresa
                    WHERE empresa.empresa = :numero_empresa AND empresa.empdemptip = 'Cliente'
                    LIMIT 1
                """)
                result_telefone = erp_db.execute(query_telefone, {"numero_pedido": empresatelef.telef})
                telefone_row = result_telefone.fetchone()
                
                if not telefone_row:
                    print(f"O cliente do pedido {item.ordernumber} Não é do tipo 'Cliente'")
                else:    
                    telefone = telefone_row[0] if telefone_row and telefone_row[0] else None
                
                # Preparar dados do pedido
                pedido_data = {
                    "numero_pedido": item.ordernumber,
                    "cliente_nome": doctos_row[0],
                    "cnpj": doctos_row[1],
                    "telefone": telefone,
                    "endereco": nfenotas_row[0] if nfenotas_row else None,
                    "numero": nfenotas_row[1] if nfenotas_row else None,
                    "bairro": nfenotas_row[2] if nfenotas_row else None,
                    "cidade": nfenotas_row[3] if nfenotas_row else None,
                    "estado": nfenotas_row[4] if nfenotas_row else None,
                }
                
                # Enviar WhatsApp se houver telefone
                if telefone:
                    try:
                        mensagem("leandro", "5511975534028", f"Seu pedido já está sendo separado!\n - Número da rota: {item.id}\n - Número do pedido: {item.ordernumber}\n *STATUS*: {item.status}")
                        mensagem("leandro", "5511989642157", f"Seu pedido já está sendo separado!\n - Número da rota: {item.id}\n - Número do pedido: {item.ordernumber}\n *STATUS*: {item.status}")
                    except Exception as e:
                        print(f"Erro ao enviar WhatsApp para {telefone}: {str(e)}")
                
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
            "pedidos": pedidos_processados
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
    uvicorn.run(app, host="0.0.0.0", port=8000)

