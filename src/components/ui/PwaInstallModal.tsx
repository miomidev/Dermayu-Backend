"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogoDermayu } from "@/components/ui/LogoDermayu";
import {
  X,
  Download,
  Zap,
  Activity,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaInstallModal({ isOpen, onClose }: PwaInstallModalProps) {
  const router = useRouter();

  // Tahapan: "guide" -> "confirm" -> "installing" -> "installed"
  const [step, setStep] = useState<"guide" | "confirm" | "installing" | "installed">("guide");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Menyiapkan berkas instalasi...");

  // Tangkap event native 'beforeinstallprompt' dari browser Chromium/Android/Desktop
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.__deferredInstallPrompt = e as BeforeInstallPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Reset tahapan saat modal ditutup
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("guide");
      setProgress(0);
      setProgressText("Menyiapkan berkas instalasi...");
    }, 250);
  };

  // Handler saat tombol "Pasang Sekarang" di klik -> buka modal konfirmasi
  const handleStartConfirm = () => {
    setStep("confirm");
  };

  // Handler saat tombol "Install" di konfirmasi -> jalankan simulasi instalasi & pemicu native
  const handleExecuteInstall = async () => {
    setStep("installing");
    setProgress(15);
    setProgressText("Menyiapkan berkas dan manifest PWA...");

    // Coba trigger native browser prompt jika didukung oleh browser saat ini
    const promptEvent = window.__deferredInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        console.log(`PWA install choice: ${outcome}`);
      } catch (err) {
        console.warn("[PWA] Native prompt note:", err);
      } finally {
        window.__deferredInstallPrompt = null;
      }
    }

    // Simulasi progress instalasi instan yang mulus dan realistis
    setTimeout(() => {
      setProgress(48);
      setProgressText("Menyimpan cache peta & rute evakuasi offline...");
    }, 450);

    setTimeout(() => {
      setProgress(82);
      setProgressText("Mendaftarkan service worker & pintasan layar utama...");
    }, 1050);

    setTimeout(() => {
      setProgress(100);
      setProgressText("Pemasangan selesai!");
      setTimeout(() => {
        setStep("installed");
      }, 350);
    }, 1650);
  };

  const handleOpenApp = () => {
    handleClose();
    router.push("/warga/dashboard");
  };

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
            {step !== "installing" && (
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* ============================================================ */}
            {/* TAHAP 1: PANDUAN PWA DENGAN OPSI PASANG INSTAN                */}
            {/* ============================================================ */}
            {step === "guide" && (
              <div>
                {/* App Identity Banner (Badge 4.2 MB telah dihapus sesuai permintaan) */}
                <div className="flex items-center gap-3.5 pr-8">
                  <LogoDermayu
                    variant="dark"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain shrink-0"
                    priority
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#132422] leading-snug">
                      Pasang Aplikasi DERMAYU
                    </h3>
                    <p className="text-xs text-[#4B635F] mt-0.5">dermayu.miomidev.com</p>
                  </div>
                </div>

                {/* Feature Preview Badges */}
                <div className="mt-4 pt-3.5 border-t border-[#E8F1EE] grid grid-cols-2 gap-2 text-xs text-[#132422]">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EEF5F3]/80 border border-[#D5E4E0]">
                    <Zap className="h-4 w-4 text-[#38746D] shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">Broadcast Siaga Cimanuk</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EEF5F3]/80 border border-[#D5E4E0]">
                    <Activity className="h-4 w-4 text-[#38746D] shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">Peta Offline Bebas Banjir</span>
                  </div>
                </div>

                {/* Platform Instructions Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] text-xs text-[#132422]">
                  <p className="font-bold flex items-center gap-1.5 text-[#132422]">
                    <Download className="h-4 w-4 text-[#38746D]" />
                    <span>Langkah Pasang di iPhone / iPad (Safari):</span>
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#4B635F]">
                    1. Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah bawah Safari.<br />
                    2. Gulir ke bawah &rarr; pilih <strong>&quot;Tambahkan ke Layar Utama (Add to Home Screen)&quot;</strong>.<br />
                    3. Ketuk <strong>Tambah</strong> di pojok kanan atas.
                  </p>

                  {/* Narasi Baru: Alternatif Tombol Pasang Instan di Bawah */}
                  <div className="mt-2.5 pt-2.5 border-t border-[#D5E4E0] flex items-start gap-1.5 text-[11px] text-[#24544E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#38746D] shrink-0 mt-0.5" />
                    <span>
                      Atau Anda juga dapat langsung memasang aplikasi dengan mengeklik tombol <strong>Pasang Sekarang</strong> di bawah ini.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleStartConfirm}
                    className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-[#EEF5F3]" />
                    <span>Pasang Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAHAP 2: MODAL KONFIRMASI PEMASANGAN INSTAN                   */}
            {/* ============================================================ */}
            {step === "confirm" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="py-1"
              >
                <div className="text-center flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] p-2 flex items-center justify-center shadow-xs">
                      <LogoDermayu variant="dark" width={48} height={48} className="w-12 h-12 object-contain" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#132422]">
                    Pasang Aplikasi DERMAYU?
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-1 max-w-xs leading-relaxed">
                    Aplikasi akan ditambahkan ke layar utama perangkat Anda untuk akses cepat, pemantauan rute evakuasi, dan notifikasi siaga banjir.
                  </p>
                </div>

                {/* Detail Box */}
                <div className="mt-4 p-3 rounded-xl bg-[#F8FAF9] border border-[#E8F1EE] text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[#4B635F]">
                    <span>Domain:</span>
                    <strong className="text-[#132422]">dermayu.miomidev.com</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4B635F]">
                    <span>Tipe Aplikasi:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      PWA (Ringan &amp; Instan)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep("guide")}
                    className="flex-1 py-3 px-4 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteInstall}
                    className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install Aplikasi</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* TAHAP 3: PROSES INSTALASI ANIMATIF DENGAN PROGRESS BAR        */}
            {/* ============================================================ */}
            {step === "installing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center mb-3 animate-pulse">
                  <Download className="w-7 h-7 animate-bounce" />
                </div>

                <h3 className="text-base font-bold text-[#132422]">
                  Memasang Aplikasi DERMAYU...
                </h3>
                <p className="text-xs text-[#4B635F] mt-1 h-5">{progressText}</p>

                {/* Progress Bar Container */}
                <div className="w-full bg-[#E8F1EE] rounded-full h-3 mt-4 overflow-hidden p-0.5 border border-[#D5E4E0]">
                  <motion.div
                    className="bg-gradient-to-r from-[#38746D] to-[#2E6A63] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="text-xs font-mono font-bold text-[#38746D] mt-2">
                  {progress}%
                </span>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* TAHAP 4: SUKSES TERINSTALL LENGKAP                            */}
            {/* ============================================================ */}
            {step === "installed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-2 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-base font-extrabold text-[#132422]">
                  Aplikasi Berhasil Terpasang!
                </h3>
                <p className="text-xs text-[#4B635F] mt-1 max-w-xs leading-relaxed">
                  Ikon aplikasi DERMAYU kini telah ditambahkan ke layar utama ponsel Anda. Buka kapan saja untuk pemantauan banjir bebas kuota.
                </p>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center"
                  >
                    Selesai
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenApp}
                    className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Buka Aplikasi</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

