import { CURATED_POSKO_LIST, type PoskoItem, type PengungsiItem } from "@/data/curatedEvakuasiData";

export type { PengungsiItem };

export interface PoskoRecord extends PoskoItem {
  petugasId: string;
  isActive: boolean;
  pengungsi?: PengungsiItem[];
  photos?: string[];
}

const STORAGE_KEY = "dermayu_posko_simulated_v4";

const INDO_FIRST_NAMES_L = [
  "Ahmad", "Budi", "Dedi", "Eko", "Hendra", "Kusnan", "Lukman", "Rahmat", "Slamet", "Ujang",
  "Wawan", "Yudi", "Agus", "Bambang", "Cecep", "Darto", "Karsiman", "Maman", "Rohman", "Tatang",
  "Ade", "Nanang", "Dadang", "Asep", "Iwan", "Joko", "Sutrisno", "Wahyu", "Rizki", "Fajar"
];

const INDO_FIRST_NAMES_P = [
  "Siti", "Nurul", "Raminah", "Dewi", "Sri", "Ratna", "Aisyah", "Kartika", "Aminah", "Endang",
  "Iis", "Kokom", "Lilis", "Neni", "Titin", "Yati", "Yuliana", "Maryam", "Kusmiati", "Suhaeti",
  "Rina", "Fitri", "Wati", "Neneng", "Cucu", "Eni", "Tati", "Dian", "Anisa", "Putri"
];

const INDO_LAST_NAMES = [
  "Riyadi", "Maryam", "Suwandi", "Hidayah", "Pratama", "Karsiman", "Kartika", "Saputra", "Santoso", "Wijaya",
  "Hidayat", "Kurniawan", "Setiawan", "Utomo", "Nugroho", "Suharto", "Gunawan", "Susanto", "Kusuma", "Hermawan",
  "Maulana", "Syahputra", "Ramadhan", "Firmansyah", "Hakim", "Permana", "Wahyudi", "Siregar", "Hambali", "Subagja"
];

