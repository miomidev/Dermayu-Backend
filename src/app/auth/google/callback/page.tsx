"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveUserSession, touchDashboardActivity, getDashboardUrl } from "@/utils/authSession";
import { getGoogleOAuthRedirectUri } from "@/utils/googleAuth";
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { LogoDermayu } from "@/components/ui/LogoDermayu";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam) {
      setStatus("error");
      setErrorMessage(
        errorDesc ||
          (errorParam === "access_denied"
            ? "Akses login dibatalkan oleh pengguna."
            : `Error dari Google: ${errorParam}`)
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("Kode otorisasi Google tidak ditemukan pada URL callback.");
      return;
    }

    // Ambil redirect URI yang tersimpan atau hitung sesuai origin aktif
    let redirectUri = getGoogleOAuthRedirectUri();
    try {
      const stored = sessionStorage.getItem("dermayu_google_redirect_uri");
      if (stored) {
        redirectUri = stored;
      }
    } catch {}

    const exchangeToken = async () => {
      try {
        const res = await fetch("/api/v1/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, redirectUri }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          const msg =
            json?.error?.message ||
            json?.message ||
            "Gagal melakukan autentikasi akun Google dengan server DERMAYU.";
          setStatus("error");
          setErrorMessage(msg);
          return;
        }

        const userData = json.data?.user;
        if (!userData) {
          setStatus("error");
          setErrorMessage("Data profil pengguna dari Google tidak lengkap.");
          return;
        }

        // Simpan session pengguna ke localStorage dan cookies
        const session = saveUserSession(userData);
        touchDashboardActivity();
        setStatus("success");

        const targetUrl = getDashboardUrl(session.role);

        // Berikan jeda halus 350ms agar animasi sukses terlihat elegan
        setTimeout(() => {
          router.replace(targetUrl);
          setTimeout(() => {
            if (typeof window !== "undefined" && window.location.pathname.includes("/callback")) {
              window.location.href = targetUrl;
            }
          }, 500);
        }, 350);
      } catch (err: any) {
        console.error("Callback verification failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "Koneksi jaringan terputus saat memverifikasi akun.");
      }
    };

    exchangeToken();
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-[#D5E4E0] shadow-xl p-8 sm:p-10 text-center space-y-6">
      {/* Brand Logo Header */}
      <div className="flex justify-center items-center gap-2">
        <LogoDermayu variant="dark" width={38} height={38} />
        <span className="font-black text-lg text-[#132422] tracking-wider">DERMAYU</span>
      </div>

      {status === "loading" && (
        <div className="space-y-4 py-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#38746D] animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#132422]">
              Menghubungkan Akun Google...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Sedang memverifikasi data kredensial Anda dan menyiapkan sesi dasbor DERMAYU.
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-emerald-900">
              Autentikasi Berhasil!
            </h3>
            <p className="text-xs text-slate-600">
              Akun Google Anda terverifikasi. Mengalihkan Anda ke Dasbor...
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-5 py-2 animate-fade-in text-left">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-rose-600" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-base font-extrabold text-rose-950">
              Gagal Masuk dengan Google
            </h3>
            <p className="text-xs text-slate-600 bg-rose-50/60 p-3 rounded-xl border border-rose-100 break-words">
              {errorMessage}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full h-11 px-4 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#38746D]" />
        <span>Keamanan Terenkripsi OAuth 2.0 DERMAYU</span>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAF9] via-[#EEF5F3] to-[#E3EDE9] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#D5E4E0] shadow-xl p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EEF5F3] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#38746D] animate-spin" />
            </div>
            <p className="text-xs font-bold text-slate-600">Menyiapkan modul autentikasi...</p>
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </div>
  );
}
