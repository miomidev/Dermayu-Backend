"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Camera,
  Trash2,
  Sparkles,
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
} from "lucide-react";

type ReportCategoryCode = "FLOOD" | "LEVEE" | "DRAINAGE" | "ROAD" | "TREE" | "OTHER";
type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type WaterLevelCode = "ANKLE" | "KNEE" | "THIGH" | "WAIST" | "ABOVE_CHEST";

export interface ReportTicket {
  id: string;
  category: string;
  title: string;
  location: string;
  time: string;
  status:
    | "Menunggu Validasi AI / Petugas"
    | "Diverifikasi BPBD - Siaga Evakuasi"
    | "Armada Dikerahkan ke Lokasi"
    | "Selesai Ditangani"
    | string;
  statusNote: string;
  photos?: string[];
  severity?: SeverityLevel;
  waterLevel?: string;
  urgentNeeds?: string[];
}

const CATEGORY_CONFIG: Record<
  ReportCategoryCode,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  FLOOD: { label: "Banjir / Rob Pesisir", icon: Droplets },
  LEVEE: { label: "Tanggul Kritis", icon: ShieldCheck },
  DRAINAGE: { label: "Drainase Mampet", icon: Waves },
  ROAD: { label: "Jalan Rusak / Terputus", icon: Navigation },
  TREE: { label: "Pohon Tumbang", icon: AlertTriangle },
  OTHER: { label: "Aduan Darurat Lainnya", icon: FileText },
};

const STATUS_CONFIG: Record<
  string,
  { dotClass: string; badgeClass: string; textClass: string }
> = {
  "Menunggu Validasi AI / Petugas": {
    dotClass: "bg-amber-500 animate-pulse",
    badgeClass: "bg-amber-50 border-amber-200 text-amber-800",
    textClass: "text-amber-800",
  },
  "Diverifikasi BPBD - Siaga Evakuasi": {
    dotClass: "bg-blue-500 animate-pulse",
    badgeClass: "bg-blue-50 border-blue-200 text-blue-800",
    textClass: "text-blue-800",
  },
  "Armada Dikerahkan ke Lokasi": {
    dotClass: "bg-emerald-500 animate-pulse",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    textClass: "text-emerald-800",
  },
  "Selesai Ditangani": {
    dotClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
    textClass: "text-emerald-700",
  },
};

const initialReports: ReportTicket[] = [
  {
    id: "#DMY-2026-891",
    category: "Banjir / Rob Pesisir",
    title: "Air pasang rob masuk rumah setinggi 60 cm",
    location: "Kandanghaur (Eretan Wetan, RT 04 / RW 02)",
    time: "Hari ini, 13:05 WIB",
    status: "Diverifikasi BPBD - Siaga Evakuasi",
    statusNote: "Regu SAR LCR 02 dalam perjalanan membawa perahu evakuasi.",
    severity: "HIGH",
    waterLevel: "Setinggi Lutut (60 cm)",
  },
  {
    id: "#DMY-2026-842",
    category: "Tanggul Kritis",
    title: "Rembesan tanggul tanah nelayan barat",
    location: "Cantigi Kulon",
    time: "Kemarin, 17:20 WIB",
    status: "Selesai Ditangani",
    statusNote: "Penambalan darurat karung pasir telah selesai oleh tim gabungan.",
    severity: "MEDIUM",
    waterLevel: "Semata Kaki (35 cm)",
  },
];

const STORAGE_KEY = "dermayu_user_reports";

