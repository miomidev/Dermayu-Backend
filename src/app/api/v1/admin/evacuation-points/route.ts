import { NextRequest, connection } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  await connection();
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const points = await db.evacuationPoint.findMany({
      include: {
        district: { select: { id: true, name: true, code: true } },
        village: { select: { id: true, name: true, code: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(points);
  } catch (error) {
    console.error("GET /admin/evacuation-points error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat titik posko evakuasi", 500);
  }
}

const createPointSchema = z.object({
  name: z.string().min(3, "Nama posko minimal 3 karakter"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  latitude: z.number(),
  longitude: z.number(),
  districtId: z.number().or(z.string()).optional(),
  villageId: z.number().or(z.string()).optional(),
  capacity: z.number().min(0).default(0),
  facilities: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = createPointSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data posko evakuasi tidak valid", 422);
    }

    const data = result.data;

    const point = await db.evacuationPoint.create({
      data: {
        name: data.name,
        address: data.address,
        latitude: new Prisma.Decimal(data.latitude),
        longitude: new Prisma.Decimal(data.longitude),
        district_id: data.districtId ? BigInt(data.districtId) : null,
        village_id: data.villageId ? BigInt(data.villageId) : null,
        capacity: data.capacity,
        facilities: data.facilities || null,
        contact_name: data.contactName || null,
        contact_phone: data.contactPhone || null,
        is_active: true,
      },
    });

    return apiSuccess(
      {
        message: "Posko evakuasi berhasil ditambahkan",
        point,
      },
      undefined,
      201
    );
  } catch (error) {
    console.error("POST /admin/evacuation-points error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menambahkan posko evakuasi", 500);
  }
}

