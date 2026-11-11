"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Clock,
  Sparkles,
  Smartphone,
  ArrowRight,
  ShieldAlert,
  Zap,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AppReleaseData {
  isReleased: boolean;
  downloadUrl: string;
  version: string;
  fileSize: string;
  releaseNotes: string;
}

interface ApkDevModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToPwa?: () => void;
}

export function ApkDevModal({ isOpen, onClose, onSwitchToPwa }: ApkDevModalProps) {
  const [release, setRelease] = useState<AppReleaseData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    fetch("/api/v1/app-release")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.data) {
          setRelease(data.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load release info:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleOpenPwa = () => {
    onClose();
    if (onSwitchToPwa) {
      onSwitchToPwa();
    } else {
      window.dispatchEvent(new CustomEvent("open-pwa-modal"));
    }
  };

  const handleDownloadApk = () => {
    if (!release?.downloadUrl) return;
    // Buka link Google Drive atau direct link di tab baru
    window.open(release.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const isLiveRelease = release?.isReleased && release?.downloadUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-left overflow-hidden"
          >
            {/* Mobile Grab Handle */}
            <div className="flex justify-center -mt-2 mb-3 sm:hidden">
              <div className="h-1 w-10 bg-slate-200 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Identity & Badge */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="relative mb-3.5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                    isLiveRelease
                      ? "bg-emerald-50 border border-emerald-200 text-[#38746D]"
                      : "bg-[#EEF5F3] border border-[#D5E4E0] text-[#38746D]"
                  }`}
                >
                  {/* Android Icon SVG */}
                  <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.551 0 .9992.4486.9992 1.0003s-.4482 1.0003-.9992 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.5511 0 .9993.4486.9993 1.0003s-.4482 1.0003-.9993 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8533 8.125 12 8.125c-1.8533 0-3.5902.286-5.1378.8247L4.84 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                  </svg>
                </div>
                {isLiveRelease ? (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-full text-white ring-2 ring-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-white ring-2 ring-white">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {isLiveRelease ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Rilis Resmi Android (Tersedia)</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#132422] leading-snug">
                    Aplikasi DERMAYU Siap Diunduh
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-1.5 leading-relaxed max-w-sm">
                    Versi resmi untuk smartphone Android Anda telah siap dipasang.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Tahap Pengembangan & Pengujian</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#132422] leading-snug">
                    Aplikasi .APK Sedang Disiapkan
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-1.5 leading-relaxed max-w-sm">
                    Saat ini untuk aplikasi <strong>.APK</strong> masih dalam tahap pengembangan. Nantikan pembaruan rilis selanjutnya!
                  </p>
                </>
              )}
            </div>

            {/* Kotak Informasi Sesuai Status */}
            {isLiveRelease ? (
              <div className="mt-4 p-4 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] text-xs text-[#132422] space-y-3">
                {/* Meta info tags */}
                <div className="flex items-center justify-between gap-2 border-b border-[#D5E4E0]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-mono font-bold text-[11px]">
                      {release?.version || "v1.0.0"}
                    </span>
                    <span className="text-[11px] text-[#4B635F] font-medium">
                      Ukuran: {release?.fileSize || "61.6 MB"}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#38746D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>

                {/* Release notes */}
                <div>
                  <div className="text-[11px] font-bold text-[#1D443F] mb-1">Catatan Pembaruan:</div>
                  <p className="text-[11px] text-[#4B635F] leading-relaxed">
                    {release?.releaseNotes || "Rilis resmi aplikasi Dermayu Android dengan rute evakuasi cerdas dan Google Maps."}
                  </p>
                </div>

                {/* Cloud storage note */}
                <div className="flex items-center gap-2 pt-1 text-[10.5px] text-[#4B635F]">
                  <Sparkles className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                  <span>Berkas disimpan di Google Drive resmi Dermayu (aman &amp; bebas virus).</span>
                </div>
              </div>
            ) : (
              /* Alternatif Solusi Cerdas: PWA Box */
              <div className="mt-4 p-4 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] text-xs text-[#132422]">
                <div className="flex items-center gap-2 text-[#132422] font-bold">
                  <Sparkles className="w-4 h-4 text-[#38746D] shrink-0" />
                  <span>Gunakan Versi PWA Tanpa Perlu Menunggu</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#4B635F]">
                  Aplikasi DERMAYU telah dilengkapi teknologi <strong>PWA (Progressive Web App)</strong>. Anda dapat langsung memasangnya ke layar utama smartphone secara instan, ringan, dan tanpa repot mengunduh berkas .APK.
                </p>

                {/* Grid Keunggulan PWA */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/80 border border-[#D5E4E0] text-[10.5px] text-[#24544E] font-medium">
                    <Zap className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                    <span className="truncate">Ringan & Hemat Kuota</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/80 border border-[#D5E4E0] text-[10.5px] text-[#24544E] font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                    <span className="truncate">Tampilan Native HP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-2.5">
              {isLiveRelease ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenPwa}
                    className="flex-1 py-3 px-3.5 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pasang PWA</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadApk}
                    className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-[#EEF5F3]" />
                    <span>Unduh .APK Sekarang</span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/80" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center"
                  >
                    Mengerti
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenPwa}
                    className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-[#EEF5F3]" />
                    <span>Pasang PWA Sekarang</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/80" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
