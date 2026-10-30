"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Navigation,
  PlusCircle,
  Clock,
  Compass,
  CheckCircle2,
  Users,
  Building2,
  PhoneCall,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Waves,
  ArrowRight,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertOctagon,
  Radio,
  FileText,
  Ban,
  Droplets,
} from "lucide-react";
import { getActiveSession } from "@/utils/authSession";

interface UserSession {
  name: string;
  email: string;
  role: string;
  district: string;
}

// PRD 7.3: Kategori Laporan & Tingkat Keparahan
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
  aiScore?: {
    label: string;
    confidence: number;
  };
}

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  facilities: string[];
  contactPerson: string;
  contactPhone: string;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
}

interface EmergencyContactItem {
  id: string;
  name: string;
  agency: string;
  phone: string;
  description: string;
  badge: string;
}

export default function WargaDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<UserSession>({
    name: "Pak Kusnan",
    email: "warga@dermayu.id",
    role: "warga",
    district: "Kandanghaur - Eretan Wetan",
  });

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showDeringModal, setShowDeringModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedShelterForNav, setSelectedShelterForNav] = useState<ShelterItem | null>(null);

  // New report form state (PRD FR-RPT-01 s/d FR-RPT-06)
  const [reportCategory, setReportCategory] = useState<ReportCategoryCode>("FLOOD");
  const [reportTitle, setReportTitle] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportSeverity, setReportSeverity] = useState<SeverityLevel>("HIGH");
  const [reportWaterLevel, setReportWaterLevel] = useState<WaterLevelCode>("KNEE");
  const [reportUrgentNeeds, setReportUrgentNeeds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState(false);

  // Mock initial complaints aligned with PRD Status & Categories
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([
    {
      id: "1",
      ticketCode: "DMY-20261030-0089",
      category: "FLOOD",
      categoryLabel: "Banjir / Genangan Rob",
      title: "Luapan Rob Pantai Rendam Jalan Pemukiman RT 04",
      location: "Blok Karanganyar, Eretan Wetan",
      severity: "CRITICAL",
      waterLevel: "KNEE",
      waterLevelText: "Setinggi Lutut (60 cm)",
      status: "ASSIGNED",
      createdAt: "15 Menit yang lalu",
      note: "Regu SAR Pos Eretan bersama 1 perahu karet LCR sedang bergerak evakuasi 3 lansia.",
      photos: ["/login-art.png"],
      urgentNeeds: ["Perahu Evakuasi", "Bantuan Medis Lansia"],
      aiScore: {
        label: "flood",
        confidence: 0.94,
      },
    },
    {
      id: "2",
      ticketCode: "DMY-20261030-0042",
      category: "LEVEE",
      categoryLabel: "Tanggul Kritis",
      title: "Rembesan Tanggul Saluran Sekunder Kali Cimanuk",
      location: "Jl. Muara Lama No. 12, Kandanghaur",
      severity: "MEDIUM",
      waterLevel: "ANKLE",
      waterLevelText: "Semata Kaki (35 cm)",
      status: "VERIFIED",
      createdAt: "3 Jam yang lalu",
      note: "Laporan tervalidasi via telemetri BMKG. Masuk antrean suplai karung pasir pengaman.",
      photos: [],
      urgentNeeds: ["Karung Pasir"],
    },
  ]);

  // Mock Active Shelters (PRD FR-EVAC-01 / FR-EVAC-02)
  const shelters: ShelterItem[] = [
    {
      id: "sh-1",
      name: "Balai Desa Eretan Wetan",
      location: "Jl. Raya Pantura No. 45, Kandanghaur",
      distance: "850 m (±4 menit jalan darat)",
      capacityTotal: 250,
      capacityFilled: 185,
      facilities: ["Dapur Umum", "Posko Medis", "Ruang Balita & Lansia", "Genset Cadangan"],
      contactPerson: "Bpk. Mulyadi (Kuwu)",
      contactPhone: "0813-8822-1920",
      status: "TERSEDIA",
    },
    {
      id: "sh-2",
      name: "GOR Mini Kandanghaur",
      location: "Jl. Olahraga Blok Barat, Kandanghaur",
      distance: "1.8 km (±8 menit kendaraan)",
      capacityTotal: 500,
      capacityFilled: 310,
      facilities: ["Aula Luas", "Sanitasi MCK (8 Unit)", "Stok Logistik Makanan", "Tenda Pengungsi"],
      contactPerson: "Ibu Ratna (Relawan Tagana)",
      contactPhone: "0821-4433-2100",
      status: "TERSEDIA",
    },
    {
      id: "sh-3",
      name: "SMP Negeri 1 Cantigi",
      location: "Jl. Ki Hajar Dewantara, Cantigi",
      distance: "3.2 km (Jalur Tanggul Barat)",
      capacityTotal: 200,
      capacityFilled: 190,
      facilities: ["Ruang Kelas Tidur", "Tenaga Nakes Puskesmas", "Air Bersih PDAM"],
      contactPerson: "Pak Hendra (Satlak Cantigi)",
      contactPhone: "0852-7711-9022",
      status: "HAMPIR_PENUH",
    },
  ];

  // Mock Emergency Contacts (PRD FR-EVAC-03)
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
      badge: "Tim Penyelamat",
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
      agency: "Satpol PP & Pemadam Kebakaran",
      phone: "(0234) 274113",
      description: "Penyedotan genangan pemukiman & evakuasi pohon tumbang darurat.",
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
    {
      id: "ec-6",
      name: "Polres Indramayu",
      agency: "Kepolisian Resor Indramayu",
      phone: "110",
      description: "Sentra pengamanan jalur darat, buka tutup jalan evakuasi & kamtibmas.",
      badge: "Keamanan",
    },
  ];

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
    } catch {
      // Keep default session
    }
  }, []);

  const handleOpenNav = (shelter?: ShelterItem) => {
    setSelectedShelterForNav(shelter || shelters[0]);
    setShowNavModal(true);
  };

  const toggleUrgentNeed = (item: string) => {
    setReportUrgentNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Image Upload handler (PRD FR-RPT-03: Foto 1-5, kompresi klien)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (reportPhotos.length + files.length > 5) {
      alert("Maksimal 5 foto per laporan sesuai spesifikasi PRD.");
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

  // PRD FR-RPT-08: Pelapor dapat membatalkan laporan selama status masih SUBMITTED (Diterima)
  const handleCancelReport = (ticketId: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan laporan ini? Tindakan ini tidak dapat diurungkan.")) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === ticketId
            ? { ...c, status: "CANCELLED", note: "Laporan dibatalkan mandiri oleh pelapor." }
            : c
        )
      );
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportLocation) {
      alert("Mohon lengkapi judul kejadian dan titik lokasi.");
      return;
    }

    // PRD FR-RPT-06: Format kode tiket unik DMY-YYYYMMDD-NNNN
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const ticketCode = `DMY-${dateStr}-${randNum}`;

    const categoryLabels: Record<ReportCategoryCode, string> = {
      FLOOD: "Banjir / Genangan Air",
      LEVEE: "Tanggul / Irigasi Kritis",
      DRAINAGE: "Drainase Tersumbat",
      ROAD: "Jalan Rusak / Tergenang",
      TREE: "Pohon Tumbang",
      OTHER: "Aduan Wilayah Lainnya",
    };

    const waterLevelLabels: Record<WaterLevelCode, string> = {
      ANKLE: "Semata Kaki (10-30 cm)",
      KNEE: "Setinggi Lutut (40-60 cm)",
      THIGH: "Setinggi Paha (70-90 cm)",
      WAIST: "Setinggi Pinggang (100-120 cm)",
      ABOVE_CHEST: "Di Atas Dada / Merendam Rumah (> 120 cm)",
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
      note: "Laporan masuk antrean Pusdalops PB. Foto otomatis diproses model AI CNN untuk validasi verifikasi.",
      photos: reportPhotos,
      urgentNeeds: reportUrgentNeeds,
      aiScore:
        reportCategory === "FLOOD"
          ? {
              label: "flood",
              confidence: 0.92,
            }
          : undefined,
    };

    setComplaints([newTicket, ...complaints]);
    setReportSubmittedSuccess(true);

    setTimeout(() => {
      setReportSubmittedSuccess(false);
      setShowReportModal(false);
      setReportTitle("");
      setReportLocation("");
      setReportNotes("");
      setReportPhotos([]);
      setReportUrgentNeeds([]);
    }, 2000);
  };

  return (
    <>
      <div className="space-y-6">
        {/* ============================================================ */}
        {/* A. ALERT BANNER: DERING EVAKUASI & STATUS SIAGA (PRD ALERT)  */}
        {/* ============================================================ */}
        <section
          aria-label="Status Kesiapsiagaan Wilayah"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EEF5F3] via-white to-[#E0ECE8] border border-[#A4C6C1]/60 p-5 sm:p-6 shadow-xs text-left"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38746D] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>DERING AKTIF: SIAGA II (WASPADA ROB &amp; PASANG LAUT)</span>
                  </span>
                  <span className="text-xs text-[#718783] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pembaruan: Hari ini, Pk. 13:00 WIB
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#132422]">
                  Pesisir Indramayu Barat Terpantau Pasang Air Laut 40–80 cm
                </h2>
                <p className="text-xs sm:text-sm text-[#4B635F] leading-relaxed max-w-3xl">
                  Wilayah <strong>Kandanghaur, Eretan Wetan, dan Cantigi</strong> berpotensi tergenang rob saat pasang petang ini.
                  Warga diimbau mengamankan barang berharga dan memastikan jalur evakuasi menuju posko darurat tetap terbuka.
                </p>
                <div className="pt-1.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeringModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38746D] hover:underline cursor-pointer"
                  >
                    <span>Rincian Peringatan Dering Evakuasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/90 border border-[#D5E4E0] rounded-2xl p-2.5 sm:p-3 shrink-0 self-stretch md:self-auto justify-around">
              <div className="text-center px-2">
                <p className="text-[10px] text-[#718783] font-semibold uppercase">TMA Pesisir</p>
                <p className="text-sm font-extrabold text-amber-600">+65 cm</p>
              </div>
              <div className="w-[1px] h-8 bg-gray-200" />
              <div className="text-center px-2">
                <p className="text-[10px] text-[#718783] font-semibold uppercase">Debit Cimanuk</p>
                <p className="text-sm font-extrabold text-[#38746D]">Normal (310 m³/s)</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* B. 2 KARTU AKSI CEPAT DARURAT (QUICK ACTION)                 */}
        {/* ============================================================ */}
        <section id="evakuasi" aria-label="Aksi Cepat Warga" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 scroll-mt-24">
          {/* Tombol Aksi 1: Navigasi Evakuasi Mandiri */}
          <button
            type="button"
            onClick={() => handleOpenNav()}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#38746D] to-[#24544E] text-white p-6 sm:p-7 shadow-md hover:shadow-xl transition-all active:scale-[0.99] text-left cursor-pointer border border-[#1D443F]"
          >
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Compass className="w-3 h-3" />
                  Rute Terverifikasi Bebas Banjir
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  Panduan Rute Evakuasi Aman
                </h3>
                <p className="text-xs sm:text-sm text-[#D1E5E2] mt-1 leading-relaxed">
                  Buka peta rute darurat tertinggi bebas genangan menuju posko pengungsian terdekat tanpa terjebak jalan banjir.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white group-hover:underline">
                  <span>Lihat Peta Rute Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          {/* Tombol Aksi 2: Lapor Titik Genangan / Butuh Pertolongan */}
          <button
            id="lapor"
            type="button"
            onClick={() => setShowReportModal(true)}
            className="group relative overflow-hidden rounded-3xl bg-white hover:bg-[#F8FAF9] border-2 border-[#D5E4E0] hover:border-[#38746D] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all active:scale-[0.99] text-left cursor-pointer scroll-mt-24"
          >
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF5F3] border border-[#A4C6C1]/50 flex items-center justify-center shrink-0 text-[#38746D] group-hover:scale-105 transition-transform shadow-xs">
                <PlusCircle className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  Civic Reporting BPBD &bull; Validasi AI
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#132422] leading-snug">
                  Lapor Titik Banjir &amp; Butuh Bantuan
                </h3>
                <p className="text-xs sm:text-sm text-[#4B635F] mt-1 leading-relaxed">
                  Laporkan ketinggian air, tanggul jebol, atau minta evakuasi darurat dengan foto yang divalidasi model AI CNN.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#38746D] group-hover:underline">
                  <span>Isi Formulir Laporan Cepat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* ============================================================ */}
        {/* C. GRID: POSKO TERDEKAT & PELACAKAN STATUS ADUAN SAYA        */}
        {/* ============================================================ */}
        <section aria-label="Informasi Evakuasi dan Pelaporan" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SISI KIRI (7 Kolom): RINGKASAN POSKO AMAN TERDEKAT */}
          <div id="posko" className="lg:col-span-7 bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs space-y-5 text-left scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#38746D]" />
                  Posko Pengungsian Aktif Terdekat
                </h3>
                <p className="text-xs text-[#4B635F] mt-0.5">
                  Posko terverifikasi BPBD dengan sisa kapasitas dan dukungan logistik terpadu.
                </p>
              </div>
            </div>

            {/* List Posko */}
            <div className="space-y-3.5">
              {shelters.map((sh) => {
                const sisa = sh.capacityTotal - sh.capacityFilled;
                const percent = Math.round((sh.capacityFilled / sh.capacityTotal) * 100);

                return (
                  <div
                    key={sh.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] hover:border-[#38746D] transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-[#132422]">{sh.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sh.status === "TERSEDIA"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sh.status === "TERSEDIA" ? "Tersedia" : "Hampir Penuh"}
                          </span>
                        </div>
                        <p className="text-xs text-[#718783] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                          <span>{sh.location} &bull; <strong>{sh.distance}</strong></span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs font-bold text-[#132422]">
                          {sh.capacityFilled} / {sh.capacityTotal} Jiwa
                        </span>
                        <p className="text-[11px] text-[#4B635F]">Sisa {sisa} kuota tempat</p>
                      </div>
                    </div>

                    {/* Progress Bar Okupansi Posko */}
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 90 ? "bg-rose-500" : percent >= 70 ? "bg-amber-500" : "bg-[#38746D]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Fasilitas Posko */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sh.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#D5E4E0] text-[10px] text-[#4B635F] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar Posko */}
                    <div className="pt-2 border-t border-[#D5E4E0]/60 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenNav(sh)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Arahkan Rute</span>
                      </button>

                      <a
                        href={`tel:${sh.contactPhone.replace(/[^0-9]/g, "")}`}
                        className="inline-flex items-center gap-1 text-[11px] text-[#38746D] hover:underline font-medium"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{sh.contactPhone}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SISI KANAN (5 Kolom): PELACAKAN TIKET ADUAN SAYA (PRD FR-RPT-07 & FR-RPT-08) */}
          <div id="aduan" className="lg:col-span-5 bg-white rounded-3xl border border-[#D5E4E0] p-5 sm:p-6 shadow-xs space-y-5 text-left flex flex-col justify-between scroll-mt-24">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#38746D]" />
                    Pelacakan Aduan Saya
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-0.5">
                    Pantau status respons darurat laporan banjir Anda (Siklus PRD).
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EEF5F3] text-[#38746D]">
                  {complaints.length} Tiket
                </span>
              </div>

              {/* List Tiket Aduan */}
              <div className="space-y-3.5">
                {complaints.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] space-y-2.5 hover:border-[#38746D] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-[#132422] bg-white px-2 py-0.5 rounded border border-[#D5E4E0]">
                        #{item.ticketCode}
                      </span>
                      
                      {/* Badge Status Laporan Sesuai PRD Section 14.5 */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === "SUBMITTED"
                            ? "bg-slate-100 text-slate-800 border-slate-300"
                            : item.status === "VERIFIED"
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : item.status === "ASSIGNED"
                            ? "bg-purple-100 text-purple-900 border-purple-300"
                            : item.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                            : item.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : item.status === "REJECTED"
                            ? "bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {item.status === "SUBMITTED" && "Diterima"}
                        {item.status === "VERIFIED" && "Terverifikasi BPBD"}
                        {item.status === "ASSIGNED" && "Petugas Ditugaskan"}
                        {item.status === "IN_PROGRESS" && "Sedang Ditangani"}
                        {item.status === "RESOLVED" && "Selesai"}
                        {item.status === "REJECTED" && "Ditolak"}
                        {item.status === "CANCELLED" && "Dibatalkan"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF5F3] text-[#38746D]">
                          {item.categoryLabel}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : item.severity === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          Prioritas: {item.severity}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#132422]">{item.title}</h4>
                      <p className="text-xs text-[#718783] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#38746D]" />
                        <span>{item.location} {item.waterLevelText && <>&bull; <strong>Air: {item.waterLevelText}</strong></>}</span>
                      </p>
                    </div>

                    {/* AI Validation Indicator (PRD Section 9) */}
                    {item.aiScore && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Validasi AI: <strong>Terindikasi Banjir ({Math.round(item.aiScore.confidence * 100)}%)</strong></span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-white border border-[#D5E4E0]/80 text-[11px] text-[#4B635F] leading-relaxed">
                      <p className="font-semibold text-[#132422] mb-0.5">Tindak Lanjut Pusdalops:</p>
                      <p>{item.note}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#718783] pt-1">
                      <span>Waktu Lapor: {item.createdAt}</span>

                      {/* PRD FR-RPT-08: Batalkan laporan jika status masih SUBMITTED */}
                      {item.status === "SUBMITTED" && (
                        <button
                          type="button"
                          onClick={() => handleCancelReport(item.id)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Batalkan Laporan</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Helper Hotline (PRD FR-EVAC-03) */}
            <div id="kontak" className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#A4C6C1]/50 space-y-3 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#38746D] text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#132422]">Kontak Darurat Terpadu 24 Jam</p>
                    <p className="text-[11px] text-[#4B635F]">BPBD, SAR, PMI, Damkar, &amp; Kepolisian</p>
                  </div>
                </div>

                <a
                  href="tel:112"
                  className="px-3 py-1.5 rounded-full bg-[#38746D] text-white text-xs font-bold shadow-xs hover:bg-[#24544E] transition-colors"
                >
                  112 (Bebas Pulsa)
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowContactsModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#D5E4E0] text-[#38746D] hover:bg-[#F8FAF9] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Buka Seluruh Kontak Darurat Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* 3. MODAL: FORMULIR PELAPORAN DARURAT WARGA (PRD FR-RPT-01)   */}
      {/* ============================================================ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
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
                <h3 className="text-lg font-bold text-[#132422]">Kirim Laporan Kejadian Wilayah</h3>
                <p className="text-xs text-[#4B635F]">Formulir standar PRD DERMAYU &bull; Terhubung Pusdalops BPBD</p>
              </div>
            </div>

            {reportSubmittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Laporan Berhasil Diterima!</h4>
                <p className="text-xs text-emerald-700">
                  Nomor tiket darurat diterbitkan. Model AI CNN sedang memvalidasi foto laporan untuk penentuan prioritas tugas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* 1. Kategori Laporan (PRD Section 7.3) */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kategori Laporan (PRD)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { code: "FLOOD", label: "Banjir / Rob", icon: Droplets, ai: true },
                      { code: "LEVEE", label: "Tanggul Jebol", icon: ShieldCheck, ai: false },
                      { code: "DRAINAGE", label: "Drainase Mampet", icon: Waves, ai: false },
                      { code: "ROAD", label: "Jalan Rusak", icon: Navigation, ai: false },
                      { code: "TREE", label: "Pohon Tumbang", icon: AlertTriangle, ai: false },
                      { code: "OTHER", label: "Aduan Lainnya", icon: FileText, ai: false },
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
                    Judul Kejadian / Kondisi
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Contoh: Tanggul meluap rendam 15 rumah warga"
                    required
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3.5 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D]"
                  />
                </div>

                {/* 3. Lokasi Detail */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Lokasi Detail (Kecamatan / Desa / RT / RW / Patokan)
                  </label>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="Contoh: Desa Eretan Wetan RT 03/02 Dekat Masjid Jami"
                    required
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3.5 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D]"
                  />
                </div>

                {/* 4. Unggah Foto Laporan (PRD FR-RPT-01 / FR-RPT-03) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#132422]">
                      Foto Bukti Kejadian (1–5 Foto)
                    </label>
                    <span className="text-[11px] text-[#718783]">{reportPhotos.length} / 5 Foto</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {reportPhotos.map((photo, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#D5E4E0] group">
                          <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {reportPhotos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-[#A4C6C1] hover:border-[#38746D] bg-[#F8FAF9] flex flex-col items-center justify-center text-[#38746D] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
                        >
                          <Camera className="w-5 h-5 mb-0.5" />
                          <span className="text-[9px] font-bold">+ Foto</span>
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

                    <p className="text-[10px] text-[#718783] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#38746D]" />
                      <span>Foto banjir divalidasi otomatis oleh model CNN untuk prioritas evakuasi.</span>
                    </p>
                  </div>
                </div>

                {/* 5. Estimasi Ketinggian Air & Tingkat Keparahan (PRD FR-RPT-04) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportCategory === "FLOOD" ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#132422] mb-1">
                        Estimasi Ketinggian Air (PRD)
                      </label>
                      <select
                        value={reportWaterLevel}
                        onChange={(e) => setReportWaterLevel(e.target.value as WaterLevelCode)}
                        className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3 text-xs text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                      >
                        <option value="ANKLE">Semata Kaki (10-30 cm)</option>
                        <option value="KNEE">Setinggi Lutut (40-60 cm)</option>
                        <option value="THIGH">Setinggi Paha (70-90 cm)</option>
                        <option value="WAIST">Setinggi Pinggang (100-120 cm)</option>
                        <option value="ABOVE_CHEST">Di Atas Dada / Atap (&gt; 120 cm)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#132422] mb-1">
                        Status Kategori
                      </label>
                      <input
                        type="text"
                        disabled
                        value={reportCategory}
                        className="w-full h-11 bg-gray-100 border border-gray-200 rounded-xl px-3 text-xs text-gray-500 font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1">
                      Tingkat Keparahan (Severity)
                    </label>
                    <select
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value as SeverityLevel)}
                      className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-3 text-xs text-[#132422] outline-none focus:border-[#38746D] cursor-pointer"
                    >
                      <option value="LOW">Rendah (Genangan ringan)</option>
                      <option value="MEDIUM">Sedang (Mulai masuk pekarangan)</option>
                      <option value="HIGH">Tinggi (Air masuk dalam rumah)</option>
                      <option value="CRITICAL">Kritis (Darurat keselamatan jiwa)</option>
                    </select>
                  </div>
                </div>

                {/* 6. Kebutuhan Darurat Lapangan */}
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                    Kebutuhan Mendesak Lapangan:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Perahu Evakuasi", "Bantuan Medis Lansia", "Susu / Makanan Bayi", "Dapur Umum", "Tenda Pengungsi"].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleUrgentNeed(item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          reportUrgentNeeds.includes(item)
                            ? "bg-[#38746D] text-white border-[#38746D]"
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
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Contoh: Ada 2 lansia stroke butuh tandu darurat segera."
                    className="w-full bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl p-3 text-xs sm:text-sm text-[#132422] outline-none focus:border-[#38746D]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-3 rounded-full border border-[#D5E4E0] text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Kirim Laporan Darurat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: RINCIAN DERING EVAKUASI AKTIF (PRD FR-ALERT-08)     */}
      {/* ============================================================ */}
      {showDeringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[90vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowDeringModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertOctagon className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  LEVEL: SIAGA (ALERT-2)
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#132422] mt-0.5">
                  Peringatan Dini Rob Pesisir &amp; Luapan DAS Cimanuk
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#A4C6C1]/60 text-xs text-[#132422] space-y-2">
              <p className="font-semibold text-[#38746D]">Target Wilayah Terdampak:</p>
              <p className="text-[#4B635F]">
                Kecamatan Kandanghaur (Eretan Wetan, Eretan Kulon), Cantigi, dan Losarang.
              </p>
              <div className="pt-2 border-t border-[#A4C6C1]/40 flex justify-between text-[11px] text-[#718783]">
                <span>Diterbitkan: <strong>Pusdalops PB BPBD</strong></span>
                <span>Masa Berlaku: <strong>12 Jam ke Depan</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#132422] uppercase tracking-wider">
                Instruksi Tindakan Warga:
              </h4>
              <ul className="text-xs text-[#4B635F] space-y-1.5 list-disc pl-4">
                <li>Amankan dokumen berharga dan letakkan barang elektronik di tempat yang lebih tinggi.</li>
                <li>Matikan sekring listrik utama rumah jika genangan air mulai masuk ke teras.</li>
                <li>Bantu evakuasi kelompok rentan (lansia, ibu hamil, balita) ke Posko Pengungsian Balai Desa.</li>
                <li>Ikuti panduan rute aman bebas banjir yang tersedia di aplikasi DERMAYU.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeringModal(false);
                  handleOpenNav();
                }}
                className="flex-1 py-3 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs text-center cursor-pointer"
              >
                Arahkan ke Posko Pengungsian
              </button>
              <button
                type="button"
                onClick={() => setShowDeringModal(false)}
                className="px-5 py-3 rounded-full border border-[#D5E4E0] text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: DAFTAR KONTAK DARURAT 24 JAM (PRD FR-EVAC-03)       */}
      {/* ============================================================ */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[90vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowContactsModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#132422]">
                  Daftar Kontak Darurat Kabupaten Indramayu
                </h3>
                <p className="text-xs text-[#4B635F]">
                  Layanan terpadu 24 jam bebas pulsa &amp; respons cepat bencana
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] flex items-center justify-between gap-3 hover:border-[#38746D] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#132422] truncate">{contact.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#D5E4E0] text-[#38746D] shrink-0">
                        {contact.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B635F] mt-0.5">{contact.description}</p>
                  </div>

                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                    className="px-3.5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowContactsModal(false)}
                className="w-full py-2.5 rounded-full border border-[#D5E4E0] text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: PANDUAN PETA NAVIGASI EVAKUASI AMAN                */}
      {/* ============================================================ */}
      {showNavModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[90vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setShowNavModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#38746D] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#132422]">
                  Panduan Navigasi: Rute Bebas Banjir Menuju Posko
                </h3>
                <p className="text-xs text-[#4B635F]">
                  Tujuan: <strong>{selectedShelterForNav?.name || "Posko Pengungsian"}</strong>
                </p>
              </div>
            </div>

            {/* Peta Mini Simulasi Rute Bebas Genangan */}
            <div className="w-full h-52 sm:h-64 rounded-2xl bg-[#EEF5F3] border-2 border-dashed border-[#A4C6C1] relative overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38746D_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38746D] text-white text-xs font-bold shadow-xs">
                  <Compass className="w-4 h-4 animate-spin text-amber-300" />
                  <span>RUTE TERVERIFIKASI AMAN DILALUI</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-[#132422]">
                  Gunakan Jalur Tanggul Barat &rarr; Jembatan Beton &rarr; Posko Balai Desa
                </h4>
                <p className="text-xs text-[#4B635F] max-w-md">
                  Hindari Jl. Muara Lama KM 2 karena genangan rob mencapai 70 cm dan arus air deras.
                </p>
              </div>

              {/* Status Rute Bar */}
              <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-xs rounded-xl p-2.5 border border-[#D5E4E0] flex items-center justify-between text-xs text-[#132422]">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Elevasi Jalan: +1.8m dpl
                </span>
                <span className="font-bold text-[#38746D]">Estimasi: 4-6 Menit</span>
              </div>
            </div>

            {/* Detail Posko Terpilih */}
            {selectedShelterForNav && (
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#132422]">{selectedShelterForNav.name}</span>
                  <span className="font-semibold text-[#38746D]">{selectedShelterForNav.distance}</span>
                </div>
                <p className="text-gray-500">{selectedShelterForNav.location}</p>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span>Kontak Petugas Lapangan: <strong>{selectedShelterForNav.contactPerson}</strong></span>
                  <a
                    href={`tel:${selectedShelterForNav.contactPhone}`}
                    className="font-bold text-[#38746D] hover:underline"
                  >
                    {selectedShelterForNav.contactPhone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNavModal(false)}
                className="px-5 py-2.5 rounded-full bg-[#38746D] text-white text-xs font-semibold hover:bg-[#24544E] transition-colors cursor-pointer"
              >
                Saya Mengerti, Mulai Berjalan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
