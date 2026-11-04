import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface UserSessionPayload {
  name?: string;
  email?: string;
  role?: string;
  lastDashboardActive?: number;
}

const TIMEOUT_MS = 15 * 60 * 1000; // 15 menit grace period

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Dapatkan cookie session & token
  const sessionCookie = request.cookies.get("user_session")?.value;
  const tokenCookie =
    request.cookies.get("dermayu_token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value;

  let session: UserSessionPayload | null = null;

  if (sessionCookie) {
    try {
      const decoded = decodeURIComponent(sessionCookie);
      session = JSON.parse(decoded) as UserSessionPayload;

      // Cek apakah session grace period (15 menit) sudah kedaluwarsa
      if (session?.lastDashboardActive) {
        const elapsed = Date.now() - session.lastDashboardActive;
        if (elapsed > TIMEOUT_MS) {
          session = null;
        }
      }
    } catch {
      session = null;
    }
  }

  const isAuthenticated = Boolean(session || tokenCookie);

  // 2. Proteksi Rute Dasbor: Jika sesi tidak ada / tidak valid, redirect ke Landing Page (/)
  if (!isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Hapus sisa-sisa cookie yang mungkin invalid
    const pastDate = new Date(0);
    ["user_session", "dermayu_token", "auth_token", "token"].forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        path: "/",
        maxAge: 0,
        expires: pastDate,
      });
    });

    return response;
  }

  // 3. Verifikasi Role-Based Access Control (RBAC) pada Rute Terproteksi
  const userRole = (session?.role || "").toLowerCase();

  // A. Rute Admin / Superadmin
  if (pathname.startsWith("/admin")) {
    const isSuperadmin = userRole === "superadmin" || userRole === "admin";
    if (!isSuperadmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // B. Rute Petugas / Tim SAR
  if (pathname.startsWith("/petugas")) {
    const isOfficer =
      userRole === "petugas" ||
      userRole === "officer" ||
      userRole === "superadmin" ||
      userRole === "admin";
    if (!isOfficer) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 4. Set Header Anti-Caching pada seluruh rute dashboard yang berhasil diakses
  // Mencegah browser desktop & mobile menyimpan snapshot halaman di bfcache (Back/Forward Cache)
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");

  return response;
}

export const config = {
  matcher: [
    "/warga",
    "/warga/:path*",
    "/petugas",
    "/petugas/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