function generateInitialPengungsi(poskoId: string, terisi: number, alamat: string): PengungsiItem[] {
  const namedSamples: Array<{
    nama: string;
    jenisKelamin: "L" | "P";
    usia: number;
    kategoriUsia: "Balita" | "Anak" | "Dewasa" | "Lansia";
    kondisiKesehatan: "Sehat" | "Sakit" | "Bumil" | "Disabilitas" | "Lansia Rentan";
    alamatAsal: string;
  }> = [
    { nama: "Slamet Riyadi", jenisKelamin: "L", usia: 48, kategoriUsia: "Dewasa", kondisiKesehatan: "Sehat", alamatAsal: "RT 02 / RW 01, Blok Karanganyar" },
    { nama: "Siti Maryam", jenisKelamin: "P", usia: 42, kategoriUsia: "Dewasa", kondisiKesehatan: "Sehat", alamatAsal: "RT 02 / RW 01, Blok Karanganyar" },
    { nama: "Mbah Raminah", jenisKelamin: "P", usia: 72, kategoriUsia: "Lansia", kondisiKesehatan: "Lansia Rentan", alamatAsal: "RT 04 / RW 02, Eretan Wetan" },
    { nama: "Kusnan Suwandi", jenisKelamin: "L", usia: 35, kategoriUsia: "Dewasa", kondisiKesehatan: "Sehat", alamatAsal: "RT 01 / RW 03, Ilir Kandanghaur" },
    { nama: "Ibu Nurul Hidayah", jenisKelamin: "P", usia: 28, kategoriUsia: "Dewasa", kondisiKesehatan: "Bumil", alamatAsal: "RT 05 / RW 02, Muara Cantigi" },
    { nama: "Adik Doni Pratama", jenisKelamin: "L", usia: 3, kategoriUsia: "Balita", kondisiKesehatan: "Sehat", alamatAsal: "RT 05 / RW 02, Muara Cantigi" },
    { nama: "Pak Karsiman", jenisKelamin: "L", usia: 59, kategoriUsia: "Lansia", kondisiKesehatan: "Sakit", alamatAsal: "RT 03 / RW 01, Kertawinangun" },
    { nama: "Dewi Kartika", jenisKelamin: "P", usia: 19, kategoriUsia: "Dewasa", kondisiKesehatan: "Disabilitas", alamatAsal: "RT 02 / RW 04, Parean Girang" },
  ];

  const list: PengungsiItem[] = [];
  // Batasi sampel data pengungsi awal ke maksimal 8 orang per posko
  // agar payload JSON sangat ringan (~80KB total vs 4.5MB) dan tidak melebihi kuota 5MB localStorage
  const targetCount = Math.min(Math.max(0, terisi), 8);
  const namedCount = Math.min(targetCount, namedSamples.length);

  for (let i = 0; i < namedCount; i++) {
    const s = namedSamples[i];
    list.push({
      id: `${poskoId}-pg-${i + 1}`,
      nama: s.nama,
      jenisKelamin: s.jenisKelamin,
      usia: s.usia,
      kategoriUsia: s.kategoriUsia,
      alamatAsal: s.alamatAsal,
      kondisiKesehatan: s.kondisiKesehatan,
      isAnonim: false,
      registeredAt: "Hari ini, 08:30 WIB",
    });
  }

  // Generate real named citizens for the remaining slots (NO anonymous entries)
  for (let i = namedCount; i < targetCount; i++) {
    const isL = i % 2 === 0;
    const firstArr = isL ? INDO_FIRST_NAMES_L : INDO_FIRST_NAMES_P;
    const first = firstArr[(i * 3) % firstArr.length];
    const last = INDO_LAST_NAMES[(i * 7) % INDO_LAST_NAMES.length];
    const fullName = `${first} ${last}`;

    let usia = 22 + (i % 38);
    let kategoriUsia: "Balita" | "Anak" | "Dewasa" | "Lansia" = "Dewasa";
    let kondisiKesehatan: "Sehat" | "Sakit" | "Bumil" | "Disabilitas" | "Lansia Rentan" = "Sehat";

    if (i % 16 === 0) {
      usia = 3;
      kategoriUsia = "Balita";
      kondisiKesehatan = "Sehat";
    } else if (i % 16 === 1) {
      usia = 9;
      kategoriUsia = "Anak";
      kondisiKesehatan = "Sehat";
    } else if (i % 16 === 2) {
      usia = 14;
      kategoriUsia = "Anak";
      kondisiKesehatan = "Sehat";
    } else if (i % 16 === 3 && !isL) {
      usia = 27;
      kategoriUsia = "Dewasa";
      kondisiKesehatan = "Bumil";
    } else if (i % 16 === 4) {
      usia = 67;
      kategoriUsia = "Lansia";
      kondisiKesehatan = "Lansia Rentan";
    } else if (i % 16 === 5) {
      usia = 32;
      kategoriUsia = "Dewasa";
      kondisiKesehatan = "Disabilitas";
    } else if (i % 16 === 6) {
      usia = 51;
      kategoriUsia = "Dewasa";
      kondisiKesehatan = "Sakit";
    }

    list.push({
      id: `${poskoId}-pg-${i + 1}`,
      nama: fullName,
      jenisKelamin: isL ? "L" : "P",
      usia,
      kategoriUsia,
      alamatAsal: alamat,
      kondisiKesehatan,
      isAnonim: false,
      registeredAt: "Hari ini, 08:30 WIB",
    });
  }

  return list;
}

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

    const photos =
      item.photos && item.photos.length > 0
        ? item.photos
        : item.fotos && item.fotos.length > 0
        ? item.fotos
        : item.foto && !item.foto.includes("default.jpg")
        ? [item.foto]
        : [];

    const pengungsi =
      item.pengungsi && item.pengungsi.length > 0
        ? item.pengungsi
        : generateInitialPengungsi(item.id, item.terisi, item.alamat);

    return {
      ...item,
      petugasId: item.petugasId || petugasId,
      isActive: item.isActive !== undefined ? item.isActive : true,
      foto: photos[0] || item.foto || "",
      fotos: photos,
      photos,
      pengungsi,
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
    // Bersihkan cache versi lama jika ada untuk membebaskan kuota 5MB localStorage
    try {
      [
        "dermayu_posko_simulated",
        "dermayu_posko_simulated_v1",
        "dermayu_posko_simulated_v2",
        "dermayu_posko_simulated_v3",
      ].forEach((oldKey) => {
        if (localStorage.getItem(oldKey)) {
          localStorage.removeItem(oldKey);
        }
      });
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialPoskoDataset();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch (quotaErr) {
        console.warn("Storage quota fallback on initial write:", quotaErr);
        const compact = initial.map((it) => ({
          ...it,
          pengungsi: (it.pengungsi || []).slice(0, 4),
        }));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
        } catch {
          // ignore
        }
      }
      return initial;
    }
    const parsed: PoskoRecord[] = JSON.parse(raw);
    let hasContaminatedData = false;
    const curatedMap = new Map(CURATED_POSKO_LIST.map((item) => [item.id, item]));

    // Pastikan setiap posko mempertahankan jumlah foto persis sesuai input user dan memiliki atribut valid
    const enriched = (Array.isArray(parsed) ? parsed : [])
      .filter((p) => p && typeof p === "object")
      .map((p) => {
        const nama = p.nama || (p as any).name || "Posko Siaga Evakuasi";
        const alamat = p.alamat || (p as any).location || "";
        const kecamatan = p.kecamatan || (p as any).district || "Kandanghaur";
        const kontak = p.kontak || { pj: "Petugas Jaga", telp: "0812-3456-7890" };

        if (!p.nama || !p.kontak?.pj) {
          hasContaminatedData = true;
        }

        let photos = p.photos && p.photos.length > 0 ? p.photos : p.fotos;

        // Bersihkan foto default.jpg jika ada
        if (photos && photos.length > 0) {
          photos = photos.filter((f) => typeof f === "string" && !f.includes("default.jpg"));
        }

        // Sinkronisasi foto resmi kurasi (Kemendikdasmen, Wikimedia Commons kantor desa/masjid/GOR)
        const curated = curatedMap.get(p.id);
        if (curated) {
          const isUserUploaded = photos && photos.some((f) => typeof f === "string" && f.startsWith("data:"));
          if (!isUserUploaded && curated.foto) {
            if (p.foto !== curated.foto || !photos || photos[0] !== curated.foto) {
              p.foto = curated.foto;
              photos = (curated.fotos && curated.fotos.length > 0) ? curated.fotos : [curated.foto];
              hasContaminatedData = true;
            }
          }
          if (p.lat !== curated.lat || p.lng !== curated.lng) {
            p.lat = curated.lat;
            p.lng = curated.lng;
            hasContaminatedData = true;
          }
        }

        // Jika photos kosong atau tidak ada, gunakan p.foto asli
        if (!photos || photos.length === 0) {
          photos = p.foto && !p.foto.includes("default.jpg") ? [p.foto] : [];
        } else {
          // Jika posko memiliki foto unggahan user (data:image)
          if (photos[0]?.startsWith("data:")) {
            const onlyUserUploaded = photos.filter((f) => f.startsWith("data:"));
            if (onlyUserUploaded.length > 0 && onlyUserUploaded.length !== photos.length) {
              photos = onlyUserUploaded;
              hasContaminatedData = true;
            }
          }
        }

        let pengungsi =
          p.pengungsi && p.pengungsi.length > 0
            ? p.pengungsi
            : generateInitialPengungsi(p.id, p.terisi, alamat);

        // Migrasi: Gantikan pengungsi anonim lama menjadi warga riil dengan nama asli
        if (pengungsi.some((item) => item.isAnonim || (item.nama && item.nama.startsWith("Anonim / Belum Terdata")))) {
          pengungsi = generateInitialPengungsi(p.id, pengungsi.length, alamat);
          hasContaminatedData = true;
        }

        return {
          ...p,
          nama,
          alamat,
          kecamatan,
          kontak,
          foto: photos[0],
          fotos: photos,
          photos: photos,
          pengungsi,
        };
      });

    if (hasContaminatedData) {
      savePoskoDataset(enriched, false);
    }

    return enriched;
  } catch (err) {
    console.error("Error reading posko data:", err);
    return getInitialPoskoDataset();
  }
}

