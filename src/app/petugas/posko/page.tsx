"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  MapPin,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertTriangle,
  Power,
  Edit2,
  Trash2,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Utensils,
  HeartPulse,
  Package,
  Layers,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { getActiveSession, type UserSession } from "@/utils/authSession";
import {
  getAllPosko,
  createPosko,
  updatePosko,
  deletePosko,
  toggleActivePosko,
  type PoskoRecord,
} from "@/utils/poskoService";

const PoskoMapPicker = dynamic(
  () => import("@/components/posko/PoskoMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[380px] rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Building2 className="w-8 h-8 animate-pulse text-[#38746D]" />
        <span className="text-xs font-medium">Memuat Peta Interaktif Penentuan Titik...</span>
      </div>
    ),
  }
);

const DISTRICT_LIST_OPTIONS = [
  "Kandanghaur",
  "Cantigi",
  "Losarang",
  "Pasekan",
  "Indramayu",
  "Jatibarang",
  "Anjatan",
  "Haurgeulis",
  "Juntinyuat",
  "Karangampel",
];

const DISTRICT_COORDS: Record<string, [number, number]> = {
  Kandanghaur: [-6.356, 108.138],
  Cantigi: [-6.335, 108.252],
  Losarang: [-6.402, 108.156],
  Pasekan: [-6.302, 108.318],
  Indramayu: [-6.326, 108.324],
  Jatibarang: [-6.474, 108.311],
  Anjatan: [-6.375, 108.025],
  Haurgeulis: [-6.458, 107.971],
  Juntinyuat: [-6.417, 108.435],
  Karangampel: [-6.467, 108.452],
};

const FACILITY_OPTIONS = [
  "Aula",
  "Dapur Umum",
  "Toilet",
  "Genset",
  "Posko Medis",
  "Ambulans",
  "Ruang Anak",
  "Logistik",
  "Air Bersih",
];

