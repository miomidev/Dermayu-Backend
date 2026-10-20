import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DERMAYU — Platform Pelaporan & Dering Evakuasi Indramayu",
  description:
    "Dering Evakuasi, Respons Masyarakat, dan Aduan Wilayah Indramayu. Platform pelaporan bencana dan infrastruktur berbasis lokasi dengan integrasi validasi AI CNN.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
