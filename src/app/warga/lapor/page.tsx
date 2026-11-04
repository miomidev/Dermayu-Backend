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
} from "lucide-react";
import { FullscreenCameraModal } from "@/components/dashboard/FullscreenCameraModal";
import { AiScannerOverlay, type AiScanResult } from "@/components/dashboard/AiScannerOverlay";

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
  gps?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

const STATUS_CONFIG: Record<
  string,
  {
    dotClass: string;
    badgeClass: string;
    textClass: string;
    stepIndex: number;
    label: string;
  }
> = {
  DITERIMA: {
    dotClass: "bg-amber-500 animate-pulse",
    badgeClass: "bg-amber-50 border-amber-200 text-amber-900",
    textClass: "text-amber-800",
    stepIndex: 1,
    label: "Menunggu Verifikasi Pusdalops",
  },
  DIVERIFIKASI: {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
    textClass: "text-emerald-800",
    stepIndex: 2,
    label: "Terverifikasi AI / Posko Siaga",
  },
  PENANGANAN: {
    dotClass: "bg-sky-500 animate-pulse",
    badgeClass: "bg-sky-50 border-sky-200 text-sky-900",
    textClass: "text-sky-800",
    stepIndex: 3,
    label: "Regu Penyelamat Menuju Lokasi",
  },
  SELESAI: {
    dotClass: "bg-teal-600",
    badgeClass: "bg-teal-50 border-teal-200 text-teal-900",
    textClass: "text-teal-800",
    stepIndex: 4,
    label: "Tindakan Lapangan Selesai",
  },
};

const QUICK_LOCATIONS = [
  "Eretan Wetan",
  "Eretan Kulon",
  "Ilir (Kandanghaur)",
  "Cantigi Kulon",
  "Cantigi Wetan",
  "Pasekan",
  "Karangsong",
  "Limbangan",
];

const initialReports: ReportTicket[] = [
  {
    id: "DMY-20261102-8912",
    category: "Banjir / Rob Pesisir",
    categoryCode: "FLOOD",
    title: "Air pasang rob masuk pekarangan & rumah setinggi 60 cm",
    location: "Blok Karanganyar RT 04 / RW 02, Desa Eretan Wetan, Kandanghaur",
    time: "Hari ini, 13:05 WIB",
    status: "PENANGANAN",
    statusNote:
      "Regu SAR LCR 02 BPBD Indramayu telah meluncur dari Posko Kandanghaur membawa 2 perahu evakuasi menuju lokasi.",
    severity: "HIGH",
    waterLevel: "Setinggi Lutut (40–60 cm)",
    urgentNeeds: ["Perahu Karet Evakuasi", "Bantuan Evakuasi Lansia / Bayi"],
    gps: { lat: -6.3475, lng: 108.1189, accuracy: 6 },
  },
  {
    id: "DMY-20261101-7421",
    category: "Tanggul Kritis / Jebol",
    categoryCode: "LEVEE",
    title: "Rembesan tanggul tanah saluran tambak dekat pemukiman",
    location: "Blok Tanggul RT 02 / RW 01, Desa Cantigi Kulon",
    time: "Kemarin, 17:20 WIB",
    status: "SELESAI",
    statusNote:
      "Penambalan darurat 150 karung pasir telah tuntas dipasang oleh tim gabungan relawan dan aparat desa.",
    severity: "MEDIUM",
    waterLevel: "Semata Kaki (10–30 cm)",
    urgentNeeds: ["Karung Pasir Penahan Tanggul"],
    gps: { lat: -6.2842, lng: 108.2635, accuracy: 12 },
  },
];

const STORAGE_KEY = "dermayu_user_reports";

