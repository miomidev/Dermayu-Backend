"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  PlusCircle,
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
  ArrowRight,
} from "lucide-react";

type ReportCategoryCode = "FLOOD" | "LEVEE" | "DRAINAGE" | "ROAD" | "TREE" | "OTHER";
type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type WaterLevelCode = "ANKLE" | "KNEE" | "THIGH" | "WAIST" | "ABOVE_CHEST";

export default function WargaLaporPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<ReportCategoryCode>("FLOOD");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel>("HIGH");
  const [waterLevel, setWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicketCode, setCreatedTicketCode] = useState("");

  const toggleUrgentNeed = (item: string) => {
    setUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 5) {
      alert("Maksimal 5 foto per laporan sesuai spesifikasi PRD.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) {
      alert("Mohon lengkapi judul kejadian dan titik lokasi.");
      return;
    }

    // Generate PRD standard ticket code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    setCreatedTicketCode(ticketCode);
    setSubmitted(true);

    setTimeout(() => {
      router.push("/warga/aduan");
    }, 2200);
  };

  return (
    <DashboardLayout role="warga" title="Lapor Titik Banjir">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        {submitted ? (
          <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center shadow-md space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-[#132422]">
              Laporan Berhasil Terkirim ke Pusdalops!
            </h2>
            <div className="inline-block px-4 py-2 rounded-xl bg-[#EEF5F3] border border-[#38746D]/30 text-sm font-mono font-bold text-[#1D443F]">
              Kode Tiket: #{createdTicketCode}
            </div>
            <p className="text-xs sm:text-sm text-[#4B635F] max-w-md mx-auto leading-relaxed">
              Model AI CNN otomatis memvalidasi foto laporan Anda untuk penentuan prioritas pengerahan tim SAR BPBD. Mengarahkan ke halaman riwayat aduan...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#D5E4E0] p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#132422] flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-[#38746D]" />
                Formulir Pelaporan Darurat Warga
              </h2>
              <p className="text-xs text-[#4B635F] mt-0.5">
                Standar Pelaporan Wilayah Indramayu (PRD FR-RPT-01) &bull; Terhubung Pusdalops BPBD 24/7
              </p>
            </div>

            {/* 1. Kategori Laporan PRD */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-2 uppercase tracking-wider">
                1. Pilih Kategori Kejadian
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { code: "FLOOD", label: "Banjir / Rob", icon: Droplets },
                  { code: "LEVEE", label: "Tanggul Kritis", icon: ShieldCheck },
                  { code: "DRAINAGE", label: "Drainase Mampet", icon: Waves },
                  { code: "ROAD", label: "Jalan Rusak/Putus", icon: Navigation },
                  { code: "TREE", label: "Pohon Tumbang", icon: AlertTriangle },
                  { code: "OTHER", label: "Aduan Lainnya", icon: FileText },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.code;
                  return (
                    <button
                      type="button"
                      key={cat.code}
                      onClick={() => setCategory(cat.code as ReportCategoryCode)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                          : "bg-[#F8FAF9] text-[#4B635F] border-[#D5E4E0] hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#38746D]"}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Judul Kejadian */}
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
                className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
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
                className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] transition-colors"
              />
            </div>

            {/* 4. Unggah Foto Bukti (1-5 Foto) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#132422] uppercase tracking-wider">
                  4. Foto Bukti Lapangan (1–5 Foto)
                </label>
                <span className="text-xs text-[#718783]">{photos.length} / 5 Foto Terunggah</span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#D5E4E0] group shadow-2xs">
                    <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
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
                    <span className="text-[10px] font-bold">+ Foto</span>
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
                <span>Foto banjir dianalisis otomatis oleh model AI CNN untuk validasi dan penentuan prioritas evakuasi.</span>
              </p>
            </div>

            {/* 5. Parameter Air & Keparahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category === "FLOOD" ? (
                <div>
                  <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                    5. Estimasi Ketinggian Air (PRD)
                  </label>
                  <select
                    value={waterLevel}
                    onChange={(e) => setWaterLevel(e.target.value as WaterLevelCode)}
                    className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3.5 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                  >
                    <option value="ANKLE">Semata Kaki (10–30 cm)</option>
                    <option value="KNEE">Setinggi Lutut (40–60 cm)</option>
                    <option value="THIGH">Setinggi Paha (70–90 cm)</option>
                    <option value="WAIST">Setinggi Pinggang (100–120 cm)</option>
                    <option value="ABOVE_CHEST">Di Atas Dada / Merendam Rumah (&gt; 120 cm)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                    5. Kategori Dipilih
                  </label>
                  <input
                    type="text"
                    disabled
                    value={category}
                    className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-500"
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
                  className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3.5 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                >
                  <option value="LOW">Rendah (Genangan ringan jalan)</option>
                  <option value="MEDIUM">Sedang (Mulai masuk pekarangan)</option>
                  <option value="HIGH">Tinggi (Air masuk dalam ruang rumah)</option>
                  <option value="CRITICAL">Kritis (Darurat keselamatan jiwa/arus deras)</option>
                </select>
              </div>
            </div>

            {/* 6. Kebutuhan Mendesak */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-2 uppercase tracking-wider">
                6. Kebutuhan Mendesak Warga
              </label>
              <div className="flex flex-wrap gap-2">
                {["Perahu Evakuasi", "Bantuan Medis Lansia", "Susu / Makanan Bayi", "Dapur Umum", "Tenda Pengungsi", "Karung Pasir"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleUrgentNeed(item)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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

            {/* 7. Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-[#132422] mb-1.5 uppercase tracking-wider">
                7. Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Ada 2 lansia stroke dan 1 ibu hamil butuh tandu evakuasi segera."
                className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3.5 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D]"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/warga/dashboard")}
                className="flex-1 py-3.5 rounded-full border border-[#D5E4E0] text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Kembali ke Dasbor
              </button>
              <button
                type="submit"
                className="flex-2 py-3.5 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Kirim Laporan Resmi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
