import { NextRequest, connection } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  await connection();
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const userIdBigInt = BigInt(auth.context.user.userId);
    const user = await db.user.findUnique({
      where: { id: userIdBigInt },
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        avatar_url: true,
        district_id: true,
        village_id: true,
        address: true,
        created_at: true,
        district: {
          select: { id: true, code: true, name: true },
        },
        village: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!user) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    const isProfileComplete = Boolean(
      user.phone &&
      user.phone.trim().length >= 9 &&
      (user.district_id || user.district) &&
      (user.village_id || user.village) &&
      user.address &&
      user.address.trim().length >= 3
    );

    return apiSuccess({
      ...user,
      isProfileComplete,
    });
  } catch (error) {
    console.error("GET /me error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server", 500);
  }
}

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).max(20).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  districtId: z.number().or(z.string()).optional(),
  districtName: z.string().optional(),
  villageId: z.number().or(z.string()).optional(),
  villageName: z.string().optional(),
  address: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan profil tidak valid", 422);
    }

    const data = result.data;

    let userIdBigInt: bigint | null = null;
    const auth = authorize(req);
    if (auth.ok) {
      try {
        userIdBigInt = BigInt(auth.context.user.userId);
      } catch {}
    }

    // Fallback: periksa cookie user_session atau email jika Bearer token belum siap
    if (!userIdBigInt) {
      let fallbackEmail = data.email;
      if (!fallbackEmail) {
        const sessionCookie = req.cookies.get("user_session")?.value;
        if (sessionCookie) {
          try {
            const parsed = JSON.parse(decodeURIComponent(sessionCookie));
            fallbackEmail = parsed.email;
          } catch {}
        }
      }
      if (fallbackEmail) {
        const userByEmail = await db.user.findFirst({
          where: { email: fallbackEmail.toLowerCase().trim() },
        });
        if (userByEmail) {
          userIdBigInt = userByEmail.id;
        }
      }
    }

    if (!userIdBigInt) {
      return apiError("UNAUTHORIZED", "Sesi autentikasi tidak ditemukan. Silakan login kembali.", 401);
    }

    const updateData: {
      full_name?: string;
      phone?: string;
      avatar_url?: string | null;
      district_id?: bigint | null;
      village_id?: bigint | null;
      address?: string | null;
    } = {};

    if (data.fullName) updateData.full_name = data.fullName;
    if (data.phone) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl || null;
    if (data.address !== undefined) updateData.address = data.address;

    // Resolusi Kecamatan (ID atau Nama)
    if (data.districtId !== undefined && data.districtId !== "") {
      updateData.district_id = BigInt(data.districtId);
    } else if (data.districtName) {
      let foundDist = await db.district.findFirst({
        where: { name: { equals: data.districtName, mode: "insensitive" } },
      });
      if (!foundDist) {
        try {
          foundDist = await db.district.create({
            data: {
              name: data.districtName,
              code: `32.12.${Date.now().toString().slice(-4)}`,
            },
          });
        } catch {}
      }
      if (foundDist) {
        updateData.district_id = foundDist.id;
      }
    }

    // Resolusi Desa / Kelurahan (ID atau Nama)
    if (data.villageId !== undefined && data.villageId !== "") {
      updateData.village_id = BigInt(data.villageId);
    } else if (data.villageName) {
      let foundVil = await db.village.findFirst({
        where: { name: { equals: data.villageName, mode: "insensitive" } },
      });
      if (!foundVil && updateData.district_id) {
        try {
          foundVil = await db.village.create({
            data: {
              district_id: updateData.district_id,
              name: data.villageName,
              code: `VIL-${Date.now().toString().slice(-6)}`,
            },
          });
        } catch {}
      }
      if (foundVil) {
        updateData.village_id = foundVil.id;
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userIdBigInt },
      data: updateData,
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        avatar_url: true,
        district_id: true,
        village_id: true,
        address: true,
        district: {
          select: { id: true, code: true, name: true },
        },
        village: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    const isProfileComplete = Boolean(
      updatedUser.phone &&
      updatedUser.phone.trim().length >= 9 &&
      (updatedUser.district_id || updatedUser.district) &&
      (updatedUser.village_id || updatedUser.village) &&
      updatedUser.address &&
      updatedUser.address.trim().length >= 3
    );

    return apiSuccess({
      ...updatedUser,
      isProfileComplete,
    });
  } catch (error) {
    console.error("PATCH /me error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server saat memperbarui data", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = BigInt(auth.context.user.userId);

    // Soft delete / deactivate user (PRD FR-PROF-04 & PDP principle)
    await db.user.update({
      where: { id: userId },
      data: { is_active: false },
    });

    // Revoke all tokens
    await db.refreshToken.updateMany({
      where: { user_id: userId },
      data: { revoked_at: new Date() },
    });

    // Remove active device push tokens
    await db.deviceToken.deleteMany({
      where: { user_id: userId },
    });

    return apiSuccess({ message: "Akun Anda telah berhasil dinonaktifkan." });
  } catch (error) {
    console.error("DELETE /me error:", error);
    return apiError("INTERNAL_ERROR", "Gagal menghapus akun pengguna", 500);
  }
}

