import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { extractBearerToken, verifyAccessToken, hashToken } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const bearer = extractBearerToken(req.headers.get("authorization"));
    const userPayload = bearer ? verifyAccessToken(bearer) : null;

    let bodyRefreshToken: string | undefined;
    try {
      const body = await req.json();
      const parsed = logoutSchema.safeParse(body);
      if (parsed.success) {
        bodyRefreshToken = parsed.data.refreshToken;
      }
    } catch {
      // Body may be empty if called only with Bearer token
    }

    if (bodyRefreshToken) {
      const hashed = hashToken(bodyRefreshToken);
      await db.refreshToken.updateMany({
        where: { token_hash: hashed },
        data: { revoked_at: new Date() },
      });
    } else if (userPayload) {
      // Revoke all active tokens for this user session
      await db.refreshToken.updateMany({
        where: {
          user_id: BigInt(userPayload.userId),
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });
    }

    if (userPayload) {
      await recordAuditLog({
        req,
        actorId: userPayload.userId,
        actorName: userPayload.fullName,
        actorRole: userPayload.role,
        action: "USER_LOGOUT",
        entityType: "USER",
        entityId: userPayload.publicId,
        metadata: `Logout sesi akun: ${userPayload.fullName || userPayload.email} (${userPayload.role})`,
      });
    }

    const response = apiSuccess({ message: "Logout berhasil, sesi telah dicabut" });
    const pastDate = new Date(0);
    const cookieNames = [
      "user_session",
      "dermayu_token",
      "dermayu_refresh_token",
      "auth_token",
      "token",
      "accessToken",
      "refreshToken",
    ];

    cookieNames.forEach((name) => {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: pastDate,
        httpOnly: true,
        sameSite: "lax",
      });
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan saat logout", 500);
  }
}
