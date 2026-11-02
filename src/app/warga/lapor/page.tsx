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
  ExternalLink,
  ChevronRight,
} from "lucide-react";

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
    label: "Diverifikasi Petugas Lapangan",
  },
  PENANGANAN: {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-300 text-emerald-900",
    textClass: "text-emerald-800",
    stepIndex: 3,
    label: "Regu SAR / Tim Lapangan Dikerahkan",
  },
  SELESAI: {
    dotClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 border-emerald-300 text-emerald-900",
    textClass: "text-emerald-800",
    stepIndex: 4,
    label: "Penanganan Selesai",
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsive Mobile Tab Switcher: "FORM" | "HISTORY"
  const [mobileTab, setMobileTab] = useState<"FORM" | "HISTORY">("FORM");

  // Form State
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      alert("Mohon lengkapi judul kejadian dan titik lokasi.");
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
      title: title.trim(),
      location: location.trim(),
      time: timeFormatted,
      status: "DITERIMA",
      statusNote:
        "Laporan telah diterima sistem Pusdalops BPBD Indramayu. Operator siaga sedang meneruskan informasi ke koordinator lapangan posko terdekat.",
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

    // If on mobile, switch to History tab so user sees their new ticket immediately
    if (window.innerWidth < 768) {
      setMobileTab("HISTORY");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Alert Banner Tiket Berhasil */}
      <AnimatePresence>
        {newlyCreatedTicket && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Laporan Berhasil Masuk ke Pusdalops BPBD Indramayu!
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Nomor Tiket: <span className="font-mono font-extrabold">{newlyCreatedTicket}</span>.
                  Tim reaksi cepat BPBD segera memverifikasi titik lokasi Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewlyCreatedTicket(null)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors ml-4 cursor-pointer"
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
        {/* KOLOM KIRI: FORMULIR PELAPORAN DARURAT (7 COLS)      */}
        {/* ==================================================== */}
        <div
          className={`md:col-span-7 bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 ${
            mobileTab === "HISTORY" ? "hidden md:block" : "block"
          }`}
        >
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
              Kirimkan laporan titik luapan sungai, pasang rob, atau kerusakan tanggul. Informasi Anda langsung diteruskan ke regu posko terdekat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Kategori Laporan */}
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
                          isSelected ? "bg-[#38746D] text-white" : "bg-white text-[#38746D] border border-[#D5E4E0]"
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

            {/* 2. Judul Kejadian */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                2. Judul Ringkas Kondisi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tanggul nelayan barat jebol 2 meter, air merendam pekarangan"
                required
                className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
              />
            </div>

            {/* 3. Lokasi & Smart GPS Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#132422] uppercase tracking-wider">
                  3. Titik Lokasi Kejadian <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetGPS}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] text-[11px] font-bold border border-[#38746D]/20 transition-all cursor-pointer active:scale-95"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-[#38746D]" : ""}`} />
                  <span>{isLocating ? "Mengunci GPS..." : "Kunci GPS Saya"}</span>
                </button>
              </div>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ketik alamat: Desa, RT/RW, gang, atau patokan (misal: dekat Masjid Baiturrahim)"
                required
                className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
              />

              {/* Feedback GPS */}
              {gpsCoords && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Koordinat GPS Terkunci: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} (Akurasi ±{gpsCoords.accuracy || 8}m)
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
                  Pilih cepat desa / wilayah rentan:
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

            {/* 4. Estimasi Ketinggian Air & Tingkat Keparahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                  4. Estimasi Ketinggian Air
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
                  <option value="ABOVE_CHEST">Di Atas Dada / Arus Deras (&gt; 120 cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                  Tingkat Keparahan (Urgensi)
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

            {/* 5. Kebutuhan Mendesak Warga */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                5. Kebutuhan Mendesak Warga (Bisa pilih lebih dari satu)
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

            {/* 6. Unggah Foto Bukti Lapangan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#132422] uppercase tracking-wider">
                  6. Foto Bukti Kejadian di Lapangan (1–5 Foto)
                </label>
                <span className="text-xs text-[#718783]">{photos.length} / 5 Terunggah</span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#D5E4E0] group shadow-2xs"
                  >
                    <img
                      src={photo}
                      alt={`Foto Bukti ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#A4C6C1] hover:border-[#38746D] bg-[#F8FAF9] hover:bg-[#EEF5F3] flex flex-col items-center justify-center text-[#38746D] transition-colors cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1 text-[#38746D]" />
                    <span className="text-[10px] font-bold">Ambil / Unggah</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <p className="text-[11px] text-[#718783] mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                <span>Foto bukti digunakan petugas piket Pusdalops untuk mencocokkan ketinggian air dan menentukan armada evakuasi.</span>
              </p>
            </div>

            {/* 7. Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                7. Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Ada 2 lansia di rumah panggung ujung gang butuh tandu evakuasi segera."
                className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] resize-none"
              />
            </div>

            {/* Tombol Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !location.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#1D443F] hover:bg-[#24544E] active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#88BDB6]" />
                <span>{isSubmitting ? "Mengirim Laporan ke BPBD..." : "Kirim Laporan Darurat Sekarang"}</span>
              </button>
            </div>
          </form>
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
