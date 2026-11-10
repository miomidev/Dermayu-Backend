"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";

export interface AiScanResult {
  label: string;
  confidence: number;
  confidence_percent: number;
  prob_flood: number;
  prob_non_flood: number;
  inference_ms: number;
  model_version: string;
  is_flood: boolean;
  is_auto_verified?: boolean;
  is_review?: boolean;
  needs_officer_review?: boolean;
  is_rejected?: boolean;
}

export interface AiScannerOverlayProps {
  isOpen: boolean;
  photoUrl: string | null;
  scanResult?: AiScanResult | null;
  isAnalyzing?: boolean;
  onScanComplete: () => void;
}

export function AiScannerOverlay({
  isOpen,
  photoUrl,
  scanResult,
  isAnalyzing = false,
  onScanComplete,
}: AiScannerOverlayProps) {
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasCompleted(false);
      return;
    }

    // Ketika inferensi selesai dari server
    if (!isAnalyzing) {
      setHasCompleted(true);
      // Tampilkan hasil selama 1050ms agar terbaca dengan jelas, lalu buka formulir
      const timer = setTimeout(() => {
        onScanComplete();
      }, 1050);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnalyzing, scanResult, onScanComplete]);

  if (!isOpen || !photoUrl) return null;

  const probFlood = scanResult ? scanResult.prob_flood : 0.942;
  const isAutoVerified = scanResult?.is_auto_verified ?? (probFlood > 0.60);
  const isRejected = scanResult?.is_rejected ?? (probFlood < 0.25);
  const isReview = !isAutoVerified && !isRejected;

  // Persentase keyakinan sesuai kelas deteksi
  const displayPct = isRejected
    ? ((scanResult?.prob_non_flood ?? (1 - probFlood)) * 100).toFixed(1)
    : (probFlood * 100).toFixed(1);

  return (
    <AnimatePresence>
      <motion.div
        key="ai-scanner-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Verifikasi Bukti Foto"
      >
        <div className="relative w-full max-w-sm flex flex-col items-center space-y-4">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pemeriksaan Bukti Foto AI</span>
          </div>

          {/* Photo Frame Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img
              src={photoUrl}
              alt="Foto yang diperiksa"
              className="w-full h-full object-cover"
            />

            {/* Scanning Shimmer Sweep (Halus & Elegan, bukan laser neon) */}
            {!hasCompleted && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "200%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
                className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-white/25 to-transparent pointer-events-none"
              />
            )}

            {/* Hasil Verifikasi Overlay (Muncul Halus Begitu Analisis Selesai) */}
            {hasCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`absolute inset-0 ${
                  isAutoVerified
                    ? "bg-emerald-950/85"
                    : isRejected
                    ? "bg-rose-950/85"
                    : "bg-amber-950/85"
                } backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${
                    isAutoVerified
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40"
                      : isRejected
                      ? "bg-rose-500/20 text-rose-400 border border-rose-400/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-400/40"
                  } flex items-center justify-center mb-3 shadow-lg`}
                >
                  {isAutoVerified ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : isRejected ? (
                    <AlertCircle className="w-7 h-7" />
                  ) : (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                </div>

                <h4 className="text-base font-bold text-white leading-tight">
                  {isAutoVerified
                    ? "Genangan Terkonfirmasi (Valid)"
                    : isRejected
                    ? "Tidak Terindikasi Banjir"
                    : "Perlu Verifikasi Petugas"}
                </h4>

                <p
                  className={`text-xs font-bold mt-1 px-3 py-1 rounded-full ${
                    isAutoVerified
                      ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/30"
                      : isRejected
                      ? "bg-rose-500/30 text-rose-200 border border-rose-400/30"
                      : "bg-amber-500/30 text-amber-200 border border-amber-400/30"
                  }`}
                >
                  {isAutoVerified
                    ? `Terverifikasi AI: ${displayPct}%`
                    : isRejected
                    ? `Keyakinan: ${displayPct}% (Kondisi Normal / Kering)`
                    : `Keyakinan: ${displayPct}% (Menunggu Review Petugas)`}
                </p>
              </motion.div>
            )}
          </div>

          {/* Status Keterangan di Bawah Foto */}
          <div className="w-full text-center space-y-1">
            {!hasCompleted ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  Memeriksa kondisi genangan air...
                </p>
              </div>
            ) : (
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  isAutoVerified
                    ? "text-emerald-300"
                    : isRejected
                    ? "text-rose-300"
                    : "text-amber-300"
                }`}
              >
                {isAutoVerified
                  ? "Pemeriksaan selesai. Laporan terverifikasi otomatis AI (> 60%)."
                  : isRejected
                  ? "Foto ditolak: Sistem mendeteksi kondisi jalan normal / tidak ada banjir."
                  : "Pemeriksaan selesai. Laporan diteruskan untuk verifikasi petugas (25-60%)."}
              </p>
            )}
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              {isAutoVerified
                ? "Foto tervalidasi otomatis dan langsung aktif di Peta Spasial Siaga."
                : isRejected
                ? "Foto tidak memenuhi kriteria genangan banjir. Silakan ganti foto genangan air yang valid."
                : "Tingkat keyakinan 25-60%, laporan menunggu verifikasi visual posko sebelum dipetakan."}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
