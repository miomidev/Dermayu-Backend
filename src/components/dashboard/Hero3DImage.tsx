"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface Hero3DImageProps {
  className?: string;
  imgClassName?: string;
  src?: string;
  alt?: string;
  /**
   * Mode rotasi animasi:
   * - "sway" (Default & Rekomendasi): Berayun bolak-balik tipis (-14deg s.d. 14deg) seperti perahu
   *   tim SAR mengapung dinamis di atas air tanpa memperlihatkan sisi belakang gambar yang datar/terbalik.
   * - "spin": Putaran 360 derajat kontinu tanpa henti (infinite loop linear).
   */
  rotationMode?: "sway" | "spin";
}

export function Hero3DImage({
  className = "w-34 h-34 sm:w-38 sm:h-38",
  imgClassName = "w-full h-full object-contain drop-shadow-md",
  src = "/hero-dashboard-dermayu.png",
  alt = "Tanggap Banjir DERMAYU",
  rotationMode = "sway",
}: Hero3DImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Motion values untuk melacak posisi pointer relatif dari titik pusat (-0.5 s.d. 0.5)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Physics spring config agar kemiringan tilt terasa kenyal, halus, dan stabil
  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const rawTiltX = useTransform(pointerY, [-0.5, 0.5], [14, -14]);
  const rawTiltY = useTransform(pointerX, [-0.5, 0.5], [-16, 16]);

  const springTiltX = useSpring(rawTiltX, springConfig);
  const springTiltY = useSpring(rawTiltY, springConfig);

  // Handler interaktif untuk pointer (mouse hover & mobile touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(Math.max(-0.5, Math.min(0.5, x)));
    pointerY.set(Math.max(-0.5, Math.min(0.5, y)));
    setIsInteracting(true);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    setIsInteracting(false);
  };

  // Konfigurasi animasi rotasi otomatis & efek mengapung (floating effect)
  const isSpin = rotationMode === "spin";

  const autoAnimation = isSpin
    ? {
        y: [0, -7, 0],
        rotateY: [0, 360],
        rotateX: [4, 4],
      }
    : {
        y: [0, -7, 0],
        rotateY: [-13, 13],
        rotateX: [5, -3, 5],
        rotateZ: [-1.5, 1.5],
      };

  const autoTransition = isSpin
    ? {
        y: {
          duration: 4,
          ease: "easeInOut" as const,
          repeat: Infinity,
        },
        rotateY: {
          duration: 25,
          ease: "linear" as const,
          repeat: Infinity,
        },
      }
    : {
        y: {
          duration: 4,
          ease: "easeInOut" as const,
          repeat: Infinity,
        },
        rotateY: {
          duration: 7.5,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "reverse" as const,
        },
        rotateX: {
          duration: 5.5,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "reverse" as const,
        },
        rotateZ: {
          duration: 6,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "reverse" as const,
        },
      };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative shrink-0 flex items-center justify-center select-none touch-pan-y overflow-visible cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Animasi 3D Parallax Hero DERMAYU"
    >
      {/* 1. Bayangan Dinamis di Bawah Objek (Breathing Drop Shadow Ellipse) */}
      <motion.div
        animate={{
          scale: isInteracting ? 0.92 : [1, 0.84, 1],
          opacity: isInteracting ? 0.28 : [0.36, 0.18, 0.36],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-5 rounded-[100%] bg-black/40 blur-md pointer-events-none"
      />

      {/* 2. Layer Interaktif 3D Tilt (Merespon Sentuhan/Pointer User) */}
      <motion.div
        style={{
          rotateX: springTiltX,
          rotateY: springTiltY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative flex items-center justify-center overflow-visible"
      >
        {/* 3. Layer Rotasi Otomatis & Efek Mengapung Melayang (Floating Bobbing Parallax) */}
        <motion.div
          animate={autoAnimation}
          transition={autoTransition}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          className="w-full h-full relative flex items-center justify-center overflow-visible"
        >
          {/* Gambar Diorama Hero DERMAYU */}
          <img
            src={src}
            alt={alt}
            className={`${imgClassName} pointer-events-none select-none`}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

