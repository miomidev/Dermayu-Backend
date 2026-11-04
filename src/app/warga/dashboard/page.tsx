import type { Metadata, Viewport } from "next";
import { WargaDashboardContent } from "@/components/dashboard/WargaDashboardContent";

export const viewport: Viewport = {
  themeColor: "#38746D",
};

export const metadata: Metadata = {
  title: "Dashboard Warga | DERMAYU",
  description: "Pantau rute evakuasi, posko siaga, dan pelaporan banjir terpadu Indramayu.",
};

export default function WargaDashboardPage() {
  return <WargaDashboardContent />;
}
