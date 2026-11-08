"use client";

import React, { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, X, Building2 } from "lucide-react";

interface ShelterBentoGalleryProps {
  photos?: string[];
  name?: string;
  onPhotoClick?: (index: number) => void;
  className?: string;
  enableInternalLightbox?: boolean;
  compact?: boolean; // Proporsional untuk Side Drawer & Popup di Peta
}

export const ShelterBentoGallery: React.FC<ShelterBentoGalleryProps> = ({
  photos,
  name = "Posko Evakuasi",
  onPhotoClick,
  className = "",
  enableInternalLightbox = true,
  compact = false,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Bersihkan dan normalisasi list foto dari database riil
  const displayPhotos = Array.isArray(photos) && photos.length > 0
    ? photos.filter((p) => Boolean(p) && typeof p === "string" && !p.includes("default.jpg"))
    : [];

  const handleItemClick = (idx: number) => {
    if (onPhotoClick) {
      onPhotoClick(idx);
    } else if (enableInternalLightbox) {
      setLightboxIndex(idx);
    }
  };

  // Kelas tinggi proporsional: lebih hemat ruang jika compact (Drawer/Popup Peta)
  const singleHeightCls = compact ? "h-36 sm:h-44" : "h-48 sm:h-56 md:h-64";
  const doubleHeightCls = compact ? "h-36 sm:h-44" : "h-48 sm:h-56 md:h-64";
  const bentoHeightCls = compact ? "h-40 sm:h-48" : "h-48 sm:h-60 md:h-72";

  if (displayPhotos.length === 0) {
    return (
      <div
        className={`w-full ${singleHeightCls} rounded-xl sm:rounded-2xl border border-dashed border-gray-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 ${className}`}
      >
        <Building2 className="w-8 h-8 text-slate-300 mb-1" />
        <span className="text-xs font-semibold text-slate-500">{name}</span>
        <span className="text-[10px] text-slate-400">Belum ada dokumentasi visual</span>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full select-none ${className}`}>
        {/* KASUS 1: HANYA 1 FOTO RIIL */}
        {displayPhotos.length === 1 && (
          <div
            onClick={() => handleItemClick(0)}
            className={`w-full ${singleHeightCls} rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs`}
            title="Klik untuk memperbesar foto"
          >
            <img
              src={displayPhotos[0]}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="p-2 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                <Eye className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {/* KASUS 2: 2 FOTO RIIL (GRID 2 KOLOM RATA) */}
        {displayPhotos.length === 2 && (
          <div className={`grid grid-cols-2 gap-2 sm:gap-2.5 ${doubleHeightCls} w-full`}>
            <div
              onClick={() => handleItemClick(0)}
              className="h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs"
              title="Foto 1"
            >
              <img
                src={displayPhotos[0]}
                alt={`${name} 1`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            <div
              onClick={() => handleItemClick(1)}
              className="h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] cursor-pointer group relative shadow-2xs"
              title="Foto 2"
            >
              <img
                src={displayPhotos[1]}
                alt={`${name} 2`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* KASUS 3: >= 3 FOTO RIIL (BENTO GRID MODEREN: KIRI UTAMA BESAR, KANAN 2 FOTO BERTUMPUK) */}
        {displayPhotos.length >= 3 && (
          <div className={`grid grid-cols-3 gap-2 sm:gap-2.5 ${bentoHeightCls} w-full`}>
            {/* Foto Utama Sisi Kiri (Lebar 2 Kolom) */}
            <div
              onClick={() => handleItemClick(0)}
              className="col-span-2 h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs"
              title="Foto Utama"
            >
              <img
                src={displayPhotos[0]}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs text-[9px] font-bold text-white tracking-wide">
                Utama
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-1.5 sm:p-2 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Sisi Kanan: 2 Foto Ditumpuk Vertikal */}
            <div className="col-span-1 grid grid-rows-2 gap-2 sm:gap-2.5 h-full w-full min-h-0">
              {/* Foto 2 (Kanan Atas) */}
              <div
                onClick={() => handleItemClick(1)}
                className="h-full w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs min-h-0"
                title="Foto 2"
              >
                <img
                  src={displayPhotos[1]}
                  alt={`${name} 2`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="p-1 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                    <Eye className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Foto 3 (Kanan Bawah) + Overlay +N jika foto > 3 */}
              <div
                onClick={() => handleItemClick(2)}
                className="h-full w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-[#D5E4E0] relative group cursor-pointer shadow-2xs min-h-0"
                title="Foto 3"
              >
                <img
                  src={displayPhotos[2]}
                  alt={`${name} 3`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {displayPhotos.length > 3 ? (
                  <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-2xs flex flex-col items-center justify-center transition-colors group-hover:bg-slate-950/75 text-white">
                    <span className="text-base sm:text-xl font-black tracking-wider leading-none">
                      +{displayPhotos.length - 3}
                    </span>
                    <span className="text-[9px] font-bold text-slate-200 mt-0.5 uppercase tracking-wider">
                      Foto
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-1 rounded-full bg-slate-900/75 text-white backdrop-blur-2xs shadow-md">
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL LIGHTBOX VIEWER BAWAAN JIKA TIDAK DITANGANI PARENT */}
      {enableInternalLightbox && !onPhotoClick && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
        >
          {/* Header Lightbox */}
          <div
            className="w-full max-w-4xl flex items-center justify-between pb-3 text-white border-b border-white/10 mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-md">{name}</h4>
              <p className="text-xs text-slate-400">
                Foto {lightboxIndex + 1} dari {displayPhotos.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Stage Image */}
          <div
            className="relative flex items-center justify-center max-w-4xl max-h-[75vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayPhotos[lightboxIndex]}
              alt={`${name} - Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {displayPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : displayPhotos.length - 1
                    );
                  }}
                  className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev !== null && prev < displayPhotos.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition cursor-pointer shadow-lg border border-white/20"
                  title="Foto Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {displayPhotos.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-4xl pt-4 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {displayPhotos.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    lightboxIndex === idx
                      ? "border-emerald-400 ring-2 ring-emerald-400/30 scale-105"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShelterBentoGallery;
