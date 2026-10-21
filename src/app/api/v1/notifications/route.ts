import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const notifications = await db.notification.findMany({
      where: {
        user_id: BigInt(auth.context.user.userId),
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: {
        user_id: BigInt(auth.context.user.userId),
        read_at: null,
      },
    });

    return apiSuccess({
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET /notifications error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memuat notifikasi", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    // Mark all as read
    await db.notification.updateMany({
      where: {
        user_id: BigInt(auth.context.user.userId),
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    return apiSuccess({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (error) {
    console.error("POST /notifications/read-all error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui status notifikasi", 500);
  }
}
