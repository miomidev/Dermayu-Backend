import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { checkSuperAdmin } from "../route";

async function findUserByIdOrPublicId(idOrPublicId: string) {
  // Coba cari via public_id (UUID)
  let user = await db.user.findUnique({
    where: { public_id: idOrPublicId },
  });

  // Jika tidak ditemukan dan input merupakan angka, coba cari via id BigInt
  if (!user && /^\d+$/.test(idOrPublicId)) {
    try {
      user = await db.user.findUnique({
        where: { id: BigInt(idOrPublicId) },
      });
    } catch {}
  }

  // Jika masih tidak ditemukan, coba cari via email
  if (!user && idOrPublicId.includes("@")) {
    user = await db.user.findUnique({
      where: { email: idOrPublicId },
    });
  }

  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const user = await findUserByIdOrPublicId(id);

    if (!user) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    return apiSuccess({
      id: user.id.toString(),
      public_id: user.public_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    });
  } catch (error) {
    console.error("GET /api/v1/admin/users/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Gagal mengambil data pengguna", 500);
  }
}

const updateUserSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["CITIZEN", "OFFICER", "SUPERADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const existing = await findUserByIdOrPublicId(id);

    if (!existing) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    const body = await req.json().catch(() => ({}));
    const parse = updateUserSchema.safeParse(body);
    if (!parse.success) {
      return apiError("VALIDATION_ERROR", "Data pembaruan tidak valid", 422);
    }

    const data = parse.data;
    const updateData: any = {};

    if (data.fullName !== undefined) updateData.full_name = data.fullName.trim();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    // Verifikasi email jika berubah
    if (data.email && data.email.toLowerCase() !== existing.email?.toLowerCase()) {
      const emailTaken = await db.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });
      if (emailTaken && emailTaken.id !== existing.id) {
        return apiError("CONFLICT", "Alamat email sudah digunakan oleh akun lain", 409);
      }
      updateData.email = data.email.toLowerCase().trim();
    }

    // Reset password jika diinput
    if (data.password && data.password.trim().length >= 6) {
      updateData.password_hash = await hashPassword(data.password.trim());
    }

    const updated = await db.user.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Catat log audit
    try {
      await db.auditLog.create({
        data: {
          actor_id: auth.actorId || BigInt(1),
          action: "UPDATE_USER_ACCOUNT",
          entity_type: "USER",
          entity_id: updated.public_id,
          metadata: JSON.stringify({
            target_name: updated.full_name,
            target_email: updated.email,
            changes: Object.keys(updateData).filter((k) => k !== "password_hash"),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation warning:", auditErr);
    }

    return apiSuccess({
      message: "Data pengguna berhasil diperbarui",
      user: {
        id: updated.id.toString(),
        public_id: updated.public_id,
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        is_active: updated.is_active,
        created_at: updated.created_at,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/v1/admin/users/[id] error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal memperbarui pengguna", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const targetUser = await findUserByIdOrPublicId(id);

    if (!targetUser) {
      return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    // Safeguard: Superadmin dilarang menghapus akun sendiri yang sedang aktif
    const currentUserIdStr = (auth.actorId || BigInt(1)).toString();
    const currentEmail = auth.actorEmail || "";
    const targetIdStr = targetUser.id.toString();
    if (
      currentUserIdStr === targetIdStr ||
      (currentEmail &&
        targetUser.email &&
        currentEmail.toLowerCase() === targetUser.email.toLowerCase())
    ) {
      return apiError(
        "FORBIDDEN",
        "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.",
        400
      );
    }

    // Cek apakah user memiliki relasi data krusial (laporan, penugasan lapangan, audit log)
    const [reportCount, assignmentCount] = await Promise.all([
      db.report.count({ where: { reporter_id: targetUser.id } }),
      db.reportAssignment.count({ where: { officer_id: targetUser.id } }),
    ]);

    let actionTaken = "deleted";

    if (reportCount > 0 || assignmentCount > 0) {
      // Soft delete / Nonaktifkan akun agar integritas data audit dan riwayat laporan tetap terjaga
      await db.$transaction([
        db.refreshToken.deleteMany({ where: { user_id: targetUser.id } }),
        db.deviceToken.deleteMany({ where: { user_id: targetUser.id } }),
        db.user.update({
          where: { id: targetUser.id },
          data: {
            is_active: false,
            full_name: targetUser.full_name.includes("[NONAKTIF]")
              ? targetUser.full_name
              : `${targetUser.full_name} [NONAKTIF]`,
          },
        }),
      ]);
      actionTaken = "deactivated";
    } else {
      // Bersihkan token & hapus permanen jika tidak memiliki foreign key reports
      await db.$transaction([
        db.refreshToken.deleteMany({ where: { user_id: targetUser.id } }),
        db.deviceToken.deleteMany({ where: { user_id: targetUser.id } }),
        db.notification.deleteMany({ where: { user_id: targetUser.id } }),
        db.user.delete({ where: { id: targetUser.id } }),
      ]);
      actionTaken = "deleted";
    }

    // Catat log audit penghapusan akun
    try {
      await db.auditLog.create({
        data: {
          actor_id: auth.actorId || BigInt(1),
          action: "DELETE_USER_ACCOUNT",
          entity_type: "USER",
          entity_id: targetUser.public_id,
          metadata: JSON.stringify({
            name: targetUser.full_name,
            email: targetUser.email,
            role: targetUser.role,
            action: actionTaken,
          }),
        },
      });
    } catch {}

    return apiSuccess({
      message:
        actionTaken === "deactivated"
          ? "Akun dinonaktifkan dan sesi dicabut (riwayat penugasan/laporan diarsipkan secara aman)"
          : "Akun pengguna berhasil dihapus secara permanen",
      action: actionTaken,
      userId: targetIdStr,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/admin/users/[id] error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Gagal menghapus pengguna", 500);
  }
}

