import { CURATED_POSKO_LIST, type PoskoItem } from "@/data/curatedEvakuasiData";

export interface PoskoRecord extends PoskoItem {
  petugasId: string;
  isActive: boolean;
}

const STORAGE_KEY = "dermayu_posko_simulated_v1";

/**
 * Inisialisasi 100 Posko Terkurasi dengan atribut petugasId dan isActive
 * - sh-001, sh-002, sh-004, sh-007, dst dibuat oleh petugas-01 (Petugas BPBD aktif)
 * - Posko lainnya dibuat oleh petugas lapangan lainnya (petugas-02, petugas-03)
 */
function getInitialPoskoDataset(): PoskoRecord[] {
  return CURATED_POSKO_LIST.map((item, index) => {
    // 40% posko dimiliki oleh petugas-01, sisanya oleh petugas lain
    const isOwner =
      index === 0 || // sh-001 (SMKN 1 Kandanghaur)
      index === 1 || // sh-002 (SMPN 1 Kandanghaur)
      index === 3 || // sh-004
      index % 3 === 0;

    const petugasId = isOwner
      ? "petugas-01"
      : index % 2 === 0
      ? "petugas-02"
      : "petugas-03";

    return {
      ...item,
      petugasId: item.petugasId || petugasId,
      isActive: item.isActive !== undefined ? item.isActive : true,
    };
  });
}

/**
 * Memuat semua data posko (termasuk yang nonaktif)
 */
export function getAllPosko(): PoskoRecord[] {
  if (typeof window === "undefined") {
    return getInitialPoskoDataset();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialPoskoDataset();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: PoskoRecord[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error reading posko data:", err);
    return getInitialPoskoDataset();
  }
}

/**
 * Menyimpan data posko ke localStorage dan menyiarkan event perubahan
 */
function savePoskoDataset(items: PoskoRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("dermayu_posko_updated", { detail: items }));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error saving posko data:", err);
  }
}

/**
 * FILTER VISIBILITAS WARGA (Rule 4):
 * Pada endpoint / view Warga (halaman /posko dan WebGIS /rute),
 * WAJIB tambahkan filter WHERE isActive = true.
 * Posko yang dinonaktifkan tidak boleh muncul sama sekali di layar warga!
 */
export function getWargaPosko(): PoskoRecord[] {
  return getAllPosko().filter((p) => p.isActive === true);
}

/**
 * Mengambil data posko untuk Petugas (semua posko)
 */
export function getPetugasPosko(): PoskoRecord[] {
  return getAllPosko();
}

/**
 * UPDATE POSKO (Rule 3 & 4):
 * Petugas HANYA diizinkan mengedit posko yang mereka buat sendiri.
 * Validasi: if (posko.petugasId !== currentUser.id) throw new Error("Unauthorized")
 */
export function updatePosko(
  poskoId: string,
  updates: Partial<PoskoRecord>,
  currentUser: { id: string; role?: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);

  if (!target) {
    throw new Error("Posko evakuasi tidak ditemukan");
  }

  // ATURAN OTORISASI: Petugas HANYA diizinkan mengedit posko yang mereka buat sendiri
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengedit posko yang dibuat sendiri");
  }

  const updated: PoskoRecord = {
    ...target,
    ...updates,
    id: target.id, // Pertahankan ID asli
    petugasId: target.petugasId, // Pertahankan pemilik asli
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

/**
 * TOGGLE NONAKTIF / AKTIF POSKO (Rule 4):
 * Petugas pembuat dapat menonaktifkan atau mengaktifkan kembali poskonya.
 */
export function toggleActivePosko(
  poskoId: string,
  currentUser: { id: string; role?: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);

  if (!target) {
    throw new Error("Posko evakuasi tidak ditemukan");
  }

  // ATURAN OTORISASI: Petugas HANYA diizinkan mengubah posko miliknya sendiri
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengubah status posko yang dibuat sendiri");
  }

  const updated: PoskoRecord = {
    ...target,
    isActive: !target.isActive,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

/**
 * DELETE POSKO / SOFT-DELETE (Rule 3 & 4):
 * Petugas HANYA diizinkan menghapus posko yang mereka buat sendiri.
 * Melakukan soft-delete dengan mengubah isActive = false.
 */
export function deletePosko(
  poskoId: string,
  currentUser: { id: string; role?: string }
): void {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);

  if (!target) {
    throw new Error("Posko evakuasi tidak ditemukan");
  }

  // ATURAN OTORISASI: Petugas HANYA diizinkan menghapus posko miliknya sendiri
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan menghapus posko yang dibuat sendiri");
  }

  // Soft-delete: tandai isActive = false
  const updated: PoskoRecord = {
    ...target,
    isActive: false,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
}

/**
 * CREATE POSKO BARU (Petugas):
 * Menambahkan posko baru langsung ke dataset simulasi dengan kepemilikan petugas yang login.
 */
export function createPosko(
  data: {
    nama: string;
    kategori?: "sekolah" | "masjid" | "balai_desa" | "gor";
    alamat: string;
    kecamatan: string;
    lat: number;
    lng: number;
    kapasitas: number;
    fasilitas: string[];
    kontak: { pj: string; telp: string };
  },
  currentUser: { id: string; role?: string }
): PoskoRecord {
  const all = getAllPosko();
  const nextNumber = all.length + 1;
  const newId = `sh-${String(nextNumber).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

  const newRecord: PoskoRecord = {
    id: newId,
    nama: data.nama,
    kategori: data.kategori || "balai_desa",
    alamat: data.alamat,
    kecamatan: data.kecamatan,
    lat: data.lat,
    lng: data.lng,
    kapasitas: Number(data.kapasitas) || 100,
    terisi: 0,
    status: "TERSEDIA",
    fasilitas: data.fasilitas.length > 0 ? data.fasilitas : ["Aula", "Toilet"],
    kontak: {
      pj: data.kontak.pj || "Petugas Jaga",
      telp: data.kontak.telp || "0812-3456-7890",
    },
    foto: "/shelters/default.jpg",
    tier: 1,
    petugasId: currentUser.id,
    isActive: true,
  };

  const nextList = [newRecord, ...all];
  savePoskoDataset(nextList);
  return newRecord;
}

