"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function WargaEvakuasiPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/warga/dashboard");
  }, [router]);

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center space-y-3 text-[#4B635F]">
      <RefreshCw className="w-7 h-7 animate-spin text-[#38746D]" />
      <p className="text-xs font-semibold">Mengarahkan ke Dasbor Peta Spasial & Rute Evakuasi...</p>
    </div>
  );
}
