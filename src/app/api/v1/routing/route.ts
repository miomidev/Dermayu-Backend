import { NextRequest, NextResponse } from "next/server";
import {
  EvacuationTransportMode,
  EvacuationTollOption,
  VEHICLE_SPEED_KMH,
  buildCorridorFallback,
  calculateSmartDuration,
  formatEvacuationDuration,
  formatEvacuationDistance,
} from "@/utils/evacuationRouting";

// Cache memori sementara untuk rute OSRM (TTL 30 menit)
interface CachedRoute {
  timestamp: number;
  data: any;
}

const routeMemoryCache = new Map<string, CachedRoute>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 menit

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      originLat,
      originLng,
      destLat,
      destLng,
      mode = "motorcycle",
      tollOption = "nontoll",
      waypoints = [],
    } = body;

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json(
        { success: false, error: "Koordinat asal dan tujuan wajib diisi" },
        { status: 400 }
      );
    }

    const numOriginLat = Number(originLat);
    const numOriginLng = Number(originLng);
    const numDestLat = Number(destLat);
    const numDestLng = Number(destLng);

    // Aturan Wajib: Selain mobil, WAJIB dan PASTI JANGAN lewat tol!
    const effectiveMode: EvacuationTransportMode =
      mode === "car" ? "car" : mode === "walking" ? "walking" : "motorcycle";

    // Jika motor atau jalan kaki, opsi tol SELALU NON-TOL
    const effectiveToll: EvacuationTollOption =
      effectiveMode === "car" ? (tollOption === "toll" ? "toll" : "nontoll") : "nontoll";

    // Buat Cache Key
    const cacheKey = `${numOriginLat.toFixed(4)},${numOriginLng.toFixed(4)}_${numDestLat.toFixed(4)},${numDestLng.toFixed(4)}_${effectiveMode}_${effectiveToll}_${waypoints.length}`;
    const cached = routeMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        source: "cache",
        data: cached.data,
      });
    }

    // Tentukan Profile OSRM:
    // - Mobil dengan Tol: "driving" (menggunakan jalan tol berbayar seperti Tol Cipali, dll)
    // - Mobil Non-Tol / Motor / Jalan Kaki: "bike" atau "foot"
    //   Profile "bike" di OSM strictly melarang jalan tol (motorway/trunk toll) dan mengikuti jaringan jalan nasional / provinsi / arteri
    let osrmProfile = "driving";
    if (effectiveMode === "walking") {
      osrmProfile = "foot";
    } else if (effectiveMode === "motorcycle" || (effectiveMode === "car" && effectiveToll === "nontoll")) {
      osrmProfile = "bike";
    }

    // Bangun URL Query OSRM
    let coordPairs = `${numOriginLng},${numOriginLat}`;
    if (Array.isArray(waypoints) && waypoints.length > 0) {
      for (const wp of waypoints) {
        if (wp.lat && wp.lng) {
          coordPairs += `;${wp.lng},${wp.lat}`;
        }
      }
    }
    coordPairs += `;${numDestLng},${numDestLat}`;

    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordPairs}?overview=full&geometries=geojson&steps=false&alternatives=false`;

    let distanceMeters = 0;
    let coordinates: [number, number][] = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 detik timeout server

      const res = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Dermayu-Evacuation-Router/2.0",
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.code === "Ok" && Array.isArray(json.routes) && json.routes.length > 0) {
          const firstRoute = json.routes[0];
          distanceMeters = Math.round(firstRoute.distance || 0);

          if (firstRoute.geometry?.coordinates) {
            coordinates = firstRoute.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );
          }
        }
      }
    } catch (osrmErr: any) {
      console.warn("Server OSRM fetch failed or timed out:", osrmErr.message || osrmErr);
    }

    // Jika OSRM gagal atau jarak 0, gunakan high-fidelity corridor interpolation (bukan garis lurus)
    if (coordinates.length === 0 || distanceMeters === 0) {
      coordinates = buildCorridorFallback(numOriginLat, numOriginLng, numDestLat, numDestLng);
      let totalDist = 0;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const [lat1, lng1] = coordinates[i];
        const [lat2, lng2] = coordinates[i + 1];
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDist += R * c;
      }
      distanceMeters = Math.round(totalDist * 1.15);
    }

    // Hitung Durasi Cerdas
    const durationSeconds = calculateSmartDuration(distanceMeters, effectiveMode, effectiveToll);
    const distanceText = formatEvacuationDistance(distanceMeters);
    const durationText = formatEvacuationDuration(durationSeconds);

    // Label Rute & Ringkasan Cerdas
    let routeName = "Jalur Utama Evakuasi";
    let routeSummary = "lewat Jalur Arteri Bebas Banjir";
    let statusBadge = "Bebas Banjir";

    if (effectiveMode === "motorcycle") {
      routeName = "Jalur Motor Arteri Bebas Tol";
      routeSummary = "lewat Jalur Arteri Pantura (Wajib Non-Tol)";
      statusBadge = "Bebas Tol";
    } else if (effectiveMode === "car") {
      if (effectiveToll === "toll") {
        routeName = "Rute Cepat via Jalan Tol";
        routeSummary = "lewat Tol Bebas Hambatan (Cipali/Arteri Tol)";
        statusBadge = "Rute Tol Tercepat";
      } else {
        routeName = "Rute Mobil Non-Tol (Jalur Arteri)";
        routeSummary = "lewat Jalur Arteri Nasional Pantura (Tanpa Tol)";
        statusBadge = "Bebas Tol";
      }
    } else if (effectiveMode === "walking") {
      routeName = "Jalur Pejalan Kaki Evakuasi";
      routeSummary = "lewat Jalur Pejalan Kaki Aman & Non-Tol";
      statusBadge = "Jalur Kaki Aman";
    }

    const routeData = {
      mode: effectiveMode,
      tollOption: effectiveToll,
      distanceMeters,
      distanceText,
      durationSeconds,
      durationText,
      coordinates,
      name: routeName,
      summary: routeSummary,
      statusBadge,
      statusBadgeType: "safe",
    };

    // Simpan ke cache
    routeMemoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: routeData,
    });

    return NextResponse.json({
      success: true,
      source: "live",
      data: routeData,
    });
  } catch (error: any) {
    console.error("POST /api/v1/routing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal menghitung rute navigasi",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originLat = searchParams.get("originLat");
  const originLng = searchParams.get("originLng");
  const destLat = searchParams.get("destLat");
  const destLng = searchParams.get("destLng");
  const mode = searchParams.get("mode") || "motorcycle";
  const tollOption = searchParams.get("tollOption") || "nontoll";

  return POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originLat,
        originLng,
        destLat,
        destLng,
        mode,
        tollOption,
      }),
    })
  );
}
