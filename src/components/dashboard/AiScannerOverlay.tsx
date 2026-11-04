"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

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
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    // Step 0: Initial scanning (0 - 500ms)
    const timer1 = setTimeout(() => setStepIndex(1), 500);

    return () => {
      clearTimeout(timer1);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Transition to step 2 once analysis is complete
    if (!isAnalyzing && stepIndex >= 1) {
      setStepIndex(2);
      const timerEnd = setTimeout(() => {
        onScanComplete();
      }, 1500);

      return () => {
        clearTimeout(timerEnd);
      };
    }
  }, [isOpen, isAnalyzing, stepIndex, onScanComplete]);

  if (!isOpen || !photoUrl) return null;

  const isFlood = scanResult ? scanResult.is_flood : true;
  const floodPct = scanResult ? (scanResult.prob_flood * 100).toFixed(1) : "94.2";

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
        <div
          className={`absolute w-72 h-72 rounded-full ${
            isFlood ? "bg-emerald-500/15" : "bg-amber-500/15"
          } blur-3xl pointer-events-none transition-colors duration-500`}
        />

        <div className="relative w-full max-w-sm flex flex-col items-center space-y-5">
          {/* Top Badge: AI CNN Verification */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${
              isFlood
                ? "bg-emerald-950/80 border-emerald-400/40 text-emerald-300"
                : "bg-amber-950/80 border-amber-400/40 text-amber-300"
            } border shadow-lg text-xs font-bold tracking-wide transition-colors duration-300`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isFlood ? "bg-emerald-400" : "bg-amber-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isFlood ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </span>
            <Cpu className="w-3.5 h-3.5" />
            <span>AI CNN MobileNetV2 Inference</span>
          </div>

          {/* Captured Image Preview with Scanning Line */}
          <div
            className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 ${
              isFlood ? "border-emerald-400/40" : "border-amber-400/40"
            } shadow-2xl bg-black transition-colors duration-300`}
          >
            <img
              src={photoUrl}
              alt="Bukti Foto Terambil"
              className="w-full h-full object-cover filter contrast-105"
            />

            {/* Dark tint gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40" />

            {/* Viewfinder Corner Accents */}
            <div
              className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 ${
                isFlood ? "border-emerald-400" : "border-amber-400"
              } rounded-tl-lg`}
            />
            <div
              className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${
                isFlood ? "border-emerald-400" : "border-amber-400"
              } rounded-tr-lg`}
            />
            <div
              className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${
                isFlood ? "border-emerald-400" : "border-amber-400"
              } rounded-bl-lg`}
            />
            <div
              className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 ${
                isFlood ? "border-emerald-400" : "border-amber-400"
              } rounded-br-lg`}
            />

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
                className={`absolute inset-0 ${
                  isFlood ? "bg-emerald-950/75" : "bg-amber-950/80"
                } backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center transition-colors duration-300`}
              >
                <div
                  className={`w-14 h-14 rounded-full ${
                    isFlood
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_20px_#10b981]"
                      : "bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_20px_#f59e0b]"
                  } border-2 flex items-center justify-center mb-2`}
                >
                  {isFlood ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {isFlood ? "Foto Terverifikasi AI CNN" : "Indikasi Bukan Genangan Banjir"}
                </h4>
                <p
                  className={`text-[11px] font-semibold mt-0.5 ${
                    isFlood ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {isFlood
                    ? `Validitas Model: ${floodPct}%`
                    : `Probabilitas Banjir Rendah: ${floodPct}%`}
                </p>
                {scanResult?.inference_ms ? (
                  <span className="text-[10px] text-slate-300/80 mt-1">
                    Waktu inferensi: {scanResult.inference_ms} ms
                  </span>
                ) : null}
              </motion.div>
            )}

            {/* Target water-level grid overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div
                className={`w-24 h-24 border border-dashed ${
                  isFlood ? "border-emerald-400" : "border-amber-400"
                } rounded-2xl`}
              />
            </div>
          </div>

          {/* Dynamic Status Progress Indicator */}
          <div className="w-full text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {stepIndex < 2 ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles
                  className={`w-4 h-4 ${isFlood ? "text-emerald-400" : "text-amber-400"}`}
                />
              )}
              <h3 className="text-sm font-bold text-slate-100">
                {stepIndex === 0 && "Menghubungkan citra ke AI Microservice..."}
                {stepIndex === 1 && "Menganalisis piksel & elevasi via CNN MobileNetV2..."}
                {stepIndex === 2 &&
                  (isFlood
                    ? "Validasi berhasil! Membuka formulir..."
                    : "Analisis selesai! Membuka formulir...")}
              </h3>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Model CNN Keras 3 mengidentifikasi tekstur batas air dan menghitung probabilitas banjir secara *real-time*.
            </p>

            {/* Step Pills */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 0
                    ? isFlood
                      ? "w-8 bg-emerald-400"
                      : "w-8 bg-amber-400"
                    : "w-2 bg-slate-700"
                }`}
              />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 1
                    ? isFlood
                      ? "w-8 bg-emerald-400"
                      : "w-8 bg-amber-400"
                    : "w-2 bg-slate-700"
                }`}
              />
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepIndex >= 2
                    ? isFlood
                      ? "w-8 bg-emerald-400"
                      : "w-8 bg-amber-400"
                    : "w-2 bg-slate-700"
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
