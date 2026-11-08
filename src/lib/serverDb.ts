import fs from "fs";
import path from "path";
import { CURATED_POSKO_LIST, FLOOD_OBSTACLES, type PoskoItem, type PengungsiItem } from "@/data/curatedEvakuasiData";

export interface PoskoRecord extends PoskoItem {
  petugasId: string;
  isActive: boolean;
  pengungsi?: PengungsiItem[];
  photos?: string[];
}

export interface StoredReportPoint {
  id: string;
  ticketCode: string;
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  waterLevelText?: string;
  status: string;
  location: string;
  lat: number;
  lng: number;
  timeAgo: string;
  photos?: string[];
  note?: string;
}

const DB_DIR = path.join(process.cwd(), "data", "db");
const POSKO_FILE = path.join(DB_DIR, "posko.json");
const REPORTS_FILE = path.join(DB_DIR, "reports.json");

let cachedPosko: PoskoRecord[] | null = null;
let cachedReports: StoredReportPoint[] | null = null;
let isWritingPosko = false;
let pendingPosko: PoskoRecord[] | null = null;
let isWritingReports = false;
let pendingReports: StoredReportPoint[] | null = null;

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

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
  const targetCount = Math.max(0, terisi);
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

  const extraNamesL = ["Ahmad Fauzi", "Budi Santoso", "Dedi Kurniawan", "Eko Prasetyo", "Hendra Wijaya", "Rahmat Hidayat", "Wahyu Pratama"];
  const extraNamesP = ["Sri Wahyuni", "Ratna Sari", "Aisyah Putri", "Endang Lestari", "Iis Dahlia", "Dian Sastro", "Fitri Handayani"];

  for (let i = namedCount; i < targetCount; i++) {
    const isL = i % 2 === 0;
    const nameArr = isL ? extraNamesL : extraNamesP;
    const fullName = nameArr[i % nameArr.length] + ` (${i + 1})`;
    list.push({
      id: `${poskoId}-pg-${i + 1}`,
      nama: fullName,
      jenisKelamin: isL ? "L" : "P",
      usia: 25 + (i % 30),
      kategoriUsia: "Dewasa",
      alamatAsal: alamat,
      kondisiKesehatan: "Sehat",
      isAnonim: false,
      registeredAt: "Hari ini, 08:30 WIB",
    });
  }

  return list;
}

function getInitialPoskoDataset(): PoskoRecord[] {
  return CURATED_POSKO_LIST.map((item, index) => {
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

    const fotos =
      item.photos && item.photos.length > 0
        ? item.photos
        : item.fotos && item.fotos.length > 0
        ? item.fotos
        : item.foto
        ? [item.foto]
        : [];

    const pengungsi =
      item.pengungsi && item.pengungsi.length > 0
        ? item.pengungsi
        : generateInitialPengungsi(item.id, item.terisi, item.alamat);

    const actualTerisi = pengungsi.length;
    const calculatedStatus =
      actualTerisi >= item.kapasitas
        ? "PENUH"
        : actualTerisi >= item.kapasitas * 0.7
        ? "HAMPIR_PENUH"
        : "TERSEDIA";

    return {
      ...item,
      petugasId: item.petugasId || petugasId,
      isActive: item.isActive !== undefined ? item.isActive : true,
      foto: fotos[0] || item.foto || "",
      fotos,
      photos: fotos,
      pengungsi,
      terisi: actualTerisi,
      status: calculatedStatus,
    };
  });
}

function getInitialReportsDataset(): StoredReportPoint[] {
  const realisticPhotos = [
    "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508873696983-2df570464753?auto=format&fit=crop&w=800&q=80",
  ];
  const timeOptions = [
    "10 menit yang lalu",
    "25 menit yang lalu",
    "Hari ini, 08:30 WIB",
    "Hari ini, 08:15 WIB",
    "Hari ini, 07:45 WIB",
    "Hari ini, 07:20 WIB",
    "Hari ini, 06:50 WIB",
    "1 jam yang lalu",
  ];

  return FLOOD_OBSTACLES.map((obs, idx) => ({
    id: obs.id,
    ticketCode: `GEN-${String(idx + 1).padStart(3, "0")}`,
    title: obs.title,
    category: obs.zone === "PESISIR_ROB" ? "Banjir Rob" : "Luapan DAS Cimanuk",
    severity: obs.severity,
    waterLevelText: `${obs.depthCm} cm`,
    status: obs.status || "Aktif Terpantau",
    location: obs.location,
    lat: obs.lat,
    lng: obs.lng,
    timeAgo: timeOptions[idx % timeOptions.length],
    photos: [realisticPhotos[idx % realisticPhotos.length]],
    note: obs.description,
  }));
}

// ============================================================================
// POSKO DATABASE OPERATIONS (SERVER-SIDE PERSISTENCE & SSOT)
// ============================================================================

