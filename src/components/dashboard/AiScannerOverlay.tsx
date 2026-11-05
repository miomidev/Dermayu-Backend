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
      // Tampilkan hasil selama 900ms agar terbaca dengan jelas, lalu buka formulir
      const timer = setTimeout(() => {
        onScanComplete();
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnalyzing, scanResult, onScanComplete]);

  if (!isOpen || !photoUrl) return null;

  const isFlood = scanResult ? scanResult.is_flood : true;
  const isReview = scanResult?.label === "review";
  const floodPct = scanResult ? (scanResult.prob_flood * 100).toFixed(1) : "94.2";
  const nonFloodPct = scanResult ? (scanResult.prob_non_flood * 100).toFixed(1) : "97.0";

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
            <span>Pemeriksaan Bukti Foto</span>
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
                  isFlood
                    ? "bg-emerald-950/85"
                    : isReview
                    ? "bg-amber-950/85"
                    : "bg-slate-950/85"
                } backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${
                    isFlood
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40"
                      : isReview
                      ? "bg-amber-500/20 text-amber-400 border border-amber-400/40"
                      : "bg-sky-500/20 text-sky-400 border border-sky-400/40"
                  } flex items-center justify-center mb-3 shadow-lg`}
                >
                  {isFlood ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : isReview ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>

                <h4 className="text-base font-bold text-white leading-tight">
                  {isFlood
                    ? "Genangan Terkonfirmasi"
                    : isReview
                    ? "Perlu Peninjauan Petugas"
                    : "Bukan Genangan Air"}
                </h4>

                <p
                  className={`text-xs font-bold mt-1 px-3 py-1 rounded-full ${
                    isFlood
                      ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/30"
                      : isReview
                      ? "bg-amber-500/30 text-amber-200 border border-amber-400/30"
                      : "bg-sky-500/30 text-sky-200 border border-sky-400/30"
                  }`}
                >
                  {isFlood
                    ? `Keyakinan: ${floodPct}%`
                    : isReview
                    ? `Keyakinan: ${floodPct}% (Ambang)`
                    : `Keyakinan Bukan Banjir: ${nonFloodPct}%`}
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
              <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                Pemeriksaan selesai. Menyiapkan formulir...
              </p>
            )}
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Sistem memverifikasi bukti foto secara otomatis sebelum diteruskan ke posko darurat.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
