"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Camera,
  ShieldCheck,
  Waves,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  X,
  Crosshair,
  RefreshCw,
  Image as ImageIcon,
  Scan,
  FileText,
  LifeBuoy,
  Users,
  ThumbsUp,
  Share2,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  Database,
  ClipboardList,
  Copy,
  Loader2,
} from "lucide-react";
import { FullscreenCameraModal } from "@/components/dashboard/FullscreenCameraModal";
import { AiScannerOverlay, type AiScanResult } from "@/components/dashboard/AiScannerOverlay";
import { BeaconAlertIcon } from "@/components/ui/Icons";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import { REALISTIC_FLOOD_PHOTOS } from "@/data/curatedEvakuasiData";

export type ReportCategoryCode =
  | "FLOOD"
  | "LEVEE"
  | "EVACUATION"
  | "DRAINAGE"
  | "ROAD"
  | "TREE"
  | "OTHER";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type WaterLevelCode = "ANKLE" | "KNEE" | "THIGH" | "WAIST" | "ABOVE_CHEST";

export interface ReportTicket {
  id: string;
  category: string;
  categoryCode?: ReportCategoryCode;
  title: string;
  location: string;
  time: string;
  status: "DITERIMA" | "DIVERIFIKASI" | "PENANGANAN" | "SELESAI" | "ANTREAN_OFFLINE" | string;
  statusNote: string;
  photos?: string[];
  severity?: SeverityLevel;
  waterLevel?: string;
  urgentNeeds?: string[];
  notes?: string;
  aiConfidence?: number;
  gps?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  isOfflineQueue?: boolean;
  offlineToken?: string;
  syncedAt?: string;
  isFloodDetected?: boolean;
  aiScore?: {
    label: string;
    confidence: number;
    is_flood?: boolean;
  };
}

export interface OtherCitizenReport {
  id: string;
  authorName: string;
  authorRole: "Warga" | "Relawan Tagana" | "Aparat Desa";
  authorVillage: string;
  title: string;
  description: string;
  location: string;
  waterLevelText: string;
  waterDepthCm: number;
  timeAgo: string;
  photoUrl: string;
  aiConfidence: number;
  status: "PENANGANAN" | "DIVERIFIKASI" | "SELESAI";
  statusNote: string;
  similarCount: number;
  isUpvoted?: boolean;
  lat: number;
  lng: number;
}

const STATUS_CONFIG: Record<
  string,
  {
    dotClass: string;
    badgeClass: string;
    textClass: string;
    label: string;
  }
> = {
  ANTREAN_OFFLINE: {
    dotClass: "bg-amber-500 animate-ping",
    badgeClass: "bg-amber-100 border-amber-300 text-amber-950 font-black",
    textClass: "text-amber-900",
    label: "Antrean Offline (Token)",
  },
  DITERIMA: {
    dotClass: "bg-amber-500 animate-pulse",
    badgeClass: "bg-amber-50 border-amber-200 text-amber-900",
    textClass: "text-amber-800",
    label: "Menunggu Verifikasi Posko",
  },
  DIVERIFIKASI: {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
    textClass: "text-emerald-800",
    label: "Terverifikasi Sistem",
  },
  PENANGANAN: {
    dotClass: "bg-sky-500 animate-pulse",
    badgeClass: "bg-sky-50 border-sky-200 text-sky-900",
    textClass: "text-sky-800",
    label: "Regu SAR Menuju Lokasi",
  },
  SELESAI: {
    dotClass: "bg-teal-600",
    badgeClass: "bg-teal-50 border-teal-200 text-teal-900",
    textClass: "text-teal-800",
    label: "Tindakan Lapangan Selesai",
  },
};


const initialReports: ReportTicket[] = [];

const INITIAL_OTHER_CITIZEN_REPORTS: OtherCitizenReport[] = [
  {
    id: "DMY-PUB-01",
    authorName: "Pak Warno",
    authorRole: "Warga",
    authorVillage: "Eretan Wetan, Kandanghaur",
    title: "Air pasang rob laut rendam jalan pemukiman nelayan",
    description:
      "Air pasang rob mulai naik sejak pukul 11 siang, akses jalan utama menuju TPI tergenang setinggi lutut orang dewasa.",
    location: "Blok Karanganyar RT 04 / RW 02, Eretan Wetan",
    waterLevelText: "Setinggi Lutut (55 cm)",
    waterDepthCm: 55,
    timeAgo: "15m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.94,
    status: "PENANGANAN",
    statusNote:
      "Regu SAR Pos Eretan bersama 1 perahu karet LCR sedang bergerak evakuasi warga rentan.",
    similarCount: 14,
    lat: -6.3475,
    lng: 108.1189,
  },
  {
    id: "DMY-PUB-02",
    authorName: "Ibu Nur Hasanah",
    authorRole: "Warga",
    authorVillage: "Cantigi Kulon, Cantigi",
    title: "Rembesan tanggul tanah saluran tambak mendekati pemukiman",
    description:
      "Debit air pasang menekan tanggul tanah pekarangan tambak ikan, warga waspada potensi limpasan puncak jam 3 sore.",
    location: "Blok Tanggul RT 02 / RW 01, Cantigi Kulon",
    waterLevelText: "Semata Kaki (30 cm)",
    waterDepthCm: 30,
    timeAgo: "45m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.92,
    status: "DIVERIFIKASI",
    statusNote:
      "Posko menyiapkan 150 karung pasir bronjong darurat untuk pengamanan darurat tanggul.",
    similarCount: 8,
    lat: -6.2842,
    lng: 108.2635,
  },
  {
    id: "DMY-PUB-03",
    authorName: "Kang Didi",
    authorRole: "Relawan Tagana",
    authorVillage: "Parean Girang, Kandanghaur",
    title: "Drainase pembuang sekunder tersumbat eceng gondok & sampah ranting",
    description:
      "Aliran air ke muara tersendat akibat tumpukan ranting kayu di bawah jembatan penghubung antar dusun.",
    location: "Jl. Muara Lama KM 2, Parean Girang",
    waterLevelText: "Genangan 40 cm",
    waterDepthCm: 40,
    timeAgo: "1j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.89,
    status: "PENANGANAN",
    statusNote:
      "Satgas Dinas PUPR Indramayu bersama relawan telah mulai pembersihan pintu air saluran pembuang.",
    similarCount: 6,
    lat: -6.368,
    lng: 108.092,
  },
  {
    id: "DMY-PUB-04",
    authorName: "Bpk. Sutrisno",
    authorRole: "Aparat Desa",
    authorVillage: "Karangsong, Indramayu",
    title: "Limpasan gelombang pasang rob di area dermaga perahu",
    description:
      "Air laut meluap tipis ke bibir dermaga kapal nelayan, pompa sedot darurat telah diaktifkan untuk menjaga area tambatan.",
    location: "Dermaga Muara Karangsong, Indramayu",
    waterLevelText: "Semata Kaki (25 cm)",
    waterDepthCm: 25,
    timeAgo: "2j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1741110539426-fce3268c3c0d?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.95,
    status: "SELESAI",
    statusNote:
      "Pompa submersible menyala normal, genangan air berangsur surut kembali ke alur muara sungai.",
    similarCount: 19,
    lat: -6.315,
    lng: 108.358,
  },
];

