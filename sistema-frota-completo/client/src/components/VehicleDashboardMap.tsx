import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { LngLatBounds, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, Truck } from "lucide-react";

interface VehicleMapItem {
  routeid: number;
  status: string;
  vehicle?: {
    id?: number | null;
    name?: string | null;
    plate?: string | null;
    type?: string | null;
    capacity?: number | null;
    status?: string | null;
  };
  driver?: {
    id?: number | null;
    name?: string | null;
    phone?: string | null;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp?: string;
  };
  destination?: {
    address?: string | null;
    number?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface RouteLineFeature {
  type: "Feature";
  properties: {
    routeid: number;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505];

function buildAddress(destination?: VehicleMapItem["destination"]) {
  if (!destination) return "";

  return [
    destination.address,
    destination.number,
    destination.district,
    destination.city,
    destination.state,
    destination.zipcode,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");
}

async function geocodeDestination(item: VehicleMapItem): Promise<[number, number] | null> {
  if (item.destination?.latitude && item.destination?.longitude) {
    return [item.destination.longitude, item.destination.latitude];
  }

  const address = buildAddress(item.destination);
  if (!address) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    const firstResult = data?.[0];

    if (!firstResult?.lat || !firstResult?.lon) return null;

    const latitude = Number(firstResult.lat);
    const longitude = Number(firstResult.lon);

    api.put(`/routes/${item.routeid}`, {
      deliverylatitude: latitude,
      deliverylongitude: longitude,
    }).catch((error) => {
      console.warn("Não foi possível salvar coordenadas geocodificadas da rota", error);
    });

    return [longitude, latitude];
  } catch (error) {
    console.warn("Não foi possível geocodificar o destino da entrega", error);
    return null;
  }
}

async function getRouteLine(origin: [number, number], destination: [number, number]) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    return data?.routes?.[0]?.geometry?.coordinates ?? [origin, destination];
  } catch (error) {
    console.warn("Não foi possível calcular a rota no mapa", error);
    return [origin, destination];
  }
}

function createVehicleMarkerElement() {
  const element = document.createElement("div");
  element.className = "vehicle-map-marker";
  element.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-5l-3-5h-5v10h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  `;
  return element;
}

function createDestinationMarkerElement() {
  const element = document.createElement("div");
  element.className = "destination-map-marker";
  element.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  `;
  return element;
}

export default function VehicleDashboardMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeVehicleCount = useMemo(() => vehicles.length, [vehicles]);

