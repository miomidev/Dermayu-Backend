"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "TAUTAN UTAMA",
    links: [
      { label: "Tentang", href: "/#tentang" },
      { label: "Fitur-fitur", href: "/#fitur" },
      { label: "Cara Kerja", href: "/#cara-kerja" },
      { label: "FAQ", href: "/#faq" },
      { label: "Panduan", href: "/panduan" },
    ],
  },
  {
    title: "MEDIA SOSIAL",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", isExternal: true },
      { label: "Instagram", href: "https://instagram.com", isExternal: true },
      { label: "X / Twitter", href: "https://x.com", isExternal: true },
      { label: "Facebook", href: "https://facebook.com", isExternal: true },
    ],
  },
  {
    title: "LEGALITAS",
    links: [
      { label: "Kebijakan Privasi", href: "/privacy" },
      { label: "Syarat & Ketentuan", href: "/terms" },
      { label: "Kebijakan Cookie", href: "/cookie" },
    ],
  },
];

const containerLinks = {
  hidden: { opacity: 0 },
  visible: (colIdx: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.5 + colIdx * 0.12,
    },
  }),
};

const itemLink = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function SiteFooter() {
  return (
    <footer className="border-t border-[#24544E] bg-[#1D443F] text-[#C7DBD7] overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-8 items-start">
          
          {/* 1. Zona Merah Kiri (Brand Logo & Deskripsi) */}
          <div className="md:col-span-5 flex flex-col space-y-4 text-left">
            {/* Logo Brand: Muncul Pertama */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2E6A63] text-white shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <Image
                    src="/dermayu-logo.webp"
                    alt="Logo DERMAYU"
                    width={20}
                    height={20}
                    className="object-contain w-4 h-4"
                  />
                </div>
                <span className="font-extrabold tracking-tight text-xl text-white">DERMAYU</span>
              </Link>
            </motion.div>

            {/* Paragraf Deskripsi: Muncul Menyusul Logo */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="max-w-sm text-xs sm:text-sm leading-relaxed text-[#C7DBD7]"
            >
              Platform mitigasi dan respons terpadu banjir Indramayu. Menghubungkan warga, relawan, dan pemangku kebijakan demi keselamatan bersama.
            </motion.p>
          </div>

          {/* 2 & 3. Kolom Kanan: Zona Merah Kanan Atas (Header) & Zona Biru Kanan Bawah (Link Navigasi) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left">
            {FOOTER_COLUMNS.map((col, colIdx) => (
              <div key={col.title} className="flex flex-col space-y-3">
                {/* Header Kolom Footer meluncur dari samping dengan delay bertahap */}
                <motion.h4
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.35 + colIdx * 0.12,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="text-xs font-semibold tracking-wider text-white uppercase"
                >
                  {col.title}
                </motion.h4>

                {/* Zona Biru Kanan Bawah: Daftar Link Navigasi Bertingkat (Cascading Stagger) */}
                <motion.ul
                  variants={containerLinks}
                  custom={colIdx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  className="space-y-2 text-xs sm:text-sm"
                >
                  {col.links.map((link) => (
                    <motion.li key={link.label} variants={itemLink}>
                      {link.isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C7DBD7] hover:text-white transition-colors block py-0.5"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[#C7DBD7] hover:text-white transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar: Kredit Tim (Meluncur dari Kiri ke Kanan) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-12 border-t border-[#2E6A63]/60 pt-8 text-left text-xs text-[#A4C6C1]"
        >
          <p>&copy; 2026 DERMAYU &middot; Tim POLIWINDRA</p>
        </motion.div>
      </div>
    </footer>
  );
}