export function normalizePoskoRecord(raw: any): PoskoRecord {
  const kategori = raw.kategori || "balai_desa";

  let photos: string[] = [];
  if (Array.isArray(raw.photos) && raw.photos.length > 0) {
    photos = raw.photos.filter((p: any) => typeof p === "string" && !p.includes("default.jpg"));
  } else if (Array.isArray(raw.fotos) && raw.fotos.length > 0) {
    photos = raw.fotos.filter((p: any) => typeof p === "string" && !p.includes("default.jpg"));
  } else if (raw.foto && typeof raw.foto === "string" && !raw.foto.includes("default.jpg")) {
    photos = [raw.foto];
  }

  return {
    ...raw,
    foto: photos[0] || raw.foto || "",
    fotos: photos,
    photos: photos,
    kategori,
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    pengungsi: Array.isArray(raw.pengungsi) ? raw.pengungsi : [],
  };
}

export function seedDatabasePosko(force = false): PoskoRecord[] {
  ensureDbDir();
  const dataset = getInitialPoskoDataset();
  cachedPosko = dataset;
  fs.writeFileSync(POSKO_FILE, JSON.stringify(dataset, null, 2), "utf-8");
  return dataset;
}

export function getDbPoskoList(): PoskoRecord[] {
  if (cachedPosko) return cachedPosko;
  ensureDbDir();
  try {
    if (!fs.existsSync(POSKO_FILE)) {
      return seedDatabasePosko();
    }
    const raw = fs.readFileSync(POSKO_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedDatabasePosko();
    }

    // Filter keluar data dummy yang rusak saat error upload sebelumnya ("fdsf", "fgfgfds", "dfsa")
    const cleaned = parsed
      .filter((p: any) => {
        const isDummy = p.nama === "fdsf" || p.nama === "fgfgfds" || p.nama === "dfsa";
        return !isDummy;
      })
      .map(normalizePoskoRecord);

    cachedPosko = cleaned;
    return cleaned;
  } catch (err) {
    console.error("Error reading posko database:", err);
    return getInitialPoskoDataset();
  }
}

export function saveDbPoskoList(items: PoskoRecord[]): void {
  cachedPosko = items;
  ensureDbDir();
  if (isWritingPosko) {
    pendingPosko = items;
    return;
  }
  isWritingPosko = true;
  fs.writeFile(POSKO_FILE, JSON.stringify(items, null, 2), "utf-8", (err) => {
    isWritingPosko = false;
    if (err) console.error("Error saving posko database:", err);
    if (pendingPosko) {
      const toWrite = pendingPosko;
      pendingPosko = null;
      saveDbPoskoList(toWrite);
    }
  });
}

