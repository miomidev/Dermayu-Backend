"use client";

export function AuthBackgroundDecor({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* CSS Keyframes bawaan untuk animasi orbit, rotasi, dan pulse yang 100% konsisten & tidak terpengaruh parent lifecycle */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dermayuOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dermayuCounterOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes dermayuSpinSlow {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }
        @keyframes dermayuSpinRev {
          from { transform: rotate(45deg); }
          to { transform: rotate(-315deg); }
        }
        @keyframes dermayuPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.08); opacity: 0.45; }
        }
        @keyframes dermayuPulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.18); opacity: 0.2; }
        }
      `}} />

      {/* ============================================================ */}
      {/* 1. LINGKARAN POJOK ATAS DENGAN KOTAK ORBIT                   */}
      {/*    Menembus halus ke area status bar / notch atas ponsel      */}
      {/* ============================================================ */}
      {/* Ring Lingkaran Orbit Statis */}
      <div className="absolute -top-6 -left-8 sm:-top-10 sm:-left-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-white/25 opacity-40 pointer-events-none" />

      {/* Orbit Track yang Berputar Membawa Kotak Mengelilingi Lingkaran (2 Kotak Saling Berseberangan) */}
      <div
        style={{
          animation: "dermayuOrbit 18s linear infinite",
          willChange: "transform",
        }}
        className="absolute -top-6 -left-8 sm:-top-10 sm:-left-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full pointer-events-none"
      >
        {/* Kotak Satelit 1 (Posisi Atas / Jam 12) */}
        <div
          style={{
            animation: "dermayuCounterOrbit 10s linear infinite",
            willChange: "transform",
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-lg bg-white/20 border border-white/35 backdrop-blur-2xs shadow-xs"
        />

        {/* Kotak Satelit 2 (Posisi Bawah / Jam 6 - Berseberangan 180°) */}
        <div
          style={{
            animation: "dermayuCounterOrbit 10s linear infinite",
            willChange: "transform",
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-lg bg-white/20 border border-white/35 backdrop-blur-2xs shadow-xs"
        />
      </div>

      {/* ============================================================ */}
      {/* 2. DUA BELAH KETUPAT (MUTER PELAN DENGAN WAKTU BERBEDA)       */}
      {/* ============================================================ */}
      {/* Belah Ketupat 1 (Atas Kanan) - Putaran Searah Jarum Jam */}
      <div
        style={{
          animation: "dermayuSpinSlow 22s linear infinite",
          willChange: "transform",
        }}
        className="absolute top-1/4 right-10 w-16 h-16 sm:w-18 sm:h-18 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-2xs pointer-events-none shadow-xs"
      />

      {/* Belah Ketupat 2 (Bawah Kanan) - Putaran Berlawanan Jarum Jam */}
      <div
        style={{
          animation: "dermayuSpinRev 16s linear infinite",
          willChange: "transform",
        }}
        className="absolute bottom-1/3 right-1/4 w-12 h-12 sm:w-14 sm:h-14 border border-white/25 rounded-xl backdrop-blur-2xs pointer-events-none shadow-xs"
      />

      {/* ============================================================ */}
      {/* 3. BUNDAR POJOK BAWAH (ANIMASI KEMBANG KEMPIS / PULSE)        */}
      {/*    Diameter dikurangi dan pulse lebih halus agar proporsional */}
      {/* ============================================================ */}
      {/* Ring Bundar Pojok Kanan Bawah */}
      <div
        style={{
          animation: "dermayuPulseRing 5s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
        className="absolute -bottom-12 -right-12 sm:-bottom-14 sm:-right-14 w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/25 pointer-events-none"
      />

      {/* Ambient Glow Lingkaran Lembut di Kiri Bawah (Kembang Kempis Halus) */}
      <div
        style={{
          animation: "dermayuPulseGlow 6s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
        className="absolute bottom-12 left-8 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/15 blur-xl pointer-events-none"
      />
    </div>
  );
}
