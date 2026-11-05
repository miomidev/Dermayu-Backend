"use client";

import { useState, useEffect, useRef } from "react";
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
  PhoneCall,
  Crosshair,
  RefreshCw,
  Image as ImageIcon,
  Scan,
  FileText,
  Building2,
  LifeBuoy,
  Users,
  ThumbsUp,
  Share2,
  Eye,
  Check,
  ChevronRight,
} from "lucide-react";
import { FullscreenCameraModal } from "@/components/dashboard/FullscreenCameraModal";
import { AiScannerOverlay, type AiScanResult } from "@/components/dashboard/AiScannerOverlay";
import { BeaconAlertIcon } from "@/components/ui/Icons";

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
  status: "DITERIMA" | "DIVERIFIKASI" | "PENANGANAN" | "SELESAI" | string;
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
    label: "Terverifikasi Siaga Posko",
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

const QUICK_LOCATIONS = [
  "Eretan Wetan (Kandanghaur)",
  "Eretan Kulon (Kandanghaur)",
  "Ilir (Kandanghaur)",
  "Cantigi Kulon",
  "Cantigi Wetan",
  "Pasekan",
  "Karangsong (Indramayu)",
  "Limbangan (Juntinyuat)",
];

const initialReports: ReportTicket[] = [
  {
    id: "DMY-20261102-8912",
    category: "Banjir / Rob Pesisir",
    categoryCode: "FLOOD",
    title: "Air pasang rob masuk pekarangan & pemukiman setinggi 60 cm",
    location: "Blok Karanganyar RT 04 / RW 02, Desa Eretan Wetan",
    time: "Hari ini, 13:05 WIB",
    status: "PENANGANAN",
    statusNote:
      "Regu SAR LCR 02 BPBD Indramayu telah meluncur membawa 2 perahu evakuasi menuju lokasi.",
    severity: "HIGH",
    waterLevel: "Setinggi Lutut (60 cm)",
    photos: [
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    ],
    aiConfidence: 0.94,
    gps: { lat: -6.3475, lng: 108.1189, accuracy: 6 },
  },
  {
    id: "DMY-20261101-7421",
    category: "Tanggul Kritis / Jebol",
    categoryCode: "LEVEE",
    title: "Rembesan tanggul tanah saluran sekunder dekat tambak",
    location: "Blok Tanggul RT 02 / RW 01, Desa Cantigi Kulon",
    time: "Kemarin, 17:20 WIB",
    status: "SELESAI",
    statusNote:
      "Penambalan darurat 150 karung pasir telah tuntas dipasang oleh tim relawan dan aparat desa.",
    severity: "MEDIUM",
    waterLevel: "Semata Kaki (35 cm)",
    photos: [
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    ],
    aiConfidence: 0.91,
    gps: { lat: -6.2842, lng: 108.2635, accuracy: 12 },
  },
];

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
  },
];

const STORAGE_KEY = "dermayu_user_reports";

