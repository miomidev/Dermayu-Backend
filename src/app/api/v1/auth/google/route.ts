import { NextRequest } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { Role } from "@prisma/client";
import { apiError, apiSuccess } from "@/lib/api-response";
import { generateAccessToken, generateRefreshToken, hashPassword } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, redirectUri } = body;

    if (!code || typeof code !== "string") {
      return apiError("VALIDATION_ERROR", "Authorization code Google diperlukan", 422);
    }

    const clientId =
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return apiError(
        "INTERNAL_ERROR",
        "Kredensial Google OAuth (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) belum dikonfigurasi di environment server.",
        500
      );
    }

    // 1. Tukar authorization code dengan access token Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return apiError(
        "UNAUTHORIZED",
        `Gagal verifikasi dengan Google: ${tokenData.error_description || tokenData.error || "Token tidak valid"}`,
        401
      );
    }

    // 2. Ambil profil pengguna dari Google UserInfo API
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    if (!userInfoRes.ok) {
      return apiError("UNAUTHORIZED", "Gagal mengambil data profil dari Google", 401);
    }

    const userInfo: GoogleUserInfo = await userInfoRes.json();

    if (!userInfo.email) {
      return apiError("UNAUTHORIZED", "Akun Google tidak memiliki alamat email yang valid", 400);
    }

    const email = userInfo.email.toLowerCase().trim();
    const fullName = userInfo.name || email.split("@")[0];
    const avatarUrl = userInfo.picture || null;

    // 3. Database Sync: Cari atau buat akun pengguna
    let user: any = null;
    let userRole: Role = Role.CITIZEN;
    let userIdStr = `google-${userInfo.sub}`;
    let publicId = `usr-g-${userInfo.sub.slice(-8)}`;

    try {
      user = await db.user.findFirst({
        where: { email },
      });

      if (user) {
        userRole = user.role;
        userIdStr = user.id.toString();
        publicId = user.public_id;

        // Perbarui avatar & login timestamp
        await db.user.update({
          where: { id: user.id },
          data: {
            last_login_at: new Date(),
            avatar_url: avatarUrl || user.avatar_url,
            email_verified_at: user.email_verified_at || new Date(),
          },
        });
      } else {
        // Otomatis tentukan role jika email admin/petugas
        if (email.includes("superadmin") || email.includes("admin")) {
          userRole = Role.SUPERADMIN;
        } else if (email.includes("petugas") || email.includes("bpbd")) {
          userRole = Role.OFFICER;
        }

        const randomPassword = crypto.randomUUID();
        const passwordHash = await hashPassword(randomPassword);

        user = await db.user.create({
          data: {
            full_name: fullName,
            email,
            password_hash: passwordHash,
            role: userRole,
            avatar_url: avatarUrl,
            is_active: true,
            email_verified_at: new Date(),
            last_login_at: new Date(),
          },
        });

        userIdStr = user.id.toString();
        publicId = user.public_id;
      }
    } catch (dbErr) {
      console.warn("Database sync warning for Google user (using memory fallback):", dbErr);
      if (email.includes("superadmin") || email.includes("admin")) {
        userRole = Role.SUPERADMIN;
      } else if (email.includes("petugas") || email.includes("bpbd")) {
        userRole = Role.OFFICER;
      }
    }

    // 4. Generate JWT Tokens
    const accessToken = generateAccessToken({
      userId: userIdStr,
      publicId,
      role: userRole,
      fullName,
      email,
    });
    const refreshToken = generateRefreshToken({ userId: userIdStr });

    // 5. Catat Audit Log
    try {
      await recordAuditLog({
        req,
        actorId: userIdStr,
        actorName: fullName,
        actorRole: userRole,
        action: "USER_LOGIN_GOOGLE",
        entityType: "USER",
        entityId: publicId,
        metadata: `Login Single Sign-On (SSO) Google berhasil: ${email}`,
      });
    } catch (_) { }

    // 6. Siapkan Objek Sesi Pengguna
    const normalizedRole =
      userRole === Role.SUPERADMIN ? "superadmin" : userRole === Role.OFFICER ? "petugas" : "warga";

    const userSession = {
      id: publicId,
      name: fullName,
      fullName,
      email,
      role: normalizedRole,
      district:
        normalizedRole === "superadmin"
          ? "Pusat Komando Indramayu"
          : normalizedRole === "petugas"
            ? "Pusdalops BPBD Indramayu"
            : "Kabupaten Indramayu",
      picture: avatarUrl,
      lastDashboardActive: Date.now(),
      loginTime: Date.now(),
    };

    const response = apiSuccess({
      user: userSession,
      accessToken,
      refreshToken,
    });

    // 7. Tulis HTTP Cookies untuk middleware & session security
    const maxAge = 7 * 24 * 60 * 60; // 7 hari
    response.cookies.set("user_session", encodeURIComponent(JSON.stringify(userSession)), {
      path: "/",
      maxAge,
      sameSite: "lax",
    });
    response.cookies.set("dermayu_token", accessToken, {
      path: "/",
      maxAge,
      sameSite: "lax",
    });
    response.cookies.set("auth_token", accessToken, {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/v1/auth/google unhandled error:", error);
    return apiError("INTERNAL_ERROR", error.message || "Terjadi kesalahan server saat login Google", 500);
  }
}
