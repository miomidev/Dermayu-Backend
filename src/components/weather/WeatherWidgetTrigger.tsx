"use client";

import React, { useMemo } from "react";
import {
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react";
import type { DetailedWeatherData } from "./WeatherDetailPanel";

export interface WeatherWidgetTriggerProps {
  weatherData?: DetailedWeatherData | null;
  onClick: () => void;
  className?: string;
  title?: string;
}

export function getWeatherIcon(
  kondisi?: string,
  code?: number,
  iconName?: string,
  className = "w-5 h-5 md:w-6 md:h-6 mb-0.5 sm:mb-1 shrink-0"
) {
  const i = (iconName || "").toLowerCase();
  const k = (kondisi || "").toLowerCase();

  if (
    i.includes("lightning") ||
    k.includes("petir") ||
    k.includes("badai") ||
    code === 95 ||
    code === 96 ||
    code === 99
  ) {
    return <CloudLightning className={`${className} text-amber-500`} />;
  }
  if (
    i.includes("drizzle") ||
    k.includes("gerimis") ||
    code === 51 ||
    code === 53 ||
    code === 55
  ) {
    return <CloudDrizzle className={`${className} text-sky-400`} />;
  }
  if (
    i.includes("rain") ||
    k.includes("hujan") ||
    (code !== undefined && code >= 61 && code <= 82)
  ) {
    return <CloudRain className={`${className} text-sky-500`} />;
  }
  if (
    i.includes("cloud-sun") ||
    k.includes("berawan") ||
    k.includes("mendung") ||
    code === 1 ||
    code === 2 ||
    code === 3
  ) {
    return <CloudSun className={`${className} text-amber-500`} />;
  }
  if (i === "cloud" || k.includes("kabut") || code === 45 || code === 48) {
    return <Cloud className={`${className} text-slate-400`} />;
  }
  return <Sun className={`${className} text-amber-500`} />;
}

export function WeatherWidgetTrigger({
  weatherData,
  onClick,
  className = "",
  title,
}: WeatherWidgetTriggerProps) {
  const suhu = weatherData?.suhu ?? 28;
  const kondisi = weatherData?.kondisiSekarang || "Cerah Berawan";
  const icon = useMemo(
    () => getWeatherIcon(kondisi, weatherData?.weatherCode, weatherData?.ikonCuaca),
    [kondisi, weatherData?.weatherCode, weatherData?.ikonCuaca]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        title ||
        `Cuaca di Indramayu: ${kondisi} (${suhu}°C) — Klik untuk melihat prakiraan detail 24 jam & 7 hari`
      }
      aria-label="Buka Detail Prakiraan Cuaca Indramayu"
      className={`bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl shadow-lg p-2 sm:p-2.5 md:p-3.5 flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] md:min-w-[96px] cursor-pointer hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all shrink-0 select-none group pointer-events-auto ${className}`}
    >
      {/* Ikon Lucide Profesional */}
      {icon}

      {/* Suhu (Besar & Bold) */}
      <span className="text-sm sm:text-base md:text-xl font-bold text-slate-800 leading-none tracking-tight group-hover:text-slate-900">
        {suhu}°C
      </span>

      {/* Label Kondisi Cuaca */}
      <span className="text-[9.5px] sm:text-[11px] md:text-xs font-medium text-slate-600 mt-0.5 sm:mt-1 text-center whitespace-nowrap group-hover:text-slate-800">
        {kondisi}
      </span>
    </button>
  );
}

export default WeatherWidgetTrigger;

