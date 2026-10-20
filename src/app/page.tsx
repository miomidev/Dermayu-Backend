"use client";

import { useState } from "react";
import {
  Bell,
  ShieldAlert,
  Cpu,
  Smartphone,
  Database,
  Radio,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  Layers,
  MapPin,
  Flame,
} from "lucide-react";

const ENDPOINTS = [
  {
    name: "Health Check",
    method: "GET",
    path: "/api/v1/health",
    description: "Cek status operasional server backend",
  },
  {
    name: "Kategori Aduan",
    method: "GET",
    path: "/api/v1/categories",
    description: "Daftar kategori pelaporan bencana & infrastruktur",
  },
  {
    name: "Peta Publik",
    method: "GET",
    path: "/api/v1/reports/public",
    description: "Data laporan publik terverifikasi (bebas PII)",
  },
  {
    name: "Dering Evakuasi Aktif",
    method: "GET",
    path: "/api/v1/alerts",
    description: "Peringatan darurat & siaga wilayah terkini",
  },
  {
    name: "Titik Evakuasi",
    method: "GET",
    path: "/api/v1/evacuation-points",
    description: "Posko pengungsian & tempat evakuasi Indramayu",
  },
  {
    name: "Kontak Darurat",
    method: "GET",
    path: "/api/v1/emergency-contacts",
    description: "Nomor darurat BPBD, Damkar, PMI, Polisi",
  },
];

export default function HomePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestApi = async (path: string) => {
    setLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiResponse(
        JSON.stringify(
          {
            error: "Failed to fetch endpoint",
            details: msg,
            note: "Pastikan server backend sedang aktif dan database sudah terkoneksi.",
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-radial from-slate-900 via-slate-950 to-black text-slate-100 antialiased overflow-x-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-teal-500/10 to-orange-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                DERMAYU
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono block -mt-1 tracking-wider">
                CORE API & ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">MySQL 8 Ready</span>
            </div>
            <a
              href="#api-explorer"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 flex items-center space-x-1.5"
            >
              <Code2 className="w-4 h-4" />
              <span>Jelajah API</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-6 backdrop-blur-md">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kabupaten Indramayu • Disaster & Civic Response Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Dering Evakuasi, Respons Warga, &{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
            Aduan Wilayah Terpadu
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pusat API dan manajemen backend untuk menghubungkan aplikasi mobile{" "}
          <strong className="text-slate-200">Flutter</strong>, antarmuka{" "}
          <strong className="text-slate-200">iOS PWA</strong>, dan model{" "}
          <strong className="text-cyan-400">AI CNN</strong> validasi banjir.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group backdrop-blur-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Dering Evakuasi (Alert System)</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Peringatan darurat berprioritas tinggi (*Waspada, Siaga, Awas, Evakuasi*) dengan penargetan berbasis radius GPS dan kecamatan/desa.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-teal-500/40 transition-all group backdrop-blur-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-teal-950/70 border border-teal-800/60 flex items-center justify-center mb-4 text-teal-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Validasi AI CNN Asinkron</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Inferensi non-blocking via model <code className="text-xs bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded font-mono">model_banjir_indramayu.h5</code> untuk mendukung prioritas verifikasi petugas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 transition-all group backdrop-blur-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Cross-Platform Ready</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Arsitektur terpadu melayani klien Flutter Native Android, Warga pengguna iOS via PWA (Web Push VAPID), dan Web Admin desktop.
            </p>
          </div>
        </div>
      </section>

      {/* Live API Explorer Section */}
      <section id="api-explorer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Terminal className="w-4 h-4" />
                <span>Interactive Live Testing</span>
              </div>
              <h2 className="text-2xl font-bold text-white">DERMAYU REST API v1</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Base URL: <code className="text-slate-300">/api/v1</code></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left Column: Endpoint List */}
            <div className="lg:col-span-5 space-y-2">
              <p className="text-xs font-medium text-slate-400 px-1 mb-2">Pilih Endpoint untuk Diuji:</p>
              {ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.path === ep.path;
                return (
                  <button
                    key={ep.path}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setApiResponse(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/30"
                        : "bg-slate-950/40 border-slate-800/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {ep.path}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{ep.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Request Runner & JSON Response */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="p-4 rounded-t-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-teal-400">{selectedEndpoint.method}</span>
                  <span className="text-xs font-mono text-slate-300">{selectedEndpoint.path}</span>
                </div>
                <button
                  onClick={() => handleTestApi(selectedEndpoint.path)}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Activity className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Memproses..." : "Jalankan Tes"}</span>
                </button>
              </div>

              <div className="flex-1 min-h-[300px] p-4 bg-slate-950/90 border-x border-b border-slate-800 rounded-b-xl overflow-auto font-mono text-xs text-slate-300">
                {apiResponse ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{apiResponse}</pre>
                ) : (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Code2 className="w-8 h-8 text-slate-700" />
                    <p>Klik tombol &quot;Jalankan Tes&quot; di atas untuk menguji respons langsung dari endpoint.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Team Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <span className="text-xs text-slate-400 block mb-1">Lead Developer (Romi)</span>
            <span className="font-semibold text-sm text-cyan-400">Mobile + Web + Backend</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <span className="text-xs text-slate-400 block mb-1">AI Engineer</span>
            <span className="font-semibold text-sm text-teal-400">CNN Model (`.h5` Colab)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <span className="text-xs text-slate-400 block mb-1">Administrasi & Dokumen</span>
            <span className="font-semibold text-sm text-amber-400">Proposal & Kemitraan BPBD</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <span className="text-xs text-slate-400 block mb-1">Database Utama</span>
            <span className="font-semibold text-sm text-emerald-400">MySQL 8 (Laragon)</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>DERMAYU Platform — Dering Evakuasi, Respons Masyarakat, dan Aduan Wilayah Indramayu</p>
        <p className="mt-1">Dibuat sesuai dokumen PRD v0.1 • 2026</p>
      </footer>
    </main>
  );
}
