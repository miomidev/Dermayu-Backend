"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { PwaInstallModal } from "@/components/ui/PwaInstallModal";

export function HeroSection() {
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Sinkronisasi pendengar event global jika tombol PWA di CtaBanner atau navbar diklik
  useEffect(() => {
    const handleOpen = () => setShowInstallModal(true);
    window.addEventListener("open-pwa-modal", handleOpen);
    return () => window.removeEventListener("open-pwa-modal", handleOpen);
  }, []);

  return (
    <section
      id="beranda"
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
            Sistem mitigasi dan tanggap darurat banjir terpadu di Indramayu. Hadir dengan peringatan dini, aduan darurat warga, dan panduan jalur evakuasi bebas genangan menuju posko terdekat.
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
              className="w-[300px] sm:w-[390px] md:w-[450px] lg:w-[500px] xl:w-[560px] max-w-none h-auto object-contain drop-shadow-2xl mx-auto select-none translate-x-7.5 md:translate-x-0"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* Modal Petunjuk PWA iOS / Android */}
      <PwaInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </section>
  );
}
