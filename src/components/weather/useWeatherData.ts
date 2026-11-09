"use client";

import { useState, useEffect } from "react";
import {
  type DetailedWeatherData,
  DEFAULT_DETAILED_WEATHER,
} from "./WeatherDetailPanel";

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<DetailedWeatherData>(DEFAULT_DETAILED_WEATHER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/weather")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data cuaca");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          const w = data.data || data;
          setWeatherData((prev) => ({
            ...prev,
            ...w,
            suhu: typeof w.suhu === "number" ? Math.round(w.suhu) : prev.suhu,
            kondisiSekarang: w.kondisiSekarang || prev.kondisiSekarang,
            weatherCode: typeof w.weatherCode === "number" ? w.weatherCode : prev.weatherCode,
            hourly: Array.isArray(w.hourly) && w.hourly.length > 0 ? w.hourly : prev.hourly,
            daily: Array.isArray(w.daily) && w.daily.length > 0 ? w.daily : prev.daily,
            metrics: w.metrics ? { ...prev.metrics, ...w.metrics } : prev.metrics,
            peringatanHujan: w.peringatanHujan !== undefined ? w.peringatanHujan : prev.peringatanHujan,
          }));
        }
      })
      .catch((err) => {
        console.warn("Weather API fallback:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { weatherData, loading };
}

