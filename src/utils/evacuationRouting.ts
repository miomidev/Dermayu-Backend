/**
 * Utilitas Navigasi & Rute Cerdas Evakuasi Bencana DERMAYU
 * Mendukung perhitungan rute jalan aktual (OSRM), moda kendaraan (Motor, Mobil, Jalan Kaki),
 * dan opsi jalan tol vs non-tol secara ketat.
 */

export type EvacuationTransportMode = "motorcycle" | "car" | "walking";
export type EvacuationTollOption = "toll" | "nontoll";

// Kecepatan rata-rata realistis wilayah Jawa Barat & Indramayu (km/h)
export const VEHICLE_SPEED_KMH = {
  carToll: 75,       // Tol Cipali, Cisumdawu, Jagorawi
  carNonToll: 45,    // Arteri Nasional Pantura / Provinsi
  motorcycle: 40,    // Sepeda Motor di jalan arteri Pantura / pedesaan
  walking: 4.8,      // Pejalan kaki
};

// Koridor Jalan Utama Penghubung Jawa Barat (Arteri Non-Tol & Pantura)
// Digunakan sebagai jalur cerdas cadangan jika jaringan OSRM offline/timeout
export const WEST_JAVA_CORRIDOR_WAYPOINTS: [number, number][] = [
  [-6.595, 106.790], // Bogor Kota (Baranangsiang)
  [-6.482, 106.840], // Cibinong
  [-6.398, 106.832], // Depok Margonda
  [-6.238, 106.975], // Bekasi Barat
  [-6.255, 107.050], // Tambun / Cikarang
  [-6.305, 107.301], // Karawang Timur (Arteri Pantura)
  [-6.320, 107.410], // Klari / Kosambi
  [-6.342, 107.545], // Cikampek / Jatisari
  [-6.350, 107.640], // Sukamandi Pantura
  [-6.355, 107.755], // Pamanukan (Subang Pantura)
  [-6.495, 107.965], // Haurgeulis (Indramayu Barat)
  [-6.398, 108.012], // Anjatan
  [-6.345, 108.120], // Kandanghaur / Eretan
  [-6.385, 108.195], // Losarang
  [-6.435, 108.280], // Lohbener
  [-6.326, 108.322], // Indramayu Kota
  [-6.360, 108.375], // Balongan
  [-6.450, 108.430], // Karangampel
  [-6.505, 108.485], // Cirebon
];

/**
 * Mencari titik koridor terdekat dari koordinat yang diberikan
 */
export function findNearestCorridorIndex(lat: number, lng: number): number {
  let closestIdx = 0;
  let minDist = Infinity;
  for (let i = 0; i < WEST_JAVA_CORRIDOR_WAYPOINTS.length; i++) {
    const [cLat, cLng] = WEST_JAVA_CORRIDOR_WAYPOINTS[i];
    const d = Math.hypot(lat - cLat, lng - cLng);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }
  return closestIdx;
}

/**
 * Membangun polyline cadangan mengikuti koridor jalan raya Jawa Barat
 * Menghindari garis lurus melintasi pegunungan saat router offline
 */
export function buildCorridorFallback(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): [number, number][] {
  const startIdx = findNearestCorridorIndex(startLat, startLng);
  const endIdx = findNearestCorridorIndex(endLat, endLng);

  const coords: [number, number][] = [[startLat, startLng]];

  if (startIdx < endIdx) {
    for (let i = startIdx; i <= endIdx; i++) {
      coords.push(WEST_JAVA_CORRIDOR_WAYPOINTS[i]);
    }
  } else if (startIdx > endIdx) {
    for (let i = startIdx; i >= endIdx; i--) {
      coords.push(WEST_JAVA_CORRIDOR_WAYPOINTS[i]);
    }
  } else {
    coords.push([(startLat + endLat) / 2, (startLng + endLng) / 2]);
  }

  coords.push([endLat, endLng]);
  return coords;
}

/**
 * Menghitung durasi perjalanan realistis berdasarkan moda & opsi tol
 */
export function calculateSmartDuration(
  distanceMeters: number,
  mode: EvacuationTransportMode,
  tollOption: EvacuationTollOption = "nontoll"
): number {
  let speedKmh = VEHICLE_SPEED_KMH.motorcycle;
  if (mode === "car") {
    speedKmh = tollOption === "toll" ? VEHICLE_SPEED_KMH.carToll : VEHICLE_SPEED_KMH.carNonToll;
  } else if (mode === "walking") {
    speedKmh = VEHICLE_SPEED_KMH.walking;
  } else {
    speedKmh = VEHICLE_SPEED_KMH.motorcycle;
  }

  const speedMps = (speedKmh * 1000) / 3600;
  return Math.max(60, Math.round(distanceMeters / speedMps));
}

/**
 * Format teks durasi navigasi (e.g. "1j 15m" atau "12 menit")
 */
export function formatEvacuationDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}j ${m}m`;
  }
  return `${Math.max(1, m)} menit`;
}

/**
 * Format teks jarak navigasi (e.g. "132.6 km" atau "450 m")
 */
export function formatEvacuationDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