export default function PetugasPoskoPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [shelters, setShelters] = useState<PoskoRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "MINE">("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Modal State
  const [editingPosko, setEditingPosko] = useState<PoskoRecord | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    kapasitas: 0,
    terisi: 0,
    status: "TERSEDIA" as PoskoRecord["status"],
  });

  // Tambah Posko Baru (Inline View State)
  const [isCreatingPosko, setIsCreatingPosko] = useState(false);
  const [isSubmittingPosko, setIsSubmittingPosko] = useState(false);
  const [createForm, setCreateForm] = useState({
    nama: "",
    alamat: "",
    kecamatan: "Kandanghaur",
    pj: "",
    telp: "",
    kapasitas: 200,
    lat: -6.356,
    lng: 108.138,
    fasilitas: ["Aula", "Dapur Umum", "Toilet", "Genset"],
  });

  // Handler: Submit Tambah Posko Baru
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.nama.trim()) {
      alert("Silakan masukkan nama posko.");
      return;
    }
    if (!createForm.alamat.trim()) {
      alert("Silakan masukkan alamat posko.");
      return;
    }

    setIsSubmittingPosko(true);
    try {
      const created = createPosko(
        {
          nama: createForm.nama,
          alamat: createForm.alamat,
          kecamatan: createForm.kecamatan,
          kapasitas: Number(createForm.kapasitas) || 100,
          lat: createForm.lat,
          lng: createForm.lng,
          fasilitas: createForm.fasilitas,
          kontak: {
            pj: createForm.pj || "Petugas Pusdalops",
            telp: createForm.telp || "0812-3456-7890",
          },
        },
        { id: officerId }
      );

      // Refresh data posko lokal
      setShelters(getAllPosko());
      setNotification({
        type: "success",
        text: `Posko "${created.nama}" di Kec. ${created.kecamatan} berhasil ditambahkan dan aktif pada sistem!`,
      });
      setIsCreatingPosko(false);
      setCreateForm({
        nama: "",
        alamat: "",
        kecamatan: "Kandanghaur",
        pj: "",
        telp: "",
        kapasitas: 200,
        lat: -6.356,
        lng: 108.138,
        fasilitas: ["Aula", "Dapur Umum", "Toilet", "Genset"],
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Gagal membuat posko baru.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmittingPosko(false);
    }
  };

  // Muat Sesi Petugas & Dataset 100 Posko
  useEffect(() => {
    const session = getActiveSession();
    const activeOfficer = session || {
      id: "petugas-01",
      name: "Petugas BPBD",
      fullName: "Petugas BPBD Indramayu",
      email: "petugas@dermayu.id",
      role: "petugas" as const,
      district: "Pusdalops BPBD Indramayu",
      lastDashboardActive: Date.now(),
    };
    setCurrentUser(activeOfficer);

    setShelters(getAllPosko());

    const handleUpdate = () => {
      setShelters(getAllPosko());
    };
    window.addEventListener("dermayu_posko_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("dermayu_posko_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const officerId = currentUser?.id || "petugas-01";

  // Metrik Kapasitas
  const totalCapacity = shelters.reduce((acc, s) => acc + s.kapasitas, 0);
  const totalOccupants = shelters.reduce((acc, s) => acc + s.terisi, 0);
  const totalAvailable = totalCapacity - totalOccupants;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;
  const myPoskoCount = shelters.filter((s) => s.petugasId === officerId).length;

  const availableDistricts = useMemo(() => {
    const list = [
      "ALL",
      "Kandanghaur",
      "Cantigi",
      "Losarang",
      "Pasekan",
      "Indramayu",
      "Jatibarang",
      "Anjatan",
      "Haurgeulis",
      "Juntinyuat",
      "Karangampel",
    ];
    shelters.forEach((s) => {
      if (s.kecamatan && !list.includes(s.kecamatan)) {
        list.push(s.kecamatan);
      }
    });
    return list;
  }, [shelters]);

  // Filter Data
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const matchDistrict = districtFilter === "ALL" || s.kecamatan === districtFilter;
      const matchOwner = ownerFilter === "ALL" || s.petugasId === officerId;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.nama.toLowerCase().includes(q) ||
        s.kecamatan.toLowerCase().includes(q) ||
        s.alamat.toLowerCase().includes(q) ||
        s.kontak.pj.toLowerCase().includes(q);
      return matchDistrict && matchOwner && matchSearch;
    });
  }, [shelters, districtFilter, ownerFilter, searchQuery, officerId]);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, districtFilter, ownerFilter]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredShelters.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShelters = filteredShelters.slice(startIndex, startIndex + itemsPerPage);

  // Handler: Sesuaikan Keterisian Cepat (-5, -1, +1, +5)
  const handleAdjustOccupancy = (poskoId: string, delta: number) => {
    try {
      const target = shelters.find((s) => s.id === poskoId);
      if (!target) return;

      // ATURAN 3: Petugas HANYA diizinkan mengedit posko yang mereka buat sendiri
      if (target.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan mengedit posko yang dibuat sendiri.");
      }

      const newTerisi = Math.max(0, Math.min(target.kapasitas, target.terisi + delta));
      const newStatus =
        newTerisi >= target.kapasitas
          ? "PENUH"
          : newTerisi >= target.kapasitas * 0.7
          ? "HAMPIR_PENUH"
          : "TERSEDIA";

      updatePosko(poskoId, { terisi: newTerisi, status: newStatus }, { id: officerId });
      setNotification({ type: "success", text: `Kapasitas ${target.nama} berhasil diperbarui.` });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Aksi ditolak." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handler: Toggle Nonaktifkan Posko (Rule 4)
  const handleToggleActive = (poskoId: string) => {
    try {
      const target = shelters.find((s) => s.id === poskoId);
      if (!target) return;

      // Validasi Backend / Otorisasi
      if (target.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan mengubah status posko miliknya sendiri.");
      }

      const updated = toggleActivePosko(poskoId, { id: officerId });
      setNotification({
        type: "success",
        text: `Posko ${updated.nama} berhasil ${updated.isActive ? "diaktifkan kembali" : "dinonaktifkan (disembunyikan dari warga)"}.`,
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Aksi gagal." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handler: Soft Delete Posko (Rule 3 & 4)
  const handleDelete = (poskoId: string) => {
    const target = shelters.find((s) => s.id === poskoId);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menonaktifkan dan menghapus ${target.nama} dari daftar aktif?`)) {
      return;
    }

    try {
      // Validasi Backend / Otorisasi
      if (target.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan menghapus posko miliknya sendiri.");
      }

      deletePosko(poskoId, { id: officerId });
      setNotification({
        type: "success",
        text: `Posko ${target.nama} berhasil dinonaktifkan (soft-delete). Posko ini tidak lagi muncul pada peta dan daftar warga.`,
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Aksi gagal." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handler: Edit Modal Open
  const handleStartEdit = (posko: PoskoRecord) => {
    // Validasi Otorisasi
    if (posko.petugasId !== officerId) {
      setNotification({
        type: "error",
        text: "Unauthorized: Anda hanya diizinkan mengedit posko yang Anda kelola sendiri.",
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setEditingPosko(posko);
    setEditForm({
      nama: posko.nama,
      kapasitas: posko.kapasitas,
      terisi: posko.terisi,
      status: posko.status,
    });
  };

  // Handler: Simpan Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosko) return;

    try {
      if (editingPosko.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan mengedit posko miliknya sendiri.");
      }

      updatePosko(
        editingPosko.id,
        {
          nama: editForm.nama,
          kapasitas: Number(editForm.kapasitas),
          terisi: Number(editForm.terisi),
          status: editForm.status,
        },
        { id: officerId }
      );

      setNotification({
        type: "success",
        text: `Perubahan posko ${editForm.nama} berhasil disimpan.`,
      });
      setEditingPosko(null);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: "error", text: err.message || "Gagal menyimpan perubahan." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div className="space-y-6 text-left">
      {/* Banner Notifikasi Sukses / Error Otorisasi */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-xs border transition-all ${
            notification.type === "success"
              ? "bg-[#EEF5F3] border-[#38746D]/30 text-[#1D443F]"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#38746D] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold underline cursor-pointer ml-3 shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {isCreatingPosko ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Form & Tombol Kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D5E4E0]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingPosko(false)}
                className="p-2.5 rounded-2xl bg-white border border-[#D5E4E0] hover:bg-gray-50 text-[#1D443F] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                title="Kembali ke Daftar Posko"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-black text-[#132422]">
                  Tambah Posko Evakuasi Baru
                </h2>
                <p className="text-xs text-gray-500">
                  Daftarkan posko baru dan tentukan titik koordinat presisi langsung pada peta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsCreatingPosko(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                disabled={isSubmittingPosko}
                className="px-5 py-2 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPosko ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Posko</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Kontainer Full Width */}
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {/* 2 Kolom Grid di Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: Informasi Posko & Kontak */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Building2 className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Informasi Umum &amp; Kontak Posko
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Nama Posko <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Balai Desa Eretan Wetan, GOR Serbaguna Kandanghaur"
                      value={createForm.nama}
                      onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Wilayah Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={createForm.kecamatan}
                      onChange={(e) => {
                        const kec = e.target.value;
                        const coords = DISTRICT_COORDS[kec] || [-6.356, 108.138];
                        setCreateForm((prev) => ({
                          ...prev,
                          kecamatan: kec,
                          lat: coords[0],
                          lng: coords[1],
                        }));
                      }}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs cursor-pointer"
                    >
                      {DISTRICT_LIST_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          Kecamatan {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Alamat Lengkap Posko <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Jl. Raya Pantura No. ..., RT/RW, Dusun..."
                      value={createForm.alamat}
                      onChange={(e) => setCreateForm({ ...createForm, alamat: e.target.value })}
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Penanggung Jawab (PJ / Kuwu)
                      </label>
                      <input
                        type="text"
                        placeholder="Nama Kuwu / Relawan Lapangan"
                        value={createForm.pj}
                        onChange={(e) => setCreateForm({ ...createForm, pj: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Nomor Kontak / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="0812-xxxx-xxxx"
                        value={createForm.telp}
                        onChange={(e) => setCreateForm({ ...createForm, telp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Kapasitas & Fasilitas Aktif */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Package className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Kapasitas &amp; Fasilitas Aktif
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">
                        Kapasitas Daya Tampung Maksimal <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-xs font-extrabold text-[#38746D]">
                        {createForm.kapasitas} Jiwa
                      </span>
                    </div>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      required
                      value={createForm.kapasitas}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, kapasitas: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Estimasi daya tampung warga terdampak yang aman di lokasi pengungsian ini.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">
                      Fasilitas Siaga Bencana:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FACILITY_OPTIONS.map((facility) => {
                        const isChecked = createForm.fasilitas.includes(facility);
                        return (
                          <button
                            type="button"
                            key={facility}
                            onClick={() => {
                              setCreateForm((prev) => ({
                                ...prev,
                                fasilitas: isChecked
                                  ? prev.fasilitas.filter((f) => f !== facility)
                                  : [...prev.fasilitas, facility],
                              }));
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isChecked
                                ? "bg-[#38746D] text-white shadow-xs"
                                : "bg-[#F8FAF9] text-gray-600 border border-[#D5E4E0] hover:bg-gray-100"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                            <span>{facility}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Klik tag fasilitas di atas untuk mengaktifkan atau menonaktifkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Map Picker Interaktif yang Lebar */}
            <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Penentuan Titik Lokasi Posko (Interactive Map Picker)
                  </h3>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Petugas pembuat: <strong className="text-[#38746D]">{officerId}</strong>
                </span>
              </div>

              <PoskoMapPicker
                lat={createForm.lat}
                lng={createForm.lng}
                poskoName={createForm.nama || "Lokasi Posko Baru"}
                onChange={({ lat, lng }) => {
                  setCreateForm((prev) => ({ ...prev, lat, lng }));
                }}
              />
            </div>

            {/* Tombol Aksi di Bawah Form */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => setIsCreatingPosko(false)}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingPosko}
                className="px-8 py-2.5 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPosko ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Posko...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Posko</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* METRIK KAPASITAS PENGUNGSI KABUPATEN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Pengungsi Terdata
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-[#1D443F]">{totalOccupants.toLocaleString("id-ID")}</h3>
                <span className="text-xs text-gray-500">jiwa</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#38746D] h-full rounded-full transition-all duration-300"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="text-[11px] text-[#4B635F]">Tingkat keterisian: {occupancyRate}%</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Sisa Ruang Kosong
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-[#38746D]">{totalAvailable.toLocaleString("id-ID")}</h3>
                <span className="text-xs text-gray-500">jiwa tersisa</span>
              </div>
              <p className="text-[11px] text-gray-500">Dari total kapasitas {totalCapacity.toLocaleString("id-ID")}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Posko Dikelola Saya
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-[#1D443F]">{myPoskoCount}</h3>
                <span className="text-xs text-gray-500">dari {shelters.length} posko</span>
              </div>
              <p className="text-[11px] text-gray-500">Aktif &amp; dapat Anda kelola</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#1D443F] text-white shadow-xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#88BDB6] uppercase tracking-wider">
                  Status Operasional
                </span>
                <h4 className="text-base font-bold mt-1">Pusdalops PB Indramayu</h4>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                <span className="text-[#D1E5E2]">Posko Nonaktif</span>
                {shelters.filter((s) => !s.isActive).length === 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                    Semua Posko Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#1D443F] font-extrabold text-[10px]">
                    {shelters.filter((s) => !s.isActive).length} Posko Ditutup
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* FILTER & PENCARIAN POSKO */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 relative z-20">
            {/* Toggle Kepemilikan Posko & Tombol Tambah Posko */}
            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <div className="bg-[#EEF5F3] p-1 rounded-2xl flex items-center border border-[#D5E4E0] shrink-0">
                <button
                  type="button"
                  onClick={() => setOwnerFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    ownerFilter === "ALL"
                      ? "bg-[#38746D] text-white shadow-xs"
                      : "text-[#4B635F] hover:text-[#1D443F]"
                  }`}
                >
                  Semua Posko ({shelters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter("MINE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    ownerFilter === "MINE"
                      ? "bg-[#38746D] text-white shadow-xs"
                      : "text-[#4B635F] hover:text-[#1D443F]"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Posko Saya ({myPoskoCount})</span>
                </button>
              </div>

              {/* Tombol CTA: + Tambah Posko Baru */}
              <button
                type="button"
                onClick={() => setIsCreatingPosko(true)}
                className="px-4 py-2 rounded-2xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Posko Baru</span>
              </button>
            </div>

        {/* Input Search Bar & Tombol Filter (Sejajar seperti versi Warga) */}
        <div className="flex items-center gap-2 relative">
          <div className="relative flex-1 sm:w-72 lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama posko, koordinator, desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Filter Wilayah (Di samping Search Bar) */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`h-10 px-3.5 rounded-full border flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs ${
              isFilterOpen || districtFilter !== "ALL"
                ? "bg-[#38746D] text-white border-[#38746D]"
                : "bg-white hover:bg-[#F8FAF9] text-[#1D443F] border-[#D5E4E0]"
            }`}
            title="Filter Wilayah Kecamatan"
            aria-expanded={isFilterOpen}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {districtFilter !== "ALL" && (
              <span className="w-2 h-2 rounded-full bg-amber-300" />
            )}
          </button>

          {/* Dropdown Menu Filter Wilayah */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2.5 w-72 sm:w-80 bg-white rounded-3xl border border-[#D5E4E0] p-4 shadow-xl space-y-3 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#132422] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#38746D]" />
                  Filter Wilayah Posko
                </span>
                <div className="flex items-center gap-2">
                  {districtFilter !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictFilter("ALL");
                        setIsFilterOpen(false);
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    title="Tutup Filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-[#4B635F] uppercase tracking-wider block">
                  Pilih Wilayah Kecamatan
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableDistricts.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => {
                        setDistrictFilter(dist);
                        setIsFilterOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        districtFilter === dist
                          ? "bg-[#38746D] text-white shadow-xs"
                          : "bg-[#F8FAF9] text-[#4B635F] border border-[#D5E4E0] hover:bg-gray-100"
                      }`}
                    >
                      {dist === "ALL" ? "Semua Wilayah" : dist}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DAFTAR KARTU POSKO DENGAN ISOLASI AKSES CRUD PETUGAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedShelters.length === 0 ? (
          <div className="lg:col-span-2 p-12 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold text-gray-700">Tidak Ada Posko yang Cocok</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Tidak ada data posko evakuasi yang sesuai dengan filter atau kata kunci &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          paginatedShelters.map((shelter) => {
            const pct = Math.round((shelter.terisi / shelter.kapasitas) * 100);
            const isFull = shelter.status === "PENUH" || pct >= 95;
            // ATURAN 3: Cek apakah posko ini dibuat oleh petugas yang sedang login
            const isOwner = shelter.petugasId === officerId;

            return (
              <div
                key={shelter.id}
                className={`p-5 sm:p-6 rounded-3xl bg-white border shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                  !shelter.isActive
                    ? "border-dashed border-gray-300 bg-gray-50/70 opacity-80"
                    : isOwner
                    ? "border-[#38746D]/40 hover:border-[#38746D]"
                    : "border-[#D5E4E0] hover:border-gray-400"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header Posko */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          !shelter.isActive
                            ? "bg-gray-100 text-gray-400"
                            : "bg-[#EEF5F3] text-[#38746D]"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-[#132422] truncate">{shelter.nama}</h3>
                          {/* Sisakan maksimal 1 badge saja di sebelah kanan judul: Posko Saya HANYA JIKA di tab ALL */}
                          {ownerFilter === "ALL" && isOwner && (
                            <span className="text-[10px] font-semibold text-[#38746D] bg-[#EEF5F3] border border-[#38746D]/20 px-2 py-0.5 rounded-full shrink-0">
                              Posko Saya
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{shelter.alamat}, Kec. {shelter.kecamatan}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Nonaktif jika posko sedang ditutup/nonaktif */}
                    {!shelter.isActive && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {/* Meter Okupansi & Penyesuaian Realtime */}
                  <div className="space-y-1.5 bg-[#F8FAF9] p-4 rounded-2xl border border-[#D5E4E0]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Kapasitas Penghuni</span>
                      <span className="font-black text-[#1D443F]">
                        {shelter.terisi} / {shelter.kapasitas} jiwa ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? "bg-rose-600"
                            : pct > 75
                            ? "bg-amber-500"
                            : "bg-[#38746D]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* KONTROL PENGATUR JUMLAH: HANYA AKTIF JIKA PEMILIK */}
                    {isOwner ? (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-gray-500 font-medium">
                          Pencatatan Cepat:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, -5)}
                            disabled={shelter.terisi <= 0}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-rose-600 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Kurangi 5 jiwa"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, -1)}
                            disabled={shelter.terisi <= 0}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-rose-600 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Kurangi 1 jiwa"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, 1)}
                            disabled={shelter.terisi >= shelter.kapasitas}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#38746D] disabled:opacity-30 cursor-pointer transition-colors"
                            title="Tambah 1 jiwa"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, 5)}
                            disabled={shelter.terisi >= shelter.kapasitas}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#38746D] disabled:opacity-30 cursor-pointer transition-colors"
                            title="Tambah rombongan 5 jiwa"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 text-[11px] text-gray-400 italic">
                        Pengaturan kapasitas dikunci untuk petugas pengelola.
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER AKSI: ISOLASI OTORISASI CRUD PETUGAS (Rule 3 & 4) */}
                <div className="pt-3.5 border-t border-[#E8F1EE] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-gray-400">PJ: </span>
                    <span className="font-semibold text-slate-700">{shelter.kontak.pj}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* ATURAN 3: HANYA TAMPILKAN TOMBOL EDIT/DELETE PADA POSKO MILIK SENDIRI */}
                    {isOwner ? (
                      <>
                        {/* 1. Toggle Nonaktifkan Posko (Rule 4) */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(shelter.id)}
                          className={`text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            shelter.isActive
                              ? "text-slate-600 hover:text-amber-700"
                              : "text-[#38746D] hover:text-[#24544E]"
                          }`}
                          title={shelter.isActive ? "Tutup / Sembunyikan dari Warga" : "Aktifkan Kembali untuk Warga"}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{shelter.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                        </button>

                        {/* 2. Tombol Edit Posko */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(shelter)}
                          className="text-xs sm:text-sm font-medium text-slate-600 hover:text-[#38746D] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Informasi Posko"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Tombol Hapus (Soft-Delete) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(shelter.id)}
                          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Hapus / Nonaktifkan Posko"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </>
                    ) : (
                      /* Jika bukan pemilik: Sembunyikan Edit/Delete, beri indikator dan tombol kontak */
                      <a
                        href={`tel:${shelter.kontak.telp.replace(/[^0-9]/g, "")}`}
                        className="text-xs sm:text-sm font-medium text-slate-600 hover:text-[#38746D] flex items-center gap-1 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Hubungi PJ</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION UNTUK DASHBOARD PETUGAS */}
      {filteredShelters.length > 0 && (
        <div className="pt-6 pb-8 border-t border-[#E8F1EE] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="text-xs text-[#4B635F] font-medium order-2 sm:order-1">
            Menampilkan <strong className="text-[#132422]">{startIndex + 1}</strong> -{" "}
            <strong className="text-[#132422]">
              {Math.min(filteredShelters.length, startIndex + itemsPerPage)}
            </strong>{" "}
            dari <strong className="text-[#132422]">{filteredShelters.length}</strong> posko
          </div>

          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-[#F8FAF9] border border-[#D5E4E0] rounded-full px-2 py-1 gap-1">
              {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold text-xs select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                      isActive
                        ? "border-2 border-[#38746D] text-[#38746D] font-black bg-white shadow-xs"
                        : "text-gray-600 hover:text-[#38746D] font-semibold hover:bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#4B635F] order-3">
            <span>Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 px-2.5 rounded-xl border border-[#D5E4E0] bg-white text-xs font-bold text-[#1D443F] outline-none focus:border-[#38746D] transition cursor-pointer shadow-2xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
        </>
      )}

      {/* MODAL EDIT POSKO (Hanya dapat diakses pemilik posko) */}
      {editingPosko && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D5E4E0] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#38746D]" />
                <h3 className="font-extrabold text-[#132422] text-base">Edit Posko Evakuasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPosko(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#4B635F] block mb-1">
                  Nama Posko
                </label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nama: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs font-medium text-[#132422] focus:border-[#38746D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4B635F] block mb-1">
                    Daya Tampung (Jiwa)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.kapasitas}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, kapasitas: Number(e.target.value) }))}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs font-medium text-[#132422] focus:border-[#38746D] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4B635F] block mb-1">
                    Terisi (Jiwa)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.terisi}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, terisi: Number(e.target.value) }))}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs font-medium text-[#132422] focus:border-[#38746D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4B635F] block mb-1">
                  Status Ketersediaan
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4E0] text-xs font-bold text-[#132422] focus:border-[#38746D] outline-none bg-white cursor-pointer"
                >
                  <option value="TERSEDIA">✓ Tersedia</option>
                  <option value="HAMPIR_PENUH">⚠ Hampir Penuh</option>
                  <option value="PENUH">✕ Penuh</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPosko(null)}
                  className="px-4 py-2 rounded-xl border border-[#D5E4E0] text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
