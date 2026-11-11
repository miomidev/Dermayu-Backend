/**
 * Utilitas Navigasi & Rute Cerdas Evakuasi Bencana DERMAYU
 * Mendukung perhitungan rute jalan aktual (OSRM), moda kendaraan (Motor, Mobil, Jalan Kaki),
 * dan opsi jalan tol vs non-tol secara ketat.
 */

export type EvacuationTransportMode = "motorcycle" | "car" | "walking";
export type EvacuationTollOption = "toll" | "nontoll";

// Kecepatan rata-rata realistis wilayah Jawa Barat & Indramayu (km/h)
// Dikalibrasi berdasarkan kondisi lalu lintas riil Google Maps (lampu merah, kepadatan Pantura, dan akses tol)
export const VEHICLE_SPEED_KMH = {
  carToll: 48.5,     // Tol Cipali, Cisumdawu, Jagorawi (termasuk akses gerbang tol & antrean)
  carNonToll: 31.5,  // Arteri Nasional Pantura / Provinsi (memperhitungkan lampu merah, pasar tumpah, kepadatan)
  motorcycle: 36.5,  // Sepeda Motor di jalan arteri Pantura / pedesaan (lebih lincah selap-selip saat macet)
  walking: 4.0,      // Pejalan kaki evakuasi
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
 * Titik Waypoint Jalur Arteri Nasional Pantura (Non-Tol)
 * Wajib dilewati untuk moda Motor dan Mobil Tanpa Tol
 * agar OSRM secara konsisten memplot rute mengikuti Jalan Arteri Nasional Pantura,
 * bukan jalan Tol Cipali / Jagorawi.
 */
export function getNonTollCorridorWaypoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): { lat: number; lng: number }[] {
  const waypoints: { lat: number; lng: number }[] = [];

  // 1. Perjalanan dari Arah Barat (Jabodetabek / Bogor / Bekasi / Karawang) menuju Indramayu
  if (startLng < 107.5 && endLng >= 107.8) {
    // Simpang Jomin Cikampek: Titik persimpangan utama non-tol Pantura
    waypoints.push({ lat: -6.394, lng: 107.458 });
    // Pamanukan Subang: Pusat jalur arteri Pantura Subang
    waypoints.push({ lat: -6.280, lng: 107.810 });
    // Patrol Indramayu: Pintu masuk arteri Pantura barat Indramayu
    if (endLng >= 108.0) {
      waypoints.push({ lat: -6.305, lng: 108.005 });
    }
    // Lohbener Indramayu: Persimpangan jalan nasional menuju Kota Indramayu / Jatibarang / Sliyeg
    if (endLng >= 108.2 && endLat > -6.55) {
      waypoints.push({ lat: -6.402, lng: 108.270 });
    }
  }
  // 2. Perjalanan dari Arah Selatan (Bandung / Sumedang) menuju Indramayu
  else if (startLat < -6.75 && startLng >= 107.4 && startLng <= 108.3 && endLat >= -6.6) {
    // Jalur Arteri Nasional Non-Tol Tomo / Kadipaten
    waypoints.push({ lat: -6.805, lng: 108.165 });
    // Jatibarang Indramayu
    waypoints.push({ lat: -6.530, lng: 108.315 });
  }
  // 3. Perjalanan dari Arah Timur (Cirebon / Jawa Tengah) menuju Indramayu
  else if (startLng > 108.5 && endLng <= 108.45) {
    // Jalur Arteri Kapetakan Pantura Cirebon
    waypoints.push({ lat: -6.535, lng: 108.520 });
    // Karangampel Indramayu
    waypoints.push({ lat: -6.450, lng: 108.430 });
  }

  return waypoints;
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

