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
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: DEFAULT_CENTER,
      zoom: 5,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Atualizar marcadores quando os dados mudam
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || !currentMap.loaded()) return;

    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    vehicles.forEach((route) => {
      const { current_location, vehicle, driver, orders } = route;

      // Criar elemento do marcador do veículo
      const vehicleMarkerElement = document.createElement("div");
      vehicleMarkerElement.className = "vehicle-marker";
      vehicleMarkerElement.innerHTML = `
        <div class="vehicle-marker-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="16" fill="#3b82f6"/>
            <path d="M16 8L20 14H12L16 8Z" fill="white"/>
            <path d="M12 14H20V22H12V14Z" fill="white"/>
          </svg>
        </div>
      `;

      // Criar popup do veículo
      const vehiclePopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="vehicle-popup">
          <h3 class="font-bold text-sm">${vehicle.name}</h3>
          <p class="text-xs text-gray-600">Placa: ${vehicle.plate}</p>
          <p class="text-xs text-gray-600">Motorista: ${driver.name}</p>
          <p class="text-xs text-gray-600">Entregas: ${orders.length}</p>
        </div>
      `);

      vehicleMarkerElement.addEventListener("mouseenter", () => {
        vehiclePopup.addTo(currentMap);
      });
      vehicleMarkerElement.addEventListener("mouseleave", () => {
        vehiclePopup.remove();
      });

      const vehicleMarker = new maplibregl.Marker({
        element: vehicleMarkerElement,
        anchor: "center",
      })
        .setLngLat([current_location.longitude, current_location.latitude])
        .setPopup(vehiclePopup)
        .addTo(currentMap);

      markersRef.current.push(vehicleMarker);

      // Adicionar marcadores de entrega
      orders.forEach((order) => {
        if (!order.latitude || !order.longitude) return;

        const deliveryMarkerElement = document.createElement("div");
        deliveryMarkerElement.className = "delivery-marker";
        deliveryMarkerElement.innerHTML = `
          <div class="delivery-marker-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">P</text>
            </svg>
          </div>
        `;

        const deliveryPopup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div class="delivery-popup">
            <h4 class="font-bold text-sm">Pedido ${order.order_number}</h4>
            <p class="text-xs text-gray-600">${order.address}</p>
            <p class="text-xs text-gray-600">CEP: ${order.zipcode}</p>
            <p class="text-xs text-gray-600">Status: ${order.status}</p>
          </div>
        `);

        deliveryMarkerElement.addEventListener("mouseenter", () => {
          deliveryPopup.addTo(currentMap);
        });
        deliveryMarkerElement.addEventListener("mouseleave", () => {
          deliveryPopup.remove();
        });

        const deliveryMarker = new maplibregl.Marker({
          element: deliveryMarkerElement,
          anchor: "bottom",
        })
          .setLngLat([order.longitude, order.latitude])
          .setPopup(deliveryPopup)
          .addTo(currentMap);

        markersRef.current.push(deliveryMarker);
      });
    });
  }, [vehicles]);

  if (loading) {
    return (
      <Card className="p-6 mb-6">
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Carregando mapa...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Rastreamento de Veículos</h2>
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
      />
      {vehicles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum veículo em rota no momento</p>
        </div>
      )}
    </Card>
  );
}
