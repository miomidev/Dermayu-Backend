"use client";
import { getActiveSession, clearUserSession } from "@/utils/authSession";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Radio,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Cpu,
  User,
  LogOut,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  ExternalLink,
  Layers,
  Flame,
  Activity,
  Map as MapIcon,
  Table as TableIcon,
  ShieldAlert,
  Send,
  Building2,
  X,
  Menu,
  ChevronRight,
  Phone,
  Users,
  ShieldCheck,
  Home,
  Plus,
  Compass,
  Download,
  FileText,
} from "lucide-react";

// Dynamically import Leaflet CommandMap with SSR disabled
const CommandMap = dynamic(() => import("@/components/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-500 space-y-2">
      <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      <span className="text-xs">Memuat Peta Spasial Indramayu (Leaflet)...</span>
    </div>
  ),
});

type SidebarMenu = "DASHBOARD" | "REPORTS" | "MAP" | "ALERTS" | "EVACUATION" | "CONTACTS" | "USERS" | "AUDIT";

interface AuditLogItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  metadata?: string | null;
  created_at: string;
  actor?: {
    id: string;
    public_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

interface UserProfile {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  role: "CITIZEN" | "OFFICER" | "ADMIN" | "SUPERADMIN";
  district?: string;
  phone?: string;
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

interface EvacPoint {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  capacity: number;
  facilities?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
}

interface AlertItem {
  id: string;
  public_id: string;
  title: string;
  message: string;
  level: "WASPADA" | "SIAGA" | "AWAS" | "EVAKUASI";
  status: string;
  created_at: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description?: string | null;
}

interface ManagedUser {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Sidebar State
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>("DASHBOARD");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingVerification: 0,
    inProgress: 0,
    resolved: 0,
    criticalCount: 0,
    totalCitizens: 0,
    activeAlerts: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{ name: string; count: number }>>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [evacPoints, setEvacPoints] = useState<EvacPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");

  // Modals State
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");

  // Dering Evakuasi Broadcast Modal State
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: "",
    message: "",
    level: "SIAGA" as "WASPADA" | "SIAGA" | "AWAS" | "EVAKUASI",
    targetType: "ALL" as "ALL" | "DISTRICT",
    selectedDistrictId: "",
    selectedEvacId: "",
  });

  // Create User Modal State (Superadmin)
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "OFFICER" as "OFFICER" | "ADMIN",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
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
    const activeSession = getActiveSession();

    if (!storedToken && !activeSession) {
      router.push("/login");
      return;
    }

    try {
      let user: any = null;
      if (storedUserStr) {
        user = JSON.parse(storedUserStr);
      } else if (activeSession) {
        user = {
          name: activeSession.name,
          fullName: activeSession.name,
          email: activeSession.email,
          role: activeSession.role,
          district: activeSession.district,
        };
      }

      const roleUpper = (user?.role || activeSession?.role || "").toUpperCase();
      if (roleUpper !== "ADMIN" && roleUpper !== "SUPERADMIN") {
        router.push("/login");
        return;
      }

      const resolvedUser: UserProfile = {
        id: String(user.id || "1"),
        fullName: user.fullName || user.name || activeSession?.name || "Super Admin DERMAYU",
        name: user.name || user.fullName || activeSession?.name || "Super Admin DERMAYU",
        email: user.email || activeSession?.email || "superadmin@dermayu.id",
        role: "SUPERADMIN",
        district: user.district || activeSession?.district,
        phone: user.phone,
      };

      setCurrentUser(resolvedUser);
      setToken(storedToken || "demo_token");
    } catch {
      router.push("/login");
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
        setCategoryBreakdown(statsData.data.categoryBreakdown || []);
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

      // 4. Fetch Evacuation Points
      const evacRes = await fetch("/api/v1/evacuation-points");
      if (evacRes.ok) {
        const evacData = await evacRes.json();
        setEvacPoints(evacData.data);
      }

      // 5. Fetch Alerts
      const alertsRes = await fetch("/api/v1/alerts");
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data);
      }

      // 6. Fetch Emergency Contacts
      const contactsRes = await fetch("/api/v1/emergency-contacts");
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setEmergencyContacts(contactsData.data);
      }

      // 7. Fetch Districts
      const distRes = await fetch("/api/v1/regions/districts");
      if (distRes.ok) {
        const distData = await distRes.json();
        setDistricts(distData.data);
      }

      // 8. If Superadmin, fetch users
      if (currentUser?.role === "SUPERADMIN") {
        const usersRes = await fetch("/api/v1/admin/users", {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setManagedUsers(usersData.data);
        }
      }

      // 9. Fetch Audit Logs
      const logsRes = await fetch("/api/v1/admin/audit-logs", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
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

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!alertForm.title || !alertForm.message) {
      showToast("Judul dan pesan Dering wajib diisi", "error");
      return;
    }

    setActionLoading(true);
    try {
      const payload: Record<string, any> = {
        title: alertForm.title,
        message: alertForm.message,
        level: alertForm.level,
        targetType: alertForm.targetType,
      };

      if (alertForm.targetType === "DISTRICT" && alertForm.selectedDistrictId) {
        payload.districtIds = [alertForm.selectedDistrictId];
      }
      if (alertForm.selectedEvacId) {
        payload.evacuationPointIds = [alertForm.selectedEvacId];
      }

      const res = await fetch("/api/v1/admin/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal menyiarkan Dering");

      showToast("🚨 Dering Evakuasi berhasil disiarkan ke seluruh perangkat warga!");
      setAlertModalOpen(false);
      setAlertForm({
        title: "",
        message: "",
        level: "SIAGA",
        targetType: "ALL",
        selectedDistrictId: "",
        selectedEvacId: "",
      });
      loadDashboardData();
      setActiveMenu("ALERTS");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal membuat pengguna");

      showToast(`Akun ${newUserForm.role} baru berhasil dibuat!`);
      setCreateUserModalOpen(false);
      setNewUserForm({ fullName: "", email: "", password: "", role: "OFFICER" });
      loadDashboardData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndAlert = async (alertId: string) => {
    if (!token) return;
    if (!confirm("Apakah Anda yakin ingin menyatakan Dering Evakuasi ini telah berakhir?")) return;

    try {
      const res = await fetch(`/api/v1/admin/alerts/${alertId}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Dering Evakuasi dinyatakan berakhir");
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    localStorage.removeItem("dermayu_token");
    localStorage.removeItem("dermayu_refresh_token");
    localStorage.removeItem("dermayu_user");
    router.push("/login");
  };

  const handleExportCsv = async () => {
    if (!token) return;
    setExportingCsv(true);
    try {
      showToast("Sedang menyiapkan file CSV laporan...");
      const url = `/api/v1/admin/export/reports?status=${statusFilter}&category=${categoryFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh CSV");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.download = `rekap-laporan-dermayu-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast("File CSV rekapan laporan berhasil diunduh!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal mengunduh CSV", "error");
    } finally {
      setExportingCsv(false);
    }
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

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter === "ALL") return true;
    return log.action === auditActionFilter;
  });

  const getAuditActionBadge = (action: string) => {
    switch (action) {
      case "VERIFY_REPORT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">VERIFIKASI</span>;
      case "REJECT_REPORT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">PENOLAKAN</span>;
      case "ASSIGN_REPORT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">PENUGASAN</span>;
      case "BROADCAST_ALERT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800 animate-pulse">SIARAN DERING</span>;
      case "END_ALERT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">AKHIRI DERING</span>;
      case "CREATE_USER":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">BUAT USER</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{action}</span>;
    }
  };

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

  const getAlertLevelBadge = (level: string) => {
    switch (level) {
      case "EVAKUASI":
        return <span className="px-2.5 py-1 rounded-md text-xs font-black bg-red-600 text-white animate-pulse">🚨 EVAKUASI</span>;
      case "AWAS":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-950 text-red-300 border border-red-800">⚠️ AWAS</span>;
      case "SIAGA":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-950 text-orange-300 border border-orange-800">⚡ SIAGA</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">🔔 WASPADA</span>;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
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

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800/80 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent block">
                DERMAYU
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono -mt-1 block font-medium">
                PUSAT KOMANDO
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Group 1: Operasional Utama */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 px-3 tracking-wider uppercase mb-1.5">
              Komando Utama
            </div>

            <button
              onClick={() => {
                setActiveMenu("DASHBOARD");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "DASHBOARD"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Home className="w-4 h-4" />
                <span>Dashboard & Metrik</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveMenu("REPORTS");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "REPORTS"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <TableIcon className="w-4 h-4" />
                <span>Antrean Laporan</span>
              </div>
              {stats.pendingVerification > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.pendingVerification}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveMenu("MAP");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "MAP"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <MapIcon className="w-4 h-4" />
                <span>Peta Spasial (Leaflet)</span>
              </div>
            </button>
          </div>

          {/* Group 2: Respons & Darurat */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 px-3 tracking-wider uppercase mb-1.5">
              Respons & Evakuasi
            </div>

            <button
              onClick={() => {
                setActiveMenu("ALERTS");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "ALERTS"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4 text-red-400" />
                <span>Dering Evakuasi</span>
              </div>
              {alerts.filter((a) => a.status === "ACTIVE").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  {alerts.filter((a) => a.status === "ACTIVE").length} Aktif
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveMenu("EVACUATION");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "EVACUATION"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Posko Pengungsian</span>
              </div>
              <span className="text-[10px] text-slate-500">{evacPoints.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu("CONTACTS");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "CONTACTS"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>Kontak Darurat</span>
              </div>
            </button>
          </div>

          {/* Group 3: Administrasi & Akun */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 px-3 tracking-wider uppercase mb-1.5">
              Administrasi Sistem
            </div>

            <button
              onClick={() => {
                setActiveMenu("USERS");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "USERS"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Manajemen Pengguna</span>
              </div>
              {currentUser?.role === "SUPERADMIN" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  SUPER
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveMenu("AUDIT");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeMenu === "AUDIT"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Log Audit Sistem</span>
              </div>
              <span className="text-[10px] text-slate-500">{auditLogs.length}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Current User Profile Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 border border-cyan-800/50">
                {(currentUser?.fullName || currentUser?.name || "A").charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || "Super Admin"}</div>
                <div className="text-[10px] text-cyan-400 font-mono font-medium truncate">
                  {currentUser?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari sistem"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Pusat Komando</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-cyan-400 uppercase tracking-wide">
                {activeMenu}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-all"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-red-600/25 flex items-center space-x-1.5 transition-all"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim Dering Evakuasi</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views based on activeMenu */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full">
          {/* VIEW 1: DASHBOARD & METRIK OVERVIEW */}
          {activeMenu === "DASHBOARD" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Laporan</span>
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{stats.totalReports}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Semua aduan masuk</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-amber-300 mb-2">
                    <span className="text-xs font-medium">Butuh Verifikasi</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-300">{stats.pendingVerification}</div>
                  <div className="text-[10px] text-amber-400/70 mt-1">Status SUBMITTED</div>
                </div>

                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-red-300 mb-2">
                    <span className="text-xs font-medium">Laporan Kritis</span>
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-red-400">{stats.criticalCount}</div>
                  <div className="text-[10px] text-red-400/70 mt-1">Butuh evakuasi segera</div>
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

              {/* Quick Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown Card */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Distribusi Jenis Kejadian</h3>
                    <span className="text-xs text-slate-500 font-mono">Real-time</span>
                  </div>
                  <div className="space-y-2">
                    {categoryBreakdown.length > 0 ? (
                      categoryBreakdown.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                          <span className="text-slate-300 font-medium">{cat.name}</span>
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                            {cat.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 py-4 text-center">Belum ada data kejadian tercatat.</div>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
                  <h3 className="text-sm font-bold text-white">Pintasan Cepat Komando</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveMenu("REPORTS")}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
                    >
                      <TableIcon className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-white">Periksa Antrean</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Tinjau laporan warga & skor AI</div>
                    </button>

                    <button
                      onClick={() => setActiveMenu("MAP")}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 text-left transition-all group"
                    >
                      <MapIcon className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-white">Peta Sebaran</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Cek titik luapan air Indramayu</div>
                    </button>

                    <button
                      onClick={() => setAlertModalOpen(true)}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-red-500/50 text-left transition-all group"
                    >
                      <Flame className="w-5 h-5 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-white">Broadcast Dering</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Kirim push darurat ke warga</div>
                    </button>

                    <button
                      onClick={() => setActiveMenu("EVACUATION")}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                    >
                      <Building2 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-white">Posko Pengungsian</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Pantau kapasitas tempat evakuasi</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ANTREAN LAPORAN (TABLE) */}
          {activeMenu === "REPORTS" && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-5 animate-fade-in">
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
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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

                  <button
                    onClick={handleExportCsv}
                    disabled={exportingCsv}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer whitespace-nowrap"
                    title="Ekspor seluruh laporan terfilter ke file CSV"
                  >
                    <Download className={`w-3.5 h-3.5 ${exportingCsv ? "animate-bounce" : ""}`} />
                    <span>{exportingCsv ? "Mengekspor..." : "Ekspor CSV"}</span>
                  </button>
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
          )}

          {/* VIEW 3: PETA SPASIAL LEAFLET */}
          {activeMenu === "MAP" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>Peta Spasial Komando Indramayu</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Visualisasi sebaran laporan real-time dan titik posko pengungsian di atas peta OpenStreetMap.
                  </p>
                </div>
              </div>

              <CommandMap
                reports={reports}
                evacuationPoints={evacPoints}
                onSelectReport={(report) => {
                  const fullReport = reports.find((r) => r.id === report.id);
                  if (fullReport) setSelectedReport(fullReport);
                }}
              />
            </div>
          )}

          {/* VIEW 4: DERING EVAKUASI HISTORY */}
          {activeMenu === "ALERTS" && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-red-500" />
                    <span>Riwayat Siaran Dering Evakuasi</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daftar broadcast peringatan bencana yang dikirimkan ke perangkat warga Indramayu.
                  </p>
                </div>
                <button
                  onClick={() => setAlertModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center space-x-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Buat Siaran Baru</span>
                </button>
              </div>

              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        al.status === "ACTIVE"
                          ? "bg-red-950/20 border-red-800/50"
                          : "bg-slate-950/40 border-slate-800/60 opacity-80"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          {getAlertLevelBadge(al.level)}
                          <span className="font-bold text-white text-sm">{al.title}</span>
                          {al.status === "ACTIVE" ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                              SEDANG AKTIF
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              BERAKHIR
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{al.message}</p>
                        <div className="text-[10px] text-slate-500">
                          Disiarkan: {new Date(al.created_at).toLocaleString("id-ID")}
                        </div>
                      </div>

                      {al.status === "ACTIVE" && (
                        <button
                          onClick={() => handleEndAlert(al.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all self-start md:self-center shrink-0"
                        >
                          Hentikan Peringatan
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Belum ada Dering Evakuasi yang pernah disiarkan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: POSKO PENGUNGSIAN */}
          {activeMenu === "EVACUATION" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Daftar Titik Posko Evakuasi Indramayu</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fasilitas evakuasi resmi, kapasitas pengungsian, dan kontak penanggung jawab lapangan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evacPoints.map((ep) => (
                  <div key={ep.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Posko Pengungsian</span>
                        <h3 className="font-bold text-base text-white">{ep.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {ep.capacity} Jiwa
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{ep.address}</span>
                    </div>

                    {ep.contact_phone && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500">PIC: {ep.contact_name || "Koordinator"}</span>
                        <a
                          href={`tel:${ep.contact_phone}`}
                          className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{ep.contact_phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 6: KONTAK DARURAT */}
          {activeMenu === "CONTACTS" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <span>Daftar Kontak Cepat Tanggap Darurat</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nomor hotline instansi tanggap darurat dan penanggulangan bencana Kabupaten Indramayu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <h3 className="font-bold text-sm text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.description || "Layanan Darurat"}</p>
                    <div className="pt-2">
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-bold hover:bg-cyan-900 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Hubungi {c.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: MANAJEMEN PENGGUNA (SUPERADMIN) */}
          {activeMenu === "USERS" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Manajemen Pengguna & Petugas (Superadmin)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kelola akun operator, admin, dan petugas lapangan sesuai izin RBAC Bab 5.2 PRD.
                  </p>
                </div>

                {currentUser?.role === "SUPERADMIN" && (
                  <button
                    onClick={() => setCreateUserModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Petugas / Admin</span>
                  </button>
                )}
              </div>

              {currentUser?.role === "SUPERADMIN" ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">Email / Kontak</th>
                        <th className="py-3 px-4">Peran (Role)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {managedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-white">{u.full_name}</td>
                          <td className="py-3 px-4 text-slate-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-400 font-medium">● Aktif</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(u.created_at).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="font-bold text-white text-sm">Akses Terbatas: Hanya Super Admin</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Sesuai matriks RBAC PRD Bab 5.2: Hanya pengguna dengan peran `SUPERADMIN` yang berhak membuat atau mengelola akun Admin dan Petugas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 8: LOG AUDIT SISTEM (ADMIN & SUPERADMIN) */}
          {activeMenu === "AUDIT" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Log Audit & Integritas Sistem</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rekaman audit jejak aktivitas krusial operasional, verifikasi laporan, penugasan, dan siaran Dering Evakuasi (PRD Bab 12).
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">Semua Aksi Audit</option>
                    <option value="VERIFY_REPORT">Verifikasi Laporan</option>
                    <option value="REJECT_REPORT">Penolakan Laporan</option>
                    <option value="ASSIGN_REPORT">Penugasan Petugas</option>
                    <option value="BROADCAST_ALERT">Siaran Dering Evakuasi</option>
                    <option value="END_ALERT">Pengakhiran Dering</option>
                    <option value="CREATE_USER">Pembuatan Akun User</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Waktu (WIB)</th>
                      <th className="py-3.5 px-4">Aksi Audit</th>
                      <th className="py-3.5 px-4">Aktor / Admin</th>
                      <th className="py-3.5 px-4">Entitas & Target</th>
                      <th className="py-3.5 px-4">Detail & Catatan</th>
                      <th className="py-3.5 px-4">IP / Perangkat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          Belum ada log audit yang sesuai filter
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => {
                        let parsedMeta: any = null;
                        try {
                          if (log.metadata) parsedMeta = JSON.parse(log.metadata);
                        } catch {}

                        return (
                          <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString("id-ID", {
                                dateStyle: "short",
                                timeStyle: "medium",
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              {getAuditActionBadge(log.action)}
                            </td>
                            <td className="py-3.5 px-4">
                              {log.actor ? (
                                <div>
                                  <div className="font-bold text-white text-xs">{log.actor.full_name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{log.actor.email}</div>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Sistem Otomatis</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              {parsedMeta ? (
                                <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
                                  {Object.entries(parsedMeta).map(([k, v]) => (
                                    <div key={k} className="truncate">
                                      <span className="text-cyan-400/90">{k}:</span>{" "}
                                      <span className="text-slate-200">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[11px]">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                              <div>{log.ip || "127.0.0.1"}</div>
                              <div className="truncate max-w-[140px] text-slate-600" title={log.user_agent || undefined}>
                                {log.user_agent ? log.user_agent.split(" ")[0] : "Browser/API"}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CREATE USER (SUPERADMIN ONLY) */}
      {createUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Tambah Akun Petugas / Admin</span>
              </h3>
              <button
                onClick={() => setCreateUserModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="Contoh: Petugas TRC Sindang"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Resmi:</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="petugas.trc@dermayu.id"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi Awal:</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Peran Akses (Role):</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="OFFICER">Petugas Lapangan / Relawan TRC (OFFICER)</option>
                  <option value="ADMIN">Admin Operator Komando (ADMIN)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Membuat..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DERING EVAKUASI BROADCAST MODAL */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/70 flex items-center justify-center text-red-500">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Siarkan Dering Evakuasi</h3>
                  <p className="text-xs text-slate-400">Peringatan darurat berbasis wilayah (Push FCM & PWA)</p>
                </div>
              </div>
              <button
                onClick={() => setAlertModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tingkat Status Peringatan:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["WASPADA", "SIAGA", "AWAS", "EVAKUASI"] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setAlertForm({ ...alertForm, level: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        alertForm.level === lvl
                          ? lvl === "EVAKUASI"
                            ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                            : lvl === "AWAS"
                            ? "bg-red-950 text-red-300 border-red-600"
                            : lvl === "SIAGA"
                            ? "bg-orange-950 text-orange-300 border-orange-600"
                            : "bg-amber-950 text-amber-300 border-amber-600"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Judul Peringatan:
                </label>
                <input
                  type="text"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="Contoh: SIAGA BANJIR LUAPAN SUNGAI CIMANUK"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Instruksi & Pesan Evakuasi untuk Warga:
                </label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Instruksikan warga untuk mengamankan barang berharga dan segera mengungsi ke posko yang telah ditentukan..."
                  required
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Wilayah Penyiaran:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setAlertForm({ ...alertForm, targetType: "ALL" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      alertForm.targetType === "ALL"
                        ? "bg-cyan-950 text-cyan-300 border-cyan-600"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    Seluruh Kab. Indramayu
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertForm({ ...alertForm, targetType: "DISTRICT" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      alertForm.targetType === "DISTRICT"
                        ? "bg-cyan-950 text-cyan-300 border-cyan-600"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    Pilih Kecamatan Tertentu
                  </button>
                </div>

                {alertForm.targetType === "DISTRICT" && (
                  <select
                    value={alertForm.selectedDistrictId}
                    onChange={(e) => setAlertForm({ ...alertForm, selectedDistrictId: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Kecamatan Target --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        Kecamatan {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rujukan Titik Posko Evakuasi:
                </label>
                <select
                  value={alertForm.selectedEvacId}
                  onChange={(e) => setAlertForm({ ...alertForm, selectedEvacId: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Sertakan Posko Evakuasi Terdekat --</option>
                  {evacPoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.name} (Kapasitas: {ep.capacity} jiwa)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-red-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{actionLoading ? "Menyiarkan..." : "Konfirmasi & Siarkan Dering"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6 animate-scale-up">
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

      {/* REJECT MODAL */}
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

      {/* ASSIGN MODAL */}
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
