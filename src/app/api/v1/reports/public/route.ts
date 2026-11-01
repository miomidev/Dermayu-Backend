import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const bbox = url.searchParams.get("bbox"); // Format: minLng,minLat,maxLng,maxLat
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const severity = url.searchParams.get("severity");

    const where: Prisma.ReportWhereInput = {
      status: {
        in: ["VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
      },
    };

    if (category) {
      where.category = { code: category };
    }

    if (severity) {
      where.severity = severity as any;
    }

    if (startDate || endDate) {
      where.occurred_at = {};
      if (startDate) where.occurred_at.gte = new Date(startDate);
      if (endDate) where.occurred_at.lte = new Date(endDate);
    }

    // Bounding Box filter (PRD FR-MAP-02: minLng,minLat,maxLng,maxLat)
    if (bbox) {
      const parts = bbox.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        where.latitude = {
          gte: new Prisma.Decimal(minLat),
          lte: new Prisma.Decimal(maxLat),
        };
        where.longitude = {
          gte: new Prisma.Decimal(minLng),
          lte: new Prisma.Decimal(maxLng),
        };
      }
    }

    const reports = await db.report.findMany({
      where,
      select: {
        public_id: true,
        ticket_code: true,
        title: true,
        description: true,
        severity: true,
        water_level: true,
        status: true,
        latitude: true,
        longitude: true,
        address_text: true,
        occurred_at: true,
        category: {
          select: { code: true, name: true, icon: true },
        },
        district: {
          select: { id: true, name: true },
        },
        media: {
          select: {
            url: true,
            type: true,
          },
        },
      },
      orderBy: { occurred_at: "desc" },
      take: 500,
    });

    return apiSuccess(reports);
  } catch (error) {
    console.error("GET /reports/public error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat peta laporan publik", 500);
  }
}
