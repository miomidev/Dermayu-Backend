"use client";

import { motion } from "motion/react";

export function WhyUsSection() {
  const cards = [
    {
      num: "01",
      title: "Desain Intuitif & Mudah",
      desc: "Antarmuka ramah pengguna yang memudahkan warga dan relawan melapor tanpa kendala teknis.",
    },
    {
      num: "02",
      title: "Skalabel & Terintegrasi",
      desc: "Mencakup 31 kecamatan di Indramayu dari posko hulu hingga pesisir pantai secara terpadu.",
    },
    {
      num: "03",
      title: "Aman & Terpercaya",
      desc: "Data laporan warga dan aduan darurat terlindungi dengan sistem verifikasi AI (CNN) serta validasi akuntabel petugas BPBD.",
    },
    {
      num: "04",
      title: "Siaga Tanggap 24/7",
      desc: "Dukungan darurat dan tim reaksi cepat BPBD siap merespons laporan warga kapan saja.",
    },
  ];

  return (
    <section
      id="cara-kerja"
      aria-label="Why Us Section"
      className="bg-white py-16 sm:py-20 lg:py-24 border-t border-[#E8F1EE] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Serasi dengan FeaturesSection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="text-xs font-bold tracking-widest text-[#38746D] uppercase">
            Keunggulan Platform
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#132422] mt-2">
            Mengapa Memilih DERMAYU?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#4B635F] leading-relaxed">
            Infrastruktur handal yang dirancang untuk kecepatan respons tanggap darurat dan kemudahan akses bagi seluruh lapisan masyarakat.
          </p>
        </motion.div>

        {/* Value Proposition Grid (2 Kolom di Mobile, 4 Kolom Berjejer di Web/Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-6xl mx-auto">
          {cards.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#D5E4E0] hover:border-[#38746D] bg-[#EEF5F3]/70 p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between text-left transition-all duration-300 shadow-2xs hover:shadow-lg group cursor-pointer min-h-[160px] sm:min-h-[190px] lg:min-h-[220px]"
            >
              {/* Layer Motion Fill: Mengisi warna Deep Teal dari Bawah ke Atas saat Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1D443F] to-[#2E6A63] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 pointer-events-none" />

              {/* Konten Kartu di Atas Layer Fill */}
              <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Nomor Urut 01, 02, 03, 04 di Pojok Kanan Atas */}
                <div className="flex justify-end items-start mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#38746D] group-hover:text-[#A4C6C1] transition-colors duration-300 font-sans">
                    {c.num}
                  </span>
                </div>

                {/* Judul & Deskripsi */}
                <div>
                  <h3 className="text-xs sm:text-sm lg:text-base font-bold text-[#132422] group-hover:text-white transition-colors duration-300 leading-snug mb-1 sm:mb-2">
                    {c.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] lg:text-xs text-[#4B635F] leading-relaxed group-hover:text-[#EEF5F3] transition-colors duration-300">
                    {c.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
