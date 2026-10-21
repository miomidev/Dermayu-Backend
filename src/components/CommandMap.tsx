"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, ShieldCheck, MapPin, ExternalLink, RefreshCw } from "lucide-react";

interface MapReport {
  id: string;
  public_id: string;
  ticket_code: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  water_level?: string | null;
  status: string;
  latitude: number | string;
  longitude: number | string;
  address_text?: string | null;
  category: {
    code: string;
    name: string;
  };
  media?: Array<{
    url: string;
    ai_prediction?: {
      label: string;
      confidence: number;
    } | null;
  }>;
}

interface EvacPoint {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  capacity: number;
  contact_name?: string | null;
  contact_phone?: string | null;
}

interface CommandMapProps {
  reports: MapReport[];
  evacuationPoints?: EvacPoint[];
  onSelectReport?: (report: MapReport) => void;
}

export default function CommandMap({
  reports,
  evacuationPoints = [],
  onSelectReport,
}: CommandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const evacLayerRef = useRef<L.LayerGroup | null>(null);

  const [showEvac, setShowEvac] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const indramayuCenter: [number, number] = [-6.3268, 108.3221];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: indramayuCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | DERMAYU',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    evacLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !evacLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    evacLayerRef.current.clearLayers();

    // 1. Plot Reports
    reports.forEach((report) => {
      const lat = parseFloat(String(report.latitude));
      const lng = parseFloat(String(report.longitude));

      if (isNaN(lat) || isNaN(lng)) return;
      if (selectedSeverity !== "ALL" && report.severity !== selectedSeverity) return;

      const getBgColor = () => {
        switch (report.severity) {
          case "CRITICAL":
            return "#ef4444";
          case "HIGH":
            return "#f97316";
          case "MEDIUM":
            return "#f59e0b";
          default:
            return "#06b6d4";
        }
      };

      const bgColor = getBgColor();
      const isCritical = report.severity === "CRITICAL";

      // Custom DivIcon
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          ${
            isCritical
              ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: #ef4444; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
              : ""
          }
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: ${bgColor}; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${report.severity === "CRITICAL" ? "!" : "•"}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const latestAi = report.media?.[0]?.ai_prediction;
      const popupHtml = `
        <div style="font-family: inherit; width: 220px; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 11px; color: #0891b2; font-family: monospace;">${report.ticket_code}</span>
            <span style="font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 4px; background: ${bgColor}; color: white;">${report.severity}</span>
          </div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; line-height: 1.3;">${report.title}</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">📍 ${report.address_text || "Lokasi Laporan"}</div>
          ${
            latestAi
              ? `<div style="font-size: 10px; font-weight: bold; color: ${
                  latestAi.label === "flood" ? "#0f766e" : "#475569"
                }; background: #f0fdfa; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px;">
                  🤖 AI: ${latestAi.label} (${Math.round(latestAi.confidence * 100)}%)
                </div>`
              : ""
          }
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupHtml);
      marker.on("click", () => {
        if (onSelectReport) onSelectReport(report);
      });
      markersLayerRef.current?.addLayer(marker);
    });

    // 2. Plot Evacuation Points
    if (showEvac && evacuationPoints.length > 0) {
      evacuationPoints.forEach((ep) => {
        const lat = parseFloat(String(ep.latitude));
        const lng = parseFloat(String(ep.longitude));
        if (isNaN(lat) || isNaN(lng)) return;

        const evacIconHtml = `
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background-color: #10b981; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: white; font-size: 12px;">
            🏠
          </div>
        `;

        const evacIcon = L.divIcon({
          html: evacIconHtml,
          className: "custom-leaflet-evac",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const evacPopup = `
          <div style="font-family: inherit; width: 200px; color: #0f172a;">
            <div style="font-weight: 800; font-size: 12px; color: #059669; margin-bottom: 2px;">🟢 Posko Pengungsian</div>
            <div style="font-weight: bold; font-size: 12px;">${ep.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${ep.address}</div>
            <div style="font-size: 10px; margin-top: 4px; font-weight: 600;">Kapasitas: ${ep.capacity} jiwa</div>
            ${ep.contact_phone ? `<div style="font-size: 10px; color: #0284c7; margin-top: 2px;">📞 ${ep.contact_phone}</div>` : ""}
          </div>
        `;

        const evacMarker = L.marker([lat, lng], { icon: evacIcon }).bindPopup(evacPopup);
        evacLayerRef.current?.addLayer(evacMarker);
      });
    }
  }, [reports, evacuationPoints, showEvac, selectedSeverity, onSelectReport]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(indramayuCenter, 12, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Control Floating Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-1 px-2 text-xs font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">Semua Keparahan</option>
          <option value="CRITICAL">Kritis Sahaja</option>
          <option value="HIGH">Tinggi</option>
          <option value="MEDIUM">Sedang</option>
          <option value="LOW">Rendah</option>
        </select>

        <button
          onClick={() => setShowEvac(!showEvac)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 ${
            showEvac
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
              : "bg-slate-900 text-slate-400 border border-slate-800"
          }`}
        >
          <span>🏠 Posko Pengungsian ({evacuationPoints.length})</span>
        </button>

        <button
          onClick={handleRecenter}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 flex items-center space-x-1"
          title="Fokus ke pusat Indramayu"
        >
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span>Indramayu</span>
        </button>
      </div>

      {/* Map Legend Floating Box */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-[10px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-300 mb-1">Legenda Marker:</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-slate-300">Kritis (Evakuasi Segera)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-300">Tinggi (Banjir Parah)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300">Sedang (Genangan Air)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-slate-300">Titik Posko Evakuasi</span>
        </div>
      </div>

      {/* Leaflet Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
