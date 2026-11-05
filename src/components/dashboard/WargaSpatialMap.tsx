"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Bike,
  Car,
  Footprints,
  Clock,
  Milestone,
  ArrowDownUp,
  Search,
  Pencil,
  SlidersHorizontal,
  Mic,
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
  district?: string;
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

export interface NavigationStep {
  instruction: string;
  distance: string;
  type?: string;
  modifier?: string;
}

export interface NavigationRouteOption {
  id: string;
  name: string;
  summary: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  statusBadge: string;
  statusBadgeType: "safe" | "warning" | "detour" | "custom";
  warningText?: string;
  coordinates: [number, number][];
  steps: NavigationStep[];
}

export interface ActiveNavRouteData {
  shelter: MapShelterPoint;
  originName: string;
  originCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  transportMode: "motorcycle" | "car" | "walking";
  routes: NavigationRouteOption[];
  selectedRouteIndex: number;
  showingSteps?: boolean;
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

// ============================================================================
// HELPER PERHITUNGAN JARAK SPASIAL & FORMATTING TERDEKAT (HAVERSINE)
// ============================================================================
function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistanceText(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatEtaText(meters: number): string {
  const km = meters / 1000;
  const mins = Math.max(3, Math.round(km * 3.5));
  return `±${mins} mnt`;
}

// Generator Custom Marker Pin Teardrop Google Maps Style
type PinType = "posko" | "genangan" | "kritis" | "sensor" | "infra" | "rawan";

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
    infra: {
      bg: "bg-cyan-600",
      icon: <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />,
    },
    rawan: {
      bg: "bg-purple-600",
      icon: <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />,
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
  "sh-4": {
    photoUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    rating: "Kapasitas Besar",
    eta: "±8 mnt",
    avoidArea: "Jalur Kering By-Pass Lingkar Selatan Pantura",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3520, 108.1280]],
    emergencyNeeds: ["Tenda Pleton", "Matras", "MCK Portable"],
  },
  "sh-5": {
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga 24 Jam",
    eta: "±9 mnt",
    avoidArea: "Menghindari Tanggul Pasang Muara Eretan",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3380, 108.1120]],
    emergencyNeeds: ["Air Minum", "Obat Kulit & Diare"],
  },
  "sh-6": {
    photoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga Bencana",
    eta: "±15 mnt",
    avoidArea: "Menghindari Saluran Primer Cantigi Hilir",
    routeCoordinates: [[-6.3490, 108.1165], [-6.2842, 108.2635]],
    emergencyNeeds: ["Makanan Balita", "Selimut"],
  },
  "sh-7": {
    photoUrl: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga 24 Jam",
    eta: "±18 mnt",
    avoidArea: "Melintasi Tanggul Primer Bebas Genangan",
    routeCoordinates: [[-6.3490, 108.1165], [-6.2910, 108.2580]],
    emergencyNeeds: ["Sembako", "Genset"],
  },
  "sh-8": {
    photoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    rating: "Posko Logistik PMI",
    eta: "±14 mnt",
    avoidArea: "Jalur Arteri Pantura Losarang Kering",
    routeCoordinates: [[-6.3490, 108.1165], [-6.4020, 108.1650]],
    emergencyNeeds: ["Ambulans", "Dapur Umum"],
  },
  "sh-9": {
    photoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga 24 Jam",
    eta: "±20 mnt",
    avoidArea: "Jalur Irigasi Barat Pasekan",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3150, 108.2950]],
    emergencyNeeds: ["Air Bersih", "Bidan Siaga"],
  },
  "sh-10": {
    photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    rating: "Kapasitas 600 Jiwa",
    eta: "±22 mnt",
    avoidArea: "Jalur Pantura Lohbener Bebas Hambatan",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3880, 108.2750]],
    emergencyNeeds: ["Logistik Besar", "Penerangan"],
  },
  "sh-11": {
    photoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    rating: "Posko Induk BPBD",
    eta: "±26 mnt",
    avoidArea: "Jalan Protokol Kota Bebas Banjir",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3260, 108.3240]],
    emergencyNeeds: ["Posko Medis Lengkap", "Keluarga Pengungsi"],
  },
  "sh-12": {
    photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    rating: "Siaga 24 Jam",
    eta: "±24 mnt",
    avoidArea: "Jembatan Cimanuk Sindang",
    routeCoordinates: [[-6.3490, 108.1165], [-6.3380, 108.3100]],
    emergencyNeeds: ["Sembako", "Perlengkapan Bayi"],
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
  const [poskoExpanded, setPoskoExpanded] = useState(true);
  const [activeShelterDetail, setActiveShelterDetail] = useState<MapShelterPoint | null>(null);
  const [activeReportDetail, setActiveReportDetail] = useState<MapReportPoint | null>(null);
  const [activeTelemetryDetail, setActiveTelemetryDetail] = useState<MapTelemetryPoint | null>(null);
  const [activeNavRoute, setActiveNavRoute] = useState<ActiveNavRouteData | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // State 3 Klasifikasi Saran Rute & Custom Waypoint
  const [selectedRouteClassification, setSelectedRouteClassification] = useState<1 | 2 | 3 | "custom">(1);
  const [customWaypoint, setCustomWaypoint] = useState<{
    lat: number;
    lng: number;
    distanceText: string;
    durationText: string;
    coordinates?: [number, number][];
  } | null>(null);
  const [isPickingWaypoint, setIsPickingWaypoint] = useState(false);
  const isPickingWaypointRef = useRef(false);
  isPickingWaypointRef.current = isPickingWaypoint;
  const activeShelterRef = useRef<MapShelterPoint | null>(null);
  activeShelterRef.current = activeShelterDetail || activeNavRoute?.shelter || null;
  const handleMapClickForWaypointRef = useRef<(lat: number, lng: number) => void>(() => {});

  // State Search & Kategori Filter Baris 1 & 2
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterChip, setActiveFilterChip] = useState<string>("terdekat");
  const [showAllShelters, setShowAllShelters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("SEMUA");
  const [sortByClosest, setSortByClosest] = useState(true);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filter24Hours, setFilter24Hours] = useState(false);

  const FILTER_CHIPS = [
    { id: "terdekat", label: "Terdekat (GPS)", type: "default" },
    { id: "semua", label: "Semua Posko", type: "category" },
    { id: "medis", label: "Posko Medis", type: "category" },
    { id: "dapur", label: "Dapur Umum", type: "category" },
    { id: "gor", label: "GOR/Gedung Besar", type: "category" },
    { id: "Kandanghaur", label: "Kandanghaur", type: "district" },
    { id: "Eretan", label: "Eretan", type: "district" },
    { id: "Cantigi", label: "Cantigi", type: "district" },
    { id: "Losarang", label: "Losarang", type: "district" },
    { id: "Lohbener", label: "Lohbener", type: "district" },
    { id: "Indramayu Kota", label: "Indramayu Kota", type: "district" },
  ] as const;

  const DISTRICT_LIST = [
    "SEMUA",
    "Kandanghaur",
    "Eretan",
    "Cantigi",
    "Losarang",
    "Pasekan",
    "Lohbener",
    "Indramayu Kota",
    "Sindang",
  ];

  const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
    SEMUA: { lat: -6.365, lng: 108.235, zoom: 11 },
    Kandanghaur: { lat: -6.346, lng: 108.125, zoom: 14 },
    Eretan: { lat: -6.340, lng: 108.115, zoom: 14 },
    Cantigi: { lat: -6.284, lng: 108.263, zoom: 14 },
    Losarang: { lat: -6.395, lng: 108.158, zoom: 14 },
    Pasekan: { lat: -6.315, lng: 108.295, zoom: 14 },
    Lohbener: { lat: -6.388, lng: 108.275, zoom: 14 },
    "Indramayu Kota": { lat: -6.326, lng: 108.324, zoom: 14 },
    Sindang: { lat: -6.338, lng: 108.310, zoom: 14 },
  };

  const handleSelectDistrict = (dist: string) => {
    setSelectedDistrict(dist);
    const center = DISTRICT_COORDINATES[dist];
    if (center && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], center.zoom, { duration: 1 });
    }
  };

  // User GPS Coordinates & Dynamic Proximity States
  const [userCoords, setUserCoords] = useState<[number, number]>([-6.3475, 108.1189]);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [shelterLimit, setShelterLimit] = useState<number>(5);
  const initialGpsFittedRef = useRef(false);

  // Helper pasang marker GPS pengguna dengan efek pulsa radar hijau DERMAYU (#2D6A4F)
  const updateUserMarkerOnMap = (lat: number, lng: number, accuracy?: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

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
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #1D443F; padding: 2px;">
            📍 Posisi Anda Saat Ini (GPS Otomatis)
            <div style="font-size: 10px; font-weight: normal; color: #64748B; margin-top: 2px;">
              Akurasi: &plusmn;${Math.round(accuracy || 15)} meter
            </div>
          </div>`
        )
        .addTo(map);
    }

    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.setLatLng([lat, lng]);
      userAccuracyCircleRef.current.setRadius(accuracy || 30);
    } else {
      userAccuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracy || 30,
        color: "#2D6A4F",
        fillColor: "#2D6A4F",
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "3, 5",
      }).addTo(map);
    }
  };

  // Deteksi GPS otomatis saat pertama kali halaman/peta dibuka
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserCoords([latitude, longitude]);
          setIsGpsLocked(true);
          updateUserMarkerOnMap(latitude, longitude, accuracy);
          if (mapInstanceRef.current && !initialGpsFittedRef.current) {
            initialGpsFittedRef.current = true;
            mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
          }
        },
        (err) => {
          console.warn("GPS otomatis belum aktif atau izin ditolak:", err.message);
          updateUserMarkerOnMap(-6.3475, 108.1189, 50);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      updateUserMarkerOnMap(-6.3475, 108.1189, 50);
    }
  }, []);

  // Kalkulasi jarak real-time dari posisi GPS pengguna ke seluruh posko sekolah
  const processedShelters = useMemo(() => {
    const [uLat, uLng] = userCoords;
    return shelters.map((sh) => {
      const distMeters = calculateDistanceInMeters(uLat, uLng, sh.lat, sh.lng);
      const distStr = formatDistanceText(distMeters);
      const etaStr = formatEtaText(distMeters);
      return {
        ...sh,
        distMeters,
        distance: `${distStr} (${etaStr})`,
        displayDistance: distStr,
        displayEta: etaStr,
      };
    });
  }, [shelters, userCoords]);

  // Urutan Posko Terdekat & Hasil Filter Dinamis (Search, Kategori, Wilayah)
  const displayedShelters = useMemo(() => {
    let list = [...processedShelters];

    // 1. Text Search query (fuzzy match name, location, district, facilities)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((sh) => {
        const matchName = sh.name.toLowerCase().includes(q);
        const matchLoc = sh.location.toLowerCase().includes(q);
        const matchDist = (sh.district || "").toLowerCase().includes(q);
        const matchFacilities = (sh.facilities || []).some((f) => f.toLowerCase().includes(q));
        return matchName || matchLoc || matchDist || matchFacilities;
      });
    }

    // 2. Chip Filter Kategori & Wilayah
    if (activeFilterChip === "medis") {
      list = list.filter((sh) => {
        const meta = SHELTER_METADATA[sh.id];
        const text = `${sh.name} ${sh.location} ${(sh.facilities || []).join(" ")} ${meta?.emergencyNeeds?.join(" ") || ""}`.toLowerCase();
        return (
          text.includes("medis") ||
          text.includes("kesehatan") ||
          text.includes("pmi") ||
          text.includes("dokter") ||
          text.includes("bidan") ||
          text.includes("obat") ||
          text.includes("ambulans")
        );
      });
    } else if (activeFilterChip === "dapur") {
      list = list.filter((sh) => {
        const meta = SHELTER_METADATA[sh.id];
        const text = `${sh.name} ${sh.location} ${(sh.facilities || []).join(" ")} ${meta?.emergencyNeeds?.join(" ") || ""}`.toLowerCase();
        return (
          text.includes("dapur") ||
          text.includes("makanan") ||
          text.includes("sembako") ||
          text.includes("logistik") ||
          text.includes("beras") ||
          text.includes("air")
        );
      });
    } else if (activeFilterChip === "gor") {
      list = list.filter((sh) => {
        const text = `${sh.name} ${sh.location}`.toLowerCase();
        return (
          text.includes("gor") ||
          text.includes("gedung") ||
          text.includes("aula") ||
          text.includes("masjid") ||
          text.includes("balai") ||
          sh.capacityTotal >= 200 ||
          SHELTER_METADATA[sh.id]?.rating === "Kapasitas Besar"
        );
      });
    } else if (activeFilterChip !== "terdekat" && activeFilterChip !== "semua") {
      // Wilayah / Kecamatan Filter
      const d = activeFilterChip.toLowerCase();
      list = list.filter((sh) => {
        const shDist = (sh.district || "").toLowerCase();
        const shLoc = sh.location.toLowerCase();
        const shName = sh.name.toLowerCase();
        return shDist.includes(d) || shLoc.includes(d) || shName.includes(d);
      });
    }

    // Urutkan posko terdekat dari koordinat user (jarak terkecil ke terbesar)
    return list.sort((a, b) => a.distMeters - b.distMeters);
  }, [processedShelters, searchQuery, activeFilterChip]);

  // Hanya ambil 3-5 posko sekolah terdekat untuk dirender di peta Leaflet (Zero DOM lag)
  const mapVisibleShelters = useMemo(() => {
    const top = displayedShelters.slice(0, shelterLimit);
    if (activeShelterDetail && !top.some((s) => s.id === activeShelterDetail.id)) {
      return [activeShelterDetail, ...top];
    }
    return top;
  }, [displayedShelters, shelterLimit, activeShelterDetail]);

  // Status tampilan default (3-5 posko terdekat) vs mode dinamis/ekspansi
  const isDefaultView = activeFilterChip === "terdekat" && !showAllShelters && !searchQuery.trim();

  // Judul dinamis untuk header Card Posko Evakuasi
  const getCardHeaderTitle = () => {
    if (searchQuery.trim()) {
      return `Hasil Pencarian: "${searchQuery}"`;
    }
    if (activeFilterChip === "medis") {
      return "Posko Medis";
    }
    if (activeFilterChip === "dapur") {
      return "Dapur Umum";
    }
    if (activeFilterChip === "gor") {
      return "GOR / Gedung Besar";
    }
    if (activeFilterChip === "semua") {
      return "Semua Posko Evakuasi";
    }
    if (activeFilterChip !== "terdekat") {
      return `Posko Wilayah ${activeFilterChip}`;
    }
    if (showAllShelters) {
      return `Posko Terdekat Lainnya (${Math.min(10, displayedShelters.length)} Terdekat)`;
    }
    return `Posko Evakuasi Terdekat (${shelterLimit} Terdekat)`;
  };

  const [selectedMarker, setSelectedMarker] = useState<
    | { type: "shelter"; data: MapShelterPoint }
    | { type: "report"; data: MapReportPoint }
    | { type: "telemetry"; data: MapTelemetryPoint }
    | null
  >(null);

  const isDetailActive = Boolean(activeShelterDetail || activeReportDetail || activeTelemetryDetail || activeNavRoute);

  // 3-Level Sheet Snap: "compact" (~118px - tidak menutupi peta), "medium" (~48vh), "expanded" (~82vh)
  type SheetSnap = "compact" | "medium" | "expanded";
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("compact");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragDiffYRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const currentSnapRef = useRef<SheetSnap>("compact");
  currentSnapRef.current = sheetSnap;

  const handleDragStart = (clientY: number) => {
    touchStartYRef.current = clientY;
    dragDiffYRef.current = 0;
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (touchStartYRef.current === null) return;
    const diff = clientY - touchStartYRef.current;
    dragDiffYRef.current = diff;
    setDragOffsetY(diff);
  };

  const handleDragEnd = () => {
    if (touchStartYRef.current === null) return;
    const diff = dragDiffYRef.current;
    setIsDragging(false);
    setDragOffsetY(0);
    dragDiffYRef.current = 0;
    touchStartYRef.current = null;

    const current = currentSnapRef.current;

    // Geser KE BAWAH (diff > 35px)
    if (diff > 35) {
      if (current === "expanded") {
        setSheetSnap("medium");
      } else if (current === "medium") {
        setSheetSnap("compact"); // turun ke compact agar tidak menutupi peta
      } else if (current === "compact") {
        if (diff > 60) {
          clearSelection(); // tutup detail jika ditarik ke bawah saat compact
        }
      }
    }
    // Geser KE ATAS (diff < -35px)
    else if (diff < -35) {
      if (current === "compact") {
        if (diff < -120) {
          setSheetSnap("expanded");
        } else {
          setSheetSnap("medium");
        }
      } else if (current === "medium") {
        setSheetSnap("expanded");
      }
    }
  };

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleSheetTouchEnd = () => {
    handleDragEnd();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // Handled by touch events
    handleDragStart(e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch { }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    handleDragMove(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { }
    handleDragEnd();
  };

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

    // Pasang marker user segera setelah peta Leaflet siap
    updateUserMarkerOnMap(userCoords[0], userCoords[1]);

    map.on("click", (e) => {
      if (isPickingWaypointRef.current) {
        handleMapClickForWaypointRef.current(e.latlng.lat, e.latlng.lng);
        return;
      }
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
          setPoskoExpanded(true);
          setSheetSnap("compact");
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
    // PERFORMA ULTRA-RESPONSIF: Hanya render 3-5 posko sekolah terdekat dari GPS agar Leaflet 100% cepat & bebas lag!
    if (activeLayer === "ALL" || activeLayer === "SHELTERS") {
      mapVisibleShelters.forEach((sh) => {
        const sisaKapasitas = sh.capacityTotal - sh.capacityFilled;
        const isFull = sh.status === "PENUH";
        const color = isFull ? "#9CA3AF" : "#059669";

        const icon = createPinIcon("posko");

        const popupContent = `
          <div style="font-family: inherit; width: 230px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #047857; background: #ECFDF5; padding: 2px 6px; border-radius: 6px; border: 1px solid #A7F3D0;">
                POSKO TERDEKAT (GPS)
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
          setPoskoExpanded(true);
          setSheetSnap("compact");
          clearRadarGlow();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([tel.lat, tel.lng], 16, { duration: 1.2 });
          }
        });
        telemetryLayerRef.current?.addLayer(marker);
      });
    }
  }, [reports, mapVisibleShelters, telemetry, activeLayer, onSelectReport, onSelectShelter]);

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
    setSheetSnap("compact");
    setSelectedRouteClassification(1);
    setIsPickingWaypoint(false);
    setCustomWaypoint(null);
  };

  // Pilih Item Posko: Kamera terbang, Radar menyala, & Buka Detail Card
  const handleSelectShelterItem = (sh: MapShelterPoint) => {
    setActiveShelterDetail(sh);
    setActiveReportDetail(null);
    setActiveTelemetryDetail(null);
    setSelectedMarker({ type: "shelter", data: sh });
    setSiagaExpanded(false);
    setPoskoExpanded(true);
    setSheetSnap("compact");
    setSelectedRouteClassification(1);
    setIsPickingWaypoint(false);
    showRadarGlow(sh.lat, sh.lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([sh.lat, sh.lng], 16, { duration: 1.2 });
    }
    if (onSelectShelter) {
      onSelectShelter(sh);
    }
    previewShelterRoute(sh, 1);
  };



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

  // Helper Format Waktu & Jarak Navigasi
  const formatNavDuration = (seconds: number): string => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) {
      return `${Math.max(1, mins)} mnt`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}j ${remMins}m`;
  };

  const formatNavDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Helper Menghitung Durasi berdasarkan Moda Transportasi
  const computeModeDuration = (distanceMeters: number, baseDurationSec: number, mode: "motorcycle" | "car" | "walking") => {
    if (mode === "motorcycle") {
      return Math.round(baseDurationSec * 0.95);
    }
    if (mode === "car") {
      return Math.round(baseDurationSec * 1.15);
    }
    // Jalan Kaki (~4.5 km/jam = 1.25 m/s)
    return Math.round(distanceMeters / 1.25);
  };

  // Render Layer Polyline & Tooltip di Peta Leaflet
  const renderNavRoutesOnMap = (
    routes: NavigationRouteOption[],
    selectedIndex: number,
    mode: "motorcycle" | "car" | "walking"
  ) => {
    if (!mapInstanceRef.current) return;

    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    } else {
      activeRouteLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const modeIcon = mode === "motorcycle" ? "🏍️" : mode === "car" ? "🚗" : "🚶";

    // 1. Gambar rute alternatif terlebih dahulu (di layer bawah)
    routes.forEach((rt, idx) => {
      if (idx === selectedIndex) return;

      let altColor = "#94A3B8";
      let altDash = "4, 6";
      let altTooltipBg = "#334155";
      let altBadgeBg = "#94A3B8";
      let altBadgeText = "#0F172A";
      let altBorder = "#94A3B8";

      if (rt.statusBadgeType === "warning") {
        altColor = "#F59E0B";
        altDash = "5, 6";
        altTooltipBg = "#78350F";
        altBadgeBg = "#FBBF24";
        altBadgeText = "#78350F";
        altBorder = "#FBBF24";
      } else if (rt.statusBadgeType === "custom") {
        altColor = "#A78BFA";
        altDash = "4, 6";
        altTooltipBg = "#5B21B6";
        altBadgeBg = "#A78BFA";
        altBadgeText = "#2E1065";
        altBorder = "#A78BFA";
      }

      const altLine = L.polyline(rt.coordinates, {
        color: altColor,
        weight: 5,
        opacity: 0.8,
        dashArray: altDash,
        lineCap: "round",
        lineJoin: "round",
      });

      const altTooltipHtml = `
        <div style="background: ${altTooltipBg}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1.5px solid ${altBorder}; display: flex; align-items: center; gap: 5px; white-space: nowrap; cursor: pointer;">
          <span>${rt.durationText} &bull; ${rt.distanceText}</span>
          <span style="background: ${altBadgeBg}; color: ${altBadgeText}; padding: 1.5px 6px; border-radius: 9999px; font-size: 8.5px; font-weight: 800;">${rt.statusBadge}</span>
        </div>
      `;

      altLine.bindTooltip(altTooltipHtml, {
        permanent: true,
        direction: "center",
        className: "dermayu-route-badge",
      });

      altLine.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectRouteIndex(idx);
      });

      activeRouteLayerRef.current?.addLayer(altLine);
    });

    // 2. Gambar rute utama / terpilih di layer teratas
    const activeRoute = routes[selectedIndex] || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      let mainColor = "#2D6A4F";
      let mainTooltipBg = "#1B4D3E";
      let mainBadgeBg = "#34D399";
      let mainBadgeText = "#064E3B";
      let mainBorder = "#34D399";
      let mainDash: string | undefined = undefined;

      if (activeRoute.statusBadgeType === "warning") {
        mainColor = "#F59E0B";
        mainDash = "6, 8";
        mainTooltipBg = "#78350F";
        mainBadgeBg = "#FBBF24";
        mainBadgeText = "#78350F";
        mainBorder = "#FBBF24";
      } else if (activeRoute.statusBadgeType === "detour") {
        mainColor = "#64748B";
        mainDash = "4, 6";
        mainTooltipBg = "#334155";
        mainBadgeBg = "#94A3B8";
        mainBadgeText = "#0F172A";
        mainBorder = "#94A3B8";
      } else if (activeRoute.statusBadgeType === "custom") {
        mainColor = "#7C3AED";
        mainTooltipBg = "#5B21B6";
        mainBadgeBg = "#A78BFA";
        mainBadgeText = "#2E1065";
        mainBorder = "#A78BFA";
      }

      const glowLine = L.polyline(activeRoute.coordinates, {
        color: "#ffffff",
        weight: 10,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      });

      const coreLine = L.polyline(activeRoute.coordinates, {
        color: mainColor,
        weight: 6,
        opacity: 0.95,
        dashArray: mainDash,
        lineCap: "round",
        lineJoin: "round",
      });

      const mainTooltipHtml = `
        <div style="background: ${mainTooltipBg}; color: white; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1.5px solid ${mainBorder}; display: flex; align-items: center; gap: 6px; white-space: nowrap; pointer-events: none;">
          <span>${modeIcon} ${activeRoute.durationText} &bull; ${activeRoute.distanceText}</span>
          <span style="background: ${mainBadgeBg}; color: ${mainBadgeText}; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900; letter-spacing: 0.02em;">${activeRoute.statusBadge}</span>
        </div>
      `;

      coreLine.bindTooltip(mainTooltipHtml, {
        permanent: true,
        direction: "center",
        className: "dermayu-route-badge",
      });

      activeRouteLayerRef.current?.addLayer(glowLine);
      activeRouteLayerRef.current?.addLayer(coreLine);

      if (activeRoute.statusBadgeType === "safe") {
        const accentLine = L.polyline(activeRoute.coordinates, {
          color: "#6EE7B7",
          weight: 2.5,
          dashArray: "8, 12",
          opacity: 0.95,
        });
        activeRouteLayerRef.current?.addLayer(accentLine);
      }

      // Marker Peringatan Genangan Rob pada Rute 2
      if (activeRoute.statusBadgeType === "warning" && activeRoute.coordinates.length > 2) {
        const midPoint = activeRoute.coordinates[Math.floor(activeRoute.coordinates.length / 2)];
        const warnIcon = L.divIcon({
          className: "custom-genangan-marker",
          html: `
            <div style="background: #DC2626; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(220,38,38,0.5); font-size: 12px; font-weight: bold;">
              ⚠️
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const warnMarker = L.marker(midPoint, { icon: warnIcon });
        warnMarker.bindTooltip(
          `<div style="font-size:10px; font-weight:bold; color:#DC2626; padding:2px 4px;">Titik Genangan Rob (15-25 cm)</div>`,
          { permanent: true, direction: "top" }
        );
        activeRouteLayerRef.current?.addLayer(warnMarker);
      }

      // Marker Titik Singgah Kustom jika rute kustom
      if (activeRoute.statusBadgeType === "custom" && customWaypoint) {
        const wpIcon = L.divIcon({
          className: "custom-wp-pin",
          html: `
            <div style="background: #7C3AED; color: white; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(124,58,237,0.5); font-size: 13px; font-weight: bold;">
              📍
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const wpMarker = L.marker([customWaypoint.lat, customWaypoint.lng], { icon: wpIcon });
        wpMarker.bindTooltip(
          `<div style="font-size:10.5px; font-weight:bold; color:#7C3AED; padding:2px 4px;">Titik Singgah Kustom</div>`,
          { permanent: true, direction: "top" }
        );
        activeRouteLayerRef.current?.addLayer(wpMarker);
      }

      // Fit viewport proporsional sesuai Requirement 4
      const bounds = coreLine.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
          duration: 1.2,
        });
      }
    }
  };

  // Pilih Route Index (Utama / Alternatif)
  const handleSelectRouteIndex = (newIndex: number) => {
    setActiveNavRoute((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        selectedRouteIndex: newIndex,
      };
      renderNavRoutesOnMap(updated.routes, newIndex, updated.transportMode);
      return updated;
    });
  };

  // Ganti Moda Transportasi (Motor, Mobil, Jalan Kaki)
  const handleSelectTransportMode = (newMode: "motorcycle" | "car" | "walking") => {
    setActiveNavRoute((prev) => {
      if (!prev) return null;
      const updatedRoutes = prev.routes.map((rt) => {
        const durSec = computeModeDuration(rt.distanceMeters, rt.durationSeconds, newMode);
        return {
          ...rt,
          durationText: formatNavDuration(durSec),
        };
      });

      const updated = {
        ...prev,
        transportMode: newMode,
        routes: updatedRoutes,
      };
      renderNavRoutesOnMap(updatedRoutes, prev.selectedRouteIndex, newMode);
      return updated;
    });
  };

  // Preview Rute untuk 3 Klasifikasi & Waypoint di Card Detail Posko Evakuasi
  const previewShelterRoute = (
    shelter: MapShelterPoint,
    classification: 1 | 2 | 3 | "custom",
    customWpData?: {
      lat: number;
      lng: number;
      distanceText?: string;
      durationText?: string;
      coordinates?: [number, number][];
    } | null
  ) => {
    if (!mapInstanceRef.current) return;
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    } else {
      activeRouteLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : [-6.3490, 108.1165];
    const userLat = startCoord[0];
    const userLng = startCoord[1];
    const poskoLat = shelter.lat;
    const poskoLng = shelter.lng;

    const baseMeters = parseDistanceInMeters(shelter.distance);
    const baseMinutes = Math.max(2, Math.round(baseMeters / 300));

    // Coordinates generation for preview
    // 1. Primary Pantura (Jalur teraman & bebas banjir)
    const route1Coords: [number, number][] = [
      [userLat, userLng],
      [-6.3508, 108.1188],
      [-6.3548, 108.1246],
      [-6.3610, 108.1318],
      [-6.3688, 108.1394],
      [-6.3780, 108.1470],
      [-6.3825, 108.1498],
      [poskoLat, poskoLng],
    ];

    // 2. Coastal / Tanggul (Rawan Genangan 15-25 cm)
    const midLat = (userLat + poskoLat) / 2;
    const midLng = (userLng + poskoLng) / 2;
    const route2Coords: [number, number][] = [
      [userLat, userLng],
      [userLat + 0.004, userLng + 0.005],
      [midLat + 0.007, midLng - 0.003],
      [poskoLat + 0.004, poskoLng - 0.002],
      [poskoLat, poskoLng],
    ];

    // 3. Bypass Lingkar Luar (Jauh & Aman)
    const route3Coords: [number, number][] = [
      [userLat, userLng],
      [userLat - 0.012, userLng + 0.003],
      [midLat - 0.018, midLng + 0.010],
      [poskoLat - 0.008, poskoLng + 0.008],
      [poskoLat, poskoLng],
    ];

    if (classification === 1) {
      // Opsi 1: "Terdekat & Aman" (Rekomendasi Utama)
      const glow = L.polyline(route1Coords, { color: "#ffffff", weight: 10, opacity: 0.95 });
      const core = L.polyline(route1Coords, { color: "#2D6A4F", weight: 6, opacity: 0.95 });
      const accent = L.polyline(route1Coords, { color: "#6EE7B7", weight: 2.5, dashArray: "8, 12", opacity: 0.95 });

      const tooltipHtml = `
        <div style="background: #1B4D3E; color: white; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1.5px solid #34D399; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>${formatNavDistance(baseMeters)} &bull; ±${baseMinutes} mnt</span>
          <span style="background: #34D399; color: #064E3B; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900;">Bebas Banjir • Rekomendasi BPBD</span>
        </div>
      `;
      core.bindTooltip(tooltipHtml, { permanent: true, direction: "center", className: "dermayu-route-badge" });

      activeRouteLayerRef.current.addLayer(glow);
      activeRouteLayerRef.current.addLayer(core);
      activeRouteLayerRef.current.addLayer(accent);

      const bounds = core.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      }
    } else if (classification === 2) {
      // Opsi 2: "Terdekat tapi Ada Genangan" (Rute Waspada)
      const r2Dist = Math.round(baseMeters * 0.78);
      const r2Dur = Math.max(2, Math.round(baseMinutes * 0.75));

      const line = L.polyline(route2Coords, {
        color: "#F59E0B",
        weight: 5.5,
        opacity: 0.95,
        dashArray: "6, 8",
        lineCap: "round",
      });

      const tooltipHtml = `
        <div style="background: #78350F; color: white; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1.5px solid #FBBF24; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>${formatNavDistance(r2Dist)} &bull; ±${r2Dur} mnt</span>
          <span style="background: #FBBF24; color: #78350F; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900;">Rawan Genangan (15-25 cm)</span>
        </div>
      `;
      line.bindTooltip(tooltipHtml, { permanent: true, direction: "center", className: "dermayu-route-badge" });

      const warnPoint = route2Coords[2];
      const warnIcon = L.divIcon({
        className: "custom-genangan-marker",
        html: `
          <div style="background: #DC2626; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(220,38,38,0.5); font-size: 12px; font-weight: bold;">
            ⚠️
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const warnMarker = L.marker(warnPoint, { icon: warnIcon });
      warnMarker.bindTooltip(
        `<div style="font-size:10.5px; font-weight:bold; color:#DC2626; padding:2px 4px;">Titik Genangan Rob (15-25 cm)</div>`,
        { permanent: true, direction: "top" }
      );

      activeRouteLayerRef.current.addLayer(line);
      activeRouteLayerRef.current.addLayer(warnMarker);

      const bounds = line.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      }
    } else if (classification === 3) {
      // Opsi 3: "Jauh & Aman" (Jalur Alternatif Memutar)
      const r3Dist = Math.round(baseMeters * 2.45);
      const r3Dur = Math.max(4, Math.round(baseMinutes * 2.25));

      const line = L.polyline(route3Coords, {
        color: "#64748B",
        weight: 4.5,
        opacity: 0.85,
        dashArray: "4, 6",
        lineCap: "round",
      });

      const tooltipHtml = `
        <div style="background: #334155; color: white; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1.5px solid #94A3B8; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>${formatNavDistance(r3Dist)} &bull; ±${r3Dur} mnt</span>
          <span style="background: #94A3B8; color: #0F172A; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900;">Jalur Kering Alternatif</span>
        </div>
      `;
      line.bindTooltip(tooltipHtml, { permanent: true, direction: "center", className: "dermayu-route-badge" });

      activeRouteLayerRef.current.addLayer(line);

      const bounds = line.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      }
    } else if (classification === "custom" && customWpData) {
      // Custom Waypoint route
      const wpCoords = customWpData.coordinates || [
        [userLat, userLng],
        [customWpData.lat, customWpData.lng],
        [poskoLat, poskoLng],
      ];

      const line = L.polyline(wpCoords, {
        color: "#7C3AED",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
      });

      const tooltipHtml = `
        <div style="background: #5B21B6; color: white; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); border: 1.5px solid #A78BFA; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          <span>${customWpData.distanceText || "9.5 km"} &bull; ${customWpData.durationText || "14 mnt"}</span>
          <span style="background: #A78BFA; color: #2E1065; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 900;">Jalur Kustom Waypoint</span>
        </div>
      `;
      line.bindTooltip(tooltipHtml, { permanent: true, direction: "center", className: "dermayu-route-badge" });

      const wpIcon = L.divIcon({
        className: "custom-wp-pin",
        html: `
          <div style="background: #7C3AED; color: white; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(124,58,237,0.5); font-size: 13px; font-weight: bold;">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const wpMarker = L.marker([customWpData.lat, customWpData.lng], { icon: wpIcon });
      wpMarker.bindTooltip(
        `<div style="font-size:10.5px; font-weight:bold; color:#7C3AED; padding:2px 4px;">Titik Singgah Kustom</div>`,
        { permanent: true, direction: "top" }
      );

      activeRouteLayerRef.current.addLayer(line);
      activeRouteLayerRef.current.addLayer(wpMarker);

      const bounds = line.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      }
    }
  };

  // Handler klik peta saat mode titik singgah aktif
  const handleMapClickForWaypoint = async (lat: number, lng: number) => {
    setIsPickingWaypoint(false);
    isPickingWaypointRef.current = false;
    const shelter = activeShelterRef.current;
    if (!shelter) return;

    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : [-6.3490, 108.1165];
    const userLat = startCoord[0];
    const userLng = startCoord[1];
    const wpLat = lat;
    const wpLng = lng;
    const poskoLat = shelter.lat;
    const poskoLng = shelter.lng;

    setToastMessage("Menghitung rute kustom via titik singgah (OSRM)...");

    let wpDistMeters = 0;
    let wpDurSeconds = 0;
    let coords: [number, number][] = [];

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${wpLng},${wpLat};${poskoLng},${poskoLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.[0]) {
          const r = data.routes[0];
          coords = (r.geometry?.coordinates || []).map(
            ([cLng, cLat]: [number, number]) => [cLat, cLng] as [number, number]
          );
          wpDistMeters = Math.round(r.distance || 9500);
          wpDurSeconds = Math.round(r.duration || 780);
        }
      }
    } catch {
      // Fallback
    }

    if (coords.length === 0) {
      coords = [
        [userLat, userLng],
        [wpLat, wpLng],
        [poskoLat, poskoLng],
      ];
      wpDistMeters = Math.round(parseDistanceInMeters(shelter.distance) * 1.3);
      wpDurSeconds = Math.round((wpDistMeters / 300) * 60);
    }

    const distText = formatNavDistance(wpDistMeters);
    const durText = formatNavDuration(wpDurSeconds);

    const wpData = {
      lat: wpLat,
      lng: wpLng,
      distanceText: distText,
      durationText: durText,
      coordinates: coords,
    };

    setCustomWaypoint(wpData);
    setSelectedRouteClassification("custom");
    previewShelterRoute(shelter, "custom", wpData);

    setToastMessage(`Titik singgah berhasil disetel (${distText} • ${durText})`);
    setTimeout(() => setToastMessage(null), 3000);
  };
  handleMapClickForWaypointRef.current = handleMapClickForWaypoint;

  // Eksekusi Pembuatan Rute Jalan Aktual (OSRM API + Fallback)
  // Menghasilkan 3 opsi klasifikasi + custom waypoint jika disetel
  const drawSafeRoute = async (
    shelter: MapShelterPoint,
    initialMode: "motorcycle" | "car" | "walking" = "motorcycle",
    initialRouteIndex: number = 0,
    customWp?: any
  ) => {
    if (!mapInstanceRef.current) return;

    setIsRoutingLoading(true);
    setPoskoExpanded(true);
    setActiveShelterDetail(null); // Tutup detail posko statis, beralih ke mode navigasi aktif

    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : [-6.3490, 108.1165];
    const userLat = startCoord[0];
    const userLng = startCoord[1];
    const poskoLat = shelter.lat;
    const poskoLng = shelter.lng;

    const baseMeters = parseDistanceInMeters(shelter.distance);
    const baseMinutes = Math.max(2, Math.round(baseMeters / 300));

    let osrmCoords: [number, number][] = [];
    let osrmDist = baseMeters;
    let osrmDur = baseMinutes * 60;
    let osrmSteps: NavigationStep[] = [];

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${poskoLng},${poskoLat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
          const r = data.routes[0];
          osrmCoords = (r.geometry?.coordinates || []).map(
            ([cLng, cLat]: [number, number]) => [cLat, cLng] as [number, number]
          );
          osrmDist = Math.round(r.distance || baseMeters);
          osrmDur = Math.round(r.duration || baseMinutes * 60);

          const rawSteps = r.legs?.[0]?.steps || [];
          osrmSteps = rawSteps.map((st: any) => {
            const street = st.name || "Jalan Penghubung";
            let instr = `Lurus di ${street}`;
            if (st.maneuver?.type === "depart") instr = `Mulai dari titik Anda menuju ${street}`;
            else if (st.maneuver?.type === "arrive") instr = `Tiba di ${shelter.name}`;
            else if (st.maneuver?.modifier === "right") instr = `Belok kanan ke ${street}`;
            else if (st.maneuver?.modifier === "left") instr = `Belok kiri ke ${street}`;
            else if (st.maneuver?.modifier === "slight right") instr = `Belok sedikit ke kanan ke ${street}`;
            else if (st.maneuver?.modifier === "slight left") instr = `Belok sedikit ke kiri ke ${street}`;
            return {
              instruction: instr,
              distance: formatNavDistance(st.distance || 0),
              type: st.maneuver?.type,
              modifier: st.maneuver?.modifier,
            };
          });
        }
      }
    } catch {
      // Fallback
    }

    if (osrmCoords.length === 0) {
      osrmCoords = [
        [userLat, userLng],
        [-6.3508, 108.1188],
        [-6.3525, 108.1215],
        [-6.3548, 108.1246],
        [-6.3575, 108.1278],
        [-6.3610, 108.1318],
        [-6.3645, 108.1355],
        [-6.3688, 108.1394],
        [-6.3735, 108.1435],
        [-6.3780, 108.1470],
        [-6.3825, 108.1498],
        [poskoLat, poskoLng],
      ];
      osrmSteps = [
        { instruction: "Mulai dari lokasi Anda menuju Jl. Raya Pantura", distance: "300 m" },
        { instruction: "Lurus di Jl. Raya Pantura (jalur bebas genangan)", distance: formatNavDistance(Math.round(baseMeters * 0.7)) },
        { instruction: "Belok sedikit ke kanan menuju gerbang posko", distance: "250 m" },
        { instruction: `Tiba di lokasi evakuasi ${shelter.name}`, distance: "100 m" },
      ];
    }

    // 2. Coastal / Tanggul (Rawan Genangan 15-25 cm)
    const midLat = (userLat + poskoLat) / 2;
    const midLng = (userLng + poskoLng) / 2;
    const route2Coords: [number, number][] = [
      [userLat, userLng],
      [userLat + 0.004, userLng + 0.005],
      [midLat + 0.007, midLng - 0.003],
      [poskoLat + 0.004, poskoLng - 0.002],
      [poskoLat, poskoLng],
    ];
    const r2DistMeters = Math.round(osrmDist * 0.78);
    const r2DurSeconds = Math.round(osrmDur * 0.75);

    // 3. Bypass Lingkar Luar (Jauh & Aman)
    const route3Coords: [number, number][] = [
      [userLat, userLng],
      [userLat - 0.012, userLng + 0.003],
      [midLat - 0.018, midLng + 0.010],
      [poskoLat - 0.008, poskoLng + 0.008],
      [poskoLat, poskoLng],
    ];
    const r3DistMeters = Math.round(osrmDist * 2.45);
    const r3DurSeconds = Math.round(osrmDur * 2.25);

    const computedRoutes: NavigationRouteOption[] = [
      {
        id: "rt-1-safe",
        name: "Terdekat & Aman (lewat Jl. Raya Pantura)",
        summary: "lewat Jl. Raya Pantura",
        distanceText: formatNavDistance(osrmDist),
        distanceMeters: osrmDist,
        durationText: formatNavDuration(computeModeDuration(osrmDist, osrmDur, initialMode)),
        durationSeconds: osrmDur,
        statusBadge: "Bebas Banjir • Rekomendasi BPBD",
        statusBadgeType: "safe",
        coordinates: osrmCoords,
        steps: osrmSteps,
      },
      {
        id: "rt-2-warning",
        name: "Terdekat tapi Ada Genangan (lewat Jl. Nelayan Pesisir)",
        summary: "lewat Jl. Nelayan Pesisir / Tanggul",
        distanceText: formatNavDistance(r2DistMeters),
        distanceMeters: r2DistMeters,
        durationText: formatNavDuration(computeModeDuration(r2DistMeters, r2DurSeconds, initialMode)),
        durationSeconds: r2DurSeconds,
        statusBadge: "Rawan Genangan (15-25 cm)",
        statusBadgeType: "warning",
        coordinates: route2Coords,
        steps: [
          { instruction: "Mulai dari lokasi Anda ke arah utara menuju pesisir", distance: "350 m" },
          { instruction: "Melintasi Jalur Nelayan Pesisir (titik genangan air rob semata kaki)", distance: formatNavDistance(Math.round(r2DistMeters * 0.6)) },
          { instruction: "Belok ke selatan menuju simpang posko", distance: "250 m" },
          { instruction: `Tiba di ${shelter.name}`, distance: "100 m" },
        ],
      },
      {
        id: "rt-3-detour",
        name: "Jauh & Aman (lewat By-Pass Lingkar Luar)",
        summary: "lewat By-Pass Lingkar Luar",
        distanceText: formatNavDistance(r3DistMeters),
        distanceMeters: r3DistMeters,
        durationText: formatNavDuration(computeModeDuration(r3DistMeters, r3DurSeconds, initialMode)),
        durationSeconds: r3DurSeconds,
        statusBadge: "Jalur Kering Alternatif",
        statusBadgeType: "detour",
        coordinates: route3Coords,
        steps: [
          { instruction: "Mulai dari lokasi Anda menuju By-Pass Lingkar Luar", distance: "500 m" },
          { instruction: "Lurus di Jalur By-Pass Lingkar Luar (jalur kering bebas genangan total)", distance: formatNavDistance(Math.round(r3DistMeters * 0.8)) },
          { instruction: "Masuk ke gerbang posko evakuasi", distance: "300 m" },
          { instruction: `Tiba di ${shelter.name}`, distance: "100 m" },
        ],
      },
    ];

    if (customWp && customWp.lat && customWp.lng) {
      const customCoords = customWp.coordinates || [
        [userLat, userLng],
        [customWp.lat, customWp.lng],
        [poskoLat, poskoLng],
      ];
      computedRoutes.push({
        id: "rt-custom-waypoint",
        name: "Jalur Kustom (via Titik Singgah Pilihan)",
        summary: "via Titik Singgah Anda",
        distanceText: customWp.distanceText || formatNavDistance(Math.round(osrmDist * 1.3)),
        distanceMeters: Math.round(osrmDist * 1.3),
        durationText: customWp.durationText || formatNavDuration(computeModeDuration(Math.round(osrmDist * 1.3), Math.round(osrmDur * 1.3), initialMode)),
        durationSeconds: Math.round(osrmDur * 1.3),
        statusBadge: "Jalur Kustom Waypoint",
        statusBadgeType: "custom",
        coordinates: customCoords,
        steps: [
          { instruction: "Mulai dari titik lokasi Anda", distance: "300 m" },
          { instruction: "Menuju titik singgah pilihan Anda", distance: formatNavDistance(Math.round(osrmDist * 0.7)) },
          { instruction: `Melanjutkan perjalanan menuju ${shelter.name}`, distance: formatNavDistance(Math.round(osrmDist * 0.6)) },
          { instruction: `Tiba di posko evakuasi ${shelter.name}`, distance: "100 m" },
        ],
      });
    }

    const safeSelectedIdx = Math.min(initialRouteIndex, computedRoutes.length - 1);

    const navData: ActiveNavRouteData = {
      shelter,
      originName: "Lokasi Anda",
      originCoords: startCoord,
      destinationName: shelter.name,
      destinationCoords: [poskoLat, poskoLng],
      transportMode: initialMode,
      routes: computedRoutes,
      selectedRouteIndex: safeSelectedIdx,
      showingSteps: false,
    };

    setActiveNavRoute(navData);
    setIsRoutingLoading(false);

    // Gambar di peta dan pusatkan kamera
    renderNavRoutesOnMap(computedRoutes, safeSelectedIdx, initialMode);

    setToastMessage(`Navigasi rute aktif: Menuju ${shelter.name}`);
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

  const handleBackToShelterDetail = () => {
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    const targetShelter = activeNavRoute?.shelter;
    setActiveNavRoute(null);
    if (targetShelter) {
      setActiveShelterDetail(targetShelter);
      setPoskoExpanded(true);
    }
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
        setUserCoords([latitude, longitude]);
        setIsGpsLocked(true);
        updateUserMarkerOnMap(latitude, longitude, accuracy);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
        }

        setToastMessage(`GPS Terkunci: Menampilkan ${shelterLimit} posko terdekat dari lokasi Anda`);
        setTimeout(() => setToastMessage(null), 3000);
      },
      () => {
        setLocating(false);
        setToastMessage("Izin akses lokasi ditolak oleh peramban. Menggunakan koordinat siaga.");
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




  // Helper render kartu item posko (konsisten antara mode default & mode pencarian)
  const renderShelterCardItem = (sh: MapShelterPoint, index: number, showClosestBadge = false) => {
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
            {showClosestBadge && index === 0 && (
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

        {/* Sisi Kanan: Thumbnail Foto Gedung Posko */}
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
  };

  // Render Konten Detail Lokasi / Navigasi (Dipakai di Desktop Card 2 & Mobile Bottom Sheet)
  const renderDetailContent = (isMobileSheet = false) => {
    if (activeNavRoute) {
      if (isMobileSheet && sheetSnap === "compact") {
        const selectedRt = activeNavRoute.routes[activeNavRoute.selectedRouteIndex];
        return (
          <div className="flex items-center justify-between gap-2 p-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-[#2D6A4F] flex items-center justify-center shrink-0">
                {activeNavRoute.transportMode === "motorcycle" ? (
                  <Bike className="w-5 h-5" />
                ) : activeNavRoute.transportMode === "car" ? (
                  <Car className="w-5 h-5" />
                ) : (
                  <Footprints className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-[#132422]">
                    {selectedRt?.durationText || "11 mnt"} &bull; {selectedRt?.distanceText || "8.1 km"}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedRt?.statusBadge || "Bebas Genangan"}
                  </span>
                </div>
                <p className="text-[10px] text-[#4B635F] truncate leading-tight mt-0.5">
                  Menuju: <strong className="text-slate-800">{activeNavRoute.shelter.name}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetSnap("medium");
                }}
                className="h-8 px-2.5 rounded-lg bg-emerald-50 text-[#2D6A4F] text-[10.5px] font-extrabold hover:bg-emerald-100 border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Milestone className="w-3.5 h-3.5" />
                <span>Langkah</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearNavRoute();
                }}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Selesai Navigasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className={`flex flex-col min-h-0 flex-1 overflow-y-auto scrollbar-none md:scrollbar-thin animate-in fade-in slide-in-from-left-2 duration-200 ${isMobileSheet ? "space-y-2 pb-2" : ""}`}>
          {/* Routing Loading Indicator */}
          {isRoutingLoading && (
            <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-[10.5px] font-bold text-emerald-800 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              <span>Menghitung rute jalan aktual (OSRM)...</span>
            </div>
          )}
          {/* Tab Pilihan Moda Transportasi */}
          <div className="flex items-center border-b border-gray-100 bg-white shrink-0 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => handleSelectTransportMode("motorcycle")}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${
                activeNavRoute.transportMode === "motorcycle"
                  ? "border-[#2D6A4F] text-[#2D6A4F] bg-emerald-50/50 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold"
              }`}
            >
              <Bike className="w-4 h-4" />
              <span className="text-[10px] leading-tight">
                {activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.durationText || "11 mnt"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectTransportMode("car")}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${
                activeNavRoute.transportMode === "car"
                  ? "border-[#2D6A4F] text-[#2D6A4F] bg-emerald-50/50 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold"
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="text-[10px] leading-tight">
                {formatNavDuration(
                  computeModeDuration(
                    activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.distanceMeters || 8100,
                    activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.durationSeconds || 660,
                    "car"
                  )
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectTransportMode("walking")}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${
                activeNavRoute.transportMode === "walking"
                  ? "border-[#2D6A4F] text-[#2D6A4F] bg-emerald-50/50 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold"
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span className="text-[10px] leading-tight">
                {formatNavDuration(
                  computeModeDuration(
                    activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.distanceMeters || 8100,
                    activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.durationSeconds || 660,
                    "walking"
                  )
                )}
              </span>
            </button>
          </div>

          {/* Input Titik Awal & Titik Tujuan (Gaya Google Maps) */}
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-gray-100 flex items-center gap-2.5 shrink-0">
            <div className="flex flex-col items-center shrink-0 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-300" />
              <span className="w-0.5 h-6 border-l-2 border-dashed border-slate-300 my-0.5" />
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-slate-800 flex items-center justify-between shadow-2xs">
                <span className="truncate">Lokasi Anda</span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  Titik Awal
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-black text-slate-800 truncate shadow-2xs">
                {activeNavRoute.shelter.name}
              </div>
            </div>
          </div>

          {/* Status Bar Keberangkatan */}
          <div className="px-3 py-1.5 bg-white rounded-xl border border-gray-100 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2D6A4F]" />
              <span>Berangkat sekarang &bull; Jalur pantau aktif</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-black text-[8.5px]">
              BPBD LIVE
            </span>
          </div>

          {/* List Pilihan Opsi Rute */}
          <div className="space-y-1.5 flex-1 min-h-0">
            {activeNavRoute.routes.map((rt, idx) => {
              const isSelected = idx === activeNavRoute.selectedRouteIndex;
              const isSafe = rt.statusBadgeType === "safe";
              return (
                <div
                  key={rt.id}
                  onClick={() => handleSelectRouteIndex(idx)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-emerald-50/80 border-[#2D6A4F] shadow-xs ring-1 ring-[#2D6A4F]/20"
                      : "bg-white hover:bg-slate-50 border-gray-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-[#2D6A4F] text-white border-[#1B4D3E]"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {activeNavRoute.transportMode === "motorcycle" ? (
                          <Bike className="w-4 h-4" />
                        ) : activeNavRoute.transportMode === "car" ? (
                          <Car className="w-4 h-4" />
                        ) : (
                          <Footprints className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-[11.5px] text-[#132422] truncate leading-tight">
                          {rt.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {isSafe ? "Rute tercepat & jalur darat aman" : "Jalur pesisir alternatif"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[12px] font-black block leading-tight ${isSelected ? "text-[#1B4D3E]" : "text-slate-800"}`}>
                        {rt.durationText}
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-bold block">
                        {rt.distanceText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-gray-100/80">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold border ${
                        isSafe
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {rt.statusBadge}
                    </span>

                    {isSelected ? (
                      <span className="text-[10px] font-bold text-[#2D6A4F] flex items-center gap-0.5">
                        <span>Rute Terpilih</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-bold text-slate-400">
                        Klik untuk beralih
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Panduan Langkah Turn-by-Turn */}
            {activeNavRoute.showingSteps && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
                <h6 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                  <Milestone className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Panduan Langkah Demi Langkah</span>
                </h6>
                <div className="space-y-1.5">
                  {(activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.steps || []).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-left">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                        {sIdx === 0 ? "🏁" : sIdx}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] font-bold text-slate-800 leading-tight">
                          {step.instruction}
                        </p>
                        <span className="text-[9.5px] text-slate-500">{step.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row Navigasi */}
          <div className="pt-1 space-y-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveNavRoute((prev) =>
                  prev ? { ...prev, showingSteps: !prev.showingSteps } : null
                );
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer border border-[#1B4D3E]"
            >
              <Milestone className="w-3.5 h-3.5" />
              <span>
                {activeNavRoute.showingSteps
                  ? "Sembunyikan Panduan Langkah"
                  : "Mulai Panduan Langkah Demi Langkah"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleClearNavRoute}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-gray-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <X className="w-3 h-3 text-slate-500" />
              <span>Tutup Navigasi / Selesai</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeShelterDetail) {
      const activeMeta = SHELTER_METADATA[activeShelterDetail.id] || {
        photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
        rating: "Siaga 24 Jam",
        eta: "±4 mnt",
        avoidArea: "Menghindari Genangan Pesisir",
        emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
      };

      if (isMobileSheet && sheetSnap === "compact") {
        return (
          <div className="flex items-center justify-between gap-2.5 p-1 animate-in fade-in duration-150">
            {/* Mini Thumbnail */}
            <div className="relative w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-slate-100 shadow-xs">
              <img
                src={activeMeta.photoUrl}
                alt={activeShelterDetail.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <span className="absolute bottom-0.5 left-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>

            {/* Info Teks */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                {activeShelterDetail.name}
              </h4>
              <p className="text-[10px] text-[#4B635F] truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#2D6A4F] shrink-0" />
                <span>{activeShelterDetail.distance.split("(")[0].trim()} &bull; Siaga 24 Jam</span>
              </p>
              <div className="text-[9.5px] text-slate-500 font-semibold mt-0.5 truncate">
                Kapasitas: <strong className="text-emerald-700 font-bold">{activeShelterDetail.capacityFilled}/{activeShelterDetail.capacityTotal}</strong> Jiwa
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  drawSafeRoute(activeShelterDetail);
                }}
                className="h-8.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E]"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                <span>Rute</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetSnap("medium");
                }}
                className="h-8.5 w-8.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Buka Detail Lengkap"
                aria-label="Buka Detail Lengkap"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="h-8.5 w-8.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Tutup Posko"
                aria-label="Tutup Posko"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className={`overflow-y-auto flex-1 min-h-0 space-y-2 scrollbar-none md:scrollbar-thin animate-in fade-in slide-in-from-left-2 duration-200 ${isMobileSheet ? "space-y-2.5 pb-2" : "p-2.5 space-y-1.5"}`}>
          {/* 1. Atas: Foto Posko Riil */}
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-xs border border-gray-200 bg-slate-100">
            <img
              src={activeMeta.photoUrl}
              alt={activeShelterDetail.name}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* 2. Identitas & Lokasi */}
          <div className="space-y-0.5">
            <h3 className="font-bold text-[13px] sm:text-sm text-slate-800 leading-tight truncate">
              {activeShelterDetail.name}
            </h3>
            <p className="text-[10.5px] text-slate-500 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
              <span>{activeShelterDetail.location} &bull; {activeShelterDetail.distance.split("(")[0].trim()} dari Anda</span>
            </p>
          </div>

          {/* 3. Ringkasan Esensial Kapasitas & Kuwu */}
          <div className="py-1 border-t border-b border-gray-100 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-600 gap-1">
              <span className="truncate">
                Kapasitas: <strong className="text-emerald-700 font-extrabold">{activeShelterDetail.capacityFilled}/{activeShelterDetail.capacityTotal}</strong>
                <span className="text-slate-400"> (Sisa {activeShelterDetail.capacityTotal - activeShelterDetail.capacityFilled})</span>
              </span>
              <span className="text-[10.5px] text-slate-500 shrink-0">
                Kuwu: <strong className="text-slate-800">{activeShelterDetail.contactPerson}</strong>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
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

          {/* 4. Baris Tombol Aksi (Desain & Penempatan Identik Gambar 2) */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() =>
                drawSafeRoute(
                  activeShelterDetail,
                  "motorcycle",
                  selectedRouteClassification === 2 ? 1 : selectedRouteClassification === 3 ? 2 : selectedRouteClassification === "custom" ? 3 : 0,
                  customWaypoint
                )
              }
              className="h-8.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4D3E] text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#1B4D3E] flex-1 min-w-0"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">Arahkan Rute</span>
            </button>

            <a
              href={`tel:${activeShelterDetail.contactPhone.replace(/[^0-9]/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              title={`Hubungi ${activeShelterDetail.contactPerson} (${activeShelterDetail.contactPhone})`}
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
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
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
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
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* 5. SECTION PILIHAN & SARAN RUTE EVAKUASI (GAYA GOOGLE MAPS) */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11.5px] font-black text-slate-900 flex items-center gap-1.5">
                <span>Pilihan &amp; Saran Rute Evakuasi</span>
              </h4>
              <span className="text-[9.5px] font-extrabold text-[#2D6A4F] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                3 Klasifikasi Jalur
              </span>
            </div>

            {/* Deretan 3 Klasifikasi Kartu Selector */}
            <div className="space-y-1.5">
              {/* Opsi 1: Terdekat & Aman (Rekomendasi Utama - Default Active) */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(1);
                  previewShelterRoute(activeShelterDetail, 1);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedRouteClassification === 1
                    ? "bg-[#F4FBF7] border-[#2D6A4F] ring-1 ring-[#2D6A4F]/30 shadow-xs"
                    : "bg-white hover:bg-emerald-50/30 border-gray-200 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRouteClassification === 1
                          ? "border-[#2D6A4F] bg-[#2D6A4F]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedRouteClassification === 1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11.5px] font-extrabold text-[#132422]">
                          Terdekat &amp; Aman
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black bg-[#2D6A4F] text-white tracking-wider">
                          REKOMENDASI UTAMA
                        </span>
                      </div>
                      <p className="text-[10.5px] font-extrabold text-[#2D6A4F] mt-0.5">
                        {activeShelterDetail.distance.split("(")[0].trim()} &bull; {activeMeta.eta} lewat Jl. Raya Pantura
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    Bebas Banjir • Rekomendasi BPBD
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-500 mt-1 pl-6 leading-relaxed">
                  Kondisi jalan aspal kering, elevasi tinggi aman dari luapan rob.
                </p>
              </div>

              {/* Opsi 2: Terdekat tapi Ada Genangan (Rute Waspada) */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(2);
                  previewShelterRoute(activeShelterDetail, 2);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedRouteClassification === 2
                    ? "bg-[#FFFBEB] border-amber-300 ring-1 ring-amber-400/30 shadow-xs"
                    : "bg-white hover:bg-amber-50/30 border-gray-200 hover:border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRouteClassification === 2
                          ? "border-amber-600 bg-amber-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedRouteClassification === 2 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11.5px] font-extrabold text-[#132422]">
                          Terdekat tapi Ada Genangan
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black bg-amber-500 text-white tracking-wider">
                          WASPADA
                        </span>
                      </div>
                      <p className="text-[10.5px] font-extrabold text-amber-700 mt-0.5">
                        {formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 0.78))} &bull; ±{Math.max(2, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 0.75))} mnt lewat Jl. Nelayan Pesisir
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                    Rawan Genangan (15-25 cm)
                  </span>
                </div>
                <p className="text-[9.5px] text-amber-900/80 mt-1 pl-6 leading-relaxed">
                  Jalur lebih cepat namun terdapat titik genangan air rob semata kaki, hanya disarankan untuk kendaraan roda 4 / truk evakuasi.
                </p>
              </div>

              {/* Opsi 3: Jauh & Aman (Jalur Alternatif Memutar) */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(3);
                  previewShelterRoute(activeShelterDetail, 3);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedRouteClassification === 3
                    ? "bg-slate-50 border-slate-400 ring-1 ring-slate-400/30 shadow-xs"
                    : "bg-white hover:bg-slate-50 border-gray-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRouteClassification === 3
                          ? "border-slate-700 bg-slate-700"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedRouteClassification === 3 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11.5px] font-extrabold text-[#132422]">
                          Jauh &amp; Aman
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black bg-slate-500 text-white tracking-wider">
                          MEMUTAR
                        </span>
                      </div>
                      <p className="text-[10.5px] font-extrabold text-slate-700 mt-0.5">
                        {formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 2.45))} &bull; ±{Math.max(4, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 2.25))} mnt lewat By-Pass Lingkar Luar
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
                    Jalur Kering Alternatif
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-500 mt-1 pl-6 leading-relaxed">
                  Memutar melewati area perkantoran/perbukitan datar bebas genangan total, cocok untuk konvoi warga.
                </p>
              </div>

              {/* Opsi Kustom: Tentukan Jalur Sendiri (Custom Waypoint) */}
              <div
                onClick={() => {
                  if (customWaypoint) {
                    setSelectedRouteClassification("custom");
                    previewShelterRoute(activeShelterDetail, "custom", customWaypoint);
                  } else {
                    setIsPickingWaypoint(true);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedRouteClassification === "custom"
                    ? "bg-purple-50/80 border-purple-500 ring-1 ring-purple-500/30 shadow-xs"
                    : "bg-white hover:bg-purple-50/30 border-gray-200 hover:border-purple-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRouteClassification === "custom"
                          ? "border-purple-600 bg-purple-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedRouteClassification === "custom" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11.5px] font-extrabold text-[#132422]">
                          Tentukan Jalur Sendiri (Custom Waypoint) ✏️
                        </span>
                        {customWaypoint && (
                          <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black bg-purple-600 text-white tracking-wider">
                            AKTIF
                          </span>
                        )}
                      </div>
                      {customWaypoint ? (
                        <p className="text-[10.5px] font-extrabold text-purple-700 mt-0.5">
                          {customWaypoint.distanceText} &bull; {customWaypoint.durationText} via Titik Singgah Pilihan Anda
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Pilih titik jalan yang ingin Anda lewati secara manual di peta.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPickingWaypoint(true);
                      setToastMessage("Klik jalan pada peta untuk menentukan titik singgah");
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold border border-purple-300 transition active:scale-95 cursor-pointer shrink-0"
                  >
                    {customWaypoint ? "Ubah Titik" : "Pilih di Peta"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeReportDetail) {
      if (isMobileSheet && sheetSnap === "compact") {
        return (
          <div className="flex items-center justify-between gap-2.5 p-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                activeReportDetail.severity === "CRITICAL"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                  {activeReportDetail.title}
                </h4>
                <p className="text-[10px] text-rose-700 font-bold truncate mt-0.5">
                  TMA: {activeReportDetail.waterLevelText || "±45 cm"} &bull; {activeReportDetail.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetSnap("medium");
                }}
                className="h-8 px-2.5 rounded-lg bg-gray-100 text-slate-700 text-[10.5px] font-bold hover:bg-gray-200 transition active:scale-95 cursor-pointer"
              >
                Detail
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className={`overflow-y-auto flex-1 min-h-0 space-y-2 scrollbar-none md:scrollbar-thin animate-in fade-in slide-in-from-left-2 duration-200 ${isMobileSheet ? "space-y-2.5 pb-2" : "p-2.5"}`}>
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
      );
    }

    if (activeTelemetryDetail) {
      if (isMobileSheet && sheetSnap === "compact") {
        return (
          <div className="flex items-center justify-between gap-2.5 p-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-sky-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                  {activeTelemetryDetail.name}
                </h4>
                <p className="text-[10px] text-sky-800 font-bold truncate mt-0.5">
                  TMA: {activeTelemetryDetail.waterLevel} &bull; Tren: {activeTelemetryDetail.trend}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetSnap("medium");
                }}
                className="h-8 px-2.5 rounded-lg bg-sky-50 text-sky-800 text-[10.5px] font-bold hover:bg-sky-100 border border-sky-200/80 transition active:scale-95 cursor-pointer"
              >
                Detail
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className={`overflow-y-auto flex-1 min-h-0 space-y-2 scrollbar-none md:scrollbar-thin animate-in fade-in slide-in-from-left-2 duration-200 ${isMobileSheet ? "space-y-2.5 pb-2" : "p-2.5"}`}>
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
      );
    }

    return null;
  };

  return (
    <div
      ref={rootContainerRef}
      className={`relative w-full rounded-none overflow-hidden border-0 bg-white shadow-none flex flex-col isolate z-0 [&_.leaflet-bottom.leaflet-right]:bottom-20 md:[&_.leaflet-bottom.leaflet-right]:bottom-3 ${isFullscreen
          ? "fixed inset-0 !z-[9999] w-screen h-screen"
          : className || "h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)]"
        }`}
    >
      {/* Map Canvas & Floating Controls Wrapper (100% Edge-to-Edge) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Leaflet Map Body Container */}
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* ============================================================== */}
        {/* 1. UNIFIED HUD: SEARCH BAR, KATEGORI & POSKO EVAKUASI         */}
        {/* ============================================================== */}
        <div
          className={`absolute top-3.5 inset-x-3.5 md:top-4 md:left-6 md:right-auto md:w-[380px] z-[300] flex flex-col gap-2 md:gap-2.5 pointer-events-auto transition-all duration-300 ${
            isDetailActive ? "hidden md:flex" : "flex"
          }`}
          style={{ zIndex: 1000 }}
        >
          {/* Baris 1: Card Search Bar */}
          <div className="bg-white rounded-2xl px-3.5 py-2.5 shadow-md border border-slate-100 flex items-center gap-2.5 shrink-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!poskoExpanded) setPoskoExpanded(true);
              }}
              placeholder="Cari posko, balai desa, atau jalan di Indramayu..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                title="Hapus pencarian"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0 pl-1 border-l border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setToastMessage("Fitur pencarian suara (Microphone) aktif");
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 hover:text-[#2D6A4F] transition cursor-pointer"
                title="Pencarian Suara"
                aria-label="Pencarian Suara"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAllShelters((prev) => !prev);
                  if (!poskoExpanded) setPoskoExpanded(true);
                }}
                className={`p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
                  showAllShelters || activeFilterChip !== "terdekat" ? "text-[#2D6A4F]" : "text-slate-400 hover:text-[#2D6A4F]"
                }`}
                title="Filter Posko"
                aria-label="Filter Posko"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Baris 2: Card Chip Kategori & Filter Wilayah */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 shrink-0">
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilterChip === chip.id && (chip.id !== "terdekat" || !showAllShelters);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    if (chip.id === "terdekat") {
                      setActiveFilterChip("terdekat");
                      setShowAllShelters(false);
                      setSearchQuery("");
                      if (mapInstanceRef.current && userMarkerRef.current) {
                        const uPos = userMarkerRef.current.getLatLng();
                        mapInstanceRef.current.flyTo([uPos.lat, uPos.lng], 15, { duration: 1 });
                      }
                    } else {
                      setActiveFilterChip(chip.id);
                      setShowAllShelters(true);
                      if (chip.type === "district") {
                        handleSelectDistrict(chip.id);
                      }
                    }
                    if (!poskoExpanded) setPoskoExpanded(true);
                  }}
                  className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#2D6A4F] text-white font-medium shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {chip.id === "terdekat" && (
                    <Navigation className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#2D6A4F]"}`} />
                  )}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Bawah: Card Posko Evakuasi Terdekat & Navigasi */}
          <div
            className={`bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5E4E0] shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
              poskoExpanded
                ? "max-h-[55vh] md:max-h-[calc(100vh-230px)] flex-1 min-h-0"
                : "shrink-0 h-auto"
            }`}
          >
            {/* Header Panel */}
            <div
              className={`p-2.5 sm:p-3 flex items-center justify-between gap-2 shrink-0 bg-white/70 transition-colors ${
                poskoExpanded ? "border-b border-gray-100" : ""
              }`}
            >
              {activeNavRoute ? (
                <>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={handleBackToShelterDetail}
                      className="p-1 rounded-lg hover:bg-gray-100 text-[#2D6A4F] transition cursor-pointer"
                      title="Kembali ke Detail Posko"
                      aria-label="Kembali ke Detail Posko"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                        Petunjuk Arah Evakuasi
                      </h4>
                      <p className="text-[10px] text-[#4B635F] truncate">
                        Menuju {activeNavRoute.shelter.name}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearNavRoute}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                    title="Tutup Navigasi"
                    aria-label="Tutup Navigasi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div
                    className={`flex items-center gap-2 min-w-0 flex-1 ${
                      !isDetailActive ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => {
                      if (!isDetailActive) {
                        setPoskoExpanded((prev) => !prev);
                      }
                    }}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                        activeReportDetail
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
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                        {activeReportDetail
                          ? activeReportDetail.title
                          : activeTelemetryDetail
                            ? activeTelemetryDetail.name
                            : activeShelterDetail
                              ? "Detail Posko Evakuasi"
                              : getCardHeaderTitle()}
                      </h4>
                      {!isDetailActive && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                              isGpsLocked
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGpsLocked ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            {isGpsLocked ? "GPS Aktif" : "Eretan Hotspot"}
                          </span>
                          <p className="text-[10px] text-[#4B635F] truncate">
                            {mapVisibleShelters.length} posko terdekat di peta
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isDetailActive && (
                      <div className="flex items-center gap-1 bg-[#EEF5F3] p-0.5 rounded-lg border border-[#D5E4E0] shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShelterLimit(3);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold transition cursor-pointer ${
                            shelterLimit === 3
                              ? "bg-[#2D6A4F] text-white shadow-2xs"
                              : "text-[#4B635F] hover:text-[#132422]"
                          }`}
                        >
                          3 Posko
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShelterLimit(5);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold transition cursor-pointer ${
                            shelterLimit === 5
                              ? "bg-[#2D6A4F] text-white shadow-2xs"
                              : "text-[#4B635F] hover:text-[#132422]"
                          }`}
                        >
                          5 Posko
                        </button>
                      </div>
                    )}
                    {(activeReportDetail || activeTelemetryDetail) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                          activeReportDetail
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
                    {isDetailActive ? (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title="Kembali ke Daftar Posko"
                        aria-label="Kembali ke Daftar Posko"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPoskoExpanded((prev) => !prev)}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title={poskoExpanded ? "Tutup Daftar Posko" : "Buka Daftar Posko"}
                        aria-label="Toggle Daftar Posko"
                      >
                        {poskoExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {poskoExpanded && (
              <>
                {/* DETAIL PANEL / PETUNJUK ARAH EVAKUASI (GAYA GOOGLE MAPS) */}
                {isDetailActive ? (
                  renderDetailContent(false)
                ) : (
                  /* DAFTAR LIST POSKO TERDEKAT ATAU HASIL FILTER DINAMIS */
                  <div className="flex flex-col min-h-0 flex-1">
                    <div className="p-2 space-y-1.5 overflow-y-auto flex-1 min-h-0 scrollbar-none md:scrollbar-thin">
                      {displayedShelters.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-bold text-slate-700">Posko tidak ditemukan</div>
                          <p className="text-[10.5px] text-slate-500 max-w-[200px] leading-relaxed">
                            Coba gunakan kata kunci lain atau pilih filter kategori yang berbeda.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setActiveFilterChip("terdekat");
                              setShowAllShelters(false);
                            }}
                            className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] font-bold text-[11px] border border-emerald-200 transition cursor-pointer"
                          >
                            Reset Filter &amp; Pencarian
                          </button>
                        </div>
                      ) : isDefaultView ? (
                        <>
                          {displayedShelters.slice(0, shelterLimit).map((sh, index) => renderShelterCardItem(sh, index, true))}
                          {displayedShelters.length > shelterLimit && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAllShelters(true);
                              }}
                              className="w-full bg-slate-50 hover:bg-slate-100 text-[#2D6A4F] font-semibold text-xs py-2.5 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 active:scale-[0.99]"
                            >
                              <span>Lihat Posko Terdekat Lainnya (Maksimal 10)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {displayedShelters.slice(0, showAllShelters ? 10 : shelterLimit).map((sh, index) => renderShelterCardItem(sh, index, activeFilterChip === "terdekat"))}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilterChip("terdekat");
                              setShowAllShelters(false);
                              setSearchQuery("");
                            }}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-[#2D6A4F] font-semibold text-xs py-2 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 active:scale-[0.99]"
                          >
                            <span>Kembali ke {shelterLimit} Posko Terdekat</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. MOBILE DETAIL BOTTOM SLIDER (SCREEN < MD)                   */}
        {/* Muncul di bawah saat lokasi/posko diklik, bisa di-slide ke atas */}
        {/* ============================================================== */}
        {isDetailActive && (
          <div
            className={`fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-40 md:hidden bg-white/98 backdrop-blur-xl rounded-t-2xl sm:rounded-t-[26px] border-t border-[#D5E4E0] shadow-[0_-12px_36px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden select-none ${
              isDragging ? "transition-none" : "transition-all duration-300 ease-out"
            } ${
              sheetSnap === "compact"
                ? "h-[118px] max-h-[125px]"
                : sheetSnap === "medium"
                  ? "h-[390px] max-h-[48vh]"
                  : "h-[82vh] max-h-[82vh]"
            }`}
            style={{
              zIndex: 1000,
              transform:
                isDragging && dragOffsetY !== 0
                  ? `translateY(${Math.max(-150, Math.min(150, dragOffsetY))}px)`
                  : undefined,
            }}
          >
            {/* 1. Drag Handle Bar & Header Controls (Slider Interaktif Responsif) */}
            <div className="w-full flex items-center justify-between px-3 pt-2 pb-1.5 shrink-0 bg-slate-50/80 border-b border-gray-100/80 select-none">
              {/* Sisi Kiri: Tombol Kontrol Tinggi (Chevron Up & Down) */}
              <div
                className="flex items-center gap-1 shrink-0"
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {sheetSnap === "compact" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("medium");
                    }}
                    className="h-7 px-2 rounded-lg text-[#2D6A4F] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="Buka Detail"
                    aria-label="Buka Detail"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>
                )}
                {sheetSnap === "medium" && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("compact");
                      }}
                      className="h-7 w-7 rounded-lg text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center"
                      title="Kecilkan ke Mode Peta"
                      aria-label="Kecilkan ke Mode Peta"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("expanded");
                      }}
                      className="h-7 px-1.5 rounded-lg text-[#2D6A4F] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
                      title="Perbesar Layar Penuh"
                      aria-label="Perbesar Layar Penuh"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Penuh</span>
                    </button>
                  </div>
                )}
                {sheetSnap === "expanded" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("medium");
                    }}
                    className="h-7 px-2 rounded-lg text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    title="Kecilkan Tampilan"
                    aria-label="Kecilkan Tampilan"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Kecilkan</span>
                  </button>
                )}
              </div>

              {/* Area Tengah: Interactive Drag Slider (Hanya area ini yang menangkap gesture drag) */}
              <div
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-2 cursor-grab active:cursor-grabbing touch-none select-none mx-1"
                onTouchStart={handleSheetTouchStart}
                onTouchMove={handleSheetTouchMove}
                onTouchEnd={handleSheetTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={() => {
                  setSheetSnap((prev) =>
                    prev === "compact" ? "medium" : prev === "medium" ? "expanded" : "compact"
                  );
                }}
              >
                <div className="w-10 h-1.2 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
                <span className="text-[9px] font-bold text-slate-400 tracking-wide text-center">
                  {sheetSnap === "compact"
                    ? "Tarik ke atas untuk detail"
                    : sheetSnap === "medium"
                      ? "Geser ke atas untuk selengkapnya"
                      : "Geser ke bawah untuk peta"}
                </span>
              </div>

              {/* Sisi Kanan: Tombol Tutup (X) Selalu Berfungsi Langsung */}
              <div
                className="flex items-center justify-end shrink-0"
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Tutup Detail"
                  aria-label="Tutup Detail"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Header Panel Sheet (Tampil saat medium / expanded) */}
            {sheetSnap !== "compact" && (
              <div className="px-3.5 pb-2 pt-0.5 flex items-center justify-between gap-2 border-b border-gray-100 shrink-0">
                {activeNavRoute ? (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={handleBackToShelterDetail}
                        className="p-1 rounded-lg hover:bg-gray-100 text-[#2D6A4F] transition cursor-pointer"
                        title="Kembali ke Detail Posko"
                        aria-label="Kembali ke Detail Posko"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                          Petunjuk Arah Evakuasi
                        </h4>
                        <p className="text-[10px] text-[#4B635F] truncate">
                          Menuju {activeNavRoute.shelter.name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearNavRoute();
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="Tutup Navigasi"
                      aria-label="Tutup Navigasi"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                          activeReportDetail
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
                              : "Detail Posko Evakuasi"}
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelection();
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="Tutup Detail"
                      aria-label="Tutup Detail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 3. Isi Konten Detail (Bisa di-scroll) */}
            <div className={`overflow-y-auto flex-1 min-h-0 scrollbar-none ${sheetSnap === "compact" ? "p-2" : "p-3 space-y-2"}`}>
              {renderDetailContent(true)}
            </div>
          </div>
        )}

        {/* Floating Waypoint Picking Mode Banner */}
        {isPickingWaypoint && (
          <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-[1100] bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto max-w-[90vw]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs font-black">Mode Titik Singgah Aktif</p>
              <p className="text-[10px] text-slate-300 truncate">Klik jalan di peta untuk menentukan jalur singgah Anda</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPickingWaypoint(false)}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white transition cursor-pointer shrink-0"
            >
              Batal
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. FLOATING MAP CONTROLS SISI KIRI BAWAH (MOBILE ONLY)         */}
        {/* Atas: Perbesar Layar Penuh | Bawah: Beralih Citra Satelit     */}
        {/* Posisi: absolute left-3.5 sm:left-4 bottom-20 (Khusus Mobile) */}
        {/* ============================================================== */}
        <div
          className={`md:hidden absolute left-3.5 sm:left-4 z-30 flex flex-col gap-2.5 pointer-events-auto transition-all duration-300 ease-out ${
            isDetailActive
              ? sheetSnap === "expanded"
                ? "hidden"
                : "bottom-[calc(4rem+128px+env(safe-area-inset-bottom,0px))] flex"
              : "bottom-20 flex"
          }`}
          aria-label="Kontrol Peta Sisi Kiri Bawah"
        >
          {/* Tombol Atas: Perbesar Layar Penuh (Fullscreen) */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
            title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
            aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-[#2D6A4F]" />
            ) : (
              <Maximize2 className="w-5 h-5 text-[#2D6A4F]" />
            )}
          </button>

          {/* Tombol Bawah: Beralih ke Citra Satelit (Basemap Toggle OSM <-> Satelit Esri) */}
          <button
            type="button"
            onClick={handleToggleBasemap}
            className={`w-11 h-11 rounded-full shadow-lg border transition-transform active:scale-95 flex items-center justify-center cursor-pointer ${
              basemap === "satellite"
                ? "bg-[#2D6A4F] text-white border-[#1B4D3E]"
                : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
            }`}
            title={basemap === "satellite" ? "Beralih ke Peta Jalan OSM" : "Beralih ke Citra Satelit Esri"}
            aria-label="Ganti Tampilan Peta"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 5. FLOATING MAP CONTROLS (FAB) DI SISI KANAN AREA PETA         */}
        {/* Posisi: absolute right-3.5 sm:right-4 bottom-20 md:bottom-12   */}
        {/* Berada di atas layer peta Leaflet, di atas mobile bottom nav    */}
        {/* ============================================================== */}
        <div
          className={`absolute right-3 sm:right-4 z-30 flex flex-col gap-2.5 pointer-events-auto transition-all duration-300 ease-out ${
            isDetailActive
              ? sheetSnap === "expanded"
                ? "hidden md:flex md:bottom-12"
                : "bottom-[calc(4rem+128px+env(safe-area-inset-bottom,0px))] md:bottom-12 flex"
              : "bottom-20 md:bottom-12 flex"
          }`}
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

          {/* Tombol 3: Pusatkan Peta ke Indramayu (Recenter) */}
          <button
            type="button"
            onClick={handleRecenter}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
            title="Pusatkan Peta ke Indramayu"
            aria-label="Pusatkan Peta ke Indramayu"
          >
            <MapPin className="w-5 h-5 text-[#2D6A4F]" />
          </button>

          {/* Tombol 4 (Khusus Web Desktop): Beralih ke Citra Satelit */}
          <button
            type="button"
            onClick={handleToggleBasemap}
            className={`hidden md:flex w-11 h-11 rounded-full shadow-lg border transition-transform active:scale-95 items-center justify-center cursor-pointer ${
              basemap === "satellite"
                ? "bg-[#2D6A4F] text-white border-[#1B4D3E]"
                : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
            }`}
            title={basemap === "satellite" ? "Beralih ke Peta Jalan OSM" : "Beralih ke Citra Satelit Esri"}
            aria-label="Ganti Tampilan Peta"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Tombol 5 (Khusus Web Desktop): Perbesar Layar Penuh */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden md:flex w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
            title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
            aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-[#2D6A4F]" />
            ) : (
              <Maximize2 className="w-5 h-5 text-[#2D6A4F]" />
            )}
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
        {/* 6. BANNER NAVIGASI AKTIF (FLOATING TOP BANNER DI DESKTOP)      */}
        {/* ============================================================== */}
        {activeNavRoute && (
          <div
            className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#1B4D3E]/95 text-white rounded-2xl p-2.5 px-3.5 shadow-2xl backdrop-blur-md border border-emerald-400/30 items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto min-w-[380px]"
            style={{ zIndex: 1100 }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-emerald-300 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-white truncate">
                    {activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.durationText || "11 mnt"} &bull; {activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.distanceText || "8.1 km"}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Bebas Genangan
                  </span>
                </div>
                <p className="text-[10.5px] text-emerald-100/90 truncate mt-0.5">
                  Menuju {activeNavRoute.shelter.name} &bull; Menghindari Jalur Rawan Banjir
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
              <X className="w-3.5 h-3.5 text-emerald-200" />
              <span>Selesai</span>
            </button>
          </div>
        )}

        {/* Custom CSS untuk Badge Rute Leaflet Transparan */}
        <style jsx global>{`
          .dermayu-route-badge {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .dermayu-route-badge::before,
          .dermayu-route-badge::after {
            display: none !important;
          }
        `}</style>

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
