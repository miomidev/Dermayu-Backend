import { DashboardShell } from "@/components/dashboard/DashboardShell";
import PageTransition from "@/components/PageTransition";

export const metadata = {
  title: "Pusdalops PB BPBD | DERMAYU",
  description: "Pusat Pengendali Operasi Penanggulangan Bencana BPBD Kabupaten Indramayu.",
};

export default function PetugasRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="petugas">
      <PageTransition>{children}</PageTransition>
    </DashboardShell>
  );
}

