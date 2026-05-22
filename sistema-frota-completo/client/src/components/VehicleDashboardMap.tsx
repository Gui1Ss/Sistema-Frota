import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

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
  vehicle: Vehicle;
  driver: Driver;
  current_location: CurrentLocation;
  orders: Order[];
}

const DEFAULT_CENTER: [number, number] = [-51.9253, -14.2350]; // Centro do Brasil

export default function VehicleDashboardMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [vehicles, setVehicles] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Buscar dados do mapa
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await api.get("/dashboard/vehicle-map");
        setVehicles(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do mapa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
    const interval = setInterval(fetchMapData, 10000); // Atualizar a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: DEFAULT_CENTER,
      zoom: 4,
    } );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Atualizar marcadores quando os dados mudam ou o mapa carrega
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || !mapLoaded) return;

    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;

    vehicles.forEach((route) => {
      const { current_location, vehicle, driver, orders } = route;

      if (current_location.latitude && current_location.longitude) {
        // Marcador do veículo
        const vehicleMarkerElement = document.createElement("div");
        vehicleMarkerElement.className = "vehicle-marker";
        vehicleMarkerElement.innerHTML = `
          <div class="vehicle-marker-icon" style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        `;

        const vehiclePopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div class="vehicle-popup p-2">
            <h3 class="font-bold text-sm border-b mb-1">${vehicle.name}</h3>
            <p class="text-xs"><strong>Placa:</strong> ${vehicle.plate}</p>
            <p class="text-xs"><strong>Motorista:</strong> ${driver.name}</p>
            <p class="text-xs"><strong>Pedidos:</strong> ${orders.length}</p>
          </div>
        `);

        const vehicleMarker = new maplibregl.Marker({ element: vehicleMarkerElement })
          .setLngLat([current_location.longitude, current_location.latitude])
          .setPopup(vehiclePopup)
          .addTo(currentMap);

        markersRef.current.push(vehicleMarker);
        bounds.extend([current_location.longitude, current_location.latitude]);
        hasCoords = true;

        // Marcadores de entrega
        orders.forEach((order) => {
          if (!order.latitude || !order.longitude) return;

          const deliveryMarkerElement = document.createElement("div");
          deliveryMarkerElement.className = "delivery-marker";
          deliveryMarkerElement.innerHTML = `
            <div class="delivery-marker-icon" style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              <span style="color: white; font-size: 12px; font-weight: bold;">P</span>
            </div>
          `;

          const deliveryPopup = new maplibregl.Popup({ offset: 15 }).setHTML(`
            <div class="delivery-popup p-2">
              <h4 class="font-bold text-sm border-b mb-1">Pedido #${order.order_number}</h4>
              <p class="text-xs">${order.address}</p>
              <p class="text-xs"><strong>Status:</strong> ${order.status}</p>
            </div>
          `);

          const deliveryMarker = new maplibregl.Marker({ element: deliveryMarkerElement })
            .setLngLat([order.longitude, order.latitude])
            .setPopup(deliveryPopup)
            .addTo(currentMap);

          markersRef.current.push(deliveryMarker);
          bounds.extend([order.longitude, order.latitude]);
        });
      }
    });

    if (hasCoords && vehicles.length > 0) {
      currentMap.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [vehicles, mapLoaded]);

  if (loading) {
    return (
      <Card className="p-6 mb-6">
        <div className="h-96 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed">
          <p className="text-slate-400 animate-pulse">Carregando dados do mapa...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 shadow-md border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Rastreamento em Tempo Real</h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span>Veículo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></div>
            <span>Ponto de Entrega</span>
          </div>
        </div>
      </div>
      
      <div
        ref={mapContainer}
        className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 shadow-inner"
      />
      
      {!loading && vehicles.length === 0 && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
          <p className="text-slate-500 text-sm italic">Nenhum veículo em rota para exibição no mapa.</p>
        </div>
      )}
    </Card>
  );
}
