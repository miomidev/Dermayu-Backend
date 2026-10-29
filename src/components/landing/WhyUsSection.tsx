"use client";

import { motion } from "motion/react";
import { CheckSquare, BarChart3, ShieldCheck, Headphones } from "lucide-react";

export function WhyUsSection() {
  const cards = [
    {
      icon: CheckSquare,
      title: "Desain Intuitif & Mudah",
      desc: "Antarmuka ramah pengguna yang memudahkan warga dan relawan melapor tanpa kendala teknis.",
    },
    {
      icon: BarChart3,
      title: "Skalabel & Terintegrasi",
      desc: "Mencakup 31 kecamatan di Indramayu dari posko hulu hingga pesisir pantai secara terpadu.",
    },
    {
      icon: ShieldCheck,
      title: "Aman & Terpercaya",
      desc: "Data laporan dan telemetri sensor terlindungi dengan sistem verifikasi data berbasis AI dan validasi petugas.",
    },
    {
      icon: Headphones,
      title: "Siaga Tanggap 24/7",
      desc: "Dukungan darurat dan tim reaksi cepat BPBD siap merespons laporan warga kapan saja.",
    },
  ];

  return (
    <section id="cara-kerja" aria-label="Why Us Section" className="bg-white py-16 sm:py-20 lg:py-24 border-t border-[#E8F1EE] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header Sesuai Wireframe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#132422]">
            Mengapa Memilih DERMAYU?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B635F] leading-relaxed">
            Infrastruktur handal yang dirancang untuk kecepatan respons tanggap darurat dan kemudahan akses bagi seluruh lapisan masyarakat.
          </p>
        </motion.div>

        {/* 4 Column Value Proposition Grid Sesuai Palet Pale Mint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
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
                whileHover={{ y: -3 }}
                className="rounded-3xl border border-[#D5E4E0] bg-[#EEF5F3]/70 hover:bg-[#EEF5F3] p-6 sm:p-7 flex flex-col justify-between text-left transition-all duration-150 shadow-2xs hover:shadow-sm group"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#A4C6C1]/60 text-[#38746D] shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#132422]">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4B635F] mt-2 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

