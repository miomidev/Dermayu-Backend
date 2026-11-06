"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ArrowLeft,
  X,
  Sparkles,
  Navigation,
  Building2,
  AlertCircle,
  PhoneCall,
  Users,
  BookOpen,
  MapPin,
  ChevronRight,
  Droplets,
  Activity,
  FileText,
  Clock,
} from "lucide-react";

export interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "Fitur" | "Posko" | "Wilayah" | "Kontak" | "Panduan";
  href: string;
  keywords: string[];
  badge?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// Data Pencarian Komprehensif DERMAYU
export const searchableData: SearchItem[] = [
  // 1. Fitur Utama
  {
    id: "f-rute",
    title: "Peta & Rute Evakuasi Bebas Banjir",
    description: "Panduan navigasi rute jalan aman dan bebas genangan air rob",
    category: "Fitur",
    href: "/warga/evakuasi",
    keywords: ["rute", "jalan", "evakuasi", "peta", "navigasi", "aman", "bebas", "genangan", "jalur"],
    badge: "Navigasi",
    icon: Navigation,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "f-lapor",
    title: "Lapor Titik Genangan & Banjir Baru",
    description: "Unggah foto genangan air untuk divalidasi kecerdasan buatan AI CNN",
    category: "Fitur",
    href: "/warga/lapor",
    keywords: ["lapor", "titik", "banjir", "genangan", "foto", "aduan", "ai", "cnn", "air"],
    badge: "AI CNN",
    icon: AlertCircle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    id: "f-posko",
    title: "Pantauan Posko Evakuasi & Daya Tampung",
    description: "Cek ketersediaan tempat tidur, dapur umum, dan kontak pengurus posko",
    category: "Fitur",
    href: "/warga/posko",
    keywords: ["posko", "shelter", "pengungsi", "daya", "tampung", "tenda", "tidur", "logistik", "kuota"],
    badge: "Kapasitas Live",
    icon: Building2,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    id: "f-komunitas",
    title: "Forum Komunitas Siaga Warga",
    description: "Ruang berbagi informasi dan kondisi lapangan antar sesama warga Indramayu",
    category: "Fitur",
    href: "/warga/komunitas",
    keywords: ["komunitas", "forum", "warga", "diskusi", "info", "lapangan", "sesama"],
    badge: "Komunitas",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "f-aduan",
    title: "Riwayat & Status Aduan Bencana Saya",
    description: "Pantau perkembangan tindak lanjut tiket laporan aduan banjir Anda",
    category: "Fitur",
    href: "/warga/aduan",
    keywords: ["aduan", "tiket", "status", "riwayat", "laporan", "dmy", "tindak", "lanjut"],
    badge: "Tiket",
    icon: FileText,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "f-kontak",
    title: "Pusdalops BPBD & Kontak Darurat 112",
    description: "Layanan darurat bebas pulsa 24 jam penanganan bencana Indramayu",
    category: "Kontak",
    href: "/warga/kontak",
    keywords: ["kontak", "darurat", "112", "bpbd", "telepon", "bebas", "pulsa", "pusdalops", "bantuan", "sar"],
    badge: "24 Jam Bebas Pulsa",
    icon: PhoneCall,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "f-panduan",
    title: "Buku Panduan & Mitigasi Siaga Bencana",
    description: "Pedoman evakuasi darurat, tas siaga bencana, dan pertolongan pertama",
    category: "Panduan",
    href: "/panduan",
    keywords: ["panduan", "buku", "mitigasi", "tas", "siaga", "edukasi", "bencana", "pertolongan"],
    badge: "Edukasi",
    icon: BookOpen,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },

  // 2. Posko Evakuasi Lapangan Riil Indramayu
  {
    id: "sh-1",
    title: "Posko Balai Desa Eretan Wetan",
    description: "Kec. Kandanghaur • Kapasitas 250 jiwa • Dapur Umum Tagana Aktif",
    category: "Posko",
    href: "/warga/posko",
    keywords: ["eretan", "wetan", "balai", "desa", "kandanghaur", "posko", "tagana", "dapur"],
    badge: "Tersedia",
    icon: Building2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "sh-2",
    title: "Posko GOR Mini Kandanghaur",
    description: "Jl. Olahraga • Titik Kumpul Utama • Kapasitas 500 Jiwa • Tenda Pleton",
    category: "Posko",
    href: "/warga/posko",
    keywords: ["gor", "mini", "kandanghaur", "posko", "utama", "titik", "kumpul", "tenda", "pleton"],
    badge: "Titik Kumpul",
    icon: Building2,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    id: "sh-3",
    title: "Posko SMP Negeri 1 Cantigi",
    description: "Kec. Cantigi • Kapasitas 200 jiwa • Tim Medis & Dokter Siaga",
    category: "Posko",
    href: "/warga/posko",
    keywords: ["cantigi", "smp", "posko", "sekolah", "medis", "dokter", "siaga"],
    badge: "Hampir Penuh",
    icon: Building2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "sh-4",
    title: "Posko Kantor Kecamatan Losarang",
    description: "Jl. Pantura Losarang • Posko Induk Distribusi Logistik dan Bantuan",
    category: "Posko",
    href: "/warga/posko",
    keywords: ["losarang", "kecamatan", "kantor", "posko", "induk", "logistik", "distribusi"],
    badge: "Posko Induk",
    icon: Building2,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    id: "sh-5",
    title: "Posko Balai Desa Parean Girang",
    description: "Kec. Kandanghaur • Jalur Tanggul Darat Aman • Kapasitas 180 Jiwa",
    category: "Posko",
    href: "/warga/posko",
    keywords: ["parean", "girang", "balai", "desa", "kandanghaur", "posko", "tanggul"],
    badge: "Tersedia",
    icon: Building2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },

  // 3. Titik Wilayah & Telemetri Air
  {
    id: "loc-eretan",
    title: "Wilayah Pesisir Eretan Wetan",
    description: "Titik Genangan Rob 45 cm • Akses Jalan Pelelangan Ikan Tergenang",
    category: "Wilayah",
    href: "/warga/dashboard",
    keywords: ["eretan", "wetan", "pesisir", "pantai", "rob", "genangan", "pelelangan", "ikan"],
    badge: "Genangan 45 cm",
    icon: MapPin,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    id: "loc-kandanghaur",
    title: "Wilayah Siaga Kandanghaur",
    description: "Status Siaga II (Waspada Rob) • Tim SAR BPBD Stanby di Lokasi",
    category: "Wilayah",
    href: "/warga/dashboard",
    keywords: ["kandanghaur", "siaga", "wilayah", "bpbd", "sar", "waspada", "rob"],
    badge: "SIAGA II",
    icon: MapPin,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "loc-cantigi",
    title: "Wilayah Muara Cantigi & Pasekan",
    description: "Pantauan Pasang Air Laut Muara Sungai • Akses Tanggul Kering",
    category: "Wilayah",
    href: "/warga/evakuasi",
    keywords: ["cantigi", "pasekan", "muara", "sungai", "pasang", "tanggul"],
    badge: "Waspada",
    icon: MapPin,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "tel-cimanuk",
    title: "Sensor TMA Sungai Cimanuk (Bendung Rentang)",
    description: "Debit Aliran 310 m³/s • Status Normal-Waspada Aliran Muara",
    category: "Wilayah",
    href: "/warga/dashboard",
    keywords: ["cimanuk", "debit", "tma", "bendung", "rentang", "sensor", "sungai", "meter"],
    badge: "310 m³/s",
    icon: Activity,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    id: "tel-muara",
    title: "Radar Ketinggian Air Muara Indramayu",
    description: "Ketinggian sensor air pasang laut +65 cm dari permukaan normal",
    category: "Wilayah",
    href: "/warga/dashboard",
    keywords: ["radar", "muara", "air", "ketinggian", "pasang", "laut", "sensor"],
    badge: "+65 cm",
    icon: Droplets,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },

  // 4. Nomor Kontak Darurat
  {
    id: "c-bpbd",
    title: "Call Center BPBD Kabupaten Indramayu",
    description: "Hotline Panggilan Cepat: (0234) 272-113 atau Hubungi 112",
    category: "Kontak",
    href: "/warga/kontak",
    keywords: ["bpbd", "indramayu", "call", "center", "hotline", "telepon", "112"],
    badge: "Bebas Pulsa",
    icon: PhoneCall,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "c-sar",
    title: "Pos SAR Penyelamatan Air Basarnas",
    description: "Evakuasi perahu karet darurat warga terjebak genangan banjir",
    category: "Kontak",
    href: "/warga/kontak",
    keywords: ["sar", "basarnas", "perahu", "karet", "evakuasi", "penyelamatan", "air"],
    badge: "Evakuasi",
    icon: PhoneCall,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

// Saran Kata Kunci Populer
const popularKeywords = [
  { text: "Rute Bebas Banjir", icon: Navigation },
  { text: "Posko Pengungsian", icon: Building2 },
  { text: "Lapor Genangan", icon: AlertCircle },
  { text: "Kandanghaur", icon: MapPin },
  { text: "Eretan Wetan", icon: MapPin },
  { text: "Nomor Darurat 112", icon: PhoneCall },
  { text: "Debit Cimanuk", icon: Activity },
  { text: "Bantuan Logistik", icon: Sparkles },
  { text: "Kapasitas Live", icon: Building2 },
  { text: "Cantigi", icon: MapPin },
];

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input saat overlay dibuka agar keyboard langsung muncul di mobile
  useEffect(() => {
    if (isOpen) {
      const focusTarget = () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      // Panggil segera dan sedikit delay untuk memastikan kesiapan virtual keyboard mobile
      focusTarget();
      const t1 = setTimeout(focusTarget, 60);
      const t2 = setTimeout(focusTarget, 160);

      // Kunci scroll halaman belakang
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Listener tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter pencarian
  const trimmedQuery = query.trim().toLowerCase();
  const filteredResults = trimmedQuery
    ? searchableData.filter((item) => {
        const matchTitle = item.title.toLowerCase().includes(trimmedQuery);
        const matchDesc = item.description.toLowerCase().includes(trimmedQuery);
        const matchCat = item.category.toLowerCase().includes(trimmedQuery);
        const matchKeywords = item.keywords.some((k) => k.includes(trimmedQuery));
        return matchTitle || matchDesc || matchCat || matchKeywords;
      })
    : [];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      handleSelect(filteredResults[0].href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-search-overlay-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col md:hidden overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian Cepat DERMAYU"
        >
          {/* ============================================================ */}
          {/* 1. APP BAR ATAS HIJAU KHAS DERMAYU (SEARCH BAR MEMANJANG)    */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-r from-[#38746D] via-[#2E6A63] to-[#1D443F] px-4 pt-3.5 pb-3 shadow-md shrink-0">
            <motion.div
              layoutId="mobile-search-pill"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="w-full bg-white rounded-full shadow-md flex items-center px-3 py-1.5 text-[#1D443F]"
            >
              {/* Tombol Kembali (ArrowLeft) */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#1D443F] active:scale-90 transition-all cursor-pointer shrink-0"
                aria-label="Tutup Pencarian"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Input Pencarian dengan Auto-Focus & Virtual Keyboard Trigger */}
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Cari rute, posko, aduan, info siaga..."
                className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />

              {/* Tombol Clear / Ikon Cari */}
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="p-1 text-[#38746D]/60 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          </div>

          {/* ============================================================ */}
          {/* 2. BODY KONTEN: SARAN KEYWORD ATAU HASIL PENCARIAN          */}
          {/* ============================================================ */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
            {trimmedQuery === "" ? (
              /* A. STATE AWAL: SARAN KEYWORD & AKSES CEPAT FITUR */
              <div className="space-y-5">
                {/* 1. Saran Kata Kunci Relevan */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Saran Kata Kunci Siaga
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {popularKeywords.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.text}
                          type="button"
                          onClick={() => {
                            setQuery(item.text);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <IconComp className="w-3 h-3 text-[#38746D]" />
                          <span>{item.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Akses Cepat Navigasi Fitur */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Akses Cepat Fitur Kesiapsiagaan
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelect("/warga/evakuasi")}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-emerald-300 hover:shadow-xs transition-all flex items-start gap-2.5 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          Rute Aman
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                          Bebas Genangan Rob
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect("/warga/lapor")}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-rose-300 hover:shadow-xs transition-all flex items-start gap-2.5 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          Lapor Banjir
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                          Validasi AI CNN
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect("/warga/posko")}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-teal-300 hover:shadow-xs transition-all flex items-start gap-2.5 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          Daftar Posko
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                          Shelter Pengungsi
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect("/warga/kontak")}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left hover:border-amber-300 hover:shadow-xs transition-all flex items-start gap-2.5 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          Darurat 112
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                          Pusdalops Bebas Pulsa
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Status Lapangan Siaga */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-[#1D443F]">
                      Status Siaga Indramayu:
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      SIAGA II
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect("/warga/dashboard")}
                    className="text-[11px] font-bold text-[#38746D] hover:underline"
                  >
                    Pantau &gt;
                  </button>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              /* B. STATE HASIL PENCARIAN DITEMUKAN */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hasil Pencarian ({filteredResults.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tekan enter untuk pilih pertama
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredResults.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.href)}
                        className="w-full p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between text-left group active:scale-[0.99] cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                          >
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#38746D] transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* C. STATE TIDAK DITEMUKAN HASIL */
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <Search className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Coba periksa ejaan atau gunakan saran kata kunci seperti <strong>posko</strong>, <strong>rute</strong>, atau <strong>kandanghaur</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="mt-4 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors active:scale-95 cursor-pointer"
                >
                  Bersihkan Pencarian
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

