/**
 * Dermayu Role-Based Authentication & Dashboard Session Manager
 * Mengatur grace period 15 menit ketika user meninggalkan dashboard.
 * 3 Role: warga, petugas, superadmin
 */

export interface UserSession {
  name: string;
  email: string;
  role: "warga" | "petugas" | "superadmin";
  district?: string;
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
    let session = getActiveSession();
    const now = Date.now();

    if (!session) {
      // Coba pulihkan dari legacy jika ada
      const legacyRaw = localStorage.getItem(LEGACY_SESSION_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        session = {
          name: legacy.name || "Pengguna DERMAYU",
          email: legacy.email || "user@dermayu.id",
          role: (legacy.role as UserSession["role"]) || "warga",
          district: legacy.district,
          loginTime: now,
          lastDashboardActive: now,
        };
      }
    }

    if (session) {
      session.lastDashboardActive = now;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Sinkronkan ke key cadangan
      localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(session));
      document.cookie = `user_session=${encodeURIComponent(
        JSON.stringify(session)
      )}; path=/; max-age=604800; SameSite=Lax`;
    }
  } catch (e) {
    console.error("Error updating dashboard activity:", e);
  }
}

/**
 * Menyimpan data session saat login berhasil (3 Role: warga, petugas, superadmin).
 */
export function saveUserSession(user: {
  name: string;
  email: string;
  role: string;
  district?: string;
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

  const now = Date.now();

  const session: UserSession = {
    name:
      user.name ||
      (isSuperadmin
        ? "Super Admin DERMAYU"
        : isOfficer
        ? "Petugas BPBD"
        : "Warga Indramayu"),
    email: user.email,
    role: normalizedRole,
    district:
      user.district ||
      (isSuperadmin
        ? "Pusat Komando Indramayu"
        : isOfficer
        ? "Pusdalops BPBD Indramayu"
        : "Kandanghaur - Eretan Wetan"),
    loginTime: now,
    lastDashboardActive: now,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("dermayu_user", JSON.stringify(session));
    document.cookie = `user_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event("dermayu_session_updated"));
  }

  return session;
}

/**
 * Menghapus seluruh session dari localStorage dan cookie saat logout eksplisit
 * atau saat timeout 15 menit berakhir.
 */
export function clearUserSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem("dermayu_user");
    localStorage.removeItem("dermayu_token");
    localStorage.removeItem("dermayu_refresh_token");
    document.cookie = "user_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch (e) {
    console.error("Error clearing user session:", e);
  }
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
