"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Camera,
  Trash2,
  Droplets,
  ShieldCheck,
  Waves,
  Navigation,
  AlertTriangle,
  FileText,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  X,
  PhoneCall,
  Crosshair,
  LifeBuoy,
  RefreshCw,
  Image as ImageIcon,
  Scan,
} from "lucide-react";
import { FullscreenCameraModal } from "@/components/dashboard/FullscreenCameraModal";
import { AiScannerOverlay } from "@/components/dashboard/AiScannerOverlay";

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
  gps?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

const CATEGORY_CONFIG: Record<
  ReportCategoryCode,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }> }
> = {
  FLOOD: {
    label: "Banjir / Rob Pesisir",
    desc: "Air pasang laut atau luapan sungai masuk jalan / rumah",
    icon: Droplets,
  },
  LEVEE: {
    label: "Tanggul Kritis / Jebol",
    desc: "Rembesan tanggul tanah, retakan bronjong, atau tanggul jebol",
    icon: ShieldCheck,
  },
  EVACUATION: {
    label: "Evakuasi Darurat",
    desc: "Warga terjebak genangan tinggi, butuh perahu karet segera",
    icon: LifeBuoy,
  },
  DRAINAGE: {
    label: "Drainase / Muara Mampet",
    desc: "Saluran pembuang tersumbat sampah atau sedimentasi lumpur",
    icon: Waves,
  },
  ROAD: {
    label: "Akses Jalan Terputus",
    desc: "Jalan ambles atau terendam dalam, tidak bisa dilalui kendaraan",
    icon: Navigation,
  },
  TREE: {
    label: "Pohon / Tiang Listrik Roboh",
    desc: "Membahayakan warga di sekitar pemukiman dan jaringan listrik",
    icon: AlertTriangle,
  },
  OTHER: {
    label: "Aduan Kebencanaan Lain",
    desc: "Kebutuhan air bersih darurat, fasilitas pengungsian, dll.",
    icon: FileText,
  },
};

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
    dotClass: "bg-sky-500 animate-pulse",
    badgeClass: "bg-sky-50 border-sky-200 text-sky-900",
    textClass: "text-sky-800",
    stepIndex: 2,
    label: "Terverifikasi & Diteruskan ke Posko",
  },
  PENANGANAN: {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
    textClass: "text-emerald-800",
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

const URGENT_NEEDS_LIST = [
  "Perahu Karet Evakuasi",
  "Bantuan Evakuasi Lansia / Bayi",
  "Pompa Penyedot Genangan (Damkar)",
  "Karung Pasir Penahan Tanggul",
  "Dapur Umum & Makanan Siap Saji",
  "Air Bersih & Minum PDAM",
  "Obat & Penanganan Medis Darurat",
  "Tenda & Matras Pengungsian",
];

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
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Responsive Mobile Tab Switcher: "FORM" | "HISTORY"
  const [mobileTab, setMobileTab] = useState<"FORM" | "HISTORY">("FORM");

  // Progressive Step Flow State:
  // State 1: Scanner Card (photos.length === 0 && !hasBypassedPhoto)
  // State 2: Fullscreen Camera View (isCameraOpen) -> AI Scanner Overlay (isAiScanning)
  // State 3: Verified Photo + Full Form (photos.length > 0 || hasBypassedPhoto)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [hasBypassedPhoto, setHasBypassedPhoto] = useState(false);

  // Form Data State
  const [category, setCategory] = useState<ReportCategoryCode>("FLOOD");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [severity, setSeverity] = useState<SeverityLevel>("HIGH");
  const [waterLevel, setWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
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

  const toggleUrgentNeed = (item: string) => {
    setUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
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
            `Titik Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (Kandanghaur/Pesisir)`
          );
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGpsError("Izin lokasi GPS belum diizinkan. Silakan ketik nama lokasi.");
        } else {
          setGpsError("Gagal mengunci sinyal GPS. Silakan ketik patokan lokasi.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger when a photo is captured from camera
  const handleCameraCapture = (dataUrl: string) => {
    setIsCameraOpen(false);
    setPendingPhoto(dataUrl);
    setIsAiScanning(true);
    // Background auto-fetch GPS
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
        // Background auto-fetch GPS
        handleGetGPS();
      }
    };
    reader.readAsDataURL(file);

    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  // Called when AI Scan 1.8s animation finishes
  const handleScanComplete = () => {
    if (pendingPhoto) {
      setPhotos([pendingPhoto]);
    }
    setPendingPhoto(null);
    setIsAiScanning(false);
  };

  // Handle adding more photos in State 3
  const handleAddMorePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 5) {
      alert("Maksimal 5 foto per laporan kejadian.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });

    if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (updated.length === 0) {
      setHasBypassedPhoto(false);
    }
  };

  const handleResetPhoto = () => {
    setPhotos([]);
    setPendingPhoto(null);
    setHasBypassedPhoto(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTitle =
      title.trim() ||
      `${CATEGORY_CONFIG[category].label} - ${location.trim() || "Area Pesisir"}`;

    if (!location.trim()) {
      alert("Mohon tentukan titik lokasi kejadian (gunakan GPS atau ketik alamat).");
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    const waterLevelMap: Record<WaterLevelCode, string> = {
      ANKLE: "Semata Kaki (10–30 cm)",
      KNEE: "Setinggi Lutut (40–60 cm)",
      THIGH: "Setinggi Paha (70–90 cm)",
      WAIST: "Setinggi Pinggang (100–120 cm)",
      ABOVE_CHEST: "Di Atas Dada (> 120 cm)",
    };

    const timeFormatted = `Hari ini, ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;

    const newTicket: ReportTicket = {
      id: ticketCode,
      category: CATEGORY_CONFIG[category].label,
      categoryCode: category,
      title: effectiveTitle,
      location: location.trim(),
      time: timeFormatted,
      status: "DITERIMA",
      statusNote:
        "Laporan telah diterima sistem Pusdalops BPBD Indramayu dengan bukti terverifikasi AI CNN. Operator siaga sedang meneruskan koordinat ke regu posko terdekat.",
      photos: photos.length > 0 ? photos : undefined,
      severity,
      waterLevel: category === "FLOOD" ? waterLevelMap[waterLevel] : undefined,
      urgentNeeds: urgentNeeds.length > 0 ? urgentNeeds : undefined,
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
    setTitle("");
    setLocation("");
    setGpsCoords(null);
    setNotes("");
    setPhotos([]);
    setUrgentNeeds([]);
    setHasBypassedPhoto(false);

    // If on mobile, switch to History tab so user sees their new ticket immediately
    if (window.innerWidth < 768) {
      setMobileTab("HISTORY");
    }
  };

  // Determine whether to display State 1 (Scanner Card) or State 3 (Full Form)
  const isFormActive = photos.length > 0 || hasBypassedPhoto;

  return (
    <div className="space-y-6 text-left">
      {/* Hidden Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallerySelect}
      />

      {/* Hidden Additional Photos Input */}
      <input
        ref={additionalFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddMorePhotos}
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

      {/* State 2.5: AI Scanning Loading Overlay (1.8s) */}
      <AiScannerOverlay
        isOpen={isAiScanning}
        photoUrl={pendingPhoto}
        onScanComplete={handleScanComplete}
      />

      {/* Alert Banner Tiket Berhasil Dibuat */}
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
                <p className="text-xs font-bold">
                  Laporan Berhasil Diterbitkan: Tiket #{newlyCreatedTicket}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Petugas Pusdalops BPBD & posko terdekat telah menerima data laporan dan foto validasi AI CNN Anda.
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

      {/* MOBILE TAB SWITCHER (< MD) */}
      <div className="flex items-center p-1 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("FORM")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === "FORM"
              ? "bg-[#1D443F] text-white shadow-xs"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Buat Laporan Baru</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("HISTORY")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === "HISTORY"
              ? "bg-[#1D443F] text-white shadow-xs"
              : "text-[#4B635F] hover:text-[#132422]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat Aduan ({reports.length})</span>
        </button>
      </div>

      {/* DUA KOLOM: FORMULIR PELAPORAN (7 COLS) + RIWAYAT ADUAN (5 COLS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ==================================================== */}
        {/* KOLOM KIRI: ALUR PELAPORAN PROGRESSIVE (7 COLS)      */}
        {/* ==================================================== */}
        <div
          className={`md:col-span-7 space-y-6 ${
            mobileTab === "HISTORY" ? "hidden md:block" : "block"
          }`}
        >
          <AnimatePresence mode="wait">
            {!isFormActive ? (
              /* ========================================================== */
              /* STATE 1: LAYAR AWAL LAPOR (VISUAL SCANNER CARD)           */
              /* ========================================================== */
              <motion.div
                key="state-scanner-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-emerald-700/50"
                style={{
                  backgroundColor: "#155E45",
                  backgroundImage:
                    "radial-gradient(circle at 100% 0%, rgba(52, 211, 153, 0.22) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(6, 78, 59, 0.8) 0%, transparent 70%)",
                }}
              >
                {/* Decorative Viewfinder Ambient Grid */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

                {/* Badges Header */}
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-200 text-xs font-bold tracking-wide backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>AI CNN Flood Verification</span>
                  </div>
                </div>

                {/* Central Camera / Viewfinder Visual Hero */}
                <div className="my-6 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group hover:scale-105 transition-transform duration-300">
                    {/* Viewfinder Target Marks */}
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-300 rounded-tl-sm" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-300 rounded-tr-sm" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-300 rounded-bl-sm" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-300 rounded-br-sm" />
                    
                    <Scan className="w-9 h-9 text-emerald-200 animate-pulse" />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                    Ambil Dokumentasi Foto Genangan Banjir
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mx-auto leading-relaxed">
                    Foto kondisi banjir, tanggul, atau akses jalan terputus secara langsung di lokasi untuk verifikasi spasial dan prioritas penanganan tim penyelamat.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Tombol Aksi Utama: Lebar Penuh (Buka Kamera Langsung) */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-4 px-5 rounded-2xl bg-white text-[#155E45] font-extrabold text-sm sm:text-base shadow-xl hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
                  >
                    <Camera className="w-5 h-5 text-[#155E45] group-hover:scale-110 transition-transform" />
                    <span>Buka Kamera Langsung</span>
                  </button>

                  {/* Tombol Sekunder: Outline (Pilih dari Galeri Foto) */}
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
              /* ========================================================== */
              /* STATE 3: TAMPILAN HASIL PINDAI & FORMULIR LENGKAP          */
              /* ========================================================== */
              <motion.div
                key="state-form-verified"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6"
              >
                {/* Header Formulir */}
                <div>
                  <div className="flex items-center gap-2 text-[#38746D] mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      Pusdalops-PB BPBD Kabupaten Indramayu
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#132422]">
                    Formulir Lapor Titik Bencana
                  </h2>
                  <p className="text-xs text-[#4B635F] mt-1 leading-relaxed">
                    Data terverifikasi akan disinkronkan langsung ke peta operasional SAR dan regu posko tanggap darurat.
                  </p>
                </div>

                {/* ============================================================ */}
                {/* THUMBNAIL FOTO TERVERIFIKASI AI CNN (94%)                    */}
                {/* ============================================================ */}
                {photos.length > 0 && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-emerald-300 shrink-0 bg-black shadow-xs">
                        <img
                          src={photos[0]}
                          alt="Foto Terverifikasi"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-extrabold text-center py-0.5">
                          AI CNN
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10.5px] font-extrabold tracking-wide mb-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Foto Terverifikasi AI CNN</span>
                        </div>
                        <p className="text-xs font-bold text-[#132422] truncate">
                          Bukti Ketinggian Genangan Tervalidasi
                        </p>
                        <p className="text-[11px] text-[#4B635F] leading-tight mt-0.5">
                          Karakteristik batas air sesuai ambang rob pesisir
                        </p>
                      </div>
                    </div>

                    {/* Tombol Opsi Ganti Foto & Tambah Foto */}
                    <div className="flex items-center gap-2 shrink-0">
                      {photos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => additionalFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-700" />
                          <span>+ Foto ({photos.length}/5)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetPhoto}
                        className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Ganti Foto</span>
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* ============================================================ */}
                  {/* 1. KATEGORI KEJADIAN                                         */}
                  {/* ============================================================ */}
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-2 uppercase tracking-wider">
                      1. Kategori Kejadian <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.keys(CATEGORY_CONFIG) as ReportCategoryCode[]).map((code) => {
                        const item = CATEGORY_CONFIG[code];
                        const Icon = item.icon;
                        const isSelected = category === code;
                        return (
                          <button
                            type="button"
                            key={code}
                            onClick={() => setCategory(code)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "bg-[#EEF5F3] border-[#38746D] text-[#1D443F] ring-1 ring-[#38746D]"
                                : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-[#38746D] text-white"
                                  : "bg-white text-[#38746D] border border-[#D5E4E0]"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold leading-tight text-[#132422]">
                                {item.label}
                              </span>
                              <span className="block text-[10px] text-[#718783] line-clamp-1 mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* 2. ESTIMASI KETINGGIAN AIR & 3. TINGKAT KEPARAHAN / URGENSI   */}
                  {/* ============================================================ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                        2. Estimasi Ketinggian Air
                      </label>
                      <select
                        value={waterLevel}
                        onChange={(e) => setWaterLevel(e.target.value as WaterLevelCode)}
                        className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                      >
                        <option value="ANKLE">Semata Kaki (10–30 cm)</option>
                        <option value="KNEE">Setinggi Betis / Lutut (40–60 cm)</option>
                        <option value="THIGH">Setinggi Paha (70–90 cm)</option>
                        <option value="WAIST">Setinggi Pinggang (100–120 cm)</option>
                        <option value="ABOVE_CHEST">Di Atas Dada / Rumah (&gt; 120 cm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                        3. Tingkat Keparahan / Urgensi
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                        className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                      >
                        <option value="LOW">Rendah — Genangan jalan desa, masih bisa dilalui</option>
                        <option value="MEDIUM">Sedang — Air mulai masuk pekarangan & teras</option>
                        <option value="HIGH">Tinggi — Air masuk ruang rumah, perabotan terendam</option>
                        <option value="CRITICAL">Kritis — Arus deras, ada warga rentan butuh evakuasi</option>
                      </select>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* 4. KEBUTUHAN MENDESAK WARGA                                  */}
                  {/* ============================================================ */}
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                      4. Kebutuhan Mendesak Warga (Bisa pilih lebih dari satu)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {URGENT_NEEDS_LIST.map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleUrgentNeed(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            urgentNeeds.includes(item)
                              ? "bg-[#1D443F] text-white border-[#1D443F] shadow-xs"
                              : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                          }`}
                        >
                          {urgentNeeds.includes(item) ? "✓ " : "+ "}
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* 5. LOKASI OTOMATIS (PINPOINT GPS TERDETEKSI)                 */}
                  {/* ============================================================ */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#132422] uppercase tracking-wider">
                        5. Lokasi Otomatis (Pinpoint GPS) <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGetGPS}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] text-[11px] font-bold border border-[#38746D]/20 transition-all cursor-pointer active:scale-95"
                      >
                        <Crosshair className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-[#38746D]" : ""}`} />
                        <span>{isLocating ? "Mengunci GPS..." : "Kunci Ulang GPS"}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ketik alamat atau patokan: Desa, RT/RW, gang, dekat masjid/balai desa"
                      required
                      className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
                    />

                    {/* Feedback Sinyal GPS */}
                    {gpsCoords && (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            GPS Terkunci: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} (Akurasi ±{gpsCoords.accuracy || 8}m)
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
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{gpsError}</span>
                      </p>
                    )}

                    {/* Quick Village Chips */}
                    <div className="pt-1">
                      <span className="text-[10px] text-[#718783] block mb-1 font-semibold">
                        Pilih cepat desa / wilayah rawan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_LOCATIONS.map((loc) => (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => {
                              if (!location.includes(loc)) {
                                setLocation((prev) => (prev ? `${prev}, Desa ${loc}` : `Desa ${loc}`));
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

                  {/* Judul Ringkas Kondisi (Opsional jika ingin disesuaikan) */}
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                      Judul Ringkas Kondisi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Genangan masuk pemukiman, akses jalan tertutup 50 cm"
                      className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
                    />
                  </div>

                  {/* Catatan Tambahan (Opsional) */}
                  <div>
                    <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Ada 2 lansia di rumah panggung ujung gang butuh tandu evakuasi segera."
                      className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] resize-none"
                    />
                  </div>

                  {/* ============================================================ */}
                  {/* 6. TOMBOL BESAR DI BAGIAN PALING BAWAH                       */}
                  {/* ============================================================ */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !location.trim()}
                      className="w-full py-4 rounded-2xl bg-[#1D443F] hover:bg-[#24544E] active:scale-98 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-lg shadow-[#1D443F]/20 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <Send className="w-5 h-5 text-[#88BDB6]" />
                      <span>
                        {isSubmitting
                          ? "Mengirim Laporan ke BPBD Indramayu..."
                          : "Kirim Laporan Darurat Sekarang"}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================================================== */}
        {/* KOLOM KANAN: SECTION RIWAYAT ADUAN SAYA (5 COLS)     */}
        {/* ==================================================== */}
        <div
          className={`md:col-span-5 space-y-4 ${
            mobileTab === "FORM" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-[#132422]">Riwayat Aduan Saya</h3>
              <p className="text-xs text-[#4B635F]">
                Pantau progres tindak lanjut oleh tim SAR / BPBD
              </p>
            </div>
            <a
              href="tel:112"
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 hover:bg-rose-100 transition-colors"
              title="Panggilan Darurat BPBD"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>112</span>
            </a>
          </div>

          {/* List Tiket Aduan */}
          <div className="space-y-3.5">
            {reports.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
                <Clock className="w-8 h-8 text-[#A4C6C1] mx-auto" />
                <p className="text-sm font-bold text-gray-700">Belum ada riwayat aduan</p>
                <p className="text-xs text-gray-500">
                  Laporan kejadian darurat yang Anda kirim akan otomatis tercatat dan dapat dipantau di sini secara real-time.
                </p>
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

                    {/* Judul & Kategori */}
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

                    {/* Badge Ketinggian & Kebutuhan */}
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

                    {/* Thumbnail Foto Terunggah (Jika Ada) */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {item.photos.map((imgUrl, pIdx) => (
                          <div
                            key={pIdx}
                            className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden shrink-0"
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
      </div>
    </div>
  );
}
