"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Waves,
  Building2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Paperclip,
  Check,
  PhoneCall,
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
  text: string;
  time: string;
  media?: MediaAttachment[];
}

interface CommunityPost {
  id: string;
  authorName: string;
  authorDistrict: string;
  authorRole?: "WARGA" | "APARAT" | "RELAWAN";
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
    label: "Info Genangan Rob",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  LOGISTIK: {
    label: "Kebutuhan Bantuan & Logistik",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  GOTONG_ROYONG: {
    label: "Gotong Royong & Kerja Bakti",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RUTE: {
    label: "Rute Aman Terupdate",
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

export default function WargaKomunitasPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(initialMockPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // User session
  const session = getActiveSession();
  const currentUserName = session?.name || "Warga Indramayu";
  const currentUserDistrict = session?.district || "Kandanghaur - Eretan Wetan";

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

    // Reset Modal
    setModalContent("");
    setModalWaterLevel("");
    setModalMedia([]);
    setIsSubmittingPost(false);
    setIsModalOpen(false);

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

  // Role Badge Helper
  const renderAuthorBadge = (role?: "WARGA" | "APARAT" | "RELAWAN") => {
    if (role === "APARAT") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <ShieldAlert className="w-3 h-3 text-amber-700" />
          Pemerintah Desa / Pamong
        </span>
      );
    }
    if (role === "RELAWAN") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
          <ShieldCheck className="w-3 h-3 text-sky-700" />
          Relawan Tagana / BPBD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        Warga Terverifikasi
      </span>
    );
  };

  // Filter Posts
  const filteredPosts = posts.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesDistrict =
      selectedDistrict === "ALL" ||
      (p.authorDistrict &&
        p.authorDistrict.toLowerCase().includes(selectedDistrict.toLowerCase()));
    return matchesCategory && matchesDistrict;
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

      {/* HEADER KOMUNITAS WARGA SIAGA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E4E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EEF5F3] text-[#1D443F] text-[11px] font-bold border border-[#D5E4E0]">
            <Users className="w-3.5 h-3.5 text-[#38746D]" />
            <span>Kanal Informasi Warga Pantura</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#132422]">
            Kabar Lapangan & Gotong Royong Warga
          </h2>
          <p className="text-xs text-gray-600 max-w-xl">
            Informasi situasi air rob, ketersediaan jalur tembus, serta koordinasi bantuan antarwarga se-Kabupaten Indramayu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kabar Baru</span>
        </button>
      </div>

      {/* GRID UTAMA: KOLOM KIRI (FEED / DETAIL) + KOLOM KANAN (WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI (2 Kolom): In-Place Feed ATAU Detail View */}
        <div className="lg:col-span-2 space-y-5">
          {selectedPostId && activePost ? (
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
                    <div className="w-11 h-11 rounded-2xl bg-[#EEF5F3] border border-[#38746D]/20 text-[#1D443F] font-bold text-base flex items-center justify-center shrink-0">
                      {activePost.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#132422]">
                          {activePost.authorName}
                        </h3>
                        {renderAuthorBadge(activePost.authorRole)}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                        {activePost.authorDistrict} • {activePost.timeAgo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                      CATEGORY_MAP[activePost.category].badgeClass
                    }`}
                  >
                    {activePost.categoryLabel}
                  </span>
                </div>

                {/* Isi Teks Postingan */}
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
                  {activePost.content}
                </p>

                {/* Indikator Muka Air */}
                {activePost.waterLevel && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    <Waves className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Ketinggian Air Lapangan: {activePost.waterLevel}</span>
                  </div>
                )}

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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#132422]">{c.author}</span>
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
                  <p className="text-xs font-bold text-gray-700">Tulis Tanggapan Anda:</p>

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
              {/* Filter Bar (2 Baris: Kategori Topik & Wilayah Kecamatan) */}
              <div className="space-y-2.5 bg-[#F8FAF9] p-3 rounded-2xl border border-[#D5E4E0]">
                {/* Baris 1: Kategori Topik */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
                    Topik:
                  </span>
                  {[
                    { id: "ALL", label: "Semua Kabar" },
                    { id: "ROB", label: "Genangan & Rob" },
                    { id: "LOGISTIK", label: "Kebutuhan Logistik" },
                    { id: "GOTONG_ROYONG", label: "Gotong Royong" },
                    { id: "RUTE", label: "Rute Terupdate" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === tab.id
                          ? "bg-[#38746D] text-white shadow-2xs"
                          : "bg-white text-gray-600 border border-[#D5E4E0] hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Baris 2: Filter Wilayah Kecamatan */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x border-t border-gray-200/60 pt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
                    Wilayah:
                  </span>
                  {DISTRICT_FILTERS.map((df) => (
                    <button
                      key={df.id}
                      type="button"
                      onClick={() => setSelectedDistrict(df.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedDistrict === df.id
                          ? "bg-[#38746D] text-white font-bold shadow-2xs"
                          : "bg-white text-gray-600 border border-[#D5E4E0] hover:bg-gray-100"
                      }`}
                    >
                      {df.label}
                    </button>
                  ))}
                </div>
              </div>

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
                        setIsModalOpen(true);
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
                      {/* Header Post (Klik untuk Buka Detail) */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => setSelectedPostId(post.id)}
                          className="flex items-start gap-3 cursor-pointer group/author"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-[#EEF5F3] text-[#1D443F] font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 group-hover/author:bg-[#D5E4E0] transition-colors">
                            {post.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#132422] group-hover/author:text-[#38746D] transition-colors">
                                {post.authorName}
                              </h4>
                              {renderAuthorBadge(post.authorRole)}
                            </div>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#38746D]" />
                              {post.authorDistrict} • {post.timeAgo}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                            CATEGORY_MAP[post.category].badgeClass
                          }`}
                        >
                          {post.categoryLabel}
                        </span>
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

                      {/* Ketinggian Air (Jika Ada) */}
                      {post.waterLevel && (
                        <div
                          onClick={() => setSelectedPostId(post.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold cursor-pointer hover:bg-amber-100/70 transition-colors"
                        >
                          <Waves className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ketinggian Air: {post.waterLevel}</span>
                        </div>
                      )}

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
              href="/warga/posko"
              className="w-full py-2.5 rounded-2xl border border-[#D5E4E0] text-xs font-bold text-[#1D443F] hover:bg-[#EEF5F3] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lihat Pantauan Posko Resmi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Widget 2: Aksi Pelaporan Resmi BPBD */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-[#EEF5F3] to-[#E0ECE8] border border-[#88BDB6]/40 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-[#1D443F] text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>
            <h4 className="text-sm font-bold text-[#132422]">Butuh Evakuasi Segera?</h4>
            <p className="text-xs text-[#4B635F] leading-relaxed">
              Jika keluarga Anda terisolir dan butuh perahu karet SAR resmi dari BPBD Indramayu, kirim laporan tiket darurat sekarang.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/warga/lapor"
                className="w-full py-2.5 rounded-full bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                Buat Laporan Resmi BPBD
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="tel:112"
                className="w-full py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>Panggil Call Center 112</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL DIALOG POP-UP: BUAT KABAR WARGA                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border border-[#D5E4E0] shadow-2xl max-w-lg w-full p-6 space-y-5 my-auto"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#132422]">
                      Buat Kabar Warga
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Informasi lapangan untuk warga Indramayu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                {/* Identitas Pengirim */}
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAF9] border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-[#1D443F] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#132422] truncate">{currentUserName}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#38746D]" />
                      {currentUserDistrict}
                    </p>
                  </div>
                </div>

                {/* Pilih Kategori */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Kategori Kabar:</label>
                  <div className="grid grid-cols-2 gap-2">
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
                        className={`p-2.5 rounded-xl font-semibold border text-left transition-all cursor-pointer ${
                          modalCategory === c.id
                            ? "bg-[#EEF5F3] border-[#38746D] text-[#1D443F] shadow-2xs"
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
                    <label className="font-bold text-gray-700">
                      Estimasi Ketinggian Air (Opsional):
                    </label>
                    <input
                      type="text"
                      value={modalWaterLevel}
                      onChange={(e) => setModalWaterLevel(e.target.value)}
                      placeholder="Contoh: ± 30 cm (Semata Kaki / Setinggi Knalpot)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs text-[#132422] focus:outline-hidden focus:border-[#38746D]"
                    />
                  </div>
                )}