export function createDbPosko(
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
    photos?: string[];
  },
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
  const nextNumber = all.length + 1;
  const newId = `sh-${String(nextNumber).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

  const kategori = data.kategori || "balai_desa";

  let incomingPhotos = data.photos || data.fotos || [];
  if (incomingPhotos.length === 0 && data.foto && !data.foto.includes("default.jpg")) {
    incomingPhotos = [data.foto];
  }
  const cleanPhotos = incomingPhotos.filter((p) => typeof p === "string" && !p.includes("default.jpg"));
  const finalPhotos = cleanPhotos;

  const newRecord: PoskoRecord = {
    id: newId,
    nama: data.nama,
    kategori,
    alamat: data.alamat,
    kecamatan: data.kecamatan,
    lat: data.lat,
    lng: data.lng,
    kapasitas: Number(data.kapasitas) || 100,
    terisi: 0,
    status: "TERSEDIA",
    fasilitas: data.fasilitas && data.fasilitas.length > 0 ? data.fasilitas : ["Aula", "Toilet"],
    kontak: {
      pj: data.kontak?.pj || "Petugas Jaga",
      telp: data.kontak?.telp || "0812-3456-7890",
    },
    foto: finalPhotos[0] || data.foto || "",
    fotos: finalPhotos,
    photos: finalPhotos,
    tier: 1,
    petugasId: currentUser.id || "petugas-01",
    isActive: true,
    pengungsi: [],
  };

  const nextList = [newRecord, ...all];
  saveDbPoskoList(nextList);
  return newRecord;
}

export function updateDbPosko(
  poskoId: string,
  updates: Partial<PoskoRecord>,
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");

  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengedit posko yang dibuat sendiri");
  }

  const pengungsi = updates.pengungsi || target.pengungsi || [];
  const kapasitas = updates.kapasitas !== undefined ? Number(updates.kapasitas) : target.kapasitas;
  const terisi = pengungsi.length;
  const status =
    terisi >= kapasitas
      ? "PENUH"
      : terisi >= kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  let photos = updates.photos || updates.fotos || target.photos || target.fotos || [target.foto];
  if (updates.foto && !photos.includes(updates.foto)) {
    photos = [updates.foto, ...photos];
  }

  const updated: PoskoRecord = {
    ...target,
    ...updates,
    id: target.id,
    petugasId: target.petugasId,
    kapasitas,
    terisi,
    status,
    pengungsi,
    foto: photos[0],
    fotos: photos,
    photos: photos,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  saveDbPoskoList(nextList);
  return updated;
}

export function toggleActiveDbPosko(
  poskoId: string,
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");

  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengubah status posko yang dibuat sendiri");
  }

  const updated: PoskoRecord = {
    ...target,
    isActive: !target.isActive,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  saveDbPoskoList(nextList);
  return updated;
}

export function deleteDbPosko(
  poskoId: string,
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");

  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan menghapus posko yang dibuat sendiri");
  }

  const updated: PoskoRecord = {
    ...target,
    isActive: false,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updated : p));
  saveDbPoskoList(nextList);
  return updated;
}

// ============================================================================
// PENGUNGSI (BY NAME) OPERATIONS (CALCULATED CAPACITY SSOT)
// ============================================================================

export function determineKategoriUsia(usia: number): "Balita" | "Anak" | "Dewasa" | "Lansia" {
  if (usia < 5) return "Balita";
  if (usia < 18) return "Anak";
  if (usia < 60) return "Dewasa";
  return "Lansia";
}

export function addDbPengungsi(
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
): { posko: PoskoRecord; pengungsi: PengungsiItem } {
  const all = getDbPoskoList();
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

  const updatedPosko: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updatedPosko : p));
  saveDbPoskoList(nextList);
  return { posko: updatedPosko, pengungsi: newPengungsi };
}

export function updateDbPengungsi(
  poskoId: string,
  pengungsiId: string,
  updates: Partial<PengungsiItem>,
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
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
    isAnonim: false,
  };

  pengungsiList[pIndex] = updatedItem;
  const newTerisi = pengungsiList.length;
  const newStatus =
    newTerisi >= target.kapasitas
      ? "PENUH"
      : newTerisi >= target.kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  const updatedPosko: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updatedPosko : p));
  saveDbPoskoList(nextList);
  return updatedPosko;
}

export function deleteDbPengungsi(
  poskoId: string,
  pengungsiId: string,
  currentUser: { id: string }
): PoskoRecord {
  const all = getDbPoskoList();
  const target = all.find((p) => p.id === poskoId);
  if (!target) throw new Error("Posko evakuasi tidak ditemukan");

  if (target.petugasId !== currentUser.id) {
    throw new Error("Unauthorized: Petugas hanya diizinkan mengelola posko yang dibuat sendiri");
  }

  const pengungsiList = target.pengungsi ? target.pengungsi.filter((p) => p.id !== pengungsiId) : [];
  const newTerisi = pengungsiList.length;
  const newStatus =
    newTerisi >= target.kapasitas
      ? "PENUH"
      : newTerisi >= target.kapasitas * 0.7
      ? "HAMPIR_PENUH"
      : "TERSEDIA";

  const updatedPosko: PoskoRecord = {
    ...target,
    pengungsi: pengungsiList,
    terisi: newTerisi,
    status: newStatus,
  };

  const nextList = all.map((p) => (p.id === poskoId ? updatedPosko : p));
  saveDbPoskoList(nextList);
  return updatedPosko;
}

// ============================================================================
// REPORTS / GENANGAN DATABASE OPERATIONS (TRIAGE SSOT)
// ============================================================================

export function getDbReportsList(): StoredReportPoint[] {
  if (cachedReports) return cachedReports;
  ensureDbDir();
  try {
    if (!fs.existsSync(REPORTS_FILE)) {
      const initial = getInitialReportsDataset();
      cachedReports = initial;
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(REPORTS_FILE, "utf-8");
    cachedReports = JSON.parse(raw);
    return cachedReports!;
  } catch (err) {
    console.error("Error reading reports database:", err);
    return getInitialReportsDataset();
  }
}

export function saveDbReportsList(items: StoredReportPoint[]): void {
  cachedReports = items;
  ensureDbDir();
  if (isWritingReports) {
    pendingReports = items;
    return;
  }
  isWritingReports = true;
  fs.writeFile(REPORTS_FILE, JSON.stringify(items, null, 2), "utf-8", (err) => {
    isWritingReports = false;
    if (err) console.error("Error saving reports database:", err);
    if (pendingReports) {
      const toWrite = pendingReports;
      pendingReports = null;
      saveDbReportsList(toWrite);
    }
  });
}

export function updateDbReportStatus(reportId: string, newStatus: string): StoredReportPoint | null {
  const all = getDbReportsList();
  const targetIndex = all.findIndex((r) => r.id === reportId);
  if (targetIndex === -1) return null;

  const updated: StoredReportPoint = {
    ...all[targetIndex],
    status: newStatus,
  };

  all[targetIndex] = updated;
  saveDbReportsList(all);
  return updated;
}

export function deleteDbReport(reportId: string): boolean {
  const all = getDbReportsList();
  const nextList = all.filter((r) => r.id !== reportId);
  if (nextList.length === all.length) return false;
  saveDbReportsList(nextList);
  return true;
}

