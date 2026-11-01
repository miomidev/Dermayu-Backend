"use client";

import { motion } from "motion/react";

const features = [
  {
    num: "Fitur Unggulan 1",
    title: "Lapor Kejadian & Genangan < 60 Detik",
    desc: "Formulir cepat bagi warga untuk melaporkan titik genangan, tanggul kritis, atau drainase tersumbat dilengkapi titik koordinat GPS otomatis, foto kamera bukti, dan kode tiket pelacakan transparan.",
    tags: ["GPS Presisi", "Formulir Cepat", "Tiket Terbuka"],
  },
  {
    num: "Fitur Unggulan 2",
    title: "Validasi Foto Cerdas Berbasis AI (CNN)",
    desc: "Model Convolutional Neural Network menyaring keaslian foto laporan secara instan guna mendeteksi hoaks, memvalidasi genangan air, dan memberi skor prioritas darurat bagi petugas.",
    tags: ["Deteksi Visual", "Anti-Hoaks", "Prioritas Otomatis"],
  },
  {
    num: "Fitur Unggulan 3",
    title: "Dering Evakuasi Berbasis Wilayah",
    desc: "Broadcast peringatan dini berprioritas tinggi melalui Web Push dan FCM langsung ke ponsel warga di radius rawan banjir berstatus Waspada, Siaga, hingga Evakuasi.",
    tags: ["Web Push PWA", "Radius Geolokasi", "Multi-Level Siaga"],
  },
  {
    num: "Fitur Unggulan 4",
    title: "Peta Sebaran & Direktori Titik Evakuasi",
    desc: "Peta interaktif spasial untuk memantau sebaran titik luapan air serta rute evakuasi mandiri bebas genangan menuju posko pengungsian terdekat dengan informasi kapasitas riil.",
    tags: ["Rute Bebas Banjir", "Kapasitas Posko", "Peta Interaktif"],
  },
];

export function FeaturesSection() {
  return (
    <section
      id="fitur"
      aria-label="Features Section"
      className="py-16 sm:py-20 lg:py-24 bg-white border-t border-[#E8F1EE] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-14"
        >
          <span className="text-xs font-bold tracking-widest text-[#38746D] uppercase">
            Fitur Utama
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#132422] mt-2">
            Teknologi Kesiapsiagaan &amp; Tanggap Bencana
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#4B635F] leading-relaxed">
            Arsitektur terpadu untuk percepatan respons banjir rob pesisir dan luapan DAS Cimanuk Kabupaten Indramayu.
          </p>
        </motion.div>

        {/* Grid 4 Kartu Minimalis (2 Kolom Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -3 }}
              className="bg-[#EEF5F3]/70 hover:bg-[#EEF5F3] border border-[#D5E4E0] rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-xs group"
            >
              <div>
                <span className="text-xs font-bold text-[#38746D] tracking-wider uppercase block mb-2">
                  {item.num}
                </span>

                <h3 className="text-lg sm:text-xl font-bold text-[#132422] leading-snug mb-2.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B635F] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[#D5E4E0]/60">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-medium text-[#1D443F] bg-white px-2.5 py-1 rounded-lg border border-[#D5E4E0] shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
