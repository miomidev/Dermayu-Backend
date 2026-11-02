"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  AlertTriangle,
  Home,
  Activity,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Radio,
  X,
  Info,
} from "lucide-react";

export interface MapReportPoint {
  id: string;
  ticketCode: string;
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  waterLevelText?: string;
  status: string;
  location: string;
  lat: number;
  lng: number;
  timeAgo: string;
}

export interface MapShelterPoint {
  id: string;
  name: string;
  location: string;
  distance: string;
  capacityTotal: number;
  capacityFilled: number;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  contactPerson: string;
  contactPhone: string;
  lat: number;
  lng: number;
  facilities: string[];
}

export interface MapTelemetryPoint {
  id: string;
  name: string;
  waterLevel: string;
  status: "NORMAL" | "WASPADA" | "SIAGA" | "AWAS";
  trend: "NAIK" | "TURUN" | "STABIL";
  lastUpdate: string;
  lat: number;
  lng: number;
}

interface WargaSpatialMapProps {
  reports?: MapReportPoint[];
  shelters?: MapShelterPoint[];
  telemetry?: MapTelemetryPoint[];
  onSelectShelter?: (shelter: MapShelterPoint) => void;
  onSelectReport?: (report: MapReportPoint) => void;
  onOpenReport?: () => void;
  onOpenContacts?: () => void;
  className?: string;
}

