"use client";

import { motion } from "motion/react";

export function CtaBanner() {
  return (
    <section aria-label="CTA Heading Section" className="bg-white py-14 sm:py-20 border-t border-[#E8F1EE] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-[#EEF5F3] border border-[#D5E4E0] rounded-3xl p-8 sm:p-12 lg:p-14 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
        >
          {/* Aksen Lengkungan Halus di Sisi Kanan (Tidak Ter-crop Kaku) */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#E0ECE8] opacity-70 pointer-events-none -z-0" />
          <div className="absolute -right-6 -bottom-12 w-60 h-60 rounded-full bg-[#E0ECE8]/50 pointer-events-none -z-0" />

          {/* Kolom Teks Kiri */}
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4 text-left">
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#132422] leading-tight tracking-tight"
            >
              Siap Menghadapi Potensi Banjir Bersama?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-[#4B635F] text-xs sm:text-sm md:text-base leading-relaxed"
            >
              Tingkatkan kesiapsiagaan lingkungan Anda dengan pemantauan real-time dan pelaporan terpadu. Lindungi keluarga dan warga sekitar sekarang.
            </motion.p>
          </div>

          {/* Kolom Tombol Unduhan Kanan */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative z-10 flex flex-wrap sm:flex-nowrap gap-3.5 shrink-0 w-full sm:w-auto"
          >
            <a
              href="#download-apk"
              onClick={(e) => {
                e.preventDefault();
                alert("File instalasi DERMAYU .APK sedang disiapkan untuk rilis publik Kabupaten Indramayu.");
              }}
              className="bg-[#38746D] hover:bg-[#24544E] text-white text-xs sm:text-sm font-medium px-6 py-3 rounded-full shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.551 0 .9992.4486.9992 1.0003s-.4482 1.0003-.9992 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003s.4482-1.0003.9993-1.0003c.5511 0 .9993.4486.9993 1.0003s-.4482 1.0003-.9993 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8533 8.125 12 8.125c-1.8533 0-3.5902.286-5.1378.8247L4.84 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
              <span>Unduh .APK</span>
            </a>

            <a
              href="#install-pwa"
              onClick={(e) => {
                e.preventDefault();
                alert("Panduan PWA: Buka DERMAYU di Safari iOS, lalu pilih 'Share' -> 'Add to Home Screen'.");
              }}
              className="border border-[#38746D] bg-white text-[#38746D] hover:bg-[#E8F1EE] text-xs sm:text-sm font-medium px-6 py-3 rounded-full shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.8 1.09-1.92.97-3.04-.94.04-2.08.63-2.75 1.42-.59.68-1.11 1.78-.97 2.87 1.05.08 2.1-.45 2.75-1.25z"/>
              </svg>
              <span>Pasang PWA</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
