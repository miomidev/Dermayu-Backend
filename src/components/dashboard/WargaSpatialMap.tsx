"use client";

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import indramayuBoundaryData from "@/data/indramayuBoundary.json";
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Waves,
  Compass,
  AlertTriangle,
  Home,
  Activity,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Radio,
  X,
  Info,
  Crosshair,
  Plus,
  Minus,
  Loader2,
  Building2,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Package,
  Phone,
} from "lucide-react";
import {
  SIAGA_CONFIGS,
  type SiagaLevel,
  RingingBell3D,
  ShieldSafeIllustration,
} from "@/components/dashboard/StatusSiagaCard";
import { getActiveSession } from "@/utils/authSession";

export interface MapReportPoint {
  id: string;
  ticketCode: string;
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  waterLevelText?: string;
  status: string;
  location: string;
  lat: number;
  lng: number;
  timeAgo: string;
}

export interface MapShelterPoint {
  id: string;
  name: string;
  location: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  contactPerson: string;
  contactPhone: string;
  lat: number;
  lng: number;
  facilities: string[];
}

export interface MapTelemetryPoint {
  id: string;
  name: string;
  waterLevel: string;
  status: "NORMAL" | "WASPADA" | "SIAGA" | "AWAS";
  trend: "NAIK" | "TURUN" | "STABIL";
  lastUpdate: string;
  lat: number;
  lng: number;
}

interface WargaSpatialMapProps {
  reports?: MapReportPoint[];
  shelters?: MapShelterPoint[];
  telemetry?: MapTelemetryPoint[];
  onSelectShelter?: (shelter: MapShelterPoint) => void;
  onSelectReport?: (report: MapReportPoint) => void;
  onOpenReport?: () => void;
  onOpenContacts?: () => void;
  className?: string;
}



// Generator Custom Marker Pin Teardrop Google Maps Style
type PinType = "posko" | "genangan" | "kritis" | "sensor";

const createPinIcon = (type: PinType) => {
  const config = {
    posko: {
      bg: "bg-[#2D6A4F]",
      icon: <Home className="w-4 h-4 text-white" strokeWidth={2.5} />,
    },
    genangan: {
      bg: "bg-amber-500",
      icon: <Waves className="w-4 h-4 text-white" strokeWidth={2.5} />,
    },
    kritis: {
      bg: "bg-rose-600",
      icon: <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />,
    },
    sensor: {
      bg: "bg-sky-600",
      icon: <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />,
    },
  }[type];

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md">
      ${type === "kritis"
      ? '<span class="absolute -top-1 w-9 h-9 rounded-full bg-rose-500/40 animate-ping pointer-events-none"></span>'
      : ""
    }
      <div class="w-8 h-8 ${config.bg} rounded-full border-2 border-white shadow-md flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
        ${renderToStaticMarkup(config.icon)}
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-[2px] relative z-0"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-pin-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  });
};

// Metadata Tambahan: Foto Realistis, Rating Kesiapan, ETA, & Rute Bebas Banjir
const SHELTER_METADATA: Record<
  string,
  {
    photoUrl: string;
    rating: string;
    eta: string;
    avoidArea: string;
    routeCoordinates: [number, number][];
    emergencyNeeds: string[];
  }
> = {
  "sh-1": {
    photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga 24 Jam",
    eta: "±4 mnt",
    avoidArea: "Menghindari Genangan Jl. Pantai Eretan & Tanggul Kritis",
    routeCoordinates: [
      [-6.3490, 108.1165],
      [-6.3498, 108.1180],
      [-6.3478, 108.1210],
      [-6.3450, 108.1235],
      [-6.3420, 108.1250],
    ],
    emergencyNeeds: ["Selimut Hangat", "Obat-obatan Lansia", "Makanan Balita Siap Saji"],
  },
  "sh-2": {
    photoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga Bencana",
    eta: "±7 mnt",
    avoidArea: "Menghindari Titik Genangan Ilir & Saluran Pembuang",
    routeCoordinates: [
      [-6.3490, 108.1165],
      [-6.3502, 108.1200],
      [-6.3510, 108.1260],
      [-6.3490, 108.1320],
    ],
    emergencyNeeds: ["Air Bersih Galon", "Matras Tidur", "Paket Sanitasi"],
  },
  "sh-3": {
    photoUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
    rating: "Kapasitas Besar",
    eta: "±12 mnt",
    avoidArea: "Menghindari Jalur Rendaman Tambak & Muara Losarang",
    routeCoordinates: [
      [-6.3490, 108.1165],
      [-6.3550, 108.1250],
      [-6.3680, 108.1380],
      [-6.3880, 108.1520],
    ],
    emergencyNeeds: ["Beras & Logistik Dapur", "Pembalut & Popok", "Penerangan Cadangan"],
  },
};

