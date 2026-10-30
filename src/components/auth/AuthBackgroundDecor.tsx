"use client";

import { motion } from "motion/react";

export function AuthBackgroundDecor({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* ============================================================ */}
      {/* 1. LINGKARAN POJOK ATAS DENGAN KOTAK ORBIT                   */}
      {/*    Kotak berputar mengitari keliling lingkaran sesuai orbit  */}
      {/* ============================================================ */}
      {/* Ring Lingkaran Orbit Statis */}
      <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full border-2 border-white/20 opacity-35 pointer-events-none" />

      {/* Orbit Track yang Berputar Membawa Kotak Mengelilingi Lingkaran */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
      >
        {/* Kotak Satelit di Pinggir Keliling Orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/20 border border-white/35 backdrop-blur-2xs shadow-xs"
        />
      </motion.div>

      {/* ============================================================ */}
      {/* 2. DUA BELAH KETUPAT (MUTER PELAN DENGAN WAKTU BERBEDA)       */}
      {/* ============================================================ */}
      {/* Belah Ketupat 1 (Atas Kanan) - Putaran Searah Jarum Jam (28 detik) */}
      <motion.div
        animate={{ rotate: [45, 405] }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 right-12 w-20 h-20 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-2xs pointer-events-none shadow-xs"
      />

      {/* Belah Ketupat 2 (Bawah Kanan) - Putaran Berlawanan Jarum Jam (20 detik) */}
      <motion.div
        animate={{ rotate: [45, -315] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-1/3 right-1/4 w-14 h-14 border border-white/25 rounded-xl backdrop-blur-2xs pointer-events-none shadow-xs"
      />

      {/* ============================================================ */}
      {/* 3. BUNDAR POJOK BAWAH (ANIMASI KEMBANG KEMPIS / PULSE)        */}
      {/* ============================================================ */}
      {/* Ring Bundar Pojok Kanan Bawah */}
      <motion.div
        animate={{
          scale: [1, 1.14, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full border border-white/25 pointer-events-none"
      />

      {/* Ambient Glow Lingkaran Lembut di Kiri Bawah (Kembang Kempis Halus) */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.22, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-16 left-12 w-32 h-32 rounded-full bg-white/15 blur-xl pointer-events-none"
      />
    </div>
  );
}

