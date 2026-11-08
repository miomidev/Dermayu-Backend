# FDS: Web In Action (WIA) 2026 — Hasil Penilaian & Umpan Balik

Dokumen ini merupakan konversi dan dokumentasi digital dari formulir evaluasi resmi **Finalist Development Stage (FDS): Web In Action (WIA) 2026** untuk tim **POLIWINDRA** dengan karya **DERMAYU**.

---

## Informasi Umum & Metadata Tim

| Komponen | Keterangan |
| :--- | :--- |
| **Nama Tim** | **POLIWINDRA** |
| **Judul Karya / Project** | **DERMAYU** |
| **Cabang Lomba** | Web In Action (WIA) 2026 |
| **Tema Utama** | *Designing Digital Futures* |
| **Sub Tema Pilihan** | *Civic Reporting & Accountability* |
| **Mentor Penilai** | **Adi Prabowo** |
| **Link Repository Publik** | [github.com/miomidev/Dermayu-Backend](https://github.com/miomidev/Dermayu-Backend.git) |
| **Link Dokumen Tim** | [canva.link/js9szrj9toi7upi](https://canva.link/js9szrj9toi7upi) |

---

## Keterangan Skala Penilaian

* **1** = Belum terlihat / sangat awal
* **2** = Masih perlu banyak perbaikan
* **3** = Cukup baik untuk tahap awal
* **4** = Baik dan mulai solid
* **5** = Sangat baik dan siap lanjut ke tahap berikutnya

---

## Bagian 1 — Relevansi dan Kualitas Konsep Website

| No | Aspek Penilaian | Intisari Observasi | Skor |
| :---: | :--- | :--- | :---: |
| 1 | **Relevansi Ide terhadap Tema & Subtema** | Apakah konsep website menjawab tantangan transparansi dan akuntabilitas layanan/data publik sesuai subtema pilihan? | **5** / 5 |
| 2 | **Latar Belakang & Tujuan** | Apakah latar belakang masalah, tujuan, dan rencana fitur utama website disampaikan secara jelas? | **4** / 5 |
| 3 | **Keaslian & Kreativitas** | Apakah ide memiliki elemen kebaruan atau cara unik dalam mengolah dan menyajikan data/informasi publik? | **4** / 5 |

> **Subtotal Bagian 1:** 13 / 15 (Rata-rata: 4.33)

---

## Bagian 2 — Struktur, Navigasi & Kelengkapan Teknis

| No | Aspek Penilaian | Intisari Observasi | Skor |
| :---: | :--- | :--- | :---: |
| 1 | **Kejelasan Struktur (Sitemap & Wireframe)** | Apakah struktur halaman (sitemap) dan wireframe/mockup tampilan utama sudah jelas dan logis? | **5** / 5 |
| 2 | **Kelengkapan Repository & README.md** | Apakah repository publik dapat diakses dan memuat README.md lengkap (deskripsi, tech stack, cara run, & progress)? | **4** / 5 |
| 3 | **Ketepatan Halaman Wajib FDS** | Apakah peserta sudah menyertakan screenshot minimal 2 halaman yang dikerjakan (wajib: landing page + 1 halaman lain)? | **5** / 5 |

> **Subtotal Bagian 2:** 14 / 15 (Rata-rata: 4.67)

---

## Bagian 3 — Visual, Fungsionalitas & Potensi Dampak

| No | Aspek Penilaian | Intisari Observasi | Skor |
| :---: | :--- | :--- | :---: |
| 1 | **Desain Visual & Layout** | Apakah desain antarmuka sudah proporsional, harmonis, menarik, dan menyajikan informasi yang mudah dibaca? | **5** / 5 |
| 2 | **Fungsionalitas, Navigasi & Responsivitas** | Apakah navigasi dan fitur awal berjalan baik, interaktif, serta memiliki struktur kode dan responsivitas yang memadai? | **5** / 5 |
| 3 | **Potensi Dampak Website** | Apakah website berpotensi nyata dalam memudahkan akses informasi publik dan mendukung keputusan berbasis data? | **4** / 5 |

> **Subtotal Bagian 3:** 14 / 15 (Rata-rata: 4.67)

---

## Rekapitulasi Skor Keseluruhan

```
Total Nilai  : 41 / 45  (91.1%)
Rata-rata    : 4.56 / 5.00
Predikat     : Sangat Baik & Siap Lanjut ke Tahap Berikutnya
```

---

## Bagian 4 — Catatan & Saran Perbaikan

### Ulasan & Evaluasi Mentor (Adi Prabowo)

> *"Proyek Dermayu memiliki fondasi konsep yang sangat kuat dan relevan dengan kebutuhan riil masyarakat daerah terhadap mitigasi bencana yang transparan dan berbasis data spasial. Integrasi antara platform WebGIS, pelaporan warga (Civic Reporting), dan navigasi rute evakuasi yang aman (Safe Evacuation Routing) menciptakan ekosistem tanggap darurat yang komprehensif. Dari sisi visual, desain antarmuka tampil profesional, bersih, dan tidak berlebihan, sehingga sangat membantu kecepatan akses informasi bagi pengguna dalam kondisi krisis."*

---

### Saran Pengembangan ke Depan (Dari Dokumen Evaluasi)

1. **Integrasi Data Real-Time**
   > *Hubungkan platform WebGIS dengan sensor ketinggian air lokal (IoT) atau data prediksi cuaca aktual (seperti BMKG) agar informasi status banjir dan rute evakuasi dapat diperbarui secara otomatis tanpa bergantung sepenuhnya pada laporan manual.*

2. **Optimasi Fitur Offline-First**
   > *Mengingat kondisi bencana sering kali disertai gangguan jaringan internet, pertimbangkan untuk menambahkan dukungan fungsionalitas offline atau cache peta prioritas (peta rute evakuasi aman) agar tetap dapat diakses warga saat sinyal terputus.*

3. **Validasi Laporan Warga**
   > *Tambahkan mekanisme moderasi atau verifikasi otomatis (misalnya berbasis geotagging dan timestamp ketat) pada modul Civic Reporting guna meminimalisir laporan ganda atau informasi hoaks di tengah situasi darurat.*

---

## Status Tindak Lanjut & Implementasi Saat Ini

| Saran Mentor | Status Saat Ini | Keterangan Implementasi di Kode |
| :--- | :---: | :--- |
| **1. Integrasi Data Real-Time (IoT/BMKG)** | 🟢 **Sudah Diimplementasikan** | Mengimplementasikan **Internal Virtual Hydrological Telemetry REST API** (`/api/telemetry`) yang menggabungkan master dataset spasial BBWS Indramayu (`infrastruktur_pengendali_air_indramayu.geojson`) dengan feed satelit cuaca & hidrologi live (Open-Meteo GloFAS & BMKG Grid). Titik pantau di peta evakuasi warga (`/warga/evakuasi`) kini ter-update secara otomatis setiap 45 detik tanpa butuh perangkat sensor fisik mahal. |
| **2. Optimasi Fitur Offline-First** | 🟡 **Parsial (Tahap Awal)** | Sudah ada konfigurasi dasar PWA (manifest & icons) serta sinkronisasi data lokal via *localStorage*, namun belum ada caching peta offline penuh jika jaringan mati total. |
| **3. Validasi Laporan Warga** | 🟢 **Sudah Diimplementasikan** | Sudah menggunakan inferensi AI Computer Vision (MobileNetV2) untuk deteksi keabsahan foto banjir/genangan, penguncian koordinat otomatis via Geolocation API, dan filter moderasi posko. |

