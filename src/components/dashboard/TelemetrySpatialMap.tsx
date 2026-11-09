"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import {
  Waves,
  Activity,
  Gauge,
  Radio,
  Wifi,
  BatteryCharging,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  RefreshCw,
  Compass,
  Crosshair,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Layers,
  MapPin,
  X,
  TrendingUp,
  Info,
  CloudRain,
  Cloud,
  CloudDrizzle,
  SunMedium,
  Database,
} from "lucide-react";
import indramayuBoundaryData from "@/data/indramayuBoundary.json";

export interface TelemetryLogEntry {
  id: string;
  timestamp: string; // HH:mm:ss WIB
  rawTime: number;
  sensorId: string;
  stationName: string;
  stationCode: string;
  district: string;
  weatherCondition: string;
  weatherType: "rain" | "cloud" | "drizzle" | "sun";
  currentValue: number;
  unit: string;
  readingLabel: string;
  status: "NORMAL" | "WASPADA" | "WASPADA / SIAGA 2" | "BAHAYA / SIAGA 1";
  trend: "NAIK" | "TURUN" | "STABIL";
  trendText?: string;
  batteryPct: number;
  signalStrength: string;
  protocol: string;
  isLatest?: boolean;
}

export const STATION_WEATHER_MAP: Record<
  string,
  { condition: string; type: "rain" | "cloud" | "drizzle" | "sun" }
> = {
  "st-01": { condition: "Berawan Maritim (Lembap 88%)", type: "cloud" },
  "st-02": { condition: "Hujan Ringan Terputus (3.2 mm)", type: "rain" },
  "st-03": { condition: "Mendung Pesisir (Gerimis 1.1 mm)", type: "drizzle" },
  "st-04": { condition: "Berawan Tebal (Angin 14 km/j)", type: "cloud" },
};

export interface TelemetryStation {
  id: string;
  name: string;
  code: string;
  type: "SUNGAI_CIMANUK" | "ROB_PESISIR" | "SALURAN_SEKUNDER";
  location: string;
  district: string;
  lat: number;
  lng: number;
  currentValue: number;
  unit: string;
  trend: "NAIK" | "TURUN" | "STABIL";
  status: "NORMAL" | "WASPADA" | "WASPADA / SIAGA 2" | "BAHAYA / SIAGA 1";
  normalMax: number;
  waspadaMax: number;
  dangerThreshold: number;
  batteryPct: number;
  signalStrength: string;
  protocol: string;
  lastHeartbeat: string;
  readingLabel: string;
  trendText?: string;
  description: string;
  historicalTrend: { time: string; value: number }[];
}

export const INITIAL_STATIONS: TelemetryStation[] = [
  {
    id: "st-01",
    name: "Sensor Pesisir Eretan Wetan (AWS-01)",
    code: "AWS-01",
    type: "ROB_PESISIR",
    location: "Dermaga TPI Eretan Wetan",
    district: "Kandanghaur",
    lat: -6.31,
    lng: 108.08,
    currentValue: 68,
    unit: "cm",
    trend: "NAIK",
    status: "WASPADA / SIAGA 2",
    normalMax: 40,
    waspadaMax: 80,
    dangerThreshold: 80,
    batteryPct: 96,
    signalStrength: "-72 dBm (4G LTE)",
    protocol: "LoRaWAN 920 MHz & 4G Backup",
    lastHeartbeat: "Live (Baru saja)",
    readingLabel: "Tinggi Muka Pasang Laut",
    trendText: "Tren Pasang Naik (+1 cm/10dtk)",
    description:
      "Sensor ultrasonik pengukur dinamika pasang laut pesisir Eretan untuk deteksi dini banjir rob di pemukiman nelayan dan jalur Pantura.",
    historicalTrend: [
      { time: "00:00", value: 38 },
      { time: "03:00", value: 44 },
      { time: "06:00", value: 52 },
      { time: "09:00", value: 61 },
      { time: "12:00", value: 65 },
      { time: "Sekarang", value: 68 },
    ],
  },
  {
    id: "st-02",
    name: "Bendung Rentang Hulu Cimanuk (AWS-02)",
    code: "AWS-02",
    type: "SUNGAI_CIMANUK",
    location: "Kec. Jatitujuh - Majalengka / Perbatasan Indramayu",
    district: "Hulu Cimanuk",
    lat: -6.62,
    lng: 108.28,
    currentValue: 305,
    unit: "m³/s",
    trend: "STABIL",
    status: "NORMAL",
    normalMax: 450,
    waspadaMax: 700,
    dangerThreshold: 900,
    batteryPct: 100,
    signalStrength: "-65 dBm (Fiber BPBD)",
    protocol: "SCADA BBWS & Fiber Optic Dedicated",
    lastHeartbeat: "Live (Baru saja)",
    readingLabel: "Debit Buangan Air (Q)",
    trendText: "Kondisi Stabil",
    description:
      "Pintu pengendali utama limpasan debit air Waduk Jatigede menuju hilir Sungai Cimanuk Indramayu untuk pencegahan luapan tanggul.",
    historicalTrend: [
      { time: "00:00", value: 290 },
      { time: "03:00", value: 295 },
      { time: "06:00", value: 312 },
      { time: "09:00", value: 308 },
      { time: "12:00", value: 302 },
      { time: "Sekarang", value: 305 },
    ],
  },
  {
    id: "st-03",
    name: "Muara Sungai Cantigi (AWS-03)",
    code: "AWS-03",
    type: "ROB_PESISIR",
    location: "Muara Pesisir Laut Cantigi Kulon",
    district: "Cantigi",
    lat: -6.295,
    lng: 108.267,
    currentValue: 59,
    unit: "cm",
    trend: "NAIK",
    status: "WASPADA / SIAGA 2",
    normalMax: 40,
    waspadaMax: 80,
    dangerThreshold: 80,
    batteryPct: 92,
    signalStrength: "-84 dBm (LoRa Gateway)",
    protocol: "LoRa Gateway Long-Range BPBD",
    lastHeartbeat: "Live (Baru saja)",
    readingLabel: "Elevasi Genangan Pasang",
    trendText: "Tren Pasang Naik",
    description:
      "Pemantau pertemuan pasang air laut dan muara sungai Cantigi yang rawan memicu genangan rob pada kawasan tambak dan pemukiman pesisir.",
    historicalTrend: [
      { time: "00:00", value: 32 },
      { time: "03:00", value: 39 },
      { time: "06:00", value: 47 },
      { time: "09:00", value: 55 },
      { time: "12:00", value: 57 },
      { time: "Sekarang", value: 59 },
    ],
  },
  {
    id: "st-04",
    name: "Tanggul Kritis Sukagumiwang (AWS-04)",
    code: "AWS-04",
    type: "SUNGAI_CIMANUK",
    location: "Tanggul Kali Cimanuk Km 34",
    district: "Sukagumiwang",
    lat: -6.545,
    lng: 108.325,
    currentValue: 3.4,
    unit: "meter",
    trend: "STABIL",
    status: "NORMAL",
    normalMax: 4.5,
    waspadaMax: 5.5,
    dangerThreshold: 6.5,
    batteryPct: 88,
    signalStrength: "-78 dBm (4G LTE)",
    protocol: "Pressure Transducer & 4G Telemetri",
    lastHeartbeat: "Live (Baru saja)",
    readingLabel: "Tinggi Muka Air (TMA)",
    trendText: "Kondisi Stabil",
    description:
      "Sensor tekanan hidrostatis bawah air pada titik tanggul kritis Sukagumiwang guna mendeteksi peningkatan tekanan air sungai Cimanuk.",
    historicalTrend: [
      { time: "00:00", value: 3.2 },
      { time: "03:00", value: 3.3 },
      { time: "06:00", value: 3.5 },
      { time: "09:00", value: 3.4 },
      { time: "12:00", value: 3.4 },
      { time: "Sekarang", value: 3.4 },
    ],
  },
];

