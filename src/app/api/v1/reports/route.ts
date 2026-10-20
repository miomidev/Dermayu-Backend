import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";
import { triggerAiPrediction } from "@/lib/ai-service";
import { Severity, WaterLevel, Prisma } from "@prisma/client";


// Helper to generate ticket code DMY-YYYYMMDD-NNNN
async function generateTicketCode(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const prefix = `DMY-${dateStr}-`;
  const countToday = await db.report.count({
    where: {
      ticket_code: {
        startsWith: prefix,
      },
    },
  });

  const nextNumber = String(countToday + 1).padStart(4, "0");
  return `${prefix}${nextNumber}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    const userPayload = token ? verifyAccessToken(token) : null;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const statusParam = url.searchParams.get("status");
    const categoryParam = url.searchParams.get("category");
    const mineOnly = url.searchParams.get("mine") === "true";

    const where: Prisma.ReportWhereInput = {};

    if (mineOnly) {
      if (!userPayload) {
        return apiError("UNAUTHORIZED", "Login diperlukan untuk melihat laporan saya", 401);
      }
      where.reporter_id = BigInt(userPayload.userId);
    }

    if (statusParam) {
      where.status = statusParam as any;
    }

    if (categoryParam) {
      where.category = { code: categoryParam };
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          category: true,
          media: {
            include: {
              ai_prediction: true,
            },
          },
          district: { select: { id: true, name: true, code: true } },
          village: { select: { id: true, name: true, code: true } },
          reporter: {
            select: {
              id: true,
              public_id: true,
              full_name: true,
            },
          },
        },
      }),
      db.report.count({ where }),
    ]);

    return apiSuccess(reports, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /reports error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat laporan", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) {
      return apiError("UNAUTHORIZED", "Token autentikasi diperlukan", 401);
    }

    const userPayload = verifyAccessToken(token);
    if (!userPayload) {
      return apiError("UNAUTHORIZED", "Token tidak valid atau kedaluwarsa", 401);
    }

    const formData = await req.formData();

    const clientUuid = (formData.get("client_uuid") as string) || null;
    const categoryCode = (formData.get("category_code") as string) || "FLOOD";
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const severity = ((formData.get("severity") as string) || "MEDIUM") as Severity;
    const waterLevel = (formData.get("water_level") as WaterLevel) || null;
    const latitude = parseFloat((formData.get("latitude") as string) || "0");
    const longitude = parseFloat((formData.get("longitude") as string) || "0");
    const gpsAccuracy = formData.get("gps_accuracy_m") ? parseFloat(formData.get("gps_accuracy_m") as string) : null;
    const addressText = (formData.get("address_text") as string) || null;
    const districtId = formData.get("district_id") ? BigInt(formData.get("district_id") as string) : null;
    const villageId = formData.get("village_id") ? BigInt(formData.get("village_id") as string) : null;

    if (!title) {
      return apiError("VALIDATION_ERROR", "Judul laporan wajib diisi", 422, [
        { field: "title", issue: "Judul tidak boleh kosong" },
      ]);
    }

    // Check client_uuid for offline idempotency
    if (clientUuid) {
      const existing = await db.report.findUnique({
        where: { client_uuid: clientUuid },
      });
      if (existing) {
        return apiSuccess({
          id: existing.public_id,
          ticket_code: existing.ticket_code,
          status: existing.status,
          created_at: existing.created_at,
        });
      }
    }

    // Find category
    let category = await db.reportCategory.findUnique({
      where: { code: categoryCode },
    });

    if (!category) {
      // Auto-create category if doesn't exist
      category = await db.reportCategory.create({
        data: {
          code: categoryCode,
          name: categoryCode === "FLOOD" ? "Banjir / Genangan" : categoryCode,
          requires_ai: categoryCode === "FLOOD",
        },
      });
    }

    const ticketCode = await generateTicketCode();

    // Create Report
    const report = await db.report.create({
      data: {
        ticket_code: ticketCode,
        reporter_id: BigInt(userPayload.userId),
        category_id: category.id,
        title,
        description,
        severity,
        water_level: waterLevel,
        latitude: new Prisma.Decimal(latitude),
        longitude: new Prisma.Decimal(longitude),
        gps_accuracy_m: gpsAccuracy,
        address_text: addressText,
        district_id: districtId,
        village_id: villageId,
        client_uuid: clientUuid,
        status: "SUBMITTED",
      },
    });

    // Create initial history
    await db.reportStatusHistory.create({
      data: {
        report_id: report.id,
        to_status: "SUBMITTED",
        changed_by: BigInt(userPayload.userId),
        note: "Laporan baru dikirim oleh pelapor",
      },
    });

    // Process uploaded media files
    const mediaFiles = formData.getAll("media[]") as File[];
    const createdMediaRecords: Array<{ id: bigint; storage_key: string }> = [];

    for (const file of mediaFiles) {
      if (file && typeof file === "object" && file.size > 0) {
        const saved = await saveUploadedFile(file);
        const mediaRecord = await db.reportMedia.create({
          data: {
            report_id: report.id,
            type: "IMAGE",
            storage_key: saved.storageKey,
            url: saved.url,
            mime_type: saved.mimeType,
            size_bytes: saved.sizeBytes,
            uploaded_by: BigInt(userPayload.userId),
          },
        });
        createdMediaRecords.push({ id: mediaRecord.id, storage_key: saved.storageKey });
      }
    }

    // Trigger AI predictions asynchronously for flood reports
    if (category.requires_ai || categoryCode === "FLOOD") {
      for (const m of createdMediaRecords) {
        // Run without awaiting to avoid blocking response (PRD 8.1 / 9.1)
        triggerAiPrediction(m.id, m.storage_key).catch((e) =>
          console.error("Async AI error:", e)
        );
      }
    }

    return apiSuccess(
      {
        id: report.public_id,
        ticket_code: report.ticket_code,
        status: report.status,
        created_at: report.created_at,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("POST /reports error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengirim laporan", 500);
  }
}
