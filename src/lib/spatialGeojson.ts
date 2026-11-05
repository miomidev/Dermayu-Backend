/**
 * Layanan Loader & Cache Data Spasial GeoJSON Kabupaten Indramayu
 * File sumber berlokasi di public/data/geojson/
 */

export interface WaterInfrastructureProperties {
  id: string;
  nama_infrastruktur: string;
  tipe_bangunan: string;
  das_sungai: string;
  kecamatan: string;
  lokasi_detail: string;
  latitude: number;
  longitude: number;
  status_siaga: string;
  debit_saat_ini_m3s: number;
  kapasitas_desain_m3s: number;
  persentase_kapasitas: number;
  tma_elevasi_mdpl: number;
  elevasi_bibir_tanggul_mdpl: number;
  operasional_pintu: string;
  arah_aliran: string;
  potensi_dampak_hilir: string;
  instansi_pengelola: string;
}

export interface FloodProneProperties {
  id_titik_banjir: string;
  nama_titik: string;
  desa: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  kategori_banjir: string;
  tingkat_kerawanan: string;
  penyebab_utama: string;
  frekuensi_kejadian: string;
  estimasi_ketinggian_air_cm: string;
  status_wilayah: string;
  sumber_acuan: string;
}

export interface SchoolShelterProperties {
  id_posko: string;
  npsn: string;
  sekolah_id: string;
  nama_sekolah: string;
  bentuk_pendidikan: string;
  status_sekolah: string;
  akreditasi: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  alamat_jalan: string;
  nama_dusun: string;
  kode_pos: string;
  latitude: number;
  longitude: number;
  potensi_posko_evakuasi: string;
  estimasi_kapasitas_pengungsi_jiwa: number;
  sumber_data: string;
}

export interface GeoJSONFeatureCollection<P = any> {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: P;
  }>;
}

// Memory Cache agar fetch hanya dilakukan 1 kali selama sesi browser
let cachedWaterInfra: GeoJSONFeatureCollection<WaterInfrastructureProperties> | null = null;
let cachedFloodProne: GeoJSONFeatureCollection<FloodProneProperties> | null = null;
let cachedSchoolShelters: GeoJSONFeatureCollection<SchoolShelterProperties> | null = null;

export async function fetchWaterInfrastructureGeoJSON(): Promise<
  GeoJSONFeatureCollection<WaterInfrastructureProperties>
> {
  if (cachedWaterInfra) return cachedWaterInfra;
  const res = await fetch("/data/geojson/infrastruktur_pengendali_air_indramayu.geojson");
  if (!res.ok) throw new Error("Gagal memuat data infrastruktur air");
  cachedWaterInfra = await res.json();
  return cachedWaterInfra!;
}

export async function fetchFloodProneGeoJSON(): Promise<
  GeoJSONFeatureCollection<FloodProneProperties>
> {
  if (cachedFloodProne) return cachedFloodProne;
  const res = await fetch("/data/geojson/titik_rawan_banjir_indramayu.geojson");
  if (!res.ok) throw new Error("Gagal memuat data titik rawan banjir");
  cachedFloodProne = await res.json();
  return cachedFloodProne!;
}

export async function fetchSchoolSheltersGeoJSON(): Promise<
  GeoJSONFeatureCollection<SchoolShelterProperties>
> {
  if (cachedSchoolShelters) return cachedSchoolShelters;
  const res = await fetch("/data/geojson/sekolah_posko_banjir_indramayu.geojson");
  if (!res.ok) throw new Error("Gagal memuat data sekolah posko evakuasi");
  cachedSchoolShelters = await res.json();
  return cachedSchoolShelters!;
}