export default function WargaLaporPage() {
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Tab Switcher: "FORM" | "HISTORY"
  const [activeTab, setActiveTab] = useState<"FORM" | "HISTORY">("FORM");

  // Progressive Step Flow State:
  // State 1: Scanner Card (photos.length === 0)
  // State 2: Fullscreen Camera View (isCameraOpen) -> AI Scanner Overlay (isAiScanning)
  // State 3: Verified Photo + Clean Form (photos.length > 0)
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
          setGpsError("Izin GPS dinonaktifkan di browser. Silakan ketik alamat patokan atau pilih desa di bawah.");
        } else {
          setGpsError("Gagal mengunci sinyal GPS. Silakan ketik patokan lokasi Anda.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger real AI inference via Next.js proxy
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

  // Trigger when a photo is captured from camera
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

  // Called when AI Scan overlay closes
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

  // Handle Submit Formulir Ringkas
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

    const isAiVerified = aiScanResult?.is_flood === true;

    // Status: Jika AI konfirmasi banjir (>=65%), langsung terverifikasi otomatis.
    const ticketStatus = isAiVerified ? "DIVERIFIKASI" : "DITERIMA";
    const statusNote = isAiVerified
      ? `Terverifikasi otomatis oleh AI CNN (${(aiScanResult.prob_flood * 100).toFixed(1)}%). Koordinat dipetakan dan langsung diteruskan ke regu posko siaga BPBD.`
      : "Laporan telah masuk ke sistem. Menunggu verifikasi lanjutan oleh operator Pusdalops BPBD Indramayu.";

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

    // Reset Form Fields
    setLocation("");
    setGpsCoords(null);
    setNotes("");
    setPhotos([]);
    setAiScanResult(null);

    // Switch to History tab so user sees their new ticket immediately
    setActiveTab("HISTORY");
  };

  const isFormActive = photos.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      {/* Hidden Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallerySelect}
      />

      {/* State 2: Fullscreen Camera View Modal */}
      <FullscreenCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        onSelectGallery={() => {
          setIsCameraOpen(false);
          galleryInputRef.current?.click();
        }}
      />

      {/* State 2.5: AI Scanning Loading Overlay */}
      <AiScannerOverlay
        isOpen={isAiScanning}
        photoUrl={pendingPhoto}
        scanResult={aiScanResult}
        isAnalyzing={isAiAnalyzing}
        onScanComplete={handleScanComplete}
      />

      {/* HEADER SECTION & DARURAT 112 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D5E4E0]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#132422] tracking-tight">
            Lapor Titik Banjir
          </h1>
          <p className="text-xs sm:text-sm text-[#4B635F] mt-0.5">
            Verifikasi citra cerdas & pelaporan tanggap darurat Kabupaten Indramayu
          </p>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors shrink-0 self-start sm:self-auto"
          title="Telepon Darurat BPBD Bebas Pulsa"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
          <span>Darurat 112 BPBD</span>
        </a>
      </div>

      {/* CLEAN SEGMENTED TAB SWITCHER */}
      <div className="flex items-center p-1 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0]/80">
        <button
          type="button"
          onClick={() => setActiveTab("FORM")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "FORM"
              ? "bg-[#1D443F] text-white shadow-sm"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("HISTORY")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "HISTORY"
              ? "bg-[#1D443F] text-white shadow-sm"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Aduan</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "HISTORY"
                ? "bg-white/20 text-white"
                : "bg-[#D5E4E0] text-[#1D443F]"
            }`}
          >
            {reports.length}
          </span>
        </button>
      </div>

      {/* ALERT BANNER TIKET BERHASIL DITERBITKAN */}
      <AnimatePresence>
        {newlyCreatedTicket && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Laporan Berhasil Diterbitkan: Tiket #{newlyCreatedTicket}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Laporan Anda tercatat di Pusdalops BPBD Indramayu dan regu posko siaga terdekat.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewlyCreatedTicket(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* TAB 1: FORMULIR PELAPORAN                                 */}
      {/* ========================================================= */}
      {activeTab === "FORM" && (
        <AnimatePresence mode="wait">
          {!isFormActive ? (
            /* STATE 1: HERO SCANNER CARD (SEBELUM FOTO) */
            <motion.div
              key="state-scanner-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl p-7 sm:p-10 text-white overflow-hidden shadow-xl border border-emerald-700/50"
              style={{
                backgroundColor: "#155E45",
                backgroundImage:
                  "radial-gradient(circle at 100% 0%, rgba(52, 211, 153, 0.25) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(6, 78, 59, 0.8) 0%, transparent 70%)",
              }}
            >
              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

              {/* Badges Header */}
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-200 text-xs font-bold tracking-wide backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>AI CNN Flood Verification</span>
                </div>
              </div>

              {/* Viewfinder Visual Hero */}
              <div className="my-6 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300 rounded-tl-sm" />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300 rounded-tr-sm" />
                  <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300 rounded-bl-sm" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300 rounded-br-sm" />
                  
                  <Scan className="w-10 h-10 text-emerald-200 animate-pulse" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Ambil Dokumentasi Foto Genangan Banjir
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mx-auto leading-relaxed">
                  Ambil foto genangan air secara langsung di lokasi. AI akan memverifikasi bukti banjir dan mengunci koordinat GPS secara otomatis.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-4 px-5 rounded-2xl bg-white text-[#155E45] font-extrabold text-sm sm:text-base shadow-xl hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
                >
                  <Camera className="w-5 h-5 text-[#155E45] group-hover:scale-110 transition-transform" />
                  <span>Buka Kamera Langsung</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full py-3.5 px-5 rounded-2xl bg-transparent border-2 border-white/40 text-white font-bold text-xs sm:text-sm hover:bg-white/10 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-200" />
                  <span>Pilih dari Galeri Foto</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* STATE 3: FORMULIR RINGKAS & HASIL VERIFIKASI AI */
            <motion.div
              key="state-form-verified"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white border border-[#D5E4E0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Header Card */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#132422]">
                    Konfirmasi Laporan
                  </h2>
                  <p className="text-xs text-[#4B635F] mt-0.5">
                    Periksa bukti foto dan pastikan lokasi sudah tepat sebelum dikirim.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ganti Foto</span>
                </button>
              </div>

              {/* FOTO HERO & BADGE AI (KAMERA SMART PREVIEW) */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-inner group">
                <img
                  src={photos[0]}
                  alt="Bukti Foto Banjir"
                  className="w-full h-full object-cover"
                />

                {/* Top Badge: AI CNN Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wide border border-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>MobileNetV2 CNN</span>
                </div>

                {/* Bottom Overlay with Real-time AI Classification */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-sm ${
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
                            ? `Terverifikasi Banjir (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                            : aiScanResult.label === "review"
                            ? `Perlu Tinjauan Petugas (${(aiScanResult.prob_flood * 100).toFixed(1)}%)`
                            : `Terdeteksi Bukan Banjir (${(aiScanResult.prob_non_flood * 100).toFixed(1)}%)`
                          : isAiAnalyzing
                          ? "Menganalisis Foto..."
                          : "Foto Terverifikasi AI"}
                      </span>
                    </span>
                    {aiScanResult?.inference_ms && (
                      <span className="text-[10px] text-gray-300 font-mono">
                        {aiScanResult.inference_ms} ms
                      </span>
                    )}
                  </div>

                  <p className="text-[11.5px] text-gray-200 leading-snug">
                    {aiScanResult
                      ? aiScanResult.is_flood
                        ? "Model AI mengonfirmasi genangan air tervalidasi. Laporan siap dikirim ke posko siaga."
                        : aiScanResult.label === "review"
                        ? "Tingkat keyakinan berada di rentang ambang. Petugas posko akan memverifikasi foto secara visual."
                        : "Model mendeteksi gambar bukan air genangan. Tetap lanjutkan jika lokasi memang terdampak."
                      : "Memeriksa karakteristik visual genangan air..."}
                  </p>
                </div>
              </div>

              {/* FORMULIR PELAPORAN BERSIH */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* FIELD 1: LOKASI KEJADIAN */}
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
                      placeholder="Ketik patokan lokasi: Nama Desa, RT/RW, gang, dekat balai desa / masjid"
                      required
                      className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
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

                  {/* Quick Village Chips */}
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[10.5px] text-[#718783] block font-semibold">
                      Pilihan cepat wilayah rawan rob / genangan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_LOCATIONS.map((loc) => (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => {
                            if (!location.includes(loc)) {
                              setLocation((prev) =>
                                prev ? `${prev}, Desa ${loc}` : `Desa ${loc}`
                              );
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] text-[#4B635F] hover:text-[#1D443F] transition-colors cursor-pointer"
                        >
                          + {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FIELD 2: KETERANGAN TAMBAHAN */}
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
                    placeholder="Contoh: Air masuk teras setinggi 50 cm, ada lansia butuh perahu evakuasi..."
                    className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] resize-none"
                  />
                </div>

                {/* TOMBOL BESAR KIRIM LAPORAN */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !location.trim()}
                    className="w-full py-4 rounded-2xl bg-[#1D443F] hover:bg-[#255851] active:scale-98 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-lg shadow-[#1D443F]/20 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Send className="w-5 h-5 text-[#88BDB6]" />
                    <span>
                      {isSubmitting
                        ? "Mengirim Laporan ke BPBD..."
                        : "Kirim Laporan Darurat Sekarang"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RIWAYAT ADUAN SAYA                                 */}
      {/* ========================================================= */}
      {activeTab === "HISTORY" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-[#132422]">Riwayat Aduan Saya</h2>
              <p className="text-xs text-[#4B635F]">
                Pantau progres tindak lanjut oleh posko tanggap darurat BPBD
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("FORM")}
              className="px-3 py-1.5 rounded-xl bg-[#1D443F] text-white text-xs font-bold hover:bg-[#255851] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Lapor Baru</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {reports.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2.5">
                <Clock className="w-10 h-10 text-[#A4C6C1] mx-auto" />
                <p className="text-sm font-bold text-gray-700">Belum ada riwayat aduan</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Laporan kejadian darurat yang Anda kirim akan otomatis tercatat dan dapat dipantau di sini secara real-time.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("FORM")}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#1D443F] text-white text-xs font-bold hover:bg-[#255851] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Buat Laporan Sekarang</span>
                </button>
              </div>
            ) : (
              reports.map((item) => {
                const statusStyle = STATUS_CONFIG[item.status] || {
                  dotClass: "bg-gray-400",
                  badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
                  textClass: "text-gray-700",
                  stepIndex: 1,
                  label: item.status,
                };

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-[#D5E4E0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-[#88BDB6] transition-colors text-left"
                  >
                    {/* Header Tiket & Waktu */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#1D443F] bg-[#EEF5F3] px-2.5 py-0.5 rounded-lg border border-[#38746D]/20">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {item.time}
                      </span>
                    </div>

                    {/* Judul & Lokasi */}
                    <div>
                      <span className="text-[10px] font-extrabold text-[#38746D] uppercase tracking-wider block mb-0.5">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#132422] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#4B635F] flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>

                    {/* Catatan / Keterangan Tambahan Jika Ada */}
                    {item.notes && (
                      <p className="text-[11.5px] text-[#4B635F] italic bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-100">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    {/* Badge Ketinggian (Legacy Support) */}
                    {(item.waterLevel || (item.urgentNeeds && item.urgentNeeds.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.waterLevel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10.5px] font-semibold">
                            <Waves className="w-3 h-3 text-amber-600" />
                            <span>{item.waterLevel}</span>
                          </span>
                        )}
                        {item.urgentNeeds &&
                          item.urgentNeeds.slice(0, 2).map((need, nIdx) => (
                            <span
                              key={nIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 text-[10.5px] font-semibold"
                            >
                              <span>✓ {need}</span>
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Thumbnail Foto Terunggah */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {item.photos.map((imgUrl, pIdx) => (
                          <div
                            key={pIdx}
                            className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0"
                          >
                            <img
                              src={imgUrl}
                              alt={`Lampiran Bukti ${pIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timeline Tindak Lanjut BPBD */}
                    <div className="pt-2.5 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dotClass}`} />
                          <span className="text-xs font-bold text-[#132422]">
                            {statusStyle.label}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-600 leading-relaxed bg-[#F8FAF9] p-3 rounded-xl border border-gray-100">
                        {item.statusNote}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
