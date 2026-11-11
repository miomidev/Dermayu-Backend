/**
 * Dermayu Role-Based Authentication & Dashboard Session Manager
 * Mengatur grace period 15 menit ketika user meninggalkan dashboard.
 * 3 Role: warga, petugas, superadmin
 */

export interface UserSession {
  id?: string;
  name: string;
  fullName?: string;
  email: string;
  role: "warga" | "petugas" | "superadmin" | "CITIZEN" | "OFFICER" | "SUPERADMIN";
  phone?: string | null;
  district?: string;
  village?: string;
  address?: string;
  isProfileComplete?: boolean;
  isGoogleAuth?: boolean;
  picture?: string;
  avatarUrl?: string;
  lastDashboardActive: number;
  loginTime?: number;
}

export const SESSION_KEY = "dermayu_session";
export const LEGACY_SESSION_KEY = "user_session";
export const TIMEOUT_MS = 15 * 60 * 1000; // 15 menit grace period

/**
 * Mendapatkan session yang sedang aktif jika belum kedaluwarsa.
 * Jika selisih waktu sejak terakhir aktif di dashboard > 15 menit, session dihapus.
 */
export function getActiveSession(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    let raw = localStorage.getItem(SESSION_KEY);
    // Fallback jika session masih ada di format lama
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_SESSION_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const upgraded: UserSession = {
          name: legacy.name || "Pengguna DERMAYU",
          email: legacy.email || "user@dermayu.id",
          role: (legacy.role as UserSession["role"]) || "warga",
          district: legacy.district || "Indramayu",
          loginTime: legacy.loginTime || Date.now(),
          lastDashboardActive: legacy.lastDashboardActive || Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(upgraded));
        raw = JSON.stringify(upgraded);
      }
    }

    // Fallback jika localStorage kosong tapi cookie user_session masih aktif
    if (!raw && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)user_session=([^;]+)/);
      if (match) {
        try {
          raw = decodeURIComponent(match[1]);
          localStorage.setItem(SESSION_KEY, raw);
        } catch {}
      }
    }

    if (!raw) return null;

    const session: UserSession = JSON.parse(raw);
    const now = Date.now();

    // Pastikan field lastDashboardActive valid
    if (!session.lastDashboardActive) {
      session.lastDashboardActive = now;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    // Cek apakah jeda sejak terakhir aktif di dashboard sudah lewat 15 menit
    const elapsed = now - session.lastDashboardActive;
    if (elapsed > TIMEOUT_MS) {
      clearUserSession();
      return null;
    }

    if (!session.id) {
      session.id =
        session.role === "petugas" || session.role === "OFFICER"
          ? "petugas-01"
          : session.role === "superadmin" || session.role === "SUPERADMIN"
          ? "admin-01"
          : "warga-01";
    }

    return session;
  } catch (error) {
    console.error("Error reading active session:", error);
    clearUserSession();
    return null;
  }
}

/**
 * Memperbarui timestamp aktivitas dashboard saat user masih berinteraksi
 * di dalam halaman dasbor (/warga/*, /petugas/*, /admin/*).
 */
export function touchDashboardActivity(): void {
  if (typeof window === "undefined") return;

  try {
    const session = getActiveSession();
    const now = Date.now();

    // Jika tidak ada session aktif, jangan rekayasa atau perbarui apapun
    if (!session) {
      return;
    }

    session.lastDashboardActive = now;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(session));
    document.cookie = `user_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `dermayu_token=${encodeURIComponent(session.id || "token_demo")}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `auth_token=${encodeURIComponent(session.id || "token_demo")}; path=/; max-age=604800; SameSite=Lax`;
  } catch (e) {
    console.error("Error updating dashboard activity:", e);
  }
}

/**
 * Menyimpan data session saat login berhasil (3 Role: warga, petugas, superadmin).
 */
