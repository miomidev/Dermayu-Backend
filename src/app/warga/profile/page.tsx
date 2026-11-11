"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  ShieldCheck,
  Check,
  Radio,
  Home,
  Save,
  CheckCircle2,
  Compass,
  Pencil,
} from "lucide-react";
import { getActiveSession, saveUserSession, type UserSession } from "@/utils/authSession";

export default function WargaProfilePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [fullName, setFullName] = useState("Pak Kusnan");
  const [phone, setPhone] = useState("0812-9844-1120");
  const [email, setEmail] = useState("warga@dermayu.id");
  const [district, setDistrict] = useState("Kandanghaur");
  const [village, setVillage] = useState("Eretan Wetan");
  const [rtRw, setRtRw] = useState("RT 04 / RW 02 Blok Karanganyar");
  const [evacMeetingPoint, setEvacMeetingPoint] = useState("Halaman Masjid Al-Ikhlas Blok Karanganyar");

  // Preferensi Notifikasi Toggles
  const [notifyRob, setNotifyRob] = useState(true);
  const [notifyCimanuk, setNotifyCimanuk] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const active = getActiveSession();
    if (active) {
      setSession(active);
      if (active.name || active.fullName) setFullName(active.fullName || active.name);
      if (active.email) setEmail(active.email);
      if (active.phone) setPhone(active.phone);
      if (active.address) setRtRw(active.address);
      if (active.village) setVillage(active.village);
      if (active.district) {
        const parts = active.district.split("-").map((s) => s.trim());
        if (parts.length > 1) {
          setDistrict(parts[0]);
          if (!active.village) setVillage(parts[1]);
        } else {
          setDistrict(active.district);
        }
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Simpan ke helper authSession
    saveUserSession({
      name: fullName,
      fullName,
      email: email,
      role: "warga",
      phone: phone,
      district: district,
      village: village,
      address: rtRw,
      isProfileComplete: true,
    });

    fetch("/api/v1/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName,
        phone,
        districtName: district,
        villageName: village,
        address: rtRw,
      }),
    }).catch(() => {});

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initialLetter = fullName.trim().charAt(0).toUpperCase() || "W";

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl space-y-6"
      >
        {/* Banner Alert Sukses */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Perubahan data profil & preferensi evakuasi Anda berhasil disimpan ke sistem DERMAYU.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="text-xs text-emerald-700 underline font-bold"
            >
              Tutup
            </button>
          </motion.div>
        )}

        {/* 1. HERO CARD PROFIL TERPUSAT (MATCHING GAMBAR 2) */}
        <div className="bg-white border border-[#D5E4E0] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col items-center text-center">
          {/* Avatar Inisial Bulat Sempurna (Centered) */}
          <div className="relative">
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-[#EEF5F3] border-2 border-[#38746D]/20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-[#1D443F] shadow-sm shrink-0">
              {initialLetter}
            </div>
          </div>

          {/* Nama Lengkap */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#132422] mt-3.5 tracking-tight">
            {fullName}
          </h2>

          {/* Email */}
          <p className="text-xs sm:text-sm text-[#4B635F] mt-1 font-medium">
            {email}
          </p>

          {/* Info Badge & Lokasi */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Akun Warga Terverifikasi
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
              Kecamatan {district}, Desa {village}
            </span>
          </div>

          {/* Tombol Edit Profile Pill Hijau Deep Teal Sesuai Tema DERMAYU */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const formEl = document.getElementById("form-profil-warga");
                formEl?.scrollIntoView({ behavior: "smooth" });
                const firstInput = formEl?.querySelector("input");
                firstInput?.focus();
              }}
              className="h-9 px-4.5 sm:px-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#38746D] hover:bg-[#2E6A63] active:bg-[#1D443F] text-white text-xs font-bold shadow-sm shadow-[#38746D]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* 2. FORMULIR DATA PROFIL & DOMISILI */}
        <motion.form
          id="form-profil-warga"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSave}
          className="bg-white border border-[#D5E4E0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-7"
        >
          {/* Bagian Kontak */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Informasi Akun & Kontak</h3>
            <p className="text-xs text-[#4B635F] mb-4">
              Nomor WhatsApp akan digunakan tim evakuasi BPBD saat konfirmasi penyelamatan darurat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Nama Lengkap Sesuai KTP
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Email Terdaftar</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full h-11 bg-gray-100 border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Email digunakan sebagai identifikasi autentikasi sistem dan tidak dapat diubah sembarangan.
                </span>
              </div>
            </div>
          </div>

          <hr className="border-[#D5E4E0]/60" />

          {/* Bagian Domisili Evakuasi */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Zona Domisili Mitigasi & Titik Kumpul</h3>
            <p className="text-xs text-[#4B635F] mb-4">
              Data ini digunakan untuk menentukan rekomendasi posko darurat terdekat dan navigasi rute bebas banjir.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Kecamatan Domisili</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Desa / Kelurahan</label>
                <div className="relative flex items-center">
                  <Home className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">RT / RW & Blok Rumah</label>
                <input
                  type="text"
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  placeholder="Contoh: RT 04 / RW 02 Blok Karanganyar"
                  className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">
                  Titik Kumpul Keluarga (Safe Rendezvous)
                </label>
                <div className="relative flex items-center">
                  <Compass className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={evacMeetingPoint}
                    onChange={(e) => setEvacMeetingPoint(e.target.value)}
                    placeholder="Contoh: Halaman Masjid Al-Ikhlas"
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#D5E4E0]/60" />

          {/* Bagian Preferensi Notifikasi */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Preferensi Notifikasi Bencana (EWS)</h3>
            <p className="text-xs text-[#4B635F] mb-4">
              Tentukan saluran informasi darurat yang ingin Anda terima secara real-time.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">
                    Peringatan Dini Rob Pesisir & Pasang Laut
                  </span>
                  <span className="text-[11px] text-[#4B635F]">
                    Kirim notifikasi saat sensor telemetri Eretan / Cantigi mendeteksi kenaikan air laut &gt; 50 cm.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRob}
                  onChange={(e) => setNotifyRob(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">
                    Peringatan Debit Luapan Kali Cimanuk
                  </span>
                  <span className="text-[11px] text-[#4B635F]">
                    Terima alarm saat SCADA Bendung Rentang mengeluarkan status Siaga 2 atau Siaga 1.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCimanuk}
                  onChange={(e) => setNotifyCimanuk(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">
                    SMS Siaga Darurat (Offline Fallback)
                  </span>
                  <span className="text-[11px] text-[#4B635F]">
                    Kirim broadcast SMS otomatis dari BPBD jika pemadaman listrik mematikan jaringan data seluler.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Tombol Simpan & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              {saved && (
                <>
                  <Check className="w-4 h-4" />
                  Perubahan data profil berhasil disimpan.
                </>
              )}
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  const active = getActiveSession();
                  if (active) setFullName(active.name);
                }}
                className="px-5 py-2.5 rounded-full border border-[#D5E4E0] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer w-1/2 sm:w-auto"
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="bg-[#38746D] hover:bg-[#24544E] text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer w-1/2 sm:w-auto flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </motion.form>
      </motion.div>
  );
}