export default function WargaSpatialMap({
  reports = [],
  shelters = [],
  telemetry = [],
  onSelectShelter,
  onSelectReport,
  onOpenReport,
  onOpenContacts,
  className = "",
}: WargaSpatialMapProps) {
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const reportsLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const telemetryLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);

  const [activeLayer, setActiveLayer] = useState<"ALL" | "REPORTS" | "SHELTERS" | "TELEMETRY">("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [basemap, setBasemap] = useState<"streets" | "satellite">("streets");
  const [compassHeading, setCompassHeading] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const activeRadarMarkerRef = useRef<L.Marker | null>(null);
  const activeRouteLayerRef = useRef<L.LayerGroup | null>(null);

  const [siagaExpanded, setSiagaExpanded] = useState(false);
  const [activeShelterDetail, setActiveShelterDetail] = useState<MapShelterPoint | null>(null);
  const [activeReportDetail, setActiveReportDetail] = useState<MapReportPoint | null>(null);
  const [activeTelemetryDetail, setActiveTelemetryDetail] = useState<MapTelemetryPoint | null>(null);
  const [activeNavRoute, setActiveNavRoute] = useState<{
    shelter: MapShelterPoint;
    routeDistance: string;
    routeDuration: string;
    avoidArea: string;
  } | null>(null);

  const [selectedMarker, setSelectedMarker] = useState<
    | { type: "shelter"; data: MapShelterPoint }
    | { type: "report"; data: MapReportPoint }
    | { type: "telemetry"; data: MapTelemetryPoint }
    | null
  >(null);

  const isDetailActive = Boolean(activeShelterDetail || activeReportDetail || activeTelemetryDetail);

  const [district, setDistrict] = useState("Kandanghaur");
  const [siagaLevel, setSiagaLevel] = useState<SiagaLevel>("NORMAL");

  useEffect(() => {
    try {
      const active = getActiveSession();
      if (active?.district) {
        const primary = active.district.split("-")[0]?.trim() || active.district;
        setDistrict(primary);
      }
    } catch {}
  }, []);

  const siagaConfig = SIAGA_CONFIGS[siagaLevel];

  // Indramayu center
  const defaultCenter: [number, number] = [-6.40, 108.32];
  const defaultZoom = 11;

  // Device orientation listener (rotasi kompas sesuai arah ponsel)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = (e as any).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : null);
      if (heading !== null && heading !== undefined) {
        setCompassHeading(Math.round(heading));
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
    return () => {
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
    });

    // Standard OpenStreetMap tiles (no API key required, reliable)
    const initialTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | BPBD Indramayu',
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    // 0. LAYER GEOJSON BATAS RESMI KABUPATEN INDRAMAYU (Tanpa isian warna / No Fill & Non-interaktif)
    const boundaryLayer = L.geoJSON(indramayuBoundaryData as any, {
      interactive: false,
      style: {
        fill: false,
        fillOpacity: 0,
        color: "#1B4D3E",
        weight: 2.5,
        opacity: 0.95,
        dashArray: "6, 6",
      },
    }).addTo(map);

    boundaryLayerRef.current = boundaryLayer;

    // Fit bounds saat pertama kali dimuat agar langsung fokus ke seluruh daratan Indramayu
    const bounds = boundaryLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: 12,
      });
    }

    reportsLayerRef.current = L.layerGroup().addTo(map);
    sheltersLayerRef.current = L.layerGroup().addTo(map);
    telemetryLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on("click", (e) => {
      // If clicking map background (not marker)
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest(".leaflet-marker-icon")) {
        setSelectedMarker(null);
      }
    });

    // ResizeObserver to recalibrate Leaflet on sidebar toggle / window resize
    const container = mapContainerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Layers
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !reportsLayerRef.current ||
      !sheltersLayerRef.current ||
      !telemetryLayerRef.current ||
      !routesLayerRef.current
    )
      return;

    reportsLayerRef.current.clearLayers();
    sheltersLayerRef.current.clearLayers();
    telemetryLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. PLOT FLOOD REPORTS
    if (activeLayer === "ALL" || activeLayer === "REPORTS") {
      reports.forEach((rep) => {
        const isCritical = rep.severity === "CRITICAL";
        const isHigh = rep.severity === "HIGH";
        const color = isCritical ? "#DC2626" : isHigh ? "#EA580C" : "#D97706";

        const icon = createPinIcon(isCritical ? "kritis" : "genangan");

        const popupContent = `
          <div style="font-family: inherit; width: 220px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${color}; background: #FFF1F2; padding: 2px 6px; border-radius: 6px; border: 1px solid #FECDD3;">
                ${rep.ticketCode}
              </span>
              <span style="font-size: 9px; font-weight: 700; color: #4B635F;">${rep.timeAgo}</span>
            </div>
            <div style="font-size: 12px; font-weight: 800; margin-bottom: 4px; line-height: 1.35; color: #132422;">
              ${rep.title}
            </div>
            <div style="font-size: 11px; color: #4B635F; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              📍 <span>${rep.location}</span>
            </div>
            ${rep.waterLevelText
            ? `<div style="font-size: 11px; font-weight: 700; color: #991B1B; background: #FEF2F2; padding: 4px 8px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #FEE2E2;">
                    Ketinggian Air: ${rep.waterLevelText}
                  </div>`
            : ""
          }
            <div style="font-size: 10px; color: #38746D; font-weight: 700;">
              Status: ${rep.status}
            </div>
          </div>
        `;

        const marker = L.marker([rep.lat, rep.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          setActiveReportDetail(rep);
          setActiveShelterDetail(null);
          setActiveTelemetryDetail(null);
          setSelectedMarker({ type: "report", data: rep });
          setSiagaExpanded(false);
          clearRadarGlow();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([rep.lat, rep.lng], 16, { duration: 1.2 });
          }
          if (onSelectReport) onSelectReport(rep);
        });
        reportsLayerRef.current?.addLayer(marker);
      });
    }

    // 2. PLOT SHELTERS (POSKO PENGUNGSIAN)
    if (activeLayer === "ALL" || activeLayer === "SHELTERS") {
      shelters.forEach((sh) => {
        const sisaKapasitas = sh.capacityTotal - sh.capacityFilled;
        const isFull = sh.status === "PENUH";
        const color = isFull ? "#9CA3AF" : "#059669";

        const icon = createPinIcon("posko");

        const popupContent = `
          <div style="font-family: inherit; width: 230px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #047857; background: #ECFDF5; padding: 2px 6px; border-radius: 6px; border: 1px solid #A7F3D0;">
                POSKO AMAN
              </span>
              <span style="font-size: 10px; font-weight: 700; color: ${isFull ? "#DC2626" : "#059669"};">
                ${sh.status}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 800; margin-bottom: 2px; color: #132422;">
              ${sh.name}
            </div>
            <div style="font-size: 10px; color: #4B635F; margin-bottom: 6px;">
              📍 ${sh.location} (${sh.distance})
            </div>
            <div style="font-size: 11px; background: #F8FAF9; padding: 6px 8px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 11px;">
                <span>Kapasitas:</span>
                <span style="color: #059669;">${sh.capacityFilled} / ${sh.capacityTotal} Jiwa</span>
              </div>
              <div style="font-size: 10px; color: #64748B; margin-top: 2px;">
                Tersedia ${sisaKapasitas} kuota tempat
              </div>
            </div>
            <div style="font-size: 10px; color: #1E3A8A; font-weight: 700;">
              📞 Kontak: ${sh.contactPerson} (${sh.contactPhone})
            </div>
          </div>
        `;

        const marker = L.marker([sh.lat, sh.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          handleSelectShelterItem(sh);
        });
        sheltersLayerRef.current?.addLayer(marker);
      });

      // 3. PLOT SAFE EVACUATION ROUTE POLYLINES (Eretan coast to Balai Desa & GOR)
      const safeRoute1: [number, number][] = [
        [-6.3475, 108.1189], // Titik Banjir Eretan
        [-6.3468, 108.1192], // Simpang Tanggul
        [-6.3460, 108.1195], // Balai Desa Eretan Wetan
      ];

      const polyline = L.polyline(safeRoute1, {
        color: "#059669",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.85,
      }).bindTooltip("Jalur Evakuasi Darat Bebas Air", { sticky: true });

      routesLayerRef.current?.addLayer(polyline);
    }

    // 4. PLOT TELEMETRY STATIONS
    if (activeLayer === "ALL" || activeLayer === "TELEMETRY") {
      telemetry.forEach((tel) => {
        const isWaspada = tel.status === "WASPADA" || tel.status === "SIAGA";
        const color = isWaspada ? "#D97706" : "#0284C7";

        const icon = createPinIcon("sensor");

        const popupContent = `
          <div style="font-family: inherit; width: 210px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #0284C7; background: #F0F9FF; padding: 2px 6px; border-radius: 6px; border: 1px solid #BAE6FD;">
                SENSOR TELEMETRI
              </span>
              <span style="font-size: 10px; font-weight: 800; color: ${color};">
                ${tel.status}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 800; margin-bottom: 4px; color: #132422;">
              ${tel.name}
            </div>
            <div style="font-size: 11px; background: #F8FAF9; padding: 5px 8px; border-radius: 6px; border: 1px solid #E2E8F0; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Level TMA:</span>
              <span style="font-weight: 800; color: #132422;">${tel.waterLevel}</span>
            </div>
            <div style="font-size: 10px; color: #64748B;">
              Tren: <strong>${tel.trend}</strong> • Update: ${tel.lastUpdate}
            </div>
          </div>
        `;

        const marker = L.marker([tel.lat, tel.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          setActiveTelemetryDetail(tel);
          setActiveShelterDetail(null);
          setActiveReportDetail(null);
          setSelectedMarker({ type: "telemetry", data: tel });
          setSiagaExpanded(false);
          clearRadarGlow();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([tel.lat, tel.lng], 16, { duration: 1.2 });
          }
        });
        telemetryLayerRef.current?.addLayer(marker);
      });
    }
  }, [reports, shelters, telemetry, activeLayer, onSelectReport, onSelectShelter]);


  // Radar Glow Effect pada Marker Posko yang Aktif
  const showRadarGlow = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    if (activeRadarMarkerRef.current) {
      mapInstanceRef.current.removeLayer(activeRadarMarkerRef.current);
      activeRadarMarkerRef.current = null;
    }

    const radarIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background: rgba(45, 106, 79, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 9999px; background: rgba(45, 106, 79, 0.45); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="width: 16px; height: 16px; border-radius: 9999px; background: #2D6A4F; border: 2.5px solid #ffffff; box-shadow: 0 0 12px rgba(45, 106, 79, 0.9);"></div>
        </div>
      `,
      className: "custom-radar-pulse",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lng], { icon: radarIcon, zIndexOffset: 999 }).addTo(mapInstanceRef.current);
    activeRadarMarkerRef.current = marker;
  };

  const clearRadarGlow = () => {
    if (activeRadarMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(activeRadarMarkerRef.current);
      activeRadarMarkerRef.current = null;
    }
  };

  // Bersihkan Seleksi Marker & Kembalikan ke Tampilan Posko Awal
  const clearSelection = () => {
    setActiveShelterDetail(null);
    setActiveReportDetail(null);
    setActiveTelemetryDetail(null);
    setSelectedMarker(null);
    clearRadarGlow();
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    setActiveNavRoute(null);
  };

  // Pilih Item Posko: Kamera terbang, Radar menyala, & Buka Detail Card
  const handleSelectShelterItem = (sh: MapShelterPoint) => {
    setActiveShelterDetail(sh);
    setActiveReportDetail(null);
    setActiveTelemetryDetail(null);
    setSelectedMarker({ type: "shelter", data: sh });
    setSiagaExpanded(false);
    showRadarGlow(sh.lat, sh.lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([sh.lat, sh.lng], 16, { duration: 1.2 });
    }
    if (onSelectShelter) {
      onSelectShelter(sh);
    }
  };

  // Gambar Rute Aman Evakuasi Cerdas (Menghindari Genangan/Rob)
  const drawSafeRoute = (shelter: MapShelterPoint) => {
    if (!mapInstanceRef.current) return;

    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    } else {
      activeRouteLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const meta = SHELTER_METADATA[shelter.id] || {
      avoidArea: "Menghindari Jalur Rendaman Genangan Pesisir",
      routeCoordinates: [
        [-6.3490, 108.1165],
        [shelter.lat, shelter.lng],
      ],
      photoUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
      rating: "Siaga 24 Jam",
      eta: "±5 mnt",
      emergencyNeeds: ["Logistik Dasar"],
    };

    // Sambungkan titik GPS user jika ada, atau gunakan titik awal warga evakuasi
    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : [-6.3490, 108.1165];
    const path: [number, number][] = [startCoord, ...meta.routeCoordinates.slice(1)];

    // 1. Garis Luar Pendar Putih (Border Glow)
    const glowLine = L.polyline(path, {
      color: "#ffffff",
      weight: 9,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    });

    // 2. Garis Inti Hijau Solid Tema DERMAYU (#2D6A4F)
    const coreLine = L.polyline(path, {
      color: "#2D6A4F",
      weight: 5,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    });

    // 3. Garis Aksen Putus-putus Terang
    const dashedLine = L.polyline(path, {
      color: "#6EE7B7",
      weight: 2.5,
      dashArray: "8, 12",
      opacity: 0.95,
    });

    activeRouteLayerRef.current.addLayer(glowLine);
    activeRouteLayerRef.current.addLayer(coreLine);
    activeRouteLayerRef.current.addLayer(dashedLine);

    // Kamera fokus ke seluruh panjang rute evakuasi
    const bounds = L.latLngBounds(path);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [75, 75],
      maxZoom: 16,
      animate: true,
      duration: 1.2,
    });

    setActiveNavRoute({
      shelter,
      routeDistance: shelter.distance.split("(")[0].trim() || "1.2 km",
      routeDuration: meta.eta,
      avoidArea: meta.avoidArea,
    });

    setToastMessage(`Rute Aman Terpilih: Menuju ${shelter.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearNavRoute = () => {
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    setActiveNavRoute(null);
    clearRadarGlow();
    setToastMessage("Navigasi rute evakuasi ditutup");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Recenter to Indramayu (Fit to entire administrative boundary)
  const handleRecenter = () => {
    if (mapInstanceRef.current && boundaryLayerRef.current) {
      const bounds = boundaryLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
        return;
      }
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
    }
  };

  // Quick Fly to hotspots
  const handleFlyTo = (coords: [number, number], zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 0.9 });
    }
  };

  // 1. Reset Kompas ke Arah Utara
  const handleResetCompass = () => {
    setCompassHeading(0);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(mapInstanceRef.current.getCenter(), mapInstanceRef.current.getZoom());
    }
    setToastMessage("Orientasi peta tegak lurus ke Utara (0°)");
    setTimeout(() => setToastMessage(null), 2200);
  };

  // 2. Ganti Tampilan Layer Peta (Basemap Toggle OSM <-> Satelit Esri)
  const handleToggleBasemap = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const nextBasemap = basemap === "streets" ? "satellite" : "streets";
    setBasemap(nextBasemap);

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newTile = L.tileLayer(
      nextBasemap === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          nextBasemap === "satellite"
            ? "Tiles &copy; Esri World Imagery | BPBD Indramayu"
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | BPBD Indramayu',
        maxZoom: 19,
      }
    );

    newTile.addTo(mapInstanceRef.current);
    newTile.bringToBack();
    tileLayerRef.current = newTile;

    setToastMessage(nextBasemap === "satellite" ? "Beralih ke Citra Satelit Esri" : "Beralih ke Peta Jalan OSM");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 3. Zoom In & Zoom Out
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // 4. Deteksi Lokasi Saya (GPS Geolocation)
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      setToastMessage("Fitur GPS lokasi tidak didukung pada peramban ini.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Geser kamera langsung terpusat ke lokasi pengguna
        map.flyTo([latitude, longitude], 16, { duration: 1.5 });

        // Marker pulsa radar hijau tema DERMAYU (#2D6A4F)
        const userIconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <span style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(45, 106, 79, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 18px; height: 18px; border-radius: 9999px; background: #2D6A4F; border: 3px solid #ffffff; box-shadow: 0 3px 10px rgba(0,0,0,0.35);"></div>
          </div>
        `;
        const userIcon = L.divIcon({
          html: userIconHtml,
          className: "custom-user-pulsing-marker",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 })
            .bindPopup(
              `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #1D443F; padding: 2px;">
                📍 Posisi Anda Saat Ini
                <div style="font-size: 10px; font-weight: normal; color: #64748B; margin-top: 2px;">
                  Akurasi GPS: &plusmn;${Math.round(accuracy || 10)} meter
                </div>
              </div>`
            )
            .addTo(map);
        }

        // Akurasi radius lingkaran transparan di sekitarnya
        if (userAccuracyCircleRef.current) {
          userAccuracyCircleRef.current.setLatLng([latitude, longitude]);
          userAccuracyCircleRef.current.setRadius(accuracy || 30);
        } else {
          userAccuracyCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy || 30,
            color: "#2D6A4F",
            fillColor: "#2D6A4F",
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: "3, 5",
          }).addTo(map);
        }

        setToastMessage("Lokasi GPS Anda berhasil ditemukan");
        setTimeout(() => setToastMessage(null), 2500);
      },
      () => {
        setLocating(false);
        setToastMessage("Izin akses lokasi ditolak oleh browser. Mohon izinkan akses GPS.");
        setTimeout(() => setToastMessage(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };


  // Fullscreen Handler & Sync with Leaflet Size Recalculation
  const handleToggleFullscreen = async () => {
    const container = rootContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } catch {
        setIsFullscreen(true);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.warn("Exit fullscreen error", err);
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFullscreen);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isFullscreen]);


  // Helper: Konversi teks jarak (misal "850 m" atau "1.4 km") menjadi satuan meter
  const parseDistanceInMeters = (distStr: string): number => {
    if (!distStr) return 999999;
    const lower = distStr.toLowerCase();
    const match = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(km|m)?/);
    if (!match) return 999999;
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit === "km") {
      return val * 1000;
    }
    return val;
  };

  // Helper: Konversi teks estimasi waktu (misal "±4 mnt" atau "7 menit") menjadi satuan menit
  const parseDurationInMinutes = (etaStr?: string, distStr?: string): number => {
    if (etaStr) {
      const match = etaStr.match(/([0-9]+(?:\.[0-9]+)?)/);
      if (match) return parseFloat(match[1]);
    }
    return parseDistanceInMeters(distStr || "") / 80;
  };

  // Urutan Posko Terdekat (Rute terdekat & waktu tempuh tercepat selalu di urutan paling atas)
  const filteredShelters = [...shelters].sort((a, b) => {
    const etaA = parseDurationInMinutes(SHELTER_METADATA[a.id]?.eta, a.distance);
    const etaB = parseDurationInMinutes(SHELTER_METADATA[b.id]?.eta, b.distance);
    if (etaA !== etaB) {
      return etaA - etaB;
    }
    return parseDistanceInMeters(a.distance) - parseDistanceInMeters(b.distance);
  });

  return (
    <div
      ref={rootContainerRef}
      className={`relative w-full rounded-none overflow-hidden border-0 bg-white shadow-none flex flex-col isolate z-0 [&_.leaflet-bottom.leaflet-right]:bottom-44 md:[&_.leaflet-bottom.leaflet-right]:bottom-3 ${isFullscreen
          ? "fixed inset-0 !z-[9999] w-screen h-screen"
          : className || "h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)]"
        }`}
    >
      {/* Map Canvas & Floating Controls Wrapper (100% Edge-to-Edge) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Leaflet Map Body Container */}
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* ============================================================== */}
        {/* 1. MOBILE RESPONSIVE HUD (SCREEN < MD)                         */}
        {/* ============================================================== */}
        <div
          className="md:hidden absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5 pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Filter Chips Horizontal (Semua | Genangan | Posko | Sensor) */}
          <div className="h-9 flex items-center justify-between gap-1 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-[#D5E4E0] shadow-md min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setActiveLayer("ALL")}
              className={`h-7 px-2.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                activeLayer === "ALL"
                  ? "bg-[#1D443F] text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("REPORTS")}
              className={`h-7 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeLayer === "REPORTS"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Genangan ({reports.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("SHELTERS")}
              className={`h-7 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeLayer === "SHELTERS"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Posko ({shelters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("TELEMETRY")}
              className={`h-7 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeLayer === "TELEMETRY"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              <span>Sensor ({telemetry.length})</span>
            </button>
          </div>

          {/* GIS Tools (Recenter & Fullscreen) */}
          <div className="h-9 flex items-center gap-0.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md shrink-0">
            <button
              type="button"
              onClick={handleRecenter}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title="Pusatkan Peta"
              aria-label="Pusatkan Peta"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
              aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. DESKTOP HUD (SCREEN >= MD)                                  */}
        {/* ============================================================== */}
        {/* Floating Top-Left: Status Alert, Hotspots Focus & Interactive Shelter List */}
        <div
          className="hidden md:flex absolute top-4 left-4 z-10 flex-col gap-2.5 w-84 sm:w-96 max-w-[calc(100vw-2rem)] pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Status Siaga Banjir (Header Ringkas dengan Keterangan yang Bisa Dibuka/Tutup) */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#D5E4E0] shadow-md transition-all duration-300">
            {/* Header: Judul Wilayah (Kiri), Badge Status & Tombol Buka/Tutup Keterangan (Kanan) */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-[13px] font-black tracking-tight text-slate-900 leading-snug truncate">
                Status Siaga Banjir {district}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSiagaLevel((prev) => (prev === "NORMAL" ? "SIAGA_2" : "NORMAL"))}
                  title="Klik untuk beralih status Siaga"
                  className={`h-6 sm:h-6.5 inline-flex items-center gap-1.5 px-2 sm:px-2.5 rounded-full text-[10px] sm:text-[10.5px] font-black border shadow-2xs cursor-pointer active:scale-95 transition-all select-none shrink-0 ${siagaConfig.badgeBg} ${siagaConfig.badgeText} ${siagaConfig.badgeBorder}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${siagaConfig.pulseColor} animate-pulse shrink-0`} />
                  <span>{siagaConfig.badgeLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSiagaExpanded(!siagaExpanded)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                  title={siagaExpanded ? "Sembunyikan Keterangan" : "Buka Keterangan"}
                  aria-label="Toggle Keterangan Siaga"
                >
                  {siagaExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#2D6A4F]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                </button>
              </div>
            </div>

            {/* Body: Ringkasan Informatif & Ilustrasi 3D (Bisa dibuka dan ditutup) */}
            {siagaExpanded && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D5E4E0]/60 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed flex-1 min-w-0 pr-1">
                  {siagaConfig.summary}
                </p>
                <div className="shrink-0 flex items-center justify-center">
                  {siagaConfig.illustration === "bell_amber" && (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                      <RingingBell3D color="amber" />
                    </div>
                  )}
                  {siagaConfig.illustration === "bell_rose" && (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                      <RingingBell3D color="rose" />
                    </div>
                  )}
                  {siagaConfig.illustration === "shield" && (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
                      <ShieldSafeIllustration />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* PANEL POSKO TERDEKAT & NAVIGASI EVAKUASI CERDAS (WEBGIS)     */}
          {/* ============================================================ */}
          <div
            className={`bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5E4E0] shadow-xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              siagaExpanded ? "max-h-[calc(100vh-14rem)]" : "max-h-[calc(100vh-8.5rem)]"
            }`}
          >
            {/* Header Panel */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0 bg-white/70">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${activeReportDetail
                        ? activeReportDetail.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                        : activeTelemetryDetail
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                      }`}
                  >
                    {activeReportDetail ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : activeTelemetryDetail ? (
                      <Activity className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                      {activeReportDetail
                        ? activeReportDetail.title
                        : activeTelemetryDetail
                          ? activeTelemetryDetail.name
                          : activeShelterDetail
                            ? "Detail Posko Evakuasi"
                            : "Posko Evakuasi Terdekat"}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(activeReportDetail || activeTelemetryDetail) && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${activeReportDetail
                          ? activeReportDetail.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-sky-100 text-sky-800 border-sky-300"
                        }`}
                    >
                      {activeReportDetail
                        ? activeReportDetail.severity === "CRITICAL"
                          ? "Rob Kritis"
                          : "Genangan"
                        : activeTelemetryDetail?.status}
                    </span>
                  )}
                  {isDetailActive && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="Kembali ke Daftar Posko"
                      aria-label="Kembali ke Daftar Posko"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <>
                {/* 1. DETAIL POSKO TERPILIH */}
                {activeShelterDetail ? (
                  (() => {
                    const activeMeta = SHELTER_METADATA[activeShelterDetail.id] || {
                      photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
                      rating: "Siaga 24 Jam",
                      eta: "±4 mnt",
                      avoidArea: "Menghindari Genangan Pesisir",
                      emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
                    };
                    return (
                      <div className="p-2.5 overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                        {/* 1. Atas: Foto Posko Riil (Tinggi Diperbesar h-44 sm:h-52 agar Jelas & Proporsional) */}
                        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-xs border border-gray-200 bg-slate-100">
                          <img
                            src={activeMeta.photoUrl}
                            alt={activeShelterDetail.name}
                            className="w-full h-full object-cover object-center"
                            loading="eager"
                          />
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs text-[9px] font-extrabold flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>TERSEDIA &bull; Siaga 24 Jam</span>
                          </div>
                        </div>

                        {/* 2. Identitas & Lokasi */}
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-[12.5px] text-slate-800 leading-tight truncate">
                            {activeShelterDetail.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                            <span>{activeShelterDetail.location} &bull; {activeShelterDetail.distance.split("(")[0].trim()} dari Anda</span>
                          </p>
                        </div>

                        {/* 3. Ringkasan Esensial (1 Baris Bersih) */}
                        <div className="py-1 border-t border-b border-gray-100 space-y-1 text-[10.5px]">
                          <div className="flex items-center justify-between text-slate-600 gap-1">
                            <span className="truncate">
                              Kapasitas: <strong className="text-emerald-700 font-extrabold">{activeShelterDetail.capacityFilled}/{activeShelterDetail.capacityTotal}</strong>
                              <span className="text-slate-400"> (Sisa {activeShelterDetail.capacityTotal - activeShelterDetail.capacityFilled})</span>
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              Kuwu: <strong className="text-slate-800">{activeShelterDetail.contactPerson}</strong>
                            </span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#2D6A4F] rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((activeShelterDetail.capacityFilled / activeShelterDetail.capacityTotal) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* 4. Baris Tombol Aksi (Desain & Penempatan Identik Gambar 5) */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => drawSafeRoute(activeShelterDetail)}
                            className="h-8 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E] flex-1 min-w-0"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                            <span className="truncate">Arahkan Rute</span>
                          </button>

                          <a
                            href={`tel:${activeShelterDetail.contactPhone.replace(/[^0-9]/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            title={`Hubungi ${activeShelterDetail.contactPerson} (${activeShelterDetail.contactPhone})`}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const needs = activeMeta.emergencyNeeds && activeMeta.emergencyNeeds.length > 0 ? activeMeta.emergencyNeeds.join(", ") : "Logistik Dasar, Air Bersih, Obat-obatan";
                              setToastMessage(`Kebutuhan ${activeShelterDetail.name}: ${needs}`);
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            title="Cek Kebutuhan Logistik"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (navigator.share) {
                                navigator.share({
                                  title: activeShelterDetail.name,
                                  text: `Posko Evakuasi DERMAYU: ${activeShelterDetail.name} (${activeShelterDetail.location}) - Jarak: ${activeShelterDetail.distance.split("(")[0].trim()}. Kapasitas: ${activeShelterDetail.capacityFilled}/${activeShelterDetail.capacityTotal} Jiwa.`,
                                  url: window.location.href,
                                }).catch(() => { });
                              } else {
                                navigator.clipboard?.writeText(`${activeShelterDetail.name} - ${activeShelterDetail.location} (${activeShelterDetail.distance.split("(")[0].trim()})`);
                                setToastMessage("Alamat posko disalin ke clipboard!");
                                setTimeout(() => setToastMessage(null), 2500);
                              }
                            }}
                            title="Bagikan Lokasi Posko"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Share2 className="w-3.5 h-3.5 text-sky-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : activeReportDetail ? (
                  /* 2. DETAIL LAPORAN TITIK BANJIR / GENANGAN */
                  <div className="p-2.5 overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                    {/* Tombol Balik ke Daftar */}
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#24544E] hover:text-[#132422] transition cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Kembali ke Posko</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        aria-label="Tutup info"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Header Info Kejadian */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[8.5px] font-extrabold border ${
                            activeReportDetail.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                        >
                          {activeReportDetail.severity === "CRITICAL" ? "🔴 BANJIR ROB KRITIS" : "🟠 GENANGAN SEDANG"}
                        </span>
                        <span className="text-[9.5px] text-[#718783] font-bold">
                          {activeReportDetail.timeAgo}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-[#132422] leading-snug">
                        {activeReportDetail.title}
                      </h3>
                      <p className="text-[10px] text-[#4B635F] flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                        <span className="truncate">{activeReportDetail.location}</span>
                      </p>
                    </div>

                    {/* Parameter TMA & Status */}
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-[#F8FAF9] border border-gray-100 text-[10.5px]">
                      <div>
                        <span className="text-[8.5px] text-[#64748B] block">Ketinggian Air</span>
                        <strong className="text-[11px] font-black text-[#132422]">
                          {activeReportDetail.waterLevelText || "±30 - 75 cm"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-[#64748B] block">Status</span>
                        <strong className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{activeReportDetail.status}</span>
                        </strong>
                      </div>
                    </div>

                    {/* Peringatan Petugas BPBD */}
                    <div className="text-[9.5px] p-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-tight text-amber-800">
                        Hindari melintasi titik ini. Gunakan jalur evakuasi aman bebas genangan.
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: activeReportDetail.title,
                              text: `Peringatan Banjir/Rob di ${activeReportDetail.location}: ${activeReportDetail.waterLevelText || "Ketinggian Signifikan"}`,
                              url: window.location.href,
                            }).catch(() => { });
                          } else {
                            navigator.clipboard?.writeText(`${activeReportDetail.title} - ${activeReportDetail.location}`);
                            setToastMessage("Info titik banjir disalin!");
                            setTimeout(() => setToastMessage(null), 2500);
                          }
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3 h-3 text-sky-600" />
                        <span>Bagikan Lokasi Kejadian</span>
                      </button>
                    </div>
                  </div>
                ) : activeTelemetryDetail ? (
                  /* 3. DETAIL SENSOR TELEMETRI TMA */
                  <div className="p-2.5 overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                    {/* Tombol Balik ke Daftar */}
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#24544E] hover:text-[#132422] transition cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Kembali ke Posko</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        aria-label="Tutup info"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Header Info Sensor */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.2 rounded-md text-[8.5px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                          📡 SENSOR TELEMETRI TMA
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {activeTelemetryDetail.status}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-[#132422] leading-tight">
                        {activeTelemetryDetail.name}
                      </h3>
                      <p className="text-[9.5px] text-[#64748B]">
                        DAS Cimanuk Hilir • Stasiun Pemantau Pasang Surut
                      </p>
                    </div>

                    {/* TMA Compact Display */}
                    <div className="p-2 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex items-center justify-between">
                      <div>
                        <span className="text-[8.5px] text-sky-800 font-bold uppercase tracking-wider block">
                          Tinggi Muka Air (TMA)
                        </span>
                        <div className="text-[9.5px] text-sky-700 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span>Tren: <strong>{activeTelemetryDetail.trend}</strong></span>
                          <span>&bull;</span>
                          <span>{activeTelemetryDetail.lastUpdate}</span>
                        </div>
                      </div>
                      <div className="text-lg font-black text-sky-900">
                        {activeTelemetryDetail.waterLevel}
                      </div>
                    </div>

                    <div className="text-[9.5px] p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900 leading-snug">
                      💡 <strong>Rekomendasi BPBD:</strong> Warga pesisir tetap waspada potensi air pasang rob pada malam hari.
                    </div>
                  </div>
                ) : (
                  /* 4. DAFTAR LIST POSKO (GAYA GOOGLE MAPS) */
                  <div className="flex flex-col min-h-0">
                    {/* List Items */}
                    <div className="p-2 space-y-1.5 overflow-y-auto max-h-[340px] scrollbar-thin">
                      {filteredShelters.map((sh, index) => {
                        const meta = SHELTER_METADATA[sh.id] || {
                          photoUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
                          rating: "Siaga 24 Jam",
                          eta: "±4 mnt",
                          emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
                        };
                        const isSelected = selectedMarker?.type === "shelter" && selectedMarker.data.id === sh.id;
                        return (
                          <div
                            key={sh.id}
                            onClick={() => handleSelectShelterItem(sh)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${isSelected
                                ? "bg-emerald-50/90 border-[#2D6A4F] shadow-xs"
                                : "bg-white hover:bg-emerald-50/40 border-gray-100 hover:border-emerald-200"
                              }`}
                          >
                            {/* Sisi Kiri: Nama, Status, Jarak & Tombol Aksi */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-extrabold text-[12px] text-[#132422] truncate leading-tight">
                                  {sh.name}
                                </h5>
                                {index === 0 && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[7.5px] font-black bg-[#2D6A4F] text-white shrink-0 tracking-wider">
                                    POSKO TERDEKAT
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#4B635F] flex items-center gap-1 truncate">
                                <span className="font-bold text-emerald-800">{meta.rating}</span>
                                <span>&bull;</span>
                                <span>Kapasitas: {sh.capacityFilled}/{sh.capacityTotal} Jiwa</span>
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#1D443F] flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-[#38746D] shrink-0" />
                                <span>{sh.distance.split("(")[0].trim()}</span>
                                <span className="text-[#718783] font-normal">&bull; Estimasi {meta.eta}</span>
                              </div>

                              {/* Tombol Arahkan Rute & Tombol Icon Cepat */}
                              <div className="flex items-center gap-1 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    drawSafeRoute(sh);
                                    if (onSelectShelter) onSelectShelter(sh);
                                  }}
                                  className="h-6.5 px-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[9.5px] font-bold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E]"
                                >
                                  <Navigation className="w-2.5 h-2.5 text-emerald-300" />
                                  <span>Arahkan Rute</span>
                                </button>

                                <a
                                  href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                                  onClick={(e) => e.stopPropagation()}
                                  title={`Hubungi ${sh.contactPerson} (${sh.contactPhone})`}
                                  className="w-6.5 h-6.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                                >
                                  <Phone className="w-3 h-3 text-emerald-700" />
                                </a>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const needs = meta.emergencyNeeds && meta.emergencyNeeds.length > 0 ? meta.emergencyNeeds.join(", ") : "Logistik Dasar, Air Bersih, Obat-obatan";
                                    setToastMessage(`Kebutuhan ${sh.name}: ${needs}`);
                                    setTimeout(() => setToastMessage(null), 3500);
                                  }}
                                  title="Cek Kebutuhan Logistik"
                                  className="w-6.5 h-6.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                                >
                                  <Package className="w-3 h-3 text-amber-600" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (navigator.share) {
                                      navigator.share({
                                        title: sh.name,
                                        text: `Posko Evakuasi DERMAYU: ${sh.name} (${sh.location}) - Jarak: ${sh.distance.split("(")[0].trim()}. Kapasitas: ${sh.capacityFilled}/${sh.capacityTotal} Jiwa.`,
                                        url: window.location.href,
                                      }).catch(() => { });
                                    } else {
                                      navigator.clipboard?.writeText(`${sh.name} - ${sh.location} (${sh.distance.split("(")[0].trim()})`);
                                      setToastMessage("Alamat posko disalin ke clipboard!");
                                      setTimeout(() => setToastMessage(null), 2500);
                                    }
                                  }}
                                  title="Bagikan Lokasi Posko"
                                  className="w-6.5 h-6.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
                                >
                                  <Share2 className="w-3 h-3 text-sky-600" />
                                </button>
                              </div>
                            </div>

                            {/* Sisi Kanan: Thumbnail Foto Gedung Posko (Diperbesar) */}
                            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-xs bg-slate-100">
                              <img
                                src={meta.photoUrl}
                                alt={sh.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            </div>
        </div>

        {/* Floating Top-Right: Filter Layers, Actions & Tools */}
        <div
          className="hidden md:flex absolute top-4 right-4 z-10 flex-wrap items-center justify-end gap-2 pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Layer Filters */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md">
            <button
              type="button"
              onClick={() => setActiveLayer("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${activeLayer === "ALL"
                  ? "bg-[#1D443F] text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
                }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("REPORTS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${activeLayer === "REPORTS"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Genangan ({reports.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("SHELTERS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${activeLayer === "SHELTERS"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Posko ({shelters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("TELEMETRY")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${activeLayer === "TELEMETRY"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Sensor TMA ({telemetry.length})</span>
            </button>
          </div>

          {/* Map Tools */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md">
            <button
              type="button"
              onClick={handleRecenter}
              className="p-1.5 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title="Pusatkan Peta ke Indramayu"
              aria-label="Pusatkan Peta ke Indramayu"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
              aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. FLOATING SELECTED MARKER CARD (MOBILE ONLY)                 */}
        {/* ============================================================== */}
        {selectedMarker && (
          <div
            className="md:hidden absolute bottom-3 left-3 right-3 max-h-[34vh] overflow-y-auto bg-white/98 backdrop-blur-md rounded-2xl p-2.5 border border-[#D5E4E0] shadow-2xl text-left space-y-1.5"
            style={{ zIndex: 1000 }}
          >
            {selectedMarker.type === "shelter" && (() => {
              const sh = selectedMarker.data;
              const meta = SHELTER_METADATA[sh.id] || {
                photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
                rating: "Siaga 24 Jam",
                eta: "±4 mnt",
                emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
              };
              return (
                <div className="space-y-1.5">
                  {/* 1. Atas: Foto Posko Riil (Ramping h-20) dengan Badge & Close */}
                  <div className="relative w-full h-20 rounded-xl overflow-hidden shadow-xs border border-gray-200 bg-slate-100">
                    <img
                      src={meta.photoUrl}
                      alt={sh.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs text-[8.5px] font-bold flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>TERSEDIA &bull; Siaga 24 Jam</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMarker(null)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition cursor-pointer"
                      aria-label="Tutup info"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>


                  {/* 3. Identitas & Lokasi */}
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs text-slate-800 leading-tight truncate">
                      {sh.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                      <span>{sh.location} &bull; {sh.distance.split("(")[0].trim()}</span>
                    </p>
                  </div>

                  {/* 4. Ringkasan Esensial (1 Baris Bersih) */}
                  <div className="py-1 border-t border-b border-gray-100 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-slate-600 gap-1">
                      <span className="truncate">
                        Kapasitas: <strong className="text-emerald-700 font-extrabold">{sh.capacityFilled}/{sh.capacityTotal}</strong>
                        <span className="text-slate-400"> (Sisa {sh.capacityTotal - sh.capacityFilled})</span>
                      </span>
                      <span className="text-[9.5px] text-slate-500 shrink-0">
                        Kuwu: <strong className="text-slate-800">{sh.contactPerson}</strong>
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#2D6A4F] rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((sh.capacityFilled / sh.capacityTotal) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 4. Baris Tombol Aksi (Desain & Penempatan Identik Gambar 5) */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        drawSafeRoute(sh);
                        if (onSelectShelter) onSelectShelter(sh);
                      }}
                      className="h-7.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[10.5px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E] flex-1 min-w-0"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="truncate">Arahkan Rute</span>
                    </button>

                    <a
                      href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      title={`Hubungi ${sh.contactPerson} (${sh.contactPhone})`}
                      className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const needs = meta.emergencyNeeds && meta.emergencyNeeds.length > 0 ? meta.emergencyNeeds.join(", ") : "Logistik Dasar, Air Bersih, Obat-obatan";
                        setToastMessage(`Kebutuhan ${sh.name}: ${needs}`);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      title="Cek Kebutuhan Logistik"
                      className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: sh.name,
                            text: `Posko Evakuasi: ${sh.name} - ${sh.location}`,
                            url: window.location.href,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(`${sh.name} - ${sh.location}`);
                          setToastMessage("Alamat posko disalin!");
                          setTimeout(() => setToastMessage(null), 2500);
                        }
                      }}
                      title="Bagikan Lokasi Posko"
                      className="w-7.5 h-7.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5 text-sky-600" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {selectedMarker.type === "report" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                      selectedMarker.data.severity === "CRITICAL"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedMarker.data.severity === "CRITICAL" ? "🔴 BANJIR ROB KRITIS" : "🟠 GENANGAN AIR"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMarker(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    aria-label="Tutup info"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#132422]">{selectedMarker.data.title}</h4>
                  <p className="text-[10px] text-[#718783] mt-0.5">{selectedMarker.data.location}</p>
                </div>
                {selectedMarker.data.waterLevelText && (
                  <div className="text-[10px] font-bold text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                    Ketinggian Air: {selectedMarker.data.waterLevelText}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 flex justify-between pt-0.5">
                  <span>
                    Status: <strong>{selectedMarker.data.status}</strong>
                  </span>
                  <span>{selectedMarker.data.timeAgo}</span>
                </div>
              </div>
            )}

            {selectedMarker.type === "telemetry" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    📡 SENSOR TELEMETRI
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMarker(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    aria-label="Tutup info"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#132422]">{selectedMarker.data.name}</h4>
                  <p className="text-[10px] text-[#718783] mt-0.5">DAS Cimanuk Hilir</p>
                </div>
                <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <span className="text-[10px] text-sky-800 font-bold">Tinggi Muka Air (TMA)</span>
                  <span className="text-base font-black text-sky-900">{selectedMarker.data.waterLevel}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. FLOATING MAP CONTROLS (FAB) DI SISI KANAN AREA PETA         */}
        {/* Posisi: fixed/absolute right-3.5 sm:right-4 bottom-56 flex flex-col gap-2.5 z-30 */}
        {/* Berada di atas layer peta Leaflet, di bawah Bottom Sheet info posko */}
        {/* ============================================================== */}
        <div
          className="absolute right-3.5 sm:right-4 bottom-56 md:bottom-12 z-30 flex flex-col gap-2.5 pointer-events-auto"
          aria-label="Kontrol Peta Spasial"
        >
          {/* Tombol 1: Kompas Orientasi Utara */}
          <button
            type="button"
            onClick={handleResetCompass}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer"
            title="Reset Arah Utara (0°)"
            aria-label="Reset Arah Utara"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 transition-transform duration-300"
              style={{ transform: `rotate(-${compassHeading}deg)` }}
              fill="none"
              aria-hidden="true"
            >
              {/* Jarum Utara (Merah) */}
              <path d="M12 3 L15.5 12 L12 10.5 L8.5 12 Z" fill="#EF4444" />
              {/* Jarum Selatan (Slate/Abu-abu) */}
              <path d="M12 21 L15.5 12 L12 13.5 L8.5 12 Z" fill="#94A3B8" />
              {/* Titik Poros Tengah */}
              <circle cx="12" cy="12" r="1.5" fill="#1E293B" />
            </svg>
          </button>

          {/* Tombol 2: Lokasi Saya Saat Ini (GPS Geolocation / Recenter) */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer"
            title="Lokasi Saya Saat Ini (GPS)"
            aria-label="Lokasi Saya Saat Ini"
          >
            {locating ? (
              <Loader2 className="w-5 h-5 text-[#2D6A4F] animate-spin" />
            ) : (
              <Crosshair className="w-5 h-5 text-[#2D6A4F]" />
            )}
          </button>

          {/* Tombol 3: Ganti Layer Peta (Basemap Toggle OSM <-> Satelit Esri) */}
          <button
            type="button"
            onClick={handleToggleBasemap}
            className={`w-11 h-11 rounded-full shadow-lg border transition-transform active:scale-95 flex items-center justify-center cursor-pointer ${basemap === "satellite"
                ? "bg-[#2D6A4F] text-white border-[#1B4D3E]"
                : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
              }`}
            title={basemap === "satellite" ? "Beralih ke Peta Jalan OSM" : "Beralih ke Citra Satelit Esri"}
            aria-label="Ganti Tampilan Peta"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Tombol 4: Kontrol Zoom In & Zoom Out Vertikal */}
          <div className="w-11 bg-white rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center divide-y divide-slate-100 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Perbesar Peta (Zoom In)"
              aria-label="Perbesar Peta"
            >
              <Plus className="w-4 h-4 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Perkecil Peta (Zoom Out)"
              aria-label="Perkecil Peta"
            >
              <Minus className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>


        {/* ============================================================== */}
        {/* 6. BANNER NAVIGASI TURN-BY-TURN RUTE AMAN EVAKUASI             */}
        {/* ============================================================== */}
        {activeNavRoute && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg bg-[#1B4D3E]/95 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md border border-emerald-400/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
            style={{ zIndex: 1100 }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5 text-emerald-300 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-white truncate">
                    Rute Teraman &bull; {activeNavRoute.routeDistance}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                    Bebas Genangan
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 truncate mt-0.5">
                  Menuju {activeNavRoute.shelter.name} &bull; {activeNavRoute.avoidArea}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearNavRoute}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer border border-white/10"
              title="Selesai Navigasi"
              aria-label="Selesai Navigasi"
            >
              <X className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Selesai</span>
            </button>
          </div>
        )}

        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top duration-200 max-w-sm text-center">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
