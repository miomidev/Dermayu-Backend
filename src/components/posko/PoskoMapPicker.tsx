"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";

interface PoskoMapPickerProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  poskoName?: string;
}

export default function PoskoMapPicker({
  lat,
  lng,
  onChange,
  poskoName = "Lokasi Posko Baru",
}: PoskoMapPickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [basemap, setBasemap] = useState<"osm" | "satellite">("osm");
  const [locating, setLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);

  // Inisialisasi Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Matikan zoomControl bawaan Leaflet karena kita pakai FAB custom di sisi kanan
    const map = L.map(mapContainerRef.current, {
      center: [lat || -6.356, lng || 108.138],
      zoom: 14,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    });

    // Default Tile Layer: OpenStreetMap
    const initialTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    // Custom Icon Pin Hijau Dermayu
    const createPinIcon = () => {
      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <span class="absolute -top-1 w-8 h-8 rounded-full bg-[#38746D]/30 animate-ping pointer-events-none"></span>
          <div class="w-8 h-8 rounded-full bg-[#38746D] border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.493 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#38746D] -mt-[1px]"></div>
        </div>
      `;

      return L.divIcon({
        html,
        className: "posko-picker-pin",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });
    };

    // Buat Marker yang Draggable
    const marker = L.marker([lat || -6.356, lng || 108.138], {
      draggable: true,
      icon: createPinIcon(),
      title: "Geser pin ini untuk menentukan lokasi posko",
    }).addTo(map);

    marker.bindPopup(`<strong>${poskoName}</strong><br/><span class="text-xs text-gray-500">Geser atau klik peta untuk ubah titik</span>`);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChange({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) });
    });

    // Event Klik pada Peta untuk memindahkan Marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update posisi marker jika lat/lng berubah dari luar (misal dropdown kecamatan)
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - lat) > 0.0001 ||
        Math.abs(currentPos.lng - lng) > 0.0001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Listener Fullscreen Event Browser
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // 1. Reset Kompas / Arah Utara
  const handleResetCompass = () => {
    setCompassHeading(0);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14);
    }
  };

  // 2. Lokasi Saya Saat Ini (GPS Geolocation)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
          mapInstanceRef.current.flyTo([userLat, userLng], 16);
          onChange({ lat: userLat, lng: userLng });
        }
      },
      (err) => {
        setLocating(false);
        alert("Gagal membaca lokasi GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 3. Pusatkan Peta ke Titik Posko Saat Ini (Marker Pin)
  const handleRecenterPin = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16);
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  // 4. Beralih Antara Peta Standar OSM & Citra Satelit Esri
  const handleToggleBasemap = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextBasemap = basemap === "osm" ? "satellite" : "osm";
    setBasemap(nextBasemap);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(
      nextBasemap === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          nextBasemap === "satellite"
            ? "Tiles &copy; Esri World Imagery | BPBD Indramayu"
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = newTile;
  };

  // 5. Perbesar Layar Penuh (Fullscreen Toggle)
  const handleToggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    try {
      if (!document.fullscreenElement) {
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen();
        } else if ((wrapper as any).webkitRequestFullscreen) {
          await (wrapper as any).webkitRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  // 6. Kontrol Zoom In & Zoom Out
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-slate-100 transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen rounded-none"
          : "rounded-3xl border border-[#D5E4E0] shadow-xs"
      }`}
    >
      {/* Container Leaflet */}
      <div
        ref={mapContainerRef}
        className={`w-full z-10 ${
          isFullscreen ? "h-screen" : "h-[360px] sm:h-[420px]"
        }`}
      />

      {/* Floating Info Coordinate Overlay (Kiri Atas) */}
      <div className="absolute top-3.5 left-3.5 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-2xl border border-[#D5E4E0] shadow-md flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#EEF5F3] text-[#38746D] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="text-left text-xs pr-2">
          <p className="font-bold text-[#132422]">Titik Koordinat Presisi</p>
          <p className="font-mono text-[11px] text-[#38746D]">
            Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
          </p>
        </div>
      </div>

      {/* FLOATING ACTION BUTTONS (Sisi Kanan Peta - Seragam dengan Peta Warga) */}
      <div className="absolute right-3.5 top-3.5 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Tombol 1: Kompas Orientasi Utara */}
        <button
          type="button"
          onClick={handleResetCompass}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer"
          title="Reset Arah Utara (0°)"
          aria-label="Reset Arah Utara"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 transition-transform duration-300"
            style={{ transform: `rotate(-${compassHeading}deg)` }}
            fill="none"
            aria-hidden="true"
          >
            {/* Jarum Utara (Merah) */}
            <path d="M12 3 L15.5 12 L12 10.5 L8.5 12 Z" fill="#EF4444" />
            {/* Jarum Selatan (Slate) */}
            <path d="M12 21 L15.5 12 L12 13.5 L8.5 12 Z" fill="#94A3B8" />
            {/* Titik Poros Tengah */}
            <circle cx="12" cy="12" r="1.5" fill="#1E293B" />
          </svg>
        </button>

        {/* Tombol 2: Lokasi Saya Saat Ini (GPS Geolocation) */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer"
          title="Gunakan Lokasi GPS Saya Saat Ini"
          aria-label="Lokasi GPS Saat Ini"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 text-[#38746D] animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5 text-[#38746D]" />
          )}
        </button>

        {/* Tombol 3: Pusatkan Peta ke Posko / Pin Marker */}
        <button
          type="button"
          onClick={handleRecenterPin}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
          title="Pusatkan Peta ke Titik Pin Posko"
          aria-label="Pusatkan Peta ke Titik Pin"
        >
          <MapPin className="w-5 h-5 text-[#38746D]" />
        </button>

        {/* Tombol 4: Beralih ke Citra Satelit (Basemap Toggle OSM <-> Satelit Esri) */}
        <button
          type="button"
          onClick={handleToggleBasemap}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg border transition-transform active:scale-95 flex items-center justify-center cursor-pointer ${
            basemap === "satellite"
              ? "bg-[#38746D] text-white border-[#24544E]"
              : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
          }`}
          title={
            basemap === "satellite"
              ? "Beralih ke Peta Jalan OSM"
              : "Beralih ke Citra Satelit Esri"
          }
          aria-label="Ganti Tampilan Peta"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Tombol 5: Perbesar / Perkecil Layar Penuh (Fullscreen) */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50 cursor-pointer text-[#1D443F]"
          title={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
          aria-label={isFullscreen ? "Kecilkan Peta" : "Perbesar Layar Penuh"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-[#38746D]" />
          ) : (
            <Maximize2 className="w-5 h-5 text-[#38746D]" />
          )}
        </button>

        {/* Tombol 6: Kontrol Zoom In & Zoom Out Vertikal Capsule */}
        <div className="w-10 sm:w-11 bg-white rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center divide-y divide-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-full h-9 sm:h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            title="Perbesar Peta (Zoom In)"
            aria-label="Perbesar Peta"
          >
            <Plus className="w-4 h-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-full h-9 sm:h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            title="Perkecil Peta (Zoom Out)"
            aria-label="Perkecil Peta"
          >
            <Minus className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Petunjuk Interaksi di Kiri Bawah */}
      <div className="absolute bottom-3 left-3 z-20">
        <span className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-600 shadow-xs">
          💡 Klik pada peta atau drag pin untuk menentukan titik koordinat
        </span>
      </div>
    </div>
  );
}
