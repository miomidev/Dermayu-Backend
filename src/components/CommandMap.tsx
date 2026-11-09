"use client";

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import indramayuBoundaryData from "@/data/indramayuBoundary.json";
import {
  Layers,
  MapPin,
  AlertTriangle,
  Waves,
  Home,
  Building2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  fetchWaterInfrastructureGeoJSON,
  fetchFloodProneGeoJSON,
  fetchSchoolSheltersGeoJSON,
} from "@/lib/spatialGeojson";

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

const createCommandPinIcon = (
  type: "posko" | "genangan" | "kritis" | "infra" | "rawan"
) => {
  const config = {
    posko: {
      bg: "bg-[#2D6A4F]",
      icon: <Home className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
    },
    genangan: {
      bg: "bg-amber-500",
      icon: <Waves className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
    },
    kritis: {
      bg: "bg-rose-600",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
    },
    infra: {
      bg: "bg-cyan-600",
      icon: <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
    },
    rawan: {
      bg: "bg-purple-600",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
    },
  }[type];

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md">
      ${
        type === "kritis"
          ? '<span class="absolute -top-1 w-9 h-9 rounded-full bg-rose-500/40 animate-ping pointer-events-none"></span>'
          : ""
      }
      <div class="w-8 h-8 ${config.bg} rounded-full border-2 border-white shadow-md flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
        ${renderToStaticMarkup(config.icon)}
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-[2px] relative z-0"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-pin-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  });
};

