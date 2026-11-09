import { BukuPanduanView } from "@/components/dashboard/BukuPanduanView";

export const metadata = {
  title: "Buku Panduan Siaga Warga | DERMAYU",
  description:
    "Buku panduan penggunaan sistem mitigasi bencana banjir Kabupaten Indramayu untuk warga siaga.",
};

export default function WargaPanduanPage() {
  return <BukuPanduanView forcedRole="warga" />;
}

