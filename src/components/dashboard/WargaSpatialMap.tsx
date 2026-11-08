"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import indramayuBoundaryData from "@/data/indramayuBoundary.json";
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  WifiOff,
  Waves,
  Compass,
  AlertTriangle,
  Home,
  Activity,
  PhoneCall,
  CheckCircle2,
  Check,
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
  ArrowUpLeft,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  Undo2,
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
  Image as ImageIcon,
} from "lucide-react";
import {
  SIAGA_CONFIGS,
  type SiagaLevel,
  RingingBell3D,
  ShieldSafeIllustration,
} from "@/components/dashboard/StatusSiagaCard";
import { getActiveSession } from "@/utils/authSession";
import { getWargaPosko } from "@/utils/poskoService";
import { ShelterBentoGallery } from "@/components/dashboard/ShelterBentoGallery";
import {
  FLOOD_OBSTACLES,
  REALISTIC_FLOOD_PHOTOS,
  detectIntersectedFloodObstacles,
  calculateDistanceInMeters as calcMetersSafe,
  type FloodObstacle,
  type PoskoItem,
} from "@/data/curatedEvakuasiData";

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
  photos?: string[];
  photoUrl?: string;
  gambar?: string;
  foto?: string;
  note?: string;
  description?: string;
  catatan?: string;
  aiScore?: {
    label: string;
    confidence: number;
  };
  urgentNeeds?: string[];
}

export function getReportPhoto(rep?: MapReportPoint | null): string | null {
  if (!rep) return null;
  if (rep.photos && rep.photos.length > 0 && typeof rep.photos[0] === "string" && rep.photos[0].trim() !== "") {
    return rep.photos[0];
  }
  if (rep.photoUrl && typeof rep.photoUrl === "string" && rep.photoUrl.trim() !== "") {
    return rep.photoUrl;
  }
  if ((rep as any).gambar && typeof (rep as any).gambar === "string" && (rep as any).gambar.trim() !== "") {
    return (rep as any).gambar;
  }
  if ((rep as any).foto && typeof (rep as any).foto === "string" && (rep as any).foto.trim() !== "") {
    return (rep as any).foto;
  }

  // Cek apakah merupakan bagian dari dataset hambatan jalan FLOOD_OBSTACLES
  const obstacleIndex = FLOOD_OBSTACLES.findIndex((obs) => obs.id === rep.id || obs.title === rep.title);
  if (obstacleIndex !== -1) {
    return REALISTIC_FLOOD_PHOTOS[obstacleIndex % REALISTIC_FLOOD_PHOTOS.length];
  }

  return null;
}

export function getReportNote(rep?: MapReportPoint | null): string | null {
  if (!rep) return null;
  if (rep.note && rep.note.trim() !== "") return rep.note;
  if (rep.description && rep.description.trim() !== "") return rep.description;
  if ((rep as any).catatan && typeof (rep as any).catatan === "string" && (rep as any).catatan.trim() !== "") {
    return (rep as any).catatan;
  }
  if ((rep as any).keterangan && typeof (rep as any).keterangan === "string" && (rep as any).keterangan.trim() !== "") {
    return (rep as any).keterangan;
  }

  // Cek apakah merupakan bagian dari dataset hambatan jalan FLOOD_OBSTACLES
  const obstacle = FLOOD_OBSTACLES.find((obs) => obs.id === rep.id || obs.title === rep.title);
  if (obstacle && obstacle.description) {
    return obstacle.description;
  }

  return null;
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
  kategori?: "sekolah" | "masjid" | "balai_desa" | "gor";
  foto?: string;
  fotos?: string[];
  photos?: string[];
  tier?: 1 | 2 | 3 | 4 | 5;
  petugasId?: string;
  isActive?: boolean;
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
  agency?: string;
  impactAreas?: string;
  isLive?: boolean;
  percentage?: number;
  capacity?: number;
  debit?: number;
  tipeBangunan?: string;
  lokasiDetail?: string;
}

export interface NavigationStep {
  instruction: string;
  distance: string;
  distanceMeters?: number;
  location?: [number, number];
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
  focusReportId?: string;
  focusCoords?: { lat: number; lng: number };
}

// ============================================================================
// HELPER PERHITUNGAN JARAK SPASIAL & FORMATTING TERDEKAT (HAVERSINE)
// ============================================================================
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