/**
 * Menyimpan data posko ke localStorage dan menyiarkan event perubahan
 */
function savePoskoDataset(items: PoskoRecord[], broadcast = true) {
  if (typeof window === "undefined") return;
  try {
    const nextStr = JSON.stringify(items);
    const prev = localStorage.getItem(STORAGE_KEY);
    // Jika isi data identik, jangan dispatch event untuk mencegah nested loop
    if (prev === nextStr) return;
    localStorage.setItem(STORAGE_KEY, nextStr);
    if (broadcast) {
      window.dispatchEvent(new CustomEvent("dermayu_posko_updated", { detail: items }));
    }
  } catch (err) {
    console.warn("Storage quota limit reached in savePoskoDataset, performing quota cleanup:", err);
    try {
      // 1. Hapus semua key cache versi lama untuk membebaskan ruang penyimpanan
      [
        "dermayu_posko_simulated",
        "dermayu_posko_simulated_v1",
        "dermayu_posko_simulated_v2",
        "dermayu_posko_simulated_v3",
      ].forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // 2. Ringankan array pengungsi menjadi maksimal 5 item per posko
      const compactItems = items.map((it) => ({
        ...it,
        pengungsi: (it.pengungsi || []).slice(0, 5),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactItems));
      if (broadcast) {
        window.dispatchEvent(new CustomEvent("dermayu_posko_updated", { detail: compactItems }));
      }
    } catch (fallbackErr) {
      console.error("Critical: localStorage quota fully exhausted:", fallbackErr);
    }
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
    foto?: string;
    fotos?: string[];
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
    foto: (data.fotos && data.fotos.length > 0) ? data.fotos[0] : (data.foto || "/shelters/default.jpg"),
    fotos: data.fotos || (data.foto ? [data.foto] : []),
    tier: 1,
    petugasId: currentUser.id,
    isActive: true,
  };

  const nextList = [newRecord, ...all];
  savePoskoDataset(nextList);
  return newRecord;
}

/**
 * Menentukan kategori usia otomatis berdasarkan angka usia
 */
export function determineKategoriUsia(usia: number): "Balita" | "Anak" | "Dewasa" | "Lansia" {
  if (usia < 5) return "Balita";
  if (usia < 18) return "Anak";
  if (usia < 60) return "Dewasa";
  return "Lansia";
}

/**
 * MENAMBAH DATA PENGUNGSI (By Name)
 * - Single source of truth: menambah 1 pengungsi menambah terisi + 1
 */
export function addPengungsi(
  poskoId: string,
  data: {
    nama: string;
    jenisKelamin: "L" | "P";
    usia: number;
    alamatAsal: string;
    kondisiKesehatan: "Sehat" | "Sakit" | "Bumil" | "Disabilitas" | "Lansia Rentan";
    catatan?: string;
  },
  currentUser: { id: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengelola posko yang dibuat sendiri");
  }

  const pengungsiList = target.pengungsi ? [...target.pengungsi] : [];
  if (pengungsiList.length >= target.kapasitas) {
    throw new Error("Kapasitas posko sudah penuh, tidak dapat menambah pengungsi baru.");
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
  const newPengungsi: PengungsiItem = {
    id: `${poskoId}-pg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    nama: data.nama.trim(),
    jenisKelamin: data.jenisKelamin,
    usia: Number(data.usia) || 0,
    kategoriUsia: determineKategoriUsia(Number(data.usia) || 0),
    alamatAsal: data.alamatAsal.trim() || target.alamat,
    kondisiKesehatan: data.kondisiKesehatan || "Sehat",
    isAnonim: false,
    registeredAt: `Hari ini, ${timeStr}`,
    catatan: data.catatan?.trim() || undefined,
  };

  pengungsiList.unshift(newPengungsi);
  const newTerisi = pengungsiList.length;
  const newStatus =
    newTerisi >= target.kapasitas
      ? "PENUH"
      : newTerisi >= target.kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  const updated: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

/**
 * MENGUBAH DATA PENGUNGSI (Update / Melengkapi Data Anonim)
 */
export function updatePengungsi(
  poskoId: string,
  pengungsiId: string,
  updates: Partial<PengungsiItem>,
  currentUser: { id: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengelola posko yang dibuat sendiri");
  }

  const pengungsiList = target.pengungsi ? [...target.pengungsi] : [];
  const pIndex = pengungsiList.findIndex((p) => p.id === pengungsiId);
  if (pIndex === -1) throw new Error("Data pengungsi tidak ditemukan");

  const currentP = pengungsiList[pIndex];
  const newUsia = updates.usia !== undefined ? Number(updates.usia) : currentP.usia;
  const updatedItem: PengungsiItem = {
    ...currentP,
    ...updates,
    usia: newUsia,
    kategoriUsia: determineKategoriUsia(newUsia),
    // Jika nama diperbarui dari anonim, tandai bukan anonim lagi
    isAnonim: updates.nama && !updates.nama.startsWith("Anonim / Belum Terdata") ? false : (updates.isAnonim !== undefined ? updates.isAnonim : currentP.isAnonim),
  };

  pengungsiList[pIndex] = updatedItem;
  const updated: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

/**
 * MENGHAPUS DATA PENGUNGSI
 * - Single source of truth: menghapus 1 pengungsi mengurangi terisi - 1
 */
export function deletePengungsi(
  poskoId: string,
  pengungsiId: string,
  currentUser: { id: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengelola posko yang dibuat sendiri");
  }

  const pengungsiList = (target.pengungsi || []).filter((p) => p.id !== pengungsiId);
  const newTerisi = pengungsiList.length;
  const newStatus =
    newTerisi >= target.kapasitas
      ? "PENUH"
      : newTerisi >= target.kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  const updated: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

/**
 * PENCATATAN CEPAT (-5, -1, +1, +5) DENGAN SINKRONISASI PENGUNGSI
 * - Menambah N record anonim saat delta > 0
 * - Menghapus N record dari list saat delta < 0 (prioritas hapus anonim)
 */
export function adjustPoskoOccupancyWithEvacuees(
  poskoId: string,
  delta: number,
  currentUser: { id: string }
): PoskoRecord {
  const all = getAllPosko();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");
  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengelola posko yang dibuat sendiri");
  }

  let pengungsiList = target.pengungsi ? [...target.pengungsi] : [];

  if (delta > 0) {
    const availableSlots = Math.max(0, target.kapasitas - pengungsiList.length);
    const toAdd = Math.min(delta, availableSlots);
    if (toAdd <= 0) {
      throw new Error("Kapasitas posko sudah mencapai batas maksimum.");
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    for (let i = 0; i < toAdd; i++) {
      const currentNumber = pengungsiList.length + 1;
      pengungsiList.push({
        id: `${poskoId}-pg-${Date.now()}-${i}`,
        nama: `Anonim / Belum Terdata #${String(currentNumber).padStart(3, "0")}`,
        jenisKelamin: i % 2 === 0 ? "L" : "P",
        usia: 30 + (i % 25),
        kategoriUsia: "Dewasa",
        alamatAsal: target.alamat,
        kondisiKesehatan: "Sehat",
        isAnonim: true,
        registeredAt: `Pencatatan Cepat, ${timeStr}`,
      });
    }
  } else if (delta < 0) {
    const toRemove = Math.min(Math.abs(delta), pengungsiList.length);
    for (let i = 0; i < toRemove; i++) {
      // Prioritaskan hapus record anonim dari paling belakang
      let anonIdx = -1;
      for (let j = pengungsiList.length - 1; j >= 0; j--) {
        if (pengungsiList[j].isAnonim) {
          anonIdx = j;
          break;
        }
      }
      if (anonIdx !== -1) {
        pengungsiList.splice(anonIdx, 1);
      } else {
        pengungsiList.pop();
      }
    }
  }

  const newTerisi = pengungsiList.length;
  const newStatus =
    newTerisi >= target.kapasitas
      ? "PENUH"
      : newTerisi >= target.kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  const updated: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  savePoskoDataset(nextList);
  return updated;
}

