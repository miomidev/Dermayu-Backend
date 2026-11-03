import React from "react";

interface IconProps {
  className?: string;
}

export function ArrowIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "h-3.5 w-3.5 text-emerald-600" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// Ikon Rute Bercabang (Forked Route Icon dengan dua panah ke atas)
export function ForkedRouteIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21v-6.5" />
      <path d="M12 14.5c-1.8 0-3.8-1.5-3.8-4.5V7" strokeDasharray="2.2 2.2" />
      <path d="M5.8 8.8L8.2 6.2l2.4 2.6" />
      <path d="M12 14.5c1.8 0 3.8-1.5 3.8-4.5V7" />
      <path d="M13.4 8.8L15.8 6.2l2.4 2.6" />
    </svg>
  );
}

// Ikon Beacon Radar & Tanda Seru untuk Lapor
export function BeaconAlertIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 7 A 7.5 7.5 0 1 0 16 7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M9.5 9.8 A 4.3 4.3 0 1 0 14.5 9.8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13.5" r="1.35" fill="currentColor" />
      <path
        d="M10.8 5c0-.9.5-1.6 1.2-1.6s1.2.7 1.2 1.6l-.3 4.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9z"
        fill="currentColor"
      />
    </svg>
  );
}

// Ikon Shelter / Posko Evakuasi Berlapis (Sesuai Referensi Gambar 3)
export function PoskoShelterIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Rumah / Tenda Utama */}
      <path d="M2.5 9.5L8 4l5.5 5.5V20H2.5V9.5z" />
      {/* Pintu / Akses Masuk */}
      <path d="M7 13.5h2v6.5H7z" />
      {/* Sayap / Layer Ekstensi Posko 1 */}
      <path d="M12.5 4l5 5V20" />
      {/* Sayap / Layer Ekstensi Posko 2 */}
      <path d="M16.5 4l5 5V20" />
    </svg>
  );
}