function formatNavDuration(seconds: number): string {
  if (seconds <= 0) return "Tiba sekarang";
  const mins = Math.ceil(seconds / 60);
  if (mins < 60) return `${mins} mnt`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} jam ${remMins > 0 ? `${remMins} mnt` : ""}`.trim();
}

function formatNavDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Helper pemecah polyline rute menjadi 2 layer dinamis ("Lendir Siput"):
// 1. Yang sudah dilewati: jejak pudar (#94A3B8, opacity 0.35)
// 2. Sisa rute: solid aktif (#1A73E8)
function splitRouteAtCurrentPosition(
  routeCoords: [number, number][],
  currentPos: [number, number]
): { passed: [number, number][]; remaining: [number, number][] } {
  if (!routeCoords || routeCoords.length < 2) {
    return { passed: [], remaining: routeCoords || [] };
  }

  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < routeCoords.length; i++) {
    const pt = routeCoords[i];
    const dist = calculateDistanceInMeters(currentPos[0], currentPos[1], pt[0], pt[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  const passed = routeCoords.slice(0, closestIndex + 1);
  passed.push(currentPos);

  const remaining = [currentPos, ...routeCoords.slice(closestIndex + 1)];

  return { passed, remaining };
}

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

// Filter spasial jarak minimum antar-marker untuk menghindari penumpukan (clustering alami Google Maps)
function filterMinDistance<T extends { lat: number; lng: number }>(items: T[], minDistKm: number): T[] {
  const kept: T[] = [];
  for (const item of items) {
    let tooClose = false;
    for (const k of kept) {
      const dLat = (item.lat - k.lat) * 111;
      const dLng = (item.lng - k.lng) * 110;
      if (dLat * dLat + dLng * dLng < minDistKm * minDistKm) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      kept.push(item);
    }
  }
  return kept;
}

// Daftar kecamatan utama untuk persebaran seimbang Tier 1 se-Kabupaten Indramayu
const MAJOR_DISTRICTS = [
  "patrol",
  "haurgeulis",
  "kandanghaur",
  "losarang",
  "lohbener",
  "jatibarang",
  "indramayu",
  "sindang",
  "karangampel",
  "cantigi",
  "cikedung",
  "anjatan",
];

// Generator Custom Marker Pin Teardrop Google Maps Style
type PinType = "posko" | "genangan" | "kritis" | "sensor" | "infra" | "rawan";

const pinIconCache: Record<string, L.DivIcon> = {};

const createPinIcon = (type: PinType, isActive: boolean = false, zoom: number = 11) => {
  // Dynamic Pin Sizing:
  // Zoom <= 10: Ukuran kecil kompak [20x26px], ikon di dalam w-2.5 h-2.5 (10px)
  // Zoom 11-13: Ukuran medium [26x34px], ikon di dalam w-3.5 h-3.5 (14px)
  // Zoom >= 14: Ukuran standar maksimal [32x40px], ikon di dalam w-4 h-4 (16px)
  // Terkunci maksimal (Max Width: 32px, Max Height: 40px)
  let sizeKey: "sm" | "md" | "lg" = "md";
  if (zoom <= 10) sizeKey = "sm";
  else if (zoom >= 14) sizeKey = "lg";

  const cacheKey = `${type}-${isActive ? "active" : "normal"}-${sizeKey}`;
  if (pinIconCache[cacheKey]) return pinIconCache[cacheKey]!;

  const config = {
    posko: {
      bg: "bg-[#38746D]",
      icon: (sz: string) => <Home className={`${sz} text-white`} strokeWidth={2.5} />,
    },
    genangan: {
      bg: "bg-amber-500",
      icon: (sz: string) => <Waves className={`${sz} text-white`} strokeWidth={2.5} />,
    },
    kritis: {
      bg: "bg-rose-600",
      icon: (sz: string) => <AlertTriangle className={`${sz} text-white`} strokeWidth={2.5} />,
    },
    sensor: {
      bg: "bg-sky-600",
      icon: (sz: string) => <Activity className={`${sz} text-white`} strokeWidth={2.5} />,
    },
    infra: {
      bg: "bg-cyan-600",
      icon: (sz: string) => <Building2 className={`${sz} text-white`} strokeWidth={2.5} />,
    },
    rawan: {
      bg: "bg-purple-600",
      icon: (sz: string) => <AlertTriangle className={`${sz} text-white`} strokeWidth={2.5} />,
    },
  }[type];

  let circleSize = "w-[26px] h-[26px]";
  let arrowSize = "border-l-[5px] border-r-[5px] border-t-[7px] -mt-[1.5px]";
  let iconSizeCls = "w-3.5 h-3.5";
  let wPx = 26;
  let hPx = 34;

  if (sizeKey === "sm") {
    circleSize = "w-5 h-5";
    arrowSize = "border-l-[4px] border-r-[4px] border-t-[6px] -mt-[1px]";
    iconSizeCls = "w-2.5 h-2.5";
    wPx = 20;
    hPx = 26;
  } else if (sizeKey === "lg") {
    circleSize = "w-8 h-8 max-w-[32px] max-h-[32px]";
    arrowSize = "border-l-[6px] border-r-[6px] border-t-[8px] -mt-[2px]";
    iconSizeCls = "w-4 h-4";
    wPx = 32;
    hPx = 40;
  }

  // Teardrop Pin Bersih & Statis ala Google Maps
  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md ${isActive ? "z-[999]" : ""}">
      <div class="${circleSize} ${config.bg} rounded-full border-2 border-white shadow-md flex items-center justify-center relative z-10 transition-transform ${isActive
      ? "scale-110 ring-2 ring-[#38746D] shadow-lg"
      : "group-hover:scale-105"
    }">
        ${renderToStaticMarkup(config.icon(iconSizeCls))}
      </div>
      <div class="w-0 h-0 ${arrowSize} border-l-transparent border-r-transparent border-t-white relative z-0"></div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: `custom-pin-marker ${isActive ? "active-pin-marker" : ""}`,
    iconSize: [wPx, hPx],
    iconAnchor: [Math.round(wPx / 2), hPx],
    popupAnchor: [0, -hPx + 2],
  });
  pinIconCache[cacheKey] = icon;
  return icon;
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
  focusReportId,
  focusCoords,
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
  const activeRouteLayerRef = useRef<L.LayerGroup | null>(null);

  // Status Koneksi Internet & Mode Darurat Offline (PWA Offline-First)
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof window !== "undefined" ? window.navigator.onLine : true);
    const handleOnline = () => {
      setIsOnline(true);
      setToastMessage("🟢 Sinyal pulih! Mode daring (online) aktif kembali.");
      setTimeout(() => setToastMessage(null), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setToastMessage("📡 Sinyal terputus. Mengaktifkan Mode Darurat Offline.");
      setTimeout(() => setToastMessage(null), 4000);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [siagaExpanded, setSiagaExpanded] = useState(false);
  const [poskoExpanded, setPoskoExpanded] = useState(false);

  // Integrasi Single Source of Truth Posko Warga (Database Service Layer)
  const [poskoData, setPoskoData] = useState<MapShelterPoint[]>(() => {
    if (shelters && shelters.length > 0) return shelters.filter((s) => s.isActive !== false);
    return getWargaPosko().map((p) => {
      const photos = p.photos && p.photos.length > 0 ? p.photos : (p.fotos && p.fotos.length > 0 ? p.fotos : (p.foto ? [p.foto] : []));
      return {
        id: p.id,
        name: p.nama,
        location: p.alamat,
        district: p.kecamatan,
        distance: "Menghitung jarak...",
        capacityTotal: p.kapasitas,
        capacityFilled: p.terisi,
        status: p.status,
        contactPerson: p.kontak.pj,
        contactPhone: p.kontak.telp,
        lat: p.lat,
        lng: p.lng,
        facilities: p.fasilitas,
        kategori: p.kategori,
        foto: photos[0] || p.foto,
        fotos: photos,
        photos: photos,
        tier: p.tier,
        petugasId: p.petugasId,
        isActive: p.isActive,
      };
    });
  });

  // Sinkronisasi data posko dari prop parent
  useEffect(() => {
    if (shelters && shelters.length > 0) {
      setPoskoData(shelters.filter((s) => s.isActive !== false));
    }
  }, [shelters]);

  // Fetch fallback hanya jika prop shelters tidak disediakan oleh parent
  useEffect(() => {
    if (!shelters || shelters.length === 0) {
      const fetchFromApi = async () => {
        try {
          const res = await fetch("/api/posko?role=warga", { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            const list = json.data?.data || json.data || [];
            if (Array.isArray(list) && list.length > 0) {
              const formatted: MapShelterPoint[] = list
                .filter((p: any) => p && p.isActive !== false)
                .map((p: any) => {
                  const photos = p.photos && p.photos.length > 0 ? p.photos : (p.fotos && p.fotos.length > 0 ? p.fotos : (p.foto ? [p.foto] : []));
                  return {
                    id: p.id,
                    name: p.nama || p.name || "Posko Siaga",
                    location: p.alamat || p.location || "",
                    district: p.kecamatan || p.district || "",
                    distance: "Menghitung jarak...",
                    capacityTotal: p.kapasitas || 100,
                    capacityFilled: p.terisi || 0,
                    status: p.status || "TERSEDIA",
                    contactPerson: p.kontak?.pj || "Petugas Posko",
                    contactPhone: p.kontak?.telp || "0812-3456-7890",
                    lat: p.lat,
                    lng: p.lng,
                    facilities: p.fasilitas || [],
                    kategori: p.kategori,
                    foto: photos[0] || p.foto,
                    fotos: photos,
                    photos: photos,
                    tier: p.tier,
                    petugasId: p.petugasId,
                    isActive: p.isActive,
                  };
                });
              setPoskoData(formatted);
            }
          }
        } catch (err) {
          console.warn("WargaSpatialMap API fetch fallback:", err);
        }
      };

      fetchFromApi();
    }

    const handleUpdate = () => {
      if (!shelters || shelters.length === 0) {
        const activeOnly = getWargaPosko().map((p) => {
          const photos = p.photos && p.photos.length > 0 ? p.photos : (p.fotos && p.fotos.length > 0 ? p.fotos : (p.foto ? [p.foto] : []));
          return {
            id: p.id,
            name: p.nama,
            location: p.alamat,
            district: p.kecamatan,
            distance: "Menghitung jarak...",
            capacityTotal: p.kapasitas,
            capacityFilled: p.terisi,
            status: p.status,
            contactPerson: p.kontak.pj,
            contactPhone: p.kontak.telp,
            lat: p.lat,
            lng: p.lng,
            facilities: p.fasilitas,
            kategori: p.kategori,
            foto: photos[0] || p.foto,
            fotos: photos,
            photos: photos,
            tier: p.tier,
            petugasId: p.petugasId,
            isActive: p.isActive,
          };
        });
        setPoskoData(activeOnly);
      }
    };

    window.addEventListener("dermayu_posko_updated", handleUpdate);
    return () => {
      window.removeEventListener("dermayu_posko_updated", handleUpdate);
    };
  }, []);

  // Integrasi Single Source of Truth Laporan & Genangan Warga
  const [internalReports, setInternalReports] = useState<MapReportPoint[]>(() => {
    if (reports && reports.length > 0) {
      return reports.map((r) => ({
        ...r,
        photoUrl: getReportPhoto(r) || r.photoUrl,
        photos: r.photos && r.photos.length > 0 ? r.photos : (getReportPhoto(r) ? [getReportPhoto(r)!] : []),
        note: getReportNote(r) || r.note,
      }));
    }
    return FLOOD_OBSTACLES.map((obs, idx) => ({
      id: obs.id,
      ticketCode: `GEN-${String(idx + 1).padStart(3, "0")}`,
      title: obs.title,
      category: obs.zone === "PESISIR_ROB" ? "Banjir Rob" : "Luapan DAS Cimanuk",
      severity: obs.severity,
      waterLevelText: `${obs.depthCm} cm`,
      status: obs.status || "Aktif Terpantau",
      location: obs.location,
      lat: obs.lat,
      lng: obs.lng,
      timeAgo: "Aktif Terpantau",
      photos: [REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length]],
      photoUrl: REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length],
      note: obs.description,
    }));
  });

  // Sinkronisasi data laporan dari prop parent
  useEffect(() => {
    if (reports && reports.length > 0) {
      setInternalReports(
        reports.map((r) => ({
          ...r,
          photoUrl: getReportPhoto(r) || r.photoUrl,
          photos: r.photos && r.photos.length > 0 ? r.photos : (getReportPhoto(r) ? [getReportPhoto(r)!] : []),
          note: getReportNote(r) || r.note,
        }))
      );
    }
  }, [reports]);

  // Sinkronisasi dengan database /api/laporan
  useEffect(() => {
    let isMounted = true;
    const fetchReportsFromApi = async () => {
      try {
        const res = await fetch("/api/laporan", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.data || json.data || [];
          if (Array.isArray(list) && list.length > 0 && isMounted) {
            setInternalReports((prev) => {
              const mapById = new Map<string, any>();
              list.forEach((item: any) => mapById.set(item.id, item));

              return prev.map((p) => {
                const apiItem = mapById.get(p.id);
                if (!apiItem) return p;
                const photo = getReportPhoto(apiItem) || getReportPhoto(p);
                return {
                  ...p,
                  ...apiItem,
                  photos: apiItem.photos || p.photos || (photo ? [photo] : []),
                  photoUrl: photo || p.photoUrl,
                  note: apiItem.note || p.note || getReportNote(apiItem),
                };
              });
            });
          }
        }
      } catch (err) {
        console.warn("WargaSpatialMap API reports fetch fallback:", err);
      }
    };

    fetchReportsFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-expand card list posko setelah animasi page entry selesai (jeda 800ms)
  useEffect(() => {
    const timer = setTimeout(() => setPoskoExpanded(true), 800);
    return () => clearTimeout(timer);
  }, []);
  const [activeShelterDetail, setActiveShelterDetail] = useState<MapShelterPoint | null>(null);
  const [activeReportDetail, setActiveReportDetail] = useState<MapReportPoint | null>(null);
  const [activeTelemetryDetail, setActiveTelemetryDetail] = useState<MapTelemetryPoint | null>(null);
  const [activeNavRoute, setActiveNavRoute] = useState<ActiveNavRouteData | null>(null);
  const [targetNavShelter, setTargetNavShelter] = useState<MapShelterPoint | null>(null);
  const activeNavRouteRef = useRef(activeNavRoute);
  activeNavRouteRef.current = activeNavRoute;
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // State Mode Navigasi Berjalan (Turn-by-Turn Driving Mode) ala Google Maps
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  isNavigatingRef.current = isNavigating;

  const [navCurrentCoord, setNavCurrentCoord] = useState<[number, number] | null>(null);
  const [navBearing, setNavBearing] = useState<number>(0);
  const [navStepIndex, setNavStepIndex] = useState<number>(0);
  const [navDistanceToNextStep, setNavDistanceToNextStep] = useState<number>(150);
  const [navRemainingSeconds, setNavRemainingSeconds] = useState<number>(0);
  const [navRemainingMeters, setNavRemainingMeters] = useState<number>(0);
  const navWatchIdRef = useRef<number | null>(null);
  const navLastGpsPosRef = useRef<[number, number] | null>(null);

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
  const handleMapClickForWaypointRef = useRef<(lat: number, lng: number) => void>(() => { });

  // State Search & Kategori Filter Baris 1 & 2
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterChip, setActiveFilterChip] = useState<string>("terdekat");
  const [showAllShelters, setShowAllShelters] = useState(false);
  const [showAllTelemetry, setShowAllTelemetry] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("SEMUA");
  const [sortByClosest, setSortByClosest] = useState(true);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filter24Hours, setFilter24Hours] = useState(false);

  const FILTER_CHIPS = [
    { id: "terdekat", label: "Terdekat (GPS)", type: "default" },
    { id: "semua", label: "Semua Posko", type: "category" },
    { id: "telemetri", label: "🌊 Sensor Air (Live)", type: "category" },
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

  // Sorting Stasiun Air Telemetri Berdasarkan Jarak GPS Terdekat ke Pengguna
  const sortedTelemetry = useMemo(() => {
    return telemetry
      .map((tel) => {
        const distMeters = calculateDistanceInMeters(
          userCoords[0],
          userCoords[1],
          tel.lat,
          tel.lng
        );
        const distKm = (distMeters / 1000).toFixed(1);
        return {
          ...tel,
          distanceMeters: distMeters,
          distanceKm: `${distKm} km`,
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [telemetry, userCoords]);
  // Dynamic Level of Detail (LOD) & Viewport Bounds ala Google Maps
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const initialGpsFittedRef = useRef(false);

  // Helper pasang marker GPS pengguna bergaya Google Maps (Blue Dot & Floating Pill "Lokasi Anda")
  // Marker ini PERMANEN dan WAJIB SELALU TAMPIL dalam keadaan apapun (Idle, Detail, maupun Routing)
  const updateUserMarkerOnMap = (lat: number, lng: number, accuracy?: number, isNavMode: boolean = false, bearing: number = 0) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let userIcon: L.DivIcon;

    if (isNavMode) {
      // Chevron Navigasi Khas Google Maps:
      // Lingkaran putih kokoh + Navigation Arrow 3D (#1A73E8) + Heading Beam segitiga gradasi semi-transparan
      const navIconHtml = `
        <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <!-- Heading Beam / Kerucut Sinar Kompas -->
          <div style="position: absolute; top: -16px; left: 8px; width: 40px; height: 40px; background: radial-gradient(circle, rgba(26,115,232,0.28) 0%, rgba(26,115,232,0) 70%); clip-path: polygon(50% 100%, 0 0, 100% 0); transform: rotate(${bearing}deg); transform-origin: 50% 85%;"></div>
          <!-- Lingkaran Luar Putih + Shadow Tebal -->
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff;">
            <!-- Navigation Chevron ala Google Maps -->
            <div style="width: 26px; height: 26px; transform: rotate(${bearing}deg); transform-origin: center center; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease-out;">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#1A73E8">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
          </div>
        </div>
      `;
      userIcon = L.divIcon({
        html: navIconHtml,
        className: "custom-nav-chevron-marker",
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });
    } else {
      const userIconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <div style="background: #ffffff; color: #1e293b; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1.5px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.18); margin-bottom: 4px; white-space: nowrap; line-height: 1.2;">
            Lokasi Anda
          </div>
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <span style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(26, 115, 232, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 18px; height: 18px; border-radius: 9999px; background: #1A73E8; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        </div>
      `;
      userIcon = L.divIcon({
        html: userIconHtml,
        className: "custom-user-pulsing-marker",
        iconSize: [90, 56],
        iconAnchor: [45, 38],
      });
    }

    if (userMarkerRef.current) {
      if (!map.hasLayer(userMarkerRef.current)) {
        userMarkerRef.current.addTo(map);
      }
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(userIcon);
      userMarkerRef.current.setZIndexOffset(3000);
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 3000 })
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
      if (!map.hasLayer(userAccuracyCircleRef.current)) {
        userAccuracyCircleRef.current.addTo(map);
      }
      userAccuracyCircleRef.current.setLatLng([lat, lng]);
      userAccuracyCircleRef.current.setRadius(accuracy || 25);
    } else {
      userAccuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracy || 25,
        color: "#1A73E8",
        fillColor: "#1A73E8",
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "3, 5",
      }).addTo(map);
    }
  };

  // Sinkronisasi reaktif: Pastikan titik "Lokasi Anda" SELALU diperbarui saat userCoords berubah
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateUserMarkerOnMap(userCoords[0], userCoords[1]);
    }
  }, [userCoords]);

  // Deteksi & Pelacakan Real-Time GPS (getCurrentPosition + watchPosition)
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
          updateUserMarkerOnMap(userCoords[0], userCoords[1], 50);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserCoords([latitude, longitude]);
          setIsGpsLocked(true);
          updateUserMarkerOnMap(latitude, longitude, accuracy);
        },
        (err) => {
          console.warn("GPS watch position notice:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      updateUserMarkerOnMap(userCoords[0], userCoords[1], 50);
    }
  }, []);

  // Efek Fokus Otomatis jika pengguna mengklik aduan dari halaman Lapor
  const hasFocusedAduanRef = useRef(false);
  useEffect(() => {
    if (!mapInstanceRef.current || hasFocusedAduanRef.current) return;
    if (focusReportId || focusCoords) {
      initialGpsFittedRef.current = true; // Jangan timpa fokus aduan dengan fit GPS default
    }
    if (focusReportId && reports && reports.length > 0) {
      const target = reports.find(
        (r) => r.id === focusReportId || r.ticketCode === focusReportId
      );
      if (target) {
        hasFocusedAduanRef.current = true;
        setActiveReportDetail(target);
        setActiveShelterDetail(null);
        setActiveTelemetryDetail(null);
        setSelectedMarker({ type: "report", data: target });
        setPoskoExpanded(true);
        setSheetSnap("mid");
        mapInstanceRef.current.flyTo([target.lat, target.lng], 16, { duration: 1.2 });
        if (onSelectReport) onSelectReport(target);
        return;
      }
    }
    if (focusCoords && focusCoords.lat && focusCoords.lng) {
      hasFocusedAduanRef.current = true;
      mapInstanceRef.current.flyTo([focusCoords.lat, focusCoords.lng], 16, { duration: 1.2 });
    }
  }, [focusReportId, focusCoords, reports, onSelectReport]);

  // Kalkulasi jarak real-time & Skema 5-Level Tiering Posko (LoD by Zoom Level)
  const processedShelters = useMemo(() => {
    const [uLat, uLng] = userCoords;

    const list = poskoData.map((sh) => {
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

    // Skema 5 Level Kemunculan Bertahap:
    // Tier 1: Posko Induk Utama per kecamatan besar (~8-10 pin tersebar seimbang utara, tengah, barat, timur)
    // Tier 2: Posko sekunder berkapasitas besar & berakses jalan Pantura (~18-25 pin total)
    // Tier 3: Posko tingkat desa/kelurahan (di-thinning berjarak minimum ~1.2 km di zoom 12)
    // Tier 4: Posko lingkungan tingkat RW / SD / Musholla (di zoom 13-14)
    // Tier 5: Semua posko lokal lainnya (di zoom >= 15)
    const assignedTiers = new Map<string, 1 | 2 | 3 | 4 | 5>();
    const tier1Districts = new Set<string>();

    const flagshipIds = ["sh-11", "sh-10", "sh-3", "sh-1", "sh-4"];
    for (const id of flagshipIds) {
      const found = list.find((s) => s.id === id);
      if (found) {
        assignedTiers.set(found.id, 1);
        tier1Districts.add((found.district || "").toLowerCase());
      }
    }

    for (const dist of MAJOR_DISTRICTS) {
      if (tier1Districts.has(dist)) continue;
      const inDist = list.filter((s) => (s.district || "").toLowerCase().includes(dist));
      if (inDist.length > 0) {
        inDist.sort((a, b) => b.capacityTotal - a.capacityTotal);
        assignedTiers.set(inDist[0].id, 1);
        tier1Districts.add(dist);
      }
    }

    let tier2Count = 0;
    for (const sh of list) {
      if (assignedTiers.has(sh.id)) continue;
      const isHighCap = sh.capacityTotal >= 300;
      const isMajor = sh.name.includes("SMA") || sh.name.includes("SMK") || sh.name.includes("Balai Desa") || sh.name.includes("GOR");
      if ((isHighCap || isMajor) && tier2Count < 18) {
        assignedTiers.set(sh.id, 2);
        tier2Count++;
      }
    }

    for (const sh of list) {
      if (assignedTiers.has(sh.id)) continue;
      if (sh.capacityTotal >= 180 || sh.name.includes("SMP") || sh.name.includes("Balai Desa")) {
        assignedTiers.set(sh.id, 3);
      } else if (sh.capacityTotal >= 100 || sh.name.includes("SDN") || sh.name.includes("MIS")) {
        assignedTiers.set(sh.id, 4);
      } else {
        assignedTiers.set(sh.id, 5);
      }
    }

    return list.map((sh) => {
      const orig = sh as any;
      return {
        ...sh,
        kategori: orig.kategori || "sekolah",
        foto: orig.foto,
        tier: (orig.tier as 1 | 2 | 3 | 4 | 5) || assignedTiers.get(sh.id) || (4 as 1 | 2 | 3 | 4 | 5),
      };
    });
  }, [poskoData, userCoords]);

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
    if (activeFilterChip === "telemetri") {
      return [];
    }
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

  // Skema 5 Level Kemunculan Bertahap (LoD by Zoom Level) ala Google Maps:
  const mapVisibleShelters = useMemo(() => {
    // 0. Jika User Melakukan Filter (Search / Kategori / Kecamatan):
    const isFiltered = Boolean(searchQuery.trim() || activeFilterChip !== "terdekat");
    if (isFiltered) {
      if (mapBounds && mapZoom >= 11) {
        return displayedShelters.filter((sh) => mapBounds.contains(L.latLng(sh.lat, sh.lng)));
      }
      return displayedShelters.slice(0, 30);
    }

    // Viewport Bounding Box: HANYA data yang koordinatnya berada di dalam area layar aktif
    const inView = mapBounds
      ? displayedShelters.filter((sh) => mapBounds.contains(L.latLng(sh.lat, sh.lng)))
      : displayedShelters;

    let result: typeof displayedShelters = [];

    // LEVEL 1: Zoom Sangat Luar (Zoom <= 10) - Gambar 1
    // Persebaran merata: Tampilkan HANYA 1 posko utama per kecamatan besar (Tier 1: ~8-10 pin penting)
    if (mapZoom <= 10) {
      result = inView.filter((sh) => sh.tier === 1);
      // Jika inView belum mencakup seluruh daratan karena zoom inisial, ambil langsung dari displayedShelters Tier 1
      if (result.length < 5) {
        result = displayedShelters.filter((sh) => sh.tier === 1);
      }
    }
    // LEVEL 2: Zoom Tingkat Kawasan (Zoom 11) - Gambar 2
    // Posko sekunder lapis kedua (Tier 1 + Tier 2: ~18-25 pin tersebar seimbang)
    else if (mapZoom === 11) {
      result = inView.filter((sh) => sh.tier <= 2);
    }
    // LEVEL 3: Zoom Tingkat Kecamatan (Zoom 12) - Gambar 3
    // Tier 1, 2, 3 dengan batas minimum jarak (~1.2 km) agar tidak bertumpuk
    else if (mapZoom === 12) {
      const candidates = inView.filter((sh) => sh.tier <= 3);
      result = filterMinDistance(candidates, 1.2);
    }
    // LEVEL 4: Zoom Lingkungan / Desa (Zoom 13 - 14) - Gambar 4
    // Posko lokal tingkat RW / sekolah dasar / masjid di area pandang
    else if (mapZoom <= 14) {
      const candidates = inView.filter((sh) => sh.tier <= 4);
      result = filterMinDistance(candidates, 0.4);
    }
    // LEVEL 5: Zoom Maksimal Dekat (Zoom >= 15) - Gambar 5
    // Render SEMUA posko evakuasi secara lengkap di dalam area layar aktif
    else {
      result = inView;
    }

    // Pastikan posko yang sedang aktif dipilih user selalu disertakan di peta
    if (activeShelterDetail && !result.some((s) => s.id === activeShelterDetail.id)) {
      const matchInDisplayed = displayedShelters.find((s) => s.id === activeShelterDetail.id);
      if (matchInDisplayed) {
        result = [matchInDisplayed, ...result];
      }
    }

    return result;
  }, [displayedShelters, searchQuery, activeFilterChip, mapZoom, mapBounds, activeShelterDetail]);

  // Status tampilan default (3-5 posko terdekat) vs mode dinamis/ekspansi
  const isDefaultView = activeFilterChip === "terdekat" && !showAllShelters && !searchQuery.trim();

  // Judul dinamis untuk header Card Posko Evakuasi
  const getCardHeaderTitle = () => {
    if (searchQuery.trim()) {
      return `Hasil Pencarian: "${searchQuery}"`;
    }
    if (activeFilterChip === "telemetri") {
      return showAllTelemetry
        ? `Seluruh Stasiun Air (${sortedTelemetry.length} Terdata)`
        : "Sensor Air Terdekat dari Lokasi Anda";
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
      return `Posko Terdekat Lainnya (${Math.min(20, displayedShelters.length)} Terdekat)`;
    }
    return "Posko Evakuasi Terdekat";
  };

  const [selectedMarker, setSelectedMarker] = useState<
    | { type: "shelter"; data: MapShelterPoint }
    | { type: "report"; data: MapReportPoint }
    | { type: "telemetry"; data: MapTelemetryPoint }
    | null
  >(null);

  // Definisi 3 Mode Tampilan Sesuai Standar Google Maps:
  // - IDLE: Mode Jelajah (Search Bar & Filter Kategori Tampil, Card Daftar Posko Ringkas)
  // - DETAIL: Mode Detail Posko / Titik (Search & Filter Sembunyi, Card Detail Full Height)
  // - ROUTE: Mode Navigasi Rute (Search & Filter Sembunyi, Card Rute Full Height)
  const viewMode: "IDLE" | "DETAIL" | "ROUTE" = (activeNavRoute || (isRoutingLoading && targetNavShelter))
    ? "ROUTE"
    : (activeShelterDetail || activeReportDetail || activeTelemetryDetail)
      ? "DETAIL"
      : "IDLE";
  const isDetailActive = viewMode !== "IDLE";

  // 3-Level Sheet Snap ala Google Maps: 'min' (~74px mentok bawah), 'mid' (~42vh default), 'full' (calc(100vh - 80px))
  type SheetSnap = "min" | "mid" | "full";
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("mid");
  const sheetSnapRef = useRef<SheetSnap>(sheetSnap);
  sheetSnapRef.current = sheetSnap;
  const isDetailActiveRef = useRef<boolean>(isDetailActive);
  isDetailActiveRef.current = isDetailActive;
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    touchDeltaYRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    touchDeltaYRef.current = e.touches[0].clientY - touchStartYRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartYRef.current === null) return;
    const deltaY = touchDeltaYRef.current;
    const elapsed = Date.now() - (touchStartTimeRef.current || 0);
    touchStartYRef.current = null;
    touchDeltaYRef.current = 0;

    // Threshold responsif (15px normal atau 10px flick cepat < 250ms)
    if (deltaY > 15 || (deltaY > 10 && elapsed < 250)) {
      // Geser KE BAWAH (Drag Down)
      setSheetSnap((prev) => {
        if (prev === "full") return "mid";
        if (prev === "mid") return "min";
        return "min";
      });
    } else if (deltaY < -15 || (deltaY < -10 && elapsed < 250)) {
      // Geser KE ATAS (Drag Up)
      setSheetSnap((prev) => {
        if (prev === "min") return "mid";
        if (prev === "mid") return "full";
        return "full";
      });
    }
  };

  const bodyScrollTopRef = useRef<number>(0);
  const bodyTouchStartYRef = useRef<number | null>(null);
  const bodyTouchDeltaYRef = useRef<number>(0);

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    bodyScrollTopRef.current = e.currentTarget.scrollTop;
  };

  const handleBodyTouchStart = (e: React.TouchEvent) => {
    bodyTouchStartYRef.current = e.touches[0].clientY;
    bodyTouchDeltaYRef.current = 0;
  };

  const handleBodyTouchMove = (e: React.TouchEvent) => {
    if (bodyTouchStartYRef.current === null) return;
    bodyTouchDeltaYRef.current = e.touches[0].clientY - bodyTouchStartYRef.current;
  };

  const handleBodyTouchEnd = () => {
    if (bodyTouchStartYRef.current === null) return;
    const deltaY = bodyTouchDeltaYRef.current;
    const isAtTop = bodyScrollTopRef.current <= 5;
    bodyTouchStartYRef.current = null;
    bodyTouchDeltaYRef.current = 0;

    if (deltaY > 35 && isAtTop) {
      setSheetSnap((prev) => {
        if (prev === "full") return "mid";
        if (prev === "mid") return "min";
        return "min";
      });
    }
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
    } catch { }
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
        color: "#24544E",
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
    activeRouteLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Pasang listener zoom & moveend untuk Dynamic Level of Detail ala Google Maps
    map.on("zoomend", () => {
      setMapZoom(map.getZoom());
      setMapBounds(map.getBounds());
    });
    map.on("moveend", () => {
      setMapBounds(map.getBounds());
    });
    setMapZoom(map.getZoom());
    setMapBounds(map.getBounds());

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
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-mobile-nav');
      }
      if (navWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(navWatchIdRef.current);
        navWatchIdRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.remove();
        userAccuracyCircleRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
      activeRouteLayerRef.current = null;
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
      const activeReportsList = internalReports && internalReports.length > 0 ? internalReports : reports;
      activeReportsList.forEach((rep) => {
        const isCritical = rep.severity === "CRITICAL";
        const isHigh = rep.severity === "HIGH";
        const color = isCritical ? "#DC2626" : isHigh ? "#EA580C" : "#D97706";

        const icon = createPinIcon(isCritical ? "kritis" : "genangan", false, mapZoom);
        const repPhoto = getReportPhoto(rep);
        const repNote = getReportNote(rep);

        const popupContent = `
          <div style="font-family: inherit; width: 235px; padding: 2px; color: #132422;">
            ${
              repPhoto
                ? `<div style="width: 100%; height: 100px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #EEF5F3; border: 1px solid #E2E8F0;">
                    <img src="${repPhoto}" style="width: 100%; height: 100%; object-fit: cover;" alt="${rep.title}" />
                   </div>`
                : ""
            }
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
            <div style="font-size: 10px; color: #38746D; font-weight: 700; margin-bottom: ${repNote ? "4px" : "0"};">
              Status: ${rep.status}
            </div>
            ${repNote ? `<div style="font-size: 10px; color: #64748B; background: #F8FAF9; padding: 4px 6px; border-radius: 6px; border: 1px solid #E2E8F0; margin-top: 4px; line-height: 1.4;">📝 ${repNote}</div>` : ""}
          </div>
        `;

        const marker = L.marker([rep.lat, rep.lng], { icon }).bindPopup(popupContent);

        // Lingkaran Radius Hambatan Genangan (200 meter)
        if (rep.waterLevelText || rep.ticketCode.startsWith("GEN-")) {
          const floodCircle = L.circle([rep.lat, rep.lng], {
            radius: 200,
            color: isCritical ? "#DC2626" : "#F59E0B",
            fillColor: isCritical ? "#EF4444" : "#FBBF24",
            fillOpacity: 0.16,
            weight: 1.5,
            dashArray: "4, 6",
          }).bindTooltip(
            `<div style="font-size: 10px; font-weight: bold; color: ${color};">Radius Hambatan 200m: ${rep.title} (${rep.waterLevelText || "Air Pasang"})</div>`,
            { direction: "top", offset: [0, -10] }
          );
          reportsLayerRef.current?.addLayer(floodCircle);
        }
        marker.on("click", () => {
          const hydratedRep: MapReportPoint = {
            ...rep,
            photos: rep.photos && rep.photos.length > 0 ? rep.photos : (repPhoto ? [repPhoto] : []),
            photoUrl: repPhoto || rep.photoUrl,
            note: repNote || rep.note,
          };
          setActiveReportDetail(hydratedRep);
          setActiveShelterDetail(null);
          setActiveTelemetryDetail(null);
          setSelectedMarker({ type: "report", data: hydratedRep });
          setSiagaExpanded(false);
          setPoskoExpanded(true);
          setSheetSnap("mid");
          clearRadarGlow();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([rep.lat, rep.lng], 16, { duration: 1.2 });
          }
          if (onSelectReport) onSelectReport(hydratedRep);
        });
        reportsLayerRef.current?.addLayer(marker);
      });
    }

    // 2. PLOT SHELTERS (POSKO PENGUNGSIAN) BERSIH & STATIS ALA GOOGLE MAPS
    if (activeLayer === "ALL" || activeLayer === "SHELTERS") {
      mapVisibleShelters.forEach((sh) => {
        const sisaKapasitas = sh.capacityTotal - sh.capacityFilled;
        const isFull = sh.status === "PENUH";
        const isSelected = activeShelterDetail?.id === sh.id;

        const icon = createPinIcon("posko", isSelected, mapZoom);

        const shelterPhotos = (sh.photos && sh.photos.length > 0 ? sh.photos : (sh.foto ? [sh.foto] : [])).filter((u) => !u.includes("default.jpg"));
        let photoPreviewHtml = "";
        if (shelterPhotos.length === 1) {
          photoPreviewHtml = `
            <div style="width: 100%; height: 95px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #E2E8F0;">
              <img src="${shelterPhotos[0]}" style="width: 100%; height: 100%; object-fit: cover;" alt="${sh.name}" />
            </div>
          `;
        } else if (shelterPhotos.length === 2) {
          photoPreviewHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; height: 85px; margin-bottom: 6px;">
              <div style="border-radius: 6px; overflow: hidden; background: #E2E8F0;"><img src="${shelterPhotos[0]}" style="width: 100%; height: 100%; object-fit: cover;" /></div>
              <div style="border-radius: 6px; overflow: hidden; background: #E2E8F0;"><img src="${shelterPhotos[1]}" style="width: 100%; height: 100%; object-fit: cover;" /></div>
            </div>
          `;
        } else if (shelterPhotos.length >= 3) {
          photoPreviewHtml = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4px; height: 90px; margin-bottom: 6px;">
              <div style="border-radius: 6px; overflow: hidden; background: #E2E8F0;"><img src="${shelterPhotos[0]}" style="width: 100%; height: 100%; object-fit: cover;" /></div>
              <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 4px; height: 90px;">
                <div style="border-radius: 6px; overflow: hidden; background: #E2E8F0;"><img src="${shelterPhotos[1]}" style="width: 100%; height: 100%; object-fit: cover;" /></div>
                <div style="border-radius: 6px; overflow: hidden; background: #E2E8F0; position: relative;">
                  <img src="${shelterPhotos[2]}" style="width: 100%; height: 100%; object-fit: cover;" />
                  ${shelterPhotos.length > 3 ? `<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.65); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">+${shelterPhotos.length - 3}</div>` : ""}
                </div>
              </div>
            </div>
          `;
        }

        const popupContent = `
          <div style="font-family: inherit; width: 235px; padding: 2px; color: #132422;">
            ${photoPreviewHtml}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #047857; background: #ECFDF5; padding: 2px 6px; border-radius: 6px; border: 1px solid #A7F3D0;">
                POSKO EVAKUASI
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

        const marker = L.marker([sh.lat, sh.lng], { icon, title: sh.name }).bindPopup(popupContent);
        marker.on("click", () => {
          handleSelectShelterItem(sh);
        });

        // Tooltip nama ringkas saat di-hover
        marker.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; font-weight: 800; color: #1D443F; padding: 2px 4px;">${sh.name}</div>`,
          { direction: "top", offset: [0, -36], opacity: 0.95 }
        );

        sheltersLayerRef.current?.addLayer(marker);
      });
    }

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

    // 4. PLOT TELEMETRY STATIONS (HANYA STASIUN TERDEKAT DARI LOKASI GPS PENGGUNA)
    if (activeLayer === "ALL" || activeLayer === "TELEMETRY" || activeFilterChip === "telemetri") {
      // HANYA tampilkan stasiun di sekitar radius lokasi GPS warga (3 terdekat ala posko)
      const telemetryToPlot = showAllTelemetry ? sortedTelemetry : sortedTelemetry.slice(0, 3);
      const activeTel = activeTelemetryDetail;
      const finalTelemetryList = (activeTel && !telemetryToPlot.some((t) => t.id === activeTel.id))
        ? [activeTel, ...telemetryToPlot]
        : telemetryToPlot;

      finalTelemetryList.forEach((tel) => {
        const isWaspada = tel.status === "WASPADA" || tel.status === "SIAGA";
        const color = isWaspada ? "#D97706" : "#0284C7";

        const icon = createPinIcon("sensor", false, mapZoom);

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
          setSheetSnap("mid");
          clearRadarGlow();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([tel.lat, tel.lng], 16, { duration: 1.2 });
          }
        });
        telemetryLayerRef.current?.addLayer(marker);
      });
    }

    // Pastikan titik "Lokasi Anda" selalu aktif dan terpasang di layer teratas peta
    updateUserMarkerOnMap(userCoords[0], userCoords[1]);
  }, [reports, internalReports, mapVisibleShelters, telemetry, sortedTelemetry, showAllTelemetry, activeTelemetryDetail, activeLayer, activeFilterChip, mapZoom, onSelectReport, onSelectShelter, userCoords]);

  // Marker seleksi statis ala Google Maps (animasi radar/uap dihapus total)
  const showRadarGlow = (_lat: number, _lng: number) => { };
  const clearRadarGlow = () => { };

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
    setTargetNavShelter(null);
    setIsRoutingLoading(false);
    setSheetSnap("min");
    setSelectedRouteClassification(1);
    setIsPickingWaypoint(false);
    setCustomWaypoint(null);
    updateUserMarkerOnMap(userCoords[0], userCoords[1]);
  };

  // Pilih Item Posko: Kamera terbang, Radar menyala, & Buka Detail Card (Tanpa langsung gambar rute!)
  const handleSelectShelterItem = (sh: MapShelterPoint) => {
    // 1. Bersihkan layer rute jika sebelumnya ada rute lain aktif
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    setActiveNavRoute(null);
    setTargetNavShelter(null);
    setIsRoutingLoading(false);

    // 2. Set posko terpilih (viewMode beralih ke 'DETAIL')
    setActiveShelterDetail(sh);
    setActiveReportDetail(null);
    setActiveTelemetryDetail(null);
    setSelectedMarker({ type: "shelter", data: sh });
    setSiagaExpanded(false);
    setPoskoExpanded(true);
    setSheetSnap("mid");
    setSelectedRouteClassification(1);
    setIsPickingWaypoint(false);
    showRadarGlow(sh.lat, sh.lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([sh.lat, sh.lng], { animate: true, duration: 0.5 });
    }
    if (onSelectShelter) {
      onSelectShelter(sh);
    }
    // CATATAN: HANYA buka detail posko! Kalkulasi rute baru jalan saat tombol "Arahkan Rute" diklik.
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

  // Helper icon SVG untuk speech bubble Google Maps
  const getModeIconSvg = (m: "motorcycle" | "car" | "walking", color: string) => {
    if (m === "motorcycle") {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-3l-3 5.5h6l-1.5 6"/><path d="M9 11.5l3.5-5.5H16"/></svg>`;
    }
    if (m === "car") {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C1.4 11.2 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
    }
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>`;
  };

  // Helper mencari titik optimal penempatan callout bubble rute agar tidak bertumpukan
  const findBestCalloutPoint = (
    coords: [number, number][],
    otherCoords?: [number, number][],
    preferredRatio: number = 0.5
  ): [number, number] => {
    if (!coords || coords.length === 0) return [0, 0];
    if (coords.length < 6 || !otherCoords || otherCoords.length === 0) {
      const idx = Math.min(coords.length - 1, Math.max(0, Math.floor(coords.length * preferredRatio)));
      return coords[idx];
    }

    let bestIdx = Math.floor(coords.length * preferredRatio);
    let maxMinDist = -1;

    const startCheck = Math.floor(coords.length * 0.2);
    const endCheck = Math.floor(coords.length * 0.8);
    const step = Math.max(1, Math.floor(coords.length / 25));

    for (let i = startCheck; i <= endCheck; i += step) {
      const [lat, lng] = coords[i];
      let minDist = Infinity;
      for (let j = 0; j < otherCoords.length; j += Math.max(1, Math.floor(otherCoords.length / 25))) {
        const [oLat, oLng] = otherCoords[j];
        const dLat = (lat - oLat) * 111000;
        const dLng = (lng - oLng) * 110000;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDist) minDist = dist;
      }

      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    if (maxMinDist < 60) {
      bestIdx = Math.min(coords.length - 1, Math.max(0, Math.floor(coords.length * preferredRatio)));
    }

    return coords[bestIdx];
  };

  // Render Layer Polyline & Tooltip di Peta Leaflet
  const renderNavRoutesOnMap = (
    routes: NavigationRouteOption[],
    selectedIndex: number,
    mode: "motorcycle" | "car" | "walking" = "motorcycle",
    destPoskoCoords?: [number, number],
    originUserCoords?: [number, number],
    isNavMode: boolean = false,
    currentNavPosition?: [number, number] | null
  ) => {
    if (!activeRouteLayerRef.current && mapInstanceRef.current) {
      activeRouteLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
    if (!activeRouteLayerRef.current) return;
    activeRouteLayerRef.current.clearLayers();

    const modeIcon = mode === "motorcycle" ? "🏍️" : mode === "car" ? "🚗" : "🚶";

    // 1. Gambar rute alternatif (Secondary Route) di layer bawah mengikuti jaringan jalan riil OSRM
    if (!isNavMode) {
      routes.forEach((rt, idx) => {
      if (idx === selectedIndex) return;

      const isWarning = rt.statusBadgeType === "warning";

      // Border Casing rute alternatif (Garis tepi putih tipis)
      const altCasing = L.polyline(rt.coordinates, {
        color: "#FFFFFF",
        weight: 8,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
        interactive: true,
      });

      // Garis Rute Alternatif (Secondary Route) - Abu-abu kebiruan terang khas Google Maps (#8AB4F8)
      const altLine = L.polyline(rt.coordinates, {
        color: isWarning ? "#F59E0B" : "#8AB4F8",
        weight: 6,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
        interactive: true,
      });

      // Klik polyline alternatif untuk langsung menjadikannya rute utama terpilih
      const handleClickAlt = (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        handleSelectRouteIndex(idx);
      };
      altCasing.on("click", handleClickAlt);
      altLine.on("click", handleClickAlt);

      activeRouteLayerRef.current?.addLayer(altCasing);
      activeRouteLayerRef.current?.addLayer(altLine);

      // Callout Balon Putih (#FFFFFF) khas Google Maps untuk Rute Alternatif (Tangkai mengarah ke jalan)
      const primaryCoords = routes[selectedIndex]?.coordinates || [];
      const altCalloutPoint = findBestCalloutPoint(rt.coordinates, primaryCoords, 0.6);

      const altBubbleHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none; pointer-events: auto; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.18)); transition: transform 0.15s ease;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
          <div style="background: #FFFFFF; color: #1E293B; border: 1.5px solid #CBD5E1; padding: 5px 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 1px; white-space: nowrap;">
            <div style="display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: #1E293B; line-height: 1.2;">
              ${getModeIconSvg(mode, "#1E293B")}
              <span>${rt.durationText}</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: ${isWarning ? "#D97706" : "#475569"}; line-height: 1.2;">
              ${rt.distanceText} &bull; ${isWarning ? "Rawan Genangan" : "Jalur Kering"}
            </div>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #FFFFFF; margin-top: -1.5px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));"></div>
        </div>
      `;

      const altDivIcon = L.divIcon({
        html: altBubbleHtml,
        className: "custom-nav-alt-callout",
        iconSize: [160, 52],
        iconAnchor: [80, 52],
      });

      const altMarker = L.marker(altCalloutPoint, {
        icon: altDivIcon,
        zIndexOffset: 2400,
      });

      altMarker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectRouteIndex(idx);
      });

      activeRouteLayerRef.current?.addLayer(altMarker);
      });
    }

    // 2. Gambar rute utama / terpilih di layer teratas ala Google Maps (Biru #1A73E8 + Casing Putih)
    const activeRoute = routes[selectedIndex] || routes[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      const isWarning = activeRoute.statusBadgeType === "warning";
      const mainColor = isWarning ? "#F59E0B" : activeRoute.statusBadgeType === "custom" ? "#7C3AED" : "#1A73E8";

      if (isNavMode && currentNavPosition) {
        const { passed, remaining } = splitRouteAtCurrentPosition(activeRoute.coordinates, currentNavPosition);

        // a. Rute Yang Sudah Dilewati (Passed Route / Jejak Lendir Siput Pudar)
        if (passed.length > 1) {
          const passedLine = L.polyline(passed, {
            color: "#94A3B8",
            weight: 6,
            opacity: 0.35,
            lineCap: "round",
            lineJoin: "round",
          });
          activeRouteLayerRef.current?.addLayer(passedLine);
        }

        // b. Rute Yang Belum Dilewati (Remaining Route: Casing putih tebal + core biru aktif)
        if (remaining.length > 1) {
          const glowLine = L.polyline(remaining, {
            color: "#FFFFFF",
            weight: 9,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          });
          const coreLine = L.polyline(remaining, {
            color: mainColor,
            weight: 6,
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
          });
          activeRouteLayerRef.current?.addLayer(glowLine);
          activeRouteLayerRef.current?.addLayer(coreLine);
        }
      } else {
        // Casing layer garis putih di bawahnya (Google Maps Halo Casing)
        const glowLine = L.polyline(activeRoute.coordinates, {
          color: "#FFFFFF",
          weight: 9,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        });

        // Garis rute utama di atas casing (Google Maps Core Blue #1A73E8)
        const coreLine = L.polyline(activeRoute.coordinates, {
          color: mainColor,
          weight: 6,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        });

        activeRouteLayerRef.current?.addLayer(glowLine);
        activeRouteLayerRef.current?.addLayer(coreLine);
      }

      // Callout Balon Biru Tua (#1A73E8) khas Google Maps untuk Rute Utama Terpilih
      if (!isNavMode) {
      const altRouteCoords = routes.find((_, i) => i !== selectedIndex)?.coordinates;
      const primaryCalloutPoint = findBestCalloutPoint(activeRoute.coordinates, altRouteCoords, 0.4);

      const primaryBubbleHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; user-select: none; pointer-events: auto; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.28));">
          <div style="background: #1A73E8; color: #ffffff; padding: 5px 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 1px; white-space: nowrap;">
            <div style="display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; line-height: 1.2;">
              ${getModeIconSvg(mode, "#FFFFFF")}
              <span>${activeRoute.durationText}</span>
            </div>
            <div style="font-size: 11px; font-weight: 500; opacity: 0.95; line-height: 1.2;">
              ${activeRoute.distanceText} &bull; ${isWarning ? "Rawan Genangan" : "Aman (Bebas Banjir)"}
            </div>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #1A73E8; margin-top: -0.5px;"></div>
        </div>
      `;

      const primaryDivIcon = L.divIcon({
        html: primaryBubbleHtml,
        className: "custom-nav-primary-callout",
        iconSize: [160, 52],
        iconAnchor: [80, 52],
      });

      const primaryMarker = L.marker(primaryCalloutPoint, {
        icon: primaryDivIcon,
        zIndexOffset: 2600, // Z-Index lebih tinggi daripada rute alternatif
      });

      activeRouteLayerRef.current?.addLayer(primaryMarker);
      }

      // Warning marker jika rute terpilih melintasi titik hambatan
      if (isWarning && activeRoute.coordinates.length > 2) {
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
          `<div style="font-size:10px; font-weight:bold; color:#DC2626; padding:2px 4px;">Titik Genangan Air</div>`,
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

      // ==============================================================
      // 3. Pangkal Rute / Titik Awal (Lokasi Pengguna)
      // ==============================================================
      const roadStartCoord = activeRoute.coordinates[0];
      const targetOriginCoord =
        originUserCoords ||
        activeNavRoute?.originCoords ||
        (userMarkerRef.current ? [userMarkerRef.current.getLatLng().lat, userMarkerRef.current.getLatLng().lng] as [number, number] : userCoords);

      if (roadStartCoord) {
        // Dot bulat kecil di tepi jalan awal rute OSRM (#1E293B dengan border putih)
        const startDotIcon = L.divIcon({
          className: "custom-nav-start-dot",
          html: `
            <div style="width: 12px; height: 12px; border-radius: 9999px; background: #1E293B; border: 2px solid #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const startDotMarker = L.marker(roadStartCoord, { icon: startDotIcon, zIndexOffset: 2000 });
        activeRouteLayerRef.current?.addLayer(startDotMarker);

        // Garis Penghubung Putus-Putus Awal (First-Mile Walking Dotted Line)
        // Jika lokasi pengguna berada di dalam gang/halaman/rumah (berjarak > 3 meter dari jalan raya)
        if (targetOriginCoord) {
          const distFromUser = calcMetersSafe(
            targetOriginCoord[0],
            targetOriginCoord[1],
            roadStartCoord[0],
            roadStartCoord[1]
          );
          if (distFromUser > 3) {
            const firstMileLine = L.polyline([targetOriginCoord, roadStartCoord], {
              color: "#1E293B",
              weight: 3,
              opacity: 0.8,
              dashArray: "4, 6",
              lineCap: "round",
              lineJoin: "round",
            });
            activeRouteLayerRef.current?.addLayer(firstMileLine);
          }

          // Pastikan marker "Lokasi Anda" di peta utama selalu aktif di titik pangkal targetOriginCoord
          updateUserMarkerOnMap(targetOriginCoord[0], targetOriginCoord[1]);
        }
      }

      // ==============================================================
      // 4. Titik Akhir / Posko Tujuan: Dot bulat kecil tanpa label (#1E293B dengan border putih)
      // ==============================================================
      const roadEndCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      const targetPoskoCoord =
        destPoskoCoords ||
        activeNavRoute?.destinationCoords ||
        (activeShelterRef.current ? [activeShelterRef.current.lat, activeShelterRef.current.lng] as [number, number] : undefined);

      if (roadEndCoord) {
        const dotIcon = L.divIcon({
          className: "custom-nav-dest-dot",
          html: `
            <div style="width: 12px; height: 12px; border-radius: 9999px; background: #1E293B; border: 2px solid #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const dotMarker = L.marker(roadEndCoord, { icon: dotIcon, zIndexOffset: 2000 });
        activeRouteLayerRef.current?.addLayer(dotMarker);

        // Garis Penghubung Putus-Putus (Last-Mile Walking Dotted Line)
        // Menghubungkan titik akhir jalan raya OSRM langsung ke koordinat pin posko jika berada di dalam gang/halaman
        if (targetPoskoCoord) {
          const distToPosko = calcMetersSafe(
            roadEndCoord[0],
            roadEndCoord[1],
            targetPoskoCoord[0],
            targetPoskoCoord[1]
          );
          if (distToPosko > 3) {
            const walkingLine = L.polyline([roadEndCoord, targetPoskoCoord], {
              color: "#1E293B",
              weight: 3,
              opacity: 0.8,
              dashArray: "4, 6",
              lineCap: "round",
              lineJoin: "round",
            });
            activeRouteLayerRef.current?.addLayer(walkingLine);
          }
        }
      }

      // 5. Viewport FitBounds Otomatis membingkai titik awal pengguna, seluruh rute jalan, dan titik posko
      const allFitCoords = [
        ...(targetOriginCoord ? [targetOriginCoord] : []),
        ...activeRoute.coordinates,
        ...(targetPoskoCoord ? [targetPoskoCoord] : []),
      ];
      const bounds = L.latLngBounds(allFitCoords);
      if (bounds.isValid()) {
        mapInstanceRef.current?.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 17,
          animate: true,
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
      renderNavRoutesOnMap(updated.routes, newIndex, updated.transportMode, updated.destinationCoords, updated.originCoords);
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
      renderNavRoutesOnMap(updatedRoutes, prev.selectedRouteIndex, newMode, prev.destinationCoords, prev.originCoords);
      return updated;
    });
  };

  // Preview Rute untuk 3 Klasifikasi & Waypoint di Card Detail Posko Evakuasi
  const previewShelterRoute = (
    shelter: MapShelterPoint,
    classification: 1 | 2 | 3 | "custom",
    customWpData?: any
  ) => {
    // Delegasikan langsung ke drawSafeRoute agar 100% menggunakan koordinat jaringan jalan riil OSRM
    const targetIdx = classification === 2 ? 1 : classification === 3 ? 2 : 0;
    drawSafeRoute(shelter, "motorcycle", targetIdx, customWpData);
  };

  // Handler klik peta saat mode titik singgah aktif
  const handleMapClickForWaypoint = async (lat: number, lng: number) => {
    setIsPickingWaypoint(false);
    isPickingWaypointRef.current = false;
    const shelter = activeShelterRef.current;
    if (!shelter) return;

    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : userCoords;
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
    targetSelectedIdx = 0,
    customWp?: any
  ) => {
    setTargetNavShelter(shelter);
    setIsRoutingLoading(true);
    setPoskoExpanded(true);

    const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : null;
    const startCoord: [number, number] = userLatLng ? [userLatLng.lat, userLatLng.lng] : userCoords;
    const userLat = startCoord[0];
    const userLng = startCoord[1];
    const poskoLat = shelter.lat;
    const poskoLng = shelter.lng;

    const baseMeters = parseDistanceInMeters(shelter.distance);
    const baseMinutes = Math.max(1, Math.round(baseMeters / 300));

    let rawRoutes: any[] = [];

    try {
      // Endpoint OSRM driving resmi dengan parameter alternatives=true
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${poskoLng},${poskoLat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
          rawRoutes = data.routes;
        }
      }
    } catch (err) {
      console.warn("Gagal menghubungi OSRM router:", err);
    }

    // Jika OSRM hanya mengembalikan 1 rute tunggal, query rute alternatif kedua via jalan paralel
    if (rawRoutes.length === 1 && rawRoutes[0].geometry?.coordinates?.length > 4) {
      const coords = rawRoutes[0].geometry.coordinates;
      const mid = coords[Math.floor(coords.length / 2)];
      const detourLng = mid[0] + 0.0035;
      const detourLat = mid[1] + 0.0035;
      try {
        const altUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${detourLng},${detourLat};${poskoLng},${poskoLat}?overview=full&geometries=geojson&steps=true`;
        const altRes = await fetch(altUrl, { signal: AbortSignal.timeout(4000) });
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.code === "Ok" && altData.routes?.[0]) {
            rawRoutes.push(altData.routes[0]);
          }
        }
      } catch { }
    }

    const computedRoutes: NavigationRouteOption[] = [];

    if (rawRoutes.length > 0) {
      // 1. Proses setiap rute riil yang dikembalikan OSRM
      rawRoutes.forEach((r, idx) => {
        const rawCoords = r.geometry?.coordinates || [];
        // PENTING: OSRM GeoJSON format [lng, lat] DIUBAH menjadi format Leaflet [lat, lng]
        const leafletPositions: [number, number][] = rawCoords.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        const rDist = Math.round(r.distance || baseMeters);
        const rDur = Math.round(r.duration || baseMinutes * 60);

        // Deteksi perpotongan dengan 20 titik hambatan genangan (Radius 200m)
        const hitObstacles = detectIntersectedFloodObstacles(leafletPositions, FLOOD_OBSTACLES);
        const isFlooded = hitObstacles.length > 0;
        const maxWaterDepth = isFlooded ? Math.max(...hitObstacles.map((o) => o.depthCm)) : 0;

        const rawSteps = r.legs?.[0]?.steps || [];
        const steps: NavigationStep[] = rawSteps.map((st: any) => {
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
            distanceMeters: st.distance || 0,
            location: st.maneuver?.location ? [st.maneuver.location[1], st.maneuver.location[0]] : undefined,
            type: st.maneuver?.type,
            modifier: st.maneuver?.modifier,
          };
        });

        if (isFlooded) {
          computedRoutes.push({
            id: `rt-${idx + 1}-warning`,
            name: idx === 0 ? `Terdekat tapi Ada Genangan (lewat ${hitObstacles[0].location.split(",")[0]})` : `Jalur Alternatif ${idx + 1} (Ada Genangan)`,
            summary: `lewat ${hitObstacles[0].location} (Melintasi Radius 200m)`,
            distanceText: formatNavDistance(rDist),
            distanceMeters: rDist,
            durationText: formatNavDuration(computeModeDuration(rDist, rDur, initialMode)),
            durationSeconds: rDur,
            statusBadge: `Rawan Genangan (${maxWaterDepth} cm)`,
            statusBadgeType: "warning",
            coordinates: leafletPositions,
            steps: [
              ...steps,
              { instruction: `PERINGATAN: Jalur ini terdeteksi genangan air ${hitObstacles[0].title} setinggi ${maxWaterDepth} cm`, distance: "200 m" },
            ],
          });
        } else {
          computedRoutes.push({
            id: `rt-${idx + 1}-safe`,
            name: idx === 0 ? "Terdekat & Bebas Genangan (Rekomendasi BPBD)" : `Jalur Bebas Banjir Alternatif ${idx + 1}`,
            summary: `lewat ${steps[1]?.instruction.replace("Lurus di ", "") || "jalur jalan aman"}`,
            distanceText: formatNavDistance(rDist),
            distanceMeters: rDist,
            durationText: formatNavDuration(computeModeDuration(rDist, rDur, initialMode)),
            durationSeconds: rDur,
            statusBadge: "Bebas Genangan • Rekomendasi BPBD",
            statusBadgeType: "safe",
            coordinates: leafletPositions,
            steps,
          });
        }
      });
    } else {
      // Fallback lokal aman dengan midpoint jika offline/rate-limit
      const midPoint: [number, number] = [(userLat + poskoLat) / 2, (userLng + poskoLng) / 2];
      const fallbackPositions: [number, number][] = [
        [userLat, userLng],
        midPoint,
        [poskoLat, poskoLng],
      ];
      computedRoutes.push({
        id: "rt-1-fallback",
        name: "Navigasi Langsung ke Gerbang Posko",
        summary: "Jalur darat menuju posko",
        distanceText: formatNavDistance(baseMeters),
        distanceMeters: baseMeters,
        durationText: formatNavDuration(baseMinutes * 60),
        durationSeconds: baseMinutes * 60,
        statusBadge: "Bebas Genangan • Rekomendasi BPBD",
        statusBadgeType: "safe",
        coordinates: fallbackPositions,
        steps: [
          { instruction: "Mulai dari lokasi Anda menuju gerbang posko", distance: formatNavDistance(baseMeters) },
          { instruction: `Tiba di ${shelter.name}`, distance: "10 m" },
        ],
      });
    }

    // Jika ada custom waypoint aktif
    if (customWp && customWp.lat && customWp.lng) {
      const customCoords = customWp.coordinates || [
        [userLat, userLng],
        [customWp.lat, customWp.lng],
        [poskoLat, poskoLng],
      ];
      computedRoutes.push({
        id: "rt-custom-wp",
        name: "Rute Kustom via Titik Singgah",
        summary: "lewat titik singgah pilihan Anda",
        distanceText: customWp.distanceText || formatNavDistance(Math.round(baseMeters * 1.2)),
        distanceMeters: Math.round(baseMeters * 1.2),
        durationText: customWp.durationText || formatNavDuration(Math.round(baseMinutes * 60 * 1.2)),
        durationSeconds: Math.round(baseMinutes * 60 * 1.2),
        statusBadge: "Titik Singgah Kustom",
        statusBadgeType: "custom",
        coordinates: customCoords,
        steps: [
          { instruction: "Menuju titik singgah pilihan Anda", distance: formatNavDistance(Math.round(baseMeters * 0.6)) },
          { instruction: `Melanjutkan perjalanan menuju ${shelter.name}`, distance: formatNavDistance(Math.round(baseMeters * 0.6)) },
        ],
      });
    }

    // Tentukan rute yang terpilih
    const safeSelectedIdx = Math.min(targetSelectedIdx, computedRoutes.length - 1);

    const navData: ActiveNavRouteData = {
      shelter,
      originName: "Lokasi Anda",
      originCoords: [userLat, userLng],
      destinationName: shelter.name,
      destinationCoords: [poskoLat, poskoLng],
      transportMode: initialMode,
      routes: computedRoutes,
      selectedRouteIndex: safeSelectedIdx,
      showingSteps: false,
    };

    setActiveNavRoute(navData);
    setActiveShelterDetail(null);
    setSheetSnap("mid");
    setIsRoutingLoading(false);

    // Gambar di peta Leaflet & panggil fitBounds otomatis
    renderNavRoutesOnMap(computedRoutes, safeSelectedIdx, initialMode, [poskoLat, poskoLng], [userLat, userLng]);

    setToastMessage(`Navigasi rute aktif: Menuju ${shelter.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update lokasi GPS saat Mode Navigasi Berjalan aktif
  const handleGpsLocationUpdateInNavigation = (coords: [number, number], accuracy?: number) => {
    const curRoute = activeNavRouteRef.current;
    if (!curRoute) return;

    const selectedRoute = curRoute.routes[curRoute.selectedRouteIndex];
    if (!selectedRoute || !selectedRoute.coordinates || selectedRoute.coordinates.length < 2) return;

    // Threshold filter: abaikan pergeseran jitter sangat kecil (< 3 meter)
    if (navLastGpsPosRef.current) {
      const movedDist = calculateDistanceInMeters(
        navLastGpsPosRef.current[0],
        navLastGpsPosRef.current[1],
        coords[0],
        coords[1]
      );
      if (movedDist < 3) return;
    }

    navLastGpsPosRef.current = coords;
    setNavCurrentCoord(coords);

    // Cari segmen terdekat dan hitung bearing sudut hadap
    const coordsList = selectedRoute.coordinates;
    let closestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < coordsList.length; i++) {
      const d = calculateDistanceInMeters(coords[0], coords[1], coordsList[i][0], coordsList[i][1]);
      if (d < minD) {
        minD = d;
        closestIdx = i;
      }
    }

    const nextIdx = Math.min(closestIdx + 1, coordsList.length - 1);
    const nextPt = coordsList[nextIdx];
    const bearing = calculateBearing(coords[0], coords[1], nextPt[0], nextPt[1]);
    setNavBearing(bearing);

    // Hitung sisa jarak dan durasi
    let remMeters = calculateDistanceInMeters(coords[0], coords[1], nextPt[0], nextPt[1]);
    for (let j = nextIdx; j < coordsList.length - 1; j++) {
      remMeters += calculateDistanceInMeters(
        coordsList[j][0],
        coordsList[j][1],
        coordsList[j + 1][0],
        coordsList[j + 1][1]
      );
    }

    const speedMps = 6.0; // ~22 km/h
    const remSecs = Math.max(20, Math.round(remMeters / speedMps));

    setNavRemainingMeters(remMeters);
    setNavRemainingSeconds(remSecs);

    // Update step index
    if (selectedRoute.steps && selectedRoute.steps.length > 0) {
      let curStep = 0;
      for (let s = 0; s < selectedRoute.steps.length; s++) {
        const stepLoc = selectedRoute.steps[s].location;
        if (stepLoc) {
          const dToStep = calculateDistanceInMeters(coords[0], coords[1], stepLoc[0], stepLoc[1]);
          if (dToStep > 35) {
            curStep = s;
            setNavDistanceToNextStep(Math.round(dToStep));
            break;
          }
        }
      }
      setNavStepIndex(curStep);
    }

    // Render ulang marker dan polyline progress
    updateUserMarkerOnMap(coords[0], coords[1], accuracy, true, bearing);

    const destCoord: [number, number] = [curRoute.shelter.lat, curRoute.shelter.lng];
    renderNavRoutesOnMap(
      curRoute.routes,
      curRoute.selectedRouteIndex,
      curRoute.transportMode,
      destCoord,
      coords,
      true,
      coords
    );

    const map = mapInstanceRef.current;
    if (map) {
      map.panTo(coords, { animate: true, duration: 0.5 });
    }
  };

  // Mulai Mode Navigasi Berjalan (Turn-by-Turn Driving Mode) ala Google Maps
  const handleStartTurnByTurnNavigation = () => {
    if (typeof document !== "undefined") {
      document.body.classList.add("hide-mobile-nav");
    }
    if (!activeNavRoute) return;

    const selectedRoute = activeNavRoute.routes[activeNavRoute.selectedRouteIndex];
    if (!selectedRoute || !selectedRoute.coordinates || selectedRoute.coordinates.length < 2) return;

    setIsNavigating(true);
    setSheetSnap("min");

    const startCoord = userCoords || selectedRoute.coordinates[0];
    const secondCoord = selectedRoute.coordinates[1];
    const initialBearing = calculateBearing(startCoord[0], startCoord[1], secondCoord[0], secondCoord[1]);

    setNavCurrentCoord(startCoord);
    setNavBearing(initialBearing);
    setNavStepIndex(0);
    setNavRemainingMeters(selectedRoute.distanceMeters || 1200);
    setNavRemainingSeconds(selectedRoute.durationSeconds || 300);
    setNavDistanceToNextStep(
      selectedRoute.steps && selectedRoute.steps[0]?.distanceMeters
        ? selectedRoute.steps[0].distanceMeters
        : 70
    );

    // Zoom peta otomatis mendekat ke level detail jalan ala Google Maps
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(startCoord, 18, { animate: true, duration: 0.8 });
    }

    // Ganti marker lokasi menjadi chevron navigasi Google Maps
    updateUserMarkerOnMap(startCoord[0], startCoord[1], undefined, true, initialBearing);

    // Render polyline navigasi eksklusif
    const destCoord: [number, number] = [activeNavRoute.shelter.lat, activeNavRoute.shelter.lng];
    renderNavRoutesOnMap(
      activeNavRoute.routes,
      activeNavRoute.selectedRouteIndex,
      activeNavRoute.transportMode,
      destCoord,
      startCoord,
      true,
      startCoord
    );

    // Mulai pelacakan posisi GPS riil
    if (navigator.geolocation) {
      if (navWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(navWatchIdRef.current);
      }
      navLastGpsPosRef.current = startCoord;
      navWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);
          handleGpsLocationUpdateInNavigation([lat, lng], pos.coords.accuracy);
        },
        (err) => {
          console.warn("Nav GPS watch error:", err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );
    }
  };

  // Keluar dari Mode Navigasi Berjalan
  const handleExitNavigation = () => {
    setIsNavigating(false);
    if (typeof document !== "undefined") {
      document.body.classList.remove("hide-mobile-nav");
    }
    if (navWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navWatchIdRef.current);
      navWatchIdRef.current = null;
    }
    navLastGpsPosRef.current = null;
    setNavCurrentCoord(null);

    // Kembalikan marker pengguna ke bulatan normal
    if (userCoords) {
      updateUserMarkerOnMap(userCoords[0], userCoords[1], undefined, false, 0);
    }

    // Render ulang seluruh rute
    if (activeNavRoute) {
      const destCoord: [number, number] = [activeNavRoute.shelter.lat, activeNavRoute.shelter.lng];
      renderNavRoutesOnMap(
        activeNavRoute.routes,
        activeNavRoute.selectedRouteIndex,
        activeNavRoute.transportMode,
        destCoord,
        userCoords || undefined,
        false,
        null
      );
    }
  };

  // Selesai / Batalkan Navigasi
  const handleClearNavRoute = () => {
    if (isNavigatingRef.current) {
      handleExitNavigation();
    }
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    setActiveNavRoute(null);
    setTargetNavShelter(null);
    setIsRoutingLoading(false);
    clearRadarGlow();
    updateUserMarkerOnMap(userCoords[0], userCoords[1]);
    setToastMessage("Navigasi rute evakuasi ditutup");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBackToShelterDetail = () => {
    if (activeRouteLayerRef.current) {
      activeRouteLayerRef.current.clearLayers();
    }
    const targetShelter = activeNavRoute?.shelter || targetNavShelter || activeShelterDetail;
    setActiveNavRoute(null);
    setTargetNavShelter(null);
    setIsRoutingLoading(false);
    clearRadarGlow();
    updateUserMarkerOnMap(userCoords[0], userCoords[1]);
    if (targetShelter) {
      setActiveShelterDetail(targetShelter);
      setSheetSnap("mid");
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

        setToastMessage("GPS Terkunci: Menampilkan posko terdekat dari lokasi Anda");
        setTimeout(() => setToastMessage(null), 3000);
      },
      () => {
        setLocating(false);
        updateUserMarkerOnMap(userCoords[0], userCoords[1]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userCoords[0], userCoords[1]], 14, { duration: 1.2 });
        }
        setToastMessage("Izin akses lokasi ditolak oleh peramban. Menampilkan titik lokasi siaga Anda.");
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
          ? "bg-emerald-50/90 border-[#38746D] shadow-xs"
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
              <span className="px-1.5 py-0.5 rounded-md text-[7.5px] font-black bg-[#38746D] text-white shrink-0 tracking-wider">
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
              className="h-6.5 px-2.5 rounded-lg bg-[#38746D] hover:bg-[#24544E] text-white text-[9.5px] font-bold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer border border-[#24544E]"
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
            src={sh.photos?.[0] || (sh as any).foto || meta.photoUrl}
            alt={sh.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  const renderMobileBottomSheetContent = () => {
    // -------------------------------------------------------------
    // KASUS 1: MODE RUTE AKTIF (PETUNJUK ARAH EVAKUASI)
    // -------------------------------------------------------------
    if (viewMode === "ROUTE") {
      const shelter = activeNavRoute?.shelter || targetNavShelter;
      if (!shelter) return null;
      const selectedRt = activeNavRoute ? activeNavRoute.routes[activeNavRoute.selectedRouteIndex] : null;
      const isRtSafe = selectedRt?.statusBadgeType === "safe";

      return (
        <div className="flex flex-col h-full overflow-hidden select-none">
          {/* 1. Header (Selalu terlihat di semua snap point) */}
          <div
            className="pt-2 px-4 pb-2.5 shrink-0 cursor-grab active:cursor-grabbing border-b border-slate-100/60 select-none"
            style={{ touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Drag Handle Bar */}
            <div
              className="py-1.5 -my-1 cursor-pointer flex justify-center items-center"
              onClick={(e) => {
                e.stopPropagation();
                setSheetSnap((prev) => (prev === "min" ? "mid" : prev === "mid" ? "min" : "mid"));
              }}
              title={sheetSnap === "min" ? "Perbesar Navigasi" : "Perkecil ke Bawah"}
            >
              <div className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition active:scale-95" />
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBackToShelterDetail();
                  }}
                  className="p-1 -ml-1 rounded-lg hover:bg-emerald-50 text-[#38746D] transition active:scale-95 cursor-pointer shrink-0"
                  title="Kembali ke Detail Posko"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                    Petunjuk Arah Evakuasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">
                    Menuju {shelter.name} {selectedRt ? `• ${selectedRt.durationText} (${selectedRt.distanceText})` : "• Memuat rute OSRM..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 -mr-1">
                {sheetSnap === "min" ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTurnByTurnNavigation();
                      }}
                      className="h-7 px-2.5 rounded-lg bg-[#38746D] hover:bg-[#24544E] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-emerald-300" />
                      <span>Mulai</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("mid");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                      title="Perbesar ke Setengah Layar"
                    >
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    </button>
                  </>
                ) : sheetSnap === "mid" ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("full");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                      title="Perbesar Layar Penuh"
                    >
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("min");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                      title="Perkecil ke Bawah"
                    >
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("mid");
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                    title="Perkecil ke Setengah Layar"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearNavRoute();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition active:scale-90 cursor-pointer shrink-0"
                  title="Tutup Navigasi"
                  aria-label="Tutup Navigasi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div
            onScroll={handleBodyScroll}
            onTouchStart={handleBodyTouchStart}
            onTouchMove={handleBodyTouchMove}
            onTouchEnd={handleBodyTouchEnd}
            className={`flex-1 min-h-0 px-4 py-3 space-y-3.5 scrollbar-thin md:scrollbar-thin overscroll-contain overflow-y-auto ${
              sheetSnap === "min" ? "hidden" : "block"
            }`}
          >
            {!activeNavRoute ? (
              <div className="space-y-3 animate-pulse">
                <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
                  <span>Menghitung rute tercepat bebas banjir (OSRM)...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-1 rounded-xl">
                  <div className="py-2 flex flex-col items-center justify-center gap-1 bg-white rounded-lg shadow-2xs">
                    <Bike className="w-4 h-4 text-[#38746D]" />
                    <div className="w-8 h-2.5 bg-emerald-100 rounded" />
                  </div>
                  <div className="py-2 flex flex-col items-center justify-center gap-1 opacity-60">
                    <Car className="w-4 h-4 text-slate-500" />
                    <div className="w-8 h-2.5 bg-slate-200 rounded" />
                  </div>
                  <div className="py-2 flex flex-col items-center justify-center gap-1 opacity-60">
                    <Footprints className="w-4 h-4 text-slate-500" />
                    <div className="w-8 h-2.5 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="py-2 px-3 bg-slate-50/70 rounded-xl flex items-center gap-3">
                  <div className="flex flex-col items-center shrink-0 py-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-400" />
                    <span className="w-0.5 h-4 border-l border-dashed border-slate-300 my-0.5" />
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white ring-1 ring-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs font-medium text-slate-700">Lokasi Anda</div>
                    <div className="text-xs font-semibold text-slate-900">{shelter.name}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl p-3 bg-emerald-50/30 border-2 border-emerald-300/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-28 bg-emerald-200/70 rounded-md" />
                      <div className="h-5 w-20 bg-emerald-100 rounded-full" />
                    </div>
                    <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
                  </div>
                  <div className="rounded-xl p-3 bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-slate-200 rounded-md" />
                      <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-3.5 w-36 bg-slate-200 rounded-md" />
                  </div>
                </div>
              </div>
            ) : (
              <>
            {/* Routing Loading Indicator */}
            {isRoutingLoading && (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-[10.5px] font-bold text-emerald-800 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Menghitung rute jalan aktual (OSRM)...</span>
              </div>
            )}

            {/* Tab Pilihan Moda Transportasi */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/80 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectTransportMode("motorcycle")}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                  activeNavRoute.transportMode === "motorcycle"
                    ? "bg-white text-[#38746D] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>{activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.durationText || "4 mnt"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTransportMode("car")}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                  activeNavRoute.transportMode === "car"
                    ? "bg-white text-[#38746D] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Car className="w-4 h-4" />
                <span>
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
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                  activeNavRoute.transportMode === "walking"
                    ? "bg-white text-[#38746D] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span>
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

            {/* Input Titik Awal & Titik Tujuan */}
            <div className="py-2 px-3 bg-slate-50/70 rounded-xl flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center shrink-0 py-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-400" />
                <span className="w-0.5 h-4 border-l border-dashed border-slate-300 my-0.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white ring-1 ring-rose-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs font-medium text-slate-700 truncate">
                  Lokasi Anda
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {activeNavRoute.shelter.name}
                </div>
              </div>
            </div>

            {/* Status Bar Keberangkatan */}
            <div className="px-1 text-[11px] text-slate-500 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Berangkat sekarang &bull; Jalur pantau aktif</span>
            </div>

            {/* List Pilihan Opsi Rute */}
            <div className="space-y-2">
              {activeNavRoute.routes.map((rt, idx) => {
                const isSelected = idx === activeNavRoute.selectedRouteIndex;
                const isSafe = rt.statusBadgeType === "safe";
                const rawSummary = rt.summary || (idx === 0 ? "Jl. Raya Pantura" : "Jl. By-Pass Lohbener");
                const roadName = rawSummary.startsWith("lewat") ? rawSummary : `lewat ${rawSummary}`;

                return (
                  <div
                    key={rt.id}
                    onClick={() => handleSelectRouteIndex(idx)}
                    className={`rounded-xl p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/30 border-2 border-[#38746D] shadow-xs"
                        : "bg-white border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-bold text-base leading-tight ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                            {rt.durationText}
                          </span>
                          <span className="text-slate-400 font-medium text-xs">&bull;</span>
                          <span className="text-xs font-normal text-slate-500">
                            {rt.distanceText}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                          {roadName}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isSafe ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                            Bebas Genangan
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0">
                            Jalur Alternatif
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#38746D] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Aksi Navigasi */}
            <div className="pt-2 pb-1 space-y-2 shrink-0">
              <button
                type="button"
                onClick={handleStartTurnByTurnNavigation}
                className="w-full py-3 px-4 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md cursor-pointer border border-[#24544E]"
              >
                <Navigation className="w-4 h-4 text-emerald-300" />
                <span>Mulai Panduan Langkah Demi Langkah</span>
              </button>

              <button
                type="button"
                onClick={handleClearNavRoute}
                className="w-full py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Tutup Navigasi</span>
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // KASUS 2: DETAIL POSKO EVAKUASI AKTIF
    // -------------------------------------------------------------
    if (activeShelterDetail) {
      const activeMeta = SHELTER_METADATA[activeShelterDetail.id] || {
        photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
        rating: "Siaga 24 Jam",
        eta: "±4 mnt",
        avoidArea: "Menghindari Genangan Pesisir",
        emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
      };

      return (
        <div className="flex flex-col h-full overflow-hidden select-none">
          {/* 1. Header (Selalu terlihat di semua snap point) */}
          <div
            className="pt-2 px-4 pb-2.5 shrink-0 cursor-grab active:cursor-grabbing border-b border-slate-100/60 select-none"
            style={{ touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Drag Handle Bar */}
            <div
              className="py-1.5 -my-1 cursor-pointer flex justify-center items-center"
              onClick={(e) => {
                e.stopPropagation();
                setSheetSnap((prev) => (prev === "min" ? "mid" : prev === "mid" ? "min" : "mid"));
              }}
              title={sheetSnap === "min" ? "Buka Detail Posko" : "Perkecil ke Bawah"}
            >
              <div className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition active:scale-95" />
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {activeShelterDetail.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">
                  {activeShelterDetail.location} &bull; {activeShelterDetail.distance.split("(")[0].trim()} dari Anda
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 -mr-1">
                {sheetSnap === "min" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("mid");
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                    title="Buka Detail Posko"
                    aria-label="Buka Detail Posko"
                  >
                    <ChevronUp className="w-5 h-5 text-slate-600" />
                  </button>
                ) : sheetSnap === "mid" ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("full");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                      title="Perbesar Layar Penuh"
                      aria-label="Perbesar Layar Penuh"
                    >
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSheetSnap("min");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                      title="Perkecil ke Bawah (Tinggal Nama & Alamat)"
                      aria-label="Perkecil ke Bawah"
                    >
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("mid");
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 transition active:scale-90 cursor-pointer"
                    title="Perkecil ke Setengah Layar"
                    aria-label="Perkecil ke Setengah Layar"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition active:scale-90 cursor-pointer shrink-0"
                  title="Tutup Posko"
                  aria-label="Tutup Posko"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div
            onScroll={handleBodyScroll}
            onTouchStart={handleBodyTouchStart}
            onTouchMove={handleBodyTouchMove}
            onTouchEnd={handleBodyTouchEnd}
            className={`flex-1 min-h-0 px-4 py-3 space-y-3.5 scrollbar-thin md:scrollbar-thin overscroll-contain overflow-y-auto ${
              sheetSnap === "min" ? "hidden" : "block"
            }`}
          >
            {/* Baris Tombol Aksi Fungsional */}
            <div className="flex items-center gap-1.5 py-0.5 shrink-0">
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
                className="h-9 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#24544E] flex-1 min-w-0"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Arahkan Rute</span>
              </button>

              <a
                href={`tel:${activeShelterDetail.contactPhone.replace(/[^0-9]/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                title={`Hubungi ${activeShelterDetail.contactPerson} (${activeShelterDetail.contactPhone})`}
                className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
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
                className="w-9 h-9 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
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
                className="w-9 h-9 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-600" />
              </button>
            </div>

            {/* Informasi Kapasitas & Progress Bar Kuwu */}
            <div className="py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] shrink-0">
              <div className="flex items-center justify-between text-slate-600 gap-1">
                <span className="truncate">
                  Kapasitas: <strong className="text-emerald-700 font-extrabold">{activeShelterDetail.capacityFilled}/{activeShelterDetail.capacityTotal}</strong>
                  <span className="text-slate-400"> (Sisa {activeShelterDetail.capacityTotal - activeShelterDetail.capacityFilled})</span>
                </span>
                <span className="text-[10.5px] text-slate-500 shrink-0">
                  Kuwu: <strong className="text-slate-800">{activeShelterDetail.contactPerson}</strong>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className="h-full bg-[#38746D] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeShelterDetail.capacityFilled / activeShelterDetail.capacityTotal) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Foto Posko (Bento Grid jika > 1 foto) */}
            <div className="w-full">
              <ShelterBentoGallery
                photos={
                  activeShelterDetail.photos && activeShelterDetail.photos.length > 0
                    ? activeShelterDetail.photos
                    : (activeShelterDetail.foto ? [activeShelterDetail.foto] : [])
                }
                name={activeShelterDetail.name}
                compact
              />
            </div>

            {/* Pilihan & Saran Rute Evakuasi */}
            <div className="pt-1 border-t border-gray-100 space-y-2">
              <h4 className="text-[11.5px] font-black text-slate-900 flex items-center gap-1.5">
                <span>Pilihan &amp; Saran Rute Evakuasi</span>
              </h4>

              <div className="flex flex-col gap-2">
                {/* Opsi 1: Terdekat & Bebas Banjir */}
                <div
                  onClick={() => {
                    setSelectedRouteClassification(1);
                    previewShelterRoute(activeShelterDetail, 1);
                  }}
                  className={`rounded-xl p-3 cursor-pointer transition-all ${
                    selectedRouteClassification === 1
                      ? "bg-emerald-50/40 border-2 border-[#38746D] shadow-xs"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-base text-slate-800">
                        {activeMeta.eta.replace("±", "").trim() || "4 mnt"}
                      </span>
                      <span className="text-sm text-slate-500 font-normal">
                        ({activeShelterDetail.distance.split("(")[0].trim()})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        Bebas Banjir
                      </span>
                      {selectedRouteClassification === 1 && (
                        <div className="w-4 h-4 rounded-full bg-[#38746D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1">
                    lewat Jl. Raya Pantura
                  </p>
                </div>

                {/* Opsi 2: Rute dengan Titik Genangan */}
                <div
                  onClick={() => {
                    setSelectedRouteClassification(2);
                    previewShelterRoute(activeShelterDetail, 2);
                  }}
                  className={`rounded-xl p-3 cursor-pointer transition-all ${
                    selectedRouteClassification === 2
                      ? "bg-amber-50/40 border-2 border-amber-600 shadow-xs"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-base text-slate-800">
                        {Math.max(2, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 0.75))} mnt
                      </span>
                      <span className="text-sm text-slate-500 font-normal">
                        ({formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 0.78))})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        Genangan 15 cm
                      </span>
                      {selectedRouteClassification === 2 && (
                        <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1">
                    lewat Jl. Nelayan Pesisir
                  </p>
                </div>

                {/* Opsi 3: Jalur Alternatif Memutar */}
                <div
                  onClick={() => {
                    setSelectedRouteClassification(3);
                    previewShelterRoute(activeShelterDetail, 3);
                  }}
                  className={`rounded-xl p-3 cursor-pointer transition-all ${
                    selectedRouteClassification === 3
                      ? "bg-slate-50 border-2 border-slate-700 shadow-xs"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-base text-slate-800">
                        {Math.max(4, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 2.25))} mnt
                      </span>
                      <span className="text-sm text-slate-500 font-normal">
                        ({formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 2.45))})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        Jalur Alternatif
                      </span>
                      {selectedRouteClassification === 3 && (
                        <div className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1">
                    lewat By-Pass Lingkar Luar
                  </p>
                </div>

                {/* Opsi Rute Kustom jika aktif */}
                {customWaypoint && (
                  <div
                    onClick={() => {
                      setSelectedRouteClassification("custom");
                      previewShelterRoute(activeShelterDetail, "custom", customWaypoint);
                    }}
                    className={`rounded-xl p-3 cursor-pointer transition-all ${
                      selectedRouteClassification === "custom"
                        ? "bg-purple-50/50 border-2 border-purple-600 shadow-xs"
                        : "bg-white border border-slate-200 hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-base text-slate-800">
                          {customWaypoint.durationText}
                        </span>
                        <span className="text-sm text-slate-500 font-normal">
                          ({customWaypoint.distanceText})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-purple-50 text-purple-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                          Rute Manual
                        </span>
                        {selectedRouteClassification === "custom" && (
                          <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      via Titik Singgah Pilihan Anda
                    </p>
                  </div>
                )}

                {/* Tombol Tentukan Jalur Sendiri (Custom) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPickingWaypoint(true);
                    setToastMessage("Klik jalan pada peta untuk menentukan titik singgah");
                  }}
                  className="text-xs font-medium text-[#38746D] hover:text-[#23533E] py-2 flex items-center justify-center gap-1.5 w-full border border-dashed border-emerald-300 rounded-xl bg-emerald-50/30 hover:bg-emerald-50 cursor-pointer transition-colors"
                >
                  <span>Pilih rute manual di peta ✏️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // KASUS 3: LAPORAN WARGA AKTIF
    // -------------------------------------------------------------
    if (activeReportDetail) {
      return (
        <div className="flex flex-col h-full overflow-hidden select-none">
          <div
            className="pt-2 px-4 pb-2.5 shrink-0 cursor-grab active:cursor-grabbing border-b border-slate-100/60 select-none"
            style={{ touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full mx-auto mb-2 cursor-pointer transition active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                if (sheetSnap === "min") setSheetSnap("mid");
                else if (sheetSnap === "mid") setSheetSnap("min");
                else setSheetSnap("mid");
              }}
              title={sheetSnap === "min" ? "Buka Laporan" : "Perkecil ke Bawah"}
            />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {activeReportDetail.title}
                </h3>
                <p className="text-xs text-rose-600 font-bold mt-0.5 truncate max-w-[280px]">
                  TMA: {activeReportDetail.waterLevelText || "±45 cm"} &bull; {activeReportDetail.location}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 -mr-1">
                {sheetSnap === "min" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("mid");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Buka Detail"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </button>
                )}
                {sheetSnap === "mid" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("min");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Perkecil ke Bawah"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                  title="Tutup Laporan"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {sheetSnap !== "min" && (
            <div
              onScroll={handleBodyScroll}
              onTouchStart={handleBodyTouchStart}
              onTouchMove={handleBodyTouchMove}
              onTouchEnd={handleBodyTouchEnd}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3.5 scrollbar-none"
            >
              {renderDetailContent(false)}
            </div>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------
    // KASUS 4: POSKO PANTAU SENSOR TELEMETRI AKTIF
    // -------------------------------------------------------------
    if (activeTelemetryDetail) {
      return (
        <div className="flex flex-col h-full overflow-hidden select-none">
          <div
            className="pt-2 px-4 pb-2.5 shrink-0 cursor-grab active:cursor-grabbing border-b border-slate-100/60 select-none"
            style={{ touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full mx-auto mb-2 cursor-pointer transition active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                if (sheetSnap === "min") setSheetSnap("mid");
                else if (sheetSnap === "mid") setSheetSnap("min");
                else setSheetSnap("mid");
              }}
              title={sheetSnap === "min" ? "Buka Sensor" : "Perkecil ke Bawah"}
            />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {activeTelemetryDetail.name}
                </h3>
                <p className="text-xs text-sky-700 font-bold mt-0.5 truncate max-w-[280px]">
                  TMA: {activeTelemetryDetail.waterLevel} &bull; Tren: {activeTelemetryDetail.trend}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 -mr-1">
                {sheetSnap === "min" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("mid");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Buka Detail"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </button>
                )}
                {sheetSnap === "mid" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetSnap("min");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Perkecil ke Bawah"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                  title="Tutup Sensor"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {sheetSnap !== "min" && (
            <div
              onScroll={handleBodyScroll}
              onTouchStart={handleBodyTouchStart}
              onTouchMove={handleBodyTouchMove}
              onTouchEnd={handleBodyTouchEnd}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3.5 scrollbar-none"
            >
              {renderDetailContent(false)}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Render Konten Detail Lokasi / Navigasi (Dipakai di Desktop Card 2 & Mobile Bottom Sheet)
  const renderDetailContent = (isMobileSheet = false) => {
    if (viewMode === "ROUTE") {
      const shelter = activeNavRoute?.shelter || targetNavShelter;
      if (!activeNavRoute && shelter) {
        return (
          <div className={`flex flex-col min-h-0 flex-1 overflow-y-auto scrollbar-none md:scrollbar-thin ${isMobileSheet ? "space-y-3 pb-2" : "space-y-3"}`}>
            <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
              <span>Menghitung rute evakuasi bebas banjir (OSRM)...</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100/70 p-1 rounded-xl">
              <div className="py-2 flex flex-col items-center justify-center gap-1 bg-white rounded-lg shadow-2xs">
                <Bike className="w-4 h-4 text-[#38746D]" />
                <div className="w-8 h-2.5 bg-emerald-100 rounded animate-pulse" />
              </div>
              <div className="py-2 flex flex-col items-center justify-center gap-1 opacity-60">
                <Car className="w-4 h-4 text-slate-500" />
                <div className="w-8 h-2.5 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="py-2 flex flex-col items-center justify-center gap-1 opacity-60">
                <Footprints className="w-4 h-4 text-slate-500" />
                <div className="w-8 h-2.5 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-gray-100 flex items-center gap-2.5 shrink-0">
              <div className="flex flex-col items-center shrink-0 py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-300" />
                <span className="w-0.5 h-6 border-l-2 border-dashed border-slate-300 my-0.5" />
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-slate-800 truncate shadow-2xs">
                  Lokasi Anda
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-black text-slate-800 truncate shadow-2xs">
                  {shelter.name}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-xl p-3 bg-emerald-50/30 border-2 border-emerald-300/80 animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 bg-emerald-200/70 rounded-md" />
                  <div className="h-5 w-20 bg-emerald-100 rounded-full" />
                </div>
                <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
              </div>
              <div className="rounded-xl p-3 bg-white border border-slate-200 animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-3.5 w-36 bg-slate-200 rounded-md" />
              </div>
            </div>
          </div>
        );
      }
      if (activeNavRoute) {
      if (isMobileSheet && sheetSnap === "min") {
        const selectedRt = activeNavRoute.routes[activeNavRoute.selectedRouteIndex];
        return (
          <div className="flex items-center justify-between gap-2 p-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-[#38746D] flex items-center justify-center shrink-0">
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
                  setSheetSnap("mid");
                }}
                className="h-8 px-2.5 rounded-lg bg-emerald-50 text-[#38746D] text-[10.5px] font-extrabold hover:bg-emerald-100 border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center gap-1"
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
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${activeNavRoute.transportMode === "motorcycle"
                ? "border-[#38746D] text-[#38746D] bg-emerald-50/50 font-black"
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
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${activeNavRoute.transportMode === "car"
                ? "border-[#38746D] text-[#38746D] bg-emerald-50/50 font-black"
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
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer border-b-2 ${activeNavRoute.transportMode === "walking"
                ? "border-[#38746D] text-[#38746D] bg-emerald-50/50 font-black"
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
              <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-slate-800 truncate shadow-2xs">
                Lokasi Anda
              </div>
              <div className="p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-black text-slate-800 truncate shadow-2xs">
                {activeNavRoute.shelter.name}
              </div>
            </div>
          </div>

          {/* Status Bar Keberangkatan */}
          <div className="px-3 py-1.5 bg-white rounded-xl border border-gray-100 flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Berangkat sekarang &bull; Jalur pantau aktif</span>
          </div>

          {/* List Pilihan Opsi Rute */}
          <div className="space-y-2 flex-1 min-h-0">
            {activeNavRoute.routes.map((rt, idx) => {
              const isSelected = idx === activeNavRoute.selectedRouteIndex;
              const isSafe = rt.statusBadgeType === "safe";
              const rawSummary = rt.summary || (idx === 0 ? "Jl. Raya Pantura" : "Jl. By-Pass Lohbener");
              const roadName = rawSummary.startsWith("lewat") ? rawSummary : `lewat ${rawSummary}`;

              return (
                <div
                  key={rt.id}
                  onClick={() => handleSelectRouteIndex(idx)}
                  className={`rounded-xl p-3 cursor-pointer transition-all text-left ${
                    isSelected
                      ? "bg-emerald-50/40 border-2 border-[#38746D] shadow-xs"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`font-bold text-base leading-tight ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                          {rt.durationText}
                        </span>
                        <span className="text-slate-400 font-medium text-xs">&bull;</span>
                        <span className="text-xs font-normal text-slate-500">
                          {rt.distanceText}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                        {roadName}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isSafe ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                          Bebas Genangan
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0">
                          Jalur Alternatif
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#38746D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Panduan Langkah Turn-by-Turn */}
            {activeNavRoute.showingSteps && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
                <h6 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                  <Milestone className="w-3.5 h-3.5 text-[#38746D]" />
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
              onClick={handleStartTurnByTurnNavigation}
              className="w-full py-2.5 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer border border-[#24544E]"
            >
              <Navigation className="w-4 h-4 fill-white text-white" />
              <span>Mulai Panduan Langkah Demi Langkah</span>
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
    }

    if (activeShelterDetail) {
      const activeMeta = SHELTER_METADATA[activeShelterDetail.id] || {
        photoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
        rating: "Siaga 24 Jam",
        eta: "±4 mnt",
        avoidArea: "Menghindari Genangan Pesisir",
        emergencyNeeds: ["Logistik Dasar", "Air Bersih"],
      };

      if (isMobileSheet && sheetSnap === "min") {
        return (
          <div className="flex items-center justify-between gap-2.5 p-1 animate-in fade-in duration-150">
            {/* Mini Thumbnail */}
            <div className="relative w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-slate-100 shadow-xs">
              <img
                src={activeShelterDetail.photos?.[0] || activeShelterDetail.foto || activeMeta.photoUrl}
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
                <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
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
                className="h-8.5 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer border border-[#24544E]"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                <span>Rute</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetSnap("mid");
                }}
                className="h-8.5 w-8.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#38746D] border border-emerald-200/80 transition active:scale-95 cursor-pointer flex items-center justify-center"
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
          {/* 1. Atas: Foto Posko Riil (Bento Grid jika > 1 foto) */}
          <div className="w-full">
            <ShelterBentoGallery
              photos={
                activeShelterDetail.photos && activeShelterDetail.photos.length > 0
                  ? activeShelterDetail.photos
                  : (activeShelterDetail.foto ? [activeShelterDetail.foto] : [])
              }
              name={activeShelterDetail.name}
              compact
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

          {/* 3. Baris Tombol Aksi Fungsional */}
          <div className="flex items-center gap-1.5 pt-0.5">
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
              className="h-8.5 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer border border-[#24544E] flex-1 min-w-0"
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

          {/* 4. Ringkasan Esensial Kapasitas & Kuwu */}
          <div className="py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-600 gap-1">
              <span className="truncate">
                Kapasitas: <strong className="text-emerald-700 font-extrabold">{activeShelterDetail.capacityFilled}/{activeShelterDetail.capacityTotal}</strong>
                <span className="text-slate-400"> (Sisa {activeShelterDetail.capacityTotal - activeShelterDetail.capacityFilled})</span>
              </span>
              <span className="text-[10.5px] text-slate-500 shrink-0">
                Kuwu: <strong className="text-slate-800">{activeShelterDetail.contactPerson}</strong>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-[#38746D] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((activeShelterDetail.capacityFilled / activeShelterDetail.capacityTotal) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* 5. SECTION PILIHAN & SARAN RUTE EVAKUASI (GAYA GOOGLE MAPS) */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11.5px] font-black text-slate-900 flex items-center gap-1.5">
                <span>Pilihan &amp; Saran Rute Evakuasi</span>
              </h4>
            </div>

            {/* Deretan Pilihan Kartu Selector Rute Evakuasi */}
            <div className="flex flex-col gap-2">
              {/* Opsi 1: Terdekat & Bebas Banjir */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(1);
                  previewShelterRoute(activeShelterDetail, 1);
                }}
                className={`rounded-xl p-3 cursor-pointer transition-all ${
                  selectedRouteClassification === 1
                    ? "bg-emerald-50/40 border-2 border-[#38746D] shadow-xs"
                    : "bg-white border border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-base text-slate-800">
                      {activeMeta.eta.replace("±", "").trim() || "4 mnt"}
                    </span>
                    <span className="text-sm text-slate-500 font-normal">
                      ({activeShelterDetail.distance.split("(")[0].trim()})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                      Bebas Banjir
                    </span>
                    {selectedRouteClassification === 1 && (
                      <div className="w-4 h-4 rounded-full bg-[#38746D] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 truncate mt-1">
                  lewat Jl. Raya Pantura
                </p>
              </div>

              {/* Opsi 2: Rute dengan Titik Genangan */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(2);
                  previewShelterRoute(activeShelterDetail, 2);
                }}
                className={`rounded-xl p-3 cursor-pointer transition-all ${
                  selectedRouteClassification === 2
                    ? "bg-amber-50/40 border-2 border-amber-600 shadow-xs"
                    : "bg-white border border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-base text-slate-800">
                      {Math.max(2, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 0.75))} mnt
                    </span>
                    <span className="text-sm text-slate-500 font-normal">
                      ({formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 0.78))})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                      Genangan 15 cm
                    </span>
                    {selectedRouteClassification === 2 && (
                      <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 truncate mt-1">
                  lewat Jl. Nelayan Pesisir
                </p>
              </div>

              {/* Opsi 3: Jalur Alternatif Memutar */}
              <div
                onClick={() => {
                  setSelectedRouteClassification(3);
                  previewShelterRoute(activeShelterDetail, 3);
                }}
                className={`rounded-xl p-3 cursor-pointer transition-all ${
                  selectedRouteClassification === 3
                    ? "bg-slate-50 border-2 border-slate-700 shadow-xs"
                    : "bg-white border border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-base text-slate-800">
                      {Math.max(4, Math.round(Math.max(2, Math.round(parseDistanceInMeters(activeShelterDetail.distance) / 300)) * 2.25))} mnt
                    </span>
                    <span className="text-sm text-slate-500 font-normal">
                      ({formatNavDistance(Math.round(parseDistanceInMeters(activeShelterDetail.distance) * 2.45))})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                      Jalur Alternatif
                    </span>
                    {selectedRouteClassification === 3 && (
                      <div className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 truncate mt-1">
                  lewat By-Pass Lingkar Luar
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
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${selectedRouteClassification === "custom"
                  ? "bg-purple-50/80 border-purple-500 ring-1 ring-purple-500/30 shadow-xs"
                  : "bg-white hover:bg-purple-50/30 border-gray-200 hover:border-purple-200"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedRouteClassification === "custom"
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
      if (isMobileSheet && sheetSnap === "min") {
        return (
          <div className="flex items-center justify-between gap-2.5 p-1 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${activeReportDetail.severity === "CRITICAL"
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
                  setSheetSnap("mid");
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

      const reportPhoto = getReportPhoto(activeReportDetail);
      const reportNote = getReportNote(activeReportDetail);

      return (
        <div className={`overflow-y-auto flex-1 min-h-0 space-y-3 scrollbar-none md:scrollbar-thin animate-in fade-in slide-in-from-left-2 duration-200 ${isMobileSheet ? "space-y-3 pb-2" : "p-2.5"}`}>
          {/* Header Info Kejadian */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                  activeReportDetail.severity === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {activeReportDetail.severity === "CRITICAL" ? "🔴 BANJIR ROB KRITIS" : "🟠 GENANGAN SEDANG"}
              </span>
              <span className="text-[11px] text-[#718783] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activeReportDetail.timeAgo}</span>
              </span>
            </div>
            <h3 className="text-sm font-black text-[#132422] leading-snug">
              {activeReportDetail.title}
            </h3>
            <p className="text-xs text-[#4B635F] flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
              <span className="truncate">{activeReportDetail.location}</span>
            </p>
          </div>

          {/* Bukti Foto Laporan Lapangan */}
          {reportPhoto ? (
            <div className="w-full h-40 rounded-xl overflow-hidden mt-3 mb-4 shadow-sm border border-slate-200/80 bg-slate-100">
              <img
                src={reportPhoto}
                alt={activeReportDetail.title}
                className="w-full h-40 object-cover rounded-xl"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-24 rounded-xl mt-3 mb-4 bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1">
              <ImageIcon className="w-5 h-5 text-slate-300" />
              <span className="text-[11px] font-medium text-slate-400">Tidak ada foto bukti lapangan</span>
            </div>
          )}

          {/* Parameter TMA & Status */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#F8FAF9] border border-gray-100 text-[11px]">
            <div>
              <span className="text-[9px] text-[#64748B] block font-medium">Ketinggian Air</span>
              <strong className="text-xs font-black text-[#132422]">
                {activeReportDetail.waterLevelText || "±30 - 75 cm"}
              </strong>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] block font-medium">Status</span>
              <strong className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{activeReportDetail.status}</span>
              </strong>
            </div>
          </div>

          {/* Catatan / Keterangan Lapangan */}
          {reportNote && (
            <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 text-xs text-[#4B635F]">
              <span className="font-bold text-[#132422] block mb-0.5 text-[11px]">Catatan Lapangan:</span>
              <p className="leading-relaxed text-[11.5px]">{reportNote}</p>
            </div>
          )}

          {/* Peringatan Petugas BPBD */}
          <div className="text-[10.5px] p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-start gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed text-amber-800 font-medium">
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
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Bagikan Lokasi Kejadian</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeTelemetryDetail) {
      if (isMobileSheet && sheetSnap === "min") {
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
                  setSheetSnap("mid");
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
              <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>LIVE API SATELIT HIDROLOGI</span>
              </span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                activeTelemetryDetail.status === "AWAS"
                  ? "bg-red-50 text-red-700 border-red-300"
                  : activeTelemetryDetail.status === "SIAGA"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : activeTelemetryDetail.status === "WASPADA"
                  ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                  : "bg-emerald-50 text-emerald-700 border-emerald-300"
              }`}>
                {activeTelemetryDetail.status}
              </span>
            </div>
            <h3 className="text-xs font-black text-[#132422] leading-tight mt-1">
              {activeTelemetryDetail.name}
            </h3>
            <p className="text-[9.5px] text-[#64748B]">
              {activeTelemetryDetail.lokasiDetail || "DAS Cimanuk Hilir • Stasiun Pemantau Pasang Surut & Debit Air"}
            </p>
          </div>

          {/* TMA Compact Display */}
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-sky-800 font-bold uppercase tracking-wider block">
                Elevasi &amp; Debit Aliran
              </span>
              <div className="text-[9.5px] text-sky-700 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>Tren: <strong>{activeTelemetryDetail.trend}</strong></span>
                <span>&bull;</span>
                <span>{activeTelemetryDetail.lastUpdate}</span>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black text-sky-900 text-right">
              {activeTelemetryDetail.waterLevel}
            </div>
          </div>

          {/* Informasi Pengelola & Wilayah Terdampak */}
          {(activeTelemetryDetail.agency || activeTelemetryDetail.impactAreas) && (
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[9.5px] text-slate-700 space-y-1">
              {activeTelemetryDetail.agency && (
                <div><strong className="text-slate-900">Pengelola:</strong> {activeTelemetryDetail.agency}</div>
              )}
              {activeTelemetryDetail.impactAreas && (
                <div><strong className="text-slate-900">Potensi Wilayah Hilir:</strong> {activeTelemetryDetail.impactAreas}</div>
              )}
            </div>
          )}

          <div className="text-[9.5px] p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-900 leading-snug">
            <strong>Rekomendasi BPBD:</strong>{" "}
            {activeTelemetryDetail.status === "AWAS" || activeTelemetryDetail.status === "SIAGA"
              ? "Status siaga aktif. Warga di bantaran hilir Cimanuk & pesisir rob diminta siaga evakuasi darurat."
              : activeTelemetryDetail.status === "WASPADA"
              ? "Ketinggian air meningkat. Petugas pintu air bersiaga dan warga bantaran sungai diimbau waspada."
              : "Aliran air dan debit tanggul dalam ambang batas normal dan aman terkendali."}
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
        {/* 1. UNIFIED PANEL: DESKTOP FLOATING PANEL (DAN MOBILE SAAT IDLE) */}
        {/* ============================================================== */}
        {!isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto ${viewMode === "IDLE"
              ? "absolute top-3.5 inset-x-3.5 md:top-4 md:left-6 md:right-auto md:w-[390px] z-[300] flex flex-col gap-2 md:gap-2.5"
              : "hidden md:flex absolute inset-x-3.5 top-16 bottom-20 md:inset-x-auto md:top-4 md:bottom-6 md:left-6 md:w-[400px] z-[300] flex-col"
              }`}
            style={{ zIndex: 1000 }}
          >
          {/* Tampilkan Search Bar dan Filter Chips HANYA saat viewMode === 'IDLE' */}
          {viewMode === "IDLE" && (
            <>
              {/* Banner Darurat Offline (PWA Offline-First) */}
              {!isOnline && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-600 text-white p-2.5 rounded-2xl shadow-lg border border-amber-500/80 flex items-center justify-between gap-2 shrink-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
                    <div className="text-[11px] min-w-0 leading-tight">
                      <strong className="block font-bold">Mode Darurat Offline Aktif</strong>
                      <span className="text-[9.5px] text-amber-100 truncate block">Peta posko aman &amp; rute evakuasi tersimpan di memori perangkat.</span>
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className="px-2.5 py-1 rounded-xl bg-white text-amber-900 font-extrabold text-[10.5px] shrink-0 hover:bg-amber-50 shadow-xs transition"
                  >
                    📞 112
                  </a>
                </motion.div>
              )}

              {/* Baris 1: Card Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                className="bg-white rounded-2xl px-3.5 py-2.5 shadow-md border border-slate-100 flex items-center gap-2.5 shrink-0"
              >
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
                    className="p-1 rounded-lg hover:bg-slate-100 hover:text-[#38746D] transition cursor-pointer"
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
                    className={`p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer ${showAllShelters || activeFilterChip !== "terdekat" ? "text-[#38746D]" : "text-slate-400 hover:text-[#38746D]"
                      }`}
                    title="Filter Posko"
                    aria-label="Filter Posko"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Baris 2: Card Chip Kategori & Filter Wilayah */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 shrink-0"
              >
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
                        } else if (chip.id === "telemetri") {
                          setActiveFilterChip("telemetri");
                          setShowAllTelemetry(false);
                          if (mapInstanceRef.current && sortedTelemetry.length > 0) {
                            const closest = sortedTelemetry[0];
                            mapInstanceRef.current.flyTo([closest.lat, closest.lng], 14, { duration: 1 });
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
                      className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${isActive
                        ? "bg-[#38746D] text-white font-medium shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                      {chip.id === "terdekat" && (
                        <Navigation className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#38746D]"}`} />
                      )}
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}

          {/* Card Utama: Full Height Saat DETAIL / ROUTE, atau Compact Saat IDLE */}
          <div
            className={`bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5E4E0] shadow-xl overflow-hidden flex flex-col ${viewMode === "IDLE"
              ? "shrink-0 h-auto"
              : "h-full flex-1 min-h-0"
              }`}
          >
            <AnimatePresence mode="wait">
              {viewMode === "ROUTE" ? (
                <motion.div
                  key="route-mode-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {/* Header Panel Route */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 shrink-0 bg-white/80 border-b border-gray-100 backdrop-blur-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={handleBackToShelterDetail}
                        className="p-1.5 rounded-xl hover:bg-emerald-50 text-[#38746D] transition cursor-pointer"
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
                          Menuju {activeNavRoute?.shelter?.name || targetNavShelter?.name || "Posko Evakuasi"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearNavRoute}
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="Tutup Navigasi"
                      aria-label="Tutup Navigasi"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-3.5">
                    {renderDetailContent(false)}
                  </div>
                </motion.div>
              ) : viewMode === "DETAIL" ? (
                <motion.div
                  key="detail-mode-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {/* Header Panel Detail */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 shrink-0 bg-white/80 border-b border-gray-100 backdrop-blur-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200/80 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#38746D]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                          {activeShelterDetail?.name || activeReportDetail?.title || activeTelemetryDetail?.name || "Detail Lokasi"}
                        </h4>
                        <p className="text-[10px] text-[#4B635F] truncate">
                          {activeShelterDetail?.location || "Kawasan Pantau Evakuasi"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                      title="Tutup Detail"
                      aria-label="Tutup Detail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-3.5">
                    {renderDetailContent(false)}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-mode-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {/* Header Panel Idle */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 shrink-0 bg-white/80 border-b border-gray-100 backdrop-blur-sm">
                    <div
                      className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
                      onClick={() => setPoskoExpanded((prev) => !prev)}
                    >
                      <div className="w-7 h-7 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200/80 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#38746D]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-[#132422] truncate leading-tight">
                          {getCardHeaderTitle()}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPoskoExpanded((prev) => !prev)}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title={poskoExpanded ? "Tutup Daftar Posko" : "Buka Daftar Posko"}
                        aria-label="Toggle Daftar Posko"
                      >
                        <motion.div
                          animate={{ rotate: poskoExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex items-center justify-center"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-[#38746D]" />
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  {/* Isi Konten Card Idle dengan Accordion Height Animation */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: poskoExpanded ? "auto" : 0, opacity: poskoExpanded ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1.5 max-h-[48vh] md:max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-none md:scrollbar-thin">
                      {activeFilterChip === "telemetri" ? (
                        <div className="space-y-2">
                          <div className="px-2.5 py-2 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sky-800 text-[10px] font-bold">
                              <Navigation className="w-3 h-3 text-[#38746D]" />
                              <span>{showAllTelemetry ? "Seluruh Stasiun di Indramayu" : "Stasiun Terdekat dari Lokasi GPS"}</span>
                            </div>
                            <span className="text-[9px] text-sky-700 font-bold bg-white px-2 py-0.5 rounded-full border border-sky-200">
                              {showAllTelemetry ? sortedTelemetry.length : Math.min(3, sortedTelemetry.length)} dari {sortedTelemetry.length} Stasiun
                            </span>
                          </div>

                          {(showAllTelemetry ? sortedTelemetry : sortedTelemetry.slice(0, 3)).map((tel) => {
                            const statusBg =
                              tel.status === "AWAS"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : tel.status === "SIAGA"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : tel.status === "WASPADA"
                                ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200";
                            return (
                              <div
                                key={tel.id}
                                onClick={() => {
                                  setActiveTelemetryDetail(tel);
                                  setSelectedMarker({ type: "telemetry", data: tel });
                                  if (mapInstanceRef.current) {
                                    mapInstanceRef.current.flyTo([tel.lat, tel.lng], 16, { duration: 1.2 });
                                  }
                                }}
                                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/40 transition-all cursor-pointer shadow-xs group"
                              >
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                                    📡 {tel.tipeBangunan || "Infrastruktur Air"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-bold text-[#38746D] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                      📍 {tel.distanceKm}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${statusBg}`}>
                                      {tel.status}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 leading-tight">
                                  {tel.name}
                                </h4>
                                <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
                                  <span>Level: <strong className="text-slate-800">{tel.waterLevel}</strong></span>
                                  <span>Tren: <strong className={tel.trend === "NAIK" ? "text-red-600 font-bold" : "text-slate-700"}>{tel.trend}</strong></span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                                  <span className="truncate">{tel.lokasiDetail || tel.agency || "DAS Cimanuk Indramayu"}</span>
                                  <span className="shrink-0 text-[#38746D] font-bold text-[9px] group-hover:underline">Buka Titik &rarr;</span>
                                </div>
                              </div>
                            );
                          })}

                          {sortedTelemetry.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setShowAllTelemetry((prev) => !prev)}
                              className="w-full bg-slate-50 hover:bg-slate-100 text-[#38746D] font-semibold text-xs py-2.5 rounded-xl border border-dashed border-sky-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 active:scale-[0.99]"
                            >
                              <span>
                                {showAllTelemetry
                                  ? "Tampilkan 3 Stasiun Terdekat Saja"
                                  : `Lihat Stasiun Lainnya di Indramayu (${sortedTelemetry.length} Stasiun)`}
                              </span>
                              {showAllTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      ) : displayedShelters.length === 0 ? (
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
                            className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#38746D] font-bold text-[11px] border border-emerald-200 transition cursor-pointer"
                          >
                            Reset Filter &amp; Pencarian
                          </button>
                        </div>
                      ) : isDefaultView ? (
                        <>
                          {displayedShelters.slice(0, showAllShelters ? 20 : 3).map((sh, index) => renderShelterCardItem(sh, index, true))}
                          {displayedShelters.length > 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAllShelters((prev) => !prev);
                              }}
                              className="w-full bg-slate-50 hover:bg-slate-100 text-[#38746D] font-semibold text-xs py-2.5 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 active:scale-[0.99]"
                            >
                              <span>
                                {showAllShelters
                                  ? "Tampilkan 3 Posko Terdekat Saja"
                                  : `Lihat Posko Lainnya (${displayedShelters.length} Posko Tersedia)`}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {displayedShelters.slice(0, showAllShelters ? 25 : 10).map((sh, index) => renderShelterCardItem(sh, index, activeFilterChip === "terdekat"))}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilterChip("terdekat");
                              setShowAllShelters(false);
                              setSearchQuery("");
                            }}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-[#38746D] font-semibold text-xs py-2 rounded-xl border border-dashed border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 active:scale-[0.99]"
                          >
                            <span>Kembali ke 3 Posko Terdekat</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )}

        {/* ============================================================== */}
        {/* 2. DRAGGABLE MULTI-SNAP BOTTOM SHEET (MOBILE VIEWPORT KHUSUS)  */}
        {/* ============================================================== */}
        <AnimatePresence>
          {!isNavigating && viewMode !== "IDLE" && (
            <motion.div
              key="mobile-bottom-sheet"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className={`md:hidden fixed inset-x-0 bottom-[68px] z-[350] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-slate-200/80 flex flex-col overflow-hidden pointer-events-auto ${
                sheetSnap === "min"
                  ? "h-[85px]"
                  : sheetSnap === "mid"
                  ? "h-[45vh]"
                  : "h-[calc(100dvh-170px)] max-h-[calc(100vh-100px)]"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col h-full overflow-hidden select-none"
                >
                  {renderMobileBottomSheetContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* HUD NAVIGASI MODE: TOP MANEUVER BANNER ALA GOOGLE MAPS        */}
        {/* ============================================================== */}
        {isNavigating && activeNavRoute && (
          <div
            className="absolute top-3.5 inset-x-4 md:inset-x-auto md:left-6 md:w-[420px] z-[1200] bg-[#38746D] text-white rounded-2xl p-4 shadow-2xl border border-emerald-600/40 flex items-center gap-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {/* Maneuver Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              {(() => {
                const curStep = activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.steps?.[navStepIndex];
                const mod = (curStep?.modifier || "").toLowerCase();
                if (mod.includes("right")) {
                  return <CornerUpRight className="w-8 h-8 text-white stroke-[2.8]" />;
                }
                if (mod.includes("left")) {
                  return <CornerUpLeft className="w-8 h-8 text-white stroke-[2.8]" />;
                }
                return <ArrowUp className="w-8 h-8 text-white stroke-[2.8]" />;
              })()}
            </div>

            {/* Instruction Details */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="text-3xl font-black text-white leading-none tracking-tight">
                {formatNavDistance(navDistanceToNextStep)}
              </div>
              <p className="text-base font-medium text-white/90 truncate mt-1 leading-snug">
                {(() => {
                  const rawInst = activeNavRoute.routes[activeNavRoute.selectedRouteIndex]?.steps?.[navStepIndex]?.instruction || "Lurus terus di rute evakuasi";
                  const cleanInst = rawInst
                    .replace(/^Mulai dari titik Anda menuju\s+/i, "Menuju ")
                    .replace(/^Mulai dari titik Anda\s+/i, "");
                  return cleanInst;
                })()}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* HUD NAVIGASI MODE: BOTTOM FLOATING ETA BAR ALA GOOGLE MAPS     */}
        {/* Berada di atas Mobile Bottom Nav (bottom-[80px] di mobile)     */}
        {/* ============================================================== */}
        {isNavigating && activeNavRoute && (
          <div
            className="absolute bottom-5 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[1200] bg-white rounded-full shadow-2xl px-6 py-3.5 flex items-center justify-between md:justify-center gap-6 border border-slate-200 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[320px] md:min-w-[420px]"
            style={{ zIndex: 1200 }}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="text-lg font-black text-emerald-700 leading-tight">
                  {formatNavDuration(navRemainingSeconds)} <span className="text-slate-400 font-normal text-sm">&bull;</span> {formatNavDistance(navRemainingMeters)}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Tiba pukul <strong>{new Date(Date.now() + navRemainingSeconds * 1000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExitNavigation}
                className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-red-200 shadow-xs"
                title="Keluar dari Mode Navigasi"
              >
                <X className="w-4 h-4 text-red-600" />
                <span>Keluar</span>
              </button>
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
            isNavigating
              ? "bottom-[150px] flex"
              : isDetailActive
              ? sheetSnap === "full"
                ? "hidden"
                : sheetSnap === "mid"
                ? "bottom-[calc(42vh+76px)] flex"
                : "bottom-[calc(64px+86px)] flex"
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
              <Minimize2 className="w-5 h-5 text-[#38746D]" />
            ) : (
              <Maximize2 className="w-5 h-5 text-[#38746D]" />
            )}
          </button>

          {/* Tombol Bawah: Beralih ke Citra Satelit (Basemap Toggle OSM <-> Satelit Esri) */}
          <button
            type="button"
            onClick={handleToggleBasemap}
            className={`w-11 h-11 rounded-full shadow-lg border transition-transform active:scale-95 flex items-center justify-center cursor-pointer ${basemap === "satellite"
              ? "bg-[#38746D] text-white border-[#24544E]"
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
            isNavigating
              ? "bottom-24 md:bottom-24 flex"
              : isDetailActive
              ? sheetSnap === "full"
                ? "hidden md:flex md:bottom-12"
                : sheetSnap === "mid"
                ? "bottom-[calc(45vh+76px)] md:bottom-12 flex"
                : "bottom-[calc(85px+76px)] md:bottom-12 flex"
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
              <Loader2 className="w-5 h-5 text-[#38746D] animate-spin" />
            ) : (
              <Crosshair className="w-5 h-5 text-[#38746D]" />
            )}
          </button>

          {/* Tombol 3: Pusatkan Peta ke Indramayu (Recenter) */}
          {!isNavigating && (
          <button
            type="button"
            onClick={handleRecenter}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
            title="Pusatkan Peta ke Indramayu"
            aria-label="Pusatkan Peta ke Indramayu"
          >
            <MapPin className="w-5 h-5 text-[#38746D]" />
          </button>
          )}

          {/* Tombol 4 (Khusus Web Desktop): Beralih ke Citra Satelit */}
          <button
            type="button"
            onClick={handleToggleBasemap}
            className={`hidden md:flex w-11 h-11 rounded-full shadow-lg border transition-transform active:scale-95 items-center justify-center cursor-pointer ${basemap === "satellite"
              ? "bg-[#38746D] text-white border-[#24544E]"
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
              <Minimize2 className="w-5 h-5 text-[#38746D]" />
            ) : (
              <Maximize2 className="w-5 h-5 text-[#38746D]" />
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




        {/* Custom CSS untuk Badge Rute Leaflet Transparan & Custom Cluster Badge */}
        <style jsx global>{`
          .dermayu-route-badge,
          .custom-nav-primary-callout,
          .custom-nav-alt-callout,
          .custom-nav-chevron-marker {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .dermayu-route-badge::before,
          .dermayu-route-badge::after {
            display: none !important;
          }
          .active-pin-marker {
            z-index: 9999 !important;
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