  useEffect(() => {
    let isMounted = true;

    async function loadVehicles() {
      try {
        const response = await api.get("/dashboard/vehicle-map");
        if (isMounted) {
          setVehicles(response.data || []);
          setLoadError(null);
        }
      } catch (error) {
        console.error("Erro ao buscar veículos para o mapa", error);
        if (isMounted) {
          setVehicles([]);
          setLoadError("Não foi possível carregar os veículos em rota no mapa.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadVehicles();
    const interval = window.setInterval(loadVehicles, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      center: DEFAULT_CENTER,
      zoom: 10,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const currentMap = map;

    async function updateMap() {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const routeFeatures: RouteLineFeature[] = [];
      const bounds = new LngLatBounds();

      for (const item of vehicles) {
        if (!item.currentLocation?.latitude || !item.currentLocation?.longitude) continue;

        const currentCoordinate: [number, number] = [
          item.currentLocation.longitude,
          item.currentLocation.latitude,
        ];
        const destinationCoordinate = await geocodeDestination(item);
        const destinationAddress = buildAddress(item.destination) || "Destino não informado";
        const vehicleName = item.vehicle?.name || "Veículo sem nome";
        const vehiclePlate = item.vehicle?.plate || "Placa não informada";
        const driverName = item.driver?.name || "Motorista não informado";
        const lastUpdate = item.currentLocation.timestamp
          ? new Date(item.currentLocation.timestamp).toLocaleString("pt-BR")
          : "Sem horário informado";

        const popup = new Popup({ offset: 18, closeButton: false }).setHTML(`
          <div class="vehicle-map-popup">
            <strong>${vehicleName}</strong>
            <span>Placa: ${vehiclePlate}</span>
            <span>Motorista: ${driverName}</span>
            <span>Rota: #${item.routeid}</span>
            <span>Destino: ${destinationAddress}</span>
            <span>Última posição: ${lastUpdate}</span>
          </div>
        `);

        const markerElement = createVehicleMarkerElement();
        markerElement.addEventListener("mouseenter", () => popup.addTo(currentMap));
        markerElement.addEventListener("mouseleave", () => popup.remove());

        const vehicleMarker = new Marker({ element: markerElement, anchor: "center" })
          .setLngLat(currentCoordinate)
          .setPopup(popup)
          .addTo(currentMap);

        markersRef.current.push(vehicleMarker);
        bounds.extend(currentCoordinate);

        if (destinationCoordinate) {
          const destinationPopup = new Popup({ offset: 16, closeButton: false }).setHTML(`
            <div class="vehicle-map-popup">
              <strong>Destino da rota #${item.routeid}</strong>
              <span>${destinationAddress}</span>
            </div>
          `);
          const destinationElement = createDestinationMarkerElement();
          destinationElement.addEventListener("mouseenter", () => destinationPopup.addTo(currentMap));
          destinationElement.addEventListener("mouseleave", () => destinationPopup.remove());

          const destinationMarker = new Marker({ element: destinationElement, anchor: "bottom" })
            .setLngLat(destinationCoordinate)
            .setPopup(destinationPopup)
            .addTo(currentMap);

          markersRef.current.push(destinationMarker);
          bounds.extend(destinationCoordinate);

          const coordinates = await getRouteLine(currentCoordinate, destinationCoordinate);
          routeFeatures.push({
            type: "Feature",
            properties: { routeid: item.routeid },
            geometry: {
              type: "LineString",
              coordinates,
            },
          });
        }
      }

      const applyRouteLayer = () => {
        const source = currentMap.getSource("vehicle-route-lines") as maplibregl.GeoJSONSource | undefined;
        const geojson = {
          type: "FeatureCollection" as const,
          features: routeFeatures,
        };

        if (source) {
          source.setData(geojson);
        } else {
          currentMap.addSource("vehicle-route-lines", {
            type: "geojson",
            data: geojson,
          });
          currentMap.addLayer({
            id: "vehicle-route-lines",
            type: "line",
            source: "vehicle-route-lines",
            paint: {
              "line-color": "#2563eb",
              "line-width": 4,
              "line-opacity": 0.75,
            },
          });
        }
      };

      if (currentMap.loaded()) {
        applyRouteLayer();
      } else {
        currentMap.once("load", applyRouteLayer);
      }

      if (!bounds.isEmpty()) {
        currentMap.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 800 });
      } else {
        currentMap.setCenter(DEFAULT_CENTER);
        currentMap.setZoom(10);
      }
    }

    updateMap();
  }, [vehicles]);

  return (
    <Card className="overflow-hidden border-slate-200">
      <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            <Navigation size={16} /> Mapa operacional
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Veículos em rota agora</h2>
          <p className="mt-1 text-sm text-slate-600">
            Acompanhe a posição atual dos veículos em entrega, o motorista responsável e a rota até o destino cadastrado.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-blue-800">
          <Truck size={22} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide">Em entrega</p>
            <p className="text-2xl font-bold">{isLoading ? "--" : activeVehicleCount}</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mx-6 mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {loadError}
        </div>
      )}

      <div className="relative h-[420px] w-full bg-slate-100">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <div className="w-full max-w-xl px-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-4 h-64 w-full" />
            </div>
          </div>
        )}
        {!isLoading && activeVehicleCount === 0 && (
          <div className="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/95 p-5 text-center shadow-lg">
            <MapPin className="mx-auto text-slate-400" size={32} />
            <h3 className="mt-3 font-semibold text-slate-900">Nenhum veículo em rota com GPS</h3>
            <p className="mt-1 text-sm text-slate-600">
              O mapa exibirá veículos quando houver rotas com status “Em Entrega” e registros em gps_tracking.
            </p>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
    </Card>
  );
}
