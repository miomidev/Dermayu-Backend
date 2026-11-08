"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Building2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Search,
  SlidersHorizontal,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Paperclip,
  Check,
  PhoneCall,
  MoreHorizontal,
} from "lucide-react";
import { getActiveSession } from "@/utils/authSession";

const STORAGE_KEY = "dermayu_community_posts";

interface MediaAttachment {
  id: string;
  type: "image" | "video";
  url: string; // Base64 data URL or object URL
  name: string;
}

interface CommentItem {
  id: string;
  author: string;
  authorDistrict?: string;
  authorRole?: "WARGA" | "APARAT" | "RELAWAN" | "PETUGAS";
  text: string;
  time: string;
  media?: MediaAttachment[];
}

interface CommunityPost {
  id: string;
  authorName: string;
  authorDistrict: string;
  authorRole?: "WARGA" | "APARAT" | "RELAWAN" | "PETUGAS";
  timeAgo: string;
  category: "ROB" | "LOGISTIK" | "GOTONG_ROYONG" | "RUTE";
  categoryLabel: string;
  content: string;
  waterLevel?: string;
  likesCount: number;
  userLiked: boolean;
  media?: MediaAttachment[];
  comments: CommentItem[];
}

const CATEGORY_MAP: Record<
  "ROB" | "LOGISTIK" | "GOTONG_ROYONG" | "RUTE",
  { label: string; badgeClass: string }
