/**
 * Database Seeder Script: Posko Bencana & Evakuasi Terpadu DERMAYU
 * MURNI 100% mengambil foto riil dari dataset asli.
 * Tidak menambahkan foto AI/statis generik.
 *
 * Jalankan: node scripts/seed-posko.js
 */

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(process.cwd(), "data", "db");
const POSKO_FILE = path.join(DB_DIR, "posko.json");

function getCuratedFromTs() {
  const tsPath = path.join(process.cwd(), "src", "data", "curatedEvakuasiData.ts");
  if (!fs.existsSync(tsPath)) return [];
  const content = fs.readFileSync(tsPath, "utf-8");
  const match = content.match(/export const CURATED_POSKO_LIST: PoskoItem\[\] = (\[[\s\S]*?\n\];)/);
  if (match) {
    try {
      const fn = new Function(`return ${match[1].replace(/;\s*$/, "")}`);
      return fn();
    } catch (e) {
      console.warn("Gagal mengekstrak CURATED_POSKO_LIST:", e.message);
    }
  }
  return [];
}

function main() {
  console.log("🌱 Menjalankan Database Seeder Posko DERMAYU (Pure Real Data)...");

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const sourceDataset = getCuratedFromTs();

  let existing = [];
  if (fs.existsSync(POSKO_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(POSKO_FILE, "utf-8"));
    } catch (e) {
      existing = [];
    }
  }

  const existingMap = new Map();
  if (Array.isArray(existing)) {
    existing.forEach((p) => {
      if (p && p.id) existingMap.set(p.id, p);
    });
  }

  const normalized = sourceDataset
    .filter((p) => {
      const isDummy = p.nama === "fdsf" || p.nama === "fgfgfds" || p.nama === "dfsa";
      return !isDummy;
    })
    .map((item, index) => {
      const existingRecord = existingMap.get(item.id);

      // Cek apakah posko ini memiliki foto upload baru oleh petugas (misal dari /uploads/ atau base64)
      let photos = [];
      const hasUploadedPhotos =
        existingRecord &&
        Array.isArray(existingRecord.photos) &&
        existingRecord.photos.some((url) => typeof url === "string" && (url.includes("/uploads/") || url.startsWith("data:")));

      if (hasUploadedPhotos) {
        photos = existingRecord.photos.filter((url) => typeof url === "string" && !url.includes("default.jpg"));
      } else if (item.photos && item.photos.length > 0) {
        photos = item.photos;
      } else if (item.fotos && item.fotos.length > 0) {
        photos = item.fotos;
      } else if (item.foto && !item.foto.includes("default.jpg")) {
        // Murni foto riil tunggal dari dataset asli
        photos = [item.foto];
      }

      const isOwner =
        index === 0 ||
        index === 1 ||
        index === 3 ||
        index % 3 === 0;

      const defaultPetugas = isOwner ? "petugas-01" : index % 2 === 0 ? "petugas-02" : "petugas-03";

      return {
        ...item,
        foto: photos[0] || item.foto || "",
        fotos: photos,
        photos: photos,
        petugasId: existingRecord?.petugasId || item.petugasId || defaultPetugas,
        isActive: existingRecord?.isActive !== undefined ? existingRecord.isActive : true,
        pengungsi: existingRecord?.pengungsi || item.pengungsi || [],
      };
    });

  // Tambahkan juga posko baru yang mungkin dibuat oleh petugas saat runtime (ID diawali sh-xxx-xxx)
  if (Array.isArray(existing)) {
    existing.forEach((p) => {
      if (p && p.id && !sourceDataset.some((s) => s.id === p.id)) {
        const isDummy = p.nama === "fdsf" || p.nama === "fgfgfds" || p.nama === "dfsa";
        if (!isDummy) {
          const photos = (p.photos || p.fotos || (p.foto ? [p.foto] : [])).filter((u) => typeof u === "string" && !u.includes("default.jpg"));
          normalized.push({
            ...p,
            foto: photos[0] || p.foto || "",
            fotos: photos,
            photos: photos,
          });
        }
      }
    });
  }

  fs.writeFileSync(POSKO_FILE, JSON.stringify(normalized, null, 2), "utf-8");
  console.log(`✅ Berhasil men-seed ${normalized.length} posko murni dari data asli ke ${POSKO_FILE}`);
  console.log(`📸 Tidak ada foto AI placeholder yang disisipkan. Array photos 100% konsisten dengan data riil.`);
}

main();
