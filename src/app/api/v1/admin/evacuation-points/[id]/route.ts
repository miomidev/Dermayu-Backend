import { NextRequest, connection } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const point = await db.evacuationPoint.findUnique({
      where: { id: BigInt(id) },
      include: {
        district: true,
        village: true,
      },
    });

    if (!point) {
      return apiError("NOT_FOUND", "Posko evakuasi tidak ditemukan", 404);
    }

    return apiSuccess(point);
  } catch (error) {
    console.error("GET /admin/evacuation-points/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat posko evakuasi", 500);
  }
}

const updatePointSchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().min(5).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  districtId: z.number().or(z.string()).optional(),
  villageId: z.number().or(z.string()).optional(),
  capacity: z.number().min(0).optional(),
  facilities: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = updatePointSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan posko tidak valid", 422);
    }

    const data = result.data;
    const updateData: Record<string, any> = {};

    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = new Prisma.Decimal(data.latitude);
    if (data.longitude !== undefined) updateData.longitude = new Prisma.Decimal(data.longitude);
    if (data.districtId !== undefined) updateData.district_id = data.districtId ? BigInt(data.districtId) : null;
    if (data.villageId !== undefined) updateData.village_id = data.villageId ? BigInt(data.villageId) : null;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.facilities !== undefined) updateData.facilities = data.facilities;
    if (data.contactName !== undefined) updateData.contact_name = data.contactName;
    if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const updated = await db.evacuationPoint.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return apiSuccess({
      message: "Posko evakuasi berhasil diperbarui",
      point: updated,
    });
  } catch (error) {
    console.error("PATCH /admin/evacuation-points/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui posko evakuasi", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req, Roles.ADMINS);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    // Soft delete by setting is_active = false
    await db.evacuationPoint.update({
      where: { id: BigInt(id) },
      data: { is_active: false },
    });

    return apiSuccess({ message: "Posko evakuasi berhasil dinonaktifkan" });
  } catch (error) {
    console.error("DELETE /admin/evacuation-points/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menonaktifkan posko evakuasi", 500);
  }
}

