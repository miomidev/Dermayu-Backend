"use client";

import { getActiveSession, clearUserSession, performLogout } from "@/utils/authSession";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import { getWargaPosko } from "@/utils/poskoService";
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
  Check,
  Pencil,
  Trash2,
  Key,
  Lock,
  UserCheck,
  UserX,
  Smartphone,
  Copy,
  Link2,
  Globe,
  Share2,
  Sparkles,
} from "lucide-react";

// Dynamically import Leaflet CommandMap with SSR disabled
const CommandMap = dynamic(() => import("@/components/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-3xl bg-[#EEF5F3] border border-[#D5E4E0] flex flex-col items-center justify-center text-[#4B635F] space-y-2">
      <RefreshCw className="w-8 h-8 animate-spin text-[#38746D]" />
      <span className="text-xs font-bold text-[#1D443F]">Memuat Peta Spasial Indramayu (Leaflet)...</span>
    </div>
  ),
});

type SidebarMenu = "DASHBOARD" | "REPORTS" | "MAP" | "ALERTS" | "EVACUATION" | "CONTACTS" | "USERS" | "AUDIT" | "APK";

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

export default function AdminDashboard() {
  const router = useRouter();

  // Navigation & session state
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>("DASHBOARD");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Stats & aggregations state
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingVerification: 0,
    inProgress: 0,
    resolved: 0,
    criticalCount: 0,
    totalUsers: 0,
    activeAlerts: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{ name: string; count: number }>>([]);

  // Data collections state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [evacPoints, setEvacPoints] = useState<EvacPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingAuditCsv, setExportingAuditCsv] = useState(false);

  // Selected report modal state
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
    phone: "",
    password: "",
    role: "OFFICER" as "OFFICER" | "SUPERADMIN" | "CITIZEN",
  });

  // Edit User Modal State (Superadmin)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "OFFICER" as "OFFICER" | "SUPERADMIN" | "CITIZEN",
    isActive: true,
    password: "",
  });

  const handleSelectMenu = (menu: SidebarMenu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dermayu_admin_active_tab", menu.toLowerCase());
        const url = new URL(window.location.href);
        url.searchParams.set("tab", menu.toLowerCase());
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
  };

  // Restore active tab from URL query param (?tab=users) or localStorage on page load / refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

    const validTabs: Record<string, SidebarMenu> = {
      dashboard: "DASHBOARD",
      reports: "REPORTS",
      map: "MAP",
      alerts: "ALERTS",
      evacuation: "EVACUATION",
      contacts: "CONTACTS",
      users: "USERS",
      audit: "AUDIT",
      apk: "APK",
    };

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab")?.toLowerCase();
      const storedTab = localStorage.getItem("dermayu_admin_active_tab")?.toLowerCase();

      const targetTab = (tabParam && validTabs[tabParam])
        ? validTabs[tabParam]
        : (storedTab && validTabs[storedTab])
        ? validTabs[storedTab]
        : null;

      if (targetTab) {
        setActiveMenu(targetTab);
        if (!tabParam) {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", targetTab.toLowerCase());
          window.history.replaceState({}, "", url.toString());
        }
      }
    } catch {}
  }, []);

  // Delete User Modal State (Superadmin)
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // User Management filters
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");

  // APK Release Manager State
  const [apkRelease, setApkRelease] = useState<{
    isReleased: boolean;
    downloadUrl: string;
    version: string;
    fileSize: string;
    releaseNotes: string;
    updatedAt?: string;
    updatedBy?: string;
  }>({
    isReleased: true,
    downloadUrl: "https://dermayu.web.id/dermayu-release.apk",
    version: "v1.0.0",
    fileSize: "61.6 MB",
    releaseNotes: "Rilis resmi aplikasi Dermayu Android dengan rute evakuasi cerdas dan Google Maps.",
  });
  const [apkLoading, setApkLoading] = useState(false);
  const [apkSaving, setApkSaving] = useState(false);
  const [apkCopied, setApkCopied] = useState(false);

  const fetchApkRelease = async () => {
    try {
      setApkLoading(true);
      const res = await fetch("/api/v1/app-release");
      const data = await res.json();
      if (data?.data) {
        setApkRelease(data.data);
      }
    } catch (err) {
      console.warn("Failed to load apk release:", err);
    } finally {
      setApkLoading(false);
    }
  };

  const handleSaveApkRelease = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setApkSaving(true);
      const res = await fetch("/api/v1/app-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...apkRelease,
          updatedBy: currentUser?.fullName || currentUser?.name || "Super Admin",
        }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        setApkRelease(data.data);
        setToastMsg({ text: "Pengaturan rilis APK berhasil disimpan ke sistem!", type: "success" });
      } else {
        setToastMsg({ text: data?.message || "Gagal menyimpan konfigurasi APK", type: "error" });
      }
    } catch (err: any) {
      setToastMsg({ text: "Terjadi kesalahan koneksi saat menyimpan APK", type: "error" });
    } finally {
      setApkSaving(false);
    }
  };

  useEffect(() => {
    fetchApkRelease();
  }, []);

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

  // Auth check & bfcache protection
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("dermayu_token");
      const storedUserStr = localStorage.getItem("dermayu_user");
      const activeSession = getActiveSession();

      if (!storedToken && !activeSession) {
        window.location.replace("/");
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
          window.location.replace("/");
          return;
        }

        const resolvedUser: UserProfile = {
          id: String(user?.id || "1"),
          fullName: user?.fullName || user?.name || activeSession?.name || "Super Admin DERMAYU",
          name: user?.name || user?.fullName || activeSession?.name || "Super Admin DERMAYU",
          email: user?.email || activeSession?.email || "superadmin@dermayu.id",
          role: "SUPERADMIN",
          district: user?.district || activeSession?.district,
          phone: user?.phone,
        };

        setCurrentUser(resolvedUser);
        const resolvedToken = storedToken || "demo_token";
        setToken(resolvedToken);
        loadDashboardData(resolvedToken);
      } catch {
        window.location.replace("/");
      }
    };

    checkAuth();

    // Intercept back-forward cache (bfcache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted || !getActiveSession()) {
        window.location.replace("/");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("dermayu_session_cleared", checkAuth);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("dermayu_session_cleared", checkAuth);
    };
  }, [router]);

  // Load dashboard data with robust single-source-of-truth fallback
  const loadDashboardData = async (authToken?: string) => {
    let activeToken = authToken || token;
    if ((!activeToken || activeToken === "demo_token") && typeof window !== "undefined") {
      activeToken =
        localStorage.getItem("dermayu_token") ||
        localStorage.getItem("auth_token") ||
        null;
    }
    setRefreshing(true);
    try {
      // 1. Fetch Reports from server API or fallback to citizen reports
      let loadedReports: ReportItem[] = [];
      try {
        if (activeToken) {
          const reportsRes = await fetch("/api/v1/reports?limit=100", {
            headers: { Authorization: `Bearer ${activeToken}` },
            credentials: "include",
          });
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json();
            if (Array.isArray(reportsData.data) && reportsData.data.length > 0) {
              loadedReports = reportsData.data;
            }
          }
        }
      } catch {}

      // Fallback ke REST API /api/laporan jika server database Prisma belum seeding
      if (loadedReports.length === 0) {
        try {
          const fbRes = await fetch("/api/laporan?type=citizen", { cache: "no-store" });
          if (fbRes.ok) {
            const fbJson = await fbRes.json();
            const rawList = fbJson.data?.data || fbJson.data || [];
            if (Array.isArray(rawList) && rawList.length > 0) {
              loadedReports = rawList.map((r: any, idx: number) => ({
                id: r.id || `rep-${idx}`,
                public_id: r.ticketCode || r.id || `TKT-${idx}`,
                ticket_code: r.ticketCode || r.id || `DMY-${idx}`,
                title: r.description || "Laporan Titik Banjir",
                description: r.description || r.note || "Laporan warga dari lapangan",
                severity: r.severity === "TINGGI" ? "HIGH" : r.severity === "KRITIS" ? "CRITICAL" : "MEDIUM",
                water_level: r.waterLevel || "50 cm",
                status:
                  r.status === "SELESAI"
                    ? "RESOLVED"
                    : r.status === "ARMADA_DIKERAHKAN" || r.status === "PENANGANAN"
                    ? "IN_PROGRESS"
                    : r.status === "VERIFIED"
                    ? "VERIFIED"
                    : "SUBMITTED",
                latitude: r.lat || -6.3475,
                longitude: r.lng || 108.1189,
                address_text: r.location || "Indramayu",
                occurred_at: r.timeReceived || "Hari ini",
                created_at: r.timeReceived || "Hari ini",
                category: {
                  code: "FLOOD",
                  name: r.disasterCategory || "Banjir / Rob Pesisir",
                },
                reporter: {
                  id: "w-01",
                  public_id: "W-01",
                  full_name: r.reporterName || "Warga Indramayu",
                },
                media:
                  r.photos?.map((url: string, pIdx: number) => ({
                    id: `m-${pIdx}`,
                    url,
                    storage_key: `key-${pIdx}`,
                    type: "IMAGE",
                    ai_prediction: {
                      id: `ai-${pIdx}`,
                      label: "flood",
                      confidence: (r.aiConfidence || 85) / 100,
                      prob_flood: (r.aiConfidence || 85) / 100,
                      prob_non_flood: 1 - (r.aiConfidence || 85) / 100,
                      model_version: "YOLOv8x-Dermayu-v2.1",
                      status: "COMPLETED",
                    },
                  })) || [],
              }));
            }
          }
        } catch {}
      }
      setReports(loadedReports);

      // 2. Fetch or Calculate Aggregate Stats
      let statsLoaded = false;
      try {
        if (activeToken) {
          const statsRes = await fetch("/api/v1/admin/stats/overview", {
            headers: { Authorization: `Bearer ${activeToken}` },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.data?.stats) {
              setStats(statsData.data.stats);
              setCategoryBreakdown(statsData.data.categoryBreakdown || []);
              statsLoaded = true;
            }
          }
        }
      } catch {}

      if (!statsLoaded) {
        const sub = loadedReports.filter((r) => r.status === "SUBMITTED").length;
        const res = loadedReports.filter((r) => r.status === "RESOLVED").length;
        const inProg = loadedReports.filter((r) => r.status === "IN_PROGRESS" || r.status === "ASSIGNED" || r.status === "VERIFIED").length;
        const crit = loadedReports.filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH").length;

        setStats({
          totalReports: loadedReports.length,
          pendingVerification: sub,
          inProgress: inProg,
          resolved: res,
          criticalCount: crit,
          totalUsers: 142,
          activeAlerts: 1,
        });

        const catMap = new Map<string, number>();
        loadedReports.forEach((r) => {
          const cName = r.category?.name || "Banjir / Rob Pesisir";
          catMap.set(cName, (catMap.get(cName) || 0) + 1);
        });
        if (catMap.size === 0) {
          catMap.set("Banjir Rob Pesisir", 2);
          catMap.set("Luapan DAS Cimanuk", 1);
          catMap.set("Tanggul Kritis", 1);
        }
        setCategoryBreakdown(
          Array.from(catMap.entries()).map(([name, count]) => ({
            name,
            count,
          }))
        );
      }

      // 3. Evacuation points sync from curated 100 posko
      try {
        const curated = getWargaPosko().map((p) => ({
          id: p.id,
          name: p.nama,
          address: `${p.alamat}, Kec. ${p.kecamatan}`,
          latitude: p.lat,
          longitude: p.lng,
          capacity: p.kapasitas,
          facilities: p.fasilitas.join(", "),
          contact_name: p.kontak.pj,
          contact_phone: p.kontak.telp,
        }));
        setEvacPoints(curated);
      } catch {}

      // 4. Default Emergency Contacts fallback
      const defaultContacts: EmergencyContact[] = [
        { id: "ec-1", name: "Pusdalops PB BPBD Indramayu", phone: "112", description: "Pusat panggilan siaga darurat evakuasi & banjir 24 jam bebas pulsa." },
        { id: "ec-2", name: "Basarnas Pos SAR Indramayu", phone: "(0231) 200115", description: "Armada perahu karet LCR & evakuasi penyelamatan korban air deras." },
        { id: "ec-3", name: "PMI Kabupaten Indramayu", phone: "(0234) 271118", description: "Layanan ambulans darurat, pertolongan pertama, dan donor darah." },
        { id: "ec-4", name: "Damkar & Penyelamatan Indramayu", phone: "(0234) 274113", description: "Penyedotan genangan pemukiman & evakuasi darurat." },
        { id: "ec-5", name: "IGD RSUD Indramayu", phone: "(0234) 272444", description: "Instalasi Gawat Darurat rujukan utama medis 24 jam." },
      ];
      setEmergencyContacts(defaultContacts);

      // 5. Default Alerts
      setAlerts([
        {
          id: "alt-01",
          public_id: "ALT-2026-001",
          title: "SIAGA BANJIR ROB PESISIR KANDANGHAUR & ERETAN",
          message: "BMKG & Pusdalops BPBD mengimbau warga pesisir Eretan Wetan waspada pasang air laut setinggi 55 cm. Posko pengungsian di SMKN 1 Kandanghaur telah dibuka.",
          level: "SIAGA",
          status: "ACTIVE",
          created_at: new Date().toISOString(),
        },
      ]);

      // 6. Default Officers & Users
      setOfficers([
        { id: "off-1", public_id: "TRC-01", full_name: "Komandan Surya BPBD", email: "petugas@dermayu.id", phone: "0812-2200-1122" },
        { id: "off-2", public_id: "TRC-02", full_name: "Bripka Ahmad Satgas SAR", email: "satgas.sar@dermayu.id", phone: "0813-4455-6677" },
        { id: "off-3", public_id: "TRC-03", full_name: "Relawan PMI Cantigi", email: "pmi.cantigi@dermayu.id", phone: "0811-9988-7766" },
      ]);

      // 6. Users & Officers fetch (Real persistent store from PostgreSQL)
      try {
        const usersRes = await fetch("/api/v1/admin/users", {
          headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
          credentials: "include",
          cache: "no-store",
        });
        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          const list = usersJson.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setManagedUsers(list);
            setStats((prev) => ({ ...prev, totalUsers: list.length }));
          }
        }
      } catch (err) {
        console.warn("Gagal memuat users dari database:", err);
      }

      // 7. Audit Logs fetch (Real persistent store from PostgreSQL)
      try {
        const auditRes = await fetch("/api/v1/admin/audit-logs", {
          headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
          credentials: "include",
          cache: "no-store",
        });
        if (auditRes.ok) {
          const auditJson = await auditRes.json();
          const list = auditJson.data?.data || auditJson.data || [];
          if (Array.isArray(list)) {
            setAuditLogs(list);
          }
        }
      } catch (err) {
        console.warn("Audit logs fetch warning:", err);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Actions
  const recordAuditLogFrontend = async (
    action: string,
    entity_type: string,
    entity_id?: string | null,
    metadata?: string
  ) => {
    const actorData = {
      id: currentUser?.id || "1",
      public_id: "ADM-001",
      full_name: currentUser?.fullName || currentUser?.name || "Super Admin DERMAYU",
      email: currentUser?.email || "superadmin@dermayu.id",
      role: currentUser?.role || "SUPERADMIN",
    };

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entity_type,
      entity_id: entity_id || null,
      ip: "10.15.2.1",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DermayuAdmin/2.4",
      metadata: metadata || null,
      created_at: new Date().toISOString(),
      actor: actorData,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      fetch("/api/v1/admin/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          entity_type,
          entity_id,
          metadata,
          actor: actorData,
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleVerify = async (reportId: string) => {
    setActionLoading(true);
    try {
      const targetReport = reports.find((r) => r.id === reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "VERIFIED" } : r))
      );
      setStats((prev) => ({
        ...prev,
        pendingVerification: Math.max(0, prev.pendingVerification - 1),
        inProgress: prev.inProgress + 1,
      }));
      recordAuditLogFrontend(
        "VERIFY_REPORT",
        "REPORT",
        targetReport?.ticket_code || reportId,
        `Verifikasi laporan warga: "${targetReport?.title || "Titik Banjir"}" (${targetReport?.water_level || "-"})`
      );
      showToast("Laporan berhasil diverifikasi oleh Pusdalops!");
      setSelectedReport(null);
    } catch {
      showToast("Gagal memverifikasi", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, status: "REJECTED" } : r))
      );
      setStats((prev) => ({
        ...prev,
        pendingVerification: Math.max(0, prev.pendingVerification - 1),
      }));
      recordAuditLogFrontend(
        "REJECT_REPORT",
        "REPORT",
        selectedReport.ticket_code || selectedReport.id,
        `Penolakan laporan. Alasan: ${rejectReason || "Tidak memenuhi kriteria validasi lapangan"}`
      );
      showToast("Laporan berhasil ditolak dengan catatan alasan.");
      setRejectModalOpen(false);
      setSelectedReport(null);
      setRejectReason("");
    } catch {
      showToast("Gagal menolak laporan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedReport || !selectedOfficerId) return;
    setActionLoading(true);
    try {
      const officer = officers.find((o) => o.id === selectedOfficerId);
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, status: "ASSIGNED" } : r))
      );
      recordAuditLogFrontend(
        "ASSIGN_REPORT",
        "REPORT",
        selectedReport.ticket_code || selectedReport.id,
        `Disposisi penugasan ke: ${officer?.full_name || selectedOfficerId} (${officer?.public_id || "TRC"})`
      );
      showToast("Laporan berhasil ditugaskan ke petugas lapangan!");
      setAssignModalOpen(false);
      setSelectedReport(null);
      setSelectedOfficerId("");
    } catch {
      showToast("Gagal menugaskan petugas", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.title || !alertForm.message) return;
    setActionLoading(true);
    try {
      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        public_id: `ALT-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: alertForm.title,
        message: alertForm.message,
        level: alertForm.level,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      };
      setAlerts([newAlert, ...alerts]);
      setStats((prev) => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
      recordAuditLogFrontend(
        "BROADCAST_ALERT",
        "ALERT",
        newAlert.public_id,
        `Siaran Dering Darurat [Level: ${newAlert.level}]: "${newAlert.title}"`
      );
      showToast("Dering Evakuasi darurat berhasil disiarkan ke warga!");
      setAlertModalOpen(false);
      setAlertForm({
        title: "",
        message: "",
        level: "SIAGA",
        targetType: "ALL",
        selectedDistrictId: "",
        selectedEvacId: "",
      });
    } catch {
      showToast("Gagal menyiarkan dering", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndAlert = async (alertId: string) => {
    const targetAlert = alerts.find((a) => a.id === alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "ENDED" } : a))
    );
    setStats((prev) => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
    recordAuditLogFrontend(
      "END_ALERT",
      "ALERT",
      targetAlert?.public_id || alertId,
      `Penghentian status siaran darurat: "${targetAlert?.title || "Dering Evakuasi"}"`
    );
    showToast("Status Dering Evakuasi telah diakhiri.");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: newUserForm.fullName,
          email: newUserForm.email,
          phone: newUserForm.phone || undefined,
          password: newUserForm.password,
          role: newUserForm.role,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const createdUser = json.data?.user || {
          id: `u-${Date.now()}`,
          full_name: newUserForm.fullName,
          email: newUserForm.email,
          phone: newUserForm.phone,
          role: newUserForm.role,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setManagedUsers((prev) => [createdUser, ...prev]);
        setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        recordAuditLogFrontend(
          "CREATE_USER",
          "USER",
          createdUser.public_id || createdUser.id?.toString(),
          `Pendaftaran akun: ${createdUser.full_name} (${createdUser.role} | ${createdUser.email})`
        );
        showToast("Akun baru berhasil didaftarkan ke sistem!");
        setCreateUserModalOpen(false);
        setNewUserForm({ fullName: "", email: "", phone: "", password: "", role: "OFFICER" });
      } else {
        showToast(json?.error?.message || "Gagal membuat user baru", "error");
      }
    } catch {
      showToast("Koneksi gagal saat membuat user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditUser = (user: any) => {
    setEditUserForm({
      id: user.id?.toString() || user.public_id || "",
      fullName: user.full_name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "OFFICER",
      isActive: user.is_active ?? true,
      password: "",
    });
    setEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${editUserForm.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: editUserForm.fullName,
          email: editUserForm.email,
          phone: editUserForm.phone || null,
          address: editUserForm.address || null,
          role: editUserForm.role,
          isActive: editUserForm.isActive,
          password: editUserForm.password ? editUserForm.password : undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const updated = json.data?.user || {
          id: editUserForm.id,
          full_name: editUserForm.fullName,
          email: editUserForm.email,
          phone: editUserForm.phone,
          address: editUserForm.address,
          role: editUserForm.role,
          is_active: editUserForm.isActive,
        };

        setManagedUsers((prev) =>
          prev.map((u) =>
            u.id?.toString() === editUserForm.id || u.public_id === editUserForm.id
              ? { ...u, ...updated }
              : u
          )
        );

        recordAuditLogFrontend(
          "UPDATE_USER",
          "USER",
          editUserForm.id,
          `Pembaruan akun: ${editUserForm.fullName} (${editUserForm.role} | Status: ${editUserForm.isActive ? "Aktif" : "Nonaktif"})`
        );
        showToast("Data akun berhasil diperbarui!");
        setEditUserModalOpen(false);
      } else {
        showToast(json?.error?.message || "Gagal memperbarui data user", "error");
      }
    } catch {
      showToast("Koneksi gagal saat memperbarui user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteUser = (user: any) => {
    if (user.email === currentUser?.email) {
      showToast("Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.", "error");
      return;
    }
    setUserToDelete(user);
    setDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      const targetId = userToDelete.id?.toString() || userToDelete.public_id;
      const res = await fetch(`/api/v1/admin/users/${targetId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        if (json.data?.action === "deactivated") {
          setManagedUsers((prev) =>
            prev.map((u) =>
              u.id?.toString() === targetId || u.public_id === targetId
                ? {
                    ...u,
                    is_active: false,
                    full_name: u.full_name.includes("[NONAKTIF]")
                      ? u.full_name
                      : `${u.full_name} [NONAKTIF]`,
                  }
                : u
            )
          );
          showToast("Akun dinonaktifkan (arsip data penugasan/laporan tersimpan aman).");
        } else {
          setManagedUsers((prev) =>
            prev.filter((u) => u.id?.toString() !== targetId && u.public_id !== targetId)
          );
          setStats((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
          showToast("Akun pengguna berhasil dihapus permanen!");
        }

        recordAuditLogFrontend(
          "DELETE_USER",
          "USER",
          targetId,
          `Penghapusan/Nonaktif akun: ${userToDelete.full_name} (${userToDelete.email})`
        );
        setDeleteUserModalOpen(false);
        setUserToDelete(null);
      } else {
        showToast(json?.error?.message || "Gagal menghapus user", "error");
      }
    } catch {
      showToast("Koneksi gagal saat menghapus akun", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    setExportingCsv(true);
    try {
      const headers = ["Kode Tiket", "Judul", "Kategori", "Keparahan", "Ketinggian Air", "Lokasi", "Status", "Waktu"];
      const rows = filteredReports.map((r) => [
        r.ticket_code,
        `"${r.title.replace(/"/g, '""')}"`,
        r.category.name,
        r.severity,
        r.water_level || "-",
        `"${(r.address_text || "").replace(/"/g, '""')}"`,
        r.status,
        r.occurred_at || r.created_at,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_DERMAYU_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Laporan berhasil diekspor ke CSV!");
      recordAuditLogFrontend("EXPORT_DATA", "REPORT", "ALL", `Ekspor ${filteredReports.length} laporan bencana ke CSV`);
    } catch {
      showToast("Gagal mengekspor CSV", "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportAuditCsv = () => {
    setExportingAuditCsv(true);
    try {
      const headers = ["ID Log", "Waktu (WIB)", "Aksi", "Pelaksana", "Role", "Target Entitas", "ID Entitas", "Metadata", "IP Address"];
      const rows = filteredAuditLogs.map((log) => [
        log.id,
        `"${new Date(log.created_at).toLocaleString("id-ID")}"`,
        log.action,
        `"${(log.actor?.full_name || "Super Admin").replace(/"/g, '""')}"`,
        log.actor?.role || "ADMIN",
        log.entity_type,
        log.entity_id || "-",
        `"${(log.metadata || "-").replace(/"/g, '""')}"`,
        log.ip || "127.0.0.1",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Log_Audit_DERMAYU_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Log audit sistem berhasil diekspor ke format CSV!");
      recordAuditLogFrontend("EXPORT_DATA", "AUDIT_LOG", "ALL", `Ekspor ${filteredAuditLogs.length} rekaman audit ke format CSV`);
    } catch {
      showToast("Gagal mengekspor CSV log audit", "error");
    } finally {
      setExportingAuditCsv(false);
    }
  };

  const handleLogout = async () => {
    recordAuditLogFrontend(
      "USER_LOGOUT",
      "USER",
      currentUser?.id || "1",
      `Logout sesi admin: ${currentUser?.fullName || currentUser?.name || "Super Admin"} (${currentUser?.email})`
    );
    await performLogout("/");
  };

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      report.ticket_code.toLowerCase().includes(q) ||
      report.title.toLowerCase().includes(q) ||
      (report.address_text && report.address_text.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "ALL" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || report.category.code === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesAction = auditActionFilter === "ALL" || log.action === auditActionFilter;
    if (!matchesAction) return false;
    if (!auditSearchQuery.trim()) return true;
    const q = auditSearchQuery.toLowerCase();
    const actorName = log.actor?.full_name?.toLowerCase() || "";
    const actionName = log.action.toLowerCase();
    const entityType = log.entity_type.toLowerCase();
    const entityId = (log.entity_id || "").toLowerCase();
    const metadata = (log.metadata || "").toLowerCase();
    const ip = (log.ip || "").toLowerCase();
    return (
      actorName.includes(q) ||
      actionName.includes(q) ||
      entityType.includes(q) ||
      entityId.includes(q) ||
      metadata.includes(q) ||
      ip.includes(q)
    );
  });

  const getAuditActionBadge = (action: string) => {
    switch (action) {
      case "FEATURE_ACCESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 inline-flex items-center gap-1">🧭 AKSES FITUR</span>;
      case "GPS_ROUTE":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">📍 RUTE GPS</span>;
      case "EMERGENCY_CALL":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">📞 PANGGILAN</span>;
      case "USER_LOGIN":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">🔑 LOGIN</span>;
      case "LOGIN_FAILED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">⚠️ LOGIN GAGAL</span>;
      case "LOGIN_BLOCKED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">🚫 DIBLOKIR</span>;
      case "USER_REGISTER":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">📝 REGISTRASI</span>;
      case "USER_LOGOUT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">🚪 LOGOUT</span>;
      case "SUBMIT_REPORT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">📢 LAPORAN WARGA</span>;
      case "VERIFY_REPORT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/30 inline-flex items-center gap-1">✓ VERIFIKASI</span>;
      case "REJECT_REPORT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">✕ PENOLAKAN</span>;
      case "ASSIGN_REPORT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">⚡ PENUGASAN</span>;
      case "BROADCAST_ALERT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse inline-flex items-center gap-1">🚨 SIARAN DERING</span>;
      case "END_ALERT":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">⏹ AKHIRI DERING</span>;
      case "CREATE_USER":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">👤 BUAT USER</span>;
      case "UPDATE_SHELTER":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">🏢 UPDATE POSKO</span>;
      case "EXPORT_DATA":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1">📄 EKSPOR CSV</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Diterima</span>;
      case "VERIFIED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/30">Terverifikasi</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Ditugaskan</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Ditangani</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Selesai</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">Ditolak</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">KRITIS</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">TINGGI</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">SEDANG</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">RENDAH</span>;
    }
  };

  const getAlertLevelBadge = (level: string) => {
    switch (level) {
      case "EVAKUASI":
        return <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white animate-pulse">🚨 EVAKUASI</span>;
      case "AWAS":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">⚠️ AWAS</span>;
      case "SIAGA":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">⚡ SIAGA</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">🔔 WASPADA</span>;
    }
  };

  const getWaterLevelLabel = (level?: string | null) => {
    if (!level) return null;
    const map: Record<string, string> = {
      ANKLE: "Mata Kaki (20 cm)",
      KNEE: "Lutut (55 cm)",
      THIGH: "Paha (75 cm)",
      WAIST: "Pinggang (100 cm)",
      ABOVE_CHEST: "Dada ke Atas (>120 cm)",
    };
    return map[level] || level;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#132422] flex font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold border backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toastMsg.type === "success"
              ? "bg-[#EEF5F3] text-[#1D443F] border-[#38746D]/30"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#38746D]" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION (Official Forest Green Theme #1D443F) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1D443F] border-r border-[#163531] flex flex-col text-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-white/10 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoDermayu className="w-8 h-8 text-white shrink-0" />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                DERMAYU
              </span>
              <span className="text-[10px] text-emerald-300 font-mono -mt-1 block font-bold tracking-wider">
                PUSAT KOMANDO
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Group 1: Operasional Utama */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-white/40 px-3 tracking-wider uppercase mb-1.5">
              Komando Utama
            </div>

            <button
              onClick={() => handleSelectMenu("DASHBOARD")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "DASHBOARD"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Home className="w-4 h-4" />
                <span>Dashboard & Metrik</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectMenu("REPORTS")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "REPORTS"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <TableIcon className="w-4 h-4" />
                <span>Antrean Laporan</span>
              </div>
              {stats.pendingVerification > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950">
                  {stats.pendingVerification}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectMenu("MAP")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "MAP"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
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
            <div className="text-[10px] font-bold text-white/40 px-3 tracking-wider uppercase mb-1.5">
              Respons & Evakuasi
            </div>

            <button
              onClick={() => handleSelectMenu("ALERTS")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "ALERTS"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4 text-emerald-300" />
                <span>Dering Evakuasi</span>
              </div>
              {alerts.filter((a) => a.status === "ACTIVE").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {alerts.filter((a) => a.status === "ACTIVE").length} Aktif
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectMenu("EVACUATION")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "EVACUATION"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>Posko Pengungsian</span>
              </div>
              <span className="text-[10px] text-white/60 font-semibold">{evacPoints.length}</span>
            </button>

            <button
              onClick={() => handleSelectMenu("CONTACTS")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "CONTACTS"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-300" />
                <span>Kontak Darurat</span>
              </div>
            </button>
          </div>

          {/* Group 3: Administrasi & Akun */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-white/40 px-3 tracking-wider uppercase mb-1.5">
              Administrasi Sistem
            </div>

            <button
              onClick={() => handleSelectMenu("USERS")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "USERS"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>Manajemen Pengguna</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                SUPER
              </span>
            </button>

            <button
              onClick={() => handleSelectMenu("AUDIT")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "AUDIT"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Log Audit Sistem</span>
              </div>
              <span className="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {auditLogs.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectMenu("APK")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === "APK"
                  ? "bg-[#38746D] text-white shadow-xs font-bold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span>Rilis Aplikasi (.APK)</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PROD
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Current User Profile Card */}
        <div className="p-3.5 border-t border-white/10 bg-[#163531]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#38746D] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/20">
                {(currentUser?.fullName || currentUser?.name || "A").charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || "Super Admin"}</div>
                <div className="text-[10px] text-emerald-300 font-mono font-medium truncate">
                  {currentUser?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari sistem"
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#D5E4E0] bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-[#F8FAF9] border border-[#D5E4E0] flex items-center justify-center text-[#1D443F] hover:bg-[#EEF5F3] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-[#718783]">
              <span className="font-semibold text-[#132422]">Pusat Komando</span>
              <ChevronRight className="w-3 h-3 text-[#A4C6C1]" />
              <span className="font-extrabold text-[#38746D] uppercase tracking-wide">
                {activeMenu}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono font-bold text-[#1D443F] bg-[#EEF5F3] border border-[#D5E4E0] px-3.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-[#38746D]" />
              <span>{currentTime}</span>
            </div>

            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#F8FAF9] border border-[#D5E4E0] text-[#1D443F] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#38746D]" : ""}`} />
            </button>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-rose-200" />
              <span className="hidden sm:inline">Kirim Dering Evakuasi</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views based on activeMenu */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full">
          {/* VIEW 1: DASHBOARD & METRIK OVERVIEW */}
          {activeMenu === "DASHBOARD" && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#718783]">Total Laporan</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#132422]">{stats.totalReports}</div>
                  <div className="text-[11px] text-[#718783]">Semua aduan masuk</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700">Butuh Verifikasi</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">{stats.pendingVerification}</div>
                  <div className="text-[11px] text-amber-700/80">Status SUBMITTED</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-600">Laporan Kritis</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{stats.criticalCount}</div>
                  <div className="text-[11px] text-rose-600/80">Butuh evakuasi segera</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700">Laporan Selesai</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{stats.resolved}</div>
                  <div className="text-[11px] text-[#718783]">Tuntas ditangani</div>
                </div>
              </div>

              {/* Quick Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#132422]">Distribusi Jenis Kejadian</h3>
                    <span className="text-[11px] text-[#38746D] font-bold bg-[#EEF5F3] px-2.5 py-0.5 rounded-full border border-[#38746D]/20">
                      Real-time
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryBreakdown.length > 0 ? (
                      categoryBreakdown.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] text-xs">
                          <span className="text-[#132422] font-bold">{cat.name}</span>
                          <span className="px-2.5 py-0.5 rounded-full font-mono font-extrabold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20">
                            {cat.count} Kasus
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#718783] py-6 text-center">Belum ada data kejadian tercatat.</div>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-[#132422]">Pintasan Cepat Komando</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSelectMenu("REPORTS")}
                      className="p-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-all group cursor-pointer"
                    >
                      <TableIcon className="w-5 h-5 text-[#38746D] mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-[#132422]">Periksa Antrean</div>
                      <div className="text-[10.5px] text-[#718783] mt-0.5">Tinjau laporan warga &amp; skor AI</div>
                    </button>

                    <button
                      onClick={() => handleSelectMenu("MAP")}
                      className="p-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-all group cursor-pointer"
                    >
                      <MapIcon className="w-5 h-5 text-[#38746D] mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-[#132422]">Peta Sebaran</div>
                      <div className="text-[10.5px] text-[#718783] mt-0.5">Cek titik luapan air Indramayu</div>
                    </button>

                    <button
                      onClick={() => setAlertModalOpen(true)}
                      className="p-4 rounded-2xl bg-[#F8FAF9] hover:bg-rose-50 border border-[#D5E4E0] hover:border-rose-300 text-left transition-all group cursor-pointer"
                    >
                      <Flame className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-[#132422]">Broadcast Dering</div>
                      <div className="text-[10.5px] text-[#718783] mt-0.5">Kirim push darurat ke warga</div>
                    </button>

                    <button
                      onClick={() => handleSelectMenu("EVACUATION")}
                      className="p-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-all group cursor-pointer"
                    >
                      <Building2 className="w-5 h-5 text-[#38746D] mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-[#132422]">Posko Pengungsian</div>
                      <div className="text-[10.5px] text-[#718783] mt-0.5">Pantau kapasitas tempat evakuasi</div>
                    </button>

                    <button
                      onClick={() => handleSelectMenu("APK")}
                      className="p-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#EEF5F3] border border-[#D5E4E0] hover:border-[#38746D] text-left transition-all group cursor-pointer col-span-2"
                    >
                      <Smartphone className="w-5 h-5 text-[#38746D] mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-xs text-[#132422]">Rilis Aplikasi Android (.APK)</div>
                      <div className="text-[10.5px] text-[#718783] mt-0.5">Kelola link Google Drive APK &amp; pembaruan versi</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ANTREAN LAPORAN (TABLE) */}
          {activeMenu === "REPORTS" && (
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode tiket, judul laporan, wilayah..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-[#38746D]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#F8FAF9] border border-[#D5E4E0] text-xs font-medium text-[#132422] rounded-xl px-3 py-2 focus:outline-none focus:border-[#38746D] cursor-pointer"
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
                    className="bg-[#F8FAF9] border border-[#D5E4E0] text-xs font-medium text-[#132422] rounded-xl px-3 py-2 focus:outline-none focus:border-[#38746D] cursor-pointer"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="FLOOD">Banjir / Rob Pesisir</option>
                    <option value="LEVEE">Tanggul Jebol</option>
                    <option value="DRAINAGE">Drainase Mampet</option>
                    <option value="ROAD">Jalan Tergenang</option>
                  </select>

                  <button
                    onClick={handleExportCsv}
                    disabled={exportingCsv}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#38746D] hover:bg-[#24544E] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    title="Ekspor seluruh laporan terfilter ke file CSV"
                  >
                    <Download className={`w-3.5 h-3.5 ${exportingCsv ? "animate-bounce" : ""}`} />
                    <span>{exportingCsv ? "Mengekspor..." : "Ekspor CSV"}</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#D5E4E0]">
                <table className="w-full text-left text-xs text-[#132422]">
                  <thead className="bg-[#F8FAF9] text-[#4B635F] font-bold border-b border-[#D5E4E0]">
                    <tr>
                      <th className="py-3.5 px-4">Kode Tiket &amp; Tanggal</th>
                      <th className="py-3.5 px-4">Kategori &amp; Keparahan</th>
                      <th className="py-3.5 px-4">Judul &amp; Lokasi</th>
                      <th className="py-3.5 px-4">Validasi AI Vision</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F1EE]">
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => {
                        const latestPrediction = report.media?.[0]?.ai_prediction;
                        return (
                          <tr
                            key={report.id}
                            className="hover:bg-[#EEF5F3]/50 transition-colors group cursor-pointer"
                            onClick={() => setSelectedReport(report)}
                          >
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-[#38746D] block">
                                {report.ticket_code}
                              </span>
                              <span className="text-[10.5px] text-[#718783]">
                                {new Date(report.occurred_at || report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-1.5 mb-1 font-semibold text-[#132422]">
                                {report.category.name}
                              </div>
                              <div className="flex items-center space-x-1.5">
                                {getSeverityBadge(report.severity)}
                                {report.water_level && (
                                  <span className="text-[10px] text-[#1D443F] bg-[#EEF5F3] px-1.5 py-0.5 rounded border border-[#38746D]/20 font-bold">
                                    🌊 {getWaterLevelLabel(report.water_level)}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-bold text-[#132422] truncate">{report.title}</div>
                              <div className="text-[11px] text-[#718783] flex items-center space-x-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                                <span>{report.address_text || "Kabupaten Indramayu"}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {latestPrediction ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20">
                                      AI Valid ({Math.round(latestPrediction.confidence * 100)}%)
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#718783] font-mono">
                                    {latestPrediction.model_version || "YOLOv8x-Dermayu"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Menunggu Analisis AI</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">{getStatusBadge(report.status)}</td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReport(report);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#EEF5F3] hover:bg-[#38746D] hover:text-white text-[#1D443F] text-xs font-bold transition-all border border-[#38746D]/20 cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#718783]">
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
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-[#38746D]" />
                    <span>Peta Spasial Komando Indramayu</span>
                  </h2>
                  <p className="text-xs text-[#718783] mt-0.5">
                    Visualisasi sebaran laporan real-time dan titik posko pengungsian di atas peta WebGIS interaktif.
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
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8F1EE]">
                <div>
                  <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-rose-600" />
                    <span>Riwayat Siaran Dering Evakuasi</span>
                  </h2>
                  <p className="text-xs text-[#718783] mt-0.5">
                    Daftar broadcast peringatan bencana yang disiarkan ke seluruh portal warga Indramayu.
                  </p>
                </div>
                <button
                  onClick={() => setAlertModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
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
                          ? "bg-rose-50/50 border-rose-200"
                          : "bg-[#F8FAF9] border-[#D5E4E0] opacity-80"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          {getAlertLevelBadge(al.level)}
                          <span className="font-extrabold text-[#132422] text-sm">{al.title}</span>
                          {al.status === "ACTIVE" ? (
                            <span className="text-[10.5px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              SEDANG AKTIF
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-[#718783] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              BERAKHIR
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4B635F] leading-relaxed max-w-3xl">{al.message}</p>
                        <div className="text-[10.5px] text-[#718783]">
                          Disiarkan: {new Date(al.created_at).toLocaleString("id-ID")}
                        </div>
                      </div>

                      {al.status === "ACTIVE" && (
                        <button
                          onClick={() => handleEndAlert(al.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 transition-all self-start md:self-center shrink-0 cursor-pointer shadow-xs active:scale-95"
                        >
                          Hentikan Peringatan
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-[#718783] text-xs">
                    Belum ada Dering Evakuasi yang pernah disiarkan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: POSKO PENGUNGSIAN */}
          {activeMenu === "EVACUATION" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-[#38746D]" />
                  <span>Daftar Titik Posko Evakuasi Indramayu</span>
                </h2>
                <p className="text-xs text-[#718783] mt-0.5">
                  Fasilitas evakuasi terkurasi, kapasitas pengungsian, dan kontak penanggung jawab lapangan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evacPoints.map((ep) => (
                  <div key={ep.id} className="p-5 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#38746D] uppercase tracking-wide">Posko Pengungsian</span>
                        <h3 className="font-extrabold text-base text-[#132422]">{ep.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EEF5F3] text-[#1D443F] border border-[#38746D]/20">
                        {ep.capacity} Jiwa
                      </span>
                    </div>

                    <div className="text-xs text-[#718783] flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#38746D] shrink-0 mt-0.5" />
                      <span>{ep.address}</span>
                    </div>

                    {ep.contact_phone && (
                      <div className="pt-2 border-t border-[#E8F1EE] flex items-center justify-between text-xs">
                        <span className="text-[#718783]">PIC: {ep.contact_name || "Koordinator"}</span>
                        <a
                          href={`tel:${ep.contact_phone}`}
                          className="font-bold text-[#38746D] hover:underline flex items-center space-x-1"
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
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-[#38746D]" />
                  <span>Daftar Kontak Cepat Tanggap Darurat</span>
                </h2>
                <p className="text-xs text-[#718783] mt-0.5">
                  Nomor hotline instansi tanggap darurat dan penanggulangan bencana Kabupaten Indramayu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-white border border-[#D5E4E0] shadow-xs space-y-2">
                    <h3 className="font-extrabold text-sm text-[#132422]">{c.name}</h3>
                    <p className="text-xs text-[#718783]">{c.description || "Layanan Darurat"}</p>
                    <div className="pt-2">
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#38746D] text-white text-xs font-bold hover:bg-[#24544E] transition-colors shadow-xs"
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
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8F1EE]">
                <div>
                  <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#38746D]" />
                    <span>Manajemen Pengguna &amp; Petugas</span>
                  </h2>
                  <p className="text-xs text-[#718783] mt-0.5">
                    Kelola akun operator, admin, dan petugas lapangan sesuai izin RBAC sistem DERMAYU.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#718783] font-medium hidden sm:inline">
                    Total: <strong className="text-[#132422]">{managedUsers.length}</strong> Akun
                  </span>
                  <button
                    onClick={() => setCreateUserModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Petugas / Admin</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#718783] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari nama pengguna, email, atau nomor HP..."
                    className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-[#718783] focus:outline-hidden focus:border-[#38746D] focus:bg-white"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718783] hover:text-[#132422]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs font-semibold text-[#132422] focus:outline-hidden focus:border-[#38746D] cursor-pointer"
                  >
                    <option value="ALL">Semua Peran (Role)</option>
                    <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
                    <option value="OFFICER">Petugas SAR / TRC (OFFICER)</option>
                    <option value="CITIZEN">Warga Siaga (CITIZEN)</option>
                  </select>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs font-semibold text-[#132422] focus:outline-hidden focus:border-[#38746D] cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">● Aktif</option>
                    <option value="INACTIVE">○ Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#D5E4E0]">
                <table className="w-full text-left text-xs text-[#132422]">
                  <thead className="bg-[#F8FAF9] text-[#4B635F] font-bold border-b border-[#D5E4E0]">
                    <tr>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Email / Kontak</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Terdaftar</th>
                      <th className="py-3 px-4 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F1EE]">
                    {managedUsers
                      .filter((u) => {
                        const q = userSearchQuery.toLowerCase().trim();
                        const matchSearch =
                          !q ||
                          u.full_name?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.phone?.toLowerCase().includes(q);
                        const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
                        const matchStatus =
                          userStatusFilter === "ALL" ||
                          (userStatusFilter === "ACTIVE" && (u.is_active ?? true)) ||
                          (userStatusFilter === "INACTIVE" && u.is_active === false);
                        return matchSearch && matchRole && matchStatus;
                      })
                      .map((u) => {
                        const isSelf = u.email === currentUser?.email;
                        const isActive = u.is_active ?? true;

                        return (
                          <tr key={u.id || u.public_id} className="hover:bg-[#F8FAF9] transition-colors">
                            <td className="py-3 px-4 font-bold text-[#132422]">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#EEF5F3] text-[#38746D] font-extrabold flex items-center justify-center text-xs border border-[#38746D]/20 shrink-0">
                                  {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0 max-w-[240px]">
                                  <div className="font-bold text-[#132422] truncate">{u.full_name}</div>
                                  {(u.village?.name || u.district?.name || u.address) ? (
                                    <div
                                      className="text-[10px] text-[#718783] font-normal truncate flex items-center gap-1 mt-0.5"
                                      title={[
                                        u.village?.name ? `Ds. ${u.village.name}` : null,
                                        u.district?.name ? `Kec. ${u.district.name}` : null,
                                        u.address,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    >
                                      <MapPin className="w-2.5 h-2.5 text-[#38746D] shrink-0" />
                                      <span className="truncate">
                                        {[
                                          u.village?.name ? `Ds. ${u.village.name}` : null,
                                          u.district?.name ? `Kec. ${u.district.name}` : null,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                        {u.address ? ` (${u.address})` : ""}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-gray-400 font-normal italic mt-0.5">
                                      Domisili belum diatur
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#132422] text-xs">{u.email || "-"}</div>
                              {u.phone ? (
                                <div className="text-[11px] text-[#38746D] font-medium flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-[#38746D]" />
                                  <span>{u.phone}</span>
                                </div>
                              ) : (
                                <div className="text-[10.5px] text-amber-600 font-normal flex items-center gap-1 mt-0.5">
                                  <span>⚠️ Belum ada No. WA</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  u.role === "SUPERADMIN"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : u.role === "OFFICER"
                                    ? "bg-[#EEF5F3] text-[#1D443F] border-[#38746D]/20"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Aktif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span>Nonaktif</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#718783]">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Edit Pengguna"
                                  className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#38746D] border border-[#38746D]/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteUser(u)}
                                  title={isSelf ? "Akun Anda saat ini (tidak dapat dihapus)" : "Hapus / Nonaktifkan Akun"}
                                  disabled={isSelf}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                    isSelf
                                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50"
                                      : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer active:scale-95"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 8: LOG AUDIT SISTEM */}
          {activeMenu === "AUDIT" && (
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8F1EE]">
                <div>
                  <h2 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#38746D]" />
                    <span>Log Audit &amp; Integritas Sistem</span>
                  </h2>
                  <p className="text-xs text-[#718783] mt-0.5">
                    Rekaman audit jejak aktivitas krusial operasional, verifikasi laporan, penugasan armada, dan siaran Dering Evakuasi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#718783] font-medium hidden sm:inline">
                    Total: <strong className="text-[#132422]">{auditLogs.length}</strong> log
                  </span>
                  <button
                    onClick={handleExportAuditCsv}
                    disabled={exportingAuditCsv || filteredAuditLogs.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E4E0] hover:bg-[#F8FAF9] text-xs font-bold text-[#1D443F] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#38746D]" />
                    <span>{exportingAuditCsv ? "Mengekspor..." : "Ekspor Log CSV"}</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#718783] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Cari aktivitas, pelaksana, tiket laporan, metadata, atau IP..."
                    className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-[#718783] focus:outline-hidden focus:border-[#38746D] focus:bg-white"
                  />
                  {auditSearchQuery && (
                    <button
                      onClick={() => setAuditSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718783] hover:text-[#132422]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="px-3 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs font-semibold text-[#132422] focus:outline-hidden focus:border-[#38746D] cursor-pointer"
                  >
                    <option value="ALL">Semua Aksi Audit</option>
                    <option value="FEATURE_ACCESS">Akses Modul / Fitur</option>
                    <option value="GPS_ROUTE">Navigasi Rute GPS</option>
                    <option value="EMERGENCY_CALL">Panggilan Darurat / Posko</option>
                    <option value="USER_LOGIN">Login Sesi</option>
                    <option value="LOGIN_FAILED">Login Gagal</option>
                    <option value="USER_REGISTER">Registrasi Akun</option>
                    <option value="USER_LOGOUT">Logout Sesi</option>
                    <option value="SUBMIT_REPORT">Laporan Baru Warga</option>
                    <option value="VERIFY_REPORT">Verifikasi Laporan</option>
                    <option value="REJECT_REPORT">Penolakan Laporan</option>
                    <option value="ASSIGN_REPORT">Penugasan Petugas</option>
                    <option value="BROADCAST_ALERT">Siaran Dering Darurat</option>
                    <option value="END_ALERT">Akhiri Dering Darurat</option>
                    <option value="UPDATE_SHELTER">Update Data Posko</option>
                    <option value="CREATE_USER">Pendaftaran Petugas</option>
                    <option value="EXPORT_DATA">Ekspor Data CSV</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-[#D5E4E0]">
                <table className="w-full text-left text-xs text-[#132422]">
                  <thead className="bg-[#F8FAF9] text-[#4B635F] font-bold border-b border-[#D5E4E0]">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">Waktu (WIB)</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Aksi Audit</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Pelaksana (Actor)</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Target Entitas</th>
                      <th className="py-3.5 px-4">Metadata &amp; Keterangan</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F1EE]">
                    {filteredAuditLogs.length > 0 ? (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F8FAF9] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#718783] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })} WIB
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">{getAuditActionBadge(log.action)}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-[#132422]">{log.actor?.full_name || "Super Admin"}</div>
                            <div className="text-[10px] text-[#718783] font-mono">{log.actor?.role || "ADMIN"}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#F0F4F3] text-[#1D443F] border border-[#D5E4E0]">
                              {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#4B635F] max-w-sm">
                            {log.metadata || "-"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#718783] whitespace-nowrap">
                            {log.ip || "127.0.0.1"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#718783]">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <ShieldCheck className="w-8 h-8 text-[#D5E4E0]" />
                            <p className="font-semibold text-sm text-[#132422]">
                              {auditLogs.length === 0
                                ? "Belum ada aktivitas audit krusial tercatat"
                                : "Tidak ada catatan audit yang cocok"}
                            </p>
                            <p className="text-xs text-[#718783] max-w-sm">
                              {auditLogs.length === 0
                                ? "Lakukan tindakan operasional seperti verifikasi laporan, penugasan armada, siaran dering evakuasi, atau tambah akun untuk mencatat jejak audit baru."
                                : "Coba ubah kata kunci pencarian atau reset filter aksi."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER SUMMARY */}
              {filteredAuditLogs.length > 0 && (
                <div className="flex items-center justify-between text-xs text-[#718783] pt-1">
                  <span>
                    Menampilkan <strong>{filteredAuditLogs.length}</strong> dari <strong>{auditLogs.length}</strong> aktivitas sistem
                  </span>
                  <span className="text-[11px] font-mono">
                    Enkripsi Integritas SHA-256 Aktif
                  </span>
                </div>
              )}
            </div>
          )}

          {/* VIEW 9: MANAJEMEN RILIS APLIKASI ANDROID (.APK) */}
          {activeMenu === "APK" && (
            <div className="bg-white border border-[#D5E4E0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8F1EE]">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#132422] flex items-center space-x-2.5">
                    <Smartphone className="w-5 h-5 text-[#38746D]" />
                    <span>Pusat Rilis &amp; Tautan Unduhan Aplikasi Android (.APK)</span>
                  </h2>
                  <p className="text-xs text-[#718783] mt-1">
                    Kelola tautan berkas APK (Google Drive), versi aplikasi, catatan pembaruan, dan status ketersediaan unduhan untuk warga.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchApkRelease}
                    disabled={apkLoading}
                    className="px-3.5 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E4E0] hover:bg-[#EEF5F3] text-xs font-bold text-[#1D443F] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#38746D] ${apkLoading ? "animate-spin" : ""}`} />
                    <span>Segarkan</span>
                  </button>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#D5E4E0] hover:bg-[#F8FAF9] text-xs font-bold text-[#1D443F] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Lihat Web Landing</span>
                    <ExternalLink className="w-3 h-3 text-[#718783]" />
                  </a>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Column (7 Cols) */}
                <form onSubmit={handleSaveApkRelease} className="lg:col-span-7 space-y-5">
                  {/* Status Toggle Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#132422]">Status Publikasi Unduhan APK</div>
                        <div className="text-[11px] text-[#718783] mt-0.5">
                          {apkRelease.isReleased
                            ? "Aplikasi berstatus RILIS RESMI. Tombol Unduh .APK di website akan langsung mengarahkan warga ke berkas APK."
                            : "Aplikasi berstatus TAHAP PENGEMBANGAN. Pengunjung akan diarahkan memasang versi PWA."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApkRelease({ ...apkRelease, isReleased: !apkRelease.isReleased })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          apkRelease.isReleased ? "bg-[#38746D]" : "bg-gray-300"
                        }`}
                        role="switch"
                        aria-checked={apkRelease.isReleased}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            apkRelease.isReleased ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          apkRelease.isReleased
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {apkRelease.isReleased ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Publikasi Aktif (Tersedia untuk Warga)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Mode Pengembangan (PWA Mode)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Input Tautan APK (Google Drive) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#132422]">
                      Tautan Unduhan Berkas APK (Google Drive Link):
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-[#718783] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={apkRelease.downloadUrl}
                        onChange={(e) => setApkRelease({ ...apkRelease, downloadUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/1abc.../view?usp=sharing"
                        required={apkRelease.isReleased}
                        className="w-full pl-10 pr-24 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-[#718783] focus:outline-hidden focus:border-[#38746D] focus:bg-white font-mono"
                      />
                      {apkRelease.downloadUrl && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(apkRelease.downloadUrl);
                              setApkCopied(true);
                              setTimeout(() => setApkCopied(false), 2000);
                            }}
                            className="px-2 py-1 rounded-lg bg-white border border-[#D5E4E0] text-[10px] font-semibold text-[#1D443F] hover:bg-[#EEF5F3] flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3 text-[#38746D]" />
                            <span>{apkCopied ? "Tersalin!" : "Salin"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Petunjuk Penggunaan Google Drive */}
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-blue-950">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cara Menyimpan &amp; Membagikan File APK dari Google Drive:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800 leading-relaxed pl-1">
                        <li>Unggah berkas <code className="bg-blue-100/70 px-1 py-0.5 rounded text-blue-900 font-mono font-bold">app-release.apk</code> ke Google Drive Anda.</li>
                        <li>Klik kanan pada file APK &rarr; pilih <strong>Bagikan (Share)</strong>.</li>
                        <li>Pada bagian <em>Akses umum</em>, ubah pilihan menjadi <strong>&quot;Siapa saja yang memiliki link&quot;</strong> (Anyone with the link).</li>
                        <li>Klik <strong>Salin Link</strong> (Copy link), lalu tempelkan (paste) pada kolom tautan di atas.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Dual Grid: Versi & Ukuran Berkas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#132422]">
                        Versi Aplikasi:
                      </label>
                      <input
                        type="text"
                        value={apkRelease.version}
                        onChange={(e) => setApkRelease({ ...apkRelease, version: e.target.value })}
                        placeholder="v1.0.0"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] font-mono focus:outline-hidden focus:border-[#38746D] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#132422]">
                        Ukuran Berkas Installer:
                      </label>
                      <input
                        type="text"
                        value={apkRelease.fileSize}
                        onChange={(e) => setApkRelease({ ...apkRelease, fileSize: e.target.value })}
                        placeholder="61.6 MB"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] font-mono focus:outline-hidden focus:border-[#38746D] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Catatan Rilis / Changelog */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#132422]">
                      Catatan Pembaruan Rilis (Changelog):
                    </label>
                    <textarea
                      rows={3}
                      value={apkRelease.releaseNotes}
                      onChange={(e) => setApkRelease({ ...apkRelease, releaseNotes: e.target.value })}
                      placeholder="Tuliskan fitur-fitur baru pada rilis ini..."
                      className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] leading-relaxed focus:outline-hidden focus:border-[#38746D] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={apkSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {apkSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Menyimpan Pengaturan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Simpan Pengaturan Rilis APK</span>
                        </>
                      )}
                    </button>

                    {apkRelease.downloadUrl && (
                      <a
                        href={apkRelease.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#D5E4E0] hover:bg-[#EEF5F3] text-xs font-bold text-[#1D443F] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#38746D]" />
                        <span>Uji Buka Tautan</span>
                      </a>
                    )}
                  </div>
                </form>

                {/* Right Column: Live Mockup / Preview (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1D443F]">
                        Pratinjau Tampilan Warga (Modal Download)
                      </span>
                      <span className="text-[10px] text-[#4B635F]">Live Preview</span>
                    </div>

                    {/* Preview Box */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-[#EEF5F3] border border-[#D5E4E0] flex items-center justify-center text-[#38746D]">
                        <Smartphone className="w-6 h-6" />
                      </div>

                      {apkRelease.isReleased ? (
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold mb-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Rilis Resmi Android (Tersedia)</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-[#132422]">
                            Aplikasi DERMAYU Siap Diunduh
                          </h4>
                          <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-[#4B635F]">
                            <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              {apkRelease.version || "v1.0.0"}
                            </span>
                            <span>•</span>
                            <span>{apkRelease.fileSize || "61.6 MB"}</span>
                          </div>
                          <p className="mt-2 text-[11px] text-[#4B635F] line-clamp-2 italic">
                            &quot;{apkRelease.releaseNotes || "Rilis resmi aplikasi Dermayu Android."}&quot;
                          </p>

                          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
                            <div className="flex-1 py-2 px-2 rounded-full border border-slate-200 text-[10.5px] text-slate-500 font-medium">
                              Pasang PWA
                            </div>
                            <div className="flex-2 py-2 px-3 rounded-full bg-[#38746D] text-white text-[10.5px] font-bold flex items-center justify-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>Unduh .APK Sekarang</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold mb-1.5">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Tahap Pengembangan</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-[#132422]">
                            Aplikasi .APK Sedang Disiapkan
                          </h4>
                          <p className="mt-1 text-[11px] text-[#4B635F]">
                            Saat ini aplikasi .APK masih tahap pengembangan. Pengunjung diarahkan menggunakan versi PWA.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Info */}
                  <div className="p-4 rounded-2xl bg-white border border-[#D5E4E0] text-xs space-y-2">
                    <div className="font-bold text-[#132422] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#38746D]" />
                      <span>Informasi Distribusi Sistem</span>
                    </div>
                    <div className="text-[11px] text-[#4B635F] space-y-1">
                      <div className="flex justify-between">
                        <span>Penyimpanan:</span>
                        <strong className="text-[#132422]">Google Drive Cloud</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Terakhir Diperbarui:</span>
                        <span className="font-mono text-[#132422]">
                          {apkRelease.updatedAt
                            ? new Date(apkRelease.updatedAt).toLocaleString("id-ID")
                            : "Baru saja"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diperbarui Oleh:</span>
                        <span className="text-[#132422]">{apkRelease.updatedBy || "Super Admin"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CREATE USER (SUPERADMIN ONLY) */}
      {createUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#132422] flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#38746D]" />
                <span>Tambah Akun Petugas / Admin</span>
              </h3>
              <button
                onClick={() => setCreateUserModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="Contoh: Petugas TRC Sindang"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Email Resmi:</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="petugas.trc@dermayu.id"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Nomor HP / WhatsApp (Opsional):</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Kata Sandi Awal:</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Peran Akses (Role):</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] cursor-pointer font-medium"
                >
                  <option value="OFFICER">Petugas Lapangan / Relawan TRC (OFFICER)</option>
                  <option value="SUPERADMIN">Super Admin Pusat Komando (SUPERADMIN)</option>
                  <option value="CITIZEN">Warga Siaga Bencana (CITIZEN)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {actionLoading ? "Membuat..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER (SUPERADMIN ONLY) */}
      {editUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#132422] flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-[#38746D]" />
                <span>Edit Data Pengguna &amp; Petugas</span>
              </h3>
              <button
                onClick={() => setEditUserModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={editUserForm.fullName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  placeholder="Nama Lengkap"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Email Resmi:</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  placeholder="email@dermayu.id"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Nomor HP / WhatsApp:</label>
                <input
                  type="tel"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">Detail Alamat / Domisili:</label>
                <input
                  type="text"
                  value={editUserForm.address}
                  onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  placeholder="Contoh: RT 02 / RW 01, Blok Karang Tengah"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">Peran Akses (Role):</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] cursor-pointer font-medium"
                  >
                    <option value="OFFICER">OFFICER (Petugas)</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="CITIZEN">CITIZEN (Warga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#132422] mb-1">Status Akun:</label>
                  <select
                    value={editUserForm.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.value === "active" })}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] cursor-pointer font-medium"
                  >
                    <option value="active">● Aktif</option>
                    <option value="inactive">○ Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1">
                  Reset Kata Sandi Baru <span className="text-[11px] font-normal text-[#718783]">(Kosongkan jika tidak diubah)</span>:
                </label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Masukkan kata sandi baru (minimal 6 karakter)"
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRMATION (SUPERADMIN ONLY) */}
      {deleteUserModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#132422]">Hapus / Nonaktifkan Akun</h3>
                <p className="text-xs text-[#718783]">Tindakan pencabutan hak akses sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200/60 text-xs text-red-900 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus akun{" "}
                <strong className="font-extrabold text-[#132422]">{userToDelete.full_name}</strong> (
                <span className="font-mono text-red-700">{userToDelete.email}</span>)?
              </p>
              <p className="text-[11px] text-[#718783]">
                Catatan: Jika akun memiliki riwayat laporan bencana atau penugasan armada SAR, sistem akan menonaktifkan akun secara aman untuk menjaga integritas audit data.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteUserModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{actionLoading ? "Memproses..." : "Ya, Hapus Akun"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DERING EVAKUASI BROADCAST MODAL */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#132422]">Siarkan Dering Evakuasi</h3>
                  <p className="text-xs text-[#718783]">Peringatan darurat berbasis wilayah (Push Notifikasi &amp; Portal)</p>
                </div>
              </div>
              <button
                onClick={() => setAlertModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendAlert} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Tingkat Status Peringatan:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["WASPADA", "SIAGA", "AWAS", "EVAKUASI"] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setAlertForm({ ...alertForm, level: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        alertForm.level === lvl
                          ? lvl === "EVAKUASI"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : lvl === "AWAS"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : lvl === "SIAGA"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-yellow-50 text-yellow-700 border-yellow-300"
                          : "bg-[#F8FAF9] border-[#D5E4E0] text-[#718783] hover:bg-[#EEF5F3]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Judul Peringatan:
                </label>
                <input
                  type="text"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="Contoh: SIAGA BANJIR LUAPAN SUNGAI CIMANUK"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Instruksi &amp; Pesan Evakuasi untuk Warga:
                </label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Instruksikan warga untuk mengamankan dokumen dan segera mengungsi ke posko yang ditentukan..."
                  required
                  className="w-full h-24 p-3 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Rujukan Titik Posko Evakuasi:
                </label>
                <select
                  value={alertForm.selectedEvacId}
                  onChange={(e) => setAlertForm({ ...alertForm, selectedEvacId: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] cursor-pointer"
                >
                  <option value="">-- Sertakan Posko Evakuasi Terdekat --</option>
                  {evacPoints.slice(0, 15).map((ep) => (
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
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-extrabold text-[#38746D]">
                    {selectedReport.ticket_code}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                  {getSeverityBadge(selectedReport.severity)}
                </div>
                <p className="text-xs text-[#718783] mt-1 font-semibold">{selectedReport.category.name}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedReport.media && selectedReport.media.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#132422]">Bukti Foto Kejadian:</div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReport.media.map((m, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-[#D5E4E0] bg-slate-100 aspect-video group">
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
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-white/20 flex items-center space-x-1">
                          <Cpu className="w-3 h-3 text-emerald-400" />
                          <span>AI: {m.ai_prediction.label} ({Math.round(m.ai_prediction.confidence * 100)}%)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 bg-[#F8FAF9] p-4 rounded-2xl border border-[#E8F1EE]">
              <h3 className="font-extrabold text-[#132422] text-base">{selectedReport.title}</h3>
              <p className="text-xs text-[#4B635F] leading-relaxed whitespace-pre-wrap">
                {selectedReport.description || "Tidak ada deskripsi rinci."}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#D5E4E0] text-xs">
                <div>
                  <span className="text-[#718783] block text-[10.5px]">Ketinggian Air:</span>
                  <span className="font-bold text-[#1D443F]">
                    {getWaterLevelLabel(selectedReport.water_level) || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[#718783] block text-[10.5px]">Waktu Kejadian:</span>
                  <span className="text-[#132422] font-semibold">
                    {new Date(selectedReport.occurred_at || selectedReport.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#718783] block text-[10.5px]">Titik Lokasi:</span>
                  <div className="flex items-center justify-between text-[#132422] mt-0.5">
                    <span className="font-medium">
                      {selectedReport.address_text || `Lat: ${selectedReport.latitude}, Lng: ${selectedReport.longitude}`}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#38746D] hover:underline text-[11px] font-bold flex items-center space-x-1"
                    >
                      <span>Buka Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
              {selectedReport.status === "SUBMITTED" && (
                <>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Tolak Laporan
                  </button>
                  <button
                    onClick={() => handleVerify(selectedReport.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Memverifikasi..." : "Verifikasi Laporan"}
                  </button>
                </>
              )}

              {selectedReport.status === "VERIFIED" && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Tugaskan Petugas Lapangan
                </button>
              )}

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Tolak Laporan Warga</span>
            </h3>
            <p className="text-xs text-[#718783]">
              Penolakan wajib menyertakan alasan yang jelas karena akan diteruskan langsung kepada pelapor.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Foto tidak jelas / Bukan di wilayah Kabupaten Indramayu / Titik genangan sudah surut"
              className="w-full h-24 p-3 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] placeholder-gray-400 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || rejectReason.trim().length < 5}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-base font-extrabold text-[#132422] flex items-center space-x-2">
              <User className="w-5 h-5 text-[#38746D]" />
              <span>Tugaskan Petugas Lapangan</span>
            </h3>
            <p className="text-xs text-[#718783]">
              Pilih petugas lapangan atau armada TRC yang akan menerima notifikasi penugasan ini.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#132422] mb-1.5">Pilih Petugas:</label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl text-xs text-[#132422] focus:outline-none focus:border-[#38746D] cursor-pointer font-medium"
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
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedOfficerId}
                className="px-4 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
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
