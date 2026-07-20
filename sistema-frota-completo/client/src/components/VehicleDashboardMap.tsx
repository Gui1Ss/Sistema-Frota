import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Geometry, GeoJSON, GeoJsonProperties } from "geojson";
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

interface CarStatus {
  trackerId: number;
  latitude: number;
  longitude: number;
  time: string;
  lastCommunication: string;
  speed: number;
}

interface Order {
  id: number;
  order_number: string;
  address: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  status: string;
  reason?: string;
}

interface RouteData {
  route_id: number;
  color?: string;
  vehicle: Vehicle;
  driver: Driver;
  car_status: CarStatus;
  route_source: GeoJSON;
  orders: Order[];
}

const DEFAULT_CENTER: [number, number] = [-46.6333, -23.5505]; // São Paulo como padrão

export default function VehicleDashboardMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const routesRef = useRef<string[]>([]);
  const hasInitialFit = useRef<boolean>(false);
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
    const interval = setInterval(fetchMapData, 25000);
    return () => clearInterval(interval);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        // Usando um estilo mais estável e público
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        zoom: 8,
        center: [-46.72465508007273, -23.44260722147917],
      });

      map.current.on("error", e => {
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
      markersRef.current.forEach(marker => marker.remove());
      routesRef.current.forEach(routeId => {
        if (map.current?.getLayer(routeId)) {
          map.current.removeLayer(routeId);
        }

        if (map.current?.getSource(routeId)) {
          map.current.removeSource(routeId);
        }
      });

      routesRef.current = [];
      markersRef.current = [];

      const bounds = new maplibregl.LngLatBounds();
      let hasCoords = false;

      for (const [index, route] of vehicles.entries()) {
        const {
          car_status,
          vehicle,
          driver,
          orders,
          color,
          route_id,
          route_source,
        } = route;

        const routeColor = color || "#3b82f6";

        if (car_status.latitude && car_status.longitude) {
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

          const routeId = `route-${vehicle.id}`;
          const source = map.current?.getSource(routeId);
          console.log(route_source);
          // Traça a rota

          // Se ele tá andando ou ainda não foi setado o caminho
          // Ele faz as requisições as api e seta a rota

          if (!source) {
            map.current?.addSource(routeId, {
              type: "geojson",
              data: route_source,
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
            routesRef.current.push(routeId);
          } else {
            (source as maplibregl.GeoJSONSource).setData(route_source);
          }

          const cPopup = new maplibregl.Popup({
            offset: 15,
          }).setHTML(`
                <div style="padding:10px;">
                    <b>Rota# ${route_id}</b><br/>
                    <small>Id Veiculo ${vehicle.id}</small><br/>
                    <small>Veiculo: ${vehicle.name}</small><br/>
                    <small>Placa ${vehicle.plate}</small>
                </div>
            `);

          const vMarker = new maplibregl.Marker({
            element: vEl,
          })
            .setLngLat([car_status.longitude, car_status.latitude])
            .setPopup(cPopup)
            .addTo(currentMap);

          markersRef.current.push(vMarker);

          bounds.extend([car_status.longitude, car_status.latitude]);

          hasCoords = true;
        }

        orders.forEach(async (order, i, array) => {
          if (!order.latitude || !order.longitude || order.status == "entregue")
            return;

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
            offset: 15,
          }).setHTML(`
                <div style="padding:5px;">
                    ${order.order_number ? `<b>Nota #${order.order_number}</b>` : `<b>${order.reason}</b>`}
                    <br/>
                    <small>${order.address}</small>
                </div>
            `);

          const pMarker = new maplibregl.Marker({
            element: pEl,
          })
            .setLngLat([order.longitude, order.latitude])
            .setPopup(pPopup)
            .addTo(currentMap);

          markersRef.current.push(pMarker);

          bounds.extend([order.longitude, order.latitude]);
        });

        // console.log(rotaMapa)

        // const routeId = `route-${vehicle.id}`;
        // const source = map.current?.getSource(routeId);

        // if(car_status.speed == 0 && !source){
        //     console.log("id do 'veiculo': "+vehicle.id)

        //     // const source = map.current?.getSource(routeId);

        //     if (!source) {
        //       map.current?.addSource(routeId, {
        //         type: "geojson",
        //         data: rotaMapa[index],
        //       });

        //       map.current?.addLayer({
        //         id: routeId,
        //         type: "line",
        //         source: routeId,
        //         paint: {
        //           "line-color": color,
        //           "line-width": 5,
        //         },
        //       });
        //   }else{
        //     let coordinatesOpt: {
        //       id: number;
        //       location: number[];
        //     }[] = []
        //     orders.forEach((e, i)=> e.status!="entregue" ? coordinatesOpt.push({ id: i, location: [e.longitude || 0,e.latitude || 0]}) : "")
        //     const payload = {
        //       jobs: coordinatesOpt,
        //       vehicles: [
        //         {
        //           id: index,
        //           profile: "driving-hgv",
        //           start: [car_status.longitude, car_status.latitude]
        //         }
        //       ]
        //     }
        //     // let coordinates=[[car_status.longitude, car_status.latitude]]
        //     try {
        //       const response = await fetch(
        //         "https://api.openrouteservice.org/optimization",
        //         {
        //           method: "POST",
        //           headers: {
        //             Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
        //             "Content-Type": "application/json",
        //           },
        //           body: JSON.stringify(payload),
        //         }
        //       );

        //       const rotasotimizadas = await response.json();
        //       // console.log(rotasotimizadas)
        //       // console.log(rotasotimizadas)
        //       let coordinates:any[] = []
        //       rotasotimizadas.routes[0].steps.forEach((e: any)=> coordinates.push([e.location[0], e.location[1]]))
        //       const rotasresponse = await fetch(
        //         "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
        //         {
        //           method: "POST",
        //           headers: {
        //             Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
        //             "Content-Type": "application/json",
        //           },
        //           body: JSON.stringify({
        //             coordinates
        //           }),
        //         }
        //       );
        //       routecoord = await rotasresponse.json();
        //       let rotas = rotaMapa
        //       rotas[index] = routecoord
        //       setRotaMapa(rotas)
        //       // console.log(rotaMapa)
        //     } catch (e) {
        //       console.error(e);
        //     }

        //     const routeId = `route-${vehicle.id}`;

        //     const source = map.current?.getSource(routeId);

        //     if (!source) {
        //       map.current?.addSource(routeId, {
        //         type: "geojson",
        //         data: routecoord,
        //       });

        //       map.current?.addLayer({
        //         id: routeId,
        //         type: "line",
        //         source: routeId,
        //         paint: {
        //           "line-color": color,
        //           "line-width": 5,
        //         },
        //       });
        //     } else {
        //       (source as maplibregl.GeoJSONSource).setData(routecoord);
        //     }

        //   }
        // }else{
        //   // const localAtual = [...localAntigo];
        //   // localAtual.push([car_status.latitude, car_status.longitude])
        //   // setLocalAntigo(localAtual)

        //   console.log("Primeiras rotas")

        //   let coordinatesOpt: {
        //       id: number;
        //       location: number[];
        //     }[] = []
        //     orders.forEach((e, i)=> e.status!="entregue" ? coordinatesOpt.push({ id: i, location: [e.longitude || 0,e.latitude || 0]}) : "")
        //     const payload = {
        //       jobs: coordinatesOpt,
        //       vehicles: [
        //         {
        //           id: index,
        //           profile: "driving-hgv",
        //           start: [car_status.longitude, car_status.latitude]
        //         }
        //       ]
        //     }
        //     // let coordinates=[[car_status.longitude, car_status.latitude]]
        //     try {
        //       const response = await fetch(
        //         "https://api.openrouteservice.org/optimization",
        //         {
        //           method: "POST",
        //           headers: {
        //             Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
        //             "Content-Type": "application/json",
        //           },
        //           body: JSON.stringify(payload),
        //         }
        //       );

        //       const rotasotimizadas = await response.json();
        //       console.log(rotasotimizadas)
        //       let coordinates:any[] = []
        //       rotasotimizadas.routes[0].steps.forEach((e: any)=> e.type!="end" ? coordinates.push([e.location[0], e.location[1]]):"")
        //       console.log(JSON.stringify({coordinates}))
        //       const rotasresponse = await fetch(
        //         "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
        //         {
        //           method: "POST",
        //           headers: {
        //             Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNhYjZiZTQ3OTgzYTQ4YTRhYzcxMmYyMTNjOTY3MmQ2IiwiaCI6Im11cm11cjY0In0=",
        //             "Content-Type": "application/json",
        //           },
        //           body: JSON.stringify({
        //             coordinates
        //           }),
        //         }
        //       );
        //       routecoord = await rotasresponse.json();
        //       let rotas = rotaMapa
        //       rotas[index] = routecoord
        //       setRotaMapa(rotas)
        //       // console.log(rotaMapa)
        //     } catch (e) {
        //       console.error(e);
        //     }

        //     const routeId = `route-${vehicle.id}`;

        //     const source = map.current?.getSource(routeId);

        //     if (!source) {
        //       map.current?.addSource(routeId, {
        //         type: "geojson",
        //         data: routecoord,
        //       });

        //       map.current?.addLayer({
        //         id: routeId,
        //         type: "line",
        //         source: routeId,
        //         paint: {
        //           "line-color": color,
        //           "line-width": 5,
        //         },
        //       });
        //     } else {
        //       (source as maplibregl.GeoJSONSource).setData(routecoord);
        //     }
        //   }
        console.log("\n\n\n\n");
      }

      const vEl = document.createElement("div");

      vEl.innerHTML = `
            <div style="
              width:40px;
              height:40px;
              display:flex;
              align-items:center;
              justify-content:center;
              z-index: 99;
            ">
              <svg xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" width="89.615799" height="84.933952" viewBox="0 0 23.710845 22.472108" version="1.1" id="svg1" inkscape:version="1.4.2 (f4327f4, 2025-05-13)" sodipodi:docname="point.svg">
                <sodipodi:namedview id="namedview1" pagecolor="#ffffff" bordercolor="#000000" borderopacity="0.25" inkscape:showpageshadow="2" inkscape:pageopacity="0.0" inkscape:pagecheckerboard="0" inkscape:deskcolor="#d1d1d1" inkscape:document-units="mm" inkscape:zoom="0.76353002" inkscape:cx="-161.09386" inkscape:cy="242.9505" inkscape:window-width="1366" inkscape:window-height="705" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:current-layer="svg1"/>
                <defs id="defs1">
                  <inkscape:path-effect effect="perspective-envelope" up_left_point="135.13015,103.13216" up_right_point="190.46217,103.10396" down_left_point="74.825189,139.8029" down_right_point="141.84243,139.8029" id="path-effect15" is_visible="true" lpeversion="1" deform_type="perspective" horizontal_mirror="false" vertical_mirror="false" overflow_perspective="false"/>
                  <inkscape:path-effect effect="perspective-envelope" up_left_point="64.858944,44.24" up_right_point="133.80173,43.40752" down_left_point="91.162473,131.86324" down_right_point="130.87912,149.60768" id="path-effect14" is_visible="true" lpeversion="1" deform_type="perspective" horizontal_mirror="false" vertical_mirror="false" overflow_perspective="false"/>
                  <inkscape:path-effect effect="perspective-envelope" up_left_point="64.858944,44.24" up_right_point="133.80173,43.40752" down_left_point="91.162473,131.86324" down_right_point="130.87912,149.60768" id="path-effect6" is_visible="true" lpeversion="1" deform_type="perspective" horizontal_mirror="false" vertical_mirror="false" overflow_perspective="false"/>
                  <inkscape:path-effect effect="perspective-envelope" up_left_point="64.858944,44.24" up_right_point="133.80173,43.40752" down_left_point="91.162473,131.86324" down_right_point="130.87912,149.60768" id="path-effect4" is_visible="true" lpeversion="1" deform_type="perspective" horizontal_mirror="false" vertical_mirror="false" overflow_perspective="false"/>
                  <inkscape:path-effect effect="perspective-envelope" up_left_point="69.66,48.417716" up_right_point="127.53899,48.417716" down_left_point="70.264445,131.44572" down_right_point="127.53899,131.44572" id="path-effect3" is_visible="true" lpeversion="1" deform_type="perspective" horizontal_mirror="false" vertical_mirror="false" overflow_perspective="false"/>
                </defs>
                <g id="g13" transform="matrix(0.24764817,0.02421011,-0.02637344,0.22733419,-16.628098,-11.947367)" inkscape:path-effect="#path-effect15" style="fill:#000000">
                  <path id="path9" style="display:inline;fill:#000000;fill-opacity:0.403084;stroke-width:0.264583" d="m 149.99147,108.80053 c -2.20802,0.0693 -8.5175,0.31214 -14.12752,0.95722 -13.66104,1.18463 -27.99608,7.76617 -34.13641,14.69435 -1.22136,1.37814 -2.107082,2.74449 -2.641415,4.05654 -2.193247,3.18976 -1.732575,14.79819 -1.626725,18.85777 l -5.25e-4,4.5e-4 -5.24e-4,4.5e-4 0.0014,-6e-5 0.0014,-6e-5 c 0.205307,-0.0399 7.054497,-1.37108 16.346347,-3.37534 0.001,-0.001 0.003,-0.004 0.005,-0.005 8.4519,-2.01861 25.83735,-7.19269 34.52503,-11.12478 4.0363,-1.54092 7.76382,-3.47116 10.82457,-5.65779 13.03705,-9.31397 9.37165,-18.52161 -7.64073,-18.43684 -0.23227,0.001 -0.46467,0.0102 -0.69699,0.0148 l -0.0163,-0.005 c 0,0 -0.29324,0.007 -0.81578,0.023 z m -16.4617,9.14661 c 5.19118,1.07945 5.7706,4.82036 0.82426,8.73182 -1.54116,1.21872 -3.4187,2.28235 -5.45143,3.1512 -16.45239,1.88328 -9.08931,-8.79898 4.78501,-11.81981 -0.0428,-0.0221 -0.0964,-0.0429 -0.15784,-0.0632 z" transform="matrix(0.94476833,0,0,0.9503428,16.840221,-0.24656237)" inkscape:original-d="m 91.46907,44.001368 c -2.547807,0.221613 -9.733939,0.998993 -15.284927,3.072663 -14.121246,3.765894 -18.136132,23.931696 -12.076917,43.718373 1.15494,3.771329 2.642496,7.459306 4.397934,10.953796 3.210391,8.30779 22.696564,36.47176 28.969663,45.61832 l 1.49e-4,0.001 1.5e-4,0.001 0.0013,-1.3e-4 0.0013,-1.4e-4 c 0.145891,-0.0882 5.041708,-3.05079 11.488988,-7.57914 -6.7e-4,-0.003 -0.002,-0.008 -0.002,-0.011 5.68505,-4.64558 16.26165,-16.95898 19.81384,-26.72987 2.10991,-3.93088 3.35291,-8.9398 3.51232,-14.731199 0.71959,-26.152647 -18.55635,-54.665833 -39.027827,-54.418173 -0.279432,0.0034 -0.544642,0.03228 -0.817716,0.04703 l -0.02917,-0.01668 c 0,0 -0.34337,0.02092 -0.946586,0.07339 z m -2.975831,28.283934 c 7.854054,3.168292 14.803421,13.857587 15.665061,24.600386 0.26162,3.261772 -0.0935,6.075982 -0.92285,8.352662 -14.740756,4.86241 -24.958947,-24.024355 -14.448431,-32.766692 -0.08837,-0.06518 -0.18701,-0.126472 -0.29378,-0.186356 z"/>
                </g>
                <g inkscape:label="Camada 1" inkscape:groupmode="layer" id="layer1" transform="translate(-37.365789,-42.055353)"/>
                <g id="g9" transform="matrix(0.24764817,0.02421011,-0.02637344,0.22733419,-16.628098,-11.947367)">
                  <path id="path4" style="display:inline;fill:#aa4c00;fill-opacity:1;stroke-width:0.264583" d="m 93.262012,43.89723 c -16.900001,0.204245 -22.172221,21.39108 -15.855701,42.139707 1.090685,3.582523 2.495622,7.08635 4.153179,10.406055 a 23.594254,13.100682 75.760318 0 1 -1.342276,-4.324573 23.594254,13.100682 75.760318 0 1 6.935639,-26.048034 23.594254,13.100682 75.760318 0 1 7.384704,1.642718 c 0.830403,-0.163765 1.726163,-0.200816 2.682911,-0.09733 8.648202,0.935399 17.094372,12.540384 18.025002,24.211735 0.75798,9.505842 -3.95742,15.012672 -10.30008,14.049832 a 23.594254,13.100682 75.760318 0 1 -6.241527,5.94608 23.594254,13.100682 75.760318 0 1 -12.539394,-6.69431 c 6.719296,11.26923 18.298951,28.11782 22.768911,34.6738 5.67747,-4.62589 16.28554,-16.96775 19.84424,-26.75656 2.10991,-3.93088 3.35381,-8.93922 3.51322,-14.730623 C 133.01043,72.16308 113.73349,43.64957 93.262012,43.89723 Z" transform="matrix(0.94476833,0,0,0.9503428,16.840221,-0.24656237)"/>
                  <path style="display:inline;fill:#aa4c00;fill-opacity:1;stroke-width:0.264583" d="m 84.695251,46.599516 c 5.827438,-4.248421 19.456389,-5.099964 19.456389,-5.099964 l 11.98008,7.154004 c 0,0 -21.334423,-1.094104 -24.870301,-0.823695 -1.082097,0.08276 -6.566168,-1.230345 -6.566168,-1.230345 z" id="path6" sodipodi:nodetypes="cccsc"/>
                  <path style="display:inline;fill:#aa4c00;fill-opacity:1;stroke-width:0.264583" d="m 119.78841,132.59929 c -6.18425,4.36924 -10.85745,7.20478 -10.85745,7.20478 -0.0204,-0.14251 7.98498,-8.84973 9.30908,-9.6839 2.12375,-1.33795 1.19743,0.74662 1.54837,2.47912 z" id="path7" sodipodi:nodetypes="ccsc"/>
                  <path id="path1" style="fill:#d48900;fill-opacity:1;stroke-width:0.264583" d="M 93.262153,43.897033 C 76.362152,44.101278 71.089891,65.28819 77.406412,86.036818 c 1.091151,3.584055 2.496764,7.089552 4.155246,10.41052 3.033418,7.896142 21.447512,34.666362 27.371992,43.355632 5.67746,-4.62589 16.2853,-16.96775 19.844,-26.75656 2.1099,-3.93089 3.3536,-8.93924 3.51301,-14.730653 0.71959,-26.152642 -18.55703,-54.666384 -39.028507,-54.418724 z m 3.958095,23.718556 c 8.648202,0.935399 17.094542,12.540729 18.025162,24.21208 0.81251,10.189681 -4.66409,15.784201 -11.69268,13.740601 -6.575732,-1.91194 -13.239856,-10.182326 -15.4752,-19.481896 -2.516881,-10.470841 1.190006,-19.33095 9.142718,-18.470785 z" inkscape:path-effect="#path-effect4" inkscape:original-d="m 98.599232,48.417716 c -15.982658,9.2e-5 -28.844969,12.935493 -28.729318,28.834276 0.02299,3.149268 0.565487,6.274605 1.605189,9.251059 1.155604,7.798085 20.028322,34.908439 26.902355,44.942669 9.286382,-11.17133 22.832412,-31.36968 26.368622,-41.86895 1.8383,-3.846246 2.79288,-8.056409 2.79291,-12.324778 -9e-5,-15.898988 -12.95689,-28.834475 -28.939758,-28.834276 z m 0.04633,12.584824 c 7.896488,1.48e-4 14.309478,6.386355 14.323788,14.249855 0.0143,7.84772 -6.35226,14.198119 -14.220238,14.198267 -7.868185,1.4e-4 -14.28128,-6.350343 -14.324128,-14.198267 -0.04293,-7.863705 6.323888,-14.249997 14.220578,-14.249855 z" sodipodi:nodetypes="cccccccsssss"/>
                  <path id="path8" style="fill:#aa4c00;fill-opacity:1;stroke-width:0.245086" d="m 61.020964,101.21645 c -1.065376,-0.47057 -2.163586,-0.70897 -3.266565,-0.70911 -6.970736,-2e-5 -12.152076,9.23673 -12.152008,20.72425 -10e-7,11.48732 5.650749,20.79968 12.621364,20.79983 2.557917,-0.0151 5.052686,-1.31057 7.153753,-3.71487 -14.910549,-1.25518 -12.865923,-30.57421 -0.368658,-34.02707 -0.661157,-1.16058 -2.885679,-2.58234 -3.987886,-3.07303 z" transform="matrix(0.90959996,-0.41548515,0.39880838,0.91703428,0,0)" sodipodi:nodetypes="ccccccc"/>
                </g>
              </svg>
            </div>
          `;

      const cPopup = new maplibregl.Popup({
        offset: 15,
      }).setHTML(`
              <div style="padding:10px;">
                  <b> Salutem </b><br/>
              </div>
          `);

      const vMarker = new maplibregl.Marker({
        element: vEl,
      })
        .setLngLat([-46.72459070393538, -23.442764712692618])
        .setPopup(cPopup)
        .addTo(currentMap);

      markersRef.current.push(vMarker);

      bounds.extend([-46.72459070393538, -23.442764712692618]);

      // 👇 Substitua o seu if (hasCoords) antigo por este bloco:
      if (hasCoords && !hasInitialFit.current) {
        currentMap.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });

        // Atribui true para que nas próximas requisições de 10s ele ignore o fitBounds
        hasInitialFit.current = true;
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
        <h2 className="text-xl font-bold text-slate-900">
          Rastreamento em Tempo Real
        </h2>
        <div className="flex gap-3 text-xs font-medium">
          <span className="flex items-center gap-1">
            <i className="w-3 h-3 rounded-full bg-blue-500"></i> Veículo
          </span>
          <span className="flex items-center gap-1">
            <i className="w-3 h-3 rounded-full bg-red-500"></i> Entrega
          </span>
        </div>
      </div>

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "450px", background: "#f8fafc" }}
        className="rounded-xl border border-slate-200 overflow-hidden"
      >
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10 p-4 text-center">
            <p className="text-red-500 font-medium">{mapError}</p>
          </div>
        )}
      </div>

      {!loading && vehicles.length === 0 && (
        <p className="mt-4 text-center text-slate-500 text-sm italic">
          Nenhum veículo em rota ativa.
        </p>
      )}
    </Card>
  );
}
