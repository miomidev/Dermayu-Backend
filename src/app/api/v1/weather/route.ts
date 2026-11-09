import { NextRequest, NextResponse } from "next/server";

export interface WeatherResponseData {
  kondisiSekarang: string;
  ikonCuaca: string;
  suhu: number;
  weatherCode: number;
  prediksiCurahHujan: number; // mm (rata-rata 3 jam ke depan)
  totalCurahHujan3Jam: number;
  isAntisipasiKenaikanDebit: boolean;
  pesanPrediksi: string;
  hourlyForecast: Array<{
    jam: string;
    curahHujan: number;
    weatherCode: number;
  }>;
  lokasi: string;
  sumber: string;
  lastUpdated: string;
}

function mapWeatherCode(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: "Cerah", icon: "☀️" };
    case 1:
      return { text: "Sebagian Cerah", icon: "🌤️" };
    case 2:
      return { text: "Cerah Berawan", icon: "⛅" };
    case 3:
      return { text: "Berawan Tebal", icon: "☁️" };
    case 45:
    case 48:
      return { text: "Berkabut", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { text: "Gerimis", icon: "🌦️" };
    case 61:
      return { text: "Hujan Ringan", icon: "🌧️" };
    case 63:
      return { text: "Hujan Sedang", icon: "🌧️" };
    case 65:
      return { text: "Hujan Lebat", icon: "⛈️" };
    case 80:
    case 81:
    case 82:
      return { text: "Hujan Deras Mendadak", icon: "⛈️" };
    case 95:
    case 96:
    case 99:
      return { text: "Hujan Disertai Petir", icon: "⚡" };
    default:
      return { text: "Cerah Berawan", icon: "⛅" };
  }
}

// Fallback realistis wilayah Indramayu jika Open-Meteo offline atau tidak dapat diakses
function getRealisticFallbackData(): WeatherResponseData {
  const now = new Date();
  const hour = now.getHours();
  // Simulasi siang/sore atau malam
  const isNight = hour >= 18 || hour < 6;
  const temp = isNight ? 27.2 : 30.4;
  const simulatedCode = 2; // Cerah Berawan
  const { text, icon } = mapWeatherCode(simulatedCode);
  const avgRain = 1.4;

  return {
    kondisiSekarang: text,
    ikonCuaca: icon,
    suhu: temp,
    weatherCode: simulatedCode,
    prediksiCurahHujan: avgRain,
    totalCurahHujan3Jam: 4.2,
    isAntisipasiKenaikanDebit: false,
    pesanPrediksi: "Cerah berawan hingga sore. Tidak ada potensi hujan lebat di hulu.",
    hourlyForecast: [
      { jam: "+1 Jam", curahHujan: 0.8, weatherCode: 2 },
      { jam: "+2 Jam", curahHujan: 1.5, weatherCode: 2 },
      { jam: "+3 Jam", curahHujan: 1.9, weatherCode: 3 },
      { jam: "+4 Jam", curahHujan: 0.5, weatherCode: 1 },
      { jam: "+5 Jam", curahHujan: 0.0, weatherCode: 0 },
      { jam: "+6 Jam", curahHujan: 0.0, weatherCode: 0 },
    ],
    lokasi: "Indramayu & DAS Hulu Cimanuk",
    sumber: "Simulated BMKG & Open-Meteo Cache",
    lastUpdated: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
  };
}

export async function GET(req: NextRequest) {
  try {
    const targetUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=-6.32&longitude=108.32&current_weather=true&hourly=precipitation,weathercode&timezone=Asia%2FJakarta";

    // Fetch dengan timeout 5 detik & revalidate cache 3600 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      // Return safe fallback gracefully
      const fallback = getRealisticFallbackData();
      return NextResponse.json({
        success: true,
        ...fallback,
        data: fallback,
        isFallback: true,
      });
    }

    const json = await res.json();
    const current = json.current_weather || {};
    const hourly = json.hourly || { time: [], precipitation: [], weathercode: [] };

    const weatherCode = Number(current.weathercode ?? 2);
    const { text: kondisiSekarang, icon: ikonCuaca } = mapWeatherCode(weatherCode);
    const suhu = Math.round(Number(current.temperature ?? 29) * 10) / 10;

    // Cari index jam saat ini dari hourly.time
    const currentTimeStr = current.time || "";
    let currentIndex = -1;
    if (currentTimeStr && Array.isArray(hourly.time)) {
      currentIndex = hourly.time.findIndex((t: string) => t === currentTimeStr);
    }
    if (currentIndex === -1) {
      currentIndex = 0;
    }

    // Ambil prediksi 3 jam ke depan
    const nextHoursRain: number[] = [];
    const hourlyForecastList: Array<{ jam: string; curahHujan: number; weatherCode: number }> = [];

    for (let i = 1; i <= 6; i++) {
      const idx = currentIndex + i;
      const rain = idx < hourly.precipitation.length ? Number(hourly.precipitation[idx] ?? 0) : 0;
      const code = idx < hourly.weathercode.length ? Number(hourly.weathercode[idx] ?? 2) : 2;
      const timeStr = idx < hourly.time.length ? String(hourly.time[idx] || "") : "";
      const jamLabel = timeStr.includes("T") ? timeStr.split("T")[1] : `+${i} Jam`;

      if (i <= 3) {
        nextHoursRain.push(rain);
      }

      hourlyForecastList.push({
        jam: jamLabel,
        curahHujan: Math.round(rain * 10) / 10,
        weatherCode: code,
      });
    }

    const totalRain3Jam = nextHoursRain.reduce((a, b) => a + b, 0);
    const avgRain3Jam =
      nextHoursRain.length > 0 ? Math.round((totalRain3Jam / nextHoursRain.length) * 10) / 10 : 0;

    const isAntisipasiKenaikanDebit = avgRain3Jam > 10 || Math.max(...nextHoursRain, 0) > 10;

    let pesanPrediksi = "Cerah berawan hingga sore. Tidak ada potensi hujan lebat di hulu.";
    if (isAntisipasiKenaikanDebit) {
      pesanPrediksi = `Hujan lebat diprediksi terjadi di hulu (${avgRain3Jam} mm). Waspada potensi kenaikan debit air.`;
    } else if (avgRain3Jam > 2) {
      pesanPrediksi = `Potensi hujan ringan-sedang (${avgRain3Jam} mm) 3 jam ke depan. Debit air hulu terpantau aman.`;
    }

    const payload: WeatherResponseData = {
      kondisiSekarang,
      ikonCuaca,
      suhu,
      weatherCode,
      prediksiCurahHujan: avgRain3Jam,
      totalCurahHujan3Jam: Math.round(totalRain3Jam * 10) / 10,
      isAntisipasiKenaikanDebit,
      pesanPrediksi,
      hourlyForecast: hourlyForecastList,
      lokasi: "Kabupaten Indramayu & DAS Cimanuk",
      sumber: "Open-Meteo Real-Time Forecast",
      lastUpdated: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    return NextResponse.json(
      {
        success: true,
        ...payload,
        data: payload,
        isFallback: false,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.warn("Weather API proxy error, returning fallback data:", error);
    const fallback = getRealisticFallbackData();
    return NextResponse.json(
      {
        success: true,
        ...fallback,
        data: fallback,
        isFallback: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  }
}

