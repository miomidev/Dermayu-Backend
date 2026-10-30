"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  ShieldAlert,
  Flame,
  HeartPulse,
  Radio,
  Search,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  agency: string;
  phone: string;
  altPhone?: string;
  whatsapp?: string;
  category: "all" | "sar" | "medis" | "keamanan" | "damkar";
  address: string;
  coverage: string;
  is24Hours: boolean;
  priority: "utama" | "pendukung";
  icon: typeof PhoneCall;
  badgeColor: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "call-center-112",
    name: "Call Center Darurat Indramayu",
    agency: "Pemerintah Kabupaten Indramayu",
    phone: "112",
    category: "sar",
    address: "Pusdalops PB Indramayu",
    coverage: "Seluruh 31 Kecamatan se-Kabupaten Indramayu",
    is24Hours: true,
    priority: "utama",
    icon: ShieldAlert,
    badgeColor: "bg-red-500 text-white",
  },
  {
    id: "bpbd-indramayu",
    name: "Pusdalops BPBD Indramayu",
    agency: "Badan Penanggulangan Bencana Daerah",
    phone: "0234-272444",
    altPhone: "0812-2223-3112",
    whatsapp: "6281222233112",
    category: "sar",
    address: "Jl. By Pass Sudirman No. 1, Karanganyar, Indramayu",
    coverage: "Operasi SAR Bencana Banjir & Gelombang Rob",
    is24Hours: true,
    priority: "utama",
    icon: Radio,
    badgeColor: "bg-amber-500 text-white",
  },
  {
    id: "basarnas-cirebon",
    name: "Basarnas Pos SAR Cirebon / Indramayu",
    agency: "Badan Nasional Pencarian dan Pertolongan",
    phone: "115",
    altPhone: "0231-203115",
    category: "sar",
    address: "Wilayah Operasi Pantura Jabar Bagian Timur",
    coverage: "Evakuasi Air Kritis & Penyelamatan Laut Pantura",
    is24Hours: true,
    priority: "utama",
    icon: ShieldAlert,
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "rsud-indramayu",
    name: "IGD RSUD Indramayu",
    agency: "Rumah Sakit Umum Daerah Indramayu",
    phone: "0234-272655",
    altPhone: "0234-272844",
    category: "medis",
    address: "Jl. Murahnara No. 7, Sindang, Indramayu",
    coverage: "Rujukan Medis Gawat Darurat & Korban Trauma",
    is24Hours: true,
    priority: "utama",
    icon: HeartPulse,
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    id: "pmi-indramayu",
    name: "PMI Kabupaten Indramayu",
    agency: "Palang Merah Indonesia Cabang Indramayu",
    phone: "0234-272555",
    whatsapp: "62811234555",
    category: "medis",
    address: "Jl. DI Panjaitan No. 44, Indramayu",
    coverage: "Ambulans Evakuasi Medis & Dapur Umum",
    is24Hours: true,
    priority: "pendukung",
    icon: HeartPulse,
    badgeColor: "bg-rose-600 text-white",
  },
  {
    id: "damkar-indramayu",
    name: "Dinas Pemadam Kebakaran & Penyelamatan",
    agency: "Satpol PP dan Damkar Indramayu",
    phone: "0234-271113",
    category: "damkar",
    address: "Pos Utama Damkar Indramayu Kota",
    coverage: "Penyelamatan Warga, Binatang Buas & Korsleting",
    is24Hours: true,
    priority: "pendukung",
    icon: Flame,
    badgeColor: "bg-orange-500 text-white",
  },
  {
    id: "polres-indramayu",
    name: "SPKT Polres Indramayu",
    agency: "Kepolisian Resor Indramayu",
    phone: "110",
    altPhone: "0234-274110",
    category: "keamanan",
    address: "Jl. Gatot Subroto No. 64, Indramayu",
    coverage: "Keamanan Wilayah Evakuasi & Pengawalan Logistik",
    is24Hours: true,
    priority: "pendukung",
    icon: ShieldCheck,
    badgeColor: "bg-slate-700 text-white",
  },
  {
    id: "pln-indramayu",
    name: "PLN Pengaduan Gangguan / Pemadaman",
    agency: "PT PLN (Persero) UP3 Indramayu",
    phone: "123",
    category: "keamanan",
    address: "Jl. Siliwangi No. 12, Indramayu",
    coverage: "Pemutusan Aliran Listrik Darurat Saat Banjir",
    is24Hours: true,
    priority: "pendukung",
    icon: AlertTriangle,
    badgeColor: "bg-yellow-600 text-white",
  },
];