export default function WargaSpatialMap({
  reports = [],
  shelters = [],
  telemetry = [],
  onSelectShelter,
  onSelectReport,
  onOpenReport,
  onOpenContacts,
  className = "",
}: WargaSpatialMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const reportsLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const telemetryLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<"ALL" | "REPORTS" | "SHELTERS" | "TELEMETRY">("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMobileLegend, setShowMobileLegend] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<
    | { type: "shelter"; data: MapShelterPoint }
    | { type: "report"; data: MapReportPoint }
    | { type: "telemetry"; data: MapTelemetryPoint }
    | null
  >(null);

  // Indramayu coastal zone center (Kandanghaur - Cantigi - Kota)
  const defaultCenter: [number, number] = [-6.335, 108.22];
  const defaultZoom = 12;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    // Standard OpenStreetMap tiles (no API key required, reliable)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | BPBD Indramayu',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    reportsLayerRef.current = L.layerGroup().addTo(map);
    sheltersLayerRef.current = L.layerGroup().addTo(map);
    telemetryLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on("click", (e) => {
      // If clicking map background (not marker)
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest(".leaflet-marker-icon")) {
        setSelectedMarker(null);
      }
    });

    // ResizeObserver to recalibrate Leaflet on sidebar toggle / window resize
    const container = mapContainerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Layers
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !reportsLayerRef.current ||
      !sheltersLayerRef.current ||
      !telemetryLayerRef.current ||
      !routesLayerRef.current
    )
      return;

    reportsLayerRef.current.clearLayers();
    sheltersLayerRef.current.clearLayers();
    telemetryLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. PLOT FLOOD REPORTS
    if (activeLayer === "ALL" || activeLayer === "REPORTS") {
      reports.forEach((rep) => {
        const isCritical = rep.severity === "CRITICAL";
        const isHigh = rep.severity === "HIGH";
        const color = isCritical ? "#DC2626" : isHigh ? "#EA580C" : "#D97706";

        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            ${
              isCritical
                ? `<span style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.45); animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : ""
            }
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 11px;">
              ${isCritical ? "!" : "▲"}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-flood-marker",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const popupContent = `
          <div style="font-family: inherit; width: 220px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${color}; background: #FFF1F2; padding: 2px 6px; border-radius: 6px; border: 1px solid #FECDD3;">
                ${rep.ticketCode}
              </span>
              <span style="font-size: 9px; font-weight: 700; color: #4B635F;">${rep.timeAgo}</span>
            </div>
            <div style="font-size: 12px; font-weight: 800; margin-bottom: 4px; line-height: 1.35; color: #132422;">
              ${rep.title}
            </div>
            <div style="font-size: 11px; color: #4B635F; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              📍 <span>${rep.location}</span>
            </div>
            ${
              rep.waterLevelText
                ? `<div style="font-size: 11px; font-weight: 700; color: #991B1B; background: #FEF2F2; padding: 4px 8px; border-radius: 6px; margin-bottom: 6px; border: 1px solid #FEE2E2;">
                    Ketinggian Air: ${rep.waterLevelText}
                  </div>`
                : ""
            }
            <div style="font-size: 10px; color: #38746D; font-weight: 700;">
              Status: ${rep.status}
            </div>
          </div>
        `;

        const marker = L.marker([rep.lat, rep.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          setSelectedMarker({ type: "report", data: rep });
          if (onSelectReport) onSelectReport(rep);
        });
        reportsLayerRef.current?.addLayer(marker);
      });
    }

    // 2. PLOT SHELTERS (POSKO PENGUNGSIAN)
    if (activeLayer === "ALL" || activeLayer === "SHELTERS") {
      shelters.forEach((sh) => {
        const sisaKapasitas = sh.capacityTotal - sh.capacityFilled;
        const isFull = sh.status === "PENUH";
        const color = isFull ? "#9CA3AF" : "#059669";

        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px;">
              🏠
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-shelter-marker",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const popupContent = `
          <div style="font-family: inherit; width: 230px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #047857; background: #ECFDF5; padding: 2px 6px; border-radius: 6px; border: 1px solid #A7F3D0;">
                POSKO AMAN
              </span>
              <span style="font-size: 10px; font-weight: 700; color: ${isFull ? "#DC2626" : "#059669"};">
                ${sh.status}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 800; margin-bottom: 2px; color: #132422;">
              ${sh.name}
            </div>
            <div style="font-size: 10px; color: #4B635F; margin-bottom: 6px;">
              📍 ${sh.location} (${sh.distance})
            </div>
            <div style="font-size: 11px; background: #F8FAF9; padding: 6px 8px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 11px;">
                <span>Kapasitas:</span>
                <span style="color: #059669;">${sh.capacityFilled} / ${sh.capacityTotal} Jiwa</span>
              </div>
              <div style="font-size: 10px; color: #64748B; margin-top: 2px;">
                Tersedia ${sisaKapasitas} kuota tempat
              </div>
            </div>
            <div style="font-size: 10px; color: #1E3A8A; font-weight: 700;">
              📞 Kontak: ${sh.contactPerson} (${sh.contactPhone})
            </div>
          </div>
        `;

        const marker = L.marker([sh.lat, sh.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          setSelectedMarker({ type: "shelter", data: sh });
          if (onSelectShelter) onSelectShelter(sh);
        });
        sheltersLayerRef.current?.addLayer(marker);
      });

      // 3. PLOT SAFE EVACUATION ROUTE POLYLINES (Eretan coast to Balai Desa & GOR)
      const safeRoute1: [number, number][] = [
        [-6.3475, 108.1189], // Titik Banjir Eretan
        [-6.3468, 108.1192], // Simpang Tanggul
        [-6.3460, 108.1195], // Balai Desa Eretan Wetan
      ];

      const polyline = L.polyline(safeRoute1, {
        color: "#059669",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.85,
      }).bindTooltip("Jalur Evakuasi Darat Bebas Air", { sticky: true });

      routesLayerRef.current?.addLayer(polyline);
    }

    // 4. PLOT TELEMETRY STATIONS
    if (activeLayer === "ALL" || activeLayer === "TELEMETRY") {
      telemetry.forEach((tel) => {
        const isWaspada = tel.status === "WASPADA" || tel.status === "SIAGA";
        const color = isWaspada ? "#D97706" : "#0284C7";

        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
            <div style="width: 24px; height: 24px; border-radius: 9999px; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px;">
              〰
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-telemetry-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const popupContent = `
          <div style="font-family: inherit; width: 210px; padding: 2px; color: #132422;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #0284C7; background: #F0F9FF; padding: 2px 6px; border-radius: 6px; border: 1px solid #BAE6FD;">
                SENSOR TELEMETRI
              </span>
              <span style="font-size: 10px; font-weight: 800; color: ${color};">
                ${tel.status}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 800; margin-bottom: 4px; color: #132422;">
              ${tel.name}
            </div>
            <div style="font-size: 11px; background: #F8FAF9; padding: 5px 8px; border-radius: 6px; border: 1px solid #E2E8F0; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Level TMA:</span>
              <span style="font-weight: 800; color: #132422;">${tel.waterLevel}</span>
            </div>
            <div style="font-size: 10px; color: #64748B;">
              Tren: <strong>${tel.trend}</strong> • Update: ${tel.lastUpdate}
            </div>
          </div>
        `;

        const marker = L.marker([tel.lat, tel.lng], { icon }).bindPopup(popupContent);
        marker.on("click", () => {
          setSelectedMarker({ type: "telemetry", data: tel });
        });
        telemetryLayerRef.current?.addLayer(marker);
      });
    }
  }, [reports, shelters, telemetry, activeLayer, onSelectReport, onSelectShelter]);

  // Recenter to Indramayu
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
    }
  };

  // Quick Fly to hotspots
  const handleFlyTo = (coords: [number, number], zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 0.9 });
    }
  };

  // Find My Location
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert("Fitur GPS lokasi tidak didukung pada peramban ini.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (!mapInstanceRef.current) return;

        // Fly to user coordinates
        mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1 });

        // Add user marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIconHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
              <span style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 18px; height: 18px; border-radius: 9999px; background: #2563EB; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
            </div>
          `;
          const userIcon = L.divIcon({
            html: userIconHtml,
            className: "custom-user-marker",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup("<strong>Lokasi Anda Saat Ini</strong>")
            .addTo(mapInstanceRef.current);
        }
      },
      () => {
        setLocating(false);
        alert("Tidak dapat mengakses GPS lokasi. Mohon izinkan akses lokasi pada browser Anda.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-[#D5E4E0] bg-white shadow-sm flex flex-col isolate z-0 ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-2xl shadow-2xl"
          : className || "h-[calc(100dvh-10rem)] md:h-[calc(100vh-7.5rem)] min-h-[460px] md:min-h-[560px]"
      }`}
    >
      {/* Map Canvas & Floating Controls Wrapper (100% Edge-to-Edge) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Leaflet Map Body Container */}
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* ============================================================== */}
        {/* 1. MOBILE RESPONSIVE HUD (SCREEN < MD)                         */}
        {/* ============================================================== */}
        <div
          className="md:hidden absolute top-2 left-2 right-2 z-10 flex flex-col gap-1.5 pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Mobile Row 1: Status Capsule + 112 CTA + Tools */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Status Alert Capsule */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#D5E4E0] shadow-md min-w-0 flex-1">
              <div className="w-6 h-6 rounded-lg bg-[#EEF5F3] flex items-center justify-center text-[#1D443F] shrink-0">
                <Compass className="w-3.5 h-3.5 text-[#38746D]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[11px] text-[#132422] truncate">Indramayu</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    <span className="w-1 h-1 rounded-full bg-amber-600 animate-ping" />
                    SIAGA II
                  </span>
                </div>
                <p className="text-[9px] text-[#4B635F] leading-tight truncate">
                  TMA <strong className="text-amber-700 font-extrabold">+65cm</strong> • Debit <strong className="text-[#38746D] font-extrabold">310m³/s</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions & GIS Tools */}
            <div className="flex items-center gap-1 shrink-0">
              {onOpenContacts && (
                <button
                  type="button"
                  onClick={onOpenContacts}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Kontak 112"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-[11px] font-extrabold">112</span>
                </button>
              )}
              <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md shrink-0">
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="p-1 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
                  title="Deteksi Lokasi Saya"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin text-blue-600" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="p-1 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
                  title="Pusatkan Peta"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
                  title="Layar Penuh"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Row 2: Horizontal Carousel (Lapor + Filters + Hotspots) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-0.5 px-0.5 touch-pan-x pointer-events-auto">
            {/* Lapor Titik Banjir Primary Chip */}
            {onOpenReport && (
              <button
                type="button"
                onClick={onOpenReport}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-[11px] font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#88BDB6]" />
                <span>Lapor Titik Banjir</span>
              </button>
            )}

            {/* Filter Chips */}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md shrink-0">
              <button
                type="button"
                onClick={() => setActiveLayer("ALL")}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer shrink-0 ${
                  activeLayer === "ALL"
                    ? "bg-[#1D443F] text-white shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("REPORTS")}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  activeLayer === "REPORTS"
                    ? "bg-rose-700 text-white shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Genangan ({reports.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("SHELTERS")}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  activeLayer === "SHELTERS"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Posko ({shelters.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("TELEMETRY")}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  activeLayer === "TELEMETRY"
                    ? "bg-sky-700 text-white shadow-xs"
                    : "text-[#4B635F] hover:text-[#132422]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Sensor ({telemetry.length})</span>
              </button>
            </div>

            {/* Hotspot Chips on Mobile Carousel */}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md shrink-0 text-[10.5px] font-semibold text-[#132422]">
              <span className="text-[#718783] text-[9px] uppercase tracking-wider font-bold px-1">Fokus:</span>
              <button
                type="button"
                onClick={() => handleFlyTo([-6.305, 108.15], 14)}
                className="px-2 py-0.5 rounded-md hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer shrink-0 font-bold"
              >
                Eretan
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo([-6.3475, 108.1189], 14)}
                className="px-2 py-0.5 rounded-md hover:bg-amber-50 text-amber-800 transition-colors cursor-pointer shrink-0 font-bold"
              >
                Kandanghaur
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo([-6.2842, 108.2635], 14)}
                className="px-2 py-0.5 rounded-md hover:bg-emerald-50 text-emerald-800 transition-colors cursor-pointer shrink-0 font-bold"
              >
                Cantigi
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo([-6.3264, 108.3223], 14)}
                className="px-2 py-0.5 rounded-md hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer shrink-0 font-bold"
              >
                Kota
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. DESKTOP HUD (SCREEN >= MD)                                  */}
        {/* ============================================================== */}
        {/* Floating Top-Left: Status Alert & Hotspots Focus */}
        <div
          className="hidden md:flex absolute top-4 left-4 z-10 flex-col gap-2 max-w-sm pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Status Badge */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D5E4E0] shadow-md">
            <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] border border-[#38746D]/20 flex items-center justify-center text-[#1D443F] shrink-0">
              <Compass className="w-4 h-4 text-[#38746D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-[#132422]">Indramayu Siaga</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  SIAGA II: ROB
                </span>
              </div>
              <p className="text-[10px] text-[#4B635F] leading-tight mt-0.5">
                TMA <strong className="text-amber-700 font-extrabold">+65 cm</strong> • Debit <strong className="text-[#38746D] font-extrabold">310 m³/s</strong>
              </p>
            </div>
          </div>

          {/* Quick Hotspot Focus Pills */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#D5E4E0] shadow-md text-[10px] font-semibold text-[#132422]">
            <span className="text-[#718783] text-[9px] uppercase tracking-wider font-bold">Fokus:</span>
            <button
              type="button"
              onClick={() => handleFlyTo(defaultCenter, defaultZoom)}
              className="px-2 py-0.5 rounded-md hover:bg-[#EEF5F3] text-[#1D443F] transition-colors cursor-pointer font-bold"
            >
              Semua
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => handleFlyTo([-6.305, 108.15], 14)}
              className="px-2 py-0.5 rounded-md hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer"
            >
              Eretan
            </button>
            <button
              type="button"
              onClick={() => handleFlyTo([-6.3475, 108.1189], 14)}
              className="px-2 py-0.5 rounded-md hover:bg-amber-50 text-amber-800 transition-colors cursor-pointer"
            >
              Kandanghaur
            </button>
            <button
              type="button"
              onClick={() => handleFlyTo([-6.2842, 108.2635], 14)}
              className="px-2 py-0.5 rounded-md hover:bg-emerald-50 text-emerald-800 transition-colors cursor-pointer"
            >
              Cantigi
            </button>
            <button
              type="button"
              onClick={() => handleFlyTo([-6.3264, 108.3223], 14)}
              className="px-2 py-0.5 rounded-md hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer"
            >
              Kota
            </button>
          </div>
        </div>

        {/* Floating Top-Right: Filter Layers, Actions & Tools */}
        <div
          className="hidden md:flex absolute top-4 right-4 z-10 flex-wrap items-center justify-end gap-2 pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Layer Filters */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md">
            <button
              type="button"
              onClick={() => setActiveLayer("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeLayer === "ALL"
                  ? "bg-[#1D443F] text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("REPORTS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === "REPORTS"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Genangan ({reports.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("SHELTERS")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === "SHELTERS"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Posko ({shelters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("TELEMETRY")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === "TELEMETRY"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "text-[#4B635F] hover:text-[#132422] hover:bg-white/80"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Sensor TMA ({telemetry.length})</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#88BDB6]" />
              <span>Lapor Titik Banjir</span>
            </button>
          )}

          {onOpenContacts && (
            <button
              type="button"
              onClick={onOpenContacts}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Kontak 112</span>
            </button>
          )}

          {/* Map Tools */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#D5E4E0] shadow-md">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="p-1.5 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title="Deteksi Lokasi Saya (GPS)"
              aria-label="Deteksi Lokasi Saya"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin text-blue-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="p-1.5 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title="Pusatkan Peta ke Indramayu"
              aria-label="Pusatkan Peta ke Indramayu"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-[#1D443F] hover:bg-[#EEF5F3] transition-colors cursor-pointer"
              title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
              aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM LEGEND (RESPONSIVE)                                  */}
        {/* ============================================================== */}
        <div
          className="absolute bottom-3 left-3 pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          {/* Desktop Legend Strip */}
          <div className="hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D5E4E0] shadow-md text-[10px] font-semibold text-[#132422]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <span>Banjir Rob Kritis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Genangan Sedang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span>Posko Aman</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>Sensor TMA</span>
            </div>
          </div>

          {/* Mobile Legend Pill & Popover */}
          <div className="md:hidden relative">
            {showMobileLegend && (
              <div className="absolute bottom-11 left-0 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#D5E4E0] shadow-2xl space-y-2 text-[11px] min-w-[190px]">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Keterangan Titik</span>
                  <button
                    type="button"
                    onClick={() => setShowMobileLegend(false)}
                    className="p-0.5 rounded-md text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <span className="font-semibold text-gray-800">Banjir Rob Kritis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-gray-800">Genangan Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span className="font-semibold text-gray-800">Posko Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span className="font-semibold text-gray-800">Sensor TMA</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMobileLegend(!showMobileLegend)}
              className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#D5E4E0] shadow-md flex items-center gap-1.5 text-[10px] font-bold text-[#132422] active:scale-95 transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#38746D]" />
              <span>Legenda</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. FLOATING SELECTED MARKER CARD (RESPONSIVE)                  */}
        {/* ============================================================== */}
        {selectedMarker && (
          <div
            className="absolute bottom-3 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#D5E4E0] shadow-2xl text-left space-y-2.5"
            style={{ zIndex: 1000 }}
          >
          {selectedMarker.type === "shelter" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  POSKO PENGUNGSIAN AMAN
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                  aria-label="Tutup info"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#132422]">{selectedMarker.data.name}</h4>
                <p className="text-xs text-[#718783] mt-0.5">
                  {selectedMarker.data.location} &bull; {selectedMarker.data.distance}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs bg-[#F8FAF9] p-2 rounded-xl border border-gray-100">
                <span className="text-gray-500">Kapasitas:</span>
                <span className="font-bold text-emerald-700">
                  {selectedMarker.data.capacityFilled} / {selectedMarker.data.capacityTotal} Jiwa (Sisa{" "}
                  {selectedMarker.data.capacityTotal - selectedMarker.data.capacityFilled})
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const shelter = selectedMarker.data;
                    setSelectedMarker(null);
                    if (onSelectShelter) onSelectShelter(shelter);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1D443F] hover:bg-[#24544E] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Panduan Rute</span>
                </button>
                <a
                  href={`tel:${selectedMarker.data.contactPhone.replace(/[^0-9]/g, "")}`}
                  className="p-2 rounded-xl border border-[#D5E4E0] text-[#1D443F] hover:bg-[#EEF5F3] transition"
                  title={`Hubungi ${selectedMarker.data.contactPerson}`}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </>
          )}

          {selectedMarker.type === "report" && (
            <>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMarker.data.severity === "CRITICAL"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedMarker.data.severity === "CRITICAL" ? "BANJIR ROB KRITIS" : "GENANGAN AIR"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                  aria-label="Tutup info"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#132422]">{selectedMarker.data.title}</h4>
                <p className="text-xs text-[#718783] mt-0.5">{selectedMarker.data.location}</p>
              </div>
              {selectedMarker.data.waterLevelText && (
                <div className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-100">
                  Ketinggian Air: {selectedMarker.data.waterLevelText}
                </div>
              )}
              <div className="text-[11px] text-gray-500 flex justify-between pt-0.5">
                <span>
                  Status: <strong>{selectedMarker.data.status}</strong>
                </span>
                <span>{selectedMarker.data.timeAgo}</span>
              </div>
            </>
          )}

          {selectedMarker.type === "telemetry" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  SENSOR TELEMETRI
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                  aria-label="Tutup info"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#132422]">{selectedMarker.data.name}</h4>
                <p className="text-xs text-sky-800 font-bold mt-1 bg-sky-50 p-2 rounded-xl border border-sky-100">
                  Level Air: {selectedMarker.data.waterLevel}
                </p>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between pt-0.5">
                <span>
                  Tren: <strong>{selectedMarker.data.trend}</strong>
                </span>
                <span>Update: {selectedMarker.data.lastUpdate}</span>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
