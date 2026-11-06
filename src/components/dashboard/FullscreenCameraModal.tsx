"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  SwitchCamera,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Scan,
} from "lucide-react";

export interface FullscreenCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onSelectGallery: () => void;
}

export function FullscreenCameraModal({
  isOpen,
  onClose,
  onCapture,
  onSelectGallery,
}: FullscreenCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Inisialisasi MediaDevices Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function initCamera() {
      setIsInitializing(true);
      setCameraError(null);
      stopCamera();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser tidak mendukung WebRTC Camera.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setIsInitializing(false);
      } catch (err: unknown) {
        console.warn("Gagal membuka kamera langsung:", err);
        if (isMounted) {
          setCameraError(
            "Tidak dapat membuka live video. Anda dapat menggunakan kamera perangkat bawaan secara langsung."
          );
          setIsInitializing(false);
        }
      }
    }

    initCamera();

    // Lock body scroll and signal bottom nav to hide
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("hide-mobile-nav");

    return () => {
      isMounted = false;
      stopCamera();
      document.body.style.overflow = origOverflow;
      document.body.classList.remove("hide-mobile-nav");
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          stopCamera();
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="fullscreen-camera-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Kamera Layar Penuh"
      >
        {/* Hidden Fallback Input untuk Native Camera Capture */}
        <input
          ref={fallbackInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFallbackFileChange}
        />

        {/* ============================================================ */}
        {/* VIDEO FEED KAMERA                                            */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Izin Kamera Dibutuhkan</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {cameraError}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="w-full py-3.5 rounded-full bg-[#38746D] text-white font-bold text-sm shadow-lg hover:bg-[#24544E] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Perangkat Bawaan</span>
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {isInitializing && !cameraError && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-200">
                Menghubungkan sensor kamera...
              </span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* OVERLAY GARIS BIDIK / VIEWFINDER BOX                         */}
        {/* ============================================================ */}
        {!cameraError && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none px-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between p-4 overflow-hidden">
              {/* Sudut Siku-Siku Bidik (Viewfinder Brackets) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

              {/* Garis Laser Pemindai Bergerak Naik Turun */}
              <motion.div
                animate={{ y: [0, 220, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
              />

              {/* Tanda Crosshair Tengah */}
              <div className="w-4 h-4 rounded-full border border-emerald-400/60 flex items-center justify-center opacity-70">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
              </div>

              {/* Label Instruksi Panduan di Dalam Viewfinder */}
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-400/30 text-center shadow-lg">
                Arahkan kamera ke batas ketinggian genangan air
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOP BAR KAMERA: BATAL (X), STATUS & SAKELAR KAMERA           */}
        {/* ============================================================ */}
        <div className="relative z-20 px-4 pt-4 pb-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Tombol Batal / Tutup (X) */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all cursor-pointer border border-white/20"
            aria-label="Tutup Kamera"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge Mode Kamera */}
          <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Scanner Kamera</span>
          </div>

          {/* Sakelar Ganti Kamera Depan/Belakang */}
          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all cursor-pointer border border-white/20"
            aria-label="Ganti Kamera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM BAR KAMERA: SHUTTER & SHORTCUT GALERI                 */}
        {/* ============================================================ */}
        <div className="relative z-20 px-6 pt-3 pb-8 bg-gradient-to-t from-black via-black/70 to-transparent flex items-center justify-between">
          {/* Tombol Shortcut Galeri */}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
              onSelectGallery();
            }}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer w-14"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Galeri</span>
          </button>

          {/* Tombol Shutter Bundar Besar di Tengah Bawah */}
          {!cameraError && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isInitializing}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 shadow-2xl active:scale-90 transition-transform cursor-pointer"
              aria-label="Jepret Foto"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-emerald-50 active:bg-emerald-400 transition-colors shadow-inner flex items-center justify-center">
                <Scan className="w-6 h-6 text-slate-900" />
              </div>
            </button>
          )}

          {/* Tombol Bantuan / Info */}
          <div className="w-14 flex flex-col items-center gap-1 text-slate-300">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Auto</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
