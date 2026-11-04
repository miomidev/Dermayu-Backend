import type { Metadata, Viewport } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const viewport: Viewport = {
  themeColor: "#38746D",
};

export const metadata: Metadata = {
  title: "Masuk Akun | DERMAYU",
  description: "Masuk akun warga atau petugas untuk akses pantauan rute evakuasi dan pelaporan terpadu.",
};

export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
