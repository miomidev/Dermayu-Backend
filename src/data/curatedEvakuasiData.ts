// DATASET SIMULASI RESMI WEBGIS DERMAYU (/rute)
// 1. Tepat 100 Data Posko Evakuasi Terkurasi Aman dari Genangan
// 2. Tepat 20 Titik Simulasi Hambatan Genangan Jalan Utama (Radius 200m)

export interface PoskoItem {
  id: string;
  nama: string;
  kategori: "sekolah" | "masjid" | "balai_desa" | "gor";
  alamat: string;
  kecamatan: string;
  lat: number;
  lng: number;
  kapasitas: number;
  terisi: number;
  status: "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";
  fasilitas: string[];
  kontak: { pj: string; telp: string };
  foto: string;
  tier: 1 | 2 | 3 | 4 | 5;
  petugasId?: string;
  isActive?: boolean;
}

export interface FloodObstacle {
  id: string;
  title: string;
  location: string;
  zone: "PESISIR_ROB" | "DAS_CIMANUK";
  lat: number;
  lng: number;
  depthCm: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: string;
  radius: number; // in meters (200m)
  description: string;
}

export const CURATED_POSKO_LIST: PoskoItem[] = [
  {
    "id": "sh-001",
    "nama": "SMKN 1 Kandanghaur",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Pantura Kandanghaur No. 12",
    "kecamatan": "Kandanghaur",
    "lat": -6.356,
    "lng": 108.138,
    "kapasitas": 500,
    "terisi": 210,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Luas",
      "Dapur Umum Kemensos",
      "Toilet 10 Pintu",
      "Genset 15 kVA"
    ],
    "kontak": {
      "pj": "Drs. H. Sukardi",
      "telp": "0812-2201-9011"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-002",
    "nama": "SMPN 1 Kandanghaur",
    "kategori": "sekolah",
    "alamat": "Jl. Babakan Ilir No. 04, Kandanghaur",
    "kecamatan": "Kandanghaur",
    "lat": -6.3585,
    "lng": 108.142,
    "kapasitas": 320,
    "terisi": 150,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "MCK Bersih",
      "Pos Medis Bidan Desa"
    ],
    "kontak": {
      "pj": "Ibu Hj. Siti Maryam",
      "telp": "0813-8890-1122"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-003",
    "nama": "SMPN 2 Kandanghaur",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Wirapanjunan No. 15",
    "kecamatan": "Kandanghaur",
    "lat": -6.362,
    "lng": 108.146,
    "kapasitas": 260,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Air PDAM Bersih",
      "Akses Ambulans"
    ],
    "kontak": {
      "pj": "Bpk. Bambang Sutopo",
      "telp": "0852-7711-3344"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-004",
    "nama": "SDN 1 Ilir Kandanghaur",
    "kategori": "sekolah",
    "alamat": "Jl. Dataran Aman Ilir No. 20",
    "kecamatan": "Kandanghaur",
    "lat": -6.352,
    "lng": 108.141,
    "kapasitas": 180,
    "terisi": 160,
    "status": "HAMPIR_PENUH",
    "fasilitas": [
      "Ruang Kelas Hangat",
      "Dapur Mandiri Warga",
      "Tenda Tambahan BNPB"
    ],
    "kontak": {
      "pj": "Ibu Nurhasanah, S.Pd",
      "telp": "0813-9876-5432"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-005",
    "nama": "Kantor Camat Kandanghaur",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Pantura No. 88, Kandanghaur",
    "kecamatan": "Kandanghaur",
    "lat": -6.359,
    "lng": 108.135,
    "kapasitas": 400,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Posko Komando Lapangan",
      "Ambulans Siaga 24 Jam",
      "Logistik Sembako PMI"
    ],
    "kontak": {
      "pj": "Bpk. Camat Kandanghaur",
      "telp": "0811-2300-4455"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-006",
    "nama": "Balai Desa Ilir",
    "kategori": "balai_desa",
    "alamat": "Jl. Poros Desa Ilir Daratan No. 07",
    "kecamatan": "Kandanghaur",
    "lat": -6.354,
    "lng": 108.144,
    "kapasitas": 220,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Desa Luas",
      "Dapur Umum Lapangan",
      "Listrik Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Ilir",
      "telp": "0877-4455-6677"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-007",
    "nama": "Masjid Jami' Baitul Muttaqin Kandanghaur",
    "kategori": "masjid",
    "alamat": "Jl. Raya Pantura Kandanghaur Barat",
    "kecamatan": "Kandanghaur",
    "lat": -6.361,
    "lng": 108.131,
    "kapasitas": 450,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Serambi Karpet",
      "Tempat Wudhu MCK Banyak",
      "Air Bersih Melimpah"
    ],
    "kontak": {
      "pj": "H. Sulaeman (DKM)",
      "telp": "0812-9900-1188"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-008",
    "nama": "GOR Graha Warga Karanganyar",
    "kategori": "gor",
    "alamat": "Jl. Poros Karanganyar Dataran Tinggi",
    "kecamatan": "Kandanghaur",
    "lat": -6.364,
    "lng": 108.139,
    "kapasitas": 400,
    "terisi": 140,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Olahraga",
      "Sanitasi Bersih",
      "Perlengkapan Bayi & Balita",
      "Dapur Darurat"
    ],
    "kontak": {
      "pj": "Bpk. Mas'ud",
      "telp": "0821-3344-5566"
    },
    "foto": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-009",
    "nama": "GOR Mini Kandanghaur",
    "kategori": "gor",
    "alamat": "Jl. Olahraga Dataran Tinggi No. 01",
    "kecamatan": "Kandanghaur",
    "lat": -6.363,
    "lng": 108.137,
    "kapasitas": 600,
    "terisi": 280,
    "status": "TERSEDIA",
    "fasilitas": [
      "Lapangan Tertutup Luas",
      "Kapasitas Tampung Besar",
      "Dapur Umum Terpadu",
      "Posko Kesehatan"
    ],
    "kontak": {
      "pj": "Ibu Ratna (Tagana)",
      "telp": "0821-4433-2100"
    },
    "foto": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-010",
    "nama": "Balai Desa Eretan Wetan",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Pantura Eretan Dataran No. 45",
    "kecamatan": "Kandanghaur",
    "lat": -6.345,
    "lng": 108.128,
    "kapasitas": 300,
    "terisi": 220,
    "status": "TERSEDIA",
    "fasilitas": [
      "Dapur Umum Tagana",
      "Posko Medis Puskesmas",
      "Ruang Khusus Lansia",
      "Genset Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Mulyadi (Kuwu)",
      "telp": "0812-3456-7890"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-011",
    "nama": "Balai Desa Eretan Kulon",
    "kategori": "balai_desa",
    "alamat": "Jl. Dataran Tanggul Eretan Kulon No. 08",
    "kecamatan": "Kandanghaur",
    "lat": -6.34,
    "lng": 108.115,
    "kapasitas": 250,
    "terisi": 140,
    "status": "TERSEDIA",
    "fasilitas": [
      "Dapur Warga",
      "Air Bersih PDAM",
      "Bidan Siaga Desa"
    ],
    "kontak": {
      "pj": "Bpk. Dedi Sukardi",
      "telp": "0813-2211-9988"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-012",
    "nama": "SMPN 3 Kandanghaur Eretan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Pertanian Eretan Kulon",
    "kecamatan": "Kandanghaur",
    "lat": -6.346,
    "lng": 108.112,
    "kapasitas": 350,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Beratap Tinggi",
      "Toilet Pria/Wanita Bersih",
      "Lapangan Parkir Bantuan"
    ],
    "kontak": {
      "pj": "Drs. Tarmidi",
      "telp": "0853-1122-3344"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-013",
    "nama": "SDN 2 Eretan Wetan",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Selatan Eretan Wetan",
    "kecamatan": "Kandanghaur",
    "lat": -6.348,
    "lng": 108.126,
    "kapasitas": 200,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "MCK Sanitasi",
      "Penyaluran Makanan Siap Saji"
    ],
    "kontak": {
      "pj": "Ibu Sumarni, S.Pd",
      "telp": "0878-9900-2211"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-014",
    "nama": "SDN 1 Eretan Kulon",
    "kategori": "sekolah",
    "alamat": "Jl. Pemukiman Mandiri Eretan Kulon",
    "kecamatan": "Kandanghaur",
    "lat": -6.342,
    "lng": 108.11,
    "kapasitas": 180,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Air Minum Galon",
      "Posko Logistik Swadaya"
    ],
    "kontak": {
      "pj": "Pak Caswita",
      "telp": "0812-7788-9900"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-015",
    "nama": "MIS Al-Ikhlas Eretan",
    "kategori": "sekolah",
    "alamat": "Jl. H. Syatori No. 03, Eretan",
    "kecamatan": "Kandanghaur",
    "lat": -6.347,
    "lng": 108.122,
    "kapasitas": 160,
    "terisi": 145,
    "status": "HAMPIR_PENUH",
    "fasilitas": [
      "Ruang Belajar Madrasah",
      "Dapur Warga",
      "Obat Pertolongan Pertama"
    ],
    "kontak": {
      "pj": "Ust. Syarifudin",
      "telp": "0822-1133-5577"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-016",
    "nama": "Masjid Nurul Huda Eretan Wetan",
    "kategori": "masjid",
    "alamat": "Jl. Raya Pantura Eretan KM 44",
    "kecamatan": "Kandanghaur",
    "lat": -6.3465,
    "lng": 108.1245,
    "kapasitas": 500,
    "terisi": 260,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi 2 Lantai Kering",
      "Tempat Wudhu & MCK",
      "Pusat Bantuan Logistik"
    ],
    "kontak": {
      "pj": "H. Imron Rosyadi",
      "telp": "0812-4455-6677"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-017",
    "nama": "Balai Pelatihan Nelayan Eretan (GOR)",
    "kategori": "gor",
    "alamat": "Jl. Lingkar Luar Eretan No. 02",
    "kecamatan": "Kandanghaur",
    "lat": -6.3495,
    "lng": 108.119,
    "kapasitas": 450,
    "terisi": 200,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Pelatihan",
      "Ruang Medis Darurat",
      "Dapur Lapangan BNPB"
    ],
    "kontak": {
      "pj": "Bpk. Kuswanto",
      "telp": "0813-5566-7788"
    },
    "foto": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-018",
    "nama": "SMKN 1 Cantigi",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Cantigi Daratan No. 10",
    "kecamatan": "Cantigi",
    "lat": -6.29,
    "lng": 108.269,
    "kapasitas": 400,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna",
      "Ruang Bengkel Kering",
      "Toilet MCK Bersih",
      "Akses Perahu SAR"
    ],
    "kontak": {
      "pj": "Drs. Harsono",
      "telp": "0812-3300-8899"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-019",
    "nama": "SMPN 1 Cantigi",
    "kategori": "sekolah",
    "alamat": "Jl. Ki Hajar Dewantara No. 04, Cantigi",
    "kecamatan": "Cantigi",
    "lat": -6.288,
    "lng": 108.265,
    "kapasitas": 250,
    "terisi": 210,
    "status": "HAMPIR_PENUH",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "Bidan Siaga 24 Jam",
      "Air Bersih Tanki"
    ],
    "kontak": {
      "pj": "Pak Hendra (Satlak)",
      "telp": "0852-7711-9022"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-020",
    "nama": "SDN 1 Cantigi Kulon",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Cangkring Cantigi",
    "kecamatan": "Cantigi",
    "lat": -6.294,
    "lng": 108.262,
    "kapasitas": 180,
    "terisi": 80,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Kering",
      "Dapur Mandiri",
      "Pos Ronda Siaga"
    ],
    "kontak": {
      "pj": "Ibu Rodiah",
      "telp": "0877-1122-4466"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-021",
    "nama": "SDN 2 Cemara Kulon",
    "kategori": "sekolah",
    "alamat": "Jl. Tanggul Luar Cemara Cantigi",
    "kecamatan": "Cantigi",
    "lat": -6.282,
    "lng": 108.275,
    "kapasitas": 160,
    "terisi": 70,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Air Bersih PDAM",
      "Logistik Makanan"
    ],
    "kontak": {
      "pj": "Pak Suhendar",
      "telp": "0813-8899-0011"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-022",
    "nama": "Balai Desa Cangkring Cantigi",
    "kategori": "balai_desa",
    "alamat": "Jl. Tanggul Dataran Cangkring No. 15",
    "kecamatan": "Cantigi",
    "lat": -6.291,
    "lng": 108.258,
    "kapasitas": 220,
    "terisi": 90,
    "status": "TERSEDIA",
    "fasilitas": [
      "Dapur Warga Tagana",
      "Ruang Balita & Lansia",
      "Genset Cadangan"
    ],
    "kontak": {
      "pj": "Bpk. Tarkim (Kuwu)",
      "telp": "0877-3344-5511"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-023",
    "nama": "Balai Desa Cemara Kulon",
    "kategori": "balai_desa",
    "alamat": "Jl. Poros Balai Desa Cemara",
    "kecamatan": "Cantigi",
    "lat": -6.28,
    "lng": 108.278,
    "kapasitas": 200,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Kuwu",
      "MCK Sanitasi",
      "Dapur Umum"
    ],
    "kontak": {
      "pj": "Bpk. Wastika",
      "telp": "0812-6677-8899"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-024",
    "nama": "Masjid Baitul Muttaqin Cantigi",
    "kategori": "masjid",
    "alamat": "Jl. Raya Desa Cantigi Wetan",
    "kecamatan": "Cantigi",
    "lat": -6.2925,
    "lng": 108.268,
    "kapasitas": 350,
    "terisi": 120,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Luas",
      "Air Sumur Bersih",
      "Tempat Istirahat Pengungsi"
    ],
    "kontak": {
      "pj": "K.H. Mustofa",
      "telp": "0821-8899-7766"
    },
    "foto": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-025",
    "nama": "SMPN 1 Pasekan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Pasekan No. 22",
    "kecamatan": "Pasekan",
    "lat": -6.318,
    "lng": 108.305,
    "kapasitas": 320,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Luas",
      "Sanitasi MCK Lengkap",
      "Dapur Darurat"
    ],
    "kontak": {
      "pj": "Bpk. H. Maman",
      "telp": "0813-3344-5566"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-026",
    "nama": "SDN 1 Pasekan",
    "kategori": "sekolah",
    "alamat": "Jl. Desa Pasekan Poros Tengah",
    "kecamatan": "Pasekan",
    "lat": -6.321,
    "lng": 108.302,
    "kapasitas": 200,
    "terisi": 90,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Pengungsi",
      "Air Bersih",
      "Ruang Kesehatan"
    ],
    "kontak": {
      "pj": "Ibu Eni Rohaeni",
      "telp": "0852-6677-8811"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-027",
    "nama": "SDN 1 Pabean Ilir",
    "kategori": "sekolah",
    "alamat": "Jl. Dataran Aman Pabean Pasekan",
    "kecamatan": "Pasekan",
    "lat": -6.309,
    "lng": 108.315,
    "kapasitas": 170,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Siaga",
      "Dapur Swadaya",
      "Obat P3K Lengkap"
    ],
    "kontak": {
      "pj": "Pak Sudirman",
      "telp": "0878-1122-3344"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-028",
    "nama": "Balai Desa Pasekan",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Pasekan Dataran Kering No. 18",
    "kecamatan": "Pasekan",
    "lat": -6.315,
    "lng": 108.295,
    "kapasitas": 260,
    "terisi": 115,
    "status": "TERSEDIA",
    "fasilitas": [
      "Dapur Warga Mandiri",
      "Bidan Desa Siaga 24 Jam",
      "Ruang Balita"
    ],
    "kontak": {
      "pj": "Pak Carma (Satgas)",
      "telp": "0877-2233-4411"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-029",
    "nama": "Balai Desa Karanganyar Pasekan",
    "kategori": "balai_desa",
    "alamat": "Jl. Poros Karanganyar No. 05",
    "kecamatan": "Pasekan",
    "lat": -6.324,
    "lng": 108.308,
    "kapasitas": 220,
    "terisi": 85,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Kuwu Luas",
      "Genset Siaga",
      "Tenda Pleton"
    ],
    "kontak": {
      "pj": "Bpk. Wartono",
      "telp": "0812-8877-6655"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-030",
    "nama": "Masjid Al-Barokah Pasekan",
    "kategori": "masjid",
    "alamat": "Jl. Masjid Poros Pasekan",
    "kecamatan": "Pasekan",
    "lat": -6.319,
    "lng": 108.3,
    "kapasitas": 380,
    "terisi": 140,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi 2 Lantai",
      "MCK Bersih",
      "Logistik Makanan Siap Santap"
    ],
    "kontak": {
      "pj": "Ust. Rahmat Hidayat",
      "telp": "0821-2233-4411"
    },
    "foto": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-031",
    "nama": "SMAN 1 Balongan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Sukaurip No. 10, Balongan",
    "kecamatan": "Balongan",
    "lat": -6.382,
    "lng": 108.375,
    "kapasitas": 500,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Serbaguna",
      "Dapur Lapangan PMI",
      "Toilet 12 Pintu",
      "Akses Truk Logistik"
    ],
    "kontak": {
      "pj": "Drs. H. Kasmuri",
      "telp": "0812-4455-8899"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-032",
    "nama": "SMPN 1 Balongan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Balongan KM 08",
    "kecamatan": "Balongan",
    "lat": -6.378,
    "lng": 108.37,
    "kapasitas": 300,
    "terisi": 120,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Nyaman",
      "Pos Medis Bidan",
      "Air PDAM Lancar"
    ],
    "kontak": {
      "pj": "Ibu Hj. Tati",
      "telp": "0853-2211-4455"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-033",
    "nama": "SDN 1 Rawadalem Balongan",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Rawadalem No. 04",
    "kecamatan": "Balongan",
    "lat": -6.385,
    "lng": 108.368,
    "kapasitas": 190,
    "terisi": 80,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Bersih",
      "Dapur Mandiri",
      "Tenda Tambahan"
    ],
    "kontak": {
      "pj": "Pak Warsidi",
      "telp": "0878-5544-3322"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-034",
    "nama": "Balai Desa Balongan",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Balongan No. 25",
    "kecamatan": "Balongan",
    "lat": -6.375,
    "lng": 108.372,
    "kapasitas": 280,
    "terisi": 140,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Balai Desa",
      "Posko Terpadu Kesiapsiagaan",
      "Ambulans Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Balongan",
      "telp": "0813-7788-9911"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-035",
    "nama": "Masjid Jami' Baitul Mu'minin Balongan",
    "kategori": "masjid",
    "alamat": "Jl. Poros Balongan Raya",
    "kecamatan": "Balongan",
    "lat": -6.379,
    "lng": 108.374,
    "kapasitas": 420,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Masjid Luas",
      "Sanitasi Bersih",
      "Suplai Air Minum Higienis"
    ],
    "kontak": {
      "pj": "H. Abdul Wahid",
      "telp": "0821-4455-1122"
    },
    "foto": "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-036",
    "nama": "SMAN 1 Lohbener",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Celancang No. 05, Lohbener",
    "kecamatan": "Lohbener",
    "lat": -6.398,
    "lng": 108.281,
    "kapasitas": 550,
    "terisi": 210,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Utama Olahraga",
      "Dapur Lapangan Kemensos",
      "MCK Sanitasi Lengkap",
      "Listrik Genset"
    ],
    "kontak": {
      "pj": "Drs. H. Ridwan",
      "telp": "0812-7711-2233"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-037",
    "nama": "SMPN 1 Lohbener",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Lohbener Timur No. 12",
    "kecamatan": "Lohbener",
    "lat": -6.402,
    "lng": 108.286,
    "kapasitas": 320,
    "terisi": 140,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Bertingkat Kering",
      "Pos Medis Puskesmas",
      "Air PDAM Siaga"
    ],
    "kontak": {
      "pj": "Ibu Wartini, M.Pd",
      "telp": "0813-6655-4433"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-038",
    "nama": "SDN 1 Kiajaran Kulon Lohbener",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Kiajaran No. 08",
    "kecamatan": "Lohbener",
    "lat": -6.408,
    "lng": 108.275,
    "kapasitas": 200,
    "terisi": 85,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "Dapur Warga Mandiri",
      "Pos Ronda Bencana"
    ],
    "kontak": {
      "pj": "Pak Sunaryo",
      "telp": "0852-1144-7788"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-039",
    "nama": "Kantor Camat Lohbener",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Pantura Lohbener KM 10",
    "kecamatan": "Lohbener",
    "lat": -6.401,
    "lng": 108.28,
    "kapasitas": 400,
    "terisi": 160,
    "status": "TERSEDIA",
    "fasilitas": [
      "Posko Komando Satlak Lohbener",
      "Ambulans 24 Jam",
      "Gudang Logistik Sembako"
    ],
    "kontak": {
      "pj": "Bpk. Camat Lohbener",
      "telp": "0811-9988-7766"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-040",
    "nama": "Masjid Darussalam Lohbener",
    "kategori": "masjid",
    "alamat": "Jl. Raya Lohbener No. 40",
    "kecamatan": "Lohbener",
    "lat": -6.3995,
    "lng": 108.283,
    "kapasitas": 480,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi 2 Lantai Luas",
      "Fasilitas Wudhu & MCK",
      "Ruang Medis Darurat"
    ],
    "kontak": {
      "pj": "K.H. Syamsuri",
      "telp": "0821-3322-1100"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-041",
    "nama": "Gedung Serbaguna Polindra Lohbener",
    "kategori": "gor",
    "alamat": "Jl. Raya Lohbener Barat No. 08",
    "kecamatan": "Lohbener",
    "lat": -6.392,
    "lng": 108.278,
    "kapasitas": 750,
    "terisi": 310,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Kampus Terpadu",
      "Toilet Banyak",
      "Logistik Makanan Cepat Saji",
      "Kapasitas Raksasa"
    ],
    "kontak": {
      "pj": "H. Sukirno (Koordinator)",
      "telp": "0819-8877-6655"
    },
    "foto": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-042",
    "nama": "SMPN 1 Sindang",
    "kategori": "sekolah",
    "alamat": "Jl. MT Haryono No. 15, Sindang",
    "kecamatan": "Sindang",
    "lat": -6.332,
    "lng": 108.318,
    "kapasitas": 420,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Bertingkat",
      "MCK Sanitasi Bersih",
      "Dapur Umum Lapangan"
    ],
    "kontak": {
      "pj": "Drs. H. Suwarto",
      "telp": "0812-4433-2211"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-043",
    "nama": "SDN 1 Dermayu Sindang",
    "kategori": "sekolah",
    "alamat": "Jl. Mayor Dasuki No. 09, Sindang",
    "kecamatan": "Sindang",
    "lat": -6.339,
    "lng": 108.309,
    "kapasitas": 220,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Aman Banjir",
      "Dapur Swadaya",
      "Bantuan Medis"
    ],
    "kontak": {
      "pj": "Ibu Sri Rahayu",
      "telp": "0877-5566-7788"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-044",
    "nama": "Balai Desa Dermayu Sindang",
    "kategori": "balai_desa",
    "alamat": "Jl. Mayor Dasuki No. 22, Sindang",
    "kecamatan": "Sindang",
    "lat": -6.338,
    "lng": 108.31,
    "kapasitas": 300,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Posko Utama",
      "Dapur Tagana",
      "Logistik Sembako PMI"
    ],
    "kontak": {
      "pj": "Bpk. Waryono (Kuwu)",
      "telp": "0813-6677-8899"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-045",
    "nama": "Balai Desa Terusan Sindang",
    "kategori": "balai_desa",
    "alamat": "Jl. Dataran Tanggul Luar Terusan",
    "kecamatan": "Sindang",
    "lat": -6.345,
    "lng": 108.316,
    "kapasitas": 240,
    "terisi": 120,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Balai Desa",
      "Genset Cadangan",
      "Penyaluran Makanan"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Terusan",
      "telp": "0852-8899-1122"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-046",
    "nama": "Masjid Besar Baitul Ma'mur Sindang",
    "kategori": "masjid",
    "alamat": "Jl. MT Haryono No. 05, Sindang",
    "kecamatan": "Sindang",
    "lat": -6.334,
    "lng": 108.319,
    "kapasitas": 520,
    "terisi": 210,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Megah 2 Lantai",
      "Toilet 16 Pintu",
      "Ruang Istirahat Balita & Lansia"
    ],
    "kontak": {
      "pj": "H. Ahmad Fauzi",
      "telp": "0821-7788-9900"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-047",
    "nama": "GOR Singalodra Sindang",
    "kategori": "gor",
    "alamat": "Jl. MT Haryono No. 01, Sindang",
    "kecamatan": "Sindang",
    "lat": -6.33,
    "lng": 108.321,
    "kapasitas": 1000,
    "terisi": 380,
    "status": "TERSEDIA",
    "fasilitas": [
      "Pusat Komando Utama BPBD Indramayu",
      "Dapur Umum Terpadu Kemensos",
      "Rumah Sakit Lapangan",
      "Helipad Evakuasi"
    ],
    "kontak": {
      "pj": "Drs. Dadang (BPBD)",
      "telp": "0811-2345-6789"
    },
    "foto": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-048",
    "nama": "SMAN 1 Indramayu",
    "kategori": "sekolah",
    "alamat": "Jl. Mayor Dasuki No. 45, Indramayu Kota",
    "kecamatan": "Indramayu",
    "lat": -6.326,
    "lng": 108.33,
    "kapasitas": 600,
    "terisi": 240,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Olahraga Indoor",
      "Ruang Kelas Bertingkat",
      "Dapur Lapangan",
      "Toilet Bersih"
    ],
    "kontak": {
      "pj": "Drs. H. Mulyadi",
      "telp": "0812-1122-4455"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-049",
    "nama": "SMPN 2 Indramayu",
    "kategori": "sekolah",
    "alamat": "Jl. S. Parman No. 18, Indramayu Kota",
    "kecamatan": "Indramayu",
    "lat": -6.329,
    "lng": 108.334,
    "kapasitas": 350,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Pengungsi",
      "MCK Sanitasi Lengkap",
      "Air PDAM Berlimpah"
    ],
    "kontak": {
      "pj": "Ibu Hj. Aminah",
      "telp": "0813-4455-6677"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-050",
    "nama": "Kantor Camat Indramayu",
    "kategori": "balai_desa",
    "alamat": "Jl. RA Kartini No. 02, Indramayu",
    "kecamatan": "Indramayu",
    "lat": -6.324,
    "lng": 108.328,
    "kapasitas": 450,
    "terisi": 170,
    "status": "TERSEDIA",
    "fasilitas": [
      "Posko Komando Kota",
      "Pusat Koordinasi SAR",
      "Gudang Logistik Provinsi"
    ],
    "kontak": {
      "pj": "Bpk. Camat Kota",
      "telp": "0811-7788-9900"
    },
    "foto": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-051",
    "nama": "Balai Pertemuan Singaraja",
    "kategori": "balai_desa",
    "alamat": "Jl. Singaraja No. 14, Indramayu",
    "kecamatan": "Indramayu",
    "lat": -6.336,
    "lng": 108.342,
    "kapasitas": 280,
    "terisi": 105,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Warga",
      "Dapur Umum Swadaya",
      "Bidan Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Singaraja",
      "telp": "0852-3344-5566"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-052",
    "nama": "Masjid Islamic Centre Syekh Abdul Manan",
    "kategori": "masjid",
    "alamat": "Jl. Soekarno-Hatta No. 01, Simpang Lima Indramayu",
    "kecamatan": "Indramayu",
    "lat": -6.338,
    "lng": 108.339,
    "kapasitas": 1500,
    "terisi": 480,
    "status": "TERSEDIA",
    "fasilitas": [
      "Halaman & Serambi Raksasa",
      "Sanitasi MCK Skala Besar",
      "Pusat Logistik Bencana Utama",
      "Ruang Medis & Relawan"
    ],
    "kontak": {
      "pj": "K.H. Syaerozi Bilal",
      "telp": "0812-9988-1122"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-053",
    "nama": "Gedung PGRI Indramayu",
    "kategori": "gor",
    "alamat": "Jl. Olahraga No. 07, Indramayu Kota",
    "kecamatan": "Indramayu",
    "lat": -6.327,
    "lng": 108.326,
    "kapasitas": 650,
    "terisi": 260,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Pertemuan Berkapasitas Luas",
      "Sanitasi MCK Banyak",
      "Dapur Umum Siaga"
    ],
    "kontak": {
      "pj": "Bpk. H. Malik",
      "telp": "0813-8899-2233"
    },
    "foto": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-054",
    "nama": "SMAN 1 Kertasmaya",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Kertasmaya No. 10",
    "kecamatan": "Kertasmaya",
    "lat": -6.528,
    "lng": 108.338,
    "kapasitas": 500,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Kering",
      "Ruang Kelas Bertingkat",
      "Dapur Umum Lapangan",
      "Genset Siaga"
    ],
    "kontak": {
      "pj": "Drs. H. Bahrudin",
      "telp": "0812-5566-7788"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-055",
    "nama": "SMPN 1 Kertasmaya",
    "kategori": "sekolah",
    "alamat": "Jl. Lapangan Bola Kertasmaya",
    "kecamatan": "Kertasmaya",
    "lat": -6.531,
    "lng": 108.341,
    "kapasitas": 320,
    "terisi": 150,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "MCK Sanitasi",
      "Pos Medis Desa"
    ],
    "kontak": {
      "pj": "Ibu Hj. Nining",
      "telp": "0853-4455-6677"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-056",
    "nama": "SDN 1 Kertasmaya",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Desa Kertasmaya",
    "kecamatan": "Kertasmaya",
    "lat": -6.533,
    "lng": 108.344,
    "kapasitas": 190,
    "terisi": 85,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Nyaman",
      "Dapur Warga",
      "Penyaluran Makanan"
    ],
    "kontak": {
      "pj": "Pak Suwarna",
      "telp": "0878-1133-5577"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-057",
    "nama": "Balai Desa Kertasmaya",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Kertasmaya No. 35",
    "kecamatan": "Kertasmaya",
    "lat": -6.529,
    "lng": 108.336,
    "kapasitas": 280,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Balai Desa",
      "Posko Bantuan Tanggap Darurat",
      "Ambulans Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Kertasmaya",
      "telp": "0813-2244-6688"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-058",
    "nama": "Masjid Jami' Baiturrahim Kertasmaya",
    "kategori": "masjid",
    "alamat": "Jl. Raya Kertasmaya Barat",
    "kecamatan": "Kertasmaya",
    "lat": -6.53,
    "lng": 108.3395,
    "kapasitas": 450,
    "terisi": 175,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Kering Dataran Tinggi",
      "Tempat Wudhu & MCK",
      "Ruang Istirahat Ramah Anak"
    ],
    "kontak": {
      "pj": "K.H. Badruzzaman",
      "telp": "0821-6677-8899"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-059",
    "nama": "SMKN 1 Jatibarang",
    "kategori": "sekolah",
    "alamat": "Jl. Mayor Dasuki No. 80, Jatibarang",
    "kecamatan": "Jatibarang",
    "lat": -6.468,
    "lng": 108.318,
    "kapasitas": 600,
    "terisi": 220,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna Besar",
      "Dapur Lapangan Kemensos",
      "Toilet Lengkap",
      "Akses Jalan Lebar"
    ],
    "kontak": {
      "pj": "Drs. H. Taryono",
      "telp": "0812-8899-3344"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-060",
    "nama": "SMPN 1 Jatibarang",
    "kategori": "sekolah",
    "alamat": "Jl. Siliwangi No. 25, Jatibarang",
    "kecamatan": "Jatibarang",
    "lat": -6.474,
    "lng": 108.314,
    "kapasitas": 380,
    "terisi": 160,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Pos Medis Puskesmas",
      "Air PDAM Berlimpah"
    ],
    "kontak": {
      "pj": "Ibu Hj. Rohanah",
      "telp": "0813-7788-2211"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-061",
    "nama": "Kantor Camat Jatibarang",
    "kategori": "balai_desa",
    "alamat": "Jl. Mayor Dasuki No. 01, Jatibarang",
    "kecamatan": "Jatibarang",
    "lat": -6.47,
    "lng": 108.316,
    "kapasitas": 450,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Posko Induk Tanggap Darurat Cimanuk",
      "Ambulans Siaga",
      "Logistik PMI"
    ],
    "kontak": {
      "pj": "Bpk. Camat Jatibarang",
      "telp": "0811-3344-5566"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-062",
    "nama": "Masjid Al-Ikhlas Jatibarang",
    "kategori": "masjid",
    "alamat": "Jl. Stasiun No. 04, Jatibarang",
    "kecamatan": "Jatibarang",
    "lat": -6.4715,
    "lng": 108.3175,
    "kapasitas": 550,
    "terisi": 205,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Luas Nyaman",
      "Toilet MCK 14 Pintu",
      "Ruang Khusus Lansia"
    ],
    "kontak": {
      "pj": "H. Abdullah",
      "telp": "0821-5566-7788"
    },
    "foto": "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-063",
    "nama": "GOR Futsal Mandiri Jatibarang",
    "kategori": "gor",
    "alamat": "Jl. Siliwangi Barat No. 18",
    "kecamatan": "Jatibarang",
    "lat": -6.466,
    "lng": 108.311,
    "kapasitas": 500,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Lapangan Tertutup Beratap Tinggi",
      "Kapasitas Pengungsi Luas",
      "Dapur Darurat"
    ],
    "kontak": {
      "pj": "Bpk. Gunawan",
      "telp": "0812-4411-9900"
    },
    "foto": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-064",
    "nama": "SMPN 1 Tukdana",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Tukdana No. 12",
    "kecamatan": "Tukdana",
    "lat": -6.502,
    "lng": 108.272,
    "kapasitas": 300,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Aman Banjir",
      "MCK Bersih",
      "Dapur Umum Mandiri"
    ],
    "kontak": {
      "pj": "Pak Sukamto",
      "telp": "0852-4455-8899"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-065",
    "nama": "SDN 1 Kerticala Tukdana",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Kerticala No. 06",
    "kecamatan": "Tukdana",
    "lat": -6.508,
    "lng": 108.276,
    "kapasitas": 180,
    "terisi": 75,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "Air Minum",
      "Obat P3K"
    ],
    "kontak": {
      "pj": "Ibu Warsih",
      "telp": "0877-6655-4433"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 4
  },
  {
    "id": "sh-066",
    "nama": "Balai Desa Kerticala Tukdana",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Tukdana KM 04",
    "kecamatan": "Tukdana",
    "lat": -6.505,
    "lng": 108.274,
    "kapasitas": 250,
    "terisi": 100,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Kuwu Dataran Aman",
      "Posko Terpadu",
      "Bidan Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Kerticala",
      "telp": "0813-8877-6655"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-067",
    "nama": "Masjid Jami' Baiturrahman Tukdana",
    "kategori": "masjid",
    "alamat": "Jl. Poros Desa Tukdana",
    "kecamatan": "Tukdana",
    "lat": -6.5035,
    "lng": 108.273,
    "kapasitas": 360,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Bersih",
      "Sanitasi Banyak",
      "Logistik Makanan Warga"
    ],
    "kontak": {
      "pj": "Ust. Syamsul Maarif",
      "telp": "0821-7766-5544"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-068",
    "nama": "SMPN 1 Bangodua",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Bangodua No. 20",
    "kecamatan": "Bangodua",
    "lat": -6.518,
    "lng": 108.298,
    "kapasitas": 320,
    "terisi": 125,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Bebas Genangan",
      "MCK Sanitasi",
      "Dapur Lapangan"
    ],
    "kontak": {
      "pj": "Pak Darwanto",
      "telp": "0812-6655-4422"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-069",
    "nama": "Balai Desa Bangodua",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Poros Bangodua No. 05",
    "kecamatan": "Bangodua",
    "lat": -6.521,
    "lng": 108.301,
    "kapasitas": 260,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Balai Desa",
      "Posko Medis",
      "Ruang Balita & Anak"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Bangodua",
      "telp": "0852-1133-7799"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-070",
    "nama": "Masjid Jami' Nurul Iman Bangodua",
    "kategori": "masjid",
    "alamat": "Jl. Masjid Raya Bangodua",
    "kecamatan": "Bangodua",
    "lat": -6.5195,
    "lng": 108.2995,
    "kapasitas": 400,
    "terisi": 145,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi 2 Lantai Kering",
      "Air Bersih",
      "Makanan Siap Saji Swadaya"
    ],
    "kontak": {
      "pj": "H. Syafi'i",
      "telp": "0821-9988-7711"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-071",
    "nama": "SMAN 1 Haurgeulis",
    "kategori": "sekolah",
    "alamat": "Jl. Bantarwaru No. 09, Haurgeulis",
    "kecamatan": "Haurgeulis",
    "lat": -6.458,
    "lng": 107.972,
    "kapasitas": 520,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Luas",
      "Dapur Umum Lapangan",
      "Toilet 10 Unit",
      "Genset Siaga"
    ],
    "kontak": {
      "pj": "Drs. H. Komarudin",
      "telp": "0812-7788-3344"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-072",
    "nama": "GOR Gelora Pemuda Haurgeulis",
    "kategori": "gor",
    "alamat": "Jl. Olahraga Dataran Tinggi No. 05, Haurgeulis",
    "kecamatan": "Haurgeulis",
    "lat": -6.462,
    "lng": 107.968,
    "kapasitas": 480,
    "terisi": 170,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Olahraga Serbaguna",
      "Posko SAR Relawan",
      "Dapur Tagana",
      "MCK Sanitasi"
    ],
    "kontak": {
      "pj": "Bpk. Suhendra",
      "telp": "0813-5544-3322"
    },
    "foto": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-073",
    "nama": "Masjid Al-Furqon Haurgeulis",
    "kategori": "masjid",
    "alamat": "Jl. Al-Furqon No. 01, Haurgeulis",
    "kecamatan": "Haurgeulis",
    "lat": -6.46,
    "lng": 107.97,
    "kapasitas": 480,
    "terisi": 160,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Luas",
      "Sanitasi MCK Bersih",
      "Ruang Istirahat Pengungsi"
    ],
    "kontak": {
      "pj": "K.H. Lukman Hakim",
      "telp": "0821-1122-3344"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-074",
    "nama": "SMKN 1 Gantar",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Gantar No. 08, Gantar",
    "kecamatan": "Gantar",
    "lat": -6.521,
    "lng": 107.985,
    "kapasitas": 450,
    "terisi": 160,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Workshop Luas",
      "Ruang Medis",
      "Air Bersih Melimpah"
    ],
    "kontak": {
      "pj": "Drs. H. Warsito",
      "telp": "0812-8877-1122"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-075",
    "nama": "SMPN 1 Gantar",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Mekarwaru No. 04, Gantar",
    "kecamatan": "Gantar",
    "lat": -6.528,
    "lng": 107.992,
    "kapasitas": 260,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur Kering",
      "Dapur Mandiri",
      "Pos Medis Desa"
    ],
    "kontak": {
      "pj": "Ibu Dra. Warsini",
      "telp": "0852-6677-4455"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-076",
    "nama": "GOR Mini Gelora Gantar",
    "kategori": "gor",
    "alamat": "Jl. Lapangan Olahraga Gantar",
    "kecamatan": "Gantar",
    "lat": -6.523,
    "lng": 107.988,
    "kapasitas": 400,
    "terisi": 130,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Olahraga Tertutup",
      "Dapur Umum Tagana",
      "Toilet MCK"
    ],
    "kontak": {
      "pj": "Bpk. Suhandi",
      "telp": "0877-3322-1144"
    },
    "foto": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-077",
    "nama": "SMAN 1 Anjatan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Lempuyang No. 05, Anjatan",
    "kecamatan": "Anjatan",
    "lat": -6.425,
    "lng": 108.028,
    "kapasitas": 500,
    "terisi": 210,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Olahraga Kering",
      "Toilet MCK Bersih",
      "Dapur Lapangan",
      "Genset Siaga"
    ],
    "kontak": {
      "pj": "Drs. H. Casmita",
      "telp": "0812-3344-9988"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-078",
    "nama": "SMPN 1 Anjatan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Anjatan Utara No. 14",
    "kecamatan": "Anjatan",
    "lat": -6.428,
    "lng": 108.032,
    "kapasitas": 320,
    "terisi": 120,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Bertingkat",
      "Air Bersih PDAM",
      "Posko Puskesmas"
    ],
    "kontak": {
      "pj": "Ibu Hj. Endang",
      "telp": "0813-9988-1122"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-079",
    "nama": "Balai Desa Anjatan Baru",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Anjatan No. 40",
    "kecamatan": "Anjatan",
    "lat": -6.426,
    "lng": 108.03,
    "kapasitas": 280,
    "terisi": 115,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Desa",
      "Posko Kesiapsiagaan",
      "Ambulans Desa"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Anjatan Baru",
      "telp": "0852-7788-3311"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-080",
    "nama": "SMKN 1 Sukra",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Pantura Sukra No. 10",
    "kecamatan": "Sukra",
    "lat": -6.312,
    "lng": 108.015,
    "kapasitas": 480,
    "terisi": 190,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna",
      "Ruang Tidur Kelas Kering",
      "MCK Sanitasi Lengkap"
    ],
    "kontak": {
      "pj": "Drs. H. Mulyono",
      "telp": "0812-4455-6611"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-081",
    "nama": "SMPN 1 Sukra",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Pertanian Sukra No. 07",
    "kecamatan": "Sukra",
    "lat": -6.316,
    "lng": 108.019,
    "kapasitas": 280,
    "terisi": 100,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Dapur Mandiri",
      "Air Minum"
    ],
    "kontak": {
      "pj": "Pak Karsono",
      "telp": "0853-2233-4455"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-082",
    "nama": "Balai Desa Sukra Kulon",
    "kategori": "balai_desa",
    "alamat": "Jl. Dataran Poros Sukra Kulon No. 03",
    "kecamatan": "Sukra",
    "lat": -6.314,
    "lng": 108.011,
    "kapasitas": 250,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Balai Desa",
      "Bidan Siaga 24 Jam",
      "Genset Cadangan"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Sukra Kulon",
      "telp": "0878-1144-6677"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-083",
    "nama": "SMAN 1 Gabuswetan",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Gabuswetan No. 12",
    "kecamatan": "Gabuswetan",
    "lat": -6.442,
    "lng": 108.165,
    "kapasitas": 500,
    "terisi": 185,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Olahraga",
      "Ruang Belajar Luas",
      "Dapur Umum Lapangan",
      "Toilet Bersih"
    ],
    "kontak": {
      "pj": "Drs. H. Sudrajat",
      "telp": "0812-6677-1199"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-084",
    "nama": "Balai Desa Gabuswetan",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Poros Gabuswetan No. 25",
    "kecamatan": "Gabuswetan",
    "lat": -6.445,
    "lng": 108.168,
    "kapasitas": 280,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Desa",
      "Posko Relawan Tagana",
      "Logistik Makanan"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Gabuswetan",
      "telp": "0813-8899-3322"
    },
    "foto": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-085",
    "nama": "Masjid Jami' Gabuswetan",
    "kategori": "masjid",
    "alamat": "Jl. Masjid Raya Gabuswetan",
    "kecamatan": "Gabuswetan",
    "lat": -6.4435,
    "lng": 108.1665,
    "kapasitas": 420,
    "terisi": 150,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Nyaman",
      "Tempat Wudhu Luas",
      "Makanan Siap Santap"
    ],
    "kontak": {
      "pj": "Ust. H. Syarif",
      "telp": "0821-4455-7788"
    },
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-086",
    "nama": "SMKN 1 Kroya",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Kroya No. 08, Kroya",
    "kecamatan": "Kroya",
    "lat": -6.502,
    "lng": 108.125,
    "kapasitas": 460,
    "terisi": 170,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Serbaguna",
      "Sanitasi MCK Lengkap",
      "Air PDAM Lancar"
    ],
    "kontak": {
      "pj": "Drs. H. Tarsono",
      "telp": "0812-3311-5577"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-087",
    "nama": "SMPN 1 Kroya",
    "kategori": "sekolah",
    "alamat": "Jl. Lapangan Olahraga Kroya",
    "kecamatan": "Kroya",
    "lat": -6.506,
    "lng": 108.128,
    "kapasitas": 280,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Tidur",
      "Dapur Swadaya Warga",
      "Pos Medis Desa"
    ],
    "kontak": {
      "pj": "Ibu Hj. Aminah",
      "telp": "0852-7766-1133"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-088",
    "nama": "Balai Desa Kroya",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Poros Kroya No. 14",
    "kecamatan": "Kroya",
    "lat": -6.504,
    "lng": 108.1265,
    "kapasitas": 260,
    "terisi": 105,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Kuwu",
      "Ambulans Siaga",
      "Logistik Sembako"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Kroya",
      "telp": "0877-2244-6688"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-089",
    "nama": "SMAN 1 Lelea",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Lelea No. 04, Lelea",
    "kecamatan": "Lelea",
    "lat": -6.445,
    "lng": 108.245,
    "kapasitas": 480,
    "terisi": 160,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Kering Luas",
      "Toilet 8 Unit",
      "Dapur Umum Siaga"
    ],
    "kontak": {
      "pj": "Drs. H. Wawan",
      "telp": "0812-8811-4455"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-090",
    "nama": "SMPN 1 Lelea",
    "kategori": "sekolah",
    "alamat": "Jl. Poros Pendidikan Lelea No. 12",
    "kecamatan": "Lelea",
    "lat": -6.4465,
    "lng": 108.2465,
    "kapasitas": 300,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Dapur Lapangan",
      "Air Minum"
    ],
    "kontak": {
      "pj": "Bpk. Rastika, S.Pd",
      "telp": "0853-1144-8822"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-091",
    "nama": "Balai Desa Lelea",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Lelea No. 20",
    "kecamatan": "Lelea",
    "lat": -6.448,
    "lng": 108.248,
    "kapasitas": 270,
    "terisi": 100,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Balai Desa Adat",
      "Posko Terpadu",
      "Bidan Siaga"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Lelea",
      "telp": "0813-4455-8899"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-092",
    "nama": "SMAN 1 Sliyeg",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Sleman No. 09, Sliyeg",
    "kecamatan": "Sliyeg",
    "lat": -6.462,
    "lng": 108.362,
    "kapasitas": 500,
    "terisi": 195,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Serbaguna",
      "Dapur Umum Lapangan",
      "MCK Sanitasi Bersih",
      "Genset Siaga"
    ],
    "kontak": {
      "pj": "Drs. H. Kasmad",
      "telp": "0812-9900-3344"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-093",
    "nama": "SMPN 1 Sliyeg",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Sliyeg Timur No. 15",
    "kecamatan": "Sliyeg",
    "lat": -6.466,
    "lng": 108.368,
    "kapasitas": 300,
    "terisi": 110,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Kelas Pengungsi",
      "Posko Medis",
      "Air Bersih PDAM"
    ],
    "kontak": {
      "pj": "Ibu Dra. Hj. Siti",
      "telp": "0852-3322-1177"
    },
    "foto": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-094",
    "nama": "Balai Desa Sliyeg",
    "kategori": "balai_desa",
    "alamat": "Jl. Raya Sliyeg No. 30",
    "kecamatan": "Sliyeg",
    "lat": -6.464,
    "lng": 108.365,
    "kapasitas": 280,
    "terisi": 120,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Pertemuan Balai Desa",
      "Ambulans Siaga Desa",
      "Logistik Sembako"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Sliyeg",
      "telp": "0878-4455-9900"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-095",
    "nama": "SMAN 1 Juntinyuat",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Segeran No. 05, Juntinyuat",
    "kecamatan": "Juntinyuat",
    "lat": -6.425,
    "lng": 108.425,
    "kapasitas": 520,
    "terisi": 180,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Olahraga Tertutup",
      "Dapur Umum Kemensos",
      "Toilet 10 Pintu"
    ],
    "kontak": {
      "pj": "Drs. H. Masruhin",
      "telp": "0812-5544-2211"
    },
    "foto": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-096",
    "nama": "SMPN 1 Juntinyuat",
    "kategori": "sekolah",
    "alamat": "Jl. Raya Juntikebon No. 12",
    "kecamatan": "Juntinyuat",
    "lat": -6.431,
    "lng": 108.431,
    "kapasitas": 310,
    "terisi": 115,
    "status": "TERSEDIA",
    "fasilitas": [
      "Ruang Belajar Kering",
      "MCK Bersih",
      "Air Minum Galon"
    ],
    "kontak": {
      "pj": "Pak H. Supriadi",
      "telp": "0813-7766-3322"
    },
    "foto": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    "tier": 3
  },
  {
    "id": "sh-097",
    "nama": "Balai Desa Juntinyuat",
    "kategori": "balai_desa",
    "alamat": "Jl. Poros Desa Juntinyuat No. 18",
    "kecamatan": "Juntinyuat",
    "lat": -6.428,
    "lng": 108.428,
    "kapasitas": 270,
    "terisi": 95,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Kuwu Dataran Tinggi",
      "Posko Medis",
      "Penyaluran Makanan Siap Saji"
    ],
    "kontak": {
      "pj": "Bpk. Kuwu Juntinyuat",
      "telp": "0852-8811-4477"
    },
    "foto": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  },
  {
    "id": "sh-098",
    "nama": "SMAN 1 Karangampel",
    "kategori": "sekolah",
    "alamat": "Jl. Dampuawangi No. 01, Karangampel",
    "kecamatan": "Karangampel",
    "lat": -6.471,
    "lng": 108.442,
    "kapasitas": 550,
    "terisi": 230,
    "status": "TERSEDIA",
    "fasilitas": [
      "Aula Olahraga Luas",
      "Dapur Lapangan PMI",
      "Toilet 12 Pintu",
      "Akses Jalan Provinsi"
    ],
    "kontak": {
      "pj": "Drs. H. Suwito",
      "telp": "0812-3377-9911"
    },
    "foto": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-099",
    "nama": "Masjid At-Taqwa Karangampel",
    "kategori": "masjid",
    "alamat": "Jl. Pasar Karangampel No. 08",
    "kecamatan": "Karangampel",
    "lat": -6.4735,
    "lng": 108.445,
    "kapasitas": 600,
    "terisi": 220,
    "status": "TERSEDIA",
    "fasilitas": [
      "Serambi Megah 2 Lantai",
      "Sanitasi MCK Lengkap",
      "Pusat Bantuan Makanan"
    ],
    "kontak": {
      "pj": "K.H. Nurhadi",
      "telp": "0821-6655-4433"
    },
    "foto": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80",
    "tier": 1
  },
  {
    "id": "sh-100",
    "nama": "Gedung Olahraga Pemuda Karangampel",
    "kategori": "gor",
    "alamat": "Jl. Olahraga No. 05, Karangampel",
    "kecamatan": "Karangampel",
    "lat": -6.469,
    "lng": 108.44,
    "kapasitas": 500,
    "terisi": 175,
    "status": "TERSEDIA",
    "fasilitas": [
      "Gedung Tertutup Kapasitas Besar",
      "Dapur Darurat Tagana",
      "Pos Medis Siaga"
    ],
    "kontak": {
      "pj": "Bpk. H. Sukanta",
      "telp": "0813-2211-7788"
    },
    "foto": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    "tier": 2
  }
];

