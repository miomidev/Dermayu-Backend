import { NextRequest } from "next/server";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorize } from "@/lib/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const userId = BigInt(auth.context.user.userId);

    const notification = await db.notification.findFirst({
      where: {
        id: BigInt(id),
        user_id: userId,
      },
    });

    if (!notification) {
      return apiError("NOT_FOUND", "Notifikasi tidak ditemukan", 404);
    }

    const updated = await db.notification.update({
      where: { id: notification.id },
      data: { read_at: new Date() },
    });

    return apiSuccess({
      message: "Notifikasi ditandai sudah dibaca",
      notification: updated,
    });
  } catch (error) {
    console.error("PATCH /notifications/[id]/read error:", error);
    return apiError("INTERNAL_ERROR", "Gagal memperbarui status notifikasi", 500);
  }
}

