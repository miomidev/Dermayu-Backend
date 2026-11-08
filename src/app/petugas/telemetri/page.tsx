"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

// Dynamic import for Leaflet Spatial Map (SSR Disabled)
const TelemetrySpatialMap = dynamic(
  () => import("@/components/dashboard/TelemetrySpatialMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-64px)] bg-[#132422] flex flex-col items-center justify-center text-slate-300 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#88BDB6]" />
        <span className="text-xs font-semibold tracking-wide text-[#D1E5E2]">
          Menyiapkan Command Center Telemetri Spasial Indramayu...
        </span>
      </div>
    ),
  }
);

export default function PetugasTelemetriPage() {
  return (
    <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden">
      <TelemetrySpatialMap />
    </div>
  );
}
