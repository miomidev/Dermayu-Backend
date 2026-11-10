"use client";

import { useEffect, useState, useRef, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  Navigation,
  PlusCircle,
  CheckCircle2,
  PhoneCall,
  X,
  RefreshCw,
  Camera,
  Droplets,
  Waves,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { getActiveSession } from "@/utils/authSession";
import { FLOOD_OBSTACLES, REALISTIC_FLOOD_PHOTOS } from "@/data/curatedEvakuasiData";
import { getWargaPosko, fetchPoskoFromApi } from "@/utils/poskoService";
import { INITIAL_CITIZEN_REPORTS } from "@/data/citizenReports";
import type {
  MapReportPoint,
  MapShelterPoint,
  MapTelemetryPoint,
} from "@/components/dashboard/WargaSpatialMap";

// Dynamic import for Leaflet Spatial Map (SSR Disabled)
function MapLoadingFallback() {
  const [isOffline, setIsOffline] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      const timer = setTimeout(() => {
        setShowWarning(true);
      }, 3500);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div className="w-full h-[520px] rounded-3xl bg-[#EEF5F3] border border-[#D5E4E0] flex flex-col items-center justify-center text-[#4B635F] p-6 text-center space-y-3">
      <RefreshCw className="w-8 h-8 animate-spin text-[#38746D]" />
      <span className="text-sm font-bold text-[#1F413D]">
        {isOffline ? "Memuat Peta Spasial (Mode Offline)..." : "Memuat Peta Spasial & Rute Evakuasi..."}
      </span>
      {showWarning && (
        <div className="max-w-md bg-white/80 backdrop-blur-sm border border-[#C5DCD6] rounded-2xl p-4 shadow-sm text-xs text-[#2A4742] space-y-2">
          <p className="font-medium">
            {isOffline
              ? "Perangkat Anda sedang offline. Jika peta belum sempat dibuka saat online, browser memerlukan 1x akses online agar modul peta tersimpan di memori perangkat."
              : "Menyiapkan modul spasial GIS dan dataset rute..."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Center 112
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-xl bg-[#38746D] hover:bg-[#2A5852] text-white font-semibold text-xs transition-all"
            >
              Coba Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const WargaSpatialMap = dynamic(
  () => import("@/components/dashboard/WargaSpatialMap"),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
);

interface UserSession {
  name: string;
  email: string;
  role: string;
  district: string;
}

type ReportCategoryCode = "FLOOD" | "LEVEE" | "DRAINAGE" | "ROAD" | "TREE" | "OTHER";
type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type WaterLevelCode = "ANKLE" | "KNEE" | "THIGH" | "WAIST" | "ABOVE_CHEST";
type ReportStatusCode =
  | "SUBMITTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED";

interface ComplaintTicket {
  id: string;
  ticketCode: string;
  category: ReportCategoryCode;
  categoryLabel: string;
  title: string;
  location: string;
  severity: SeverityLevel;
  waterLevel?: WaterLevelCode;
  waterLevelText?: string;
  status: ReportStatusCode;
  createdAt: string;
  note: string;
  photos: string[];
  urgentNeeds: string[];
  isFloodDetected?: boolean;
  aiScore?: {
    label: string;
    confidence: number;
    is_flood?: boolean;
  };
  lat?: number;
  lng?: number;
}

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  district?: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  lat: number;
  lng: number;
}

interface EmergencyContactItem {
  id: string;
  name: string;
  agency: string;
  phone: string;
  description: string;
  badge: string;
}

function WargaEvakuasiContent() {
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get("reportId") || undefined;
  const shelterIdParam = searchParams.get("shelterId") || searchParams.get("poskoId") || undefined;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const focusCoords =
    latParam && lngParam
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setSession] = useState<UserSession>({
    name: "Warga Indramayu",
    email: "warga@dermayu.id",
    role: "warga",
    district: "Kandanghaur - Eretan Wetan",
  });

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Data Posko Warga (Real-time sync dari PoskoService dengan filter isActive: true)
  const [wargaPoskoData, setWargaPoskoData] = useState(() => getWargaPosko());

  // Report form state
  const [reportCategory, setReportCategory] = useState<ReportCategoryCode>("FLOOD");
  const [reportTitle, setReportTitle] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportSeverity, setReportSeverity] = useState<SeverityLevel>("HIGH");
  const [reportWaterLevel, setReportWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [reportUrgentNeeds, setReportUrgentNeeds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState(false);

  // Complaints / Reports (Storage key v2 fresh)
  const STORAGE_KEY = "dermayu_user_reports_v2";

  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);

  // Sinkronisasi data laporan dari Server API & LocalStorage secara real-time
  const syncReportsFromStorage = () => {
    try {
      if (localStorage.getItem("dermayu_user_reports")) {
        localStorage.removeItem("dermayu_user_reports");
      }

      // 1. Fetch dari server sebagai single source of truth
      fetch("/api/laporan?type=citizen", { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => {
          const list = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.data)
            ? json.data.data
            : [];
          const apiTickets: ComplaintTicket[] = Array.isArray(list)
            ? list.map((item: any) => ({
                id: item.id || item.ticketCode,
                ticketCode: item.ticketCode || item.id,
                category: "FLOOD" as ReportCategoryCode,
                categoryLabel: item.disasterCategory || "Banjir / Rob Pesisir",
                title: item.description || "Laporan Titik Banjir",
                location: item.location || "Indramayu",
                severity: (item.severity === "TINGGI" ? "HIGH" : "MEDIUM") as SeverityLevel,
                waterLevelText: item.waterLevel || "Genangan Air",
                status: (item.status === "ARMADA_DIKERAHKAN" || item.status === "PENANGANAN"
                  ? "ASSIGNED"
                  : item.status === "VERIFIED" || item.status === "DIVERIFIKASI"
                  ? "VERIFIED"
                  : "SUBMITTED") as ReportStatusCode,
                createdAt: item.timeReceived || "Hari ini",
                note: item.description || "Laporan terverifikasi sistem",
                photos: item.photos || (item.photoUrl ? [item.photoUrl] : []),
                urgentNeeds: ["Bantuan Evakuasi"],
                isFloodDetected:
                  item.status === "VERIFIED" ||
                  item.status === "DIVERIFIKASI" ||
                  (item.aiConfidence && item.aiConfidence > 60),
                lat: Number(item.lat || -6.4093),
                lng: Number(item.lng || 108.2817),
              }))
            : [];

          // 2. Gabungkan seluruh tiket lokal dari perangkat
          let localTickets: ComplaintTicket[] = [];
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                localTickets = parsed.map((t: any, idx: number) => ({
                  id: t.id || `ticket-${idx}`,
                  ticketCode: t.ticketCode || t.id || `DMY-TKT-${idx}`,
                  category: (t.categoryCode || "FLOOD") as ReportCategoryCode,
                  categoryLabel: t.category || "Banjir / Rob Pesisir",
                  title: t.title || "Laporan Titik Banjir",
                  location: t.location || "Indramayu",
                  severity: (t.severity || "HIGH") as SeverityLevel,
                  waterLevelText: t.waterLevel || "Genangan Air",
                  status: (t.status === "DIVERIFIKASI" || t.status === "VERIFIED"
                    ? "VERIFIED"
                    : t.status === "PENANGANAN"
                    ? "ASSIGNED"
                    : "SUBMITTED") as ReportStatusCode,
                  createdAt: t.time || "Baru saja",
                  note: t.statusNote || t.notes || "Laporan warga",
                  photos: Array.isArray(t.photos) ? t.photos : [],
                  urgentNeeds: ["Evakuasi Warga"],
                  isFloodDetected:
                    t.isFloodDetected === true ||
                    t.status === "DIVERIFIKASI" ||
                    t.status === "VERIFIED",
                  lat: Number(t.gps?.lat ?? t.lat ?? -6.3475),
                  lng: Number(t.gps?.lng ?? t.lng ?? 108.1189),
                }));
              }
            }
          } catch {}

          const uniqueMap = new Map<string, ComplaintTicket>();
          [...localTickets, ...apiTickets].forEach((it) => {
            if (!uniqueMap.has(it.ticketCode)) {
              uniqueMap.set(it.ticketCode, it);
            } else {
              const existing = uniqueMap.get(it.ticketCode)!;
              const hasValidPhoto = (arr?: string[]) =>
                Array.isArray(arr) && arr.length > 0 && !arr[0].includes("placeholder");
              if (!hasValidPhoto(existing.photos) && hasValidPhoto(it.photos)) {
                existing.photos = it.photos;
              }
            }
          });
          setComplaints(Array.from(uniqueMap.values()));
        })
        .catch(() => {
          // Fallback bila server tidak dapat dijangkau
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                const loadedTickets: ComplaintTicket[] = parsed.map((t: any, idx: number) => {
                  const catCode = (t.categoryCode || "FLOOD") as ReportCategoryCode;
                  const sevLevel = (t.severity || (t.status === "PENANGANAN" ? "CRITICAL" : "HIGH")) as SeverityLevel;
                  const statusMapped: ReportStatusCode =
                    t.status === "PENANGANAN" ? "ASSIGNED" : t.status === "DIVERIFIKASI" ? "VERIFIED" : "SUBMITTED";
                  const isFloodDetected =
                    t.isFloodDetected === true || t.status === "DIVERIFIKASI" || t.status === "VERIFIED";
                  return {
                    id: t.id || `ticket-${idx}`,
                    ticketCode: t.id || `DMY-TKT-${idx}`,
                    category: catCode,
                    categoryLabel: t.category || "Banjir / Rob Pesisir",
                    title: t.title,
                    location: t.location,
                    severity: sevLevel,
                    waterLevelText: t.waterLevel || "Genangan Air",
                    status: statusMapped,
                    createdAt: t.time || "Baru saja",
                    note: t.statusNote || t.notes || "Laporan masuk antrean tim siaga Posko BPBD.",
                    photos: Array.isArray(t.photos) ? t.photos : [],
                    urgentNeeds: Array.isArray(t.urgentNeeds) ? t.urgentNeeds : ["Evakuasi Warga"],
                    isFloodDetected,
                    lat: t.gps?.lat ?? -6.3475,
                    lng: t.gps?.lng ?? 108.1189,
                  };
                });
                setComplaints(loadedTickets);
              }
            }
          } catch {}
        });
    } catch (err) {
      console.warn("Gagal membaca laporan dari storage:", err);
    }
  };

  useEffect(() => {
    syncReportsFromStorage();

    const handleStorageChange = () => {
      syncReportsFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dermayu_reports_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dermayu_reports_updated", handleStorageChange);
    };
  }, []);

  // Community Reports (Laporan warga sekitar tersinkronisasi dari data warga/aduan)
  const [communityReports] = useState<ComplaintTicket[]>(() =>
    INITIAL_CITIZEN_REPORTS.map((item) => ({
      id: item.id,
      ticketCode: item.id,
      category: item.id.includes("LEVEE")
        ? "LEVEE"
        : item.id.includes("DRAINAGE")
        ? "DRAINAGE"
        : "FLOOD",
      categoryLabel: item.title.slice(0, 24),
      title: item.title,
      location: item.location,
      severity:
        item.status === "PENANGANAN"
          ? "HIGH"
          : item.status === "DIVERIFIKASI"
          ? "MEDIUM"
          : "LOW",
      waterLevel:
        item.waterDepthCm >= 50
          ? "KNEE"
          : item.waterDepthCm >= 25
          ? "ANKLE"
          : "ANKLE",
      waterLevelText: item.waterLevelText,
      status:
        item.status === "PENANGANAN"
          ? "IN_PROGRESS"
          : item.status === "DIVERIFIKASI"
          ? "VERIFIED"
          : "RESOLVED",
      createdAt: item.timeAgo,
      note: item.statusNote,
      photos: item.photoUrl ? [item.photoUrl] : [],
      urgentNeeds: ["Bantuan Logistik"],
      lat: item.lat,
      lng: item.lng,
    }))
  );

  // Shelters Data: 100 Data Posko Terkurasi (Hanya yang berstatus isActive = true)
  const shelters: ShelterItem[] = useMemo(
    () =>
      wargaPoskoData
        .filter((p) => p.isActive === true)
        .map((p) => ({
          id: p.id,
          name: p.nama,
          location: p.alamat,
          district: p.kecamatan,
          distance: "Menghitung jarak GPS...",
          capacityTotal: p.kapasitas,
          capacityFilled: p.terisi,
          facilities: p.fasilitas,
          contactPerson: p.kontak.pj,
          contactPhone: p.kontak.telp,
          status: p.status,
          lat: p.lat,
          lng: p.lng,
        })),
    [wargaPoskoData]
  );

  // Telemetry Points (State Dinamis 10 Stasiun Infrastruktur Air Terhubung ke REST API /api/telemetry)
  const [telemetryPoints, setTelemetryPoints] = useState<MapTelemetryPoint[]>([
    {
      id: "INFRA-AIR-001",
      name: "Bendung Rentang (Pusat Kendali Cimanuk)",
      code: "INFRA-01",
      waterLevel: "310 m³/s (25.8% Kapasitas)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sinkron Satelit GloFAS & BMKG",
      lat: -6.6626,
      lng: 108.2209,
      tipeBangunan: "Bendung Gerak Radial Utama",
      lokasiDetail: "Panongan, Jatitujuh - Kertasmaya",
      district: "Kertasmaya",
      agency: "BBWS Cimanuk Cisanggarung (PUPR)",
      impactAreas: "Desa Tulungagung, Sukawera, Sindang",
      currentValue: 310,
      unit: "m³/s",
      rawStatus: "Kondisi Stabil",
    },
    {
      id: "INFRA-AIR-002",
      name: "Bendung Bangkir (Pembagi Aliran)",
      code: "INFRA-02",
      waterLevel: "185 m³/s (TMA 7.2 mdpl)",
      status: "WASPADA",
      trend: "STABIL",
      lastUpdate: "Sinkron Satelit GloFAS & BMKG",
      lat: -6.3856,
      lng: 108.2928,
      tipeBangunan: "Bendung Pembagi Aliran",
      lokasiDetail: "Desa Rambatan Wetan, Lohbener",
      district: "Lohbener",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Bantaran Sindang & Paoman",
      currentValue: 185,
      unit: "m³/s",
      rawStatus: "Waspada / Siaga 2",
    },
    {
      id: "INFRA-AIR-003",
      name: "Pintu Air Saluran Induk Barat (Cipelang)",
      code: "INFRA-03",
      waterLevel: "45 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sensor Aliran Irigasi",
      lat: -6.662,
      lng: 108.219,
      tipeBangunan: "Pintu Pengatur Intake Irigasi",
      lokasiDetail: "Kertasmaya, Perbatasan Majalengka",
      district: "Kertasmaya",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Kawasan Sawah Irigasi Barat",
      currentValue: 45,
      unit: "m³/s",
      rawStatus: "Kondisi Normal",
    },
    {
      id: "INFRA-AIR-004",
      name: "Pintu Air Saluran Induk Timur (Sindupraja)",
      code: "INFRA-04",
      waterLevel: "50 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sensor Aliran Irigasi",
      lat: -6.663,
      lng: 108.223,
      tipeBangunan: "Pintu Pengatur Intake Irigasi",
      lokasiDetail: "Kertasmaya, Perbatasan Majalengka",
      district: "Kertasmaya",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Kawasan Sawah Irigasi Timur",
      currentValue: 50,
      unit: "m³/s",
      rawStatus: "Kondisi Normal",
    },
    {
      id: "INFRA-AIR-005",
      name: "Stasiun Pompa Polder Karangsong",
      code: "INFRA-05",
      waterLevel: "+85 cm (Siaga Rob Pasang)",
      status: "SIAGA",
      trend: "NAIK",
      lastUpdate: "Radar Pompa Polder",
      lat: -6.312,
      lng: 108.365,
      tipeBangunan: "Stasiun Pompa Banjir Polder Pesisir",
      lokasiDetail: "Muara Prajagumiwang & Pelabuhan Karangsong",
      district: "Indramayu",
      agency: "Dinas PUPR Kabupaten Indramayu",
      impactAreas: "Permukiman Nelayan & TPI Karangsong",
      currentValue: 85,
      unit: "cm",
      rawStatus: "Siaga / Level 2",
    },
    {
      id: "INFRA-AIR-006",
      name: "Pintu Air Muara Kali Ciputih (Eretan Wetan)",
      code: "INFRA-06",
      waterLevel: "+65 cm (Pasang Rob)",
      status: "SIAGA",
      trend: "NAIK",
      lastUpdate: "Radar Pemantau Pesisir",
      lat: -6.3468,
      lng: 108.1215,
      tipeBangunan: "Pintu Air Muara Klep Gravitasi",
      lokasiDetail: "Desa Eretan Wetan Pantura",
      district: "Kandanghaur",
      agency: "Dinas PUPR & BPBD Indramayu",
      impactAreas: "Jalur Nasional Pantura & Dusun Muara",
      currentValue: 65,
      unit: "cm",
      rawStatus: "Siaga Pasang",
    },
    {
      id: "INFRA-AIR-007",
      name: "Bendung Karet Kali Perawan",
      code: "INFRA-07",
      waterLevel: "28 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sensor Elevasi Karet",
      lat: -6.3512,
      lng: 108.1485,
      tipeBangunan: "Inflatable Rubber Dam",
      lokasiDetail: "Kali Perawan, Losarang",
      district: "Losarang",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Pemukiman Bantaran Kali Perawan",
      currentValue: 28,
      unit: "m³/s",
      rawStatus: "Kondisi Stabil",
    },
    {
      id: "INFRA-AIR-008",
      name: "Pintu Air Pengatur Limpasan Kali Cipanas",
      code: "INFRA-08",
      waterLevel: "60 m³/s (Waspada)",
      status: "WASPADA",
      trend: "STABIL",
      lastUpdate: "Sensor Limpasan Debit",
      lat: -6.4015,
      lng: 108.1512,
      tipeBangunan: "Pintu Pengatur Limpasan",
      lokasiDetail: "Kali Cipanas, Losarang",
      district: "Losarang",
      agency: "BBWS Cimanuk Cisanggarung",
      impactAreas: "Jalan Lingkar Losarang",
      currentValue: 60,
      unit: "m³/s",
      rawStatus: "Waspada Limpasan",
    },
    {
      id: "INFRA-AIR-009",
      name: "Stasiun Pompa Pengendali Banjir Singaraja",
      code: "INFRA-09",
      waterLevel: "+40 cm (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Pompa Drainase Perkotaan",
      lat: -6.3382,
      lng: 108.3345,
      tipeBangunan: "Stasiun Pompa Pengendali Banjir",
      lokasiDetail: "Singaraja, Indramayu Kota",
      district: "Indramayu",
      agency: "Dinas PUPR Kabupaten Indramayu",
      impactAreas: "Pusat Kota Indramayu",
      currentValue: 40,
      unit: "cm",
      rawStatus: "Normal Siaga",
    },
    {
      id: "INFRA-AIR-010",
      name: "Pintu Air Pembuang Cipunegara (Bugel)",
      code: "INFRA-10",
      waterLevel: "75 m³/s (Normal)",
      status: "NORMAL",
      trend: "STABIL",
      lastUpdate: "Sensor Aliran Muara Cipunegara",
      lat: -6.2995,
      lng: 107.9621,
      tipeBangunan: "Pintu Air Saluran Pembuang",
      lokasiDetail: "Bugel, Sukra",
      district: "Sukra",
      agency: "BBWS Citarum / BPBD Indramayu",
      impactAreas: "Area Pertanian Pesisir Sukra",
      currentValue: 75,
      unit: "m³/s",
      rawStatus: "Kondisi Stabil",
    },
  ]);

  // Sinkronisasi Otomatis dari REST API Telemetri (/api/telemetry)
  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        const res = await fetch("/api/telemetry");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.stations)) {
          setTelemetryPoints(
            data.stations.map((s: any) => ({
              id: s.id,
              name: s.name,
              waterLevel: s.waterLevel,
              status: s.status,
              trend: s.trend,
              lastUpdate: s.lastUpdate,
              lat: s.lat,
              lng: s.lng,
              tipeBangunan: s.tipeBangunan,
              lokasiDetail: s.lokasiDetail,
              district: s.kecamatan,
              agency: s.instansiPengelola,
              impactAreas: s.potensiDampakHilir,
              isLive: data.isLiveExternal,
              debit: s.debitSaatIniM3s,
              capacity: s.kapasitasDesainM3s,
            }))
          );
        }
      } catch (err) {
        console.warn("Gagal sinkron telemetri:", err);
      }
    }

    loadTelemetry();
    const interval = setInterval(loadTelemetry, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Emergency Contacts
  const emergencyContacts: EmergencyContactItem[] = [
    {
      id: "ec-1",
      name: "Pusdalops PB BPBD Indramayu",
      agency: "Badan Penanggulangan Bencana Daerah",
      phone: "112",
      description: "Pusat panggilan siaga darurat evakuasi & banjir 24 jam bebas pulsa.",
      badge: "Pusat Kendali",
    },
    {
      id: "ec-2",
      name: "Basarnas Pos SAR Cirebon - Indramayu",
      agency: "Badan SAR Nasional",
      phone: "(0231) 200115",
      description: "Armada perahu karet LCR & evakuasi penyelamatan korban air deras.",
      badge: "Tim SAR",
    },
    {
      id: "ec-3",
      name: "PMI Kabupaten Indramayu",
      agency: "Palang Merah Indonesia",
      phone: "(0234) 271118",
      description: "Layanan ambulans darurat, pertolongan pertama, dan donor darah.",
      badge: "Medis Darurat",
    },
    {
      id: "ec-4",
      name: "Damkar & Penyelamatan Indramayu",
      agency: "Satpol PP & Damkar",
      phone: "(0234) 274113",
      description: "Penyedotan genangan pemukiman & evakuasi darurat.",
      badge: "Damkar",
    },
    {
      id: "ec-5",
      name: "IGD RSUD Indramayu",
      agency: "Rumah Sakit Umum Daerah",
      phone: "(0234) 272444",
      description: "Instalasi Gawat Darurat rujukan utama medis 24 jam.",
      badge: "Rumah Sakit",
    },
  ];

  // Session sync & Posko update listener
  useEffect(() => {
    try {
      const active = getActiveSession();
      if (active) {
        setSession({
          name: active.name,
          email: active.email,
          role: active.role,
          district: active.district || "Kandanghaur - Eretan Wetan",
        });
      }
    } catch {}

    const syncFromServer = async () => {
      try {
        const data = await fetchPoskoFromApi("warga");
        setWargaPoskoData(data.filter((p) => p.isActive === true));
      } catch (err) {
        console.warn("Sync warga posko error, using local fallback:", err);
      }
    };
    syncFromServer();

    // Polling periodik (setiap 60 detik) & saat tab kembali aktif
    const interval = setInterval(syncFromServer, 60000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromServer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handlePoskoUpdate = () => {
      setWargaPoskoData(getWargaPosko());
    };

    window.addEventListener("dermayu_posko_updated", handlePoskoUpdate);
    window.addEventListener("storage", handlePoskoUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("dermayu_posko_updated", handlePoskoUpdate);
      window.removeEventListener("storage", handlePoskoUpdate);
    };
  }, []);

  const toggleUrgentNeed = (item: string) => {
    setReportUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (reportPhotos.length + files.length > 5) {
      alert("Maksimal 5 foto per laporan.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setReportPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setReportPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportLocation) {
      alert("Mohon lengkapi judul kejadian dan titik lokasi.");
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    const categoryLabels: Record<ReportCategoryCode, string> = {
      FLOOD: "Banjir / Genangan",
      LEVEE: "Tanggul Kritis",
      DRAINAGE: "Drainase Tersumbat",
      ROAD: "Jalan Rusak Tergenang",
      TREE: "Pohon Tumbang",
      OTHER: "Aduan Wilayah",
    };

    const waterLevelLabels: Record<WaterLevelCode, string> = {
      ANKLE: "Semata Kaki (10-30 cm)",
      KNEE: "Setinggi Lutut (40-60 cm)",
      THIGH: "Setinggi Paha (70-90 cm)",
      WAIST: "Setinggi Pinggang (100-120 cm)",
      ABOVE_CHEST: "Di Atas Dada (> 120 cm)",
    };

    const newTicket: ComplaintTicket = {
      id: Date.now().toString(),
      ticketCode,
      category: reportCategory,
      categoryLabel: categoryLabels[reportCategory],
      title: reportTitle,
      location: reportLocation,
      severity: reportSeverity,
      waterLevel: reportCategory === "FLOOD" ? reportWaterLevel : undefined,
      waterLevelText: reportCategory === "FLOOD" ? waterLevelLabels[reportWaterLevel] : undefined,
      status: "SUBMITTED",
      createdAt: "Baru saja",
      note: "Laporan telah masuk ke antrean verifikasi Pusdalops BPBD.",
      photos: reportPhotos,
      urgentNeeds: reportUrgentNeeds,
      lat: -6.3475 + (Math.random() - 0.5) * 0.02,
      lng: 108.1189 + (Math.random() - 0.5) * 0.02,
    };

    setComplaints([newTicket, ...complaints]);
    setReportSubmittedSuccess(true);

    // Sinkronisasi juga ke LocalStorage agar tiket ini muncul di tab 'Riwayat Aduan' pada /warga/lapor
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const existing = saved ? JSON.parse(saved) : [];
      const reportForLapor = {
        id: ticketCode,
        category: categoryLabels[reportCategory],
        categoryCode: reportCategory,
        title: reportTitle,
        location: reportLocation,
        time: "Hari ini, baru saja",
        status: "DITERIMA",
        statusNote: "Laporan masuk via Peta Spasial Siaga BPBD. Menunggu verifikasi petugas.",
        photos: reportPhotos,
        severity: reportSeverity,
        waterLevel: reportCategory === "FLOOD" ? waterLevelLabels[reportWaterLevel] : undefined,
        urgentNeeds: reportUrgentNeeds,
        notes: reportNotes,
        gps: {
          lat: newTicket.lat,
          lng: newTicket.lng,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([reportForLapor, ...existing]));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("dermayu_reports_updated"));
    } catch (e) {
      console.warn("Gagal simpan aduan ke storage:", e);
    }

    setTimeout(() => {
      setReportSubmittedSuccess(false);
      setShowReportModal(false);
      setReportTitle("");
      setReportLocation("");
      setReportNotes("");
      setReportPhotos([]);
      setReportUrgentNeeds([]);
    }, 1500);
  };

  // Convert complaints to map points
  // 20 Titik Simulasi Hambatan Genangan di Jalan Utama (Radius 200m)
  const floodObstacleReports: MapReportPoint[] = FLOOD_OBSTACLES.map((obs, idx) => ({
    id: obs.id,
    ticketCode: `GEN-${String(idx + 1).padStart(3, "0")}`,
    title: obs.title,
    category: obs.zone === "PESISIR_ROB" ? "Banjir Rob" : "Luapan DAS Cimanuk",
    severity: obs.severity,
    waterLevelText: `${obs.depthCm} cm`,
    status: obs.status,
    location: obs.location,
    lat: obs.lat,
    lng: obs.lng,
    timeAgo: "Aktif Terpantau",
    photos: [REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length]],
    photoUrl: REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length],
    note: obs.description,
  }));

  // FILTER KETAT: Hanya laporan yang BENAR-BENAR TERDETEKSI BANJIR yang masuk ke peta
  const floodConfirmedComplaints = useMemo(() => {
    return complaints.filter((c) => {
      return (
        c.isFloodDetected === true ||
        c.status === "VERIFIED" ||
        c.status === "ASSIGNED" ||
        (c.aiScore?.label === "flood" && (c.aiScore?.confidence ?? 0) >= 0.6)
      );
    });
  }, [complaints]);

  const mapReportPoints: MapReportPoint[] = useMemo(() => [
    ...floodObstacleReports,
    ...floodConfirmedComplaints.map((c, idx) => ({
      id: c.id,
      ticketCode: c.ticketCode,
      title: c.title,
      category: c.categoryLabel,
      severity: c.severity,
      waterLevelText: c.waterLevelText,
      status:
        c.status === "IN_PROGRESS" || (c.status as string) === "PENANGANAN"
          ? "Regu SAR Menuju Lokasi"
          : "Terverifikasi Aktif",
      location: c.location,
      lat: c.lat || -6.3475,
      lng: c.lng || 108.1189,
      timeAgo: c.createdAt,
      photos:
        c.photos && c.photos.length > 0 && c.photos[0] !== ""
          ? c.photos
          : [REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length]],
      photoUrl:
        c.photos && c.photos.length > 0 && c.photos[0] !== ""
          ? c.photos[0]
          : REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length],
      note: c.note,
      isFloodDetected: true,
      aiScore: c.aiScore,
      urgentNeeds: c.urgentNeeds,
    })),
    ...communityReports.map((c, idx) => ({
      id: c.id,
      ticketCode: c.ticketCode,
      title: c.title,
      category: c.categoryLabel,
      severity: c.severity,
      waterLevelText: c.waterLevelText,
      status: "Dalam Penanganan",
      location: c.location,
      lat: c.lat || -6.2842,
      lng: c.lng || 108.2635,
      timeAgo: c.createdAt,
      photos:
        c.photos && c.photos.length > 0 && c.photos[0] !== ""
          ? c.photos
          : [REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length]],
      photoUrl:
        c.photos && c.photos.length > 0 && c.photos[0] !== ""
          ? c.photos[0]
          : REALISTIC_FLOOD_PHOTOS[idx % REALISTIC_FLOOD_PHOTOS.length],
      note: c.note,
      urgentNeeds: c.urgentNeeds,
    })),
  ], [floodObstacleReports, floodConfirmedComplaints, communityReports]);

  const mapShelterPoints: MapShelterPoint[] = useMemo(() => wargaPoskoData.map((p) => {
    const isKemdikbudPhoto = p.foto && p.foto.includes("kemendikdasmen.go.id");
    const rawPhotos = isKemdikbudPhoto
      ? [p.foto]
      : p.photos && p.photos.length > 0
      ? p.photos
      : p.fotos && p.fotos.length > 0
      ? p.fotos
      : p.foto
      ? [p.foto]
      : [];
    const photos = rawPhotos.filter((f) => typeof f === "string" && !f.includes("default.jpg"));
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
      foto: photos[0] || p.foto || "",
      fotos: photos,
      photos: photos,
      tier: p.tier,
    };
  }), [wargaPoskoData]);

  const handleOpenReportModal = useCallback(() => setShowReportModal(true), []);
  const handleOpenContactsModal = useCallback(() => setShowContactsModal(true), []);

  return (
    <>
      <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden">
        {/* PETA SPASIAL KESIAPSIAGAAN & RUTE EVAKUASI (FULL VIEWPORT GIS) */}
        <WargaSpatialMap
          reports={mapReportPoints}
          shelters={mapShelterPoints}
          telemetry={telemetryPoints}
          onOpenReport={handleOpenReportModal}
          onOpenContacts={handleOpenContactsModal}
          focusReportId={reportIdParam}
          focusShelterId={shelterIdParam}
          focusCoords={focusCoords}
        />
      </div>

      {/* ============================================================ */}
      {/* MODAL: FORMULIR LAPOR TITIK BANJIR                           */}
      {/* ============================================================ */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">Lapor Titik Genangan / Kejadian</h3>
                <p className="text-xs text-[#4B635F]">Laporan langsung diteruskan ke regu posko lapangan BPBD</p>
              </div>
            </div>

            {reportSubmittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Laporan Berhasil Terkirim!</h4>
                <p className="text-xs text-emerald-700">
                  Nomor tiket darurat diterbitkan. Petugas BPBD terdekat sedang memverifikasi lokasi Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* 1. Kategori Laporan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kategori Kejadian
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { code: "FLOOD", label: "Banjir / Rob", icon: Droplets },
                      { code: "LEVEE", label: "Tanggul Kritis", icon: ShieldCheck },
                      { code: "DRAINAGE", label: "Drainase Mampet", icon: Waves },
                      { code: "ROAD", label: "Jalan Tergenang", icon: Navigation },
                      { code: "TREE", label: "Pohon Tumbang", icon: AlertTriangle },
                      { code: "OTHER", label: "Aduan Lainnya", icon: FileText },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = reportCategory === cat.code;
                      return (
                        <button
                          type="button"
                          key={cat.code}
                          onClick={() => setReportCategory(cat.code as ReportCategoryCode)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                              : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-[#38746D]"}`} />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Judul Laporan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Judul Kejadian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Contoh: Genangan rob naik merendam jalan desa RT 02"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] focus:ring-1 focus:ring-[#38746D] transition"
                  />
                </div>

                {/* 3. Titik Lokasi */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Titik Lokasi / Alamat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="Contoh: Blok Karanganyar RT 04 RW 02, Desa Eretan Wetan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] focus:ring-1 focus:ring-[#38746D] transition"
                  />
                </div>

                {/* 4. Ketinggian Air (Khusus FLOOD) */}
                {reportCategory === "FLOOD" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                      Ketinggian Air Genangan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { code: "ANKLE", label: "Semata Kaki", val: "10-30 cm" },
                        { code: "KNEE", label: "Setinggi Lutut", val: "40-60 cm" },
                        { code: "THIGH", label: "Setinggi Paha", val: "70-90 cm" },
                        { code: "WAIST", label: "Setinggi Pinggang", val: "100-120 cm" },
                        { code: "ABOVE_CHEST", label: "Di Atas Dada", val: "> 120 cm" },
                      ].map((item) => {
                        const isSelected = reportWaterLevel === item.code;
                        return (
                          <button
                            type="button"
                            key={item.code}
                            onClick={() => setReportWaterLevel(item.code as WaterLevelCode)}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#EEF5F3] border-[#38746D] text-[#1D443F]"
                                : "bg-[#F8FAF9] border-[#D5E4E0] text-[#4B635F] hover:bg-gray-100"
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{item.label}</span>
                            <span className="block text-[10px] text-[#718783]">{item.val}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Kebutuhan Mendesak */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kebutuhan Mendesak (Bisa pilih lebih dari satu)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Perahu Karet Evakuasi",
                      "Bantuan Medis / Lansia",
                      "Karung Pasir Penahan",
                      "Logistik Makanan Siap Saji",
                      "Penerangan / Genset",
                    ].map((item) => {
                      const isSelected = reportUrgentNeeds.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleUrgentNeed(item)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? "bg-[#38746D] text-white border-[#38746D]"
                              : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Unggah Foto Bukti */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Foto Bukti Lapangan (Maks. 5 Foto)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl border border-dashed border-[#38746D] bg-[#EEF5F3] text-[#38746D] hover:bg-[#D1E5E2] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil / Pilih Foto</span>
                    </button>
                    {reportPhotos.map((p, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-300">
                        <img src={p} alt="Bukti" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-0 right-0 p-0.5 bg-rose-600 text-white rounded-bl-md cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Contoh: Ada 2 lansia di rumah panggung ujung gang butuh dipapah."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs focus:outline-none focus:border-[#38746D] transition"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#D5E4E0] text-[#4B635F] text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Kirim Laporan Sekarang
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* MODAL: DIREKTORI KONTAK DARURAT 24 JAM                       */}
      {/* ============================================================ */}
      {showContactsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[92vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowContactsModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">Kontak Darurat Terpadu Indramayu</h3>
                <p className="text-xs text-[#4B635F]">Layanan respons darurat bencana 24 jam</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {contact.badge}
                      </span>
                      <h4 className="text-xs font-bold text-[#132422] truncate">{contact.name}</h4>
                    </div>
                    <p className="text-[11px] text-[#718783] truncate">{contact.description}</p>
                  </div>

                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                    className="px-3 py-1.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shrink-0 transition"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowContactsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132422] text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function WargaEvakuasiPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-[#EEF5F3] text-[#4B635F] text-xs font-semibold">
          Memuat Peta Spasial...
        </div>
      }
    >
      <WargaEvakuasiContent />
    </Suspense>
  );
}
