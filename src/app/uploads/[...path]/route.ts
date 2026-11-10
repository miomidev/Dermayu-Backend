import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const cleanSegments = Array.isArray(pathSegments) ? pathSegments : [pathSegments];
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, ...cleanSegments);

    // Security: Prevent directory traversal outside public/uploads
    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
          ? "image/gif"
          : ext === ".svg"
          ? "image/svg+xml"
          : "image/jpeg";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Fallback jika file fisik hilang: sajikan placeholder default agar gambar tidak broken
    const fallbackPlaceholder = path.join(process.cwd(), "public", "uploads", "laporan-placeholder.jpg");
    if (fs.existsSync(fallbackPlaceholder)) {
      const placeholderBuffer = fs.readFileSync(fallbackPlaceholder);
      return new NextResponse(placeholderBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-cache",
        },
      });
    }

    const defaultShelter = path.join(process.cwd(), "public", "shelters", "default.jpg");
    if (fs.existsSync(defaultShelter)) {
      const defaultBuffer = fs.readFileSync(defaultShelter);
      return new NextResponse(defaultBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-cache",
        },
      });
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

