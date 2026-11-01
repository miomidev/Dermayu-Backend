import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = BigInt(auth.context.user.userId);

    await db.notification.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    return apiSuccess({ message: "Semua notifikasi berhasil ditandai sudah dibaca" });
  } catch (error) {
    console.error("POST /notifications/read-all error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui notifikasi", 500);
  }
}