export function saveUserSession(user: {
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  phone?: string | null;
  district?: string;
  village?: string;
  address?: string;
  isProfileComplete?: boolean;
  isGoogleAuth?: boolean;
  picture?: string;
  avatarUrl?: string;
}): UserSession {
  const roleNorm = (user.role || "").toLowerCase();
  const isSuperadmin =
    roleNorm === "superadmin" ||
    roleNorm === "admin" ||
    user.email.toLowerCase().includes("superadmin");
  const isOfficer =
    roleNorm === "petugas" ||
    roleNorm === "officer" ||
    user.email.toLowerCase().includes("petugas");

  let normalizedRole: UserSession["role"] = "warga";
  if (isSuperadmin) normalizedRole = "superadmin";
  else if (isOfficer) normalizedRole = "petugas";

  const displayName =
    user.fullName ||
    user.name ||
    (isSuperadmin
      ? "Super Admin DERMAYU"
      : isOfficer
      ? "Petugas BPBD"
      : "Warga Indramayu");

  const now = Date.now();

  const isProfileComplete =
    user.isProfileComplete !== undefined
      ? user.isProfileComplete
      : Boolean(
          user.phone &&
          user.phone.trim().length >= 9 &&
          user.district &&
          user.village &&
          user.address &&
          user.address.trim().length >= 3
        );

  const session: UserSession = {
    id: user.id || (isSuperadmin ? "admin-01" : isOfficer ? "petugas-01" : "warga-01"),
    name: displayName,
    fullName: displayName,
    email: user.email,
    role: normalizedRole,
    phone: user.phone || null,
    district:
      user.district ||
      (isSuperadmin
        ? "Pusat Komando Indramayu"
        : isOfficer
        ? "Pusdalops BPBD Indramayu"
        : ""),
    village: user.village || "",
    address: user.address || "",
    isProfileComplete,
    isGoogleAuth: user.isGoogleAuth !== undefined ? user.isGoogleAuth : false,
    picture: user.picture || user.avatarUrl,
    avatarUrl: user.avatarUrl || user.picture,
    loginTime: now,
    lastDashboardActive: now,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(
      "dermayu_user",
      JSON.stringify({
        ...session,
        id: isSuperadmin ? "1" : isOfficer ? "2" : "3",
        role: isSuperadmin ? "SUPERADMIN" : isOfficer ? "OFFICER" : "CITIZEN",
      })
    );
    document.cookie = `user_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `dermayu_token=${encodeURIComponent(session.id || "token_demo")}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `auth_token=${encodeURIComponent(session.id || "token_demo")}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event("dermayu_session_updated"));
  }

  return session;
}

/**
 * Menghapus seluruh session dari localStorage, sessionStorage, dan cookie saat logout eksplisit
 * atau saat timeout grace period berakhir.
 */
export function clearUserSession(): void {
  if (typeof window === "undefined") return;

  try {
    // 1. Bersihkan seluruh token & session di localStorage
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem("dermayu_user");
    localStorage.removeItem("dermayu_token");
    localStorage.removeItem("dermayu_refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // 2. Bersihkan sessionStorage
    sessionStorage.clear();

    // 3. Cabut cookie otentikasi (atur max-age=0 dan tanggal lampau)
    const pastDate = "Thu, 01 Jan 1970 00:00:00 GMT";
    const cookiesToClear = [
      "user_session",
      "dermayu_token",
      "dermayu_refresh_token",
      "auth_token",
      "token",
      "accessToken",
      "refreshToken",
    ];

    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0; expires=${pastDate}`;
      // Coba juga dengan domain kosong & SameSite
      document.cookie = `${name}=; path=/; max-age=0; expires=${pastDate}; SameSite=Lax`;
    });

    // 4. Siarkan event agar komponen dashboard langsung mereset state user ke null
    window.dispatchEvent(new Event("dermayu_session_cleared"));
    window.dispatchEvent(new Event("dermayu_session_updated"));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error clearing user session:", e);
  }
}

/**
 * Melakukan proses logout lengkap:
 * 1. Panggil server endpoint POST /api/v1/auth/logout untuk mencabut token & menghapus cookie HttpOnly
 * 2. Bersihkan seluruh penyimpanan client (localStorage, sessionStorage, cookie)
 * 3. Gantikan entry history dasbor dengan Landing Page ('/'), lalu arahkan ke Halaman Login ('/login')
 *    sehingga saat user berada di /login dan menekan tombol Back tanpa login,
 *    browser otomatis kembali ke Landing Page ('/').
 */
export async function performLogout(redirectTo: string = "/login"): Promise<void> {
  if (typeof window === "undefined") return;

  const refreshToken = localStorage.getItem("dermayu_refresh_token") || undefined;
  const accessToken = localStorage.getItem("dermayu_token") || undefined;

  // 1. Panggil endpoint logout server (asynchronous)
  try {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    }).catch(() => {});
  } catch (err) {
    console.warn("Logout server request failed, continuing client cleanup:", err);
  }

  // 2. Bersihkan seluruh token & session client
  clearUserSession();

  // 3. Rekayasa history stack browser:
  // Gantikan entri dashboard aktif dengan Landing Page ('/'),
  // kemudian navigasikan ke halaman login ('/login').
  // Stack riwayat: [..., '/', '/login']
  // Saat user menekan tombol 'Back' (kembali) di ponsel atau peramban dari /login,
  // browser akan langsung kembali ke Landing Page ('/').
  try {
    window.history.replaceState(null, "", "/");
  } catch {}

  window.location.href = redirectTo;
}

/**
 * Mendapatkan URL redirect tujuan dashboard sesuai role (3 Role).
 */
export function getDashboardUrl(role?: string): string {
  if (!role) return "/login";
  const r = role.toLowerCase();
  if (r === "superadmin" || r === "admin") return "/admin/dashboard";
  if (r === "petugas" || r === "officer") return "/petugas/dashboard";
  return "/warga/dashboard";
}
