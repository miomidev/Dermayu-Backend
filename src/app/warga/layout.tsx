import { DashboardShell } from "@/components/dashboard/DashboardShell";
import PageTransition from "@/components/PageTransition";

export const metadata = {
  title: "Portal Warga Siaga | DERMAYU",
  description: "Pusat kesiapsiagaan mandiri, pelaporan titik banjir rob, dan pemantauan posko pengungsian Kabupaten Indramayu.",
};

export default function WargaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="warga">
      <PageTransition>{children}</PageTransition>
    </DashboardShell>
  );
}

