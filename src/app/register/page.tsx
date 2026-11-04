import type { Metadata, Viewport } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const viewport: Viewport = {
  themeColor: "#38746D",
};

export const metadata: Metadata = {
  title: "Daftar Akun | DERMAYU",
  description: "Daftar akun warga untuk akses cepat peringatan dini banjir rob dan pelaporan terpadu.",
};

export default function RegisterPage() {
  return <AuthCard initialMode="register" />;
}