function generateInitialLogs(): TelemetryLogEntry[] {
  const now = new Date();
  const logs: TelemetryLogEntry[] = [];
  const delays = [0, 10, 20, 30, 40, 50]; // seconds ago

  delays.forEach((sec, idx) => {
    const t = new Date(now.getTime() - sec * 1000);
    const timeStr = `${t.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })} WIB`;

    INITIAL_STATIONS.forEach((st) => {
      const weatherMap = STATION_WEATHER_MAP[st.id] || {
        condition: "Berawan (Open-Meteo)",
        type: "cloud" as const,
      };

      const delta = idx > 0 ? (st.type === "ROB_PESISIR" ? -idx : -(idx * 2)) : 0;
      const val =
        st.unit === "meter"
          ? Number((st.currentValue + (idx > 0 ? -0.05 : 0)).toFixed(1))
          : Math.round(st.currentValue + delta);

      logs.push({
        id: `init-${idx}-${st.id}`,
        timestamp: timeStr,
        rawTime: t.getTime(),
        sensorId: st.id,
        stationName: st.name,
        stationCode: st.code,
        district: st.district,
        weatherCondition: weatherMap.condition,
        weatherType: weatherMap.type,
        currentValue: val,
        unit: st.unit,
        readingLabel: st.readingLabel,
        status: st.status,
        trend: st.trend,
        trendText: st.trendText,
        batteryPct: st.batteryPct,
        signalStrength: st.signalStrength,
        protocol: st.protocol,
        isLatest: idx === 0,
      });
    });
  });

  return logs;
}

function TelemetrySpatialMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [stations, setStations] = useState<TelemetryStation[]>(INITIAL_STATIONS);
  // State Master-Detail (null = Master View, string = Detail View)
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Baru saja");
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(true);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ time: string; value: number } | null>(null);

  // State Tabel Log Data Real-Time
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>(generateInitialLogs);
  const [tableFilter, setTableFilter] = useState<"SELECTED" | "ALL">("SELECTED");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableCurrentPage, setTableCurrentPage] = useState<number>(1);
  const [tableItemsPerPage, setTableItemsPerPage] = useState<number>(10);

  // State Prediksi Cuaca Real-Time (Open-Meteo Proxy)
  const [weatherData, setWeatherData] = useState<{
    kondisiSekarang: string;
    suhu: number;
    prediksiCurahHujan: number;
    isAntisipasiKenaikanDebit: boolean;
    pesanPrediksi: string;
    ikonCuaca: string;
    hourlyForecast?: Array<{ jam: string; curahHujan: number; weatherCode: number }>;
  } | null>(null);

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
          setWeatherData({
            kondisiSekarang: w.kondisiSekarang || "Cerah Berawan",
            suhu: typeof w.suhu === "number" ? w.suhu : 29,
            prediksiCurahHujan: typeof w.prediksiCurahHujan === "number" ? w.prediksiCurahHujan : 1.4,
            isAntisipasiKenaikanDebit: Boolean(w.isAntisipasiKenaikanDebit),
            pesanPrediksi: w.pesanPrediksi || "Curah hujan hulu terpantau normal dan tidak memicu lonjakan debit air sungai.",
            ikonCuaca: w.ikonCuaca || "🌤️",
            hourlyForecast: Array.isArray(w.hourlyForecast) ? w.hourlyForecast : [],
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setWeatherData({
            kondisiSekarang: "Cerah Berawan",
            suhu: 29,
            prediksiCurahHujan: 1.4,
            isAntisipasiKenaikanDebit: false,
            pesanPrediksi: "Curah hujan hulu terpantau normal dan tidak memicu lonjakan debit air sungai.",
            ikonCuaca: "🌤️",
            hourlyForecast: [
              { jam: "+1 Jam", curahHujan: 1.2, weatherCode: 2 },
              { jam: "+2 Jam", curahHujan: 1.5, weatherCode: 3 },
              { jam: "+3 Jam", curahHujan: 1.6, weatherCode: 3 },
            ],
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sensor aktif saat Detail View
  const selectedStation = useMemo(() => {
    if (!selectedSensorId) return null;
    return stations.find((s) => s.id === selectedSensorId) || null;
  }, [stations, selectedSensorId]);

  // Statistik Agregat Seluruh Sensor
  const summaryStats = useMemo(() => {
    const dangerCount = stations.filter((s) => s.status.includes("BAHAYA")).length;
    const warningCount = stations.filter((s) => s.status.includes("WASPADA")).length;
    const normalCount = stations.filter((s) => s.status === "NORMAL").length;
    return { dangerCount, warningCount, normalCount, total: stations.length };
  }, [stations]);

  // Fetch data dari /api/v1/telemetry (Polling Background setiap 10 detik)
  const fetchTelemetry = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/v1/telemetry", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const incoming: any[] = json.data?.stations || json.stations || [];

        const now = new Date();
        const timeFormatted = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSyncTime(`${timeFormatted} WIB`);
        setIsLiveActive(true);

        const incomingMap = new Map<string, any>();
        if (Array.isArray(incoming)) {
          incoming.forEach((item) => incomingMap.set(item.id, item));
        }

        let updatedListSnapshot: TelemetryStation[] = [];

        setStations((prevList) => {
          const updatedList = Array.isArray(incoming) && incoming.length > 0
            ? prevList.map((st) => {
                const inc = incomingMap.get(st.id);
                if (!inc) return st;

                const newVal =
                  typeof inc.value === "number"
                    ? inc.value
                    : typeof inc.currentValue === "number"
                    ? inc.currentValue
                    : st.currentValue;
                const prevVal = st.currentValue;
                const diff = Number((newVal - prevVal).toFixed(1));

                let trend: TelemetryStation["trend"] = "STABIL";
                let trendText = st.trendText || "Kondisi Stabil";

                if (diff > 0) {
                  trend = "NAIK";
                  trendText =
                    st.type === "ROB_PESISIR"
                      ? `Tren Naik (+${diff} cm/10dtk)`
                      : `Kenaikan Debit (+${diff} ${st.unit}/10dtk)`;
                } else if (diff < 0) {
                  trend = "TURUN";
                  trendText =
                    st.type === "ROB_PESISIR"
                      ? `Penurunan (${diff} cm/10dtk)`
                      : `Penurunan (${diff} ${st.unit}/10dtk)`;
                } else {
                  trend = "STABIL";
                  trendText = "Kondisi Stabil";
                }

                const updatedHistory = [...st.historicalTrend];
                if (updatedHistory.length > 0) {
                  updatedHistory[updatedHistory.length - 1] = {
                    time: "Sekarang",
                    value: newVal,
                  };
                }

                return {
                  ...st,
                  currentValue: newVal,
                  status: inc.status || st.status,
                  trend,
                  trendText,
                  batteryPct: inc.batteryPct ?? st.batteryPct,
                  signalStrength: inc.signalStrength ?? st.signalStrength,
                  lastHeartbeat: "Live (Baru saja)",
                  historicalTrend: updatedHistory,
                };
              })
            : prevList;

          updatedListSnapshot = updatedList;
          return updatedList;
        });

        // 2. Buat entri log terbaru secara terpisah (di luar updater callback setStations)
        const baseStations = updatedListSnapshot.length > 0 ? updatedListSnapshot : INITIAL_STATIONS;
        const syncBatchId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const newEntries: TelemetryLogEntry[] = baseStations.map((st) => {
          const weather = STATION_WEATHER_MAP[st.id] || {
            condition: "Berawan (Open-Meteo)",
            type: "cloud" as const,
          };
          return {
            id: `log-${syncBatchId}-${st.id}`,
            timestamp: `${timeFormatted} WIB`,
            rawTime: now.getTime(),
            sensorId: st.id,
            stationName: st.name,
            stationCode: st.code,
            district: st.district,
            weatherCondition: weather.condition,
            weatherType: weather.type,
            currentValue: st.currentValue,
            unit: st.unit,
            readingLabel: st.readingLabel,
            status: st.status,
            trend: st.trend,
            trendText: st.trendText,
            batteryPct: st.batteryPct,
            signalStrength: st.signalStrength,
            protocol: st.protocol,
            isLatest: true,
          };
        });

        setTelemetryLogs((prev) => {
          const seen = new Set<string>();
          const combined = [...newEntries, ...prev.map((item) => ({ ...item, isLatest: false }))];
          return combined
            .filter((item) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            })
            .slice(0, 60);
        });
      }
    } catch (err) {
      console.warn("Auto-polling telemetry error:", err);
      setIsLiveActive(false);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Polling Effect setiap 10 detik
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Inisialisasi Peta Leaflet saat Detail View aktif
  useEffect(() => {
    if (!selectedSensorId) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Inisialisasi peta dengan cakupan penuh seluruh wilayah Kabupaten Indramayu
    // agar seluruh 4 titik sensor (Eretan, Cantigi, Sukagumiwang, Rentang) langsung terlihat jelas
    const map = L.map(mapContainerRef.current, {
      center: [-6.46, 108.20],
      zoom: 10.5,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Standar: 100% Free, Reliable, dan Bebas Watermark Error
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | PUSDALOPS BPBD',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Bounding Box seluruh sebaran sensor Indramayu
    const indramayuBounds = L.latLngBounds([
      [-6.26, 108.02], // Paling Barat-Utara (Eretan & Cantigi)
      [-6.68, 108.38], // Paling Selatan-Timur (Rentang & Sukagumiwang)
    ]);

    // Layer Batas Administratif Indramayu & Auto-Fit ke Seluruh Wilayah
    if (indramayuBoundaryData) {
      try {
        const geoLayer = L.geoJSON(indramayuBoundaryData as any, {
          style: {
            color: "#38746D",
            weight: 2,
            opacity: 0.65,
            fillColor: "#1D443F",
            fillOpacity: 0.04,
            dashArray: "4, 4",
          },
        }).addTo(map);

        const b = geoLayer.getBounds();
        if (b.isValid()) {
          map.fitBounds(b, { padding: [35, 35] });
        } else {
          map.fitBounds(indramayuBounds, { padding: [35, 35] });
        }
      } catch (e) {
        console.warn("Indramayu GeoJSON render notice:", e);
        map.fitBounds(indramayuBounds, { padding: [35, 35] });
      }
    } else {
      map.fitBounds(indramayuBounds, { padding: [35, 35] });
    }

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [selectedSensorId]);

  // Render & Update Custom Markers (Sesuai Desain Pin Posko & Genangan PetugasSpatialMap)
  useEffect(() => {
    if (!selectedSensorId || !mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    stations.forEach((st) => {
      const isSelected = st.id === selectedSensorId;
      const isDanger = st.status.includes("BAHAYA");
      const isWarning = st.status.includes("WASPADA");

      // Skema warna identik dengan pin posko & genangan di PetugasSpatialMap
      let bgClass = "bg-[#38746D]"; // Normal (sama seperti Posko)
      if (isDanger) {
        bgClass = "bg-rose-600"; // Bahaya (sama seperti Kritis)
      } else if (isWarning) {
        bgClass = "bg-amber-500"; // Waspada (sama seperti Genangan)
      }

      // Ikon di dalam pin
      const iconSvg =
        st.type === "ROB_PESISIR"
          ? `<svg class="${isSelected ? "w-4 h-4" : "w-3.5 h-3.5"} text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`
          : `<svg class="${isSelected ? "w-4 h-4" : "w-3.5 h-3.5"} text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`;

      let iconHtml = "";
      let iconSize: [number, number];
      let iconAnchor: [number, number];

      if (isSelected) {
        // PIN AKTIF: Skala kompak, ring hijau tema, halo lembut, pointer presisi
        iconSize = [32, 52];
        iconAnchor = [16, 32];

        iconHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md z-[999]">
            <!-- Subtle Radar Ring -->
            <div class="absolute -top-0.5 w-7 h-7 rounded-full bg-emerald-400/20 ring-1 ring-emerald-400/40 animate-pulse pointer-events-none"></div>

            <!-- Lingkaran Pin -->
            <div class="w-7 h-7 ${bgClass} rounded-full border-[1.5px] border-white shadow-md flex items-center justify-center relative z-10 scale-105 ring-2 ring-[#0D9488]">
              ${iconSvg}
            </div>

            <!-- Ekor / Segitiga Pointer Bawah -->
            <div class="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] -mt-[1px] border-l-transparent border-r-transparent border-t-white relative z-0"></div>

            <!-- Pill Badge Nilai Aktif -->
            <div class="mt-0.5 whitespace-nowrap px-1.5 py-0.2 rounded-md text-[9px] font-bold shadow-xs border bg-[#093531] text-white border-teal-300 ring-1 ring-teal-400/50">
              ${st.currentValue} ${st.unit}
            </div>
          </div>
        `;
      } else {
        // PIN INAKTIF: Ukuran standar kompak, opacity 90%, pointer presisi
        iconSize = [26, 46];
        iconAnchor = [13, 27];

        iconHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-2xs opacity-90 hover:opacity-100 hover:scale-105 transition-all z-10">
            <!-- Lingkaran Pin -->
            <div class="w-[24px] h-[24px] ${bgClass} rounded-full border-[1.5px] border-white shadow-xs flex items-center justify-center relative z-10">
              ${iconSvg}
            </div>

            <!-- Ekor / Segitiga Pointer Bawah -->
            <div class="w-0 h-0 border-l-[3.5px] border-r-[3.5px] border-t-[5px] -mt-[1px] border-l-transparent border-r-transparent border-t-white relative z-0"></div>

            <!-- Pill Badge Nilai Inaktif -->
            <div class="mt-0.5 whitespace-nowrap px-1.5 py-0.2 rounded-md text-[8.5px] font-bold shadow-2xs border bg-white/95 text-slate-700 border-slate-200/90">
              ${st.currentValue} ${st.unit}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: "custom-telemetry-pin",
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon });

      marker.on("click", () => {
        setSelectedSensorId(st.id);
        setMobileSheetOpen(true);
      });

      markersGroup.addLayer(marker);
    });
  }, [stations, selectedSensorId]);

  // Sparkline Chart Data Generator
  const sparklineData = useMemo(() => {
    if (!selectedStation) return { pathD: "", areaD: "", points: [] };
    const list = selectedStation.historicalTrend;
    if (!list || list.length === 0) return { pathD: "", areaD: "", points: [] };

    const width = 340;
    const height = 90;
    const padding = 12;

    const values = list.map((item) => item.value);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05 || 1;
    const range = maxVal - minVal || 1;

    const pts = list.map((item, index) => {
      const x = padding + (index / (list.length - 1)) * (width - padding * 2);
      const y = height - padding - ((item.value - minVal) / range) * (height - padding * 2);
      return { x, y, time: item.time, value: item.value };
    });

    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { pathD, areaD, points: pts };
  }, [selectedStation]);

  // Data Log Terfilter untuk Tabel Real-Time
  const displayedLogs = useMemo(() => {
    let list = telemetryLogs;
    if (selectedSensorId && tableFilter === "SELECTED") {
      list = list.filter((l) => l.sensorId === selectedSensorId);
    }
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (l) =>
          l.stationName.toLowerCase().includes(q) ||
          l.stationCode.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q) ||
          l.weatherCondition.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q)
      );
    }
    const seen = new Set<string>();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [telemetryLogs, selectedSensorId, tableFilter, tableSearch]);

  // Perhitungan Pagination Tabel Telemetri
  const totalTablePages = Math.max(1, Math.ceil(displayedLogs.length / tableItemsPerPage));
  const validTablePage = Math.min(tableCurrentPage, totalTablePages);
  const tableStartIndex = (validTablePage - 1) * tableItemsPerPage;
  const paginatedLogs = useMemo(() => {
    return displayedLogs.slice(tableStartIndex, tableStartIndex + tableItemsPerPage);
  }, [displayedLogs, tableStartIndex, tableItemsPerPage]);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const renderWeatherIcon = (type: "rain" | "cloud" | "drizzle" | "sun") => {
    switch (type) {
      case "rain":
        return <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
      case "drizzle":
        return <CloudDrizzle className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
      case "sun":
        return <SunMedium className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case "cloud":
      default:
        return <Cloud className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  const renderTelemetryTable = () => {
    return (
      <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center border border-[#D5E4E0]">
                <Database className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#132422] tracking-tight">
                Tabel Log Data Real-Time
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Ingest 10s
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Aliran riwayat data telemetri otomatis per 10 detik yang tersinkronisasi dengan stasiun AWS & SCADA BBWS Cimanuk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Filter Toggle jika sensor sedang dipilih */}
            {selectedStation && (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setTableFilter("SELECTED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    tableFilter === "SELECTED"
                      ? "bg-white text-[#38746D] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {selectedStation.code} Saja
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    tableFilter === "ALL"
                      ? "bg-white text-[#38746D] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua 4 Sensor
                </button>
              </div>
            )}

            {/* Total Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono font-medium">
              {displayedLogs.length} Entri Log
            </div>
          </div>
        </div>

        {/* Table Body Container with Responsive Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[780px] lg:min-w-full">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-[160px]">Timestamp</th>
                <th className="py-3 px-4">Lokasi Sensor</th>
                <th className="py-3 px-4">Indikator Cuaca/Kondisi</th>
                <th className="py-3 px-4">TMA / Debit Air</th>
                <th className="py-3 px-4">Status Sistem</th>
                <th className="py-3 px-4">Koneksi IoT & Daya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat log yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const isDanger = log.status.includes("BAHAYA");
                  const isWarning = log.status.includes("WASPADA");

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        log.isLatest && idx === 0 && validTablePage === 1 ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* 1. Timestamp (HH:mm:ss WIB) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp}</span>
                          {log.isLatest && idx === 0 && validTablePage === 1 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 animate-pulse border border-emerald-200">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Lokasi Sensor (Nama Stasiun AWS) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#38746D] px-1.5 py-0.5 rounded bg-[#EEF5F3] border border-[#D5E4E0]">
                              {log.stationCode}
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-[220px]">
                              {log.stationName}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-slate-500 mt-0.5">
                            Kec. {log.district}
                          </span>
                        </div>
                      </td>

                      {/* 3. Indikator Cuaca/Kondisi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          {renderWeatherIcon(log.weatherType)}
                          <span className="text-[11.5px]">{log.weatherCondition}</span>
                        </div>
                      </td>

                      {/* 4. TMA / Debit Air */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-sm font-extrabold tracking-tight ${
                              isDanger
                                ? "text-rose-700 font-black"
                                : isWarning
                                ? "text-amber-800 font-black"
                                : "text-[#1D443F]"
                            }`}
                          >
                            {log.currentValue}
                          </span>
                          <span className="text-[11px] font-bold text-[#38746D]">
                            {log.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({log.trend === "NAIK" ? "↑ Naik" : log.trend === "TURUN" ? "↓ Turun" : "→ Stabil"})
                          </span>
                        </div>
                      </td>

                      {/* 5. Status Sistem */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                            isDanger
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : isWarning
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDanger
                                ? "bg-rose-500 animate-pulse"
                                : isWarning
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {log.status}
                        </span>
                      </td>

                      {/* 6. Koneksi IoT */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1">
                            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-semibold text-slate-700">Solar {log.batteryPct}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Wifi className="w-3.5 h-3.5 text-[#38746D]" />
                            <span className="truncate max-w-[130px] font-medium">{log.signalStrength}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UNTUK TABEL TELEMETRI */}
        {displayedLogs.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none bg-white">
            <div className="text-xs text-[#4B635F] font-medium order-2 sm:order-1">
              Menampilkan <strong className="text-[#132422]">{tableStartIndex + 1}</strong> -{" "}
              <strong className="text-[#132422]">
                {Math.min(displayedLogs.length, tableStartIndex + tableItemsPerPage)}
              </strong>{" "}
              dari <strong className="text-[#132422]">{displayedLogs.length}</strong> entri log
            </div>

            <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => setTableCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validTablePage <= 1}
                className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center bg-[#F8FAF9] border border-[#D5E4E0] rounded-full px-2 py-1 gap-1">
                {getPageNumbers(validTablePage, totalTablePages).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold text-xs select-none">
                        ...
                      </span>
                    );
                  }
                  const pageNum = p as number;
                  const isActive = pageNum === validTablePage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setTableCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                        isActive
                          ? "border-2 border-[#38746D] text-[#38746D] font-black bg-white shadow-xs"
                          : "text-gray-600 hover:text-[#38746D] font-semibold hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setTableCurrentPage((p) => Math.min(totalTablePages, p + 1))}
                disabled={validTablePage >= totalTablePages}
                className="w-10 h-10 rounded-full bg-[#38746D] text-white flex items-center justify-center hover:bg-[#24544E] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#4B635F] order-3">
              <span>Tampilkan:</span>
              <select
                value={tableItemsPerPage}
                onChange={(e) => {
                  setTableItemsPerPage(Number(e.target.value));
                  setTableCurrentPage(1);
                }}
                className="h-9 px-2.5 rounded-xl border border-[#D5E4E0] bg-white text-xs font-bold text-[#1D443F] outline-none focus:border-[#38746D] transition cursor-pointer shadow-2xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // VIEW 1: MASTER VIEW (OVERVIEW GRID - SAAT selectedSensorId === null)
  // =========================================================================
  if (!selectedSensorId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5 pb-20 md:pb-8">
        {/* Header Ikhtisar Telemetri Ringkas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white border border-[#D5E4E0] shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-[#38746D] uppercase tracking-wider">
                Sistem Telemetri Aktif • Auto-Sync 10s
              </span>
              <span className="text-[11px] text-slate-500 font-mono">({lastSyncTime})</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#132422] tracking-tight">
              Pemantauan Tinggi Muka Air (TMA) & Pasang Rob
            </h1>
            {/* Teks Deskripsi Konteks Wajib sesuai PRD */}
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Menampilkan 4 titik sensor kritis utama berdasarkan prioritas pantauan BPBD dan BBWS Cimanuk-Cisanggarung dari total puluhan sensor yang ada.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={fetchTelemetry}
              disabled={isFetching}
              className="px-3.5 py-2 rounded-xl bg-[#EEF5F3] hover:bg-[#D5E4E0] text-[#38746D] text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Menyinkronkan..." : "Sinkronkan"}</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Status Global Padat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Total Sensor Kritis</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{summaryStats.total} Stasiun</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-800 font-medium">Status Normal</div>
              <div className="text-lg font-black text-emerald-900 mt-0.5">{summaryStats.normalCount} Titik</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-800 font-medium">Siaga Waspada</div>
              <div className="text-lg font-black text-amber-900 mt-0.5">{summaryStats.warningCount} Titik</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-rose-800 font-medium">Bahaya / Siaga 1</div>
              <div className="text-lg font-black text-rose-900 mt-0.5">{summaryStats.dangerCount} Titik</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 4 Card Sensor Master View (Ukuran Proporsional & Padat Tanpa Whitespace Berlebih) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((st) => {
            const isDanger = st.status.includes("BAHAYA");
            const isWarning = st.status.includes("WASPADA");

            return (
              <div
                key={st.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedSensorId(st.id);
                  setMobileSheetOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedSensorId(st.id);
                    setMobileSheetOpen(true);
                  }
                }}
                className={`group p-4 sm:p-5 rounded-2xl bg-white border shadow-xs transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-[#38746D] ${
                  isDanger
                    ? "border-rose-300 hover:border-rose-500 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-rose-100"
                    : isWarning
                    ? "border-amber-300 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-amber-100"
                    : "border-slate-200 hover:border-[#38746D] hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#38746D]">
                        {st.code} • {st.type === "ROB_PESISIR" ? "Sensor Pasang Rob" : "Sensor Aliran Cimanuk"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-[9px] font-bold text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#132422] mt-0.5 group-hover:text-[#38746D] transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {st.location}, Kec. {st.district}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 transition-all ${
                      isDanger
                        ? "bg-rose-100 text-rose-800 border border-rose-300 ring-1 ring-rose-300/50 animate-pulse"
                        : isWarning
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {st.status}
                  </span>
                </div>

                {/* Nilai Utama & Tren (Padat) */}
                <div
                  className={`mt-3 p-3 rounded-xl border transition-colors ${
                    isDanger
                      ? "bg-rose-50/70 border-rose-200"
                      : isWarning
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-[#EEF5F3] border-[#D5E4E0]"
                  }`}
                >
                  <div className="text-[11px] text-[#4B635F] font-semibold">{st.readingLabel}</div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-2xl sm:text-3xl font-black tracking-tight ${
                          isDanger
                            ? "text-rose-700 animate-pulse"
                            : isWarning
                            ? "text-amber-800"
                            : "text-[#1D443F]"
                        }`}
                      >
                        {st.currentValue}
                      </span>
                      <span className="text-xs font-bold text-[#38746D]">{st.unit}</span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-[11px] font-bold flex items-center gap-1 justify-end ${
                          st.trend === "NAIK"
                            ? "text-amber-700"
                            : st.trend === "TURUN"
                            ? "text-sky-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {st.trend === "NAIK" ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                            <span>{st.trendText || "Tren Naik"}</span>
                          </>
                        ) : st.trend === "TURUN" ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
                            <span>{st.trendText || "Penurunan"}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{st.trendText || "Kondisi Stabil"}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-500">
                        Ambang Siaga: &gt; {st.dangerThreshold} {st.unit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Ambang Batas 3 Level */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-semibold">
                    <span className={st.status === "NORMAL" ? "text-emerald-700 font-bold" : "text-slate-400"}>
                      Normal (&lt;{st.normalMax})
                    </span>
                    <span className={st.status.includes("WASPADA") ? "text-amber-700 font-bold" : "text-slate-400"}>
                      Waspada ({st.normalMax}-{st.waspadaMax})
                    </span>
                    <span className={st.status.includes("BAHAYA") ? "text-rose-600 font-bold" : "text-slate-400"}>
                      Bahaya (&gt;{st.dangerThreshold})
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
                    <div
                      className={`h-full rounded-l-full ${
                        st.status === "NORMAL" ? "bg-emerald-500" : "bg-emerald-500/50"
                      }`}
                      style={{ width: "33.3%" }}
                    />
                    <div
                      className={`h-full ${
                        st.status.includes("WASPADA") ? "bg-amber-400" : "bg-amber-400/50"
                      }`}
                      style={{ width: "33.3%" }}
                    />
                    <div
                      className={`h-full rounded-r-full ${
                        st.status.includes("BAHAYA") ? "bg-rose-500 animate-pulse" : "bg-rose-500/40"
                      }`}
                      style={{ width: "33.4%" }}
                    />
                  </div>
                </div>

                {/* Footer Hardware & CTA Padat */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-emerald-600" />
                      <span>{st.batteryPct}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-[#38746D]" />
                      <span className="truncate max-w-[100px]">{st.signalStrength}</span>
                    </div>
                  </div>

                  <span className="font-bold text-[#38746D] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Buka Command Center <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabel Log Data Real-Time di Bawah Master View */}
        <div className="pt-2">
          {renderTelemetryTable()}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DETAIL VIEW (STRUKTUR VERTIKAL: 60-70VH MAP/PANEL ATAS + TABEL DATA BAWAH)
  // =========================================================================
  return (
    <div className="w-full min-h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 flex flex-col relative select-none">
      {/* 1. BAGIAN ATAS (TINGGI 60-70VH): PETA SPASIAL KIRI & PANEL GRAFIK/STATUS KANAN */}
      <div className="w-full h-[62vh] min-h-[460px] max-h-[660px] p-3 md:p-5 pb-0 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 shrink-0">
        {/* AREA PETA DOMINAN (COL-SPAN-7/8 DI DESKTOP - LEBAR ~65-70%) */}
        <div className="relative w-full h-full md:col-span-7 lg:col-span-8 flex flex-col min-h-0 bg-slate-100 isolate z-0 rounded-2xl md:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Floating Top Control Bar di Atas Peta */}
        <div className="absolute top-3 inset-x-3 md:top-4 md:left-4 md:inset-x-auto z-[900] flex items-center justify-between md:justify-start gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setSelectedSensorId(null)}
            className="bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full px-3.5 py-1.5 md:px-4 md:py-2 shadow-sm text-xs md:text-sm font-semibold md:font-medium flex items-center gap-1.5 md:gap-2 transition-colors cursor-pointer active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Kembali ke Ikhtisar</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1.5 md:px-3.5 md:py-2 shadow-sm flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-slate-600 font-medium">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">
                Auto-Sync 10s: <span className="font-mono text-slate-500 font-semibold">{lastSyncTime}</span>
              </span>
              <span className="sm:hidden font-mono text-slate-600 font-bold">
                {lastSyncTime.split(" ")[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchTelemetry}
              disabled={isFetching}
              title="Sinkronkan Sekarang"
              className="p-1.5 md:p-2 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-dermayu-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />
      </div>

        {/* 2. SOLID SIDE PANEL (DESKTOP: COL-SPAN-5/4 DENGAN LATAR SOLID BUKAN FLOATING) */}
        {selectedStation && (
          <div className="hidden md:flex md:col-span-5 lg:col-span-4 h-full bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs flex-col overflow-y-auto z-10 p-5 space-y-4">
          {/* Header Solid Panel */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#38746D]">
                  {selectedStation.code} • {selectedStation.type === "ROB_PESISIR" ? "Sensor Pasang Rob" : "Sensor Aliran Cimanuk"}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <h2 className="text-base lg:text-lg font-bold text-[#132422] mt-0.5 leading-snug">
                {selectedStation.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedStation.location}, Kec. {selectedStation.district}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSensorId(null)}
              title="Tutup Panel & Kembali ke Ikhtisar"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Chip & Metrik Kritis Utama */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              selectedStation.status.includes("BAHAYA")
                ? "bg-rose-50/80 border-rose-200"
                : selectedStation.status.includes("WASPADA")
                ? "bg-amber-50/70 border-amber-200"
                : "bg-[#EEF5F3] border-[#D5E4E0]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4B635F] font-semibold">
                {selectedStation.readingLabel}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  selectedStation.status.includes("BAHAYA")
                    ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                    : selectedStation.status.includes("WASPADA")
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {selectedStation.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl lg:text-4xl font-black tracking-tight ${
                    selectedStation.status.includes("BAHAYA")
                      ? "text-rose-700 animate-pulse"
                      : selectedStation.status.includes("WASPADA")
                      ? "text-amber-800"
                      : "text-[#1D443F]"
                  }`}
                >
                  {selectedStation.currentValue}
                </span>
                <span className="text-sm font-bold text-[#38746D]">
                  {selectedStation.unit}
                </span>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-bold flex items-center gap-1 justify-end ${
                    selectedStation.trend === "NAIK"
                      ? "text-amber-700"
                      : selectedStation.trend === "TURUN"
                      ? "text-sky-700"
                      : "text-emerald-700"
                  }`}
                >
                  {selectedStation.trend === "NAIK" ? (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>{selectedStation.trendText || "Tren Naik"}</span>
                    </>
                  ) : selectedStation.trend === "TURUN" ? (
                    <>
                      <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
                      <span>{selectedStation.trendText || "Penurunan"}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedStation.trendText || "Kondisi Stabil"}</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Ambang Siaga: &gt; {selectedStation.dangerThreshold} {selectedStation.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Indikator Ambang Batas 3 Level */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className={selectedStation.status === "NORMAL" ? "text-emerald-700 font-bold" : "text-slate-500"}>
                Normal (&lt;{selectedStation.normalMax})
              </span>
              <span className={selectedStation.status.includes("WASPADA") ? "text-amber-700 font-bold" : "text-slate-500"}>
                Waspada ({selectedStation.normalMax}-{selectedStation.waspadaMax})
              </span>
              <span className={selectedStation.status.includes("BAHAYA") ? "text-rose-600 font-bold animate-pulse" : "text-slate-500"}>
                Bahaya (&gt;{selectedStation.dangerThreshold})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
              <div
                className={`h-full rounded-l-full transition-all duration-500 ${
                  selectedStation.status === "NORMAL" ? "bg-emerald-500 shadow-xs" : "bg-emerald-500/50"
                }`}
                style={{ width: "33.3%" }}
              />
              <div
                className={`h-full transition-all duration-500 ${
                  selectedStation.status.includes("WASPADA") ? "bg-amber-400 shadow-xs" : "bg-amber-400/50"
                }`}
                style={{ width: "33.3%" }}
              />
              <div
                className={`h-full rounded-r-full transition-all duration-500 ${
                  selectedStation.status.includes("BAHAYA") ? "bg-rose-500 shadow-xs animate-pulse" : "bg-rose-500/40"
                }`}
                style={{ width: "33.4%" }}
              />
            </div>
          </div>

          {/* Grafik Fluktuasi Ketinggian (12 Jam Terakhir) Proporsional */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#38746D]" />
                <span className="text-[11px] font-bold text-slate-800">
                  Fluktuasi Ketinggian (12 Jam Terakhir)
                </span>
              </div>
              {hoveredDataPoint ? (
                <span className="text-[10px] font-bold text-[#1D443F] bg-emerald-100 px-2 py-0.5 rounded-md">
                  {hoveredDataPoint.time}: {hoveredDataPoint.value} {selectedStation.unit}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Live Proxy SCADA</span>
              )}
            </div>

            {/* Kurva Grafik Vector SVG Proporsional */}
            <div className="w-full h-24 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 340 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="solidPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38746D" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38746D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {sparklineData.areaD && (
                  <path d={sparklineData.areaD} fill="url(#solidPanelGrad)" />
                )}

                {sparklineData.pathD && (
                  <path
                    d={sparklineData.pathD}
                    fill="none"
                    stroke="#1D443F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {sparklineData.points.map((pt, i) => (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredDataPoint({ time: pt.time, value: pt.value })}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={i === sparklineData.points.length - 1 ? 4.5 : 3}
                      fill={i === sparklineData.points.length - 1 ? "#EF4444" : "#38746D"}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-200">
              {selectedStation.historicalTrend.map((item, idx) => (
                <span key={idx}>{item.time}</span>
              ))}
            </div>
          </div>

          {/* Deskripsi Sensor */}
          <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAF9] p-3 rounded-xl border border-slate-100">
            {selectedStation.description}
          </p>

          {/* Indikator Prediktif: Prediksi Curah Hujan (Hulu & DAS) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-emerald-50/40 border border-sky-100/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <CloudRain className="w-4 h-4 text-[#38746D] shrink-0" />
                <span className="text-[11px] font-bold text-slate-800 truncate">
                  {selectedStation.id === "st-02" || selectedStation.type === "SUNGAI_CIMANUK"
                    ? "Prediksi Curah Hujan (Hulu)"
                    : "Prediksi Curah Hujan (Area Sensor)"}
                </span>
              </div>
              {/* Peringatan Dinamis jika prediksi > 10mm */}
              {weatherData && (weatherData.prediksiCurahHujan > 10 || weatherData.isAntisipasiKenaikanDebit) ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse shrink-0">
                  Antisipasi Kenaikan Debit
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 shrink-0">
                  Debit Stabil
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {typeof weatherData?.prediksiCurahHujan === "number"
                    ? weatherData.prediksiCurahHujan.toFixed(1)
                    : "1.4"}
                </span>
                <span className="text-xs font-semibold text-slate-500">mm / 3 jam</span>
              </div>
              <div className="text-right text-[11px] font-medium text-slate-600">
                <span>{weatherData?.ikonCuaca || "🌤️"} {weatherData?.kondisiSekarang || "Cerah Berawan"}</span>
                <span className="text-slate-400 ml-1">({weatherData?.suhu ?? 29}°C)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              {weatherData?.pesanPrediksi || "Curah hujan terpantau stabil dan tidak berpotensi memicu lonjakan debit air sungai."}
            </p>

            {/* Mini Hourly Forecast 3 Jam ke Depan */}
            {weatherData?.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
              <div className="pt-1.5 border-t border-sky-100/60 grid grid-cols-3 gap-1.5 text-center">
                {weatherData.hourlyForecast.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="bg-white/80 py-1 px-1.5 rounded-lg border border-sky-100/60 shadow-2xs">
                    <div className="text-[9px] text-slate-400 font-medium">{item.jam}</div>
                    <div className="text-[10.5px] font-bold text-slate-800">
                      {typeof item.curahHujan === "number" ? item.curahHujan.toFixed(1) : "0.0"} mm
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hardware & IoT Health Diagnostics */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Daya Baterai</div>
                <div className="font-bold text-slate-800">Solar {selectedStation.batteryPct}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Wifi className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">Sinyal IoT</div>
                <div className="font-bold text-slate-800 truncate">{selectedStation.signalStrength}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
              <Radio className="w-3.5 h-3.5 text-[#1D443F] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">Protokol Transmisi</div>
                <div className="font-bold text-slate-800 truncate">{selectedStation.protocol}</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-2 mt-auto">
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  const indramayuBounds = L.latLngBounds([
                    [-6.26, 108.02],
                    [-6.68, 108.38],
                  ]);
                  mapInstanceRef.current.fitBounds(indramayuBounds, { padding: [35, 35] });
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#38746D]" />
              <span>Lihat Seluruh Wilayah</span>
            </button>

            <Link
              href="/petugas/peta-sar"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Peta SAR Lengkap</span>
            </Link>
          </div>
        </div>
      )}
      </div>

      {/* 2. BAGIAN BAWAH: TABEL LOG DATA REAL-TIME (FULL-WIDTH & SCROLLABLE) */}
      <div className="w-full p-3 md:p-5 pt-4 pb-24 md:pb-12">
        {renderTelemetryTable()}
      </div>

      {/* 3. MOBILE VIEW BOTTOM SHEET (MD:HIDDEN - RESPONSIVE & POSISI DI ATAS BOTTOM NAV) */}
      {selectedStation && (
        <div
          style={{
            bottom: "calc(64px + max(0.5rem, env(safe-area-inset-bottom, 0px)))",
          }}
          className={`md:hidden fixed inset-x-0 z-[1050] bg-white rounded-t-3xl border-t border-slate-200/90 shadow-[0_-10px_35px_rgba(0,0,0,0.18)] transition-[height] duration-300 ease-out flex flex-col pointer-events-auto overflow-hidden ${
            mobileSheetOpen
              ? "h-[64vh] max-h-[calc(100dvh-150px)]"
              : "h-[74px]"
          }`}
        >
          {/* Drag Handle & Quick Summary Bar */}
          <div
            onClick={() => setMobileSheetOpen((prev) => !prev)}
            className="pt-2 px-4 pb-2.5 shrink-0 cursor-pointer border-b border-slate-100 flex flex-col select-none bg-white/95 backdrop-blur-sm"
          >
            <div className="w-10 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full mx-auto mb-2 transition" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    selectedStation.status.includes("BAHAYA")
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : selectedStation.status.includes("WASPADA")
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-[#EEF5F3] text-[#38746D] border-[#D5E4E0]"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#38746D]">
                      {selectedStation.code}
                    </span>
                    <span className="text-[9px] text-slate-300">&bull;</span>
                    <span className="text-[9px] text-slate-500 truncate">
                      {selectedStation.location}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#132422] truncate leading-tight">
                    {selectedStation.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {selectedStation.currentValue} {selectedStation.unit} &bull;{" "}
                    <span
                      className={`font-bold ${
                        selectedStation.status.includes("BAHAYA")
                          ? "text-rose-600"
                          : selectedStation.status.includes("WASPADA")
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {selectedStation.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetOpen((prev) => !prev);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title={mobileSheetOpen ? "Perkecil panel" : "Perbesar panel"}
                >
                  {mobileSheetOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSensorId(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Bottom Sheet Content */}
          {mobileSheetOpen && (
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1 overscroll-contain pb-16 scrollbar-none">
              {/* Status Chip & Metrik Kritis Utama */}
              <div
                className={`p-3.5 rounded-2xl border transition-colors ${
                  selectedStation.status.includes("BAHAYA")
                    ? "bg-rose-50/80 border-rose-200"
                    : selectedStation.status.includes("WASPADA")
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-[#EEF5F3] border-[#D5E4E0]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4B635F] font-semibold">
                    {selectedStation.readingLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                      selectedStation.status.includes("BAHAYA")
                        ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                        : selectedStation.status.includes("WASPADA")
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {selectedStation.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-black tracking-tight ${
                        selectedStation.status.includes("BAHAYA")
                          ? "text-rose-700 animate-pulse"
                          : selectedStation.status.includes("WASPADA")
                          ? "text-amber-800"
                          : "text-[#1D443F]"
                      }`}
                    >
                      {selectedStation.currentValue}
                    </span>
                    <span className="text-xs font-bold text-[#38746D]">
                      {selectedStation.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold flex items-center gap-1 justify-end ${
                        selectedStation.trend === "NAIK"
                          ? "text-amber-700"
                          : selectedStation.trend === "TURUN"
                          ? "text-sky-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {selectedStation.trend === "NAIK" ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                          <span>{selectedStation.trendText || "Tren Naik"}</span>
                        </>
                      ) : selectedStation.trend === "TURUN" ? (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
                          <span>{selectedStation.trendText || "Penurunan"}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{selectedStation.trendText || "Kondisi Stabil"}</span>
                        </>
                      )}
                    </div>
                    <p className="text-[9.5px] text-slate-500 mt-0.5">
                      Ambang Siaga: &gt; {selectedStation.dangerThreshold} {selectedStation.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Indikator Ambang Batas 3 Level */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] font-semibold">
                  <span className={selectedStation.status === "NORMAL" ? "text-emerald-700 font-bold" : "text-slate-500"}>
                    Normal (&lt;{selectedStation.normalMax})
                  </span>
                  <span className={selectedStation.status.includes("WASPADA") ? "text-amber-700 font-bold" : "text-slate-500"}>
                    Waspada ({selectedStation.normalMax}-{selectedStation.waspadaMax})
                  </span>
                  <span className={selectedStation.status.includes("BAHAYA") ? "text-rose-600 font-bold animate-pulse" : "text-slate-500"}>
                    Bahaya (&gt;{selectedStation.dangerThreshold})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
                  <div
                    className={`h-full rounded-l-full transition-all duration-500 ${
                      selectedStation.status === "NORMAL" ? "bg-emerald-500 shadow-xs" : "bg-emerald-500/50"
                    }`}
                    style={{ width: "33.3%" }}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedStation.status.includes("WASPADA") ? "bg-amber-400 shadow-xs" : "bg-amber-400/50"
                    }`}
                    style={{ width: "33.3%" }}
                  />
                  <div
                    className={`h-full rounded-r-full transition-all duration-500 ${
                      selectedStation.status.includes("BAHAYA") ? "bg-rose-500 shadow-xs animate-pulse" : "bg-rose-500/40"
                    }`}
                    style={{ width: "33.4%" }}
                  />
                </div>
              </div>

              {/* Grafik Fluktuasi Ketinggian (12 Jam Terakhir) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#38746D]" />
                    <span className="text-[11px] font-bold text-slate-800">
                      Fluktuasi Ketinggian (12 Jam Terakhir)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Live Proxy SCADA</span>
                </div>

                <div className="w-full h-24 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 340 90" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mobilePanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38746D" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38746D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {sparklineData.areaD && (
                      <path d={sparklineData.areaD} fill="url(#mobilePanelGrad)" />
                    )}

                    {sparklineData.pathD && (
                      <path
                        d={sparklineData.pathD}
                        fill="none"
                        stroke="#1D443F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {sparklineData.points.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={i === sparklineData.points.length - 1 ? 4.5 : 3}
                          fill={
                            i === sparklineData.points.length - 1
                              ? selectedStation.status.includes("BAHAYA")
                                ? "#EF4444"
                                : selectedStation.status.includes("WASPADA")
                                ? "#F59E0B"
                                : "#10B981"
                              : "#38746D"
                          }
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                  {selectedStation.historicalTrend.map((item, idx) => (
                    <span key={idx}>{item.time}</span>
                  ))}
                </div>
              </div>

              {/* Deskripsi Sensor */}
              <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAF9] p-3 rounded-xl border border-slate-100">
                {selectedStation.description}
              </p>

              {/* Indikator Prediktif: Prediksi Curah Hujan (Hulu & DAS) - Mobile View */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-emerald-50/40 border border-sky-100/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CloudRain className="w-4 h-4 text-[#38746D] shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {selectedStation.id === "st-02" || selectedStation.type === "SUNGAI_CIMANUK"
                        ? "Prediksi Curah Hujan (Hulu)"
                        : "Prediksi Curah Hujan (Area Sensor)"}
                    </span>
                  </div>
                  {/* Peringatan Dinamis jika prediksi > 10mm */}
                  {weatherData && (weatherData.prediksiCurahHujan > 10 || weatherData.isAntisipasiKenaikanDebit) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse shrink-0">
                      Antisipasi Kenaikan Debit
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 shrink-0">
                      Debit Stabil
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {typeof weatherData?.prediksiCurahHujan === "number"
                        ? weatherData.prediksiCurahHujan.toFixed(1)
                        : "1.4"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">mm / 3 jam</span>
                  </div>
                  <div className="text-right text-[11px] font-medium text-slate-600">
                    <span>{weatherData?.ikonCuaca || "🌤️"} {weatherData?.kondisiSekarang || "Cerah Berawan"}</span>
                    <span className="text-slate-400 ml-1">({weatherData?.suhu ?? 29}°C)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {weatherData?.pesanPrediksi || "Curah hujan terpantau stabil dan tidak berpotensi memicu lonjakan debit air sungai."}
                </p>

                {/* Mini Hourly Forecast 3 Jam ke Depan */}
                {weatherData?.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
                  <div className="pt-1.5 border-t border-sky-100/60 grid grid-cols-3 gap-1.5 text-center">
                    {weatherData.hourlyForecast.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="bg-white/80 py-1 px-1.5 rounded-lg border border-sky-100/60 shadow-2xs">
                        <div className="text-[9px] text-slate-400 font-medium">{item.jam}</div>
                        <div className="text-[10.5px] font-bold text-slate-800">
                          {typeof item.curahHujan === "number" ? item.curahHujan.toFixed(1) : "0.0"} mm
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hardware & IoT Health Diagnostics */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Daya Baterai</div>
                    <div className="font-bold text-slate-800">Solar {selectedStation.batteryPct}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Wifi className="w-3.5 h-3.5 text-[#38746D] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">Sinyal IoT</div>
                    <div className="font-bold text-slate-800 truncate">{selectedStation.signalStrength}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <Radio className="w-3.5 h-3.5 text-[#1D443F] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400">Protokol Transmisi</div>
                    <div className="font-bold text-slate-800 truncate">{selectedStation.protocol}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        const indramayuBounds = L.latLngBounds([
                          [-6.26, 108.02],
                          [-6.68, 108.38],
                        ]);
                        mapInstanceRef.current.fitBounds(indramayuBounds, { padding: [35, 35] });
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#38746D]" />
                    <span>Lihat Seluruh Wilayah</span>
                  </button>

                  <Link
                    href="/petugas/peta-sar"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#38746D] hover:bg-[#24544E] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Peta SAR Lengkap</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSensorId(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Ikhtisar Sensor</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(TelemetrySpatialMap);