// ============================================================================
// ASYNC API CLIENT HELPERS (PRD INTEGRATION: SSOT SERVER DATABASE & STORAGE)
// ============================================================================

export async function fetchPoskoFromApi(role: "warga" | "petugas" = "petugas"): Promise<PoskoRecord[]> {
  try {
    const res = await fetch(`/api/posko?role=${role}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const data: PoskoRecord[] = json.data?.data || json.data || [];
    if (Array.isArray(data) && data.length > 0) {
      if (typeof window !== "undefined") {
        savePoskoDataset(data, false);
      }
      return data;
    }
    return getAllPosko();
  } catch (err) {
    console.warn("fetchPoskoFromApi falling back to local cache:", err);
    return getAllPosko();
  }
}

export async function uploadPoskoPhotosApi(files: File[] | string[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  // Jika input adalah File objects
  if (files[0] instanceof File) {
    const formData = new FormData();
    for (const f of files as File[]) {
      formData.append("files", f);
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Gagal mengunggah foto ke storage");
    const json = await res.json();
    return json.data?.urls || json.data?.data?.urls || json.urls || [];
  }

  // Jika input adalah base64 data URLs
  const base64List = (files as string[]).filter((f) => f.startsWith("data:"));
  const existingUrls = (files as string[]).filter((f) => !f.startsWith("data:"));

  if (base64List.length > 0) {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: base64List }),
    });
    if (!res.ok) throw new Error("Gagal mengunggah gambar");
    const json = await res.json();
    const uploadedUrls: string[] = json.data?.urls || json.data?.data?.urls || json.urls || [];
    return [...existingUrls, ...uploadedUrls];
  }

  return existingUrls;
}

export async function createPoskoApi(
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
    foto?: string;
    fotos?: string[];
  },
  currentUser: { id: string }
): Promise<PoskoRecord> {
  const res = await fetch("/api/posko", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser.id,
    },
    body: JSON.stringify({ ...data, currentUserId: currentUser.id }),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal membuat posko di server");
  }
  const json = await res.json();
  const created: PoskoRecord = json.data;

  // Sync to local cache
  const all = getAllPosko();
  savePoskoDataset([created, ...all.filter((p) => p.id !== created.id)]);
  return created;
}

export async function updatePoskoApi(
  poskoId: string,
  updates: Partial<PoskoRecord>,
  currentUser: { id: string }
): Promise<PoskoRecord> {
  const res = await fetch(`/api/posko/${poskoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser.id,
    },
    body: JSON.stringify({ ...updates, currentUserId: currentUser.id }),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal memperbarui posko di server");
  }
  const json = await res.json();
  const updated: PoskoRecord = json.data;

  // Sync to local cache
  const all = getAllPosko();
  savePoskoDataset(all.map((p) => (p.id === poskoId ? updated : p)));
  return updated;
}

export async function toggleActivePoskoApi(
  poskoId: string,
  currentUser: { id: string }
): Promise<PoskoRecord> {
  const res = await fetch(`/api/posko/${poskoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser.id,
    },
    body: JSON.stringify({ toggleActive: true, currentUserId: currentUser.id }),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal mengubah status posko di server");
  }
  const json = await res.json();
  const updated: PoskoRecord = json.data;

  // Sync to local cache
  const all = getAllPosko();
  savePoskoDataset(all.map((p) => (p.id === poskoId ? updated : p)));
  return updated;
}

export async function deletePoskoApi(
  poskoId: string,
  currentUser: { id: string }
): Promise<void> {
  const res = await fetch(`/api/posko/${poskoId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": currentUser.id,
    },
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal menonaktifkan posko di server");
  }

  // Soft-delete in local cache
  const all = getAllPosko();
  savePoskoDataset(
    all.map((p) => (p.id === poskoId ? { ...p, isActive: false } : p))
  );
}

export async function addPengungsiApi(
  poskoId: string,
  data: {
    nama: string;
    jenisKelamin: "L" | "P";
    usia: number;
    alamatAsal: string;
    kondisiKesehatan: "Sehat" | "Sakit" | "Bumil" | "Disabilitas" | "Lansia Rentan";
    catatan?: string;
  },
  currentUser: { id: string }
): Promise<{ posko: PoskoRecord; pengungsi: PengungsiItem }> {
  const res = await fetch("/api/pengungsi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser.id,
    },
    body: JSON.stringify({ ...data, poskoId, currentUserId: currentUser.id }),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal menambah data pengungsi");
  }
  const json = await res.json();
  const result = json.data;

  if (result.posko) {
    const all = getAllPosko();
    savePoskoDataset(all.map((p) => (p.id === poskoId ? result.posko : p)));
  }
  return result;
}

