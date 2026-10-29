"use client";

import { motion } from "motion/react";
import { Shield, Radio, Droplets, HeartPulse, LifeBuoy } from "lucide-react";

const PARTNERS = [
  { name: "BPBD Indramayu", icon: Shield },
  { name: "BMKG Wilayah III", icon: Radio },
  { name: "BBWS Cimanuk", icon: Droplets },
  { name: "PMI Indramayu", icon: HeartPulse },
  { name: "Basarnas Pos SAR", icon: LifeBuoy },
];

export function PartnerLogos() {
  return (
    <section aria-label="Instansi & Mitra Terpadu" className="bg-white py-10 sm:py-14 border-b border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 sm:px-8"
      >
        <p className="text-center text-xs sm:text-sm font-medium text-gray-400 mb-6 sm:mb-8">
          Trusted by leading organizations across Indramayu
        </p>

        {/* 5 Logo Row Sesuai Wireframe */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-center justify-center">
          {PARTNERS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -2 }}
                className="flex items-center justify-center gap-2.5 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/60 px-4 py-3.5 transition-colors duration-150 select-none group cursor-default"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-300 text-neutral-700 group-hover:bg-neutral-400/80 transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {p.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