export default function KontakDaruratPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredContacts = emergencyContacts.filter((c) => {
    const matchCat = selectedCategory === "all" || c.category === selectedCategory;
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.coverage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
        {/* BANNER UTAMA PANGGILAN CEPAT */}
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-[#1D443F] text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Siaga Siaga Darurat 24/7 Pantura
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Panggilan Darurat Bebas Pulsa: Hubungi 112
              </h2>
              <p className="text-xs sm:text-sm text-red-50 leading-relaxed">
                Jika Anda atau kerabat dalam situasi genting terjebak banjir rob, lansia/balita butuh
                evakuasi perahu karet, segera hubungi Call Center Terpadu Kabupaten Indramayu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="tel:112"
                className="px-6 py-3.5 rounded-2xl bg-white text-red-600 font-extrabold text-sm shadow-md hover:bg-red-50 transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <PhoneCall className="w-4 h-4 fill-red-600" />
                Telepon 112 Sekarang
              </a>
              <a
                href="https://wa.me/6281222233112?text=Halo%20Pusdalops%20BPBD%20Indramayu,%20saya%20butuh%20bantuan%20darurat%20banjir."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-[#1D443F]/80 backdrop-blur-md border border-white/20 text-white font-bold text-xs hover:bg-[#1D443F] transition-all flex items-center justify-center gap-2"
              >
                WhatsApp Pusdalops
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* PANDUAN RINGKAS SAAT MENGHUBUNGI PETUGAS */}
        <div className="p-5 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#38746D] text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#132422]">
                Tips Cepat Saat Menghubungi Petugas Darurat
              </h4>
              <p className="text-[11px] text-[#4B635F] mt-0.5">
                Sebutkan: <strong>1. Alamat/Patokan jelas</strong>, <strong>2. Ketinggian air saat ini</strong>, dan <strong>3. Jumlah lansia/anak/korban sakit</strong> agar regu SAR membawa peralatan yang tepat.
              </p>
            </div>
          </div>
          <Link
            href="/warga/lapor"
            className="text-xs font-bold text-[#38746D] hover:text-[#1D443F] flex items-center gap-1.5 shrink-0 hover:underline"
          >
            Kirim Laporan Form Online
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* PENCARIAN & FILTER KATEGORI */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Semua Instansi" },
              { id: "sar", label: "Evakuasi & SAR" },
              { id: "medis", label: "Medis & Ambulans" },
              { id: "damkar", label: "Damkar & Rescue" },
              { id: "keamanan", label: "Polri & PLN" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "bg-white text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari instansi, nomor, layanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] transition-colors"
            />
          </div>
        </div>

        {/* DAFTAR KARTU KONTAK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => {
            const Icon = contact.icon;
            const isCopied = copiedId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-5 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs hover:border-[#88BDB6] transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#132422] leading-tight">
                          {contact.name}
                        </h3>
                        <p className="text-[11px] text-[#4B635F] mt-0.5">{contact.agency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {contact.is24Hours && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          24 Jam
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{contact.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#38746D] shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed font-medium text-[#132422]">
                        Layanan: {contact.coverage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nomor Telepon & Tombol Aksi */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#4B635F] tracking-wider">
                      Nomor Siaga
                    </span>
                    <span className="text-base font-extrabold text-[#1D443F]">
                      {contact.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(contact.id, contact.phone)}
                      className="px-3 py-2 rounded-xl border border-[#D5E4E0] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Salin Nomor"
                    >
                      {isCopied ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tersalin
                        </span>
                      ) : (
                        "Salin"
                      )}
                    </button>

                    <a
                      href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                      className="px-4 py-2 rounded-xl bg-[#1D443F] hover:bg-[#38746D] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Panggil
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}

