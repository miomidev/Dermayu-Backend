export interface NavRoute {
  href: string;
  label: string;
}

export const ROUTES: NavRoute[] = [
  { href: "/", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#fitur-fitur", label: "Fitur-fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#faq", label: "FAQ" },
];

export interface TmaStation {
  id: string;
  badge: string;
  name: string;
  river: string;
  location: string;
  currentTma: number; // cm
  normalTma: number;
  siaga3Tma: number;
  siaga2Tma: number;
  siaga1Tma: number;
  debit: number; // m3/detik
  status: "Normal" | "Waspada (Siaga 3)" | "Kritis (Siaga 2)" | "Bahaya (Siaga 1)";
  trend: "Stabil" | "Meningkat" | "Menurun";
  lastUpdated: string;
  notes: string;
}

export const SAMPLE_TMA_STATIONS: TmaStation[] = [
  {
    id: "rentang",
    badge: "Pos Hulu Utama · Bendung Rentang",
    name: "Bendung Rentang Jatibarang",
    river: "Sungai Cimanuk (Hulu)",
    location: "Kecamatan Jatibarang / Perbatasan Majalengka",
    currentTma: 485,
    normalTma: 350,
    siaga3Tma: 420,
    siaga2Tma: 500,
    siaga1Tma: 600,
    debit: 412,
    status: "Waspada (Siaga 3)",
    trend: "Meningkat",
    lastUpdated: "10 menit yang lalu",
    notes: "Debit kiriman dari hulu Sumedang terpantau meningkat. Pintu air primer dibuka bertahap ke saluran Sindupraja dan Cipelang.",
  },
  {
    id: "sindang",
    badge: "Pos Tengah · Cimanuk Lama",
    name: "Pintu Air Bangkir & Sindang",
    river: "Sungai Cimanuk Lama",
    location: "Kecamatan Sindang, Indramayu",
    currentTma: 320,
    normalTma: 280,
    siaga3Tma: 360,
    siaga2Tma: 430,
    siaga1Tma: 510,
    debit: 185,
    status: "Normal",
    trend: "Stabil",
    lastUpdated: "5 menit yang lalu",
    notes: "Aliran air ke arah perkotaan Indramayu terpantau lancar. Tanggul bantaran dalam pemantauan visual rutin relawan.",
  },
  {
    id: "cantigi",
    badge: "Pos Hilir Pesisir · Muara Cantigi",
    name: "Muara Pesisir Cantigi & Pasekan",
    river: "Estuari Cimanuk & Laut Jawa",
    location: "Kecamatan Cantigi & Pasekan",
    currentTma: 290,
    normalTma: 210,
    siaga3Tma: 270,
    siaga2Tma: 340,
    siaga1Tma: 400,
    debit: 210,
    status: "Waspada (Siaga 3)",
    trend: "Meningkat",
    lastUpdated: "8 menit yang lalu",
    notes: "Kombinasi debit sungai dan pasang laut (rob) maksimum diperkirakan terjadi pukul 16:30 WIB. Warga tambak dan pesisir diimbau waspada.",
  },
  {
    id: "losarang",
    badge: "Kanal Pantura · Saluran Cipanas",
    name: "Pos Pantau Jembatan Losarang",
    river: "Saluran Primer Cipanas - Cipunagara",
    location: "Kecamatan Losarang (Jalur Pantura)",
    currentTma: 310,
    normalTma: 250,
    siaga3Tma: 350,
    siaga2Tma: 420,
    siaga1Tma: 500,
    debit: 140,
    status: "Normal",
    trend: "Stabil",
    lastUpdated: "12 menit yang lalu",
    notes: "Elevasi permukaan air aman. Jalur utama Pantura Losarang bebas genangan dan dapat dilalui kendaraan logistik.",
  },
];

export interface RoleData {
  id: string;
  role: string;
  tag: string;
  title: string;
  desc: string;
  points: string[];
  highlight: string;
}

export const ROLES_DATA: RoleData[] = [
  {
    id: "warga",
    role: "Warga & Relawan",
    tag: "Masyarakat Terdampak",
    title: "Peringatan Dini Personal & Akses Rute Evakuasi Bebas Banjir",
    desc: "Warga dan relawan menerima peringatan dini saat TMA Sungai Cimanuk naik, memantau titik genangan terkini, serta menavigasikan keluarga menuju posko aman tanpa terjebak genangan.",
    points: [
      "Akses cepat via web & PWA ringan langsung dari smartphone tanpa perlu install aplikasi berat",
      "Peta panduan rute evakuasi mandiri dengan kontur jalan tertinggi bebas banjir",
      "Kirim laporan genangan dan foto situasi darurat dengan koordinat GPS otomatis",
      "Daftar kontak darurat BPBD, ambulans, dan relawan perahu karet per kecamatan",
    ],
    highlight: "Memangkas waktu reaksi evakuasi mandiri warga dari hitungan jam menjadi hitungan menit sebelum air meluap.",
  },
  {
    id: "posko",
    role: "Petugas Posko BPBD",
    tag: "Tim Reaksi Cepat BPBD Indramayu",
    title: "Validasi Lapangan, Penanganan Pengungsi, & Distribusi Logistik",
    desc: "Petugas posko darurat memvalidasi laporan warga, memetakan kebutuhan bantuan per tenda pengungsian, dan mengarahkan armada perahu karet ke pemukiman terisolir.",
    points: [
      "Verifikasi cepat laporan banjir warga untuk prioritas penjemputan lansia & anak-anak",
      "Pendataan kebutuhan logistik: makanan siap santap, air bersih, selimut, dan obat-obatan",
      "Pembaruan status ketersediaan ruang posko pengungsian secara real-time",
      "Koordinasi langsung dengan Dinsos, PMI, dan pos dapur umum wilayah",
    ],
    highlight: "Distribusi logistik terarah dan akurat, memastikan tidak ada posko atau warga terisolir yang terlewat.",
  },
  {
    id: "pusdalops",
    role: "Pusat Komando (PUSDALOPS)",
    tag: "Command Center Kabupaten Indramayu",
    title: "Integrasi Telemetri Sensor TMA & Komando Tanggap Darurat Bencana",
    desc: "Operator PUSDALOPS BPBD Indramayu mengawasi telemetri ketinggian air 24/7 di Bendung Rentang hingga muara pesisir, mengaktifkan status siaga, dan memobilisasi sumber daya penyelamatan.",
    points: [
      "Pemantauan telemetri debit air hulu-hilir Cimanuk secara real-time per menit",
      "Simulasi peringatan dini jebol tanggul dan perkiraan waktu tiba luapan air di pemukiman",
      "Aktivasi sirene peringatan dini dan broadcast darurat ke seluruh kanal komunikasi warga",
      "Dasbor taktis terpadu bersama Bupati, TNI Kodim 0616, POLRES, dan Basarnas",
    ],
    highlight: "Keputusan penetapan status tanggap darurat diambil berbasis data sensor presisi dan analisis hidrologi terukur.",
  },
];

export interface SafetyStep {
  no: string;
  title: string;
  desc: string;
}

export const SAFETY_STEPS: SafetyStep[] = [
  {
    no: "01",
    title: "Sensor TMA Radar & Ultrasonik",
    desc: "Sensor telemetri otomatis di sepanjang Sungai Cimanuk memantau ketinggian muka air secara kontinu setiap menit untuk mendeteksi lonjakan debit seketika.",
  },
  {
    no: "02",
    title: "Peringatan Dini Multi-Kanal",
    desc: "Notifikasi otomatis berjenjang (Siaga 3 Waspada, Siaga 2 Kritis, Siaga 1 Bahaya) dikirim ke perangkat warga dan sirene fisik posko di pemukiman rawan.",
  },
  {
    no: "03",
    title: "Navigasi Rute Evakuasi Aman",
    desc: "Sistem cerdas memetakan jalan darat dengan elevasi aman dan bebas genangan untuk mengarahkan warga ke posko pengungsian terdekat tanpa risiko terjebak.",
  },
  {
    no: "04",
    title: "Infrastruktur Tahan Pemadaman",
    desc: "Jaringan pos pantau dilengkapi baterai cadangan tenaga surya dan jaringan mesh offline agar sistem tetap aktif saat cuaca ekstrem dan pemadaman listrik PLN.",
  },
];

export interface FlowStep {
  no: string;
  title: string;
  desc: string;
}

export const FLOW_STEPS: FlowStep[] = [
  {
    no: "01",
    title: "Deteksi Debit Air",
    desc: "Sensor TMA di Bendung Rentang merekam kenaikan elevasi air sungai dari kiriman hulu.",
  },
  {
    no: "02",
    title: "Analisis Waktu Tiba",
    desc: "Sistem DERMAYU mengalkulasi laju arus dan memprediksi waktu tiba puncak genangan di wilayah hilir.",
  },
  {
    no: "03",
    title: "Broadcast Peringatan Warga",
    desc: "Warga di bantaran sungai menerima peringatan dini lengkap dengan panduan persiapan evakuasi mandiri.",
  },
  {
    no: "04",
    title: "Evakuasi ke Posko Terdekat",
    desc: "Warga bergerak mengikuti rute aman menuju gedung sekolah, balai desa, atau masjid yang dijadikan posko resmi.",
  },
  {
    no: "05",
    title: "Sinkronisasi Tim SAR & Bantuan",
    desc: "PUSDALOPS BPBD Indramayu memantau sebaran pengungsi dan mengalirkan perahu karet serta logistik makanan secara terukur.",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "Bagaimana cara kerja sistem deteksi Tinggi Muka Air (TMA) di DERMAYU?",
    a: "DERMAYU mengintegrasikan sensor radar dan ultrasonik yang terpasang di titik-titik krusial seperti Bendung Rentang, Jembatan Bangkir, dan muara pesisir. Data ketinggian air dan kecepatan debit diperbarui otomatis per menit ke server pusat.",
  },
  {
    q: "Apa arti status Siaga 1, 2, dan 3 pada pemantauan banjir Indramayu?",
    a: "Siaga 3 (Waspada): Ketinggian air mulai mendekati bibir tanggul, warga diimbau mengamankan barang berharga. Siaga 2 (Kritis): Air mulai meluap ke saluran primer, warga rentan (lansia & anak) dipersiapkan mengungsi. Siaga 1 (Bahaya): Luapan air memasuki pemukiman, sirene darurat dibunyikan dan evakuasi total wajib dilaksanakan segera.",
  },
  {
    q: "Bagaimana jika jaringan internet terputus saat banjir besar melanda?",
    a: "Platform DERMAYU dirancang sebagai Progressive Web App (PWA) yang dapat menyimpan cache peta rute evakuasi offline pada memori perangkat. Selain itu, sirine fisik berdaya surya dan radio komunikasi darurat BPBD tetap menyiarkan informasi jika BTS seluler mati.",
  },
  {
    q: "Bagaimana cara warga melaporkan genangan atau meminta bantuan evakuasi perahu karet?",
    a: "Warga cukup menekan tombol 'Lapor Bencana' di aplikasi DERMAYU, menyalakan izin lokasi GPS, dan mengunggah foto genangan. Laporan langsung masuk ke peta taktis tim reaksi cepat BPBD Indramayu untuk penjemputan prioritas.",
  },
  {
    q: "Apakah seluruh posko pengungsian di DERMAYU terverifikasi aman?",
    a: "Ya! Seluruh posko yang terdaftar adalah fasilitas umum resmi (kantor kecamatan, balai desa, GOR, gedung sekolah bertingkat) yang telah melalui verifikasi elevasi bebas banjir dan memiliki akses pasokan air bersih serta fasilitas sanitasi darurat.",
  },
];

export interface GisRegion {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
}

export const GIS_REGIONS: GisRegion[] = [
  { id: "all", label: "Seluruh Indramayu", center: [-6.4385, 108.2850], zoom: 11 },
  { id: "hulu", label: "Sektor Hulu (Rentang - Jatibarang)", center: [-6.5450, 108.2850], zoom: 12 },
  { id: "kota", label: "Sektor Tengah (Sindang - Kota)", center: [-6.3350, 108.3250], zoom: 13 },
  { id: "pesisir", label: "Sektor Pesisir & Rob (Cantigi - Pasekan)", center: [-6.2900, 108.3400], zoom: 12 },
  { id: "pantura", label: "Sektor Pantura (Losarang - Kandanghaur)", center: [-6.3950, 108.1600], zoom: 12 },
];

export interface GisNode {
  id: string;
  regionId: string;
  type: "sensor" | "posko";
  name: string;
  cluster: string;
  lat: number;
  lng: number;
  sppgId?: string; // parent station id if linked
  capacity?: string;
  activeSchools?: number;
  portions?: number;
  status: string;
  temp: string; // Used for TMA level display
  freshness: number; // Used for Safety/Capacity Score
}

export const GIS_NODES: GisNode[] = [
  // Sektor Hulu (Jatibarang / Rentang)
  {
    id: "sensor-rentang",
    regionId: "hulu",
    type: "sensor",
    name: "Sensor TMA Utama Bendung Rentang",
    cluster: "Sektor Hulu Cimanuk",
    lat: -6.5562,
    lng: 108.2815,
    status: "Siaga 3 (Waspada)",
    temp: "485 cm (Debit 412 m³/s)",
    freshness: 72,
    capacity: "Kapasitas 1.100 m³/s",
    activeSchools: 8,
  },
  {
    id: "posko-jatibarang",
    regionId: "hulu",
    type: "posko",
    name: "Posko Induk Balai Desa Jatibarang Baru",
    cluster: "Kecamatan Jatibarang",
    lat: -6.4780,
    lng: 108.3050,
    sppgId: "sensor-rentang",
    status: "Siaga & Terbuka",
    temp: "TMA Darat: Aman",
    freshness: 98,
    portions: 450, // Kapasitas tampung orang
  },
  {
    id: "posko-kertasemaya",
    regionId: "hulu",
    type: "posko",
    name: "Posko Pengungsian GOR Kertasemaya",
    cluster: "Bantaran Cimanuk Hulu",
    lat: -6.5200,
    lng: 108.3200,
    sppgId: "sensor-rentang",
    status: "Siaga & Terbuka",
    temp: "TMA Darat: Aman",
    freshness: 95,
    portions: 600,
  },

  // Sektor Tengah (Sindang & Indramayu Kota)
  {
    id: "sensor-bangkir",
    regionId: "kota",
    type: "sensor",
    name: "Sensor TMA Pintu Air Bangkir",
    cluster: "Sektor Cimanuk Lama",
    lat: -6.3680,
    lng: 108.2950,
    status: "Normal",
    temp: "320 cm (Debit 185 m³/s)",
    freshness: 92,
    capacity: "Kapasitas 450 m³/s",
    activeSchools: 12,
  },
  {
    id: "posko-sindang",
    regionId: "kota",
    type: "posko",
    name: "Posko Utama BPBD GOR Singalodra Sindang",
    cluster: "Kecamatan Sindang",
    lat: -6.3420,
    lng: 108.3050,
    sppgId: "sensor-bangkir",
    status: "Siap Siaga 24 Jam",
    temp: "TMA Darat: Aman",
    freshness: 100,
    portions: 1200,
  },
  {
    id: "posko-pendopo",
    regionId: "kota",
    type: "posko",
    name: "Posko Dapur Umum Pendopo Alun-alun",
    cluster: "Pusat Kota Indramayu",
    lat: -6.3260,
    lng: 108.3230,
    sppgId: "sensor-bangkir",
    status: "Siap Siaga 24 Jam",
    temp: "TMA Darat: Aman",
    freshness: 99,
    portions: 850,
  },

  // Sektor Pesisir & Rob (Cantigi & Pasekan)
  {
    id: "sensor-cantigi",
    regionId: "pesisir",
    type: "sensor",
    name: "Sensor Pasang Rob Muara Cantigi",
    cluster: "Sektor Estuari Muara",
    lat: -6.2850,
    lng: 108.3380,
    status: "Siaga 3 (Pasang Rob)",
    temp: "290 cm (Pasang Laut)",
    freshness: 68,
    capacity: "Batas Kritis 340 cm",
    activeSchools: 6,
  },
  {
    id: "posko-cantigi",
    regionId: "pesisir",
    type: "posko",
    name: "Posko Evakuasi SMPN 1 Cantigi",
    cluster: "Kecamatan Cantigi",
    lat: -6.3100,
    lng: 108.3300,
    sppgId: "sensor-cantigi",
    status: "Siap & Logistik Siaga",
    temp: "TMA Darat: Aman",
    freshness: 94,
    portions: 500,
  },
  {
    id: "posko-pasekan",
    regionId: "pesisir",
    type: "posko",
    name: "Posko Pengungsian Balai Desa Pasekan",
    cluster: "Kecamatan Pasekan",
    lat: -6.2950,
    lng: 108.3650,
    sppgId: "sensor-cantigi",
    status: "Siap & Logistik Siaga",
    temp: "TMA Darat: Aman",
    freshness: 91,
    portions: 400,
  },

  // Sektor Pantura Barat (Losarang & Kandanghaur)
  {
    id: "sensor-losarang",
    regionId: "pantura",
    type: "sensor",
    name: "Sensor TMA Sungai Cipanas Losarang",
    cluster: "Sektor Saluran Pantura",
    lat: -6.4050,
    lng: 108.1550,
    status: "Normal",
    temp: "310 cm (Debit 140 m³/s)",
    freshness: 88,
    capacity: "Kapasitas 500 m³/s",
    activeSchools: 10,
  },
  {
    id: "posko-losarang",
    regionId: "pantura",
    type: "posko",
    name: "Posko Siaga Bencana Kantor Camat Losarang",
    cluster: "Kecamatan Losarang",
    lat: -6.3980,
    lng: 108.1680,
    sppgId: "sensor-losarang",
    status: "Siap Siaga 24 Jam",
    temp: "TMA Darat: Bebas Banjir",
    freshness: 97,
    portions: 750,
  },
  {
    id: "posko-kandanghaur",
    regionId: "pantura",
    type: "posko",
    name: "Posko Pengungsian Balai Desa Eretan Wetan",
    cluster: "Kandanghaur Pesisir",
    lat: -6.3450,
    lng: 108.0850,
    sppgId: "sensor-losarang",
    status: "Siap Siaga 24 Jam",
    temp: "TMA Darat: Bebas Banjir",
    freshness: 93,
    portions: 650,
  },
];

export interface DemographicRegion {
  id: string;
  label: string;
  badge: string;
  totalStudents: string; // Relabeled to Warga Terlindungi
  totalSchools: string;  // Relabeled to Titik Posko Aktif
  activeKitchens: string;// Relabeled to Pos Pantau TMA
  onTimeRate: string;    // Relabeled to Akurasi Deteksi
  freshnessAvg: string;  // Relabeled to Kesiapan Evakuasi
  sdRatio: number;
  smpRatio: number;
  avgTemp: string;       // TMA Rata-rata
  description: string;
  topDistricts: { name: string; students: string; schools: string; status: string }[];
}

export const REGIONAL_DEMOGRAPHICS: DemographicRegion[] = [
  {
    id: "all",
    label: "Seluruh Kabupaten Indramayu",
    badge: "31 Kecamatan · Wilayah Rawan Banjir & Rob",
    totalStudents: "1.845.000",
    totalSchools: "48 Posko",
    activeKitchens: "16 Sensor",
    onTimeRate: "99.8%",
    freshnessAvg: "97.5%",
    sdRatio: 65,
    smpRatio: 35,
    avgTemp: "310 cm",
    description: "Pemantauan komprehensif Daerah Aliran Sungai (DAS) Cimanuk, Cipanas, serta wilayah pasang laut pesisir dari Rentang hingga perairan Laut Jawa secara real-time.",
    topDistricts: [
      { name: "DAS Cimanuk Hilir (Sindang & Kota)", students: "285.000 Warga", schools: "12 Posko", status: "Aman Terkendali" },
      { name: "Pesisir Rob (Cantigi, Pasekan, Eretan)", students: "194.000 Warga", schools: "10 Posko", status: "Waspada Rob" },
      { name: "Sektor Hulu (Jatibarang & Kertasemaya)", students: "240.000 Warga", schools: "14 Posko", status: "Siaga 3 Terpantau" },
      { name: "Jalur Pantura (Losarang & Kandanghaur)", students: "215.000 Warga", schools: "12 Posko", status: "Jalur Aman Lancar" },
    ],
  },
  {
    id: "hulu",
    label: "Sektor Hulu (Jatibarang - Rentang)",
    badge: "Pintu Masuk Debit Utama Cimanuk",
    totalStudents: "240.000",
    totalSchools: "14 Posko",
    activeKitchens: "4 Sensor",
    onTimeRate: "99.9%",
    freshnessAvg: "98.2%",
    sdRatio: 60,
    smpRatio: 40,
    avgTemp: "485 cm",
    description: "Pemantauan debit pelimpah Bendung Rentang sebagai gerbang peringatan dini utama sebelum aliran air mencapai wilayah padat penduduk di hilir.",
    topDistricts: [
      { name: "Bantaran Jatibarang", students: "95.000 Warga", schools: "6 Posko", status: "Siaga 3" },
      { name: "Tanggul Kertasemaya", students: "82.000 Warga", schools: "5 Posko", status: "Waspada" },
      { name: "Kecamatan Tukdana", students: "63.000 Warga", schools: "3 Posko", status: "Normal" },
    ],
  },
  {
    id: "kota",
    label: "Sektor Tengah (Sindang - Kota)",
    badge: "Pusat Pemerintahan & Pemukiman",
    totalStudents: "285.000",
    totalSchools: "12 Posko",
    activeKitchens: "5 Sensor",
    onTimeRate: "99.7%",
    freshnessAvg: "99.1%",
    sdRatio: 70,
    smpRatio: 30,
    avgTemp: "320 cm",
    description: "Kawasan vital perkotaan Indramayu dengan proteksi pintu air Bangkir dan tanggul kritis Cimanuk Lama yang dipantau 24 jam penuh.",
    topDistricts: [
      { name: "Kecamatan Sindang", students: "110.000 Warga", schools: "5 Posko", status: "Normal" },
      { name: "Kecamatan Indramayu", students: "125.000 Warga", schools: "5 Posko", status: "Normal" },
      { name: "Kecamatan Balongan", students: "50.000 Warga", schools: "2 Posko", status: "Normal" },
    ],
  },
  {
    id: "pesisir",
    label: "Sektor Pesisir (Cantigi - Pasekan)",
    badge: "Zona Rawan Pasang Air Laut (Rob)",
    totalStudents: "194.000",
    totalSchools: "10 Posko",
    activeKitchens: "4 Sensor",
    onTimeRate: "99.5%",
    freshnessAvg: "96.4%",
    sdRatio: 65,
    smpRatio: 35,
    avgTemp: "290 cm",
    description: "Daerah estuari muara yang berhadapan langsung dengan ancaman banjir pasang air laut (rob) saat fase bulan purnama.",
    topDistricts: [
      { name: "Cantigi Pesisir", students: "68.000 Warga", schools: "4 Posko", status: "Waspada Rob" },
      { name: "Pasekan Muara", students: "56.000 Warga", schools: "3 Posko", status: "Waspada Rob" },
      { name: "Juntinyuat Pantai", students: "70.000 Warga", schools: "3 Posko", status: "Normal" },
    ],
  },
  {
    id: "pantura",
    label: "Sektor Pantura (Losarang - Kandanghaur)",
    badge: "Arteri Nasional & Kawasan Tambak",
    totalStudents: "215.000",
    totalSchools: "12 Posko",
    activeKitchens: "3 Sensor",
    onTimeRate: "99.8%",
    freshnessAvg: "97.0%",
    sdRatio: 68,
    smpRatio: 32,
    avgTemp: "310 cm",
    description: "Konektivitas aliran Sungai Cipanas dan Cipunagara yang memotong jalur logistik nasional Pantura Jawa Barat.",
    topDistricts: [
      { name: "Losarang Pantura", students: "88.000 Warga", schools: "5 Posko", status: "Lancar Aman" },
      { name: "Kandanghaur & Eretan", students: "78.000 Warga", schools: "4 Posko", status: "Waspada Rob" },
      { name: "Gabuswetan", students: "49.000 Warga", schools: "3 Posko", status: "Normal" },
    ],
  },
];

export interface OperationalMatrixRow {
  region: string;
  province: string;
  hub: string; // Pos Pantau Sensor
  schools: string; // Posko Evakuasi
  portions: string; // Kapasitas Tampung
  window: string; // Waktu Respon Cepat
  tempRange: string; // Batas TMA
}

export const OPERATIONAL_MATRIX: OperationalMatrixRow[] = [
  {
    region: "DAS Cimanuk Hulu (Rentang)",
    province: "Jatibarang & Kertasemaya",
    hub: "4 Sensor TMA Radar",
    schools: "14 Posko Terverifikasi",
    portions: "4.800 Jiwa",
    window: "< 15 Menit Respon",
    tempRange: "TMA 485 cm (Siaga 3)",
  },
  {
    region: "Sektor Kota (Cimanuk Lama)",
    province: "Sindang & Indramayu Kota",
    hub: "5 Sensor Telemetri",
    schools: "12 Posko Terverifikasi",
    portions: "6.500 Jiwa",
    window: "< 10 Menit Respon",
    tempRange: "TMA 320 cm (Normal)",
  },
  {
    region: "Sektor Pesisir Estuari",
    province: "Cantigi & Pasekan",
    hub: "4 Sensor Pasang Rob",
    schools: "10 Posko Terverifikasi",
    portions: "3.200 Jiwa",
    window: "< 20 Menit Respon",
    tempRange: "TMA 290 cm (Siaga 3)",
  },
  {
    region: "Sektor Barat Pantura",
    province: "Losarang & Kandanghaur",
    hub: "3 Sensor Debit Air",
    schools: "12 Posko Terverifikasi",
    portions: "5.100 Jiwa",
    window: "< 15 Menit Respon",
    tempRange: "TMA 310 cm (Normal)",
  },
];

