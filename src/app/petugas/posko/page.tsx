"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
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
  Package,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  Check,
  Loader2,
  ImageIcon,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  User,
  Users,
  HeartPulse,
  Baby,
  Activity,
  Calendar,
  FileText,
} from "lucide-react";
import { getActiveSession, type UserSession } from "@/utils/authSession";
import {
  getAllPosko,
  createPosko,
  updatePosko,
  deletePosko,
  toggleActivePosko,
  addPengungsi,
  updatePengungsi,
  deletePengungsi,
  adjustPoskoOccupancyWithEvacuees,
  determineKategoriUsia,
  fetchPoskoFromApi,
  createPoskoApi,
  updatePoskoApi,
  toggleActivePoskoApi,
  deletePoskoApi,
  uploadPoskoPhotosApi,
  addPengungsiApi,
  updatePengungsiApi,
  deletePengungsiApi,
  type PoskoRecord,
  type PengungsiItem,
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

const SAMPLE_PHOTOS = [
  {
    label: "Balai Desa",
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "GOR Serbaguna",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Gedung Sekolah",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Dapur Umum",
    url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function PetugasPoskoPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [shelters, setShelters] = useState<PoskoRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "MINE">("MINE");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // View Mode: Detail View (Inline Swap)
  const [selectedPoskoId, setSelectedPoskoId] = useState<string | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);

  // View Mode: Manajemen Data Pengungsi (Inline Swap dari Detail View)
  const [isManagingPengungsi, setIsManagingPengungsi] = useState(false);
  const [isAddingPengungsi, setIsAddingPengungsi] = useState(false);
  const [editingPengungsi, setEditingPengungsi] = useState<PengungsiItem | null>(null);
  const [pengungsiToDelete, setPengungsiToDelete] = useState<PengungsiItem | null>(null);
  const [pengungsiSearch, setPengungsiSearch] = useState("");
  const [pengungsiFilterKondisi, setPengungsiFilterKondisi] = useState<string>("ALL");
  const [pengungsiCurrentPage, setPengungsiCurrentPage] = useState(1);
  const pengungsiPerPage = 10;

  const [pengungsiForm, setPengungsiForm] = useState({
    nama: "",
    jenisKelamin: "L" as "L" | "P",
    usia: 28,
    alamatAsal: "",
    kondisiKesehatan: "Sehat" as "Sehat" | "Sakit" | "Bumil" | "Disabilitas" | "Lansia Rentan",
    catatan: "",
  });

  // Modal Lightbox Foto Resolusi Penuh
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Custom Modal Konfirmasi Hapus
  const [poskoToDelete, setPoskoToDelete] = useState<PoskoRecord | null>(null);

  // Form State (Tambah & Edit Posko)
  const [isCreatingPosko, setIsCreatingPosko] = useState(false);
  const [isEditingPosko, setIsEditingPosko] = useState(false);
  const [isSubmittingPosko, setIsSubmittingPosko] = useState(false);
  const [isLoadingPosko, setIsLoadingPosko] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState({
    nama: "",
    alamat: "",
    kecamatan: "Kandanghaur",
    pj: "",
    telp: "",
    kapasitas: 200,
    terisi: 0,
    lat: -6.356,
    lng: 108.138,
    fasilitas: ["Aula", "Dapur Umum", "Toilet", "Genset"],
    fotos: [] as string[],
  });

  // Muat Sesi Petugas & Dataset Posko dari Database Server (SSOT)
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

    // 1. Ambil cache lokal seketika (instant render)
    setShelters(getAllPosko());

    // 2. Ambil data Single Source of Truth dari API Server
    const syncFromServer = async () => {
      try {
        const serverData = await fetchPoskoFromApi("petugas");
        setShelters(serverData);
      } catch (err) {
        console.warn("Sync from server error, using local dataset:", err);
      } finally {
        setIsLoadingPosko(false);
      }
    };
    syncFromServer();

    const handleUpdate = () => {
      setShelters(getAllPosko());
    };
    window.addEventListener("dermayu_posko_updated", handleUpdate);

    return () => {
      window.removeEventListener("dermayu_posko_updated", handleUpdate);
    };
  }, []);

  const officerId = currentUser?.id || "petugas-01";

  // Posko yang sedang dibuka di Detail View
  const selectedPosko = useMemo(() => {
    if (!selectedPoskoId) return null;
    return shelters.find((s) => s.id === selectedPoskoId) || null;
  }, [selectedPoskoId, shelters]);

  // Metrik Kapasitas
  const totalCapacity = shelters.reduce((acc, s) => acc + (s?.kapasitas || 0), 0);
  const totalOccupants = shelters.reduce((acc, s) => acc + (s?.terisi || 0), 0);
  const totalAvailable = Math.max(0, totalCapacity - totalOccupants);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;
  const myPoskoCount = shelters.filter((s) => s?.petugasId === officerId).length;

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
      const kec = s?.kecamatan || (s as any)?.district;
      if (kec && !list.includes(kec)) {
        list.push(kec);
      }
    });
    return list;
  }, [shelters]);

  // Filter & Sort Data: Posko nonaktif (isActive: false) selalu berada di urutan paling bawah
  const filteredShelters = useMemo(() => {
    const list = shelters.filter((s) => {
      if (!s) return false;
      const nama = (s.nama || (s as any).name || "").toLowerCase();
      const kecamatan = (s.kecamatan || (s as any).district || "").toLowerCase();
      const alamat = (s.alamat || (s as any).location || "").toLowerCase();
      const pj = (s.kontak?.pj || "").toLowerCase();

      const matchDistrict = districtFilter === "ALL" || kecamatan === districtFilter.toLowerCase();
      const matchOwner = ownerFilter === "ALL" || s.petugasId === officerId;
      const q = (searchQuery || "").trim().toLowerCase();
      const matchSearch =
        !q ||
        nama.includes(q) ||
        kecamatan.includes(q) ||
        alamat.includes(q) ||
        pj.includes(q);
      return matchDistrict && matchOwner && matchSearch;
    });

    return list.sort((a, b) => {
      // Posko aktif lebih dahulu daripada posko nonaktif
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
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

  // Handler: Unggah Multi-Foto (Drag-and-Drop & File Picker)
  const handlePhotoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormState((prev) => ({
            ...prev,
            fotos: [...prev.fotos, ev.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  // Handler: Buka Form Tambah Posko Baru
  const handleStartCreate = () => {
    setFormState({
      nama: "",
      alamat: "",
      kecamatan: "Kandanghaur",
      pj: "",
      telp: "",
      kapasitas: 200,
      terisi: 0,
      lat: -6.356,
      lng: 108.138,
      fasilitas: ["Aula", "Dapur Umum", "Toilet", "Genset"],
      fotos: [],
    });
    setIsEditingPosko(false);
    setIsCreatingPosko(true);
  };

  // Handler: Buka Form Edit Posko
  const handleStartEdit = (posko: PoskoRecord) => {
    if (posko.petugasId !== officerId) {
      setNotification({
        type: "error",
        text: "Unauthorized: Anda hanya diizinkan mengedit posko yang Anda kelola sendiri.",
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const initialFotos =
      posko.fotos && posko.fotos.length > 0
        ? posko.fotos
        : posko.foto && posko.foto !== "/shelters/default.jpg"
        ? [posko.foto]
        : [];

    setFormState({
      nama: posko.nama,
      alamat: posko.alamat,
      kecamatan: posko.kecamatan,
      pj: posko.kontak.pj,
      telp: posko.kontak.telp,
      kapasitas: posko.kapasitas,
      terisi: posko.terisi,
      lat: posko.lat,
      lng: posko.lng,
      fasilitas: posko.fasilitas,
      fotos: initialFotos,
    });
    setSelectedPoskoId(posko.id);
    setIsEditingPosko(true);
    setIsCreatingPosko(true);
  };

  // Handler: Submit Form (Tambah atau Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nama.trim()) {
      setNotification({ type: "error", text: "Silakan masukkan nama posko." });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!formState.alamat.trim()) {
      setNotification({ type: "error", text: "Silakan masukkan alamat posko." });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSubmittingPosko(true);
    const previousShelters = [...shelters];

    try {
      // PRD 3.2: Unggah foto ke storage permanen server (bukan base64/placeholder)
      let finalPhotos = formState.fotos;
      const hasBase64 = formState.fotos.some((f) => f.startsWith("data:"));
      if (hasBase64) {
        try {
          finalPhotos = await uploadPoskoPhotosApi(formState.fotos);
        } catch (uploadErr) {
          console.warn("Upload photos error, using existing urls:", uploadErr);
        }
      }

      if (isEditingPosko && selectedPoskoId) {
        // Mode Edit Posko: Optimistic UI
        const updatedLocal = updatePosko(
          selectedPoskoId,
          {
            nama: formState.nama,
            alamat: formState.alamat,
            kecamatan: formState.kecamatan,
            kapasitas: Number(formState.kapasitas) || 100,
            terisi: Number(formState.terisi) || 0,
            lat: formState.lat,
            lng: formState.lng,
            fasilitas: formState.fasilitas,
            kontak: {
              pj: formState.pj || "Petugas Pusdalops",
              telp: formState.telp || "0812-3456-7890",
            },
            foto:
              finalPhotos.length > 0
                ? finalPhotos[0]
                : "/shelters/default.jpg",
            fotos: finalPhotos,
          },
          { id: officerId }
        );

        setShelters(getAllPosko());
        setNotification({
          type: "success",
          text: `Perubahan posko "${updatedLocal.nama}" berhasil disimpan!`,
        });
        setIsCreatingPosko(false);
        setIsEditingPosko(false);

        // Async Sync to Database Server
        await updatePoskoApi(
          selectedPoskoId,
          {
            nama: formState.nama,
            alamat: formState.alamat,
            kecamatan: formState.kecamatan,
            kapasitas: Number(formState.kapasitas) || 100,
            terisi: Number(formState.terisi) || 0,
            lat: formState.lat,
            lng: formState.lng,
            fasilitas: formState.fasilitas,
            kontak: {
              pj: formState.pj || "Petugas Pusdalops",
              telp: formState.telp || "0812-3456-7890",
            },
            foto: finalPhotos.length > 0 ? finalPhotos[0] : "/shelters/default.jpg",
            fotos: finalPhotos,
          },
          { id: officerId }
        );
      } else {
        // Mode Tambah Posko Baru: Optimistic UI
        const createdLocal = createPosko(
          {
            nama: formState.nama,
            alamat: formState.alamat,
            kecamatan: formState.kecamatan,
            kapasitas: Number(formState.kapasitas) || 100,
            lat: formState.lat,
            lng: formState.lng,
            fasilitas: formState.fasilitas,
            kontak: {
              pj: formState.pj || "Petugas Pusdalops",
              telp: formState.telp || "0812-3456-7890",
            },
            fotos: finalPhotos,
          },
          { id: officerId }
        );

        setShelters(getAllPosko());
        setNotification({
          type: "success",
          text: `Posko "${createdLocal.nama}" berhasil ditambahkan dan siap digunakan!`,
        });
        setIsCreatingPosko(false);

        // Async Sync to Database Server
        await createPoskoApi(
          {
            nama: formState.nama,
            alamat: formState.alamat,
            kecamatan: formState.kecamatan,
            kapasitas: Number(formState.kapasitas) || 100,
            lat: formState.lat,
            lng: formState.lng,
            fasilitas: formState.fasilitas,
            kontak: {
              pj: formState.pj || "Petugas Pusdalops",
              telp: formState.telp || "0812-3456-7890",
            },
            fotos: finalPhotos,
          },
          { id: officerId }
        );
      }
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      // Rollback on failure
      setShelters(previousShelters);
      setNotification({
        type: "error",
        text: err.message || "Gagal memproses data posko.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmittingPosko(false);
    }
  };

  // Handler: Manajemen Data Pengungsi
  const handleOpenAddPengungsi = () => {
    if (!selectedPosko) return;
    setEditingPengungsi(null);
    setPengungsiForm({
      nama: "",
      jenisKelamin: "L",
      usia: 28,
      alamatAsal: selectedPosko.alamat,
      kondisiKesehatan: "Sehat",
      catatan: "",
    });
    setIsAddingPengungsi(true);
  };

  const handleOpenEditPengungsi = (item: PengungsiItem) => {
    setEditingPengungsi(item);
    setPengungsiForm({
      nama: item.isAnonim ? "" : item.nama,
      jenisKelamin: item.jenisKelamin,
      usia: item.usia,
      alamatAsal: item.alamatAsal,
      kondisiKesehatan: item.kondisiKesehatan,
      catatan: item.catatan || "",
    });
    setIsAddingPengungsi(true);
  };

  const handleSavePengungsi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosko) return;

    if (!pengungsiForm.nama.trim()) {
      setNotification({ type: "error", text: "Silakan masukkan nama lengkap pengungsi." });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const previousShelters = [...shelters];

    try {
      if (editingPengungsi) {
        // Optimistic update
        updatePengungsi(
          selectedPosko.id,
          editingPengungsi.id,
          {
            nama: pengungsiForm.nama.trim(),
            jenisKelamin: pengungsiForm.jenisKelamin,
            usia: Number(pengungsiForm.usia) || 0,
            alamatAsal: pengungsiForm.alamatAsal.trim() || selectedPosko.alamat,
            kondisiKesehatan: pengungsiForm.kondisiKesehatan,
            catatan: pengungsiForm.catatan.trim() || undefined,
            isAnonim: false,
          },
          { id: officerId }
        );
        setNotification({
          type: "success",
          text: `Data pengungsi "${pengungsiForm.nama}" berhasil diperbarui!`,
        });

        // Server DB Sync
        await updatePengungsiApi(
          selectedPosko.id,
          editingPengungsi.id,
          {
            nama: pengungsiForm.nama.trim(),
            jenisKelamin: pengungsiForm.jenisKelamin,
            usia: Number(pengungsiForm.usia) || 0,
            alamatAsal: pengungsiForm.alamatAsal.trim() || selectedPosko.alamat,
            kondisiKesehatan: pengungsiForm.kondisiKesehatan,
            catatan: pengungsiForm.catatan.trim() || undefined,
          },
          { id: officerId }
        );
      } else {
        // Optimistic add
        addPengungsi(
          selectedPosko.id,
          {
            nama: pengungsiForm.nama.trim(),
            jenisKelamin: pengungsiForm.jenisKelamin,
            usia: Number(pengungsiForm.usia) || 0,
            alamatAsal: pengungsiForm.alamatAsal.trim() || selectedPosko.alamat,
            kondisiKesehatan: pengungsiForm.kondisiKesehatan,
            catatan: pengungsiForm.catatan.trim() || undefined,
          },
          { id: officerId }
        );
        setNotification({
          type: "success",
          text: `Pengungsi "${pengungsiForm.nama}" berhasil didaftarkan! Kapasitas bertambah 1 jiwa.`,
        });

        // Server DB Sync
        await addPengungsiApi(
          selectedPosko.id,
          {
            nama: pengungsiForm.nama.trim(),
            jenisKelamin: pengungsiForm.jenisKelamin,
            usia: Number(pengungsiForm.usia) || 0,
            alamatAsal: pengungsiForm.alamatAsal.trim() || selectedPosko.alamat,
            kondisiKesehatan: pengungsiForm.kondisiKesehatan,
            catatan: pengungsiForm.catatan.trim() || undefined,
          },
          { id: officerId }
        );
      }

      setShelters(getAllPosko());
      setIsAddingPengungsi(false);
      setEditingPengungsi(null);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setShelters(previousShelters);
      setNotification({
        type: "error",
        text: err.message || "Gagal menyimpan data pengungsi.",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const confirmDeletePengungsi = async () => {
    if (!selectedPosko || !pengungsiToDelete) return;
    const previousShelters = [...shelters];
    const targetP = pengungsiToDelete;

    try {
      // Optimistic delete
      deletePengungsi(selectedPosko.id, targetP.id, { id: officerId });
      setShelters(getAllPosko());
      setNotification({
        type: "success",
        text: `Data pengungsi "${targetP.nama}" berhasil dihapus. Kapasitas berkurang 1 jiwa.`,
      });
      setPengungsiToDelete(null);

      // Server DB Sync
      await deletePengungsiApi(selectedPosko.id, targetP.id, { id: officerId });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setShelters(previousShelters);
      setNotification({
        type: "error",
        text: err.message || "Gagal menghapus data pengungsi.",
      });
      setPengungsiToDelete(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Filter & Search Pengungsi
  const filteredPengungsiList = useMemo(() => {
    if (!selectedPosko) return [];
    const list = selectedPosko.pengungsi || [];
    return list.filter((p) => {
      if (!p) return false;
      const q = (pengungsiSearch || "").toLowerCase();
      const nama = (p.nama || "").toLowerCase();
      const alamatAsal = (p.alamatAsal || "").toLowerCase();
      const catatan = (p.catatan || "").toLowerCase();
      const matchSearch =
        !q ||
        nama.includes(q) ||
        alamatAsal.includes(q) ||
        catatan.includes(q);

      let matchKondisi = true;
      if (pengungsiFilterKondisi === "RENTAN") {
        matchKondisi =
          p.kondisiKesehatan !== "Sehat" ||
          p.kategoriUsia === "Balita" ||
          p.kategoriUsia === "Lansia" ||
          p.usia >= 60;
      } else if (pengungsiFilterKondisi === "BALITA_ANAK") {
        matchKondisi =
          p.kategoriUsia === "Balita" ||
          p.kategoriUsia === "Anak" ||
          p.usia < 18;
      } else if (pengungsiFilterKondisi === "LANSIA") {
        matchKondisi = p.kategoriUsia === "Lansia" || p.usia >= 60;
      } else if (pengungsiFilterKondisi !== "ALL") {
        matchKondisi = p.kondisiKesehatan === pengungsiFilterKondisi;
      }

      return matchSearch && matchKondisi;
    });
  }, [selectedPosko, pengungsiSearch, pengungsiFilterKondisi]);

  const pengungsiTotalPages = Math.max(1, Math.ceil(filteredPengungsiList.length / pengungsiPerPage));
  const paginatedPengungsi = filteredPengungsiList.slice(
    (pengungsiCurrentPage - 1) * pengungsiPerPage,
    pengungsiCurrentPage * pengungsiPerPage
  );

  // Handler: Toggle Nonaktifkan Posko (Optimistic UI + Server Sync)
  const handleToggleActive = async (poskoId: string) => {
    const previousShelters = [...shelters];
    try {
      const target = shelters.find((s) => s.id === poskoId);
      if (!target) return;

      if (target.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan mengubah status posko miliknya sendiri.");
      }

      // Optimistic update
      const updated = toggleActivePosko(poskoId, { id: officerId });
      setShelters(getAllPosko());
      setNotification({
        type: "success",
        text: `Posko "${updated.nama}" berhasil ${
          updated.isActive ? "diaktifkan kembali" : "dinonaktifkan (disembunyikan dari warga)"
        }.`,
      });

      // Server DB Sync
      await toggleActivePoskoApi(poskoId, { id: officerId });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setShelters(previousShelters);
      setNotification({ type: "error", text: err.message || "Aksi gagal." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handler: Eksekusi Hapus Posko (Setelah konfirmasi custom modal - Optimistic UI + Server Sync)
  const confirmDeletePosko = async () => {
    if (!poskoToDelete) return;
    const previousShelters = [...shelters];
    const target = poskoToDelete;

    try {
      if (target.petugasId !== officerId) {
        throw new Error("Unauthorized: Petugas hanya diizinkan menghapus posko miliknya sendiri.");
      }

      // Optimistic delete
      deletePosko(target.id, { id: officerId });
      setShelters(getAllPosko());
      setNotification({
        type: "success",
        text: `Posko "${target.nama}" berhasil dihapus dari daftar aktif.`,
      });
      setPoskoToDelete(null);
      setSelectedPoskoId(null);

      // Server DB Sync
      await deletePoskoApi(target.id, { id: officerId });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setShelters(previousShelters);
      setNotification({ type: "error", text: err.message || "Gagal menghapus posko." });
      setPoskoToDelete(null);
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

      {/* ======================================================== */}
      {/* 1. TAMPILAN INLINE FORM: TAMBAH ATAU EDIT POSKO          */}
      {/* ======================================================== */}
      {isCreatingPosko ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Form & Tombol Kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D5E4E0]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingPosko(false);
                  setIsEditingPosko(false);
                }}
                className="p-2.5 rounded-2xl bg-white border border-[#D5E4E0] hover:bg-gray-50 text-[#1D443F] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                title="Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-black text-[#132422]">
                  {isEditingPosko ? `Edit Posko: ${formState.nama}` : "Tambah Posko Evakuasi Baru"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEditingPosko
                    ? "Perbarui informasi fasilitas, kapasitas, kontak, dan dokumentasi foto posko"
                    : "Daftarkan posko baru dan tentukan titik koordinat presisi langsung pada peta"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingPosko(false);
                  setIsEditingPosko(false);
                }}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
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
                    <span>{isEditingPosko ? "Simpan Perubahan" : "Simpan Posko"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Kontainer Full Width */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 2 Kolom Grid di Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: Informasi Umum & Kontak */}
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
                      value={formState.nama}
                      onChange={(e) => setFormState({ ...formState, nama: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Wilayah Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formState.kecamatan}
                      onChange={(e) => {
                        const kec = e.target.value;
                        const coords = DISTRICT_COORDS[kec] || [-6.356, 108.138];
                        setFormState((prev) => ({
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
                      value={formState.alamat}
                      onChange={(e) => setFormState({ ...formState, alamat: e.target.value })}
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
                        value={formState.pj}
                        onChange={(e) => setFormState({ ...formState, pj: e.target.value })}
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
                        value={formState.telp}
                        onChange={(e) => setFormState({ ...formState, telp: e.target.value })}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-700">
                          Kapasitas Total <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs font-extrabold text-[#38746D]">
                          {formState.kapasitas} Jiwa
                        </span>
                      </div>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        required
                        value={formState.kapasitas}
                        onChange={(e) =>
                          setFormState({ ...formState, kapasitas: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                      />
                    </div>

                    {isEditingPosko && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Jumlah Pengungsi Terisi
                          </label>
                          <span className="text-xs font-extrabold text-blue-700">
                            {formState.terisi} Jiwa
                          </span>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={formState.kapasitas}
                          value={formState.terisi}
                          onChange={(e) =>
                            setFormState({ ...formState, terisi: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D5E4E0] text-xs text-gray-800 focus:outline-hidden focus:border-[#38746D] shadow-2xs"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">
                      Fasilitas Siaga Bencana:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FACILITY_OPTIONS.map((facility) => {
                        const isChecked = formState.fasilitas.includes(facility);
                        return (
                          <button
                            type="button"
                            key={facility}
                            onClick={() => {
                              setFormState((prev) => ({
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
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION BARU: DOKUMENTASI MULTI-FOTO POSKO (Requirement 1) */}
            <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Dokumentasi Foto Posko Evakuasi
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {formState.fotos.length} Foto Terlampir
                </span>
              </div>

              {/* Area Drag-and-Drop & File Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePhotoUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#88BDB6] hover:border-[#38746D] bg-[#F8FAF9] hover:bg-[#EEF5F3] rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-colors space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#132422]">
                    Tarik &amp; lepas foto posko ke sini, atau{" "}
                    <span className="text-[#38746D] underline">klik untuk memilih file</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Mendukung banyak foto sekaligus (JPG, PNG, WebP) tanpa batasan jumlah file
                  </p>
                </div>
              </div>

              {/* Tombol Cepat Foto Contoh */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-[11px] font-semibold text-gray-500">Gunakan Contoh Cepat:</span>
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        fotos: [...prev.fotos, sample.url],
                      }))
                    }
                    className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-[#EEF5F3] hover:text-[#38746D] text-[11px] font-medium text-gray-700 transition cursor-pointer"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>

              {/* Preview Thumbnail Foto dengan Tombol Silang (X) */}
              {formState.fotos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-gray-700 block">
                    Foto yang Dipilih ({formState.fotos.length}):
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {formState.fotos.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="relative group w-24 h-24 rounded-2xl border border-[#D5E4E0] overflow-hidden bg-gray-100 shadow-2xs"
                      >
                        <img
                          src={imgSrc}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
                          title="Hapus foto ini"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section Map Picker Interaktif */}
            <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Penentuan Titik Lokasi Posko (Interactive Map Picker)
                  </h3>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Petugas: <strong className="text-[#38746D]">{officerId}</strong>
                </span>
              </div>

              <PoskoMapPicker
                lat={formState.lat}
                lng={formState.lng}
                poskoName={formState.nama || "Lokasi Posko"}
                onChange={({ lat, lng }) => {
                  setFormState((prev) => ({ ...prev, lat, lng }));
                }}
              />
            </div>

            {/* Tombol Aksi di Bawah Form */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingPosko(false);
                  setIsEditingPosko(false);
                }}
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
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditingPosko ? "Simpan Perubahan" : "Simpan Posko Baru"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : selectedPosko ? (
        isManagingPengungsi ? (
          /* ======================================================== */
          /* 2B. TAMPILAN INLINE MANAJEMEN DATA PENGUNGSI (BY NAME)   */
          /* ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Bar Pengungsi View */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D5E4E0] w-full">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsManagingPengungsi(false);
                    setIsAddingPengungsi(false);
                    setEditingPengungsi(null);
                  }}
                  className="p-2.5 rounded-2xl bg-white border border-[#D5E4E0] hover:bg-gray-50 text-[#1D443F] transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0"
                  title="Kembali ke Detail Posko"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                      Data Pengungsi: {selectedPosko.nama}
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/20">
                      {selectedPosko.terisi} / {selectedPosko.kapasitas} Jiwa
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedPosko.alamat}, Kec. {selectedPosko.kecamatan}</span>
                  </p>
                </div>
              </div>

              {selectedPosko.petugasId === officerId && (
                <button
                  type="button"
                  onClick={handleOpenAddPengungsi}
                  disabled={selectedPosko.terisi >= selectedPosko.kapasitas}
                  className="px-4 py-2.5 rounded-2xl bg-[#38746D] hover:bg-[#2C5B55] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Data Pengungsi</span>
                </button>
              )}
            </div>

            {/* Demographics & Occupancy Summary Cards */}
            {(() => {
              const evacuees = selectedPosko.pengungsi || [];
              const byNameCount = evacuees.length;
              const balitaDanAnakCount = evacuees.filter(
                (p) => p.kategoriUsia === "Balita" || p.kategoriUsia === "Anak" || p.usia < 18
              ).length;
              const rentanCount = evacuees.filter(
                (p) =>
                  p.kondisiKesehatan !== "Sehat" ||
                  p.kategoriUsia === "Balita" ||
                  p.kategoriUsia === "Lansia" ||
                  p.usia >= 60
              ).length;

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Pengungsi */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Total Pengungsi
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className="text-2xl font-black text-[#1D443F]">
                        {selectedPosko.terisi}
                      </h4>
                      <span className="text-xs text-gray-500">
                        / {selectedPosko.kapasitas} jiwa
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#38746D] h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (selectedPosko.terisi / selectedPosko.kapasitas) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[#4B635F] pt-1">
                      Okupansi: {Math.round((selectedPosko.terisi / selectedPosko.kapasitas) * 100)}%
                    </p>
                  </div>

                  {/* Card 2: Terdata Lengkap */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Terdata Lengkap
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className="text-2xl font-black text-[#38746D]">
                        {byNameCount}
                      </h4>
                      <span className="text-xs text-gray-500">jiwa</span>
                    </div>
                  </div>

                  {/* Card 3: Balita & Anak */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Balita &amp; Anak
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className="text-2xl font-black text-amber-600">
                        {balitaDanAnakCount}
                      </h4>
                      <span className="text-xs text-gray-500">jiwa</span>
                    </div>
                  </div>

                  {/* Card 4: Kelompok Rentan */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Kelompok Rentan
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h4 className="text-2xl font-black text-rose-600">
                        {rentanCount}
                      </h4>
                      <span className="text-xs text-gray-500">jiwa</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Form Input / Edit Data Pengungsi (Inline Form Card) */}
            {isAddingPengungsi && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#38746D]/30 shadow-md space-y-5 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {editingPengungsi ? "Edit Data Pengungsi" : "Registrasi Pengungsi Baru"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {editingPengungsi
                          ? "Perbarui identitas atau data kondisi kesehatan pengungsi."
                          : "Catat data warga pengungsi secara by-name untuk posko ini."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPengungsi(false);
                      setEditingPengungsi(null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePengungsi} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nama Lengkap */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Nama Lengkap Pengungsi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pengungsiForm.nama}
                        onChange={(e) =>
                          setPengungsiForm((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Contoh: Bpk. Slamet Riyadi / Ibu Siti Maryam"
                        className="w-full h-11 px-3.5 rounded-xl border border-[#D5E4E0] bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#38746D] transition shadow-2xs"
                      />
                    </div>

                    {/* Usia & Auto Kategori Usia */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Usia (Tahun) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-bold text-[#38746D] bg-[#EEF5F3] px-2 py-0.5 rounded-full">
                          {determineKategoriUsia(Number(pengungsiForm.usia) || 0)}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        required
                        value={pengungsiForm.usia}
                        onChange={(e) =>
                          setPengungsiForm((prev) => ({
                            ...prev,
                            usia: Math.max(0, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-full h-11 px-3.5 rounded-xl border border-[#D5E4E0] bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#38746D] transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jenis Kelamin */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Jenis Kelamin
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPengungsiForm((prev) => ({ ...prev, jenisKelamin: "L" }))
                          }
                          className={`h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                            pengungsiForm.jenisKelamin === "L"
                              ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>Laki-laki (L)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPengungsiForm((prev) => ({ ...prev, jenisKelamin: "P" }))
                          }
                          className={`h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                            pengungsiForm.jenisKelamin === "P"
                              ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>Perempuan (P)</span>
                        </button>
                      </div>
                    </div>

                    {/* Alamat Asal / Dusun / RT-RW */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Alamat Asal / RT / RW
                      </label>
                      <input
                        type="text"
                        value={pengungsiForm.alamatAsal}
                        onChange={(e) =>
                          setPengungsiForm((prev) => ({ ...prev, alamatAsal: e.target.value }))
                        }
                        placeholder="Contoh: RT 02 / RW 01, Blok Karanganyar"
                        className="w-full h-11 px-3.5 rounded-xl border border-[#D5E4E0] bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#38746D] transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Kondisi Kesehatan / Kerentanan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Kondisi Kesehatan &amp; Kategori Kerentanan
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "Sehat", label: "Sehat (Kondisi Baik)", color: "emerald" },
                        { key: "Bumil", label: "Ibu Hamil (Bumil)", color: "pink" },
                        { key: "Disabilitas", label: "Disabilitas", color: "purple" },
                        { key: "Sakit", label: "Sakit (Butuh Obat/Medis)", color: "rose" },
                        { key: "Lansia Rentan", label: "Lansia Rentan", color: "amber" },
                      ].map((k) => {
                        const isSelected = pengungsiForm.kondisiKesehatan === k.key;
                        return (
                          <button
                            key={k.key}
                            type="button"
                            onClick={() =>
                              setPengungsiForm((prev) => ({
                                ...prev,
                                kondisiKesehatan: k.key as any,
                              }))
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isSelected
                                ? "bg-[#38746D] text-white border-[#38746D] shadow-xs"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {k.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Catatan Tambahan (Kebutuhan Khusus / Alergi) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Catatan Medis &amp; Kebutuhan Khusus (Opsional)
                    </label>
                    <input
                      type="text"
                      value={pengungsiForm.catatan}
                      onChange={(e) =>
                        setPengungsiForm((prev) => ({ ...prev, catatan: e.target.value }))
                      }
                      placeholder="Contoh: Butuh popok balita ukuran M, alergi antibiotik, obat hipertensi rutin"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E4E0] bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#38746D] transition shadow-2xs"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPengungsi(false);
                        setEditingPengungsi(null);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#2C5B55] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                    >
                      {editingPengungsi ? "Simpan Perubahan" : "Daftarkan Pengungsi"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search & Filter Bar Pengungsi */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pengungsiSearch}
                    onChange={(e) => {
                      setPengungsiSearch(e.target.value);
                      setPengungsiCurrentPage(1);
                    }}
                    placeholder="Cari nama pengungsi, alamat asal, atau catatan..."
                    className="w-full h-10 pl-10 pr-9 rounded-2xl border border-[#D5E4E0] bg-[#F8FAF9] text-xs font-medium text-slate-800 outline-none focus:border-[#38746D] focus:bg-white transition"
                  />
                  {pengungsiSearch && (
                    <button
                      type="button"
                      onClick={() => setPengungsiSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-xs text-gray-500 font-medium shrink-0 self-center">
                  Menampilkan <strong>{filteredPengungsiList.length}</strong> data
                </span>
              </div>

              {/* Filter Chips */}
              {(() => {
                const list = selectedPosko.pengungsi || [];
                const rentan = list.filter(
                  (p) =>
                    p.kondisiKesehatan !== "Sehat" ||
                    p.kategoriUsia === "Balita" ||
                    p.kategoriUsia === "Lansia" ||
                    p.usia >= 60
                ).length;
                const balitaAnak = list.filter(
                  (p) => p.kategoriUsia === "Balita" || p.kategoriUsia === "Anak" || p.usia < 18
                ).length;
                const lansia = list.filter((p) => p.kategoriUsia === "Lansia" || p.usia >= 60).length;
                const bumil = list.filter((p) => p.kondisiKesehatan === "Bumil").length;
                const disabilitas = list.filter((p) => p.kondisiKesehatan === "Disabilitas").length;
                const sakit = list.filter((p) => p.kondisiKesehatan === "Sakit").length;

                return (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[
                      { key: "ALL", label: `Semua (${list.length})` },
                      { key: "RENTAN", label: `Kelompok Rentan (${rentan})` },
                      { key: "BALITA_ANAK", label: `Balita & Anak (${balitaAnak})` },
                      { key: "LANSIA", label: `Lansia (${lansia})` },
                      { key: "Bumil", label: `Bumil (${bumil})` },
                      { key: "Disabilitas", label: `Disabilitas (${disabilitas})` },
                      { key: "Sakit", label: `Sakit (${sakit})` },
                    ].map((chip) => {
                      const isAct = pengungsiFilterKondisi === chip.key;
                      return (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={() => {
                            setPengungsiFilterKondisi(chip.key);
                            setPengungsiCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            isAct
                              ? "bg-[#38746D] text-white shadow-2xs"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Tabel Daftar Pengungsi (Clean Modern SaaS Table) */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Nama Lengkap &amp; Identitas</th>
                    <th className="py-3 px-3 w-16 text-center">L/P</th>
                    <th className="py-3 px-4 w-32">Usia &amp; Kategori</th>
                    <th className="py-3 px-4">Alamat Asal</th>
                    <th className="py-3 px-4">Kondisi Kesehatan</th>
                    <th className="py-3 px-4 w-36">Waktu Catat</th>
                    <th className="py-3 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedPengungsi.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600">Tidak ada data pengungsi</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {pengungsiSearch || pengungsiFilterKondisi !== "ALL"
                            ? "Coba ubah kata kunci atau reset filter pencarian."
                            : "Klik tombol '+ Tambah Data Pengungsi' untuk mulai mencatat warga."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPengungsi.map((p, idx) => {
                      const rowNumber = (pengungsiCurrentPage - 1) * pengungsiPerPage + idx + 1;
                      const kategoriUsia = p.kategoriUsia || determineKategoriUsia(p.usia);

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          {/* 1. Index */}
                          <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                            {rowNumber}
                          </td>

                          {/* 2. Nama & Identitas */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#EEF5F3] text-[#38746D] flex items-center justify-center font-bold text-xs shrink-0">
                                {p.nama.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 block leading-tight">
                                  {p.nama}
                                </span>
                                {p.catatan && (
                                  <p className="text-[11px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                                    {p.catatan}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 3. Jenis Kelamin */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                                p.jenisKelamin === "L"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {p.jenisKelamin}
                            </span>
                          </td>

                          {/* 4. Usia & Kategori */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-700">
                                {p.usia} thn
                              </span>
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  kategoriUsia === "Balita"
                                    ? "bg-pink-100 text-pink-800"
                                    : kategoriUsia === "Anak"
                                    ? "bg-purple-100 text-purple-800"
                                    : kategoriUsia === "Lansia"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {kategoriUsia}
                              </span>
                            </div>
                          </td>

                          {/* 5. Alamat Asal */}
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {p.alamatAsal}
                          </td>

                          {/* 6. Kondisi Kesehatan (Status Badges Sederhana Tanpa Ikon) */}
                          <td className="py-3 px-4">
                            {p.kondisiKesehatan === "Sehat" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                Sehat
                              </span>
                            )}
                            {p.kondisiKesehatan === "Sakit" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                Sakit
                              </span>
                            )}
                            {p.kondisiKesehatan === "Bumil" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                Bumil
                              </span>
                            )}
                            {p.kondisiKesehatan === "Disabilitas" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                Disabilitas
                              </span>
                            )}
                            {p.kondisiKesehatan === "Lansia Rentan" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                Lansia Rentan
                              </span>
                            )}
                          </td>

                          {/* 7. Waktu Catat */}
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {p.registeredAt || "Hari ini, 08:30 WIB"}
                          </td>

                          {/* 8. Aksi (Ghost/Text Modern Buttons) */}
                          <td className="py-3 px-4 text-center">
                            {selectedPosko.petugasId === officerId ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditPengungsi(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                                  title="Edit Data Pengungsi"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPengungsiToDelete(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Hapus Data Pengungsi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Hanya Baca</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pengungsi */}
            {pengungsiTotalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  Halaman <strong>{pengungsiCurrentPage}</strong> dari{" "}
                  <strong>{pengungsiTotalPages}</strong> ({filteredPengungsiList.length} data)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPengungsiCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={pengungsiCurrentPage <= 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setPengungsiCurrentPage((p) => Math.min(pengungsiTotalPages, p + 1))}
                    disabled={pengungsiCurrentPage >= pengungsiTotalPages}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* 2A. TAMPILAN INLINE DETAIL VIEW POSKO (Requirement 2 & 3) */
          /* ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar Detail View: Navigasi Kembali & Aksi Manajemen */}
          <div className="flex justify-between items-start gap-4 pb-4 border-b border-[#D5E4E0] w-full">
            {/* Sisi Kiri: Navigasi Kembali, Judul, Badges Sebaris, & Alamat */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPoskoId(null);
                    setIsManagingPengungsi(false);
                    setIsAddingPengungsi(false);
                    setEditingPengungsi(null);
                  }}
                  className="p-2.5 rounded-2xl bg-white border border-[#D5E4E0] hover:bg-gray-50 text-[#1D443F] transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0"
                  title="Kembali ke Daftar Posko"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                  {selectedPosko.nama}
                </h2>
                {selectedPosko.petugasId === officerId && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#38746D]/10 text-[#38746D] border border-[#38746D]/20 shrink-0">
                    Posko Saya
                  </span>
                )}
                {!selectedPosko.isActive && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 pl-12 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedPosko.alamat}, Kec. {selectedPosko.kecamatan}</span>
              </p>
            </div>

            {/* Sisi Kanan: Deretan Tombol Aksi Satu Baris (Flex Row) */}
            <div className="flex flex-row items-center gap-2 shrink-0">
              {selectedPosko.petugasId === officerId ? (
                <>
                  {/* 1. Toggle Nonaktifkan/Aktifkan */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(selectedPosko.id)}
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      selectedPosko.isActive
                        ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedPosko.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                  </button>

                  {/* 2. Edit Posko */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedPosko)}
                    className="px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-50 border border-[#D5E4E0] text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Edit Posko</span>
                  </button>

                  {/* 3. Hapus Posko (Ghost Button Ringkas) */}
                  <button
                    type="button"
                    onClick={() => setPoskoToDelete(selectedPosko)}
                    className="px-3 py-2 rounded-2xl border border-transparent hover:border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-row items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500 italic bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200">
                    Dikelola oleh {selectedPosko.petugasId}
                  </span>
                  <a
                    href={`tel:${selectedPosko.kontak.telp.replace(/[^0-9]/g, "")}`}
                    className="px-3.5 py-2 rounded-2xl bg-[#38746D] text-white hover:bg-[#24544E] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Hubungi PJ</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Grid Informasi Lengkap Posko */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Kolom Kiri: Galeri Foto & Fasilitas & Peta (2 Kolom di Desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Galeri Dokumentasi Foto Posko (Bento Grid Dinamis) */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#132422] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#38746D]" />
                    <span>Dokumentasi Visual Posko</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {(() => {
                      const photos =
                        selectedPosko.fotos && selectedPosko.fotos.length > 0
                          ? selectedPosko.fotos
                          : [selectedPosko.foto || SAMPLE_PHOTOS[0].url];
                      return `${photos.length} Foto Tersedia`;
                    })()}
                  </span>
                </div>

                {(() => {
                  const photos =
                    selectedPosko.fotos && selectedPosko.fotos.length > 0
                      ? selectedPosko.fotos
                      : [selectedPosko.foto || SAMPLE_PHOTOS[0].url];

                  return (
                    <div className="space-y-3">
                      {/* Bento Grid: 1 Foto, 2 Foto, 3+ Foto */}
                      {photos.length === 1 && (
                        <div
                          onClick={() => {
                            setLightboxIndex(0);
                            setIsLightboxOpen(true);
                          }}
                          className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs"
                        >
                          <img
                            src={photos[0]}
                            alt={selectedPosko.nama}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {photos.length === 2 && (
                        <div className="grid grid-cols-2 gap-3 aspect-[16/9] sm:h-80 w-full">
                          <div
                            onClick={() => {
                              setLightboxIndex(0);
                              setIsLightboxOpen(true);
                            }}
                            className="h-full rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs"
                          >
                            <img
                              src={photos[0]}
                              alt="Foto 1"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                          <div
                            onClick={() => {
                              setLightboxIndex(1);
                              setIsLightboxOpen(true);
                            }}
                            className="h-full rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs"
                          >
                            <img
                              src={photos[1]}
                              alt="Foto 2"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      )}

                      {photos.length >= 3 && (
                        <div className="grid grid-cols-2 grid-rows-2 gap-3 aspect-[16/9] sm:h-96 w-full">
                          {/* Foto 1: Sisi Kiri Besar (Row Span 2) */}
                          <div
                            onClick={() => {
                              setLightboxIndex(0);
                              setIsLightboxOpen(true);
                            }}
                            className="row-span-2 rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs"
                          >
                            <img
                              src={photos[0]}
                              alt="Foto Utama"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>

                          {/* Foto 2: Kanan Atas */}
                          <div
                            onClick={() => {
                              setLightboxIndex(1);
                              setIsLightboxOpen(true);
                            }}
                            className="rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs"
                          >
                            <img
                              src={photos[1]}
                              alt="Foto 2"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>

                          {/* Foto 3: Kanan Bawah (+ Overlay +X jika > 3 foto) */}
                          <div
                            onClick={() => {
                              setLightboxIndex(2);
                              setIsLightboxOpen(true);
                            }}
                            className="rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs"
                          >
                            <img
                              src={photos[2]}
                              alt="Foto 3"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            {photos.length > 3 && (
                              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-2xs flex flex-col items-center justify-center transition-colors group-hover:bg-slate-950/75 text-white">
                                <span className="text-2xl sm:text-3xl font-black tracking-wider">
                                  +{photos.length - 3}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-200 mt-0.5">
                                  Lihat Semua
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 2. Fasilitas Posko */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Package className="w-4 h-4 text-[#38746D]" />
                  <h3 className="text-sm font-bold text-[#132422]">
                    Fasilitas Siaga Bencana Tersedia
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedPosko.fasilitas.map((f) => (
                    <span
                      key={f}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Peta Statis / Mini Lokasi Presisi */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#38746D]" />
                    <h3 className="text-sm font-bold text-[#132422]">
                      Titik Presisi Lokasi Posko (Peta Lapangan)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-gray-500">
                    {selectedPosko.lat.toFixed(5)}, {selectedPosko.lng.toFixed(5)}
                  </span>
                </div>

                <PoskoMapPicker
                  lat={selectedPosko.lat}
                  lng={selectedPosko.lng}
                  poskoName={selectedPosko.nama}
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Kolom Kanan: Kapasitas, Okupansi & Penanggung Jawab (1 Kolom di Desktop) */}
            <div className="space-y-6">
              {/* Card Kapasitas & Pengaturan Keterisian */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Kapasitas &amp; Tingkat Okupansi
                </span>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-3xl font-black text-[#132422]">
                      {selectedPosko.terisi} <span className="text-sm font-medium text-gray-500">/ {selectedPosko.kapasitas} jiwa</span>
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedPosko.terisi >= selectedPosko.kapasitas
                          ? "bg-rose-100 text-rose-800"
                          : selectedPosko.terisi >= selectedPosko.kapasitas * 0.7
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {Math.round((selectedPosko.terisi / selectedPosko.kapasitas) * 100)}% Terisi
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedPosko.terisi >= selectedPosko.kapasitas
                          ? "bg-rose-600"
                          : selectedPosko.terisi >= selectedPosko.kapasitas * 0.7
                          ? "bg-amber-500"
                          : "bg-[#38746D]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((selectedPosko.terisi / selectedPosko.kapasitas) * 100)
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 pt-1">
                    Sisa daya tampung:{" "}
                    <strong className="text-[#38746D]">
                      {Math.max(0, selectedPosko.kapasitas - selectedPosko.terisi)} jiwa tersisa
                    </strong>
                  </p>
                </div>

                {/* Entry Point: Kelola Data Pengungsi */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManagingPengungsi(true);
                      setIsAddingPengungsi(false);
                      setEditingPengungsi(null);
                      setPengungsiSearch("");
                      setPengungsiFilterKondisi("ALL");
                      setPengungsiCurrentPage(1);
                    }}
                    className="w-full h-12 px-4 rounded-2xl bg-[#38746D] hover:bg-[#2C5B55] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border-none active:scale-[0.99]"
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Kelola Data Pengungsi</span>
                  </button>
                </div>
              </div>

              {/* Card Penanggung Jawab & Kontak */}
              <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Penanggung Jawab Posko
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF5F3] text-[#38746D] font-bold text-base flex items-center justify-center shrink-0">
                    {selectedPosko.kontak.pj.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#132422]">{selectedPosko.kontak.pj}</h4>
                    <p className="text-xs text-gray-500">Koordinator Lapangan Posko</p>
                    <p className="text-xs font-mono font-medium text-[#38746D] mt-0.5">
                      {selectedPosko.kontak.telp}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${selectedPosko.kontak.telp.replace(/[^0-9]/g, "")}`}
                    className="w-full h-12 px-4 rounded-2xl bg-[#38746D] hover:bg-[#2C5B55] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border-none active:scale-[0.99]"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Hubungi Penanggung Jawab</span>
                  </a>
                </div>
              </div>

              {/* Card Meta & Otoritas Posko */}
              <div className="p-5 rounded-3xl bg-[#F8FAF9] border border-gray-100 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>ID Registrasi:</span>
                  <span className="font-mono font-bold text-gray-700">{selectedPosko.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Petugas Pengelola:</span>
                  <span className="font-bold text-gray-700">{selectedPosko.petugasId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status Visibilitas:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedPosko.isActive ? "Tampil di Peta Warga" : "Disembunyikan"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      ) : (
        /* ======================================================== */
        /* 3. TAMPILAN UTAMA: METRIK & DAFTAR KARTU POSKO           */
        /* ======================================================== */
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
                onClick={handleStartCreate}
                className="px-4 py-2 rounded-2xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Posko Baru</span>
              </button>
            </div>

            {/* Input Search Bar & Tombol Filter */}
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

              {/* Tombol Filter Wilayah */}
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

          {/* DAFTAR KARTU POSKO (CLICKABLE CARD TANPA TOMBOL CRUD - Requirement 2 & 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoadingPosko && shelters.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-20 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-3.5 w-64 bg-slate-100 rounded-md" />
                  <div className="w-full h-40 bg-slate-200/70 rounded-2xl" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 w-28 bg-slate-100 rounded-md" />
                    <div className="h-4 w-20 bg-slate-100 rounded-md" />
                  </div>
                </div>
              ))
            ) : paginatedShelters.length === 0 ? (
              <div className="lg:col-span-2 p-12 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-2">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="text-base font-bold text-gray-700">Tidak Ada Posko yang Cocok</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tidak ada data posko evakuasi yang sesuai dengan filter atau kata kunci &quot;{searchQuery}&quot;.
                </p>
              </div>
            ) : (
              paginatedShelters.map((shelter) => {
                const isOwner = shelter.petugasId === officerId;
                const photos =
                  shelter.fotos && shelter.fotos.length > 0
                    ? shelter.fotos
                    : [shelter.foto || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"];

                return (
                  <div
                    key={shelter.id}
                    onClick={() => {
                      setSelectedPoskoId(shelter.id);
                      setSelectedGalleryIndex(0);
                    }}
                    className={`h-full flex flex-col justify-between p-5 rounded-3xl border shadow-xs transition-all cursor-pointer hover:border-[#38746D] hover:shadow-md group overflow-hidden ${
                      !shelter.isActive
                        ? "border-amber-200/80 bg-yellow-50/50"
                        : isOwner
                        ? "bg-white border-[#38746D]/30"
                        : "bg-white border-[#D5E4E0]"
                    }`}
                  >
                    <div>
                      {/* 1. Header Atas (Inline Badges & Alamat) */}
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-[#38746D] transition-colors">
                            {shelter.nama}
                          </h3>
                          {isOwner && (
                            <span className="text-[11px] font-semibold text-[#38746D] bg-[#38746D]/10 border border-[#38746D]/20 px-2.5 py-0.5 rounded-full shrink-0">
                              Posko Saya
                            </span>
                          )}
                          {!shelter.isActive && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200/90 px-2.5 py-0.5 rounded-full shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                              Nonaktif
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{shelter.alamat}, Kec. {shelter.kecamatan}</span>
                        </p>
                      </div>

                      {/* 2. Body Card: Render Galeri Foto Secara Dinamis (1, 2, atau >= 3 Foto) */}
                      {photos.length === 1 && (
                        <div className="w-full h-40 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 my-3">
                          <img
                            src={photos[0]}
                            alt={shelter.nama}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {photos.length === 2 && (
                        <div className="grid grid-cols-2 gap-2 h-40 my-3 w-full">
                          <div className="h-full w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 relative">
                            <img
                              src={photos[0]}
                              alt={`${shelter.nama} 1`}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                          <div className="h-full w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 relative">
                            <img
                              src={photos[1]}
                              alt={`${shelter.nama} 2`}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      )}

                      {photos.length >= 3 && (
                        <div className="grid grid-cols-3 gap-2 h-40 my-3 w-full">
                          {/* Sisi Kiri: 1 Foto Utama Besar (col-span-2) */}
                          <div className="col-span-2 h-full w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 relative">
                            <img
                              src={photos[0]}
                              alt={shelter.nama}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>

                          {/* Sisi Kanan: 2 Foto Kecil Ditumpuk Vertikal */}
                          <div className="col-span-1 grid grid-rows-2 gap-2 h-full w-full min-h-0">
                            <div className="h-full w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 relative min-h-0">
                              <img
                                src={photos[1]}
                                alt={`${shelter.nama} 2`}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="h-full w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80 relative min-h-0">
                              <img
                                src={photos[2]}
                                alt={`${shelter.nama} 3`}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                              {photos.length > 3 && (
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center text-white rounded-lg">
                                  <span className="text-sm font-extrabold tracking-wide">
                                    +{photos.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Footer Minimalis (Kapasitas, Nama PJ, & Quick Actions Edit/Hapus) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Users className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">
                          Kapasitas: {shelter.terisi} / {shelter.kapasitas} Jiwa
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 pl-2">
                        <div className="flex items-center gap-1 text-slate-600 min-w-0">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[110px] sm:max-w-[150px]">
                            PJ: {shelter.kontak.pj}
                          </span>
                        </div>

                        {/* Quick Actions (Edit & Hapus) hanya jika posko dikelola saya */}
                        {isOwner && (
                          <div
                            className="flex items-center gap-1 pl-1.5 border-l border-slate-200/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(shelter);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-[#38746D] hover:bg-[#EEF5F3] transition cursor-pointer"
                              title="Edit Posko (Mode Form Inline)"
                              aria-label="Edit Posko"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPoskoToDelete(shelter);
                              }}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Posko"
                              aria-label="Hapus Posko"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38746D] group-hover:translate-x-0.5 transition-all" />
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

      {/* ======================================================== */}
      {/* 4. CUSTOM MODAL KONFIRMASI HAPUS (Requirement 4)          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {poskoToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-gray-900">Hapus Posko?</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong className="text-gray-900">&quot;{poskoToDelete.nama}&quot;</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPoskoToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePosko}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS DATA PENGUNGSI */}
        {pengungsiToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-gray-900">Hapus Data Pengungsi?</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data pengungsi{" "}
                  <strong className="text-gray-900">&quot;{pengungsiToDelete.nama}&quot;</strong> dari posko ini?
                  Kapasitas terisi posko akan otomatis berkurang 1 jiwa.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPengungsiToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePengungsi}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  Ya, Hapus Pengungsi
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL LIGHTBOX FOTO RESOLUSI PENUH */}
        {isLightboxOpen && selectedPosko && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar Lightbox */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h4 className="text-sm sm:text-base font-bold">{selectedPosko.nama}</h4>
                <p className="text-xs text-slate-400">
                  Foto {lightboxIndex + 1} dari{" "}
                  {selectedPosko.fotos?.length || (selectedPosko.foto ? 1 : 0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Tutup Galeri"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image View */}
            <div
              className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const photos =
                  selectedPosko.fotos && selectedPosko.fotos.length > 0
                    ? selectedPosko.fotos
                    : [selectedPosko.foto || SAMPLE_PHOTOS[0].url];
                const curr = photos[lightboxIndex] || photos[0];

                return (
                  <>
                    <img
                      src={curr}
                      alt={`Dokumentasi ${lightboxIndex + 1}`}
                      className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                    />

                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                          }}
                          className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                          title="Foto Sebelumnya"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                          title="Foto Selanjutnya"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Bottom Thumbnail Strip */}
            {(() => {
              const photos =
                selectedPosko.fotos && selectedPosko.fotos.length > 0
                  ? selectedPosko.fotos
                  : [selectedPosko.foto || SAMPLE_PHOTOS[0].url];
              if (photos.length <= 1) return null;

              return (
                <div
                  className="flex items-center gap-2 overflow-x-auto max-w-5xl pt-4 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        lightboxIndex === idx
                          ? "border-[#88BDB6] ring-2 ring-[#88BDB6]/50 scale-105"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={p} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
