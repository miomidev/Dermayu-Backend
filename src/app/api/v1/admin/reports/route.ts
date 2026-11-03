import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { Prisma, ReportStatus, Severity } from "@prisma/client";

export async function GET(req: NextRequest) {
  await connection();
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const status = url.searchParams.get("status") as ReportStatus | null;
    const category = url.searchParams.get("category");
    const districtId = url.searchParams.get("districtId");
    const severity = url.searchParams.get("severity") as Severity | null;
    const search = url.searchParams.get("search");
    const minConfidence = url.searchParams.get("minAiConfidence");
    const aiLabel = url.searchParams.get("aiLabel");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Prisma.ReportWhereInput = {};

    if (status) where.status = status;
    if (category) where.category = { code: category };
    if (districtId) where.district_id = BigInt(districtId);
    if (severity) where.severity = severity;

    if (search) {
      where.OR = [
        { ticket_code: { contains: search } },
        { title: { contains: search } },
        { address_text: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    if (minConfidence || aiLabel) {
      where.media = {
        some: {
          ai_prediction: {
            ...(minConfidence ? { confidence: { gte: parseFloat(minConfidence) } } : {}),
            ...(aiLabel ? { label: aiLabel } : {}),
          },
        },
      };
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          district: { select: { id: true, name: true, code: true } },
          village: { select: { id: true, name: true, code: true } },
          reporter: {
            select: { id: true, public_id: true, full_name: true, phone: true },
          },
          media: {
            include: { ai_prediction: true },
          },
          assignments: {
            include: {
              officer: { select: { id: true, full_name: true, phone: true } },
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
    console.error("GET /admin/reports error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat daftar laporan untuk admin", 500);
  }
}

