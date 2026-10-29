"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ShieldAlert, Zap, Activity, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function HeroSection() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleConfirmInstall = async () => {
    if (typeof window === "undefined") return;
    const promptEvent = (window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent })
      .__deferredInstallPrompt;

    if (!promptEvent) {
      alert("Aplikasi DERMAYU dapat dipasang instan melalui menu browser Anda (titik tiga atau Share) -> Tambahkan ke Layar Utama.");
      setShowInstallModal(false);
      return;
    }

    setInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log(`User interaction outcome: ${outcome}`);
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    } finally {
      setInstalling(false);
      (window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent | null }).__deferredInstallPrompt = null;
      setShowInstallModal(false);
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-x-clip bg-white bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(56,116,109,0.08),rgba(255,255,255,0))] pt-2 sm:pt-3 lg:pt-4 pb-12 sm:pb-16 lg:pb-20 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full min-h-[460px] sm:min-h-[500px] lg:min-h-[560px]">
        {/* Kolom Teks (Kiri): Terpusat Vertikal (Vertically Centered) Sejajar Sumbu Y */}
        <div className="lg:col-span-7 text-left flex flex-col justify-center items-start z-10 py-2 sm:py-4 lg:py-6 self-center">
          {/* Headline Utama: Meluncur Masuk Jauh dari Kiri (Cepat, Mantap & Halus) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative inline-block"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-[#132422] leading-[1.12]">
              Indramayu
              <br />
              Tanggap.
              <br />
              <span className="relative inline-block">
                Warga Selamat.
                {/* Coretan Garis Sage/Teal Bergelombang (Underline Scribble) */}
                <svg
                  className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3 pointer-events-none overflow-visible"
                  viewBox="0 0 280 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M3 12C50 5 150 4 277 9M35 15C95 9 200 9 265 14"
                    stroke="#38746D"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" as const, delay: 0.6 }}
                  />
                </svg>
              </span>
            </h1>
          </motion.div>

          {/* Deskripsi: Animasi Masuk Jauh dari Bawah ke Atas (Kecepatan Sedang & Mengalir Halus) */}
          <motion.p
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.05, delay: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[#4B635F] text-xs sm:text-sm max-w-sm sm:max-w-md mt-3 mb-5 leading-relaxed font-normal"
          >
            DERMAYU mengintegrasikan pantauan sensor Tinggi Muka Air (TMA) Sungai Cimanuk, pemetaan titik banjir real-time, dan koordinasi evakuasi cepat untuk melindungi warga dari risiko banjir luapan dan rob.
          </motion.p>

          {/* CTA Button Group: Animasi Masuk dari Bawah ke Atas (Lebih Lama Sedikit dari Deskripsi, Mendarat Santai) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.25, delay: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-wrap items-center gap-3 w-full sm:w-auto"
          >
            {/* 1. Tombol Primer: Unduh .APK */}
            <a
              href="#unduh-apk"
              onClick={(e) => {
                e.preventDefault();
                alert("File instalasi DERMAYU .APK sedang disiapkan untuk rilis publik Kabupaten Indramayu.");
              }}
              className="bg-[#38746D] text-white hover:bg-[#24544E] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 active:scale-95 w-full sm:w-auto"
            >
              {/* Android SVG Icon */}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.551 0 .9992.4486.9992 1.0003s-.4482 1.0003-.9992 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.5511 0 .9993.4486.9993 1.0003s-.4482 1.0003-.9993 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8533 8.125 12 8.125c-1.8533 0-3.5902.286-5.1378.8247L4.84 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
              <span>Unduh .APK</span>
            </a>

            {/* 2. Tombol Sekunder: Pasang PWA untuk iOS */}
            <button
              type="button"
              onClick={() => setShowInstallModal(true)}
              className="bg-white text-[#2E6A63] border border-[#A4C6C1] hover:bg-[#EEF5F3] hover:border-[#38746D] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              {/* Apple SVG Icon */}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.8 1.09-1.92.97-3.04-.94.04-2.08.63-2.75 1.42-.59.68-1.11 1.78-.97 2.87 1.05.08 2.1-.45 2.75-1.25z"/>
              </svg>
              <span>Pasang PWA untuk iOS</span>
            </button>
          </motion.div>
        </div>

        {/* Kolom Visual (Kanan): Dominan, Terpusat Vertikal & Bebas Crop dengan Gap Luas ke Header */}
        <div className="lg:col-span-5 flex items-center justify-center relative select-none w-full overflow-visible self-center mt-6 lg:mt-0">
          {/* Animasi Masuk: Kombinasi Simultan Slide-in Kanan & Ayunan Alami 2x (Kiri -> Kanan -> Tengah) Reaktif on Scroll */}
          <motion.div
            style={{ transformOrigin: "50% 95%" }}
            initial={{ x: 140, opacity: 0, rotate: 0 }}
            whileInView={{
              x: 0,
              opacity: 1,
              rotate: [0, -7, 5, 0],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              x: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
              opacity: { duration: 0.3, ease: "easeOut" as const },
              rotate: {
                duration: 0.9,
                times: [0, 0.35, 0.7, 1],
                ease: "easeInOut" as const,
              },
            }}
            className="relative z-10 flex items-center justify-center w-full overflow-visible origin-bottom"
          >
            <Image
              src="/hero-dermayu.png"
              alt="Antarmuka Pemantauan TMA dan Peringatan Dini DERMAYU Kabupaten Indramayu"
              width={700}
              height={912}
              className="w-[300px] sm:w-[390px] md:w-[450px] lg:w-[500px] xl:w-[560px] max-w-none h-auto object-contain drop-shadow-2xl mx-auto select-none"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* Modal Petunjuk PWA iOS / Android */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-left"
            >
              {/* Mobile Grab Handle */}
              <div className="flex justify-center -mt-2 mb-3 sm:hidden">
                <div className="h-1 w-10 bg-slate-200 rounded-full" />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>

              {/* App Identity Banner */}
              <div className="flex items-center gap-3.5 pr-8">
                <div className="relative h-14 w-14 rounded-2xl bg-[#EEF5F3] border border-[#A4C6C1]/60 p-2 shrink-0 shadow-xs flex items-center justify-center">
                  <Image
                    src="/dermayu-logo.webp"
                    alt="Logo DERMAYU"
                    width={44}
                    height={44}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#132422] leading-snug">
                    Pasang Aplikasi DERMAYU
                  </h3>
                  <p className="text-xs text-[#4B635F] mt-0.5">dermayu.indramayukab.go.id</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#38746D]">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#38746D]" />
                    <span>Peringatan Dini Offline &bull; Ringan &bull; 4.2 MB</span>
                  </div>
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

              {/* Platform Instructions */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#EEF5F3] border border-[#D5E4E0] text-xs text-[#132422]">
                <p className="font-bold flex items-center gap-1.5 text-[#132422]">
                  <Download className="h-4 w-4 text-[#38746D]" />
                  Langkah Pasang di iPhone / iPad (Safari):
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#4B635F]">
                  1. Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah bawah Safari.<br />
                  2. Gulir ke bawah &rarr; pilih <strong>&quot;Tambahkan ke Layar Utama (Add to Home Screen)&quot;</strong>.<br />
                  3. Ketuk <strong>Tambah</strong> di pojok kanan atas.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#D5E4E0] text-[#4B635F] hover:bg-[#EEF5F3] font-semibold text-xs transition cursor-pointer text-center"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInstall}
                  disabled={installing}
                  className="flex-2 py-3 px-5 rounded-full bg-[#38746D] hover:bg-[#24544E] active:scale-98 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  <Download className="h-4 w-4 text-[#EEF5F3]" />
                  <span>{installing ? "Memproses…" : "Pasang Sekarang"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
