"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { clearUserSession } from "@/utils/authSession";
import {
  Settings,
  User,
  ShieldCheck,
  Radio,
  Bell,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Sliders,
  Smartphone,
  Wifi,
  AlertTriangle,
} from "lucide-react";

export default function PetugasSettingsPage() {
  const router = useRouter();

  // Profile States
  const [operatorName, setOperatorName] = useState("Komandan Surya BPBD");
  const [nip, setNip] = useState("19840315 200801 1 004");
  const [position, setPosition] = useState("Kasi Kedaruratan & Pusdalops PB Indramayu");
  const [email, setEmail] = useState("petugas@dermayu.id");

  // Telemetry Threshold States
  const [siaga1Rob, setSiaga1Rob] = useState(80);
  const [siaga2Rob, setSiaga2Rob] = useState(60);
  const [debitCimanukMax, setDebitCimanukMax] = useState(700);

  // Radio Frequency Integration
  const [radioFreq, setRadioFreq] = useState("146.800 MHz");
  const [repeaterTone, setRepeaterTone] = useState("88.5 Hz (Duplex -600)");

  // Notification Toggles
  const [autoSmsWarga, setAutoSmsWarga] = useState(true);
  const [waGatewayAlert, setWaGatewayAlert] = useState(true);
  const [pushSound, setPushSound] = useState(true);

  const [notification, setNotification] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Pengaturan sistem & ambang batas Pusdalops berhasil disimpan.");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sesi operator Pusdalops BPBD?")) {
      clearUserSession();
      router.push("/login");
    }
  };

  return (
    <DashboardLayout
      role="petugas"
      title="Pengaturan & Akses Petugas"
      userName={operatorName}
      userRoleLabel="Operator Pusdalops BPBD"
      userLocation="Pusdalops Indramayu"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Banner Alert Sukses */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Tutup
            </button>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* 1. INFORMASI OPERATOR & KREDENSIAL */}
          <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-[#EEF5F3] text-[#1D443F] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132422]">Profil Operator Pusdalops</h3>
                <p className="text-[11px] text-gray-500">
                  Identitas komando pengendali kedaruratan bencana Kabupaten Indramayu
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Jabatan Dinas</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Email Kedinasan</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. AMBANG BATAS TELEMETRI & EARLY WARNING SYSTEM */}
          <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132422]">
                  Parameter Ambang Batas Peringatan Dini (EWS)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Nilai batas pemicu otomatis sirine pesisir dan broadcast peringatan ke aplikasi warga
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Batas Pasang Rob Siaga 2 (cm)
                </label>
                <input
                  type="number"
                  value={siaga2Rob}
                  onChange={(e) => setSiaga2Rob(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Default: 60 cm</span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Batas Pasang Rob Siaga 1 (cm)
                </label>
                <input
                  type="number"
                  value={siaga1Rob}
                  onChange={(e) => setSiaga1Rob(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                  Pemicu Sirine Bahaya: &gt; 80 cm
                </span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Maks Debit Rentang (m³/s)
                </label>
                <input
                  type="number"
                  value={debitCimanukMax}
                  onChange={(e) => setDebitCimanukMax(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Default: 700 m³/s</span>
              </div>
            </div>
          </div>

          {/* 3. KOMUNIKASI RADIO & REPEATER PUSDALOPS */}
          <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132422]">
                  Frekuensi Radio Taktis SAR Lapangan
                </h3>
                <p className="text-[11px] text-gray-500">
                  Saluran komunikasi VHF/UHF terintegrasi antara Pusdalops dan perahu evakuasi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Frekuensi Utama Repeater BPBD
                </label>
                <input
                  type="text"
                  value={radioFreq}
                  onChange={(e) => setRadioFreq(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Tone CTCSS / Shift</label>
                <input
                  type="text"
                  value={repeaterTone}
                  onChange={(e) => setRepeaterTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5E4E0] focus:outline-hidden focus:border-[#38746D]"
                />
              </div>
            </div>
          </div>

          {/* 4. PREFERENSI NOTIFIKASI */}
          <div className="p-6 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132422]">Preferensi Notifikasi Sistem</h3>
                <p className="text-[11px] text-gray-500">Saluran transmisi peringatan bahaya</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between text-xs cursor-pointer p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-gray-900 block">WhatsApp Gateway Dispatch</span>
                  <span className="text-[11px] text-gray-500">
                    Kirim notifikasi otomatis ke WhatsApp Komandan Regu SAR saat ada aduan terverifikasi
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={waGatewayAlert}
                  onChange={(e) => setWaGatewayAlert(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-gray-900 block">Peringatan Audio Sirine Dasbor</span>
                  <span className="text-[11px] text-gray-500">
                    Bunyikan nada waspada pada browser jika sensor telemetri melewati ambang batas bahaya
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pushSound}
                  onChange={(e) => setPushSound(e.target.checked)}
                  className="w-4 h-4 accent-[#1D443F] rounded-sm cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* TOMBOL SIMPAN & LOGOUT */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3 rounded-2xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Sesi Operator
            </button>

            <button
              type="submit"
              className="px-7 py-3 rounded-2xl bg-[#1D443F] hover:bg-[#38746D] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Perubahan
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

