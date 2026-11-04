"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Radio,
  ShieldCheck,
  Check,
  Save,
  CheckCircle2,
  Building2,
  Sliders,
  BadgeAlert,
  Pencil,
} from "lucide-react";
import { getActiveSession, saveUserSession, type UserSession } from "@/utils/authSession";

export default function PetugasProfilePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [fullName, setFullName] = useState("Komandan Surya BPBD");
  const [nip, setNip] = useState("19840315 200801 1 004");
  const [position, setPosition] = useState("Kasi Kedaruratan & Pusdalops PB");
  const [phone, setPhone] = useState("0812-2223-3112");
  const [email, setEmail] = useState("petugas@dermayu.id");
  const [dutyStation, setDutyStation] = useState("Pusdalops BPBD Indramayu - Jl. By Pass Sudirman");
  const [radioFreq, setRadioFreq] = useState("146.800 MHz (Tone 88.5)");
  const [assignedSector, setAssignedSector] = useState("Pantura Barat (Kandanghaur - Cantigi - Losarang)");

  // Preferensi Sistem
  const [sirenAlert, setSirenAlert] = useState(true);
  const [waAutoDispatch, setWaAutoDispatch] = useState(true);
  const [telemetryAutoSync, setTelemetryAutoSync] = useState(true);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const active = getActiveSession();
    if (active) {
      setSession(active);
      if (active.name) setFullName(active.name);
      if (active.email) setEmail(active.email);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    saveUserSession({
      name: fullName,
      email: email,
      role: "petugas",
      district: "Pusdalops BPBD Indramayu",
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initialLetter = fullName.trim().charAt(0).toUpperCase() || "K";

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
                Perubahan data profil operator Pusdalops BPBD berhasil diperbarui.
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

        {/* 1. HERO CARD PROFIL OPERATOR TERPUSAT (MATCHING GAMBAR 2) */}
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

          {/* NIP & Jabatan */}
          <p className="text-xs sm:text-sm text-[#4B635F] mt-1 font-medium">
            NIP. {nip} • {position}
          </p>

          {/* Info Badge & Lokasi Tugas */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Operator Pusdalops PB Terverifikasi
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1 text-gray-500">
              <Building2 className="w-3.5 h-3.5 text-[#38746D]" />
              {dutyStation}
            </span>
          </div>

          {/* Tombol Edit Profile Pill Hijau Deep Teal Sesuai Tema DERMAYU */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const formEl = document.getElementById("form-profil-petugas");
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

        {/* 2. FORMULIR DATA PETUGAS & OPERASIONAL */}
        <motion.form
          id="form-profil-petugas"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSave}
          className="bg-white border border-[#D5E4E0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-7"
        >
          {/* Identitas Kedinasan */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Identitas Operator & Kedinasan</h3>
            <p className="text-xs text-[#4B635F] mb-4">
              Data identitas resmi penanggung jawab komando darurat bencana di Pusdalops BPBD.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Nama Lengkap & Gelar</label>
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
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Jabatan Dinas BPBD</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Nomor Telepon / WA Siaga</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Email Dinas Resmi</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full h-11 bg-gray-100 border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#D5E4E0]/60" />

          {/* Pos Komando & Saluran Taktis */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Pos Komando & Saluran Taktis</h3>
            <p className="text-xs text-[#4B635F] mb-4">
              Konfigurasi posko induk dan frekuensi radio VHF terhubung dengan armada SAR lapangan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Stasiun Posko Induk</label>
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={dutyStation}
                    onChange={(e) => setDutyStation(e.target.value)}
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Frekuensi Radio VHF Taktis</label>
                <div className="relative flex items-center">
                  <Radio className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={radioFreq}
                    onChange={(e) => setRadioFreq(e.target.value)}
                    className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl pl-10 pr-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#132422] mb-1.5">Sektor Pengendalian Bencana</label>
                <input
                  type="text"
                  value={assignedSector}
                  onChange={(e) => setAssignedSector(e.target.value)}
                  className="w-full h-11 bg-[#F8FAF9] border border-[#D5E4E0] rounded-xl px-4 text-xs sm:text-sm text-[#132422] outline-hidden focus:border-[#38746D] transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#D5E4E0]/60" />

          {/* Preferensi Sistem Siaga */}
          <div>
            <h3 className="text-sm font-bold text-[#132422] mb-1">Preferensi Operasional Dasbor</h3>
            <p className="text-xs text-[#4B635F] mb-4">Pengaturan automasi kedaruratan di konsol Pusdalops.</p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">Audio Sirine Siaga Dasbor</span>
                  <span className="text-[11px] text-[#4B635F]">
                    Bunyikan sinyal audio otomatis saat sensor pasang rob atau debit Cimanuk masuk Siaga 1 / 2.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={sirenAlert}
                  onChange={(e) => setSirenAlert(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">
                    Auto-Dispatch WhatsApp ke Komandan Regu SAR
                  </span>
                  <span className="text-[11px] text-[#4B635F]">
                    Kirim tiket aduan terverifikasi secara instan via WA Gateway ke komandan regu terdekat.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={waAutoDispatch}
                  onChange={(e) => setWaAutoDispatch(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E8F1EE] hover:bg-[#EEF5F3] transition-colors cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#132422] block">
                    Auto-Sync Telemetri Sensor Real-Time
                  </span>
                  <span className="text-[11px] text-[#4B635F]">
                    Sinkronisasikan pembacaan sensor AWS setiap 30 detik tanpa perlu refresh manual.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={telemetryAutoSync}
                  onChange={(e) => setTelemetryAutoSync(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              {saved && (
                <>
                  <Check className="w-4 h-4" />
                  Perubahan data profil operator berhasil disimpan.
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
                className="bg-[#1D443F] hover:bg-[#38746D] text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer w-1/2 sm:w-auto flex items-center justify-center gap-2"
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

