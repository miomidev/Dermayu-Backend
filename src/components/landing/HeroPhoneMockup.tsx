"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function HeroPhoneMockup() {
  return (
    <div className="relative w-[300px] sm:w-[390px] md:w-[450px] lg:w-[500px] xl:w-[560px] max-w-none mx-auto select-none translate-x-7.5 md:translate-x-0">
      {/* 1. Base Mockup Foto Tangan Menggenggam Ponsel */}
      <Image
        src="/hero-dermayu.png"
        alt="Antarmuka Pemantauan TMA dan Peringatan Dini DERMAYU Kabupaten Indramayu"
        width={700}
        height={912}
        className="w-full h-auto object-contain drop-shadow-2xl select-none pointer-events-none"
        priority
      />

      {/* 2. Layar Interaktif & Teranimasi Presisi Mengikuti Sumbu Layar HP di Tangan */}
      <div
        className="absolute overflow-hidden shadow-[inset_0_0_6px_rgba(0,0,0,0.3)] ring-1 ring-black/40 bg-[#F8FAF9]"
        style={{
          top: "4.05%",
          left: "17.19%",
          width: "43.75%",
          height: "73.61%",
          borderRadius: "9.2%",
        }}
      >
        {/* Gambar Dasbor Riil Warga DERMAYU 100% Presisi Tanpa Distorsi / Komponen Keluar Layar */}
        <img
          src="/mobile-dashboard-screen-clean.png"
          alt="Dasbor Pengguna DERMAYU"
          className="w-full h-full object-cover select-none pointer-events-none block"
          loading="eager"
        />

        {/* Animasi Efek Gelombang / Aura Latar Belakang Hero yang Bernafas Halus */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.2, 0.45, 0.2],
            rotate: [0, 6, 0],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute -top-[4%] -right-[4%] w-[58%] h-[28%] rounded-full bg-emerald-400/25 blur-xl pointer-events-none z-10"
        />

        {/* Animasi 3D Perahu Hero Tanggap Banjir Mengapung Naik-Turun Sesuai Permintaan */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            rotateY: [-5, 5, -5],
            rotateZ: [-1.2, 1.2, -1.2],
          }}
          transition={{
            duration: 3.8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute pointer-events-none z-20 flex items-center justify-center"
          style={{
            left: "54%",
            top: "8.2%",
            width: "44.5%",
            height: "27.5%",
          }}
        >
          <img
            src="/hero-dashboard-dermayu.png"
            alt="3D Rescue Boat DERMAYU"
            className="w-full h-full object-contain filter drop-shadow-md select-none"
          />
        </motion.div>

        {/* Pulse Dot Siaga Normal (Aman) Aktif Berdenyut Halus */}
        <span
          className="absolute w-[2%] h-[1%] rounded-full bg-emerald-400 animate-ping pointer-events-none z-10"
          style={{
            top: "39.8%",
            left: "67.8%",
          }}
        />
      </div>
    </div>
  );
}
