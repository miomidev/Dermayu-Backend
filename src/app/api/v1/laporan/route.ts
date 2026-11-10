import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit";
import fs from "fs";
import path from "path";
import {
  getDbReportsList,
  getCitizenReports,
  addCitizenReport,
  type CitizenReportRecord,
} from "@/lib/serverDb";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function saveAndSanitizePhoto(p: string, idx = 0): string | null {
  if (typeof p !== "string" || !p.trim()) return null;

  // Jika berupa Base64 (data:image/...) dari kamera / galeri warga:
  // Tulis ke disk public/uploads agar foto asli warga tersimpan fisik permanen
  // dan database JSON tetap ringan (hanya simpan URL relatif)
  if (p.startsWith("data:")) {
    try {
      ensureUploadDir();
      const matches = p.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const extType = matches[1].split("/")[1] || "jpeg";
        const ext = extType.includes("png") ? ".png" : extType.includes("webp") ? ".webp" : ".jpg";
        const fileName = `laporan-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${idx}${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        const buffer = Buffer.from(matches[2], "base64");
        fs.writeFileSync(filePath, buffer);
        return `/uploads/${fileName}`;
      }
    } catch (err) {
      console.error("Gagal menyimpan foto laporan base64 ke disk:", err);
      // Fallback: Jika disk tidak bisa ditulis, pertahankan data URL agar foto tidak hilang
      return p;
    }
  }

  return p;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    if (type === "citizen" || type === "triage") {
      let citizen = getCitizenReports();
      if (status) {
        citizen = citizen.filter((r) => r.status && r.status.toLowerCase() === status.toLowerCase());
      }
      if (severity) {
        citizen = citizen.filter((r) => r.severity && r.severity.toLowerCase() === severity.toLowerCase());
      }
      return apiSuccess(citizen, { total: citizen.length });
    }

    if (type === "obstacle") {
      let obstacles = getDbReportsList();
      if (status) {
        obstacles = obstacles.filter((r) => r.status && r.status.toLowerCase() === status.toLowerCase());
      }
      if (severity) {
        obstacles = obstacles.filter((r) => r.severity && r.severity.toLowerCase() === severity.toLowerCase());
      }
      return apiSuccess(obstacles, { total: obstacles.length });
    }

    // Default: Combine citizen reports (at the top) and obstacle points
    const citizen = getCitizenReports();
    const obstacles = getDbReportsList();
    const combined = [...citizen, ...obstacles];

    return apiSuccess(combined, {
      total: combined.length,
    });
  } catch (error) {
    console.error("GET /api/v1/laporan error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data laporan genangan", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id = body.id || body.ticketCode || `DMY-${Date.now()}`;
    const ticketCode = body.ticketCode || body.id || id;
    const timeReceived = body.time || body.timeReceived || "Baru saja";
    const reporterName = body.reporterName || body.authorName || "Warga Siaga";
    const reporterPhone = body.reporterPhone || "0812-XXXX-XXXX";
    const location = body.location || "Indramayu";

    // Auto extract district if available
    let district = body.district || "Indramayu";
    if (!body.district && location) {
      const match = location.match(/Kecamatan\s+([A-Za-z\s]+)/i);
      if (match) district = match[1].trim();
    }

    const waterLevel = body.waterLevel || body.waterLevelText || "Genangan Air";
    const disasterCategory = body.category || body.disasterCategory || "Banjir / Rob Pesisir";

    // AI Confidence & Status
    let aiConfidence = 85;
    if (typeof body.aiConfidence === "number") {
      aiConfidence = body.aiConfidence <= 1 ? Math.round(body.aiConfidence * 100 * 10) / 10 : body.aiConfidence;
    } else if (body.aiScore?.confidence) {
      aiConfidence = Math.round(body.aiScore.confidence * 100 * 10) / 10;
    }

    let status: "SUBMITTED" | "VERIFIED" | "ARMADA_DIKERAHKAN" | "SELESAI" | "DITOLAK" = "SUBMITTED";
    if (body.status === "DIVERIFIKASI" || body.status === "VERIFIED" || aiConfidence > 60) {
      status = "VERIFIED";
    } else if (body.status === "PENANGANAN" || body.status === "ARMADA_DIKERAHKAN") {
      status = "ARMADA_DIKERAHKAN";
    } else if (body.status === "SELESAI") {
      status = "SELESAI";
    } else if (body.status === "DITOLAK") {
      status = "DITOLAK";
    }

    // Simpan foto asli warga ke disk (public/uploads) dan gunakan URL relatifnya
    const rawPhotos: string[] = Array.isArray(body.photos)
      ? (body.photos.map((p: string, idx: number) => saveAndSanitizePhoto(p, idx)).filter(Boolean) as string[])
      : [];
    const rawPhotoUrl = typeof body.photoUrl === "string" ? saveAndSanitizePhoto(body.photoUrl, 0) : null;

    const photoUrl = rawPhotos[0] || rawPhotoUrl || "";

    const newRecord: CitizenReportRecord = {
      id,
      ticketCode,
      timeReceived,
      reporterName,
      reporterPhone,
      location,
      district,
      waterLevel,
      disasterCategory,
      severity: body.severity || (aiConfidence >= 75 ? "TINGGI" : "SEDANG"),
      status,
      vulnerableCount: body.vulnerableCount || { elderly: 0, children: 0, sick: 0 },
      aiConfidence,
      aiClassification:
        body.aiClassification ||
        (aiConfidence > 60
          ? `Banjir Terverifikasi Sistem (${aiConfidence}%)`
          : `Menunggu Verifikasi Posko (${aiConfidence}%)`),
      description: body.notes || body.description || body.title || "Laporan genangan air dari warga siaga.",
      photoUrl,
      photos: rawPhotos.length > 0 ? rawPhotos : photoUrl ? [photoUrl] : [],
      lat: body.gps?.lat ?? body.lat,
      lng: body.gps?.lng ?? body.lng,
      createdAt: new Date().toISOString(),
    };

    const saved = addCitizenReport(newRecord);

    // Record audit log for new incoming report
    recordAuditLog({
      req,
      actorName: reporterName,
      actorRole: "CITIZEN",
      action: "SUBMIT_REPORT",
      entityType: "REPORT",
      entityId: ticketCode,
      metadata: `Aduan baru warga: "${newRecord.description.slice(0, 50)}" di ${location} (${waterLevel}, AI: ${aiConfidence}%)`,
    });

    return apiSuccess({
      message: "Laporan berhasil dikirim dan tersimpan di antrean Pusdalops BPBD",
      data: saved,
    });
  } catch (error: any) {
    console.error("POST /api/v1/laporan error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menyimpan laporan", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    if (type === "citizen" || searchParams.get("all") === "true") {
      const { saveCitizenReports } = await import("@/lib/serverDb");
      saveCitizenReports([]);
      return apiSuccess({
        message: "Seluruh riwayat aduan warga berhasil dibersihkan total",
      });
    }
    return apiError("BAD_REQUEST", "Parameter type=citizen diperlukan", 400);
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", err.message, 500);
  }
}
