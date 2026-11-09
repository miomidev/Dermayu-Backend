import { BukuPanduanView } from "@/components/dashboard/BukuPanduanView";

export const metadata = {
  title: "Buku Panduan Siaga Pusdalops BPBD | DERMAYU",
  description:
    "Standard Operating Procedure (SOP) dan buku panduan operasional sistem mitigasi banjir untuk petugas BPBD Indramayu.",
};

export default function PetugasPanduanPage() {
  return <BukuPanduanView forcedRole="petugas" />;
}

