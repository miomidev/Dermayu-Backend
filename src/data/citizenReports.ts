export type ReportStatus = "PENANGANAN" | "DIVERIFIKASI" | "SELESAI";

export interface CitizenReportItem {
  id: string;
  authorName: string;
  authorRole: "Warga" | "Relawan Tagana" | "Aparat Desa";
  authorVillage: string;
  title: string;
  description: string;
  location: string;
  waterLevelText: string;
  waterDepthCm: number;
  timeAgo: string;
  photoUrl: string;
  aiConfidence: number;
  status: ReportStatus;
  statusNote: string;
  similarCount: number;
  isUpvoted?: boolean;
  lat: number;
  lng: number;
}

export const INITIAL_CITIZEN_REPORTS: CitizenReportItem[] = [
  {
    id: "DMY-PUB-01",
    authorName: "Pak Warno",
    authorRole: "Warga",
    authorVillage: "Eretan Wetan, Kandanghaur",
    title: "Air pasang rob laut rendam jalan pemukiman nelayan",
    description:
      "Air pasang rob mulai naik sejak pukul 11 siang, akses jalan utama menuju TPI tergenang setinggi lutut orang dewasa.",
    location: "Blok Karanganyar RT 04 / RW 02, Eretan Wetan",
    waterLevelText: "Setinggi Lutut (55 cm)",
    waterDepthCm: 55,
    timeAgo: "15m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.94,
    status: "PENANGANAN",
    statusNote:
      "Regu SAR Pos Eretan bersama 1 perahu karet LCR sedang bergerak evakuasi warga rentan.",
    similarCount: 14,
    lat: -6.3475,
    lng: 108.1189,
  },
  {
    id: "DMY-PUB-02",
    authorName: "Ibu Nur Hasanah",
    authorRole: "Warga",
    authorVillage: "Cantigi Kulon, Cantigi",
    title: "Rembesan tanggul tanah saluran tambak mendekati pemukiman",
    description:
      "Debit air pasang menekan tanggul tanah pekarangan tambak ikan, warga waspada potensi limpasan puncak jam 3 sore.",
    location: "Blok Tanggul RT 02 / RW 01, Cantigi Kulon",
    waterLevelText: "Semata Kaki (30 cm)",
    waterDepthCm: 30,
    timeAgo: "45m lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.92,
    status: "DIVERIFIKASI",
    statusNote:
      "Posko menyiapkan 150 karung pasir bronjong darurat untuk pengamanan darurat tanggul.",
    similarCount: 8,
    lat: -6.2842,
    lng: 108.2635,
  },
  {
    id: "DMY-PUB-03",
    authorName: "Kang Didi",
    authorRole: "Relawan Tagana",
    authorVillage: "Parean Girang, Kandanghaur",
    title: "Drainase pembuang sekunder tersumbat eceng gondok & sampah ranting",
    description:
      "Aliran air ke muara tersendat akibat tumpukan ranting kayu di bawah jembatan penghubung antar dusun.",
    location: "Jl. Muara Lama KM 2, Parean Girang",
    waterLevelText: "Genangan 40 cm",
    waterDepthCm: 40,
    timeAgo: "1j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.89,
    status: "PENANGANAN",
    statusNote:
      "Satgas Dinas PUPR Indramayu bersama relawan telah mulai pembersihan pintu air saluran pembuang.",
    similarCount: 6,
    lat: -6.368,
    lng: 108.092,
  },
  {
    id: "DMY-PUB-04",
    authorName: "Bpk. Sutrisno",
    authorRole: "Aparat Desa",
    authorVillage: "Karangsong, Indramayu",
    title: "Limpasan gelombang pasang rob di area dermaga perahu",
    description:
      "Air laut meluap tipis ke bibir dermaga kapal nelayan, pompa sedot darurat telah diaktifkan untuk menjaga area tambatan.",
    location: "Dermaga Muara Karangsong, Indramayu",
    waterLevelText: "Semata Kaki (25 cm)",
    waterDepthCm: 25,
    timeAgo: "2j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1741110539426-fce3268c3c0d?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.95,
    status: "SELESAI",
    statusNote:
      "Pompa submersible menyala normal, genangan air berangsur surut kembali ke alur muara sungai.",
    similarCount: 19,
    lat: -6.315,
    lng: 108.358,
  },
  {
    id: "DMY-PUB-05",
    authorName: "Mang Casmadi",
    authorRole: "Warga",
    authorVillage: "Pasekan, Indramayu",
    title: "Jalan penghubung desa tergenang air pasang muara 35 cm",
    description:
      "Akses jalan antar blok di Pasekan tergenang air pasang sejak siang. Kendaraan roda dua dialihkan lewat tanggul timur.",
    location: "Blok Karang Baru RT 02 / RW 01, Pasekan",
    waterLevelText: "Semata Kaki - Betis (35 cm)",
    waterDepthCm: 35,
    timeAgo: "3j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.93,
    status: "DIVERIFIKASI",
    statusNote:
      "Aparat desa bersama Tagana telah memasang rambu peringatan genangan di ujung jembatan.",
    similarCount: 11,
    lat: -6.298,
    lng: 108.312,
  },
  {
    id: "DMY-PUB-06",
    authorName: "Kuwu Waryono",
    authorRole: "Aparat Desa",
    authorVillage: "Cantigi Kulon, Cantigi",
    title: "Penguatan tanggul darurat muara saluran sekunder selesai",
    description:
      "Alhamdulillah kerja bakti penguatan tanggul darurat di muara saluran sekunder telah selesai bersama pemuda Karang Taruna dan relawan.",
    location: "Saluran Sekunder Blok 4, Cantigi Kulon",
    waterLevelText: "Aman Terkendali (15 cm)",
    waterDepthCm: 15,
    timeAgo: "4j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.96,
    status: "SELESAI",
    statusNote:
      "Pintu air sekunder ditutup manual, rembesan telah dibendung dengan 200 karung pasir.",
    similarCount: 24,
    lat: -6.289,
    lng: 108.268,
  },
  {
    id: "DMY-PUB-07",
    authorName: "Hj. Mutmainah",
    authorRole: "Warga",
    authorVillage: "Limbangan, Juntinyuat",
    title: "Gelombang pasang rob meluap ke pekarangan pengolahan ikan asin",
    description:
      "Air laut naik ke area jemuran ikan asin warga pesisir Limbangan, warga mengamankan stok garam dan ikan olahan ke tempat lebih tinggi.",
    location: "Sentra Ikan Asin RT 05 / RW 02, Limbangan",
    waterLevelText: "Betis Dewasa (40 cm)",
    waterDepthCm: 40,
    timeAgo: "5j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1534862262637-373c120dcbcc?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.91,
    status: "PENANGANAN",
    statusNote:
      "Regu evakuasi Posko Juntinyuat telah meninjau lokasi dan membantu pemindahan perabotan.",
    similarCount: 15,
    lat: -6.412,
    lng: 108.455,
  },
  {
    id: "DMY-PUB-08",
    authorName: "Relawan Posko Tagana",
    authorRole: "Relawan Tagana",
    authorVillage: "Ilir, Kandanghaur",
    title: "Dapur umum mandiri membutuhkan tambahan selimut dan air galon",
    description:
      "Dapur umum di Balai Desa Ilir menyiapkan 300 paket nasi bungkus untuk warga terdampak rob di pesisir utara.",
    location: "Posko Dapur Umum Balai Desa Ilir, Kandanghaur",
    waterLevelText: "Bebas Genangan",
    waterDepthCm: 0,
    timeAgo: "6j lalu",
    photoUrl:
      "https://images.unsplash.com/photo-1672559987522-897ef4612604?auto=format&fit=crop&w=600&q=80",
    aiConfidence: 0.97,
    status: "PENANGANAN",
    statusNote:
      "Logistik beras dan mie instan telah tiba dari gudang BPBD Kabupaten Indramayu.",
    similarCount: 32,
    lat: -6.355,
    lng: 108.132,
  },
];

