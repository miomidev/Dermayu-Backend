"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "@/data/dermayuData";

const faqListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const faqItemVariants = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail("");
  };

  return (
    <section id="faq" aria-label="FAQ Section" className="border-t border-[#E8F1EE] bg-white py-16 sm:py-20 lg:py-24 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Kolom Kiri: Judul, Subjudul & Formulir Berlangganan (Animasi Staggered Bertahap) */}
          <div className="lg:col-span-5 text-left flex flex-col space-y-5">
            {/* 1. Judul FAQ Section */}
            <motion.h2
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#132422]"
            >
              Pertanyaan yang Sering Diajukan
            </motion.h2>

            {/* 2. Paragraf Deskripsi */}
            <motion.p
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-sm sm:text-base leading-relaxed text-[#4B635F] max-w-sm sm:max-w-md"
            >
              Temukan jawaban seputar pemantauan TMA, sistem peringatan dini, dan cara kerja pelaporan di platform DERMAYU.
            </motion.p>

            {/* 3. Label Stay up to date & Unified Capsule Form */}
            <div className="pt-4 border-t border-[#E8F1EE] space-y-3">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" as const }}
                className="text-sm font-semibold text-[#132422]"
              >
                Dapatkan Informasi Terkini
              </motion.p>

              {/* 4. Unified Pill Form Bar (Tinggi Presisi Senada Tombol Navbar: 42px) */}
              <motion.form
                onSubmit={handleSubscribe}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" as const }}
                className="relative flex items-center w-full max-w-md h-[42px] bg-white border border-[#D5E4E0] rounded-full p-0 overflow-hidden shadow-xs focus-within:border-[#38746D]"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  required
                  className="w-full h-full bg-transparent pl-4.5 pr-3 text-sm text-[#132422] placeholder-[#4B635F]/60 outline-none border-none"
                />

                {/* Tombol Subscribe Mandiri Rounded-Full (Tinggi & Padding Senada Navbar) */}
                <motion.button
                  type="submit"
                  initial={{ x: -280, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.85,
                    delay: 0.65,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="h-full px-6 bg-[#38746D] hover:bg-[#24544E] text-white text-sm font-medium rounded-full -mr-[1px] shrink-0 flex items-center justify-center transition-colors cursor-pointer border-none"
                >
                  Submit
                </motion.button>
              </motion.form>

              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold text-[#38746D]"
                >
                  Terima kasih! Anda telah terdaftar untuk menerima informasi terkini.
                </motion.p>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Daftar Akordeon Minimalis (Kontainer Stagger + Item Slide-Up) */}
          <motion.div
            variants={faqListVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="lg:col-span-7 space-y-3"
          >
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  variants={faqItemVariants}
                  className="rounded-2xl bg-[#EEF5F3]/70 hover:bg-[#EEF5F3] border border-[#D5E4E0]/60 transition-colors duration-150 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left px-5 py-4 sm:px-6 sm:py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38746D] cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-medium text-[#132422] pr-4 leading-snug">
                      {faq.q}
                    </span>
                    <span className="shrink-0 text-[#38746D] transition-colors">
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 sm:px-6 sm:pb-5">
                          <p className="text-xs sm:text-sm leading-relaxed text-[#4B635F]">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
