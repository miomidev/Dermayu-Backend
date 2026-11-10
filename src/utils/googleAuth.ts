/**
 * Utilitas Integrasi Single Sign-On (SSO) Google OAuth 2.0 DERMAYU
 */

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Mendapatkan redirect URI resmi Google OAuth yang sesuai dengan konfigurasi Google Cloud Console.
 * Terdaftar:
 * - https://dermayu.miomidev.com/auth/google/callback
 * - http://localhost:8000/auth/google/callback
 * - http://127.0.0.1:8000/auth/google/callback
 */
export function getGoogleOAuthRedirectUri(): string {
  // 1. Prioritaskan environment variable jika dikonfigurasi secara manual
  if (process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;

    // Domain Produksi VPS
    if (origin.includes("dermayu.miomidev.com")) {
      return "https://dermayu.miomidev.com/auth/google/callback";
    }

    // Jika diakses via IP 127.0.0.1
    if (window.location.hostname === "127.0.0.1") {
      return window.location.port === "3000" && process.env.NEXT_PUBLIC_ENABLE_LOCAL_3000 === "true"
        ? "http://127.0.0.1:3000/auth/google/callback"
        : "http://127.0.0.1:8000/auth/google/callback";
    }

    // Localhost development
    if (window.location.port === "3000" && process.env.NEXT_PUBLIC_ENABLE_LOCAL_3000 === "true") {
      return "http://localhost:3000/auth/google/callback";
    }

    return "http://localhost:8000/auth/google/callback";
  }

  return process.env.NODE_ENV === "production"
    ? "https://dermayu.miomidev.com/auth/google/callback"
    : "http://localhost:8000/auth/google/callback";
}

/**
 * Memulai alur autentikasi Google OAuth 2.0 (Redirect ke Google Consent Screen)
 */
export function initiateGoogleLogin() {
  if (typeof window === "undefined") return;

  if (!GOOGLE_CLIENT_ID) {
    alert("Konfigurasi NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diatur di environment.");
    return;
  }

  const redirectUri = getGoogleOAuthRedirectUri();
  const scope = encodeURIComponent("openid email profile");
  const state = encodeURIComponent(window.location.origin);

  // Simpan redirect uri ke sessionStorage agar saat callback tepat mencocokkan
  try {
    sessionStorage.setItem("dermayu_google_redirect_uri", redirectUri);
  } catch {}

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}&prompt=select_account&access_type=offline`;

  window.location.href = authUrl;
}