export default function CommandMap({
  reports,
  evacuationPoints = [],
  onSelectReport,
}: CommandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const evacLayerRef = useRef<L.LayerGroup | null>(null);
  const waterInfraLayerRef = useRef<L.LayerGroup | null>(null);
  const floodProneLayerRef = useRef<L.LayerGroup | null>(null);
  const schoolShelterLayerRef = useRef<L.LayerGroup | null>(null);

  const [showEvac, setShowEvac] = useState(true);
  const [showWaterInfra, setShowWaterInfra] = useState(false);
  const [showFloodProne, setShowFloodProne] = useState(false);
  const [showSchoolShelters, setShowSchoolShelters] = useState(false);
  const [loadingLayer, setLoadingLayer] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const indramayuCenter: [number, number] = [-6.40, 108.28];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const indramayuBounds = L.latLngBounds(
      [-6.70, 107.85],
      [-6.20, 108.60]
    );

    const map = L.map(mapContainerRef.current, {
      center: indramayuCenter,
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      maxBounds: indramayuBounds.pad(0.08),
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | BPBD DERMAYU',
      maxZoom: 19,
    }).addTo(map);

    const boundaryLayer = L.geoJSON(indramayuBoundaryData as any, {
      interactive: false,
      style: {
        fill: false,
        fillOpacity: 0,
        color: "#1B4D3E",
        weight: 2.5,
        opacity: 0.95,
        dashArray: "6, 6",
      },
    }).addTo(map);

    const bounds = boundaryLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
    }

    markersLayerRef.current = L.layerGroup().addTo(map);
    evacLayerRef.current = L.layerGroup().addTo(map);
    waterInfraLayerRef.current = L.layerGroup().addTo(map);
    floodProneLayerRef.current = L.layerGroup().addTo(map);
    schoolShelterLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 1. Render Reports & Evacuation Points
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !evacLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    evacLayerRef.current.clearLayers();

    // Plot Reports
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
      const customIcon = createCommandPinIcon(isCritical ? "kritis" : "genangan");
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

    // Plot Evacuation Points
    if (showEvac && evacuationPoints.length > 0) {
      evacuationPoints.forEach((ep) => {
        const lat = parseFloat(String(ep.latitude));
        const lng = parseFloat(String(ep.longitude));
        if (isNaN(lat) || isNaN(lng)) return;

        const evacIcon = createCommandPinIcon("posko");

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

  // 2. Render Layer: Infrastruktur Pengendali Air
  useEffect(() => {
    if (!waterInfraLayerRef.current) return;
    waterInfraLayerRef.current.clearLayers();

    if (!showWaterInfra) return;

    let isMounted = true;
    setLoadingLayer("infra");

    fetchWaterInfrastructureGeoJSON()
      .then((data) => {
        if (!isMounted || !waterInfraLayerRef.current) return;
        data.features.forEach((feat) => {
          const [lng, lat] = feat.geometry.coordinates;
          const p = feat.properties;
          const icon = createCommandPinIcon("infra");

          const popup = `
            <div style="font-family: inherit; width: 230px; color: #0f172a; padding: 2px;">
              <div style="font-weight: 800; font-size: 11px; color: #0891b2; margin-bottom: 2px;">🏗️ Infrastruktur Air (BBWS)</div>
              <div style="font-weight: bold; font-size: 12px; color: #0f172a;">${p.nama_infrastruktur}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${p.lokasi_detail}</div>
              <div style="margin-top: 6px; padding: 4px 6px; border-radius: 6px; background: #ecfeff; border: 1px solid #cffafe; font-size: 10px;">
                <div><strong>Status:</strong> ${p.status_siaga}</div>
                <div><strong>Debit Air:</strong> ${p.debit_saat_ini_m3s} m³/s (${p.persentase_kapasitas}%)</div>
                <div><strong>Operasional:</strong> ${p.operasional_pintu}</div>
              </div>
              <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">Pengelola: ${p.instansi_pengelola}</div>
            </div>
          `;

          const m = L.marker([lat, lng], { icon }).bindPopup(popup);
          waterInfraLayerRef.current?.addLayer(m);
        });
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoadingLayer(null);
      });

    return () => {
      isMounted = false;
    };
  }, [showWaterInfra]);

  // 3. Render Layer: Titik Rawan Banjir
  useEffect(() => {
    if (!floodProneLayerRef.current) return;
    floodProneLayerRef.current.clearLayers();

    if (!showFloodProne) return;

    let isMounted = true;
    setLoadingLayer("rawan");

    fetchFloodProneGeoJSON()
      .then((data) => {
        if (!isMounted || !floodProneLayerRef.current) return;
        data.features.forEach((feat) => {
          const [lng, lat] = feat.geometry.coordinates;
          const p = feat.properties;
          const icon = createCommandPinIcon("rawan");

          const popup = `
            <div style="font-family: inherit; width: 220px; color: #0f172a; padding: 2px;">
              <div style="font-weight: 800; font-size: 11px; color: #9333ea; margin-bottom: 2px;">⚠️ Titik Rawan Bencana</div>
              <div style="font-weight: bold; font-size: 12px;">${p.nama_titik}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${p.desa}, ${p.kecamatan}</div>
              <div style="margin-top: 6px; padding: 4px 6px; border-radius: 6px; background: #faf5ff; border: 1px solid #f3e8ff; font-size: 10px;">
                <div style="color: #7e22ce; font-weight: bold;">Kerawanan: ${p.tingkat_kerawanan}</div>
                <div>Ketinggian: ${p.estimasi_ketinggian_air_cm}</div>
                <div>Penyebab: ${p.penyebab_utama}</div>
              </div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Sumber: ${p.sumber_acuan}</div>
            </div>
          `;

          const m = L.marker([lat, lng], { icon }).bindPopup(popup);
          floodProneLayerRef.current?.addLayer(m);
        });
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoadingLayer(null);
      });

    return () => {
      isMounted = false;
    };
  }, [showFloodProne]);

  // 4. Render Layer: Sekolah Posko Banjir (1.200+ Titik via CircleMarker)
  useEffect(() => {
    if (!schoolShelterLayerRef.current) return;
    schoolShelterLayerRef.current.clearLayers();

    if (!showSchoolShelters) return;

    let isMounted = true;
    setLoadingLayer("sekolah");

    fetchSchoolSheltersGeoJSON()
      .then((data) => {
        if (!isMounted || !schoolShelterLayerRef.current) return;
        data.features.forEach((feat) => {
          const [lng, lat] = feat.geometry.coordinates;
          const p = feat.properties;

          const popup = `
            <div style="font-family: inherit; width: 210px; color: #0f172a; padding: 2px;">
              <div style="font-weight: 800; font-size: 11px; color: #059669; margin-bottom: 2px;">🏫 Sekolah Posko Evakuasi</div>
              <div style="font-weight: bold; font-size: 11.5px;">${p.nama_sekolah}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${p.alamat_jalan || p.kecamatan}</div>
              <div style="margin-top: 5px; font-size: 10px; color: #047857; font-weight: 600;">
                Est. Kapasitas: ~${p.estimasi_kapasitas_pengungsi_jiwa} jiwa
              </div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 3px;">${p.potensi_posko_evakuasi}</div>
            </div>
          `;

          const cm = L.circleMarker([lat, lng], {
            radius: 5,
            fillColor: "#059669",
            color: "#ffffff",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85,
          }).bindPopup(popup);

          schoolShelterLayerRef.current?.addLayer(cm);
        });
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoadingLayer(null);
      });

    return () => {
      isMounted = false;
    };
  }, [showSchoolShelters]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(indramayuCenter, 12, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Control Floating Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl max-w-[calc(100%-2rem)]">
        <div className="flex items-center space-x-1 px-2 text-xs font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layer:</span>
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="ALL">Semua Laporan</option>
          <option value="CRITICAL">Kritis Sahaja</option>
          <option value="HIGH">Tinggi</option>
          <option value="MEDIUM">Sedang</option>
          <option value="LOW">Rendah</option>
        </select>

        <button
          onClick={() => setShowEvac(!showEvac)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
            showEvac
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          <span>🏠 Posko ({evacuationPoints.length})</span>
        </button>

        {/* Layer 1: Infrastruktur Pengendali Air */}
        <button
          onClick={() => setShowWaterInfra(!showWaterInfra)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
            showWaterInfra
              ? "bg-cyan-950 text-cyan-300 border border-cyan-800/80"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          {loadingLayer === "infra" ? (
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
          ) : (
            <Building2 className="w-3 h-3 text-cyan-400" />
          )}
          <span>Infrastruktur Air</span>
        </button>

        {/* Layer 2: Titik Rawan Banjir */}
        <button
          onClick={() => setShowFloodProne(!showFloodProne)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
            showFloodProne
              ? "bg-purple-950 text-purple-300 border border-purple-800/80"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          {loadingLayer === "rawan" ? (
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-purple-400" />
          )}
          <span>Titik Rawan (40)</span>
        </button>

        {/* Layer 3: Sekolah Posko Evakuasi */}
        <button
          onClick={() => setShowSchoolShelters(!showSchoolShelters)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
            showSchoolShelters
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          {loadingLayer === "sekolah" ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <GraduationCap className="w-3 h-3 text-emerald-400" />
          )}
          <span>Sekolah Evakuasi</span>
        </button>

        <button
          onClick={handleRecenter}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 flex items-center space-x-1 cursor-pointer"
          title="Fokus ke pusat Indramayu"
        >
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span>Indramayu</span>
        </button>
      </div>

      {/* Map Legend Floating Box */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-[10px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-300 mb-1">Legenda Spasial:</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-slate-300">Laporan Banjir Kritis</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300">Genangan Air Warga</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-slate-300">Posko Bencana Utama</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span className="text-slate-300">Infrastruktur Air / Bendung</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-slate-300">40 Titik Rawan Banjir</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white" />
          <span className="text-slate-300">Sekolah Posko Evakuasi</span>
        </div>
      </div>

      {/* Leaflet Container Element */}
      <div ref={mapContainerRef} data-lenis-prevent="true" className="w-full h-full z-0" />
    </div>
  );
}
