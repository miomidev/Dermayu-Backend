import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize, Roles } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = authorize(req, Roles.SUPERADMIN_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        last_login_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(users);
  } catch (error) {
    console.error("GET /admin/users error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat daftar pengguna", 500);
  }
}

const createUserSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().optional(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  role: z.enum(["OFFICER", "SUPERADMIN"]),
});

export async function POST(req: NextRequest) {
  const auth = authorize(req, Roles.SUPERADMIN_ONLY);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Data pengguna baru tidak valid", 422);
    }

    const { fullName, email, phone, password, role } = result.data;

    // Check unique
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("CONFLICT", "Email sudah terdaftar", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        full_name: fullName,
        email,
        phone: phone || null,
        password_hash: passwordHash,
        role,
      },
      select: {
        id: true,
        public_id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor_id: BigInt(auth.context.user.userId),
        action: "CREATE_STAFF_ACCOUNT",
        entity_type: "USER",
        entity_id: user.public_id,
        metadata: JSON.stringify({ email: user.email, role: user.role }),
      },
    });

    return apiSuccess({ message: "Akun berhasil dibuat", user }, undefined, 201);
  } catch (error) {
    console.error("POST /admin/users error:", error);
    return apiError("INTERNAL_ERROR", "Gagal membuat akun pengguna", 500);
  }
}