export const FLOOD_OBSTACLES: FloodObstacle[] = [
  {
    "id": "obs-rob-01",
    "title": "Genangan Rob Kritis Jl. Raya Pantura Eretan Wetan",
    "location": "Jl. Raya Pantura Eretan Wetan KM 45",
    "zone": "PESISIR_ROB",
    "lat": -6.3482,
    "lng": 108.1215,
    "depthCm": 55,
    "severity": "CRITICAL",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Air laut pasang merendam badan jalan nasional sedalam 55 cm. Kendaraan kecil tidak dapat melintas."
  },
  {
    "id": "obs-rob-02",
    "title": "Genangan Pasang Ruas Jembatan Eretan Kulon",
    "location": "Jembatan Poros Pesisir Eretan Kulon",
    "zone": "PESISIR_ROB",
    "lat": -6.3435,
    "lng": 108.1142,
    "depthCm": 48,
    "severity": "CRITICAL",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Limpasan air muara merendam oprit jembatan pesisir setinggi 48 cm. Arus cukup deras."
  },
  {
    "id": "obs-rob-03",
    "title": "Genangan Rob Simpang Muara Ilir Kandanghaur",
    "location": "Simpang Tiga Jl. Muara Ilir, Kandanghaur",
    "zone": "PESISIR_ROB",
    "lat": -6.353,
    "lng": 108.132,
    "depthCm": 35,
    "severity": "HIGH",
    "status": "Waspada Pasang",
    "radius": 200,
    "description": "Genangan air asin setinggi 35 cm menutupi akses jalan desa menuju pemukiman nelayan."
  },
  {
    "id": "obs-rob-04",
    "title": "Luapan Air Laut Akses TPI Pesisir Eretan",
    "location": "Jl. Nelayan Blok TPI Eretan Wetan",
    "zone": "PESISIR_ROB",
    "lat": -6.341,
    "lng": 108.118,
    "depthCm": 60,
    "severity": "CRITICAL",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Genangan banjir rob setinggi dada anak-anak (60 cm) di jalan poros TPI nelayan."
  },
  {
    "id": "obs-rob-05",
    "title": "Genangan Pasang Muara Cantigi Kulon",
    "location": "Jl. Raya Muara Cantigi Kulon KM 02",
    "zone": "PESISIR_ROB",
    "lat": -6.2865,
    "lng": 108.261,
    "depthCm": 50,
    "severity": "CRITICAL",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Muara sungai Cantigi meluap ke badan jalan penghubung utama kecamatan sedalam 50 cm."
  },
  {
    "id": "obs-rob-06",
    "title": "Genangan Akses Jalan Tambak Desa Cemara",
    "location": "Jl. Poros Tambak Pesisir Cemara Kulon",
    "zone": "PESISIR_ROB",
    "lat": -6.279,
    "lng": 108.272,
    "depthCm": 30,
    "severity": "HIGH",
    "status": "Waspada Pasang",
    "radius": 200,
    "description": "Genangan air pasang laut setinggi 30 cm di ruas jalan tanggul tambak Cemara."
  },
  {
    "id": "obs-rob-07",
    "title": "Limpasan Rob Jl. Raya Pasekan - Pabean",
    "location": "Jl. Raya Pasekan Pesisir KM 04",
    "zone": "PESISIR_ROB",
    "lat": -6.312,
    "lng": 108.298,
    "depthCm": 25,
    "severity": "HIGH",
    "status": "Waspada Pasang",
    "radius": 200,
    "description": "Air rob merembes ke badan jalan sedalam 25 cm. Roda dua harus melaju perlahan."
  },
  {
    "id": "obs-rob-08",
    "title": "Genangan Pasang Pelabuhan Pantai Karangsong",
    "location": "Jl. Pantai Song No. 12, Karangsong",
    "zone": "PESISIR_ROB",
    "lat": -6.315,
    "lng": 108.358,
    "depthCm": 45,
    "severity": "CRITICAL",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Jalan utama pelabuhan perikanan Karangsong terendam rob 45 cm akibat air pasang tinggi."
  },
  {
    "id": "obs-rob-09",
    "title": "Genangan Ruas Jalan Pesisir Majakerta Balongan",
    "location": "Jl. Pesisir Majakerta, Balongan",
    "zone": "PESISIR_ROB",
    "lat": -6.372,
    "lng": 108.385,
    "depthCm": 25,
    "severity": "MEDIUM",
    "status": "Waspada Pasang",
    "radius": 200,
    "description": "Genangan air laut semata kaki (25 cm) di cekungan jalan dekat pantai Balongan."
  },
  {
    "id": "obs-rob-10",
    "title": "Genangan Rob Cekungan Simpang TPI Cantigi Wetan",
    "location": "Simpang TPI Cantigi Wetan",
    "zone": "PESISIR_ROB",
    "lat": -6.295,
    "lng": 108.267,
    "depthCm": 40,
    "severity": "HIGH",
    "status": "Banjir Rob Kritis",
    "radius": 200,
    "description": "Limpasan air sungai muara merendam simpang jalan desa sedalam 40 cm."
  },
  {
    "id": "obs-das-01",
    "title": "Luapan Sungai Cimanuk Bantaran Kertasmaya",
    "location": "Jl. Raya Kertasmaya Bantaran Cimanuk",
    "zone": "DAS_CIMANUK",
    "lat": -6.535,
    "lng": 108.33,
    "depthCm": 45,
    "severity": "CRITICAL",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Debit Cimanuk melebihi kapasitas tanggul jalan poros Kertasmaya. Genangan 45 cm berlumpur."
  },
  {
    "id": "obs-das-02",
    "title": "Genangan Tanggul Rembes Kertasmaya Selatan",
    "location": "Jl. Poros Kertasmaya Selatan Blok Tanggul",
    "zone": "DAS_CIMANUK",
    "lat": -6.545,
    "lng": 108.325,
    "depthCm": 30,
    "severity": "HIGH",
    "status": "Genangan Sedang",
    "radius": 200,
    "description": "Rembesan air dari sela karung pasir penahan Cimanuk menggenangi jalan desa 30 cm."
  },
  {
    "id": "obs-das-03",
    "title": "Limpasan Cimanuk Jembatan Merah Jatibarang",
    "location": "Jl. Siliwangi Dekat Jembatan Jatibarang",
    "zone": "DAS_CIMANUK",
    "lat": -6.472,
    "lng": 108.312,
    "depthCm": 42,
    "severity": "CRITICAL",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Luapan air sungai di kolong dan oprit jembatan Jatibarang sedalam 42 cm. Rute dialihkan."
  },
  {
    "id": "obs-das-04",
    "title": "Genangan Cekungan Jalan Siliwangi Jatibarang",
    "location": "Jl. Siliwangi KM 02, Jatibarang",
    "zone": "DAS_CIMANUK",
    "lat": -6.465,
    "lng": 108.308,
    "depthCm": 28,
    "severity": "MEDIUM",
    "status": "Genangan Sedang",
    "radius": 200,
    "description": "Drainase jalan meluap ke badan aspal sedalam 28 cm akibat antrean aliran ke Cimanuk."
  },
  {
    "id": "obs-das-05",
    "title": "Luapan Pertemuan Sungai Cimanuk - Sindang",
    "location": "Jl. Mayor Dasuki Pertemuan Sungai Sindang",
    "zone": "DAS_CIMANUK",
    "lat": -6.335,
    "lng": 108.315,
    "depthCm": 38,
    "severity": "HIGH",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Pertemuan anak sungai Kali Cimanuk meluap ke jalan protokol Sindang sedalam 38 cm."
  },
  {
    "id": "obs-das-06",
    "title": "Genangan Jalan Bantaran Pangeran Sutajaya Sindang",
    "location": "Jl. Pangeran Sutajaya, Sindang",
    "zone": "DAS_CIMANUK",
    "lat": -6.342,
    "lng": 108.308,
    "depthCm": 22,
    "severity": "MEDIUM",
    "status": "Genangan Sedang",
    "radius": 200,
    "description": "Genangan air setinggi 22 cm di jalan bantaran sungai Cimanuk Lama Sindang."
  },
  {
    "id": "obs-das-07",
    "title": "Limpasan Cimanuk Lama Indramayu Kota Pasar Baru",
    "location": "Jl. Cimanuk Lama Dekat Pasar Baru Indramayu",
    "zone": "DAS_CIMANUK",
    "lat": -6.328,
    "lng": 108.332,
    "depthCm": 32,
    "severity": "HIGH",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Limpasan air sungai Cimanuk menggenangi ruas jalan pasar kota setinggi 32 cm."
  },
  {
    "id": "obs-das-08",
    "title": "Tanggul Rawan Jebol Kali Cimanuk Lohbener",
    "location": "Jl. Tanggul Cimanuk Barat, Lohbener",
    "zone": "DAS_CIMANUK",
    "lat": -6.395,
    "lng": 108.282,
    "depthCm": 40,
    "severity": "CRITICAL",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Kondisi tanggul kritis dengan luapan air 40 cm menyeberangi jalan desa Lohbener."
  },
  {
    "id": "obs-das-09",
    "title": "Genangan Saluran Sekunder Cimanuk Tukdana",
    "location": "Jl. Raya Tukdana Dekat Saluran Sekunder",
    "zone": "DAS_CIMANUK",
    "lat": -6.51,
    "lng": 108.265,
    "depthCm": 25,
    "severity": "MEDIUM",
    "status": "Genangan Sedang",
    "radius": 200,
    "description": "Limpasan saluran irigasi sekunder Cimanuk menggenangi jalan poros Tukdana 25 cm."
  },
  {
    "id": "obs-das-10",
    "title": "Luapan Tanggul Tikungan Sungai Bangodua",
    "location": "Jl. Tikungan Sungai Cimanuk Bangodua",
    "zone": "DAS_CIMANUK",
    "lat": -6.525,
    "lng": 108.295,
    "depthCm": 35,
    "severity": "HIGH",
    "status": "Luapan Air Sungai",
    "radius": 200,
    "description": "Air meluap di belokan sungai Cimanuk Bangodua setinggi 35 cm merendam aspal jalan."
  }
];

// Helper konversi Haversine untuk kalkulasi rute dan perpotongan radius hambatan
export function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Algoritma Deteksi Apakah Jalur Polyline Rute Melintasi Lingkaran Radius Hambatan Genangan (200m)
export function detectIntersectedFloodObstacles(
  routeCoords: [number, number][],
  obstacles: FloodObstacle[] = FLOOD_OBSTACLES
): FloodObstacle[] {
  const hitMap = new Map<string, FloodObstacle>();
  for (const obs of obstacles) {
    const radius = obs.radius || 200;
    for (const [rLat, rLng] of routeCoords) {
      if (calculateDistanceInMeters(rLat, rLng, obs.lat, obs.lng) <= radius) {
        hitMap.set(obs.id, obs);
        break;
      }
    }
  }
  return Array.from(hitMap.values());
}
