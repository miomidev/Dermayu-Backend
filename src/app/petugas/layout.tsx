import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Pusdalops PB BPBD | DERMAYU",
  description: "Pusat Pengendali Operasi Penanggulangan Bencana BPBD Kabupaten Indramayu.",
};

export default function PetugasRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="petugas">{children}</DashboardShell>;
}