> = {
  ROB: {
    label: "Genangan Rob",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  LOGISTIK: {
    label: "Logistik",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  GOTONG_ROYONG: {
    label: "Gotong Royong",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RUTE: {
    label: "Rute Aman",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
  },
};

const initialMockPosts: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "Kang Dedi Suryadi",
    authorDistrict: "Eretan Wetan, Kandanghaur",
    authorRole: "WARGA",
    timeAgo: "15 menit yang lalu",
    category: "ROB",
    categoryLabel: "Info Genangan Rob",
    content:
      "Air pasang rob sore ini di wilayah RT 03/RW 01 mulai naik sekitar 35 cm menutupi jalan utama desa. Kendaraan roda dua matic disarankan melintas via tanggul barat karena sudah ditimbun karung pasir tadi siang.",
    waterLevel: "± 35 cm (Semata Kaki - Betis)",
    likesCount: 24,
    userLiked: false,
    comments: [
      {
        id: "c-101",
        author: "Pak Kusnan",
        authorDistrict: "Kandanghaur",
        text: "Matur kesuwun infonya Kang Dedi, tetangga sebelah sudah kami arahkan lewat jalur tanggul barat.",
        time: "10 menit lalu",
      },
    ],
  },
  {
    id: "post-2",
    authorName: "Kuwu Waryono",
    authorDistrict: "Desa Cantigi Kulon",
    authorRole: "APARAT",
    timeAgo: "45 menit yang lalu",
    category: "GOTONG_ROYONG",
    categoryLabel: "Gotong Royong & Kerja Bakti",
    content:
      "Alhamdulillah kerja bakti penguatan tanggul darurat di muara saluran sekunder telah selesai bersama pemuda Karang Taruna dan aparat desa. Pintu air sekunder sudah ditutup manual dan 150 karung pasir telah terpasang.",
    likesCount: 42,
    userLiked: true,
    comments: [
      {
        id: "c-102",
        author: "Ahmad Zarkasih",
        authorDistrict: "Cantigi Wetan",
        text: "Kompak selalu sedulur Pantura, semoga debit kali Cimanuk tetap stabil.",
        time: "30 menit lalu",
      },
    ],
  },
  {
    id: "post-3",
    authorName: "Relawan Posko Tagana",
    authorDistrict: "GOR Mini Kandanghaur",
    authorRole: "RELAWAN",
    timeAgo: "1 jam yang lalu",
    category: "LOGISTIK",
    categoryLabel: "Kebutuhan Bantuan & Logistik",
    content:
      "Dapur umum mandiri di GOR Mini Kandanghaur membutuhkan tambahan selimut hangat untuk balita dan lansia serta air mineral galon. Bagi warga yang ingin menitipkan bantuan logistik, meja penerimaan posko buka 24 jam di sayap barat.",
    likesCount: 38,
    userLiked: false,
    comments: [
      {
        id: "c-103",
        author: "H. Sukirno",
        authorDistrict: "Losarang",
        text: "Siap, 10 dus air mineral dan biskuit balita sedang kami antarkan langsung dengan pick-up.",
        time: "40 menit lalu",
      },
      {
        id: "c-104",
        author: "Ibu Maryati",
        authorDistrict: "Kandanghaur",
        text: "Apakah masih membutuhkan popok bayi ukuran M/L? Nanti saya titipkan melalui RT.",
        time: "25 menit lalu",
      },
    ],
  },
  {
    id: "post-4",
    authorName: "Pak Casmita",
    authorDistrict: "Desa Pasekan",
    authorRole: "WARGA",
    timeAgo: "2 jam yang lalu",
    category: "RUTE",
    categoryLabel: "Rute Aman Terupdate",
    content:
      "Jalur penghubung tanggul irigasi Pasekan ke arah Simpang Krangkeng terpantau kering dan bebas banjir rob. Pengendara motor roda dua dan mobil pickup pengangkut logistik bisa lewat sini dengan aman.",
    waterLevel: "Kering Bebas Genangan",
    likesCount: 19,
    userLiked: false,
    comments: [
      {
        id: "c-105",
        author: "Kang Rohman",
        authorDistrict: "Pasekan",
        text: "Matur kesuwun infonya Pak Casmita, sangat membantu pedagang pasar yang mau melintas.",
        time: "1 jam lalu",
      },
    ],
  },
];

const DISTRICT_FILTERS = [
  { id: "ALL", label: "Semua Wilayah" },
  { id: "Kandanghaur", label: "Kandanghaur" },
  { id: "Cantigi", label: "Cantigi" },
  { id: "Losarang", label: "Losarang" },
  { id: "Pasekan", label: "Pasekan" },
];

export function KomunitasView() {
  const pathname = usePathname();
  const [posts, setPosts] = useState<CommunityPost[]>(initialMockPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Create Post Inline State (Menggantikan Modal Popup)
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [modalCategory, setModalCategory] = useState<
    "ROB" | "LOGISTIK" | "GOTONG_ROYONG" | "RUTE"
  >("ROB");
  const [modalContent, setModalContent] = useState("");
  const [modalWaterLevel, setModalWaterLevel] = useState("");
  const [modalMedia, setModalMedia] = useState<MediaAttachment[]>([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Detail View Comment State
  const [commentText, setCommentText] = useState("");
  const [commentMedia, setCommentMedia] = useState<MediaAttachment[]>([]);

  // Refs
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // User session & RBAC Role Detection
  const session = getActiveSession();
  const isPetugasRoute = pathname?.startsWith("/petugas");
  const rawRole = (session?.role || (isPetugasRoute ? "petugas" : "warga")).toLowerCase();
  const isPetugas = isPetugasRoute || rawRole.includes("petugas") || rawRole.includes("officer") || rawRole.includes("admin");
  const currentUserName = session?.name || (isPetugas ? "Petugas TRC BPBD" : "Warga Indramayu");
  const currentUserDistrict = session?.district || (isPetugas ? "Pusdalops PB Indramayu" : "Kandanghaur - Eretan Wetan");

  // Click outside listener untuk dropdown filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Click outside listener untuk dropdown menu 3-titik
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuPostId(null);
    };
    if (activeMenuPostId) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [activeMenuPostId]);

  // FAB State & IntersectionObserver
  const topButtonRef = useRef<HTMLButtonElement>(null);
  const [isTopButtonVisible, setIsTopButtonVisible] = useState(true);
  const [isFabHidden, setIsFabHidden] = useState(false);
  const [hiddenEdge, setHiddenEdge] = useState<"right" | "left">("right");
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Jika di detail view atau sedang buat postingan inline, top button tidak dirender sehingga FAB selalu terpicu bila diaktifkan
    if (selectedPostId || isCreatingPost) {
      setIsTopButtonVisible(false);
      return;
    }

    const el = topButtonRef.current;
    if (!el) {
      setIsTopButtonVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTopButtonVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedPostId, isCreatingPost]);

  // FAB hanya muncul jika tidak sedang membuat post inline DAN (di tampilan Detail ATAU tombol atas sudah terscroll keluar layar)
  const shouldShowFab =
    !isCreatingPost && (selectedPostId !== null || !isTopButtonVisible);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    if (typeof window === "undefined") return;
    const screenWidth = window.innerWidth;
    const dropX = info.point.x;

    const distToRight = screenWidth - dropX;
    const distToLeft = dropX;

    // Jika digeser mendekati batas tepi kanan atau kiri layar (< 40px)
    if (distToRight < 40) {
      setHiddenEdge("right");
      setIsFabHidden(true);
    } else if (distToLeft < 40) {
      setHiddenEdge("left");
      setIsFabHidden(true);
    } else {
      setIsFabHidden(false);
    }
  };

  const handleFabClick = () => {
    if (isFabHidden) {
      // Jika user melakukan tap pada tab kecil yang menempel di tepi layar, kembalikan ke bentuk penuh
      setIsFabHidden(false);
    } else {
      setSelectedPostId(null);
      setIsCreatingPost(true);
    }
  };

  // 1. Initial LocalStorage Load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockPosts));
    } catch (e) {
      console.warn("Gagal membaca cache komunitas dari localStorage:", e);
    }
  }, []);

  // Helper to persist updates to localStorage
  const updateAndStorePosts = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage (kemungkinan kuota penuh):", e);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle file uploads (Images & Videos)
  const processFiles = async (files: FileList | null): Promise<MediaAttachment[]> => {
    if (!files || files.length === 0) return [];
    const attachments: MediaAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isVideo) continue;

      try {
        let fileUrl: string;
        // If file is > 4MB video, use createObjectURL to save localStorage size, else use Base64
        if (isVideo && file.size > 4 * 1024 * 1024) {
          fileUrl = URL.createObjectURL(file);
        } else {
          fileUrl = await fileToBase64(file);
        }

        attachments.push({
          id: `media-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          type: isVideo ? "video" : "image",
          url: fileUrl,
          name: file.name,
        });
      } catch (err) {
        console.error("Gagal memproses file media:", err);
      }
    }

    return attachments;
  };

  // Modal file select
  const handleModalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMedia = await processFiles(e.target.files);
    setModalMedia((prev) => [...prev, ...newMedia].slice(0, 5));
    if (modalFileInputRef.current) modalFileInputRef.current.value = "";
  };

  // Detail comment file select
  const handleCommentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMedia = await processFiles(e.target.files);
    setCommentMedia((prev) => [...prev, ...newMedia].slice(0, 3));
    if (commentFileInputRef.current) commentFileInputRef.current.value = "";
  };

  // Handle Like Interaction (Persists in localStorage)
  const handleToggleLike = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const isLikedNow = !p.userLiked;
      return {
        ...p,
        userLiked: isLikedNow,
        likesCount: isLikedNow ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      };
    });
    updateAndStorePosts(updated);
  };

  // Handle Share to Clipboard
  const handleSharePost = (post: CommunityPost) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `[Kabar Warga DERMAYU - ${post.categoryLabel}]\n` +
          `${post.authorName} (${post.authorDistrict}):\n"${post.content}"`
      );
      setToastMessage("Tautan & ringkasan kabar berhasil disalin ke papan klip!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Submit New Post from Modal Dialog
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalContent.trim()) return;

    setIsSubmittingPost(true);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: currentUserName,
      authorDistrict: currentUserDistrict,
      authorRole: isPetugas ? "PETUGAS" : "WARGA",
      timeAgo: "Baru saja",
      category: modalCategory,
      categoryLabel: CATEGORY_MAP[modalCategory].label,
      content: modalContent.trim(),
      waterLevel:
        modalCategory === "ROB" && modalWaterLevel.trim()
          ? modalWaterLevel.trim()
          : undefined,
      likesCount: 1,
      userLiked: true,
      media: modalMedia.length > 0 ? modalMedia : undefined,
      comments: [],
    };

    const updated = [newPost, ...posts];
    updateAndStorePosts(updated);

    // Reset Form & Inline View
    setModalContent("");
    setModalWaterLevel("");
    setModalMedia([]);
    setIsSubmittingPost(false);
    setIsCreatingPost(false);

    setToastMessage("Kabar warga berhasil dipublikasikan dan tersimpan!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit Comment in Detail View
  const handleAddComment = (postId: string) => {
    if (!commentText.trim() && commentMedia.length === 0) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: currentUserName,
      authorDistrict: currentUserDistrict,
      authorRole: isPetugas ? "PETUGAS" : "WARGA",
      text: commentText.trim(),
      time: "Baru saja",
      media: commentMedia.length > 0 ? commentMedia : undefined,
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, newComment],
      };
    });

    updateAndStorePosts(updated);
    setCommentText("");
    setCommentMedia([]);
  };

  // Helper Format Waktu Ringkas
  const formatShortTime = (time: string) => {
    return time
      .replace(" yang lalu", " lalu")
      .replace("menit", "mnt")
      .replace("Jam", "jam");
  };

  // Filter & Search Posts
  const activeFilterCount =
    (selectedCategory !== "ALL" ? 1 : 0) +
    (selectedDistrict !== "ALL" ? 1 : 0);

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.authorDistrict.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesDistrict =
      selectedDistrict === "ALL" ||
      (p.authorDistrict &&
        p.authorDistrict.toLowerCase().includes(selectedDistrict.toLowerCase()));
    return matchesSearch && matchesCategory && matchesDistrict;
  });

  // Current active post in detail view
  const activePost = posts.find((p) => p.id === selectedPostId);

  return (
    <div className="space-y-6 text-left">
      {/* TOAST ALERT */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER KOMUNITAS WARGA SIAGA (Hanya di Feed Utama, Sembunyikan di Detail & Mode Buat Kabar) */}
      {!selectedPostId && !isCreatingPost && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E4E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EEF5F3] text-[#1D443F] text-[11px] font-bold border border-[#D5E4E0]">
              <Users className="w-3.5 h-3.5 text-[#38746D]" />
              <span>Kanal Informasi Warga Pantura</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#132422]">
              Kabar Lapangan & Gotong Royong Warga
            </h2>
          </div>

          <button
            ref={topButtonRef}
            type="button"
            onClick={() => setIsCreatingPost(true)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kabar Baru</span>
          </button>
        </div>
      )}

      {/* GRID UTAMA: KOLOM KIRI (FEED / DETAIL / BUAT POST) + KOLOM KANAN (WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI (2 Kolom): In-Place Feed ATAU Detail View ATAU Buat Post Inline */}
        <div className="lg:col-span-2 space-y-5">
          {isCreatingPost ? (
            /* ========================================================= */
            /* 1. TAMPILAN INLINE BUAT KABAR WARGA (PENGGANTI MODAL)     */
            /* ========================================================= */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Tombol Kembali ke Feed */}
              <button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D5E4E0] hover:bg-[#EEF5F3] text-xs font-bold text-[#1D443F] shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Kabar Warga</span>
              </button>

              {/* Card Form Buat Kabar Warga Inline */}
              <div className="bg-white rounded-3xl border border-[#D5E4E0] shadow-xs p-6 sm:p-7 space-y-6">
                {/* Header Form */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#132422]">
                      Buat Kabar Warga
                    </h3>
                    <p className="text-xs text-gray-500">
                      Bagikan informasi perkembangan situasi di lapangan untuk warga sekitar
                    </p>
                  </div>
                </div>

                {/* Form Input */}
                <form onSubmit={handleCreatePost} className="space-y-5 text-xs sm:text-sm">
                  {/* Identitas Pengirim */}
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-100">
                    <div
                      className={`w-9 h-9 rounded-2xl ${
                        isPetugas ? "bg-[#38746D] text-white" : "bg-[#1D443F] text-white"
                      } font-bold text-sm flex items-center justify-center shrink-0`}
                    >
                      {isPetugas ? "P" : currentUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#132422] truncate">{currentUserName}</p>
                        {isPetugas && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38746D] text-white shadow-2xs">
                            Petugas TRC BPBD
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                        {currentUserDistrict}
                      </p>
                    </div>
                  </div>

                  {/* Pilih Kategori */}
                  <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">Kategori Kabar:</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: "ROB", label: "Info Genangan Rob" },
                        { id: "GOTONG_ROYONG", label: "Gotong Royong" },
                        { id: "RUTE", label: "Rute Terupdate" },
                        { id: "LOGISTIK", label: "Butuh Logistik" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setModalCategory(
                              c.id as "ROB" | "LOGISTIK" | "GOTONG_ROYONG" | "RUTE"
                            )
                          }
                          className={`p-3 rounded-2xl font-semibold border text-left transition-all cursor-pointer ${
                            modalCategory === c.id
                              ? "bg-[#EEF5F3] border-[#38746D] text-[#1D443F] shadow-2xs font-bold"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ketinggian Air (Khusus Rob) */}
                  {modalCategory === "ROB" && (
                    <div className="space-y-1.5">
                      <label className="font-bold text-gray-700 block">
                        Estimasi Ketinggian Air (Opsional):
                      </label>
                      <input
                        type="text"
                        value={modalWaterLevel}
                        onChange={(e) => setModalWaterLevel(e.target.value)}
                        placeholder="Contoh: ± 30 cm (Semata Kaki / Setinggi Knalpot)"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs sm:text-sm text-[#132422] focus:outline-hidden focus:border-[#38746D]"
                      />
                    </div>
                  )}

                  {/* Textarea Konten */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 block">Isi Kabar Warga:</label>
                    <textarea
                      value={modalContent}
                      onChange={(e) => setModalContent(e.target.value)}
                      placeholder="Tuliskan perkembangan situasi di jalan, RT/RW, tanggul, atau posko secara jelas..."
                      rows={5}
                      required
                      className="w-full p-4 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs sm:text-sm text-[#132422] placeholder-gray-400 focus:outline-hidden focus:border-[#38746D] resize-none"
                    />
                  </div>

                  {/* Multi-Upload Media (Foto / Video) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-700">
                        Lampiran Foto / Rekaman Video:
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {modalMedia.length}/5 file
                      </span>
                    </div>

                    <input
                      ref={modalFileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleModalFileSelect}
                    />

                    {/* Previews */}
                    {modalMedia.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                        {modalMedia.map((m, idx) => (
                          <div
                            key={m.id}
                            className="relative h-20 rounded-2xl border border-[#38746D]/30 overflow-hidden bg-gray-100 group"
                          >
                            {m.type === "video" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white text-[9px] p-1 text-center">
                                <VideoIcon className="w-4 h-4 mb-0.5 text-teal-400" />
                                Video
                              </div>
                            ) : (
                              <img
                                src={m.url}
                                alt="thumb"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setModalMedia((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tombol trigger upload */}
                    {modalMedia.length < 5 && (
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="w-full py-3 rounded-2xl border border-dashed border-[#88BDB6] bg-[#EEF5F3]/50 hover:bg-[#EEF5F3] text-[#1D443F] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-[#38746D]" />
                        <span>Unggah Foto / Video Lapangan</span>
                      </button>
                    )}
                  </div>

                  {/* Footer Form Action */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsCreatingPost(false)}
                      className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!modalContent.trim() || isSubmittingPost}
                      className="px-6 py-2.5 rounded-2xl bg-[#38746D] hover:bg-[#24544E] active:scale-98 disabled:opacity-40 text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingPost ? "Memproses..." : "Kirim Kabar Warga"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : selectedPostId && activePost ? (
            /* ========================================================= */
            /* 1. TAMPILAN DETAIL / DISKUSI IN-PLACE                    */
            /* ========================================================= */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Tombol Kembali ke Feed */}
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D5E4E0] hover:bg-[#EEF5F3] text-xs font-bold text-[#1D443F] shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Semua Kabar Warga</span>
              </button>

              {/* Kartu Post Utama Lengkap */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-5">
                {/* Header Post */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${
                        activePost.authorRole === "PETUGAS" ||
                        activePost.authorName.toLowerCase().includes("petugas")
                          ? "bg-[#38746D] text-white"
                          : "bg-[#EEF5F3] border border-[#38746D]/20 text-[#1D443F]"
                      } font-bold text-base flex items-center justify-center shrink-0`}
                    >
                      {activePost.authorRole === "PETUGAS" ||
                      activePost.authorName.toLowerCase().includes("petugas")
                        ? "P"
                        : activePost.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#132422]">
                        {activePost.authorName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                        <span>{activePost.authorDistrict.split(",")[0].trim()} • {formatShortTime(activePost.timeAgo)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Tombol Opsi / Salin Tautan */}
                  <button
                    type="button"
                    onClick={() => handleSharePost(activePost)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Salin Tautan Kabar"
                    aria-label="Opsi"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Isi Teks Postingan */}
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
                  {activePost.content}
                </p>

                {/* Lampiran Media Ukuran Penuh (Foto / Video) */}
                {activePost.media && activePost.media.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Lampiran Bukti Lapangan ({activePost.media.length}):
                    </p>
                    <div
                      className={`grid gap-3 ${
                        activePost.media.length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 sm:grid-cols-2"
                      }`}
                    >
                      {activePost.media.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl overflow-hidden border border-[#D5E4E0] bg-black/5"
                        >
                          {item.type === "video" ? (
                            <video
                              src={item.url}
                              controls
                              className="w-full max-h-80 object-cover rounded-2xl"
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full max-h-80 object-cover rounded-2xl hover:scale-101 transition-transform"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tombol Interaksi (Like, Share) */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(activePost.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        activePost.userLiked
                          ? "bg-rose-50 text-rose-600 font-bold border border-rose-200"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          activePost.userLiked ? "fill-rose-600" : ""
                        }`}
                      />
                      <span>{activePost.likesCount} Terbantu</span>
                    </button>

                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 bg-gray-50 border border-gray-100">
                      <MessageSquare className="w-4 h-4 text-[#38746D]" />
                      <span>{activePost.comments.length} Tanggapan Warga</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSharePost(activePost)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    title="Salin tautan kabar"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* THREAD KOMENTAR & DISKUSI */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-6">
                <h4 className="text-sm font-bold text-[#132422] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#38746D]" />
                  Tanggapan & Diskusi Warga ({activePost.comments.length})
                </h4>

                {/* List Komentar */}
                <div className="space-y-4">
                  {activePost.comments.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-dashed border-[#D5E4E0] text-center text-xs text-gray-500">
                      Belum ada tanggapan. Jadilah warga pertama yang memberikan informasi tambahan!
                    </div>
                  ) : (
                    activePost.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-100 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#132422]">{c.author}</span>
                            {(c.authorRole === "PETUGAS" ||
                              c.author.toLowerCase().includes("petugas") ||
                              c.authorDistrict?.toLowerCase().includes("pusdalops")) && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-50 text-[#38746D] border border-teal-200">
                                Petugas TRC BPBD
                              </span>
                            )}
                            {c.authorDistrict && (
                              <span className="text-[11px] text-gray-400">
                                • {c.authorDistrict}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">{c.time}</span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">{c.text}</p>

                        {/* Lampiran Media pada Komentar */}
                        {c.media && c.media.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                            {c.media.map((m) => (
                              <div
                                key={m.id}
                                className="rounded-xl overflow-hidden border border-gray-200 bg-black/5"
                              >
                                {m.type === "video" ? (
                                  <video
                                    src={m.url}
                                    controls
                                    className="w-full h-24 object-cover"
                                  />
                                ) : (
                                  <img
                                    src={m.url}
                                    alt={m.name}
                                    className="w-full h-24 object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Form Kirim Komentar dengan Dukungan Media */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700">Tulis Tanggapan Anda:</p>
                    <span className="text-[11px] text-gray-500">
                      Sebagai: <strong className="text-[#132422]">{currentUserName}</strong>{" "}
                      {isPetugas && (
                        <span className="text-[#38746D] font-bold">(Petugas TRC BPBD)</span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Bagikan perkembangan situasi terkini atau tanggapan..."
                      rows={3}
                      className="w-full p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs text-[#132422] placeholder-gray-400 focus:outline-hidden focus:border-[#38746D] resize-none"
                    />

                    {/* Preview Media Komentar yang Dipilih */}
                    {commentMedia.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {commentMedia.map((m, idx) => (
                          <div
                            key={m.id}
                            className="relative w-16 h-16 rounded-xl border border-[#38746D]/30 overflow-hidden shrink-0 group bg-gray-100"
                          >
                            {m.type === "video" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white text-[9px] p-1 text-center">
                                <VideoIcon className="w-4 h-4 mb-0.5 text-teal-400" />
                                Video
                              </div>
                            ) : (
                              <img
                                src={m.url}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setCommentMedia((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                              title="Hapus file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {/* Hidden File Input untuk Komentar */}
                      <input
                        ref={commentFileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleCommentFileSelect}
                      />

                      <button
                        type="button"
                        onClick={() => commentFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5E4E0] text-xs font-semibold text-gray-600 hover:bg-[#EEF5F3] hover:text-[#1D443F] transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-[#38746D]" />
                        <span>Lampirkan Foto/Video</span>
                      </button>

                      <button
                        type="button"
                        disabled={!commentText.trim() && commentMedia.length === 0}
                        onClick={() => handleAddComment(activePost.id)}
                        className="px-5 py-2 rounded-xl bg-[#38746D] hover:bg-[#24544E] disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Tanggapan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ========================================================= */
            /* 2. TAMPILAN FEED POSTINGAN UTAMA (TANPA FORM INLINE)    */
            /* ========================================================= */
            <div className="space-y-5">
              {/* DUA KOMPONEN SEJAJAR: SEARCH BAR (KIRI) & TOMBOL FILTER DROPDOWN (KANAN) */}
              <section
                className={`relative ${isFilterOpen ? "z-20" : "z-0"}`}
                ref={filterDropdownRef}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Search Bar Panjang */}
                  <div className="flex-1 bg-white rounded-full border border-[#D5E4E0] shadow-xs flex items-center px-4 h-12 gap-2.5 focus-within:border-[#38746D] transition-all">
                    <Search className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kabar, topik, atau wilayah..."
                      className="w-full bg-transparent text-xs sm:text-sm text-[#132422] placeholder-gray-400 outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer shrink-0"
                        title="Hapus pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Tombol Filter */}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className={`h-12 w-12 sm:w-auto sm:px-4.5 rounded-full border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs ${
                      isFilterOpen || activeFilterCount > 0
                        ? "bg-[#38746D] text-white border-[#38746D]"
                        : "bg-white hover:bg-[#F8FAF9] text-[#1D443F] border-[#D5E4E0]"
                    }`}
                    title="Filter Kabar Warga"
                    aria-expanded={isFilterOpen}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white text-[#38746D] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Dropdown Menu Mengambang */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 w-full sm:w-[420px] mt-2.5 bg-white rounded-3xl border border-[#D5E4E0] p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-30">
                    {/* Header Dropdown */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#38746D]" />
                        <h4 className="text-sm font-extrabold text-[#132422]">
                          Filter Kabar Warga
                        </h4>
                      </div>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory("ALL");
                            setSelectedDistrict("ALL");
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>

                    {/* Bagian 1: Pilih Topik */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Pilih Topik:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "ALL", label: "Semua Topik" },
                          { id: "ROB", label: "Genangan & Rob" },
                          { id: "LOGISTIK", label: "Kebutuhan Logistik" },
                          { id: "GOTONG_ROYONG", label: "Gotong Royong" },
                          { id: "RUTE", label: "Rute Terupdate" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedCategory(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedCategory === tab.id
                                ? "bg-[#38746D] text-white shadow-2xs"
                                : "bg-[#F8FAF9] text-gray-600 border border-[#D5E4E0] hover:bg-gray-100"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bagian 2: Pilih Wilayah */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Pilih Wilayah:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {DISTRICT_FILTERS.map((df) => (
                          <button
                            key={df.id}
                            type="button"
                            onClick={() => setSelectedDistrict(df.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              selectedDistrict === df.id
                                ? "bg-[#38746D] text-white font-bold shadow-2xs"
                                : "bg-[#F8FAF9] text-gray-600 border border-[#D5E4E0] hover:bg-gray-100"
                            }`}
                          >
                            {df.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer Tombol Selesai */}
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#38746D] text-white text-xs font-bold hover:bg-[#24544E] transition cursor-pointer"
                      >
                        Terapkan Filter
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Feed List */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-[#D5E4E0] text-center space-y-3">
                    <p className="text-sm font-bold text-gray-700">
                      Belum ada kabar warga pada kategori ini.
                    </p>
                    <p className="text-xs text-gray-500">
                      Jadilah yang pertama mengabarkan situasi di lingkungan Anda!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("ALL");
                        setSelectedDistrict("ALL");
                        setSearchQuery("");
                        setIsCreatingPost(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#38746D] text-white text-xs font-bold hover:bg-[#24544E] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Buat Kabar Sekarang
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4 hover:border-[#88BDB6] transition-all"
                    >
                      {/* Header Post: Info Penulis & Menu 3-Titik */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => setSelectedPostId(post.id)}
                          className="flex items-center gap-3 cursor-pointer group/author min-w-0"
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl ${
                              post.authorRole === "PETUGAS" ||
                              post.authorName.toLowerCase().includes("petugas")
                                ? "bg-[#38746D] text-white"
                                : "bg-[#EEF5F3] text-[#1D443F]"
                            } font-bold text-sm flex items-center justify-center shrink-0 group-hover/author:bg-[#D5E4E0] transition-colors`}
                          >
                            {post.authorRole === "PETUGAS" ||
                            post.authorName.toLowerCase().includes("petugas")
                              ? "P"
                              : post.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#132422] group-hover/author:text-[#38746D] transition-colors truncate">
                              {post.authorName}
                            </h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-[#38746D] shrink-0" />
                              <span className="truncate">{post.authorDistrict.split(",")[0].trim()} • {formatShortTime(post.timeAgo)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Titik 3 Menu Opsi Pengganti Tag Kategori */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            title="Opsi"
                            aria-label="Opsi"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuPostId === post.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-30 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleSharePost(post);
                                  setActiveMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Share2 className="w-3.5 h-3.5 text-gray-500" />
                                <span>Salin Tautan</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setToastMessage("Laporan konten telah dikirim ke tim moderator.");
                                  setTimeout(() => setToastMessage(null), 3000);
                                  setActiveMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer font-medium"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span>Laporkan Kabar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Area Isi Konten (Klik untuk Buka Selengkapnya) */}
                      <div
                        onClick={() => setSelectedPostId(post.id)}
                        className="cursor-pointer group/content space-y-2 text-left"
                      >
                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed line-clamp-3 group-hover/content:text-[#132422] transition-colors">
                          {post.content}
                        </p>
                        <span className="inline-block text-[11px] font-bold text-[#38746D] hover:text-[#1D443F] hover:underline cursor-pointer">
                          Buka Selengkapnya
                        </span>
                      </div>

                      {/* Thumbnail Media Preview (Jika Ada) */}
                      {post.media && post.media.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                          {post.media.slice(0, 3).map((item, idx) => {
                            const totalMedia = post.media?.length ?? 0;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedPostId(post.id)}
                                className="relative h-24 rounded-xl overflow-hidden border border-[#D5E4E0] bg-gray-100 cursor-pointer group"
                              >
                                {item.type === "video" ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white text-xs">
                                    <VideoIcon className="w-6 h-6 text-teal-300 mb-1" />
                                    <span className="text-[10px] font-semibold">Video</span>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                )}
                                {idx === 2 && totalMedia > 3 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                                    +{totalMedia - 3} lainnya
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Bar (Like, Lihat Diskusi, Share) */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Like Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                              post.userLiked
                                ? "bg-rose-50 text-rose-600 font-bold border border-rose-200"
                                : "hover:bg-gray-100 border border-transparent"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                post.userLiked ? "fill-rose-600" : ""
                              }`}
                            />
                            <span>{post.likesCount} Terbantu</span>
                          </button>

                          {/* Tombol Lihat Diskusi In-Place */}
                          <button
                            type="button"
                            onClick={() => setSelectedPostId(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#1D443F] font-bold transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-[#38746D]" />
                            <span>
                              {post.comments.length > 0
                                ? `${post.comments.length} Tanggapan`
                                : "Tanggapi"}
                            </span>
                          </button>
                        </div>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => handleSharePost(post)}
                          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          title="Salin tautan kabar"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (1 Kolom): Widget Informasi Posko & Panggilan Aksi */}
        <div className="space-y-5">
          {/* Widget 1: Posko Relawan Mandiri Aktif */}
          <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#132422] uppercase tracking-wider">
                  Posko Relawan Mandiri
                </h3>
                <p className="text-[11px] text-gray-500">Koordinasi logistik & dapur umum</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#132422]">Posko Tagana Eretan</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Kapasitas Dapur: 500 porsi/hari</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#132422]">Posko Pemuda Cantigi</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Siaga
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Armada: 2 Perahu Dayung Tradisional</p>
              </div>
            </div>

            <Link
              href={isPetugas ? "/petugas/posko" : "/warga/posko"}
              className="w-full py-2.5 rounded-2xl border border-[#D5E4E0] text-xs font-bold text-[#1D443F] hover:bg-[#EEF5F3] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lihat Pantauan Posko Resmi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Area Batas Drag FAB (Safe Area di atas Mobile Bottom Navigation) */}
      <div
        ref={dragBoundsRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ top: 75, bottom: 85, left: 10, right: 10 }}
      />

      {/* Floating Action Button (FAB) Draggable & Hideable */}
      <AnimatePresence>
        {shouldShowFab && (
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={dragBoundsRef}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: isFabHidden ? 0.5 : 1,
              x: isFabHidden ? (hiddenEdge === "right" ? 36 : -36) : 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed z-40 ${
              hiddenEdge === "right" ? "right-5" : "left-5"
            } bottom-24 pointer-events-auto touch-none select-none`}
          >
            <button
              type="button"
              onClick={handleFabClick}
              aria-label="Buat Kabar Baru"
              title={isFabHidden ? "Ketuk untuk membuka tombol" : "Buat Kabar Baru"}
              className="w-14 h-14 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-95 text-white shadow-xl flex items-center justify-center cursor-pointer transition-colors focus:outline-hidden focus:ring-4 focus:ring-[#38746D]/20 group relative overflow-hidden"
            >
              <Plus
                className={`w-6 h-6 stroke-[2.5] transition-transform ${
                  isFabHidden ? "scale-90" : "group-hover:rotate-90 duration-200"
                }`}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KomunitasView;