export default function WargaLaporPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [category, setCategory] = useState<ReportCategoryCode>("FLOOD");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel>("HIGH");
  const [waterLevel, setWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState<string | null>(null);

  // Reports List State
  const [reports, setReports] = useState<ReportTicket[]>([]);

  // 1. Initial LocalStorage Load
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
    } catch (err) {
      console.warn("Gagal menyimpan riwayat aduan ke localStorage:", err);
    }
  };

  const toggleUrgentNeed = (item: string) => {
    setUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
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

    const randNum = String(Math.floor(100 + Math.random() * 900));
    const ticketCode = `#DMY-2026-${randNum}`;

    const waterLevelMap: Record<WaterLevelCode, string> = {
      ANKLE: "Semata Kaki (10–30 cm)",
      KNEE: "Setinggi Lutut (40–60 cm)",
      THIGH: "Setinggi Paha (70–90 cm)",
      WAIST: "Setinggi Pinggang (100–120 cm)",
      ABOVE_CHEST: "Di Atas Dada (> 120 cm)",
    };

    const now = new Date();
    const timeFormatted = `Hari ini, ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;

    const newTicket: ReportTicket = {
      id: ticketCode,
      category: CATEGORY_CONFIG[category].label,
      title: title.trim(),
      location: location.trim(),
      time: timeFormatted,
      status: "Menunggu Validasi AI / Petugas",
      statusNote:
        "Laporan telah diterima sistem Pusdalops BPBD Indramayu. Model AI sedang memverifikasi foto bukti lapangan.",
      photos: photos.length > 0 ? photos : undefined,
      severity,
      waterLevel: category === "FLOOD" ? waterLevelMap[waterLevel] : undefined,
      urgentNeeds: urgentNeeds.length > 0 ? urgentNeeds : undefined,
    };

    const updated = [newTicket, ...reports];
    saveReportsToStorage(updated);

    setNewlyCreatedTicket(ticketCode);
    setIsSubmitting(false);

    // Reset Form Fields
    setTitle("");
    setLocation("");
    setNotes("");
    setPhotos([]);
    setUrgentNeeds([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 text-left"
    >
      {/* Alert Banner Tiket Berhasil */}
      <AnimatePresence>
        {newlyCreatedTicket && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Laporan Berhasil Dikirim ke Pusdalops BPBD!
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Tiket <span className="font-mono font-bold">{newlyCreatedTicket}</span> telah
                  tercatat dan langsung muncul pada panel Riwayat Aduan di samping.
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

      {/* GRID DUA KOLOM: FORMULIR PELAPORAN (7 COLS) + RIWAYAT ADUAN (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================== */}
        {/* KOLOM KIRI: FORMULIR LAPOR TITIK BANJIR (7 COLS)     */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 bg-white border border-[#D5E4E0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[#38746D] mb-1">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Civic Reporting BPBD
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#132422]">Formulir Pelaporan Darurat</h2>
            <p className="text-xs text-[#4B635F] mt-1">
              Laporkan titik luapan sungai atau pasang rob secara presisi untuk diproses tim reaksi cepat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Kategori Laporan */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-2 uppercase tracking-wider">
                1. Pilih Kategori Kejadian
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  Object.keys(CATEGORY_CONFIG) as ReportCategoryCode[]
                ).map((code) => {
                  const item = CATEGORY_CONFIG[code];
                  const Icon = item.icon;
                  const isSelected = category === code;
                  return (
                    <button
                      type="button"
                      key={code}
                      onClick={() => setCategory(code)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                          : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-white" : "text-[#38746D]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Judul Kondisi Kejadian */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                2. Judul Kondisi Kejadian
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tanggul nelayan barat jebol, air masuk ke 20 rumah"
                required
                className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
              />
            </div>

            {/* 3. Lokasi Detail */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                3. Lokasi Kejadian (Kecamatan / Desa / RT / RW / Patokan)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Blok Karanganyar RT 04/02, Desa Eretan Wetan, Kandanghaur"
                required
                className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
              />
            </div>

            {/* 4. Estimasi Air & Keparahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category === "FLOOD" ? (
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
                    <option value="KNEE">Setinggi Lutut (40–60 cm)</option>
                    <option value="THIGH">Setinggi Paha (70–90 cm)</option>
                    <option value="WAIST">Setinggi Pinggang (100–120 cm)</option>
                    <option value="ABOVE_CHEST">Di Atas Dada (&gt; 120 cm)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                    4. Kategori Dipilih
                  </label>
                  <input
                    type="text"
                    disabled
                    value={CATEGORY_CONFIG[category].label}
                    className="w-full h-11 bg-gray-100 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                  Tingkat Keparahan (Severity)
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                >
                  <option value="LOW">Rendah (Genangan ringan jalan)</option>
                  <option value="MEDIUM">Sedang (Mulai masuk pekarangan)</option>
                  <option value="HIGH">Tinggi (Air masuk ruang rumah)</option>
                  <option value="CRITICAL">Kritis (Arus deras / Bahaya jiwa)</option>
                </select>
              </div>
            </div>

            {/* 5. Kebutuhan Mendesak */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-2 uppercase tracking-wider">
                5. Kebutuhan Mendesak Warga (Opsional)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Perahu Evakuasi",
                  "Bantuan Medis Lansia",
                  "Susu / Makanan Bayi",
                  "Dapur Umum",
                  "Tenda Pengungsi",
                  "Karung Pasir",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleUrgentNeed(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      urgentNeeds.includes(item)
                        ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                        : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Unggah Foto Bukti */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#132422] uppercase tracking-wider">
                  6. Foto Bukti Lapangan (1–5 Foto)
                </label>
                <span className="text-xs text-[#718783]">{photos.length} / 5 Foto Terunggah</span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#D5E4E0] group shadow-2xs"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
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
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Unggah</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#38746D]" />
                <span>Foto dianalisis otomatis oleh model AI CNN untuk validasi dan penentuan prioritas pengerahan tim SAR.</span>
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
                placeholder="Contoh: Ada 2 lansia stroke dan 1 balita butuh tandu evakuasi segera."
                className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] resize-none"
              />
            </div>

            {/* Tombol Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !location.trim()}
                className="w-full py-3.5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan Darurat"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ==================================================== */}
        {/* KOLOM KANAN: SECTION RIWAYAT ADUAN SAYA (5 COLS)     */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-[#132422]">Riwayat Aduan Saya</h3>
              <p className="text-xs text-[#4B635F]">
                Pantau status tindak lanjut tiket laporan Anda
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20">
              {reports.length} Tiket
            </span>
          </div>

          {/* List Tiket Aduan */}
          <div className="space-y-3.5">
            {reports.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
                <p className="text-sm font-bold text-gray-700">Belum ada riwayat aduan</p>
                <p className="text-xs text-gray-500">
                  Laporan kejadian darurat yang Anda kirim akan otomatis tercatat dan dapat dipantau
                  di sini.
                </p>
              </div>
            ) : (
              reports.map((item) => {
                const statusStyle =
                  STATUS_CONFIG[item.status] || {
                    dotClass: "bg-gray-400",
                    badgeClass: "bg-gray-50 border-gray-200 text-gray-700",
                    textClass: "text-gray-700",
                  };

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#D5E4E0] rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#88BDB6] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#38746D] bg-[#EEF5F3] px-2.5 py-1 rounded-lg border border-[#38746D]/20">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {item.time}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#38746D] uppercase tracking-wider block mb-1">
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

                    {/* Badge Ketinggian Air (Jika Ada) */}
                    {item.waterLevel && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                        <Waves className="w-3 h-3 text-amber-600" />
                        <span>Ketinggian: {item.waterLevel}</span>
                      </div>
                    )}

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
                              alt={`lampiran-${pIdx}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status & Keterangan Tindakan BPBD */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusStyle.dotClass}`} />
                        <span className="text-xs font-bold text-[#132422]">{item.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed bg-[#F8FAF9] p-3 rounded-xl border border-gray-100">
                        {item.statusNote}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
