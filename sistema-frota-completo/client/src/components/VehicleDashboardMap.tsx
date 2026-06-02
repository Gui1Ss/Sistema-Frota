import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
// import Openrouteservice from 'openrouteservice-js'

interface Vehicle {
  id: number;
  name: string;
  plate: string;
}

interface Driver {
  id: number;
  name: string;
}

interface CurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface Order {
  id: number;
  order_number: string;
  address: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

interface RouteData {
  route_id: number;
  color?: string;
  vehicle: Vehicle;
  driver: Driver;
  current_location: CurrentLocation;
  orders: Order[];
}

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505]; // São Paulo como padrão

export default function VehicleDashboardMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [vehicles, setVehicles] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  // const orsDirections = new Openrouteservice.Directions({ api_key: "XYZ"});

  // Buscar dados do mapa
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await api.get("/dashboard/vehicle-map");
        console.log("Dados do mapa recebidos:", response.data);
        setVehicles(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do mapa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        // Usando um estilo mais estável e público
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: DEFAULT_CENTER,
        zoom: 10,
      } );

      map.current.on('error', (e) => {
        console.error("Erro no MapLibre:", e);
        setMapError("Erro ao carregar camadas do mapa. Verifique a conexão.");
      });

    } catch (err) {
      console.error("Falha ao inicializar o mapa:", err);
      setMapError("Não foi possível inicializar o mapa.");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Atualizar marcadores
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap) return;

    const updateMarkers = async () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const bounds = new maplibregl.LngLatBounds();
      let hasCoords = false;

      for (const route of vehicles) {
        const { current_location, vehicle, driver, orders, color } = route;

        const routeColor = color || "#3b82f6";

        if (current_location.latitude && current_location.longitude) {
          const vEl = document.createElement("div");

          vEl.innerHTML = `
            <div style="
              background:${routeColor};
              width:30px;
              height:30px;
              border-radius:50%;
              border:2px solid #fff;
              display:flex;
              align-items:center;
              justify-content:center;
            ">
               <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            stroke-width="2"
                        >
                            <rect
                                x="1"
                                y="3"
                                width="15"
                                height="13"
                            ></rect>
                            <polygon
                                points="16 8 20 8 23 11 23 16 16 16 16 8"
                            ></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
            </div>
          `;

          const vMarker = new maplibregl.Marker({
            element: vEl,
          })
            .setLngLat([
              current_location.longitude,
              current_location.latitude,
            ])
            .addTo(currentMap);

          markersRef.current.push(vMarker);

          bounds.extend([
            current_location.longitude,
            current_location.latitude,
          ]);

          hasCoords = true;

          orders.forEach(async (order, i ,array) => {
            if (!order.latitude || !order.longitude || order.status == "entregue") return;

            const pEl = document.createElement("div");

            pEl.innerHTML = `
                <div
                    style="
                        background:${routeColor};
                        width:20px;
                        height:20px;
                        border-radius:50%;
                        border:2px solid #fff;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        box-shadow:0 2px 4px rgba(0,0,0,0.3);
                    "
                >
                    <span
                        style="
                            color:#fff;
                            font-size:10px;
                            font-weight:bold;
                        "
                    >
                        P
                    </span>
                </div>
            `;

            const pPopup = new maplibregl.Popup({
                offset: 15
            }).setHTML(`
                <div style="padding:5px;">
                    <b>Pedido #${order.order_number}</b><br/>
                    <small>${order.address}</small>
                </div>
            `);

            const pMarker = new maplibregl.Marker({
                element: pEl
            })
                .setLngLat([
                    order.longitude,
                    order.latitude
                ])
                .setPopup(pPopup)
                .addTo(currentMap);

            markersRef.current.push(pMarker);

            bounds.extend([
                order.longitude,
                order.latitude
            ]);

            let routecoord;

            
            try {
              let coordinates: [[current_location.longitude, current_location.latitude]]
              const response = await fetch(
                "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
                {
                  method: "POST",
                  headers: {
                    Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    coordinates
                  }),
                }
              );

              routecoord = await response.json();
            } catch (e) {
              console.error(e);
            }

            const routeId = `route-${vehicle.id}`;

            const source = map.current?.getSource(routeId);

            if (!source) {
              map.current?.addSource(routeId, {
                type: "geojson",
                data: routecoord,
              });

              map.current?.addLayer({
                id: routeId,
                type: "line",
                source: routeId,
                paint: {
                  "line-color": color,
                  "line-width": 5,
                },
              });
            } else {
              (source as maplibregl.GeoJSONSource).setData(routecoord);
            }

          });
        }
      }

          if (hasCoords) {
            currentMap.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15,
            });
          }
        };

    if (currentMap.loaded()) {
      updateMarkers();
    } else {
      currentMap.once("load", () => {
        updateMarkers();
      });
    }
  }, [vehicles]);

  return (
    <Card className="p-6 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Rastreamento em Tempo Real</h2>
        <div className="flex gap-3 text-xs font-medium">
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-full bg-blue-500"></i> Veículo</span>
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded-full bg-red-500"></i> Entrega</span>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '450px', background: '#f8fafc' }}
        className="rounded-xl border border-slate-200 overflow-hidden"
      >
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10 p-4 text-center">
            <p className="text-red-500 font-medium">{mapError}</p>
          </div>
        )}
      </div>

      {!loading && vehicles.length === 0 && (
        <p className="mt-4 text-center text-slate-500 text-sm italic">Nenhum veículo em rota ativa.</p>
      )}
    </Card>
  );
}
