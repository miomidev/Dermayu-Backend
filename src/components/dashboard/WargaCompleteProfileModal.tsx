"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Phone,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { INDRAMAYU_REGIONS, IndramayuRegion } from "@/data/indramayuRegions";
import { getActiveSession, saveUserSession, UserSession } from "@/utils/authSession";

interface WargaCompleteProfileModalProps {
  session: UserSession | null;
  onProfileUpdated?: (updatedSession: UserSession) => void;
}

export function WargaCompleteProfileModal({
  session,
  onProfileUpdated,
}: WargaCompleteProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [phone, setPhone] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  // Evaluasi kelengkapan data saat session termuat
  useEffect(() => {
    if (!session) return;

    // Hanya untuk role warga
    const roleNorm = (session.role || "").toLowerCase();
    if (roleNorm !== "warga" && roleNorm !== "citizen") {
      setIsOpen(false);
      return;
    }

    const hasPhone = Boolean(session.phone && session.phone.trim().length >= 9);
    const hasDistrict = Boolean(
      session.district &&
      session.district.trim().length > 0 &&
      !session.district.toLowerCase().includes("kabupaten")
    );
    const hasVillage = Boolean(session.village && session.village.trim().length > 0);
    const hasAddress = Boolean(session.address && session.address.trim().length >= 3);

    const isComplete = hasPhone && hasDistrict && hasVillage && hasAddress;

    if (!isComplete) {
      setIsOpen(true);
      if (session.phone) setPhone(session.phone);
      if (session.district && !session.district.toLowerCase().includes("kabupaten")) {
        setSelectedKecamatan(session.district);
        const reg = INDRAMAYU_REGIONS.find(
          (r) => r.kecamatan.toLowerCase() === session.district?.toLowerCase()
        );
        if (reg) {
          setAvailableVillages(reg.villages);
        }
      }
      if (session.village) setSelectedDesa(session.village);
      if (session.address) setAddressDetail(session.address);
    } else {
      setIsOpen(false);
    }
  }, [session]);

  // Handle pergantian kecamatan -> update daftar desa
  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec);
    setSelectedDesa("");
    const matched = INDRAMAYU_REGIONS.find(
      (r) => r.kecamatan.toLowerCase() === kec.toLowerCase()
    );
    if (matched) {
      setAvailableVillages(matched.villages);
    } else {
      setAvailableVillages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validasi 1: Nomor WhatsApp
    const cleanPhone = phone.trim().replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg("Nomor WhatsApp wajib diisi minimal 9-14 digit angka aktif.");
      return;
    }

    // Validasi 2: Kecamatan
    if (!selectedKecamatan) {
      setErrorMsg("Silakan pilih Kecamatan domisili Anda di Kabupaten Indramayu.");
      return;
    }

    // Validasi 3: Desa/Kelurahan
    if (!selectedDesa) {
      setErrorMsg("Silakan pilih Desa atau Kelurahan domisili Anda.");
      return;
    }

    // Validasi 4: Detail Alamat (RT/RW & Blok)
    if (!addressDetail || addressDetail.trim().length < 4) {
      setErrorMsg("Detail RT / RW & Blok Rumah wajib diisi (contoh: RT 02 / RW 01, Blok Karang Tengah).");
      return;
    }

    setLoading(true);

    try {
      // 1. Kirim pembaruan ke Backend API /api/v1/me
      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone: cleanPhone,
          districtName: selectedKecamatan,
          villageName: selectedDesa,
          address: addressDetail.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));

      // 2. Simpan juga pembaruan ke session client lokal
      const updated = saveUserSession({
        id: session?.id,
        name: session?.name || "Warga Siaga",
        fullName: session?.fullName || session?.name || "Warga Siaga",
        email: session?.email || "warga@dermayu.id",
        role: "warga",
        phone: cleanPhone,
        district: selectedKecamatan,
        village: selectedDesa,
        address: addressDetail.trim(),
        isProfileComplete: true,
      });

      setSuccessMsg("Data profil warga berhasil disimpan! Selamat datang di Portal Warga Siaga.");

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      // Tutup modal setelah delay halus
      setTimeout(() => {
        setIsOpen(false);
      }, 1200);
    } catch (err: any) {
      console.warn("Gagal simpan ke server, menerapkan penyimpanan profil lokal:", err);
      // Fallback ke penyimpanan session lokal agar user tidak terblokir jika offline
      const updated = saveUserSession({
        id: session?.id,
        name: session?.name || "Warga Siaga",
        fullName: session?.fullName || session?.name || "Warga Siaga",
        email: session?.email || "warga@dermayu.id",
        role: "warga",
        phone: cleanPhone,
        district: selectedKecamatan,
        village: selectedDesa,
        address: addressDetail.trim(),
        isProfileComplete: true,
      });

      setSuccessMsg("Data profil warga berhasil disimpan secara lokal!");
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#204E4A] via-[#38746D] to-[#4A8F87] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    Lengkapi Profil Warga Siaga
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/25 text-emerald-100 border border-emerald-300/30">
                    <Sparkles className="w-3 h-3" /> Wajib
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
                  Data ini wajib dilengkapi untuk koordinasi evakuasi & peringatan dini bencana banjir.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Feedback Alert */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium">{successMsg}</span>
              </motion.div>
            )}

            {/* 1. Nomor WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#38746D]" />
                  Nomor WhatsApp Aktif
                </span>
                <span className="text-[11px] text-rose-500 font-normal">*Wajib</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-3 pr-24 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#38746D] focus:ring-2 focus:ring-[#38746D]/15 outline-none transition text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  WhatsApp
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Penting untuk menerima sirine darurat & koordinasi tim SAR BPBD.
              </p>
            </div>

            {/* 2 & 3. Grid Kecamatan & Desa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Kecamatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#38746D]" />
                    Kecamatan Domisili
                  </span>
                  <span className="text-[11px] text-rose-500 font-normal">*Wajib</span>
                </label>
                <select
                  required
                  value={selectedKecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#38746D] focus:ring-2 focus:ring-[#38746D]/15 outline-none transition text-slate-800 bg-slate-50/50"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {INDRAMAYU_REGIONS.map((r) => (
                    <option key={r.kecamatan} value={r.kecamatan}>
                      Kec. {r.kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desa / Kelurahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Desa / Kelurahan</span>
                  <span className="text-[11px] text-rose-500 font-normal">*Wajib</span>
                </label>
                <select
                  required
                  disabled={!selectedKecamatan || availableVillages.length === 0}
                  value={selectedDesa}
                  onChange={(e) => setSelectedDesa(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#38746D] focus:ring-2 focus:ring-[#38746D]/15 outline-none transition text-slate-800 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedKecamatan ? "-- Pilih Desa/Kelurahan --" : "Pilih Kecamatan dulu"}
                  </option>
                  {availableVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. RT / RW & Blok Rumah (Detail Alamat) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#38746D]" />
                  RT / RW & Blok Rumah (Detail Alamat)
                </span>
                <span className="text-[11px] text-rose-500 font-normal">*Wajib</span>
              </label>
              <textarea
                required
                rows={2}
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Contoh: RT 03 / RW 02, Blok Karang Tengah No. 14 (Dekat Musholla Al-Huda)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#38746D] focus:ring-2 focus:ring-[#38746D]/15 outline-none transition text-slate-800 placeholder:text-slate-400 bg-slate-50/50 resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Tuliskan patokan rumah agar petugas evakuasi dan perahu karet mudah menemukan lokasi Anda saat banjir rob.
              </p>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || Boolean(successMsg)}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[#38746D] hover:bg-[#204E4A] active:scale-[0.99] transition shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Data Profil...</span>
                  </>
                ) : successMsg ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Data Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <span>Simpan & Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

