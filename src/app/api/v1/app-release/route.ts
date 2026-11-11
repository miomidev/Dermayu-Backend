import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { apiError, apiSuccess } from "@/lib/api-response";
import { recordAuditLog } from "@/lib/audit";

export interface AppReleaseConfig {
  isReleased: boolean;
  downloadUrl: string;
  version: string;
  fileSize: string;
  releaseNotes: string;
  updatedAt: string;
  updatedBy?: string;
}

const DEFAULT_CONFIG: AppReleaseConfig = {
  isReleased: true,
  downloadUrl: "https://download1472.mediafire.com/8wkshx6doixgnQyfDYPzpJn12nsrJeEjFL6tlih6jHml1LA2_z7MdHDX2h_s8kN8YcJ6vxG6rVkijGtXaCZgjrmqhjDjPbmzNs9WggFLAAKK3-2ETkKXlrnFpxr1WAFID-OX2gZjnPNagWNjMfswdsTI8FhyfdopUajQiLIwfKEz/5h2ozq3i1wh6zs7/Dermayu+Apps.apk",
  version: "v1.0.0",
  fileSize: "62 MB",
  releaseNotes: "Rilis resmi aplikasi Dermayu Android dengan rute evakuasi cerdas dan integrasi Google Maps.",
  updatedAt: new Date().toISOString(),
  updatedBy: "Super Admin",
};

function getConfigFilepath(): string {
  return path.join(process.cwd(), "data", "app-release.json");
}

function readConfig(): AppReleaseConfig {
  try {
    const filepath = getConfigFilepath();
    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn("Failed to read app-release.json, fallback to defaults:", err);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(config: AppReleaseConfig): void {
  const filepath = getConfigFilepath();
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(config, null, 2), "utf-8");
}

// GET /api/v1/app-release: Mengambil konfigurasi link download APK saat ini
export async function GET() {
  try {
    const config = readConfig();
    return apiSuccess(config);
  } catch (error: any) {
    console.error("GET /api/v1/app-release error:", error);
    return apiError("INTERNAL_ERROR", "Gagal membaca konfigurasi rilis aplikasi", 500);
  }
}

// POST /api/v1/app-release: Memperbarui konfigurasi rilis & link Google Drive APK oleh Admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const isReleased = Boolean(body.isReleased !== undefined ? body.isReleased : true);
    const downloadUrl = (body.downloadUrl || "").trim();
    const version = (body.version || "v1.0.0").trim();
    const fileSize = (body.fileSize || "61.6 MB").trim();
    const releaseNotes = (body.releaseNotes || "").trim();
    const updatedBy = body.updatedBy || "Super Admin";

    if (isReleased && !downloadUrl) {
      return apiError(
        "VALIDATION_ERROR",
        "Tautan unduhan APK (Google Drive atau direct URL) wajib diisi jika status rilis aktif.",
        422
      );
    }

    const currentConfig = readConfig();

    const newConfig: AppReleaseConfig = {
      isReleased,
      downloadUrl: downloadUrl || currentConfig.downloadUrl,
      version: version || currentConfig.version,
      fileSize: fileSize || currentConfig.fileSize,
      releaseNotes: releaseNotes || currentConfig.releaseNotes,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    writeConfig(newConfig);

    // Audit log
    await recordAuditLog({
      req,
      actorName: updatedBy,
      actorRole: "SUPERADMIN",
      action: "APP_RELEASE_UPDATED",
      entityType: "SYSTEM",
      entityId: "app-release",
      metadata: `Konfigurasi APK diperbarui: Rilis=${isReleased}, Versi=${version}, URL=${downloadUrl}`,
    }).catch(() => { });

    return apiSuccess(newConfig);
  } catch (error: any) {
    console.error("POST /api/v1/app-release error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menyimpan konfigurasi rilis APK", 500);
  }
}