                {/* Textarea Konten */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Isi Kabar Warga:</label>
                  <textarea
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    placeholder="Tuliskan perkembangan situasi di jalan, RT/RW, tanggul, atau posko secara jelas..."
                    rows={4}
                    required
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E4E0] text-xs text-[#132422] placeholder-gray-400 focus:outline-hidden focus:border-[#38746D] resize-none"
                  />
                </div>

                {/* Multi-Upload Media (Foto / Video) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-700">
                      Lampiran Foto / Rekaman Video:
                    </label>
                    <span className="text-[10px] text-gray-400">
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
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {modalMedia.map((m, idx) => (
                        <div
                          key={m.id}
                          className="relative h-18 rounded-xl border border-[#38746D]/30 overflow-hidden bg-gray-100 group"
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
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
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
                      className="w-full py-2.5 rounded-xl border border-dashed border-[#88BDB6] bg-[#EEF5F3]/50 hover:bg-[#EEF5F3] text-[#1D443F] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#38746D]" />
                      <span>Unggah Foto / Video Lapangan</span>
                    </button>
                  )}
                </div>

                {/* Footer Modal Action */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!modalContent.trim() || isSubmittingPost}
                    className="px-6 py-2.5 rounded-xl bg-[#38746D] hover:bg-[#24544E] active:scale-98 disabled:opacity-40 text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingPost ? "Memproses..." : "Kirim Kabar Warga"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
