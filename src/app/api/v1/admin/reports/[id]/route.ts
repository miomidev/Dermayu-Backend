import { NextRequest, connection } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  const auth = authorize(req, Roles.STAFF);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    const report = await db.report.findFirst({
      where: {
        OR: [
          { public_id: id },
          ...(isNaN(Number(id)) ? [] : [{ id: BigInt(id) }]),
          { ticket_code: id },
        ],
      },
      include: {
        category: true,
        district: { select: { id: true, name: true, code: true } },
        village: { select: { id: true, name: true, code: true } },
        reporter: {
          select: {
            id: true,
            public_id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        verifier: {
          select: { id: true, full_name: true, role: true },
        },
        duplicate_of: {
          select: { id: true, public_id: true, ticket_code: true, title: true, status: true },
        },
        media: {
          include: {
            ai_prediction: true,
          },
        },
        status_history: {
          orderBy: { created_at: "asc" },
          include: {
            actor: {
              select: { id: true, full_name: true, role: true },
            },
          },
        },
        assignments: {
          orderBy: { assigned_at: "desc" },
          include: {
            officer: {
              select: { id: true, full_name: true, phone: true, email: true },
            },
            assigner: {
              select: { id: true, full_name: true },
            },
          },
        },
      },
    });

    if (!report) {
      return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
    }

    return apiSuccess(report);
  } catch (error) {
    console.error("GET /admin/reports/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat detail laporan admin", 500);
  }
}

