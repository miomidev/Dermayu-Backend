"use client";

import { motion } from "motion/react";

interface StatItem {
  value: string;
  line1: string;
  line2: string;
}

const STATS: StatItem[] = [
  { value: "31", line1: "Kecamatan", line2: "Wilayah Terpadu" },
  { value: "< 1 mnt", line1: "Lapor Cepat", line2: "GPS & Foto Bukti" },
  { value: "90%+", line1: "Validasi AI", line2: "Model Akurasi CNN" },
  { value: "4 Level", line1: "Dering Evakuasi", line2: "Siaga Tanggap BPBD" },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function StatsBar() {
  return (
    <section
      aria-label="Metrik & Indikator Kunci DERMAYU"
      className="relative z-20 w-full bg-[#38746D] text-white py-7 sm:py-8 lg:py-9 shadow-inner border-y border-[#2E6A63] select-none"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Kontainer Statistik Full-Bleed Sesuai Tema Deep Teal DERMAYU */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          className="w-full"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`flex items-center gap-3 sm:gap-4 justify-center text-left ${
                  idx > 0 && idx % 2 === 0 ? "pt-5 lg:pt-0" : ""
                } ${idx === 1 || idx === 3 ? "pt-5 sm:pt-0" : ""}`}
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white shrink-0">
                  {stat.value}
                </span>
                <div className="flex flex-col text-xs sm:text-sm text-[#EEF5F3] font-medium leading-tight">
                  <span className="font-semibold text-white">{stat.line1}</span>
                  <span className="text-[#C7DBD7]">{stat.line2}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
