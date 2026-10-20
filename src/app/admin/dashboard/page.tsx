"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Bell,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Cpu,
  User,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Layers,
  Send,
  Building2,
  Flame,
  Phone,
  Droplets,
  Calendar,
  Activity,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AiPrediction {
  id: string;
  label: string;
  confidence: number;
  prob_flood: number;
  prob_non_flood: number;
  model_version: string;
  status: string;
}

interface ReportMedia {
  id: string;
  url: string;
  storage_key: string;
  type: string;
  ai_prediction?: AiPrediction | null;
}

interface ReportItem {
  id: string;
  public_id: string;
  ticket_code: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  water_level?: string | null;
  status: "SUBMITTED" | "VERIFIED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  latitude: number | string;
  longitude: number | string;
  address_text?: string | null;
  occurred_at: string;
  created_at: string;
  category: {
    code: string;
    name: string;
    icon?: string | null;
  };
  reporter: {
    id: string;
    public_id: string;
    full_name: string;
  };
  media: ReportMedia[];
  district?: { name: string } | null;
  village?: { name: string } | null;
}

interface Officer {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Data states
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingVerification: 0,
    inProgress: 0,
    resolved: 0,
    criticalCount: 0,
  });
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Time clock
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth check
  useEffect(() => {
    const storedToken = localStorage.getItem("dermayu_token");
    const storedUserStr = localStorage.getItem("dermayu_user");

    if (!storedToken || !storedUserStr) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(storedUserStr);
      if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        router.push("/auth/login");
        return;
      }
      setCurrentUser(user);
      setToken(storedToken);
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  // Load dashboard data
  const loadDashboardData = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    setRefreshing(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/v1/admin/stats/overview", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data.stats);
      }

      // 2. Fetch Reports
      const reportsRes = await fetch("/api/v1/reports?limit=100", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.data);
      }

      // 3. Fetch Officers
      const officersRes = await fetch("/api/v1/admin/officers", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (officersRes.ok) {
        const officersData = await officersRes.json();
        setOfficers(officersData.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [token]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Actions
  const handleVerify = async (reportId: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/reports/${reportId}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal memverifikasi");

      showToast("Laporan berhasil diverifikasi!");
      setSelectedReport(null);
      loadDashboardData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token || !selectedReport || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/reports/${selectedReport.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal menolak laporan");

      showToast("Laporan telah ditolak.");
      setRejectModalOpen(false);
      setRejectReason("");
      setSelectedReport(null);
      loadDashboardData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!token || !selectedReport || !selectedOfficerId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/reports/${selectedReport.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officerId: selectedOfficerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal menugaskan");

      showToast("Laporan berhasil ditugaskan ke petugas!");
      setAssignModalOpen(false);
      setSelectedOfficerId("");
      setSelectedReport(null);
      loadDashboardData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dermayu_token");
    localStorage.removeItem("dermayu_refresh_token");
    localStorage.removeItem("dermayu_user");
    router.push("/auth/login");
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.address_text && r.address_text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || r.category.code === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Diterima</span>;
      case "VERIFIED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Terverifikasi</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Ditugaskan</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Ditangani</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Selesai</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">Ditolak</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/40 animate-pulse">KRITIS</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">TINGGI</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SEDANG</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300">RENDAH</span>;
    }
  };

  const getWaterLevelLabel = (level?: string | null) => {
    if (!level) return null;
    const map: Record<string, string> = {
      ANKLE: "Mata Kaki",
      KNEE: "Lutut",
      THIGH: "Paha",
      WAIST: "Pinggang",
      ABOVE_CHEST: "Dada ke Atas",
    };
    return map[level] || level;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium border backdrop-blur-md animate-slide-up ${
            toastMsg.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-800"
              : "bg-red-950/90 text-red-300 border-red-800"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Command Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  DERMAYU
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold px-2 py-0.5 rounded-full">
                  PUSAT KOMANDO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Kabupaten Indramayu • Disaster & Civic Response
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">{currentUser?.fullName}</div>
                <div className="text-[10px] text-cyan-400 font-mono font-medium">{currentUser?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar dari sistem"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Operasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pemantauan laporan masyarakat, validasi AI foto banjir, dan Dering Evakuasi wilayah.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span>Segarkan Data</span>
            </button>
            <button
              onClick={() => alert("Modul Dering Evakuasi siap broadcast push ke seluruh perangkat warga.")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-600/25 flex items-center space-x-1.5 transition-all"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kirim Dering Evakuasi</span>
            </button>
          </div>
        </div>

        {/* 5 Statistics Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Laporan</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalReports}</div>
            <div className="text-[10px] text-slate-500 mt-1">Semua kategori masuk</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-300 mb-2">
              <span className="text-xs font-medium">Butuh Verifikasi</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{stats.pendingVerification}</div>
            <div className="text-[10px] text-amber-400/70 mt-1">Status: SUBMITTED</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Sedang Ditangani</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.inProgress}</div>
            <div className="text-[10px] text-slate-500 mt-1">Petugas di lapangan</div>
          </div>

          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-red-300 mb-2">
              <span className="text-xs font-medium">Laporan Kritis</span>
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-red-400">{stats.criticalCount}</div>
            <div className="text-[10px] text-red-400/70 mt-1">Tingkat bahaya tinggi</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Laporan Selesai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats.resolved}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tuntas ditangani</div>
          </div>
        </div>

        {/* Search, Filter, and Reports Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode tiket, judul laporan, wilayah..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUBMITTED">Butuh Verifikasi (Submitted)</option>
                <option value="VERIFIED">Terverifikasi</option>
                <option value="ASSIGNED">Ditugaskan</option>
                <option value="IN_PROGRESS">Sedang Ditangani</option>
                <option value="RESOLVED">Selesai</option>
                <option value="REJECTED">Ditolak</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="FLOOD">Banjir</option>
                <option value="LEVEE">Tanggul Jebol</option>
                <option value="DRAINAGE">Drainase</option>
                <option value="ROAD">Jalan Rusak</option>
                <option value="TREE">Pohon Tumbang</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Kode Tiket & Tanggal</th>
                  <th className="py-3.5 px-4">Kategori & Keparahan</th>
                  <th className="py-3.5 px-4">Judul & Lokasi</th>
                  <th className="py-3.5 px-4">Validasi AI CNN</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => {
                    const latestPrediction = report.media?.[0]?.ai_prediction;
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-cyan-300 block">
                            {report.ticket_code}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(report.occurred_at || report.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span className="font-semibold text-slate-200">
                              {report.category.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {getSeverityBadge(report.severity)}
                            {report.water_level && (
                              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                🌊 {getWaterLevelLabel(report.water_level)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-white truncate">{report.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>
                              {report.district?.name ? `Kec. ${report.district.name}` : report.address_text || "Koordinat GPS"}
                            </span>
                          </div>
                        </td>

                        {/* AI Score Column */}
                        <td className="py-3.5 px-4">
                          {latestPrediction ? (
                            latestPrediction.label === "flood" ? (
                              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-950/60 text-teal-300 border border-teal-500/40">
                                <Cpu className="w-3 h-3 text-teal-400" />
                                <span>Banjir ({Math.round(latestPrediction.confidence * 100)}%)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                <Cpu className="w-3 h-3 text-slate-400" />
                                <span>Non-Banjir ({Math.round(latestPrediction.confidence * 100)}%)</span>
                              </div>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Belum Diproses</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(report.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Tidak ada laporan yang sesuai dengan filter atau kata kunci.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-bold text-cyan-400">
                    {selectedReport.ticket_code}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                  {getSeverityBadge(selectedReport.severity)}
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedReport.category.name}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Media Image Showcase */}
            {selectedReport.media && selectedReport.media.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">Bukti Foto Pelapor:</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReport.media.map((m, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video group">
                      <img
                        src={m.url}
                        alt="Foto Laporan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          // Fallback placeholder if image not uploaded to disk yet
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      {m.ai_prediction && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-teal-300 border border-teal-500/40 flex items-center space-x-1">
                          <Cpu className="w-3 h-3 text-teal-400" />
                          <span>AI: {m.ai_prediction.label} ({Math.round(m.ai_prediction.confidence * 100)}%)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Content */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h3 className="font-bold text-white text-base">{selectedReport.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedReport.description || "Tidak ada deskripsi rinci."}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Ketinggian Air:</span>
                  <span className="font-semibold text-cyan-300">
                    {getWaterLevelLabel(selectedReport.water_level) || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Waktu Kejadian:</span>
                  <span className="text-slate-200">
                    {new Date(selectedReport.occurred_at || selectedReport.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Titik Lokasi:</span>
                  <div className="flex items-center justify-between text-slate-200 mt-0.5">
                    <span>
                      {selectedReport.address_text || `Lat: ${selectedReport.latitude}, Lng: ${selectedReport.longitude}`}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <span>Buka Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {selectedReport.status === "SUBMITTED" && (
                <>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Tolak Laporan
                  </button>
                  <button
                    onClick={() => handleVerify(selectedReport.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/25 disabled:opacity-50"
                  >
                    {actionLoading ? "Memverifikasi..." : "Verifikasi Laporan"}
                  </button>
                </>
              )}

              {selectedReport.status === "VERIFIED" && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 disabled:opacity-50"
                >
                  Tugaskan Petugas Lapangan
                </button>
              )}

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Tolak Laporan Warga</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sesuai aturan PRD (FR-ADM-04), penolakan wajib menyertakan alasan yang jelas karena akan diteruskan kepada pelapor.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Foto tidak jelas / Bukan di wilayah Kabupaten Indramayu / Laporan palsu"
              className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || rejectReason.trim().length < 5}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-purple-400" />
              <span>Tugaskan Petugas Lapangan</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pilih petugas lapangan atau relawan TRC yang akan menerima notifikasi penugasan ini.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pilih Petugas:</label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Pilih dari Petugas Aktif --</option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.full_name} ({off.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedOfficerId}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {actionLoading ? "Menugaskan..." : "Kirim Penugasan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