export default function WargaLaporPage() {
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Responsive Mobile Tab Switcher: "FORM" | "HISTORY" (Active only on small screens < lg)
  const [mobileTab, setMobileTab] = useState<"FORM" | "HISTORY">("FORM");

  // Feed Tab Switcher for Card 2: "OTHERS" (Warga Sekitar) | "MY" (Aduan Saya)
  const [feedTab, setFeedTab] = useState<"OTHERS" | "MY">("OTHERS");
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
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState<string | null>(null);

  // Reports List State
  const [reports, setReports] = useState<ReportTicket[]>([]);

  // 1. Initial LocalStorage Load & Synchronization
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
          return;
        }
      }
      setReports(initialReports);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
    } catch {
      setReports(initialReports);
    }
  }, []);

  const saveReportsToStorage = (updated: ReportTicket[]) => {
    setReports(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
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

  // Trigger verification inference via Next.js proxy
  const triggerAiInference = async (dataUrl: string, fileObj?: File) => {
    setIsAiAnalyzing(true);
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

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAiScanResult(json.data);
          return;
        }
      }
      setAiScanResult(null);
    } catch (err) {
      console.warn("AI scan warning:", err);
      setAiScanResult(null);
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      alert("Mohon tentukan titik lokasi kejadian (gunakan GPS atau ketik patokan lokasi).");
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    const timeFormatted = `Hari ini, ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;

    const isVerified = aiScanResult?.is_flood === true;

    const pctStr = aiScanResult
      ? ` (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
      : "";
    const ticketStatus = isVerified ? "DIVERIFIKASI" : "DITERIMA";
    const statusNote = isVerified
      ? `Bukti foto terkonfirmasi valid${pctStr}. Koordinat dipetakan dan diteruskan ke posko siaga terdekat.`
      : aiScanResult?.label === "review"
      ? `Hasil verifikasi foto berada di ambang batas${pctStr}. Menunggu peninjauan visual petugas.`
      : "Laporan telah masuk ke sistem. Menunggu peninjauan visual oleh petugas siaga BPBD Indramayu.";

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
      photos: photos.length > 0 ? photos : undefined,
      notes: notes.trim() || undefined,
      aiConfidence: aiScanResult?.prob_flood,
      gps: gpsCoords || {
        lat: -6.3475 + (Math.random() - 0.5) * 0.02,
        lng: 108.1189 + (Math.random() - 0.5) * 0.02,
        accuracy: 10,
      },
    };

    const updated = [newTicket, ...reports];
    saveReportsToStorage(updated);

    setNewlyCreatedTicket(ticketCode);
    setIsSubmitting(false);

    // Reset Form
    setLocation("");
    setGpsCoords(null);
    setNotes("");
    setPhotos([]);
    setAiScanResult(null);

    // Otomatis pindah ke tab Aduan Saya agar warga langsung melihat tiket baru
    setFeedTab("MY");
    setMobileTab("HISTORY");
  };

  const isFormActive = photos.length > 0;

  return (
    <div className="space-y-6 text-left w-full min-w-0">
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

      {/* Overlay Animasi Verifikasi Foto */}
      <AiScannerOverlay
        isOpen={isAiScanning}
        photoUrl={pendingPhoto}
        scanResult={aiScanResult}
        isAnalyzing={isAiAnalyzing}
        onScanComplete={handleScanComplete}
      />

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

      {/* ALERT BANNER TIKET BERHASIL DIBUAT */}
      <AnimatePresence>
        {newlyCreatedTicket && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  Laporan Berhasil Diterbitkan: Tiket #{newlyCreatedTicket}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Data telah masuk ke sistem kendali Pusdalops BPBD Indramayu dan diteruskan ke posko siaga terdekat.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewlyCreatedTicket(null)}
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. TAB NAVIGASI KHUSUS MOBILE (< LG)                         */}
      {/* ============================================================ */}
      <div className="flex items-center p-1 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("FORM")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === "FORM"
              ? "bg-[#1D443F] text-white shadow-xs"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Buat Laporan</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("HISTORY")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === "HISTORY"
              ? "bg-[#1D443F] text-white shadow-xs"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pantauan &amp; Aduan</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              mobileTab === "HISTORY"
                ? "bg-white/20 text-white"
                : "bg-[#EEF5F3] text-[#1D443F]"
            }`}
          >
            {reports.length + otherReports.length}
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
              /* STATE 1: PENGAMBILAN BUKTI FOTO */
              <motion.div
                key="state-scanner-hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-8 shadow-xs space-y-6"
              >
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

                {/* Dropzone Kamera */}
                <div className="relative rounded-2xl border-2 border-dashed border-[#38746D]/30 bg-[#F8FAF9] p-8 sm:p-10 text-center hover:bg-[#EEF5F3]/50 transition-all group">
                  <div className="relative w-20 h-20 mx-auto rounded-2xl bg-white border border-[#D5E4E0] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#38746D] rounded-tl-sm" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#38746D] rounded-tr-sm" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#38746D] rounded-bl-sm" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#38746D] rounded-br-sm" />

                    <Scan className="w-8 h-8 text-[#38746D]" />
                  </div>

                  <h3 className="text-base font-bold text-[#132422] mt-4">
                    Ambil Foto Kondisi Genangan Air
                  </h3>
                  <p className="text-xs text-[#4B635F] max-w-sm mx-auto mt-1 leading-relaxed">
                    Foto langsung kondisi air yang menggenangi jalan, rumah, atau pekarangan dari kamera ponsel atau unggah dari galeri.
                  </p>

                  {/* Tombol Aksi Utama */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-[#1D443F] hover:bg-[#255851] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-[#88BDB6]" />
                      <span>Buka Kamera Langsung</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-white hover:bg-gray-50 text-[#132422] border border-[#D5E4E0] text-xs sm:text-sm font-bold shadow-2xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4 text-[#38746D]" />
                      <span>Pilih dari Galeri</span>
                    </button>
                  </div>
                </div>

                {/* Banner Akses Cepat Pantau Aduan Warga Sekitar */}
                <div className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#38746D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0 shadow-2xs">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#132422]">
                        Pantau 4 Aduan Warga Sekitar
                      </h4>
                      <p className="text-[11px] text-[#4B635F]">
                        Warga di Eretan Wetan, Cantigi, &amp; Kandanghaur telah mengirimkan kondisi rob terbaru.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedTab("OTHERS");
                      setMobileTab("HISTORY");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D443F] hover:bg-[#255851] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    <span>Lihat Aduan Warga</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#88BDB6]" />
                  </button>
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
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E4E0]/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#38746D] border border-[#38746D]/15 flex items-center justify-center shrink-0">
                      <BeaconAlertIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#132422]">
                        Konfirmasi Laporan Kejadian
                      </h2>
                      <p className="text-xs text-[#4B635F]">
                        Periksa foto bukti genangan dan pastikan titik lokasi sudah tepat
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ganti Foto</span>
                  </button>
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
                            ? aiScanResult.is_flood
                              ? "bg-emerald-500 text-white"
                              : aiScanResult.label === "review"
                              ? "bg-amber-500 text-white"
                              : "bg-sky-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {aiScanResult?.is_flood ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : aiScanResult?.label === "review" ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {aiScanResult
                            ? aiScanResult.is_flood
                              ? `Genangan Terkonfirmasi (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                              : aiScanResult.label === "review"
                              ? `Perlu Peninjauan Petugas (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                              : `Indikasi Bukan Genangan (${(aiScanResult.prob_non_flood * 100).toFixed(1)}%)`
                            : isAiAnalyzing
                            ? "Memeriksa Foto Genangan..."
                            : "Bukti Foto Terlampir"}
                        </span>
                      </span>
                    </div>

                    <p className="text-[11.5px] text-gray-200 leading-snug">
                      {aiScanResult
                        ? aiScanResult.is_flood
                          ? `Bukti visual genangan air terkonfirmasi valid (${(aiScanResult.prob_flood * 100).toFixed(1)}%). Laporan siap dikirim ke posko siaga.`
                          : aiScanResult.label === "review"
                          ? `Kondisi air memerlukan peninjauan lanjutan (${(aiScanResult.prob_flood * 100).toFixed(1)}%). Petugas akan memverifikasi visual.`
                          : `Tingkat keyakinan bukan genangan (${(aiScanResult.prob_non_flood * 100).toFixed(1)}%). Tetap dapat dikirim bila lokasi darurat.`
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

                    {/* Pilihan Cepat Desa Rawan */}
                    <div className="pt-1 space-y-1.5">
                      <span className="text-[10.5px] text-[#718783] block font-semibold">
                        Pilihan cepat desa / wilayah rawan:
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap scrollbar-none snap-x touch-pan-x">
                        {QUICK_LOCATIONS.map((loc) => (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => {
                              if (!location.includes(loc)) {
                                setLocation((prev) =>
                                  prev ? `${prev}, ${loc}` : loc
                                );
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] text-[#4B635F] hover:text-[#1D443F] transition-colors cursor-pointer shrink-0 snap-start active:scale-95 whitespace-nowrap"
                          >
                            + {loc}
                          </button>
                        ))}
                      </div>
                    </div>
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
                    <button
                      type="submit"
                      disabled={isSubmitting || !location.trim()}
                      className="w-full py-3.5 rounded-xl bg-[#1D443F] hover:bg-[#255851] active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1D443F]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-[#88BDB6]" />
                      <span>
                        {isSubmitting
                          ? "Mengirim Laporan ke Posko..."
                          : "Kirim Laporan Darurat Sekarang"}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================== */}
        {/* KOLOM KANAN (5 COLS): POSKO SIAGA & PANTAUAN ADUAN WARGA   */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            mobileTab === "FORM" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Card 1: Posko Siaga & Kontak Bantuan Darurat */}
          <div className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4E0]/60">
              <span className="text-xs font-bold text-[#132422] uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#38746D]" />
                Posko Siaga Bencana Terdekat
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-extrabold">
                ● 24 Jam Siaga
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#132422]">
                    Posko Utama Eretan Wetan
                  </h4>
                  <p className="text-[11px] text-[#4B635F] mt-0.5">
                    Balai Desa Eretan Wetan, Kandanghaur
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  Siaga SAR
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0]/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#132422]">
                    Posko Wilayah Cantigi
                  </h4>
                  <p className="text-[11px] text-[#4B635F] mt-0.5">
                    Kantor Kecamatan Cantigi, Indramayu
                  </p>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                  Posko Logistik
                </span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="tel:112"
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>Hotline 112 Bebas Pulsa (Layanan Darurat)</span>
              </a>
            </div>
          </div>

          {/* Card 2: Pantauan Aduan Warga & Riwayat Aduan Saya */}
          <div className="bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E4E0]/60">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#132422]">
                  Pantauan &amp; Aduan Warga
                </h3>
                <p className="text-xs text-[#4B635F]">
                  Laporan masuk warga Indramayu &amp; status tindak lanjut SAR
                </p>
              </div>
            </div>

            {/* Sub-tab Switcher: Warga Sekitar vs Aduan Saya */}
            <div className="flex items-center p-1 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0]">
              <button
                type="button"
                onClick={() => setFeedTab("OTHERS")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  feedTab === "OTHERS"
                    ? "bg-white text-[#1D443F] shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#38746D]" />
                <span>Warga Sekitar</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    feedTab === "OTHERS"
                      ? "bg-[#EEF5F3] text-[#1D443F]"
                      : "bg-white/80 text-[#4B635F]"
                  }`}
                >
                  {otherReports.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFeedTab("MY")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  feedTab === "MY"
                    ? "bg-white text-[#1D443F] shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#38746D]" />
                <span>Aduan Saya</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    feedTab === "MY"
                      ? "bg-[#EEF5F3] text-[#1D443F]"
                      : "bg-white/80 text-[#4B635F]"
                  }`}
                >
                  {reports.length}
                </span>
              </button>
            </div>

            {/* TAB CONTENT: WARGA SEKITAR */}
            {feedTab === "OTHERS" && (
              <div className="space-y-3.5">
                {otherReports.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Users className="w-8 h-8 text-[#A4C6C1] mx-auto" />
                    <p className="text-xs font-bold text-gray-700">Belum ada aduan warga terkini</p>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                      Laporan dari warga lain di sekitar Indramayu akan muncul di sini secara real-time.
                    </p>
                  </div>
                ) : (
                  otherReports.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] space-y-3 hover:border-[#88BDB6] transition-all"
                    >
                      {/* Atas: Profil Pelapor & Waktu */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1D443F] text-[#88BDB6] text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                            {item.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#132422]">
                                {item.authorName}
                              </span>
                              <span
                                className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${
                                  item.authorRole === "Relawan Tagana"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : item.authorRole === "Aparat Desa"
                                    ? "bg-sky-100 text-sky-800 border border-sky-200"
                                    : "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/15"
                                }`}
                              >
                                {item.authorRole}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-[#718783] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                              <span className="truncate">{item.authorVillage}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10.5px] text-gray-500 flex items-center gap-1 shrink-0 font-medium">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {item.timeAgo}
                        </span>
                      </div>

                      {/* Judul & Keterangan Aduan */}
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#132422] leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11.5px] text-[#4B635F] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Foto Thumbnail & Info Ketinggian Air */}
                      <div className="flex items-start gap-3">
                        {item.photoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({ url: item.photoUrl, title: item.title })
                            }
                            className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 group cursor-pointer"
                          >
                            <img
                              src={item.photoUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        )}

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[10.5px] font-bold">
                              <Waves className="w-3 h-3 text-sky-600" />
                              {item.waterLevelText}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {(item.aiConfidence * 100).toFixed(0)}% Valid
                            </span>
                          </div>

                          <p className="text-[10.5px] text-[#718783] line-clamp-2">
                            Patokan: {item.location}
                          </p>
                        </div>
                      </div>

                      {/* Status Tindak Lanjut BPBD */}
                      <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.status === "PENANGANAN"
                                ? "bg-sky-500 animate-pulse"
                                : item.status === "SELESAI"
                                ? "bg-teal-600"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-[11px] font-bold text-[#132422]">
                            {item.status === "PENANGANAN"
                              ? "Regu SAR Menuju Lokasi"
                              : item.status === "SELESAI"
                              ? "Tindakan Selesai"
                              : "Terverifikasi Posko Siaga"}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-gray-600 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">
                          {item.statusNote}
                        </p>
                      </div>

                      {/* Action Interaktif: Konfirmasi Terdampak Serupa & Bagikan */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSimilar(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            item.isUpvoted
                              ? "bg-[#1D443F] text-white shadow-2xs"
                              : "bg-white hover:bg-emerald-50 text-[#1D443F] border border-[#D5E4E0]"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              item.isUpvoted ? "text-[#88BDB6]" : "text-[#38746D]"
                            }`}
                          />
                          <span>Terdampak Juga</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                              item.isUpvoted
                                ? "bg-white/20 text-white"
                                : "bg-[#EEF5F3] text-[#1D443F]"
                            }`}
                          >
                            {item.similarCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareReport(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-[#D5E4E0] text-gray-600 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {copiedReportId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-[#38746D]" />
                              <span>Bagikan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: ADUAN SAYA */}
            {feedTab === "MY" && (
              <div className="space-y-3.5">
                {reports.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Clock className="w-8 h-8 text-[#A4C6C1] mx-auto" />
                    <p className="text-xs font-bold text-gray-700">Belum ada riwayat aduan</p>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                      Laporan yang Anda kirim akan otomatis tercatat dan dapat dipantau perkembangannya di sini.
                    </p>
                  </div>
                ) : (
                  reports.map((item) => {
                    const statusStyle = STATUS_CONFIG[item.status] || {
                      dotClass: "bg-gray-400",
                      badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
                      textClass: "text-gray-700",
                      label: item.status,
                    };

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] space-y-2.5 hover:border-[#88BDB6] transition-colors"
                      >
                        {/* Atas: Tiket ID, Validasi % & Waktu */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-extrabold text-[#1D443F] bg-white px-2 py-0.5 rounded-lg border border-[#38746D]/20">
                              {item.id}
                            </span>
                            {typeof item.aiConfidence === "number" && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {(item.aiConfidence * 100).toFixed(0)}% Valid
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] text-gray-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {item.time}
                          </span>
                        </div>

                        {/* Judul & Lokasi */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#132422] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#4B635F] flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        </div>

                        {/* Catatan Pelapor Jika Ada */}
                        {item.notes && (
                          <p className="text-[11px] text-[#4B635F] italic bg-white p-2 rounded-xl border border-gray-100">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}

                        {/* Thumbnail Foto (Jika Ada) */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto pt-0.5">
                            {item.photos.map((imgUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    url: imgUrl,
                                    title: `${item.title} (Foto ${pIdx + 1})`,
                                  })
                                }
                                className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Lampiran ${pIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Status Timeline Progress */}
                        <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusStyle.dotClass}`} />
                            <span className="text-[11px] font-bold text-[#132422]">
                              {statusStyle.label}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-gray-600 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">
                            {item.statusNote}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
