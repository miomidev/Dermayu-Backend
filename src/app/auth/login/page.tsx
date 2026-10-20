"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg("Mohon isi email/nomor HP dan kata sandi");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Login gagal. Periksa kembali identitas Anda.");
      }

      // Store tokens and user info
      localStorage.setItem("dermayu_token", json.data.tokens.accessToken);
      localStorage.setItem("dermayu_refresh_token", json.data.tokens.refreshToken);
      localStorage.setItem("dermayu_user", JSON.stringify(json.data.user));

      // Redirect based on role
      const role = json.data.user.role;
      if (role === "ADMIN" || role === "SUPERADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (emailVal: string, passVal: string) => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/25 via-teal-500/15 to-orange-500/10 blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] shadow-xl shadow-cyan-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            DERMAYU
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Pusat Komando & Portal Masuk Terpadu Indramayu
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Masuk ke Akun</h2>
              <p className="text-xs text-slate-400 mt-0.5">Warga, Petugas, dan Administrator</p>
            </div>
            <div className="flex items-center space-x-1 text-[11px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>TLS Enkripsi</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email atau Nomor HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@dermayu.id atau 0812..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
                <span className="text-[11px] text-cyan-400/80 hover:text-cyan-300 cursor-pointer">
                  Lupa sandi?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/35 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Autofill Chips */}
          <div className="mt-7 pt-5 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Akun Demo Cepat (Klik untuk Isi):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@dermayu.id", "AdminDermayu2026!")}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all"
              >
                <div className="font-semibold text-cyan-300 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Admin Operator</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@dermayu.id</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("superadmin@dermayu.id", "AdminDermayu2026!")}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 hover:bg-teal-950/20 text-left transition-all"
              >
                <div className="font-semibold text-teal-300 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">superadmin@dermayu.id</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("petugas@dermayu.id", "AdminDermayu2026!")}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/20 text-left transition-all"
              >
                <div className="font-semibold text-amber-300 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Petugas Lapangan</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">petugas@dermayu.id</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("warga@dermayu.id", "WargaDermayu2026!")}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-left transition-all"
              >
                <div className="font-semibold text-slate-300 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Warga Contoh</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">warga@dermayu.id</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Kabupaten Indramayu • DERMAYU Platform
        </p>
      </div>
    </div>
  );
}