export async function updatePengungsiApi(
  poskoId: string,
  pengungsiId: string,
  updates: Partial<PengungsiItem>,
  currentUser: { id: string }
): Promise<PoskoRecord> {
  const res = await fetch("/api/pengungsi", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser.id,
    },
    body: JSON.stringify({ ...updates, poskoId, pengungsiId, currentUserId: currentUser.id }),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal memperbarui data pengungsi");
  }
  const json = await res.json();
  const updatedPosko: PoskoRecord = json.data;

  const all = getAllPosko();
  savePoskoDataset(all.map((p) => (p.id === poskoId ? updatedPosko : p)));
  return updatedPosko;
}

export async function deletePengungsiApi(
  poskoId: string,
  pengungsiId: string,
  currentUser: { id: string }
): Promise<PoskoRecord> {
  const res = await fetch(`/api/pengungsi?poskoId=${poskoId}&pengungsiId=${pengungsiId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": currentUser.id,
    },
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Gagal menghapus data pengungsi");
  }
  const json = await res.json();
  const updatedPosko: PoskoRecord = json.data;

  const all = getAllPosko();
  savePoskoDataset(all.map((p) => (p.id === poskoId ? updatedPosko : p)));
  return updatedPosko;
}

export async function fetchReportsFromApi(): Promise<any[]> {
  try {
    const res = await fetch("/api/laporan", { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal memuat laporan dari server");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchReportsFromApi error:", err);
    return [];
  }
}

export async function updateReportStatusApi(reportId: string, newStatus: string): Promise<any> {
  const res = await fetch(`/api/laporan/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error("Gagal memperbarui status laporan di server");
  const json = await res.json();
  return json.data;
}

export async function deleteReportApi(reportId: string): Promise<void> {
  const res = await fetch(`/api/laporan/${reportId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus laporan di server");
}

