import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();
    const contentType = req.headers.get("content-type") || "";

    const savedUrls: string[] = [];

    // Kasus 1: Multipart Form Data (File picker)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files: File[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return apiError("BAD_REQUEST", "Tidak ada file gambar yang diunggah", 400);
      }

      const prefix = (formData.get("prefix") as string) || "upload";
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize file extension
        let ext = path.extname(file.name).toLowerCase();
        if (!ext || ext === ".") ext = ".jpg";
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
          ext = ".jpg";
        }

        const fileName = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, buffer);
        savedUrls.push(`/uploads/${fileName}`);
      }
    }
    // Kasus 2: JSON Payload (Base64 data URLs)
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      const images: string[] = Array.isArray(body.images)
        ? body.images
        : body.image
        ? [body.image]
        : [];

      if (images.length === 0) {
        return apiError("BAD_REQUEST", "Tidak ada data gambar dalam payload", 400);
      }

      const prefix = typeof body.prefix === "string" && body.prefix.trim() ? body.prefix.trim() : "posko";
      for (let i = 0; i < images.length; i++) {
        const dataUrl = images[i];
        if (dataUrl.startsWith("data:")) {
          const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const extType = matches[1].split("/")[1] || "jpeg";
            const ext = extType === "png" ? ".png" : extType === "webp" ? ".webp" : ".jpg";
            const buffer = Buffer.from(matches[2], "base64");
            const fileName = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}${ext}`;
            const filePath = path.join(UPLOAD_DIR, fileName);

            fs.writeFileSync(filePath, buffer);
            savedUrls.push(`/uploads/${fileName}`);
          }
        } else if (dataUrl.startsWith("http") || dataUrl.startsWith("/")) {
          savedUrls.push(dataUrl);
        }
      }
    } else {
      return apiError("BAD_REQUEST", "Content-Type tidak didukung", 400);
    }

    return apiSuccess({
      message: "Foto berhasil disimpan ke penyimpanan permanen",
      urls: savedUrls,
      url: savedUrls[0] || null,
      data: {
        urls: savedUrls,
        url: savedUrls[0] || null,
      },
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal mengunggah foto", 500);
  }
}

