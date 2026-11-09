import { NextRequest, NextResponse } from "next/server";

export interface WeatherResponseData {
  kondisiSekarang: string;
  ikonCuaca: string;
  suhu: number;
  suhuMax?: number;
  suhuMin?: number;
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
  hourly?: Array<{
    time: string;
    temp: number;
    weatherCode: number;
    pop?: number;
  }>;
  daily?: Array<{
    day: string;
    kondisi: string;
    weatherCode: number;
    pop: number;
    tempMin: number;
    tempMax: number;
  }>;
  metrics?: {
    curahHujan: { value: string; pop: string; note: string };
    angin: { speed: string; direction: string; note: string };
    kelembaban: { value: string; note: string };
    uvIndex: { value: number; label: string; note: string };
    kualitasUdara?: { aqi: number; label: string; note: string };
    matahari?: { terbit: string; terbenam: string };
  };
  peringatanHujan?: {
    judul: string;
    deskripsi: string;
    level: "warning" | "info" | "safe";
  } | null;
  lokasi: string;
  sumber: string;
  lastUpdated: string;
}

function mapWeatherCode(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: "Cerah", icon: "sun" };
    case 1:
      return { text: "Sebagian Cerah", icon: "cloud-sun" };
    case 2:
      return { text: "Cerah Berawan", icon: "cloud-sun" };
    case 3:
      return { text: "Berawan Tebal", icon: "cloud" };
    case 45:
    case 48:
      return { text: "Berkabut", icon: "cloud" };
    case 51:
    case 53:
    case 55:
      return { text: "Gerimis", icon: "cloud-drizzle" };
    case 61:
      return { text: "Hujan Ringan", icon: "cloud-rain" };
    case 63:
      return { text: "Hujan Sedang", icon: "cloud-rain" };
    case 65:
      return { text: "Hujan Lebat", icon: "cloud-rain" };
    case 80:
    case 81:
    case 82:
      return { text: "Hujan Deras Mendadak", icon: "cloud-rain" };
    case 95:
    case 96:
    case 99:
      return { text: "Hujan Disertai Petir", icon: "cloud-lightning" };
    default:
      return { text: "Cerah Berawan", icon: "cloud-sun" };
  }
}

// Fallback realistis wilayah Indramayu jika Open-Meteo offline atau tidak dapat diakses
function getRealisticFallbackData(): WeatherResponseData {
  const now = new Date();
  const hour = now.getHours();
  // Simulasi siang/sore atau malam
  const isNight = hour >= 18 || hour < 6;
  const temp = isNight ? 27.2 : 28.5;
  const simulatedCode = 2; // Cerah Berawan
  const { text, icon } = mapWeatherCode(simulatedCode);
  const avgRain = 1.4;

  const currentHour = now.getHours();
  const hourly24 = Array.from({ length: 16 }).map((_, i) => {
    const h = (currentHour + i) % 24;
    const timeLabel = i === 0 ? "Sekarang" : `${String(h).padStart(2, "0")}:00`;
    const isDay = h >= 6 && h < 18;
    const itemTemp = isDay ? 30 + Math.sin((h - 6) / 12 * Math.PI) * 5 : 26 + Math.cos((h - 18) / 12 * Math.PI) * 2;
    const code = i === 0 ? 2 : (i % 4 === 0 ? 61 : i % 3 === 0 ? 3 : 2);
    const pop = code === 61 ? 85 : code === 3 ? 50 : 20;

    return {
      time: timeLabel,
      temp: Math.round(itemTemp),
      weatherCode: code,
      pop,
    };
  });

  return {
    kondisiSekarang: text,
    ikonCuaca: icon,
    suhu: temp,
    suhuMax: 35,
    suhuMin: 25,
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
    hourly: hourly24,
    daily: [
      { day: "Hari ini", kondisi: "Berawan", weatherCode: 2, pop: 100, tempMin: 25, tempMax: 36 },
      { day: "Besok", kondisi: "Gerimis", weatherCode: 51, pop: 100, tempMin: 25, tempMax: 35 },
      { day: "Lusa", kondisi: "Gerimis", weatherCode: 51, pop: 55, tempMin: 26, tempMax: 34 },
      { day: "Rabu", kondisi: "Gerimis", weatherCode: 53, pop: 70, tempMin: 26, tempMax: 35 },
      { day: "Kamis", kondisi: "Gerimis", weatherCode: 51, pop: 81, tempMin: 26, tempMax: 35 },
      { day: "Jumat", kondisi: "Hujan Ringan", weatherCode: 61, pop: 100, tempMin: 26, tempMax: 34 },
      { day: "Sabtu", kondisi: "Gerimis", weatherCode: 51, pop: 100, tempMin: 26, tempMax: 34 },
    ],
    metrics: {
      curahHujan: {
        value: "4,6 mm",
        pop: "100%",
        note: "Hujan ringan, tidak ada dampak signifikan ke debit DAS Cimanuk",
      },
      angin: {
        speed: "7,5 km/h",
        direction: "Barat Daya (SW)",
        note: "Kecepatan stabil, cocok dan aman untuk aktivitas melaut",
      },
      kelembaban: {
        value: "76%",
        note: "Lebih lembap dari biasanya (titik embun 24°C)",
      },
      uvIndex: {
        value: 2,
        label: "Terlemah",
        note: "Tidak perlu perlindungan khusus saat beraktivitas luar",
      },
      kualitasUdara: {
        aqi: 147,
        label: "Polusi Ringan",
        note: "Kelompok sensitif disarankan membatasi aktivitas fisik intens",
      },
      matahari: {
        terbit: "05.19 WIB",
        terbenam: "17.41 WIB",
      },
    },
    peringatanHujan: {
      judul: "Kemungkinan Hujan Sangat Tinggi",
      deskripsi:
        "Kemungkinan hujan dalam satu jam ke depan adalah 100%. Bersiaplah untuk hujan dan rencanakan perjalanan Anda berdasarkan kondisi aktual.",
      level: "warning",
    },
    lokasi: "Kabupaten Indramayu",
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

