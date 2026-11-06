"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { getActiveSession, type UserSession } from "@/utils/authSession";
import {
  getAllPosko,
  updatePosko,
  deletePosko,
  toggleActivePosko,
  type PoskoRecord,
} from "@/utils/poskoService";

export default function PetugasPoskoPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [shelters, setShelters] = useState<PoskoRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "MINE">("ALL");
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
          <p className="text-[11px] text-gray-500">Daya tampung maksimum {totalCapacity.toLocaleString("id-ID")} jiwa di {shelters.length} posko</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Posko Dikelola Saya
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-[#1D443F]">{myPoskoCount}</h3>
            <span className="text-xs text-gray-500">dari {shelters.length} posko</span>
          </div>
          <p className="text-[11px] text-[#38746D] font-medium">ID Petugas: {officerId} (Akses CRUD Mandiri)</p>
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
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#1D443F] font-extrabold text-[10px]">
              {shelters.filter((s) => !s.isActive).length} Posko Ditutup
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & PENCARIAN POSKO */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Toggle Kepemilikan & Filter Kecamatan */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
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

          <div className="flex items-center gap-1.5 shrink-0">
            {["ALL", "Kandanghaur", "Cantigi", "Losarang", "Indramayu", "Jatibarang"].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setDistrictFilter(dist)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  districtFilter === dist
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-[#D5E4E0] hover:bg-gray-50"
                }`}
              >
                {dist === "ALL" ? "Semua Wilayah" : dist}
              </button>
            ))}
          </div>
        </div>

        {/* Input Search Bar */}
        <div className="relative min-w-[260px] lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama posko, koordinator, desa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-xs transition-colors"
          />
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
                  {/* Header Posko & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          !shelter.isActive
                            ? "bg-gray-200 text-gray-500"
                            : "bg-[#EEF5F3] text-[#1D443F]"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] font-extrabold text-[#38746D] uppercase tracking-wider bg-[#EEF5F3] px-2 py-0.5 rounded-md border border-[#38746D]/20">
                            Kec. {shelter.kecamatan}
                          </span>
                          {/* Label Kepemilikan Posko */}
                          {isOwner ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                              <Shield className="w-3 h-3 text-emerald-700" />
                              Posko Anda
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                              PJ: {shelter.petugasId}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#132422]">{shelter.nama}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{shelter.alamat}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge: Aktif / Nonaktif / Keterisian */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!shelter.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-200 text-gray-700 border border-gray-300">
                          Nonaktif / Ditutup
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            isFull
                              ? "bg-rose-100 text-rose-700 border border-rose-300"
                              : shelter.status === "HAMPIR_PENUH"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/30"
                          }`}
                        >
                          {shelter.status}
                        </span>
                      )}
                    </div>
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
                            className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30 cursor-pointer"
                            title="Kurangi 5 jiwa"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, -1)}
                            disabled={shelter.terisi <= 0}
                            className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-white disabled:opacity-30 cursor-pointer"
                            title="Kurangi 1 jiwa"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, 1)}
                            disabled={shelter.terisi >= shelter.kapasitas}
                            className="px-2 py-1 rounded-lg bg-[#EEF5F3] border border-[#38746D]/30 text-xs font-bold text-[#1D443F] hover:bg-teal-100 disabled:opacity-30 cursor-pointer"
                            title="Tambah 1 jiwa"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustOccupancy(shelter.id, 5)}
                            disabled={shelter.terisi >= shelter.kapasitas}
                            className="px-2.5 py-1 rounded-lg bg-[#38746D] text-xs font-bold text-white hover:bg-[#24544E] disabled:opacity-30 cursor-pointer shadow-xs"
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
                    <span className="font-bold text-[#132422]">{shelter.kontak.pj}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* ATURAN 3: HANYA TAMPILKAN TOMBOL EDIT/DELETE PADA POSKO MILIK SENDIRI */}
                    {isOwner ? (
                      <>
                        {/* 1. Toggle Nonaktifkan Posko (Rule 4) */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(shelter.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            shelter.isActive
                              ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
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
                          className="px-3 py-1.5 rounded-xl border border-[#D5E4E0] bg-white hover:bg-gray-50 text-xs font-bold text-[#1D443F] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="Edit Informasi Posko"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#38746D]" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Tombol Hapus (Soft-Delete) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(shelter.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1 cursor-pointer transition"
                          title="Hapus / Nonaktifkan Posko"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </>
                    ) : (
                      /* Jika bukan pemilik: Sembunyikan Edit/Delete, beri indikator proteksi */
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-gray-400" />
                          <span>Dikelola Petugas Lain</span>
                        </span>
                        <a
                          href={`tel:${shelter.kontak.telp.replace(/[^0-9]/g, "")}`}
                          className="px-3 py-1.5 rounded-xl border border-[#D5E4E0] hover:bg-gray-50 text-xs font-bold text-[#1D443F] flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#38746D]" />
                          <span>Hubungi</span>
                        </a>
                      </div>
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
