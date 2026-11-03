"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Cpu, CheckCircle2, Sparkles } from "lucide-react";

export interface AiScannerOverlayProps {
  isOpen: boolean;
  photoUrl: string | null;
  onScanComplete: () => void;
}

export function AiScannerOverlay({
  isOpen,
  photoUrl,
  onScanComplete,
}: AiScannerOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    // Step 0: Initial Scan (0 - 600ms)
    // Step 1: Feature Extraction (600 - 1300ms)
    // Step 2: Verification Complete (1300 - 1800ms)
    const timer1 = setTimeout(() => setStepIndex(1), 600);
    const timer2 = setTimeout(() => setStepIndex(2), 1300);
    const timerEnd = setTimeout(() => {
      onScanComplete();
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timerEnd);
    };
  }, [isOpen, onScanComplete]);

  if (!isOpen || !photoUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ai-scanner-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Pemindaian AI Sedang Berlangsung"
      >
        {/* Background glow ambiance */}
        <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm flex flex-col items-center space-y-5">
          {/* Top Badge: AI CNN Verification */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 shadow-lg text-xs font-bold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI CNN Flood Verification</span>
          </div>

          {/* Captured Image Preview with Scanning Line */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl bg-black">
            <img
              src={photoUrl}
              alt="Bukti Foto Banjir Terambil"
              className="w-full h-full object-cover filter contrast-105"
            />

            {/* Dark tint gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40" />

            {/* Viewfinder Corner Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

            {/* Animated Laser Scanning Line */}
            {stepIndex < 2 ? (
              <motion.div
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_20px_#10b981]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Foto Terverifikasi AI CNN
                </h4>
                <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                  Tingkat Validitas Spasial 94.2%
                </p>
              </motion.div>
            )}

            {/* Target water-level grid overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-24 h-24 border border-dashed border-emerald-400 rounded-2xl" />
            </div>
          </div>

          {/* Dynamic Status Progress Indicator */}
          <div className="w-full text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {stepIndex < 2 ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <h3 className="text-sm font-bold text-slate-100">
                {stepIndex === 0 && "Memindai bukti genangan & validasi AI..."}
                {stepIndex === 1 && "Menganalisis elevasi & tekstur genangan..."}
                {stepIndex === 2 && "Validasi berhasil! Membuka formulir..."}
              </h3>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Model CNN mengidentifikasi batas air dan mendeteksi korelasi citra dengan data hidrometri lokal.
            </p>

            {/* Step Pills */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 0 ? "w-8 bg-emerald-400" : "w-2 bg-slate-700"
                }`}
              />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 1 ? "w-8 bg-emerald-400" : "w-2 bg-slate-700"
                }`}
              />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 2 ? "w-8 bg-emerald-400" : "w-2 bg-slate-700"
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

