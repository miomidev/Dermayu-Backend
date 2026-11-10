import { NextRequest, NextResponse } from "next/server";

const ALLOWED_REDIRECT_URIS = [
  "https://dermayu.miomidev.com/auth/google/callback",
  "http://localhost:8000/auth/google/callback",
  "http://127.0.0.1:8000/auth/google/callback",
];

export async function GET(req: NextRequest) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_CLIENT_ID belum dikonfigurasi di environment server. Pastikan .env server memiliki GOOGLE_CLIENT_ID.",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const queryRedirectUri = searchParams.get("redirect_uri");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");

  let redirectUri = "https://dermayu.miomidev.com/auth/google/callback";

  if (queryRedirectUri && ALLOWED_REDIRECT_URIS.includes(queryRedirectUri)) {
    redirectUri = queryRedirectUri;
  } else if (host.includes("dermayu.miomidev.com")) {
    redirectUri = "https://dermayu.miomidev.com/auth/google/callback";
  } else if (host.includes("127.0.0.1")) {
    redirectUri = "http://127.0.0.1:8000/auth/google/callback";
  } else if (host.includes("localhost")) {
    redirectUri = "http://localhost:8000/auth/google/callback";
  }

  const scope = encodeURIComponent("openid email profile");
  const state = encodeURIComponent(`${proto}://${host}`);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}&prompt=select_account&access_type=offline`;

  const response = NextResponse.redirect(googleAuthUrl);

  // Simpan redirect uri ke cookie sementara (10 menit) agar callback membaca nilai yang sama persis
  response.cookies.set("google_oauth_redirect_uri", redirectUri, {
    path: "/",
    maxAge: 600,
    sameSite: "lax",
  });

  return response;
}