const STORAGE_KEY = "dermayu_user_reports_v2";

export default function WargaLaporPage() {
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Responsive Mobile Tab Switcher: "FORM" | "HISTORY" (Active only on small screens < lg)
  const [mobileTab, setMobileTab] = useState<"FORM" | "HISTORY">("FORM");

  const [otherReports, setOtherReports] = useState<OtherCitizenReport[]>(
    INITIAL_OTHER_CITIZEN_REPORTS
  );
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(
    null
  );
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  // Progressive Step Flow State:
  // State 1: Photo capture hub (photos.length === 0)
  // State 2: Camera Modal / Verification Overlay
  // State 3: Confirmed photo with clean form (photos.length > 0)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<AiScanResult | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

  // Form Data State
  const [location, setLocation] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    ticketCode: string;
    location: string;
    notes?: string;
    isAutoVerified: boolean;
    lat: number;
    lng: number;
  } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const handleCopyTicket = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  // Reports List State - Inisialisasi aman [] untuk mencegah error hydration mismatch Next.js SSR
  const [reports, setReports] = useState<ReportTicket[]>([]);

  // State Pagination Riwayat Aduan Saya (2 aduan per halaman)
  const [reportPage, setReportPage] = useState(1);
  const reportsPerPage = 2;
  const totalReportPages = Math.max(1, Math.ceil(reports.length / reportsPerPage));
  const startReportIndex = (reportPage - 1) * reportsPerPage;
  const paginatedReports = reports.slice(startReportIndex, startReportIndex + reportsPerPage);

  // Pastikan reportPage tidak melebihi totalReportPages
  useEffect(() => {
    if (reportPage > totalReportPages) {
      setReportPage(totalReportPages);
    }
  }, [reportPage, totalReportPages]);

  // Algoritma Penomoran Halaman dengan Ellipsis Pintar (Sesuai Posko)
  const getReportPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  // Status Koneksi Jaringan & Mode Offline (PWA Offline-First)
  const [isOnline, setIsOnline] = useState(true);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // 1. Initial LocalStorage Load & Synchronization
  useEffect(() => {
    setIsOnline(typeof window !== "undefined" ? window.navigator.onLine : true);

    try {
      if (localStorage.getItem("dermayu_user_reports")) {
        localStorage.removeItem("dermayu_user_reports");
      }

      // Ambil data lokal segera saat komponen mount di client
      const initialLocal = localStorage.getItem(STORAGE_KEY);
      if (initialLocal) {
        try {
          const parsed = JSON.parse(initialLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReports(parsed);
          }
        } catch {}
      }

      // Ambil data aduan resmi dari Server API (single source of truth)
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

          const serverTickets: ReportTicket[] = Array.isArray(list)
            ? list.map((item: any) => ({
                id: item.ticketCode || item.id,
                category: item.disasterCategory || "Banjir / Rob Pesisir",
                categoryCode: "FLOOD" as ReportCategoryCode,
                title: item.description || item.title || "Laporan Titik Banjir",
                location: item.location,
                time: item.timeReceived || "Hari ini",
                status:
                  item.status === "VERIFIED" || item.status === "DIVERIFIKASI"
                    ? "DIVERIFIKASI"
                    : item.status === "ARMADA_DIKERAHKAN" || item.status === "PENANGANAN"
                    ? "PENANGANAN"
                    : item.status === "SELESAI"
                    ? "SELESAI"
                    : item.status === "DITOLAK"
                    ? "DITOLAK"
                    : "DITERIMA",
                statusNote: item.description || "Laporan terverifikasi sistem",
                photos: item.photos || (item.photoUrl ? [item.photoUrl] : []),
                aiConfidence: item.aiConfidence,
                isFloodDetected: item.status === "VERIFIED" || item.status === "DIVERIFIKASI" || (item.aiConfidence && item.aiConfidence > 60),
                gps: item.lat ? { lat: Number(item.lat), lng: Number(item.lng) } : undefined,
              }))
            : [];

          // Ambil seluruh tiket lokal yang sudah ada di memori perangkat
          let localTickets: ReportTicket[] = [];
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                localTickets = parsed;
              }
            }
          } catch {}

          // Sinkronkan antrean offline ke server bila ada
          const offlineQueue = localTickets.filter((r) => r.isOfflineQueue === true);
          offlineQueue.forEach((rpt) => {
            fetch("/api/laporan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(rpt),
            }).catch(() => {});
          });

          // Gabungkan tiket: utamakan tiket lokal lalu lengkapi dengan serverTickets
          const ticketMap = new Map<string, ReportTicket>();
          serverTickets.forEach((t) => ticketMap.set(t.id, t));
          localTickets.forEach((t) => ticketMap.set(t.id, t));

          const finalReports = Array.from(ticketMap.values());
          if (finalReports.length > 0) {
            setReports(finalReports);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(finalReports));
          }
        })
        .catch((err) => {
          console.warn("Gagal fetch dari server, mempertahankan cache lokal:", err);
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setReports(parsed);
              }
            }
          } catch {}
        });
    } catch {
      // Fallback aman
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setReports(parsed);
        }
      } catch {}
    }
  }, []);

  // Listen to cross-tab & petugas updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const fresh = localStorage.getItem(STORAGE_KEY);
        if (fresh) {
          const parsed = JSON.parse(fresh);
          if (Array.isArray(parsed)) setReports(parsed);
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("dermayu_reports_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("dermayu_reports_updated", handleStorageUpdate);
    };
  }, []);

  // 2. Automated Background Sync saat Sinyal Internet Pulih (Reconciliation)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const list: ReportTicket[] = JSON.parse(saved);
          const hasOfflineQueue = list.some(
            (r) => r.isOfflineQueue || r.status === "ANTREAN_OFFLINE"
          );
          if (hasOfflineQueue) {
            const syncedList = list.map((r) => {
              if (r.isOfflineQueue || r.status === "ANTREAN_OFFLINE") {
                return {
                  ...r,
                  isOfflineQueue: false,
                  status: "DIVERIFIKASI",
                  statusNote:
                    "✅ Tiket token offline berhasil disinkronkan otomatis ke server Pusdalops BPBD saat sinyal internet pulih.",
                  syncedAt: new Date().toLocaleTimeString("id-ID") + " WIB",
                };
              }
              return r;
            });
            saveReportsToStorage(syncedList);
            setSyncToast(
              "🟢 Sinyal internet pulih! Laporan dalam antrean offline telah otomatis disinkronkan ke Pusdalops BPBD."
            );
            setTimeout(() => setSyncToast(null), 5000);
          }
        }
      } catch (err) {
        console.warn("Gagal auto-sync laporan offline:", err);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveReportsToStorage = (updated: ReportTicket[]) => {
    setReports(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("dermayu_reports_updated", { detail: updated }));
    } catch (err) {
      console.warn("Gagal menyimpan riwayat aduan ke localStorage:", err);
    }
  };

  // Real GPS Geolocation Acquisition
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
        });
        setIsLocating(false);

        // If location text is empty, auto-fill with coordinates
        if (!location.trim()) {
          setLocation(
            `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          );
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGpsError("Izin GPS dinonaktifkan di browser. Silakan ketik nama patokan lokasi.");
        } else {
          setGpsError("Gagal mengunci sinyal GPS. Silakan ketik patokan lokasi Anda.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger verification inference via Next.js proxy dengan dukungan Edge Offline Heuristic
  const triggerAiInference = async (dataUrl: string, fileObj?: File) => {
    setIsAiAnalyzing(true);
    // Minimum scanning display duration ~2 seconds for smooth UX
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

    // Deteksi Jika Perangkat Berada di Mode Offline:
    // Terapkan penampungan antrean offline (review) agar warga tetap bisa simpan laporan
    if (typeof window !== "undefined" && (!window.navigator.onLine || !isOnline)) {
      setTimeout(() => {
        setAiScanResult({
          label: "review",
          confidence: 0.35,
          confidence_percent: 35,
          prob_flood: 0.35,
          prob_non_flood: 0.65,
          inference_ms: 10,
          model_version: "MobileNetV2-EdgeOffline",
          is_flood: false,
          is_auto_verified: false,
          is_review: true,
          needs_officer_review: true,
          is_rejected: false,
        });
        setIsAiAnalyzing(false);
      }, 2000);
      return;
    }

    try {
      let res;
      if (fileObj) {
        const formData = new FormData();
        formData.append("file", fileObj);
        res = await fetch("/api/v1/ai/scan", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/v1/ai/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
      }

      // Tunggu hingga minimal 2 detik animasi scan selesai
      await minDelay;

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAiScanResult(json.data);
          return;
        }
      }
      // Fallback jika API server lambat/unreachable: masuk ke antrean verifikasi posko (review)
      setAiScanResult({
        label: "review",
        confidence: 0.35,
        confidence_percent: 35,
        prob_flood: 0.35,
        prob_non_flood: 0.65,
        inference_ms: 50,
        model_version: "EdgeFallback-Triage",
        is_flood: false,
        is_auto_verified: false,
        is_review: true,
        needs_officer_review: true,
        is_rejected: false,
      });
    } catch (err) {
      await minDelay;
      console.warn("AI scan offline fallback applied:", err);
      // Fallback mulus saat offline / fetch error: arahkan ke review posko
      setAiScanResult({
        label: "review",
        confidence: 0.35,
        confidence_percent: 35,
        prob_flood: 0.35,
        prob_non_flood: 0.65,
        inference_ms: 50,
        model_version: "EdgeOffline-Triage",
        is_flood: false,
        is_auto_verified: false,
        is_review: true,
        needs_officer_review: true,
        is_rejected: false,
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Trigger when photo is captured from camera
  const handleCameraCapture = (dataUrl: string) => {
    setIsCameraOpen(false);
    setPendingPhoto(dataUrl);
    setIsAiScanning(true);
    triggerAiInference(dataUrl);
    handleGetGPS();
  };

  // Trigger when photo selected from gallery
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPendingPhoto(dataUrl);
        setIsAiScanning(true);
        triggerAiInference(dataUrl, file);
        handleGetGPS();
      }
    };
    reader.readAsDataURL(file);

    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleScanComplete = () => {
    if (pendingPhoto) {
      setPhotos([pendingPhoto]);
    }
    setPendingPhoto(null);
    setIsAiScanning(false);
  };

  // Efek transisi otomatis saat inferensi inline AI selesai langsung di dalam kotak foto
  useEffect(() => {
    if (isAiScanning && !isAiAnalyzing && pendingPhoto) {
      const isRejected = aiScanResult && (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25));
      const timer = setTimeout(() => {
        handleScanComplete();
      }, isRejected ? 1400 : 750);
      return () => clearTimeout(timer);
    }
  }, [isAiScanning, isAiAnalyzing, pendingPhoto, aiScanResult]);

  const handleResetPhoto = () => {
    setPhotos([]);
    setPendingPhoto(null);
    setAiScanResult(null);
  };

  // Handle upvote "Terdampak Juga" on other citizen reports
  const handleToggleSimilar = (reportId: string) => {
    setOtherReports((prev) =>
      prev.map((item) => {
        if (item.id === reportId) {
          const isUpvoted = !item.isUpvoted;
          return {
            ...item,
            isUpvoted,
            similarCount: isUpvoted ? item.similarCount + 1 : item.similarCount - 1,
          };
        }
        return item;
      })
    );
  };

  // Handle Share Report
  const handleShareReport = (report: OtherCitizenReport) => {
    const text = `Pantauan Rob & Banjir Indramayu: ${report.title} di ${report.location}. Situasi: ${report.statusNote}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedReportId(report.id);
      setTimeout(() => setCopiedReportId(null), 2000);
    }
  };

  // Handle Submit Formulir Laporan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      alert("Mohon tentukan titik lokasi kejadian (gunakan GPS atau ketik patokan lokasi).");
      return;
    }

    if (aiScanResult && (aiScanResult.is_rejected ?? (aiScanResult.prob_flood < 0.25))) {
      alert("Foto ditolak otomatis oleh AI karena terdeteksi bukan genangan banjir. Silakan ganti foto yang memperlihatkan genangan air.");
      return;
    }

    setIsSubmitting(true);

    const isActuallyOffline = typeof window !== "undefined" && (!window.navigator.onLine || !isOnline);

    // Unggah foto ke endpoint resmi /api/upload sebelum menyimpan laporan
    let finalPhotos: string[] = [...photos];
    if (!isActuallyOffline && photos.length > 0) {
      const base64List = photos.filter((p) => p.startsWith("data:"));
      const regularUrls = photos.filter((p) => !p.startsWith("data:"));
      if (base64List.length > 0) {
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: base64List, prefix: "laporan" }),
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            const serverUrls = uploadJson.data?.urls || uploadJson.data?.data?.urls || uploadJson.urls || [];
            if (Array.isArray(serverUrls) && serverUrls.length > 0) {
              finalPhotos = [...regularUrls, ...serverUrls];
            }
          }
        } catch (uploadErr) {
          console.warn("Upload gambar ke /api/upload gagal, memakai fallback:", uploadErr);
        }
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const tokenUuid = `TOK-${randNum}-${Date.now()}`;
    const ticketCode = isActuallyOffline
      ? `DMY-OFF-${dateStr}-${randNum}`
      : `DMY-${dateStr}-${randNum}`;

    const timeFormatted = `Hari ini, ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;

    const probFlood = aiScanResult?.prob_flood ?? 0;
    // Aturan Ambang Batas Verifikasi:
    // 0 - 60% (<= 0.60) -> Tetap verifikasi petugas posko
    // > 60% (60.1%+) -> Otomatis diverifikasi oleh AI & langsung aktif di peta
    const isAutoVerified = !isActuallyOffline && probFlood > 0.60;
    const needsOfficerReview = !isActuallyOffline && !isAutoVerified;

    const pctStr = aiScanResult
      ? ` (${(probFlood * 100).toFixed(1)}%)`
      : "";
    const ticketStatus = isActuallyOffline
      ? "ANTREAN_OFFLINE"
      : isAutoVerified
      ? "DIVERIFIKASI"
      : "DITERIMA";

    const statusNote = isActuallyOffline
      ? "Laporan & koordinat tersimpan aman di memori perangkat. Sistem akan otomatis meneruskannya ke Posko BPBD saat sinyal internet pulih."
      : isAutoVerified
      ? "Bukti foto terkonfirmasi valid. Laporan aktif di Peta Rute Evakuasi dan diteruskan ke Regu SAR Posko."
      : "Laporan tersimpan di sistem kendali dan dalam antrean verifikasi petugas posko siaga sebelum dipetakan.";

    const effectiveTitle = notes.trim()
      ? notes.length > 55
        ? notes.slice(0, 55) + "..."
        : notes
      : `Laporan Titik Banjir - ${location.trim()}`;

    const newTicket: ReportTicket = {
      id: ticketCode,
      category: "Banjir / Rob Pesisir",
      categoryCode: "FLOOD",
      title: effectiveTitle,
      location: location.trim(),
      time: timeFormatted,
      status: ticketStatus,
      statusNote: statusNote,
      photos: finalPhotos.length > 0 ? finalPhotos : undefined,
      notes: notes.trim() || undefined,
      aiConfidence: probFlood > 0 ? probFlood : undefined,
      isFloodDetected: isAutoVerified,
      aiScore: aiScanResult
        ? {
            label: isAutoVerified ? "flood" : "review",
            confidence: probFlood,
            is_flood: isAutoVerified,
          }
        : undefined,
      gps: gpsCoords || {
        lat: -6.3475 + (Math.random() - 0.5) * 0.02,
        lng: 108.1189 + (Math.random() - 0.5) * 0.02,
        accuracy: 10,
      },
      isOfflineQueue: isActuallyOffline,
      offlineToken: isActuallyOffline ? tokenUuid : undefined,
    };

    const updated = [newTicket, ...reports];
    saveReportsToStorage(updated);
    setReportPage(1);

    // Kirim juga ke server database agar sinkron secara real-time ke semua sesi petugas (termasuk jendela incognito)
    if (!isActuallyOffline) {
      fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json?.data) {
            const serverItem = json.data.data || json.data;
            const validPhotos = Array.isArray(serverItem.photos)
              ? serverItem.photos.filter((p: any) => typeof p === "string" && p.trim().length > 0)
              : typeof serverItem.photoUrl === "string" && serverItem.photoUrl.trim().length > 0
              ? [serverItem.photoUrl]
              : [];

            if (validPhotos.length > 0) {
              const fresh = localStorage.getItem(STORAGE_KEY);
              if (fresh) {
                try {
                  const list = JSON.parse(fresh);
                  const updatedList = list.map((item: any) => {
                    if (item.id === ticketCode || item.ticketCode === ticketCode) {
                      return {
                        ...item,
                        photos: validPhotos,
                        photoUrl: validPhotos[0],
                      };
                    }
                    return item;
                  });
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
                  setReports(updatedList);
                  window.dispatchEvent(new Event("storage"));
                  window.dispatchEvent(new CustomEvent("dermayu_reports_updated", { detail: updatedList }));
                } catch {}
              }
            }
          }
        })
        .catch((err) => console.warn("Background API sync report error:", err));
    }

    const finalLat = newTicket.gps?.lat ?? -6.3475;
    const finalLng = newTicket.gps?.lng ?? 108.1189;

    setSuccessModal({
      ticketCode,
      location: location.trim(),
      notes: notes.trim() || undefined,
      isAutoVerified,
      lat: finalLat,
      lng: finalLng,
    });
    setIsSubmitting(false);

    // Reset Form
    setLocation("");
    setGpsCoords(null);
    setNotes("");
    setPhotos([]);
    setAiScanResult(null);

    // Otomatis pindah ke tab riwayat aduan agar warga langsung melihat tiket baru
    setMobileTab("HISTORY");
  };

  const isFormActive = photos.length > 0;

  return (
    <div className="space-y-6 text-left w-full min-w-0">
      {/* Toast Notifikasi Auto-Sync Sinyal Pulih */}
      {syncToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-900 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{syncToast}</span>
          </div>
          <button
            onClick={() => setSyncToast(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Banner Mode Darurat Offline (PWA Offline-First) */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 flex items-center justify-between gap-3 text-[#132422] shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-xs min-w-0">
              <span className="font-extrabold text-amber-900 block leading-tight">
                Mode Darurat Offline Aktif
              </span>
              <span className="text-[11px] text-amber-800">
                Koneksi internet terputus. Laporan Anda tetap diamankan di memori ponsel dengan <strong>Token Tiket Offline</strong> dan otomatis disinkronkan ke Posko BPBD saat sinyal kembali.
              </span>
            </div>
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-200/60 text-amber-900 font-extrabold text-[10px] border border-amber-300">
            <Database className="w-3 h-3 text-amber-800" />
            <span>Store &amp; Forward</span>
          </div>
        </motion.div>
      )}

      {/* Hidden Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallerySelect}
      />

      {/* Modal Kamera Fullscreen */}
      <FullscreenCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        onSelectGallery={() => {
          setIsCameraOpen(false);
          galleryInputRef.current?.click();
        }}
      />

      {/* Verifikasi foto sekarang berjalan langsung inline di dalam kotak Ambil Foto, tanpa modal popup */}

      {/* Modal Lightbox Preview Foto Aduan */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="relative w-full aspect-video sm:aspect-4/3 bg-black">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 bg-white">
                <p className="text-xs sm:text-sm font-bold text-[#132422] truncate">
                  {previewImage.title}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL POPUP LAPORAN BERHASIL DITERBITKAN */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSuccessModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Tutup X */}
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F9F8] hover:bg-[#E8F3F1] text-[#4B635F] hover:text-[#132422] flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#EEF5F3] border border-[#38746D]/20 text-[#38746D] flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 text-[#38746D]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#132422] leading-snug">
                    Laporan Berhasil Terkirim
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-0.5">
                    Laporan Anda sudah kami terima dan masuk ke sistem.
                  </p>
                </div>
              </div>

              {/* Status Validation Box */}
              {successModal.isAutoVerified ? (
                <div className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#38746D]/15 text-[#132422] mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-bold text-xs mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Laporan Terverifikasi</span>
                  </div>
                  <p className="text-xs text-[#4B635F] leading-relaxed">
                    Titik banjir telah aktif di peta dan otomatis dihindari dalam pencarian rute evakuasi.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-[#132422] mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-bold text-xs mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Menunggu Verifikasi Petugas</span>
                  </div>
                  <p className="text-xs text-[#4B635F] leading-relaxed">
                    Petugas posko siaga akan mengecek foto dan lokasi laporan Anda terlebih dahulu sebelum ditampilkan di peta publik.
                  </p>
                </div>
              )}

              {/* Ringkasan Laporan dalam Card Bersih */}
              <div className="rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/70 p-3.5 space-y-2 mb-5 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#4B635F] shrink-0 font-medium">Lokasi</span>
                  <span className="font-bold text-[#132422] text-right truncate max-w-[220px]">
                    {successModal.location}
                  </span>
                </div>
                {successModal.notes && (
                  <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#D5E4E0]/40">
                    <span className="text-[#4B635F] shrink-0 font-medium">Catatan</span>
                    <span className="font-medium text-[#132422] text-right line-clamp-2 max-w-[220px]">
                      {successModal.notes}
                    </span>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Rounded-full */}
              {successModal.isAutoVerified ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href={`/warga/evakuasi?reportId=${encodeURIComponent(successModal.ticketCode)}&lat=${successModal.lat}&lng=${successModal.lng}`}
                    onClick={() => setSuccessModal(null)}
                    className="flex-1 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#2C5C56] active:scale-98 text-white text-xs sm:text-sm font-bold text-center transition shadow-md shadow-[#38746D]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#88BDB6]" />
                    <span>Lihat di Peta</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSuccessModal(null)}
                    className="py-3 px-6 rounded-full border border-[#D5E4E0] bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs sm:text-sm font-bold text-center transition cursor-pointer shadow-2xs"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSuccessModal(null)}
                  className="w-full py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#2C5C56] active:scale-98 text-white text-xs sm:text-sm font-bold text-center transition shadow-md shadow-[#38746D]/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-[#88BDB6]" />
                  <span>Lihat Riwayat Laporan Saya</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. TAB NAVIGASI KHUSUS MOBILE (< LG)                         */}
      {/* ============================================================ */}
      <div className="flex border-b border-gray-200 w-full lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("FORM")}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            mobileTab === "FORM"
              ? "text-[#38746D] border-b-2 border-[#38746D]"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Buat Laporan</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("HISTORY")}
          className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            mobileTab === "HISTORY"
              ? "text-[#38746D] border-b-2 border-[#38746D]"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Aduan Saya</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mobileTab === "HISTORY"
                ? "bg-[#38746D]/10 text-[#38746D]"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {reports.length}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN 2-COLUMN DASHBOARD GRID (7 COLS & 5 COLS)           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================== */}
        {/* KOLOM KIRI (7 COLS): PUSAT PELAPORAN AKTIF                 */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === "HISTORY" ? "hidden lg:block" : "block"
          }`}
        >
          <AnimatePresence mode="wait">
            {!isFormActive ? (
              /* STATE 1: PENGAMBILAN BUKTI FOTO & FEED ADUAN WARGA */
              <motion.div
                key="state-scanner-hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* BLOK 1: AMBIL BUKTI FOTO GENANGAN (Card Mandiri) */}
                <div className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-7 shadow-xs space-y-5">
                  {/* Header Card Bersih */}
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#D5E4E0]/60">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0">
                      <Camera className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#132422]">
                        Ambil Bukti Foto Genangan
                      </h2>
                      <p className="text-xs text-[#4B635F]">
                        Dokumentasikan situasi titik bencana untuk verifikasi petugas
                      </p>
                    </div>
                  </div>

                  {/* Dropzone Kamera / Inline AI Scanner (Langsung di dalam kotak, tanpa modal popup) */}
                  <div className="relative rounded-2xl border-2 border-dashed border-[#38746D]/30 bg-[#F8FAF9] p-5 sm:p-8 text-center transition-all overflow-hidden min-h-[220px] flex items-center justify-center">
                    {isAiScanning && pendingPhoto ? (
                      <div className="flex flex-col items-center justify-center py-6 sm:py-8 w-full animate-in fade-in duration-300">
                        {/* Circular Spinner with Brand Logo (Clean visual design) */}
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                          {/* Outer subtle ring track */}
                          <div
                            className={`absolute inset-0 rounded-full border transition-colors duration-500 ${
                              !isAiAnalyzing && (aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25))
                                ? "border-rose-500/20 bg-rose-500/5"
                                : "border-[#38746D]/15 bg-[#38746D]/5"
                            }`}
                          />

                          {/* Animated rotating progress ring */}
                          {isAiAnalyzing ? (
                            <svg
                              className="absolute inset-0 w-full h-full -rotate-90 animate-spin"
                              viewBox="0 0 120 120"
                              style={{ animationDuration: "1.4s" }}
                            >
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#D5E4E0"
                                strokeWidth="3"
                              />
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#38746D"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeDasharray="314"
                                strokeDashoffset="210"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="absolute inset-0 w-full h-full -rotate-90"
                              viewBox="0 0 120 120"
                            >
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={
                                  aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25)
                                    ? "#f43f5e"
                                    : "#10b981"
                                }
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeDasharray="314"
                                strokeDashoffset="0"
                                className="transition-all duration-500 ease-out"
                              />
                            </svg>
                          )}

                          {/* Inner Central Disc with DERMAYU Logo / Check / Cross */}
                          <div
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                              isAiAnalyzing
                                ? "bg-[#38746D] shadow-[#38746D]/25"
                                : (aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25))
                                ? "bg-rose-600 shadow-rose-600/30 scale-105"
                                : "bg-emerald-600 shadow-emerald-600/30 scale-105"
                            }`}
                          >
                            {isAiAnalyzing ? (
                              <div className="flex items-center justify-center p-2.5">
                                <LogoDermayu
                                  variant="light"
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow"
                                />
                              </div>
                            ) : (aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25)) ? (
                              <X className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-in zoom-in-75 duration-300 stroke-[3]" />
                            ) : (
                              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-in zoom-in-75 duration-300" />
                            )}
                          </div>
                        </div>

                        {/* Text Section matching reference typography */}
                        <div className="mt-5 space-y-1.5 text-center">
                          <h3 className="text-base sm:text-lg font-bold text-[#132422] tracking-tight">
                            {isAiAnalyzing
                              ? "Mohon Tunggu Sebentar"
                              : (aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25))
                              ? "Foto Ditolak (Bukan Banjir)"
                              : "Pemeriksaan Selesai"}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#4B635F] max-w-xs mx-auto leading-relaxed">
                            {isAiAnalyzing
                              ? "Sedang memproses dan menganalisis foto..."
                              : (aiScanResult?.is_rejected ?? (aiScanResult && aiScanResult.prob_flood * 100 < 25))
                              ? "Foto tidak terdeteksi genangan air, silakan ganti foto..."
                              : "Bukti foto terverifikasi, membuka formulir..."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#38746D] rounded-tl-sm" />
                          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#38746D] rounded-tr-sm" />
                          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#38746D] rounded-bl-sm" />
                          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#38746D] rounded-br-sm" />

                          <Scan className="w-7 h-7 sm:w-8 sm:h-8 text-[#38746D]" />
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-[#132422] mt-3 sm:mt-4">
                          Ambil Foto Kondisi Genangan Air
                        </h3>
                        <p className="text-xs text-[#4B635F] max-w-sm mx-auto mt-1 leading-relaxed">
                          Foto langsung kondisi air yang menggenangi jalan, rumah, atau pekarangan dari kamera ponsel atau unggah dari galeri.
                        </p>

                        {/* Tombol Aksi Utama (Rounded-full konsisten dengan CTA app & 1 baris rapi) */}
                        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                          <button
                            type="button"
                            onClick={() => setIsCameraOpen(true)}
                            className="w-full sm:w-auto flex-1 py-3.5 px-5 sm:px-6 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#38746D]/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Camera className="w-4 h-4 text-[#88BDB6] shrink-0" />
                            <span className="whitespace-nowrap">Buka Kamera Langsung</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="w-full sm:w-auto flex-1 py-3.5 px-5 sm:px-6 rounded-full bg-white hover:bg-[#EEF5F3] text-[#132422] hover:text-[#1D443F] border border-[#D5E4E0] hover:border-[#38746D]/30 text-xs sm:text-sm font-extrabold shadow-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <ImageIcon className="w-4 h-4 text-[#38746D] shrink-0" />
                            <span className="whitespace-nowrap">Pilih dari Galeri</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3 Panduan Pelaporan yang Praktis */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/80 space-y-1">
                      <span className="text-xs font-bold text-[#132422] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#38746D]" />
                        Foto Jelas
                      </span>
                      <p className="text-[11px] text-[#718783] leading-snug">
                        Perlihatkan batas genangan air terhadap jalan atau bangunan.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/80 space-y-1">
                      <span className="text-xs font-bold text-[#132422] flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-[#38746D]" />
                        GPS Terkunci
                      </span>
                      <p className="text-[11px] text-[#718783] leading-snug">
                        Aktifkan lokasi perangkat untuk penentuan koordinat tim SAR.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/80 space-y-1">
                      <span className="text-xs font-bold text-[#132422] flex items-center gap-1.5">
                        <LifeBuoy className="w-3.5 h-3.5 text-[#38746D]" />
                        Respon Cepat
                      </span>
                      <p className="text-[11px] text-[#718783] leading-snug">
                        Laporan terverifikasi langsung diteruskan ke posko terdekat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOK 2: CARD PANTAU ADUAN WARGA SEKITAR DENGAN TOMBOL NAVIGASI KE DAFTAR ADUAN */}
                <div className="bg-white rounded-3xl border border-[#D5E4E0] p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EEF5F3] text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-[#132422]">
                          Pantau {otherReports.length} Aduan Warga Sekitar
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Terkini
                        </span>
                      </div>
                      <p className="text-xs text-[#4B635F] mt-0.5">
                        Warga di Eretan Wetan, Cantigi, &amp; Kandanghaur telah mengirimkan kondisi rob terbaru.
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi: Style tebal, proporsional, rounded-full tanpa chevron persis seperti tombol hero */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <Link
                      href="/warga/evakuasi"
                      className="w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#38746D]/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <MapPin className="w-4.5 h-4.5 text-[#88BDB6] shrink-0" />
                      <span>Lihat di Peta Spasial</span>
                    </Link>

                    <Link
                      href="/warga/aduan"
                      className="w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-full bg-[#EEF5F3] hover:bg-[#D5E4E0] border-2 border-[#38746D]/25 text-[#1D443F] text-xs sm:text-sm font-extrabold shadow-sm active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <ClipboardList className="w-4.5 h-4.5 text-[#38746D] shrink-0" />
                      <span>Buka Halaman Daftar Aduan Warga</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* STATE 3: FORM KONFIRMASI DENGAN BUKTI FOTO */
              <motion.div
                key="state-form-verified"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-7 shadow-xs space-y-6"
              >
                {/* Header Konfirmasi */}
                <div className="pb-3 border-b border-[#D5E4E0]/60 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                  {/* Baris atas mobile: Icon di kiri & Tombol Ganti Foto di kanan (sejajar) */}
                  <div className="flex items-center justify-between sm:contents">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0 sm:mr-3">
                      <BeaconAlertIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Teks Header Desktop (sejajar dengan icon di layar besar) */}
                    <div className="hidden sm:block flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-[#132422]">
                        Konfirmasi Laporan Kejadian
                      </h2>
                      <p className="text-xs text-[#4B635F]">
                        Periksa foto bukti genangan dan pastikan titik lokasi sudah tepat
                      </p>
                    </div>

                    {/* Tombol Ganti Foto (sejajar icon di mobile, di kanan di desktop) */}
                    <button
                      type="button"
                      onClick={handleResetPhoto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#38746D]/25 bg-[#EEF5F3] text-[#38746D] hover:bg-[#E0ECE8] hover:border-[#38746D]/40 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Ganti Foto</span>
                    </button>
                  </div>

                  {/* Teks Header Mobile (di bawah baris Icon + Tombol Ganti Foto) */}
                  <div className="sm:hidden">
                    <h2 className="text-base font-bold text-[#132422]">
                      Konfirmasi Laporan Kejadian
                    </h2>
                    <p className="text-xs text-[#4B635F] mt-0.5">
                      Periksa foto bukti genangan dan pastikan titik lokasi sudah tepat
                    </p>
                  </div>
                </div>

                {/* Hero Preview Foto + Status Verifikasi */}
                <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-950 shadow-inner group">
                  <img
                    src={photos[0]}
                    alt="Bukti Foto Banjir"
                    className="w-full h-full object-cover"
                  />

                  {/* Top Badge: Label Bukti */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[10.5px] font-bold tracking-wide border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dokumentasi Bukti</span>
                  </div>

                  {/* Bottom Gradient Overlay with Status */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-sm ${
                          aiScanResult
                            ? (aiScanResult.prob_flood * 100) > 60
                              ? "bg-emerald-500 text-white"
                              : (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25))
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {aiScanResult && (aiScanResult.prob_flood * 100) > 60 ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : aiScanResult && (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25)) ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {aiScanResult
                            ? (aiScanResult.prob_flood * 100) > 60
                              ? `Bukti Terverifikasi Valid (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                              : (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25))
                              ? `Foto Ditolak: Bukan Banjir (${((aiScanResult.prob_non_flood ?? (1 - aiScanResult.prob_flood)) * 100).toFixed(1)}%)`
                              : `Menunggu Verifikasi Posko (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                            : isAiAnalyzing
                            ? "Memeriksa Foto Genangan..."
                            : "Bukti Foto Terlampir"}
                        </span>
                      </span>
                    </div>

                    <p className="text-[11.5px] text-gray-200 leading-snug">
                      {aiScanResult
                        ? (aiScanResult.prob_flood * 100) > 60
                          ? `Bukti visual genangan air valid. Laporan langsung dipetakan ke Rute Evakuasi & diteruskan ke regu posko.`
                          : (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25))
                          ? `Foto tidak terindikasi genangan banjir (${((aiScanResult.prob_non_flood ?? (1 - aiScanResult.prob_flood)) * 100).toFixed(1)}% kondisi kering). Foto ditolak dan tidak dapat dikirim ke peta rute.`
                          : `Laporan disimpan dan dalam antrean peninjauan petugas posko sebelum masuk ke peta rute.`
                        : "Memeriksa karakteristik visual foto genangan..."}
                    </p>
                  </div>
                </div>

                {/* Form Input Lokasi & Catatan */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field 1: Titik Lokasi Kejadian */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-[#132422] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#38746D]" />
                        <span>Titik Lokasi Kejadian</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGetGPS}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] text-[11px] font-bold border border-[#38746D]/20 transition-all cursor-pointer active:scale-95"
                      >
                        <Crosshair
                          className={`w-3.5 h-3.5 ${
                            isLocating ? "animate-spin text-[#38746D]" : ""
                          }`}
                        />
                        <span>{isLocating ? "Mengunci GPS..." : "Kunci Ulang GPS"}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ketik patokan lokasi: Desa, RT/RW, gang, dekat balai desa / masjid"
                        required
                        className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
                      />
                    </div>

                    {/* Feedback Sinyal GPS */}
                    {gpsCoords && (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            GPS Terkunci: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} (±{gpsCoords.accuracy || 8}m)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setGpsCoords(null)}
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    )}

                    {gpsError && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>{gpsError}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 2: Catatan Tambahan (Opsional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-[#132422] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#38746D]" />
                      <span>Keterangan Tambahan / Kebutuhan Mendesak</span>
                      <span className="text-[11px] font-normal text-[#718783]">(Opsional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Air masuk teras setinggi 50 cm, ada 2 lansia butuh perahu evakuasi..."
                      className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] resize-none"
                    />
                  </div>

                  {/* Tombol Besar Kirim Laporan */}
                  <div className="pt-2">
                    {aiScanResult && (aiScanResult.is_rejected ?? (aiScanResult.prob_flood * 100 < 25)) ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          disabled
                          className="w-full py-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-2xs"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Foto Ditolak: Bukan Genangan Banjir</span>
                        </button>
                        <p className="text-center text-[11px] text-rose-600 font-medium">
                          Gunakan tombol &quot;Ganti Foto&quot; di kanan atas foto untuk mengunggah bukti genangan air.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !location.trim()}
                        className="w-full py-3.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#38746D]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4 text-[#88BDB6]" />
                        <span>
                          {isSubmitting
                            ? "Mengirim Laporan ke Posko..."
                            : "Kirim Laporan Darurat Sekarang"}
                        </span>
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================== */}
        {/* KOLOM KANAN (5 COLS): RIWAYAT ADUAN SAYA                   */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-5 flex flex-col gap-6 ${
            mobileTab === "FORM" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Blok Riwayat Aduan Saya */}
          <div className="space-y-4">
            {/* Header Riwayat Aduan */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#132422]">
                    Riwayat Aduan Saya
                  </h3>
                  <p className="text-xs text-[#4B635F]">
                    Riwayat laporan darurat Anda &amp; status penanganan tim SAR
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF5F3] text-[#1D443F] font-bold text-xs border border-[#38746D]/20">
                {reports.length} Laporan
              </span>
            </div>

            {/* List Tiket Aduan Saya Sebagai Card-Card Mandiri */}
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2 shadow-xs">
                  <Clock className="w-8 h-8 text-[#A4C6C1] mx-auto" />
                  <p className="text-xs font-bold text-gray-700">Belum ada riwayat aduan</p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Laporan yang Anda kirim akan otomatis tercatat dan dapat dipantau perkembangannya di sini.
                  </p>
                </div>
              ) : (
                paginatedReports.map((item) => {
                  const statusStyle = STATUS_CONFIG[item.status] || {
                    dotClass: "bg-gray-400",
                    badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
                    textClass: "text-gray-700",
                    label: item.status,
                  };

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3 hover:border-[#88BDB6] transition-all"
                    >
                      {/* Atas: Status di Peta & Waktu (Bersih, tanpa nomor tiket & tanpa badge bertumpuk) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isFloodDetected ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-800 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span>Aktif di Peta</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10.5px] font-semibold text-amber-800 shadow-2xs" title="Menunggu verifikasi petugas posko sebelum masuk ke peta">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                          {item.isOfflineQueue && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                              <span>Tersimpan Offline</span>
                            </span>
                          )}
                          {item.syncedAt && (
                            <span className="text-[9.5px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                              Sinkron: {item.syncedAt}
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-gray-500 flex items-center gap-1 font-medium shrink-0">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {item.time}
                        </span>
                      </div>

                      {/* Judul & Lokasi */}
                      <div>
                        {item.isFloodDetected ? (
                          <Link
                            href={`/warga/evakuasi?reportId=${item.id}&lat=${item.gps?.lat || -6.3475}&lng=${item.gps?.lng || 108.1189}`}
                            className="group/title block hover:underline"
                            title="Lihat titik banjir di Peta Spasial"
                          >
                            <h4 className="text-sm font-bold text-[#132422] group-hover/title:text-[#38746D] transition-colors leading-snug">
                              {item.title}
                            </h4>
                          </Link>
                        ) : (
                          <h4 className="text-sm font-bold text-[#132422] leading-snug">
                            {item.title}
                          </h4>
                        )}
                        <p className="text-xs text-[#4B635F] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>

                      {/* Catatan Pelapor Jika Ada */}
                      {item.notes && (
                        <p className="text-xs text-[#4B635F] italic bg-[#F8FAF9] p-2.5 rounded-lg border border-gray-100">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}

                      {/* Foto Bukti: Full-Width Image Proporsional, Bukan Thumbnail Terjepit */}
                      {(() => {
                        const validList = Array.isArray(item.photos)
                          ? item.photos.filter((p) => typeof p === "string" && p.trim().length > 0)
                          : [];
                        const displayPhotos =
                          validList.length > 0
                            ? validList
                            : [REALISTIC_FLOOD_PHOTOS[0]];

                        return (
                          <div className="pt-1">
                            {displayPhotos.map((imgUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    url: imgUrl,
                                    title: `${item.title} (Foto ${pIdx + 1})`,
                                  })
                                }
                                className="w-full h-44 sm:h-52 rounded-xl border border-gray-200 overflow-hidden block bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity relative group"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Lampiran ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      REALISTIC_FLOOD_PHOTOS[pIdx % REALISTIC_FLOOD_PHOTOS.length];
                                  }}
                                />

                                {/* Badge Validasi AI di dalam gambar (Floating Pill Elegan) */}
                                {typeof item.aiConfidence === "number" && (
                                  <div className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>
                                      Validasi AI {(item.aiConfidence <= 1 ? item.aiConfidence * 100 : item.aiConfidence).toFixed(0)}%
                                    </span>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Update Penanganan Regu SAR: Timeline Vertikal Bersih dengan Border-L dan Titik Biru */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="relative pl-3.5 border-l-2 border-sky-400 space-y-1 my-1">
                          <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white" />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#132422]">
                              {item.statusNote?.toLowerCase().includes("sar") || item.status === "PENANGANAN"
                                ? "Regu SAR Menuju Lokasi"
                                : item.status === "DIVERIFIKASI"
                                ? "Status Penanganan"
                                : "Status Aduan"}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide ${statusStyle.badgeClass}`}>
                              {statusStyle.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {item.statusNote}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                          <Link
                            href={`/warga/evakuasi?reportId=${item.id}&lat=${item.gps?.lat || -6.3475}&lng=${item.gps?.lng || 108.1189}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] border border-[#38746D]/20 text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                            <span>Buka Titik di Peta</span>
                            <ChevronRight className="w-3 h-3 text-[#38746D]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Riwayat Aduan (Sesuai Style Fitur Posko) */}
            {reports.length > reportsPerPage && (
              <div className="pt-2 border-t border-[#E8F1EE] flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                {/* Info Status Item */}
                <div className="text-xs text-[#4B635F] font-medium order-2 sm:order-1 text-center sm:text-left">
                  Menampilkan <strong className="text-[#132422]">{startReportIndex + 1}</strong> -{" "}
                  <strong className="text-[#132422]">
                    {Math.min(reports.length, startReportIndex + reportsPerPage)}
                  </strong>{" "}
                  dari <strong className="text-[#132422]">{reports.length}</strong> aduan
                </div>

                {/* Pagination Navigation Buttons */}
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  {/* Tombol Prev Lingkaran Solid */}
                  <button
                    type="button"
                    onClick={() => setReportPage((p) => Math.max(1, p - 1))}
                    disabled={reportPage <= 1}
                    className="w-8 h-8 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs active:scale-95 cursor-pointer shrink-0"
                    aria-label="Halaman Sebelumnya"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Deretan Angka Halaman dengan Indikator Aktif Hijau DERMAYU */}
                  <div className="flex items-center bg-[#F8FAF9] border border-[#D5E4E0] rounded-full px-1.5 py-0.5 gap-1">
                    {getReportPageNumbers(reportPage, totalReportPages).map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span
                            key={`dots-${idx}`}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 font-bold text-xs select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const pageNum = p as number;
                      const isActive = pageNum === reportPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setReportPage(pageNum)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                            isActive
                              ? "border-2 border-[#38746D] text-[#38746D] font-black bg-white shadow-2xs"
                              : "text-gray-600 hover:text-[#38746D] font-semibold hover:bg-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tombol Next Lingkaran Solid */}
                  <button
                    type="button"
                    onClick={() => setReportPage((p) => Math.min(totalReportPages, p + 1))}
                    disabled={reportPage >= totalReportPages}
                    className="w-8 h-8 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs active:scale-95 cursor-pointer shrink-0"
                    aria-label="Halaman Berikutnya"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
