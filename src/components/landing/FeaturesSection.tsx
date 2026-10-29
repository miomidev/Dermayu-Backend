"use client";

import { motion } from "motion/react";
import { Activity, Navigation, AlertTriangle, Bell, Waves, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      badge: "Fitur Unggulan 1",
      title: "Sensor Telemetri TMA 24/7",
      desc: "Pemantauan otomatis ketinggian muka air dan debit sungai setiap menit dari sensor radar Bendung Rentang hingga muara.",
      visual: (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/80 rounded-2xl border border-[#D5E4E0]/80">
          <div className="flex items-center gap-3 w-full max-w-xs p-3 rounded-xl bg-[#EEF5F3] shadow-2xs border border-[#D5E4E0] mb-2.5">
            <div className="h-8 w-8 rounded-lg bg-white text-[#38746D] border border-[#A4C6C1]/50 flex items-center justify-center shrink-0">
              <Waves className="h-4 w-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-[#132422] truncate">Sensor Radar Cimanuk</p>
              <p className="text-[11px] text-[#4B635F]">Ketinggian: 485 cm (Debit 412 m³/s)</p>
            </div>
            <span className="text-[10px] font-semibold text-[#38746D] bg-white border border-[#A4C6C1]/50 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          <div className="w-full max-w-xs h-1.5 bg-[#D5E4E0] rounded-full overflow-hidden">
            <div className="h-full bg-[#38746D] w-3/4 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      badge: "Fitur Unggulan 2",
      title: "Peta Rute Evakuasi Mandiri",
      desc: "Navigasi jalan darat cerdas dengan kontur jalan tertinggi bebas banjir menuju posko pengungsian terdekat tanpa terjebak genangan.",
      visual: (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/80 rounded-2xl border border-[#D5E4E0]/80">
          <div className="flex items-center gap-3 w-full max-w-xs p-3 rounded-xl bg-[#EEF5F3] shadow-2xs border border-[#D5E4E0]">
            <div className="h-8 w-8 rounded-lg bg-white text-[#38746D] border border-[#A4C6C1]/50 flex items-center justify-center shrink-0">
              <Navigation className="h-4 w-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-[#132422] truncate">Rute Jalur Tanggul Barat</p>
              <p className="text-[11px] text-[#38746D] font-medium">Bebas Banjir &bull; Estimasi 8 Menit</p>
            </div>
            <span className="text-[10px] font-bold text-[#132422] bg-white border border-[#A4C6C1]/50 px-2 py-0.5 rounded-md">
              1.2 km
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: "Fitur Unggulan 3",
      title: "Lapor Titik Banjir Cepat",
      desc: "Kirim laporan situasi darurat dan foto genangan lengkap dengan koordinat GPS otomatis langsung ke tim reaksi cepat BPBD.",
      visual: (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/80 rounded-2xl border border-[#D5E4E0]/80">
          <div className="flex items-center gap-3 w-full max-w-xs p-3 rounded-xl bg-[#EEF5F3] shadow-2xs border border-[#D5E4E0]">
            <div className="h-8 w-8 rounded-lg bg-white text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-[#132422] truncate">Laporan Genangan Warga</p>
              <p className="text-[11px] text-[#4B635F]">Desa Pasekan &bull; Kedalaman 40 cm</p>
            </div>
            <span className="text-[10px] font-semibold text-[#38746D] bg-white border border-[#A4C6C1]/50 px-2 py-0.5 rounded-full">
              Tervalidasi
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: "Fitur Unggulan 4",
      title: "Peringatan Dini Multi-Kanal",
      desc: "Notifikasi otomatis berjenjang (Siaga 3 Waspada, Siaga 2 Kritis, Siaga 1 Bahaya) dikirim langsung ke smartphone warga sebelum air meluap.",
      visual: (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/80 rounded-2xl border border-[#D5E4E0]/80">
          <div className="flex items-center gap-3 w-full max-w-xs p-3 rounded-xl bg-[#EEF5F3] shadow-2xs border border-[#D5E4E0]">
            <div className="h-8 w-8 rounded-lg bg-white text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-[#132422] truncate">Broadcast Siaga Rentang</p>
              <p className="text-[11px] text-rose-600 font-medium">Kenaikan TMA Terdeteksi Hulu</p>
            </div>
            <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
              Siaga 3
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="fitur" aria-label="Features Section" className="bg-white py-16 sm:py-20 lg:py-24 border-t border-[#E8F1EE] scroll-mt-20">
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
            Fitur Utama DERMAYU
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B635F] leading-relaxed">
            Sistem mitigasi terpadu yang menyatukan pemantauan debit sungai, navigasi evakuasi, dan koordinasi tim reaksi cepat di Kabupaten Indramayu.
          </p>
        </motion.div>

        {/* 2x2 Grid of 4 Feature Cards Sesuai Palet Pale Mint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-[#D5E4E0] bg-[#EEF5F3]/70 hover:bg-[#EEF5F3] p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-sm group"
            >
              <div className="text-left mb-6">
                <span className="text-xs font-bold text-[#38746D] tracking-wider uppercase">
                  {f.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#132422] mt-1">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B635F] mt-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              {/* Visual Placeholder Sesuai Wireframe */}
              <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden transition-transform duration-200 group-hover:scale-[1.01]">
                {f.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

