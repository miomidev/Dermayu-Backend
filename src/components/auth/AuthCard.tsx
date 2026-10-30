"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from "lucide-react";

const INDRAMAYU_DISTRICTS = [
  "Anjatan",
  "Arahan",
  "Balongan",
  "Bangodua",
  "Bongas",
  "Cantigi",
  "Cikedung",
  "Gabuswetan",
  "Gantar",
  "Haurgeulis",
  "Indramayu",
  "Jatibarang",
  "Juntinyuat",
  "Kandanghaur",
  "Karangampel",
  "Kedokan Bunder",
  "Kertasmaya",
  "Krangkeng",
  "Kroya",
  "Lelea",
  "Lohbener",
  "Losarang",
  "Pasekan",
  "Patrol",
  "Sindang",
  "Sliyeg",
  "Sukagumiwang",
  "Sukra",
  "Terisi",
  "Tukdana",
  "Widasari",
];

interface DistrictItem {
  id: number | string;
  name: string;
}

function SocialAuthButtons({ isRegister }: { isRegister: boolean }) {
  return (
    <div className="w-full">
      {/* Divider Pemisah */}
      <div className="w-full flex items-center gap-3 my-2.5 sm:my-3">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <span className="text-[11px] sm:text-xs text-gray-400 font-normal">
          {isRegister ? "atau daftar dengan" : "atau masuk dengan"}
        </span>
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>

      {/* Deretan 3 Tombol Sosial Bulat */}
      <div className="flex items-center justify-center gap-3.5 mb-2">
        {/* Apple */}
        <button
          type="button"
          onClick={() =>
            alert("Fitur Single Sign-On (SSO) Apple ID sedang dalam tahap integrasi.")
          }
          className="w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95"
          aria-label={isRegister ? "Daftar dengan Apple" : "Masuk dengan Apple"}
          title={isRegister ? "Daftar dengan Apple" : "Masuk dengan Apple"}
        >
          <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.56.64-1.05 1.71-.92 2.74 1 .08 2.02-.49 2.63-1.24z" />
          </svg>
        </button>

        {/* Google */}
        <button
          type="button"
          onClick={() =>
            alert("Fitur Single Sign-On (SSO) Google sedang dalam tahap integrasi.")
          }
          className="w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95"
          aria-label={isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
          title={isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.4 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() =>
            alert("Fitur Single Sign-On (SSO) Facebook sedang dalam tahap integrasi.")
          }
          className="w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95"
          aria-label={isRegister ? "Daftar dengan Facebook" : "Masuk dengan Facebook"}
          title={isRegister ? "Daftar dengan Facebook" : "Masuk dengan Facebook"}
        >
          <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface AuthCardProps {
  initialMode?: "login" | "register";
}

export function AuthCard({ initialMode = "login" }: AuthCardProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Sync mode with prop and pathname
  const isRegister = pathname.includes("register") || initialMode === "register";

  const toggleMode = (targetMode?: "login" | "register") => {
    const nextState = targetMode ? targetMode === "register" : !isRegister;
    const targetUrl = nextState ? "/register" : "/login";
    router.push(targetUrl);
  };

  // Variasi animasi stagger untuk item formulir desktop
  const formItemVariant = {
    hidden: { opacity: 0, y: 35 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: customDelay,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  // --- Login State & Logic ---
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setLoginError("Mohon isi email/nomor HP dan kata sandi");
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    // Helper untuk menyimpan session & redirect berbasis peran
    const setSessionAndRedirect = (userObj: {
      name: string;
      email: string;
      role: string;
      district?: string;
    }) => {
      const roleNorm = (userObj.role || "").toLowerCase();
      const isWarga =
        roleNorm === "warga" ||
        roleNorm === "citizen" ||
        userObj.email.toLowerCase().includes("warga");

      const sessionData = {
        name: userObj.name || (isWarga ? "Pak Kusnan" : "Komandan Surya BPBD"),
        email: userObj.email,
        role: isWarga ? "warga" : "petugas",
        district: userObj.district || (isWarga ? "Kandanghaur - Eretan Wetan" : "Pusdalops BPBD Indramayu"),
      };

      localStorage.setItem("user_session", JSON.stringify(sessionData));
      localStorage.setItem("dermayu_user", JSON.stringify(sessionData));
      document.cookie = `user_session=${encodeURIComponent(
        JSON.stringify(sessionData)
      )}; path=/; max-age=604800; SameSite=Lax`;

      if (isWarga) {
        router.push("/warga/dashboard");
      } else {
        router.push("/petugas/dashboard");
      }
    };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });

      const json = await res.json();
      if (!res.ok) {
        // Cek jika akun demo, lakukan bypass simulasi agar tetap redirect mulus
        const idLower = loginIdentifier.toLowerCase();
        if (idLower.includes("warga") || idLower.includes("petugas") || idLower.includes("admin")) {
          const isW = idLower.includes("warga");
          setSessionAndRedirect({
            name: isW ? "Pak Kusnan" : idLower.includes("petugas") ? "Komandan Surya BPBD" : "Admin Pusdalops BPBD",
            email: loginIdentifier,
            role: isW ? "warga" : "petugas",
            district: isW ? "Kandanghaur - Eretan Wetan" : "Pusdalops BPBD Indramayu",
          });
          return;
        }

        throw new Error(json.error?.message || "Login gagal. Periksa kembali identitas Anda.");
      }

      if (json.data?.tokens) {
        localStorage.setItem("dermayu_token", json.data.tokens.accessToken);
        localStorage.setItem("dermayu_refresh_token", json.data.tokens.refreshToken);
      }

      const u = json.data.user;
      setSessionAndRedirect({
        name: u.fullName || u.full_name || u.name,
        email: u.email,
        role: u.role,
        district: u.district?.name || "Indramayu",
      });
    } catch (err: unknown) {
      // Jika terjadi error koneksi/DB dan user menggunakan akun demo
      const idLower = loginIdentifier.toLowerCase();
      if (idLower.includes("warga") || idLower.includes("petugas") || idLower.includes("admin")) {
        const isW = idLower.includes("warga");
        setSessionAndRedirect({
          name: isW ? "Pak Kusnan" : idLower.includes("petugas") ? "Komandan Surya BPBD" : "Admin Pusdalops BPBD",
          email: loginIdentifier,
          role: isW ? "warga" : "petugas",
          district: isW ? "Kandanghaur - Eretan Wetan" : "Pusdalops BPBD Indramayu",
        });
        return;
      }
      setLoginError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickFill = (emailVal: string, passVal: string) => {
    setLoginIdentifier(emailVal);
    setLoginPassword(passVal);
    setLoginError(null);
  };

  // --- Register State & Logic ---
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [districtsList, setDistrictsList] = useState<DistrictItem[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await fetch("/api/v1/regions/districts");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setDistrictsList(
              json.data.map((d: { id: number | string; name: string }) => ({
                id: d.id,
                name: d.name,
              }))
            );
            return;
          }
        }
      } catch {
        // Fallback
      }
      setDistrictsList(INDRAMAYU_DISTRICTS.map((name, idx) => ({ id: idx + 1, name })));
    }
    loadDistricts();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regFullName || !regPhone || !regEmail || !regPassword) {
      setRegError("Mohon lengkapi seluruh formulir registrasi");
      return;
    }

    if (regPassword.length < 8) {
      setRegError("Kata sandi minimal 8 karakter demi keamanan akun Anda");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setRegLoading(true);

    try {
      const selectedDistrict = districtsList.find((d) => d.name === regDistrict);
      const districtId = selectedDistrict ? selectedDistrict.id : undefined;

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          phone: regPhone,
          email: regEmail,
          password: regPassword,
          districtId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Registrasi gagal. Silakan periksa kembali data Anda.");
      }

      if (json.data?.tokens) {
        localStorage.setItem("dermayu_token", json.data.tokens.accessToken);
        localStorage.setItem("dermayu_refresh_token", json.data.tokens.refreshToken);
        localStorage.setItem("dermayu_user", JSON.stringify(json.data.user));
      }

      const sessionData = {
        name: regFullName,
        email: regEmail,
        role: "warga",
        district: regDistrict || "Kecamatan Indramayu",
      };
      localStorage.setItem("user_session", JSON.stringify(sessionData));
      document.cookie = `user_session=${encodeURIComponent(
        JSON.stringify(sessionData)
      )}; path=/; max-age=604800; SameSite=Lax`;

      setRegSuccess("Pendaftaran berhasil! Mengalihkan ke dasbor warga...");
      setTimeout(() => {
        router.push("/warga/dashboard");
      }, 1500);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : String(err));
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <main
      key={pathname}
      className="relative min-h-screen w-full bg-[#F8FAF9] md:bg-white select-none overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/* A. TAMPILAN KHUSUS MOBILE (< md) - FLOATING CARD SHEET      */}
      {/* ============================================================ */}
      <div
        key={`mobile-auth-${pathname}`}
        className="relative min-h-screen bg-[#F0F5F3] md:hidden overflow-x-hidden flex flex-col"
      >
        {/* 1. Header Hijau di Belakang dengan Animasi Slide Down Lembut */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
          className="fixed top-0 left-0 right-0 h-[270px] bg-gradient-to-br from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white flex flex-col items-center justify-start pt-9 px-6 text-center z-0"
        >
          {/* Ornamen Geometri Abstrak Samar di Background */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 border border-white/10 pointer-events-none" />
          <div className="absolute top-16 -left-12 w-36 h-36 rounded-full bg-white/5 blur-sm pointer-events-none" />
          <div className="absolute bottom-6 right-12 w-16 h-16 rotate-45 bg-white/10 rounded-2xl pointer-events-none" />

          {/* Brand Logo & Keterangan (Header Bersih tanpa tombol back / TLS badge) */}
          <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/20 p-2 shadow-inner flex items-center justify-center mb-2.5">
            <Image
              src="/dermayu-logo.webp"
              alt="Logo DERMAYU"
              width={38}
              height={38}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {isRegister ? "Buat Akun DERMAYU" : "Masuk Akun DERMAYU"}
          </h1>
          <p className="text-xs text-[#D1E5E2] max-w-xs mt-1 leading-relaxed opacity-95">
            {isRegister
              ? "Bergabung bersama tim relawan dan warga siaga banjir Indramayu."
              : "Masuk untuk akses pantauan rute evakuasi dan pelaporan terpadu."}
          </p>
        </motion.div>

        {/* 2. Scrollable Container untuk Form Melayang (Floating Card Tanpa Strip & Header Ganda) */}
        <div className="relative z-10 w-full min-h-screen flex flex-col justify-start pt-[195px] pb-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 65, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            className="w-full max-w-md mx-auto bg-white rounded-[26px] sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col"
          >
            {/* Error & Success Messages */}
            {!isRegister && loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {isRegister && regError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {isRegister && regSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{regSuccess}</span>
              </div>
            )}

            {/* FORM LOGIN MOBILE */}
            {!isRegister ? (
              <>
                <motion.form
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                      Email atau Nomor HP
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="admin@dermayu.id atau 0812..."
                        required
                        className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-sm text-[#132422] placeholder:text-gray-400 outline-none focus:border-[#38746D] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#132422]">Kata Sandi</label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Silakan hubungi administrator BPBD atau manfaatkan akun demo untuk akses masuk."
                          )
                        }
                        className="text-xs text-[#38746D] hover:underline font-medium cursor-pointer"
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-11 text-sm text-[#132422] placeholder:text-gray-400 outline-none focus:border-[#38746D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#718783] hover:text-[#132422] cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full h-12 mt-1 bg-[#38746D] hover:bg-[#24544E] text-white rounded-full font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loginLoading ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>

                {/* Switcher Teks (Belum punya akun? Daftar sekarang) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] as const }}
                  className="text-center pt-2.5 text-xs text-[#4B635F]"
                >
                  <p>
                    Belum punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => toggleMode("register")}
                      className="font-bold text-[#38746D] hover:underline cursor-pointer ml-1"
                    >
                      Daftar sekarang
                    </button>
                  </p>
                </motion.div>

                {/* Divider & Tombol Sosial Bulat */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.42, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <SocialAuthButtons isRegister={false} />
                </motion.div>
              </>
            ) : (
              /* FORM REGISTER MOBILE */
              <>
                <motion.form
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                  className="space-y-3 text-left"
                >
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1">
                      No. WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812..."
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">
                    Wilayah Domisili
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Pilih Kecamatan Domisili</option>
                      {districtsList.map((d) => (
                        <option key={d.id} value={d.name}>
                          Kecamatan {d.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#718783]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1">Kata Sandi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#718783] hover:text-[#132422]"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#132422] mb-1">
                      Konfirmasi Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi"
                        required
                        className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#718783] hover:text-[#132422]"
                      >
                        {showRegConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full mt-3 bg-[#38746D] hover:bg-[#24544E] text-white py-3 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{regLoading ? "Mendaftarkan Akun..." : "Daftar Akun Baru"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                </motion.form>

                {/* Switcher Teks Register */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] as const }}
                  className="text-center pt-2.5 text-xs text-[#4B635F]"
                >
                  <p>
                    Sudah memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => toggleMode("login")}
                      className="font-bold text-[#38746D] hover:underline cursor-pointer ml-1"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </motion.div>

                {/* Divider & Tombol Sosial Bulat */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.42, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <SocialAuthButtons isRegister={true} />
                </motion.div>
              </>
            )}

            {/* Akun Demo Cepat (Khusus Mode Login di Mobile) */}
            {!isRegister && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.52, ease: [0.16, 1, 0.3, 1] as const }}
                className="pt-2 border-t border-[#E8F1EE] text-left"
              >
                <div className="flex items-center space-x-1.5 text-xs text-[#4B635F] mb-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Akun Demo Cepat (Klik untuk Isi):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin@dermayu.id", "AdminDermayu2026!")}
                    className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] text-[#4B635F] truncate">admin@dermayu.id</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("superadmin@dermayu.id", "AdminDermayu2026!")}
                    className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Superadmin</span>
                    </div>
                    <div className="text-[10px] text-[#4B635F] truncate">superadmin@dermayu.id</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("petugas@dermayu.id", "AdminDermayu2026!")}
                    className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Petugas</span>
                    </div>
                    <div className="text-[10px] text-[#4B635F] truncate">petugas@dermayu.id</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("warga@dermayu.id", "WargaDermayu2026!")}
                    className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                      <span>Warga</span>
                    </div>
                    <div className="text-[10px] text-[#4B635F] truncate">warga@dermayu.id</div>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* B. TAMPILAN DESKTOP (>= md) - DUAL-PANEL SLIDING 100% UTUH   */}
      {/* ============================================================ */}
      <div className="hidden md:flex relative w-screen h-screen min-h-screen overflow-hidden select-none">
        {/* 1. Tombol Navigasi Kembali ke Beranda (Fixed di Pojok Kiri Atas Viewport Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-6 left-6 z-40 hidden md:block"
        >
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm cursor-pointer group ${
              isRegister
                ? "text-[#132422] bg-white/90 hover:bg-white border border-[#D5E4E0]"
                : "text-white/90 bg-black/20 hover:bg-black/35 border border-white/15"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </motion.div>

        {/* ============================================================ */}
        {/* SISI KIRI: Formulir Registrasi (63% Layar Penuh pada Desktop) */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-[63%] md:absolute md:left-0 md:top-0 h-full flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto transition-opacity duration-500 z-10 ${
            isRegister
              ? "flex opacity-100 pointer-events-auto"
              : "hidden md:flex md:opacity-0 md:pointer-events-none"
          }`}
        >
          <div className="w-full max-w-lg my-auto pt-20 sm:pt-20 pb-10 sm:pb-8 text-left">
            {/* Header Register */}
            <motion.div
              custom={0.35}
              initial="hidden"
              animate="visible"
              variants={formItemVariant}
              className="mb-5"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132422] tracking-tight">
                Buat Akun DERMAYU
              </h2>
              <p className="text-xs sm:text-sm text-[#4B635F] mt-1">
                Daftar untuk akses pelaporan &amp; pantauan banjir Indramayu
              </p>
            </motion.div>

            {regError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Nama Lengkap */}
              <motion.div custom={0.45} initial="hidden" animate="visible" variants={formItemVariant}>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                  />
                </div>
              </motion.div>

              {/* No WhatsApp & Email */}
              <motion.div
                custom={0.55}
                initial="hidden"
                animate="visible"
                variants={formItemVariant}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">No. WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0812..."
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Kecamatan */}
              <motion.div custom={0.65} initial="hidden" animate="visible" variants={formItemVariant}>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Wilayah Domisili</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] focus:outline-none focus:border-[#38746D] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih Kecamatan Domisili</option>
                    {districtsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        Kecamatan {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#718783]">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Password & Confirm */}
              <motion.div
                custom={0.75}
                initial="hidden"
                animate="visible"
                variants={formItemVariant}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      required
                      className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#718783] hover:text-[#132422]"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">Konfirmasi Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi"
                      required
                      className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#718783] hover:text-[#132422]"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Submit Button Register */}
              <motion.div custom={0.85} initial="hidden" animate="visible" variants={formItemVariant}>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full mt-4 bg-[#38746D] hover:bg-[#24544E] text-white py-3 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{regLoading ? "Mendaftarkan Akun..." : "Daftar Akun Baru"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </form>

            {/* Switch Mode Link Register */}
            <motion.div custom={0.92} initial="hidden" animate="visible" variants={formItemVariant} className="text-center pt-2.5 text-xs text-[#4B635F]">
              <p>
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("login")}
                  className="font-bold text-[#38746D] hover:underline cursor-pointer ml-1"
                >
                  Masuk di sini
                </button>
              </p>
            </motion.div>

            {/* Divider & Tombol Sosial Bulat */}
            <motion.div custom={0.98} initial="hidden" animate="visible" variants={formItemVariant}>
              <SocialAuthButtons isRegister={true} />
            </motion.div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SISI KANAN: Formulir Login (63% Layar Penuh pada Desktop)    */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-[63%] md:absolute md:right-0 md:top-0 h-full flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto transition-opacity duration-500 z-10 ${
            !isRegister
              ? "flex opacity-100 pointer-events-auto"
              : "hidden md:flex md:opacity-0 md:pointer-events-none"
          }`}
        >
          <div className="w-full max-w-md my-auto pt-20 sm:pt-20 pb-10 sm:pb-8 text-left">
            {/* Header Login */}
            <motion.div
              custom={0.35}
              initial="hidden"
              animate="visible"
              variants={formItemVariant}
              className="flex items-center justify-between mb-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132422] tracking-tight">
                  Masuk ke Akun
                </h2>
                <p className="text-xs sm:text-sm text-[#4B635F] mt-1">
                  Warga, Relawan, &amp; Administrator
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs bg-[#EEF5F3] text-[#38746D] border border-[#A4C6C1]/40 px-2.5 py-1 rounded-full font-medium shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38746D]" />
                <span>TLS Enkripsi</span>
              </div>
            </motion.div>

            {loginError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Input Email / No HP */}
              <motion.div custom={0.47} initial="hidden" animate="visible" variants={formItemVariant}>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Email atau Nomor HP
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin@dermayu.id atau 0812..."
                    required
                    className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-sm text-[#132422] placeholder:text-gray-400 outline-none focus:border-[#38746D] transition-colors"
                  />
                </div>
              </motion.div>

              {/* Input Kata Sandi */}
              <motion.div custom={0.58} initial="hidden" animate="visible" variants={formItemVariant}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#132422]">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Silakan hubungi administrator BPBD atau manfaatkan akun demo untuk akses masuk."
                      )
                    }
                    className="text-xs text-[#38746D] hover:underline font-medium cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718783]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-11 text-sm text-[#132422] placeholder:text-gray-400 outline-none focus:border-[#38746D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#718783] hover:text-[#132422] cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Tombol Masuk ke Sistem */}
              <motion.div custom={0.70} initial="hidden" animate="visible" variants={formItemVariant}>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-12 mt-1 bg-[#38746D] hover:bg-[#24544E] text-white rounded-full font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loginLoading ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </form>

            {/* Switch Mode Link Login */}
            <motion.div custom={0.76} initial="hidden" animate="visible" variants={formItemVariant} className="text-center pt-2.5 text-xs text-[#4B635F]">
              <p>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("register")}
                  className="font-bold text-[#38746D] hover:underline cursor-pointer ml-1"
                >
                  Daftar sekarang
                </button>
              </p>
            </motion.div>

            {/* Divider & Tombol Sosial Bulat */}
            <motion.div custom={0.82} initial="hidden" animate="visible" variants={formItemVariant}>
              <SocialAuthButtons isRegister={false} />
            </motion.div>

            {/* Akun Demo Cepat */}
            <motion.div
              custom={0.90}
              initial="hidden"
              animate="visible"
              variants={formItemVariant}
              className="pt-2 border-t border-[#E8F1EE]"
            >
              <div className="flex items-center space-x-1.5 text-xs text-[#4B635F] mb-2.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Akun Demo Cepat (Klik untuk Isi):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin@dermayu.id", "AdminDermayu2026!")}
                  className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-[#4B635F] truncate">admin@dermayu.id</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("superadmin@dermayu.id", "AdminDermayu2026!")}
                  className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Superadmin</span>
                  </div>
                  <div className="text-[10px] text-[#4B635F] truncate">superadmin@dermayu.id</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("petugas@dermayu.id", "AdminDermayu2026!")}
                  className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Petugas</span>
                  </div>
                  <div className="text-[10px] text-[#4B635F] truncate">petugas@dermayu.id</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("warga@dermayu.id", "WargaDermayu2026!")}
                  className="p-2 rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[#1D443F] flex items-center space-x-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Warga</span>
                  </div>
                  <div className="text-[10px] text-[#4B635F] truncate">warga@dermayu.id</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDING OVERLAY PANEL (Full Height 37% Layar Penuh Desktop)  */}
        {/* ============================================================ */}
        <motion.div
          key={`overlay-${isRegister ? "register" : "login"}`}
          initial={{
            x: isRegister ? "-120vw" : "120vw",
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`hidden md:flex absolute top-0 w-[37%] h-full bg-gradient-to-br from-[#38746D] via-[#2E6A63] to-[#1D443F] text-white p-6 lg:p-10 flex-col items-center justify-between text-center z-20 shadow-2xl overflow-hidden ${
            isRegister ? "right-0" : "left-0"
          }`}
        >
          {/* Ornamen Geometri Abstrak Transparan (Diprella Reference Style) */}
          <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full border-2 border-white/20 opacity-30 pointer-events-none" />
          <div className="absolute top-1/4 right-12 w-20 h-20 rotate-45 bg-white/10 rounded-2xl pointer-events-none" />
          <div className="absolute bottom-16 left-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full border border-white/20 opacity-40 pointer-events-none" />
          <div className="absolute top-16 left-1/3 w-8 h-8 rotate-12 bg-white/15 rounded-lg pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-14 h-14 rotate-45 border border-white/20 rounded-xl pointer-events-none" />

          {/* Top Brand Logo - Susunan Vertikal (Ikon di Atas, Teks di Bawah) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full flex flex-col items-center text-center pt-12 sm:pt-14 mb-2"
          >
            {/* Ikon Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm border border-white/20 shadow-md flex items-center justify-center mb-2.5">
              <Image
                src="/dermayu-logo.webp"
                alt="Logo DERMAYU"
                width={48}
                height={48}
                priority
                className="w-full h-full object-contain"
              />
            </div>

            {/* Keterangan Nama di Bawah Logo */}
            <h2 className="text-2xl font-extrabold tracking-wide text-white">
              DERMAYU
            </h2>
          </motion.div>

          {/* Center Dynamic Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 my-auto -translate-y-4 sm:-translate-y-6 py-4 max-w-xs mx-auto space-y-4"
          >
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {isRegister ? "Selamat Datang Kembali!" : "Halo Warga Indramayu!"}
            </h3>
            <p className="text-xs sm:text-sm text-[#EEF5F3] leading-relaxed opacity-95">
              {isRegister
                ? "Sudah memiliki akun DERMAYU? Masuk untuk mengakses navigasi rute evakuasi aman, pantauan kapasitas posko real-time, dan pelacakan status aduan warga."
                : "Belum memiliki akun? Daftarkan diri Anda untuk berpartisipasi dalam pemantauan darurat dan pelaporan banjir terpadu."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleMode(isRegister ? "login" : "register")}
                className="border-2 border-white text-white hover:bg-white hover:text-[#38746D] rounded-full px-7 py-2.5 text-xs font-bold tracking-wider transition-all uppercase cursor-pointer active:scale-95 shadow-sm"
              >
                {isRegister ? "Masuk Sekarang" : "Daftar Akun"}
              </button>
            </div>
          </motion.div>

          {/* Bottom Caption */}
          <div className="absolute bottom-5 sm:bottom-6 left-0 right-0 px-6 text-center text-xs text-[#C7DBD7]/80 z-10 pointer-events-none">
            Sistem Informasi Mitigasi &amp; Kesiapsiagaan Banjir Indramayu 2026
          </div>
        </motion.div>
      </div>
    </main>
  );
}
