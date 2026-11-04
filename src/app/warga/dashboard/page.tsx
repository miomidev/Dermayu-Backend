import type { Metadata } from "next";
import { WargaDashboardContent } from "@/components/dashboard/WargaDashboardContent";

export const metadata: Metadata = {
  title: "Dashboard Warga | DERMAYU",
  description: "Pantau rute evakuasi, posko siaga, dan pelaporan banjir terpadu Indramayu.",
};

export default function WargaDashboardPage() {
  return <WargaDashboardContent />;
}
