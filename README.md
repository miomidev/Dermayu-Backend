# DERMAYU (Dering Evakuasi, Respons Masyarakat, dan Aduan Wilayah Indramayu)

**DERMAYU** adalah platform pelaporan bencana dan infrastruktur berbasis lokasi yang dirancang untuk mempercepat respons penanganan banjir di Kabupaten Indramayu. Sistem ini mengintegrasikan validasi foto banjir otomatis berbasis kecerdasan buatan (AI Convolutional Neural Network) serta sistem peringatan dini **Dering Evakuasi** untuk keselamatan warga.

---

## 🛠️ Tech Stack

- **Frontend & Web Admin**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS, Lucide React Icons, Framer Motion
- **Backend API**: Next.js Route Handlers (RESTful API v1)
- **Database**: PostgreSQL 15+ (pgAdmin 4)
- **ORM**: Prisma ORM 6
- **Authentication**: JSON Web Token (JWT Access 15m & Refresh 7d) + Bcrypt 12 salt rounds + SHA-256 token hashing
- **Role-Based Access Control (RBAC)**: 3 Peran Terpisah (Warga, Petugas Lapangan, Super Admin)
- **AI Microservice**: Python 3.10+, FastAPI, TensorFlow / Keras (CNN Model Binary Classification)
- **Client Platforms**: Web / PWA (Desktop & iOS) & Mobile App Android (Flutter)

---

## 💻 Cara Menjalankan Project

Ikuti langkah-langkah berikut secara berurutan: **Clone ➔ Install ➔ Run**.

### 1. Clone Repository
```bash
git clone https://github.com/miomidev/dermayu-backend.git
cd dermayu-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
Buat salinan file `.env.example` menjadi `.env.local` dan `.env`:
```bash
cp .env.example .env.local
cp .env.example .env
```
Sesuaikan konfigurasi koneksi database PostgreSQL di dalam `.env.local` dan `.env`:
```env
DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/dermayu?schema=public"
```

### 4. Setup & Seeding Database
Jalankan sinkronisasi skema Prisma ke database PostgreSQL dan isi data awal:
```bash
# Sinkronkan skema database
npx prisma db push

# Jalankan seeder (3 Akun demo resmi, Kecamatan Indramayu, Posko, Kontak Darurat)
npm run db:seed
```

> **🔑 Kredensial Akun Default (Hasil Seeder 3 Peran):**
> - **Super Admin**: `superadmin@dermayu.id` | Password: `AdminDermayu2026!`
> - **Petugas Lapangan**: `petugas@dermayu.id` | Password: `AdminDermayu2026!`
> - **Warga**: `warga@dermayu.id` | Password: `WargaDermayu2026!`

### 5. Run Project
Jalankan server aplikasi Next.js dalam mode development:
```bash
npm run dev
```
Buka browser dan akses aplikasi di: **[http://localhost:3000](http://localhost:3000)**.

*(Opsional)* **Menjalankan Layanan AI CNN**:
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```
Layanan AI akan aktif pada `http://127.0.0.1:8000`.

---

## 🚀 Progress Saat Ini

Berikut adalah status perkembangan fitur pada repositori ini:

- [x] **Landing Page & Informasi Publik**:
  - Halaman beranda interaktif dengan visual hero modern, statistik wilayah, fitur utama, dan FAQ.
  - Halaman panduan penggunaan platform bagi warga dan relawan.
- [x] **Autentikasi & RBAC (Role-Based Access Control - 3 Peran)**:
  - Sistem registrasi warga dan login untuk 3 peran: Warga (`CITIZEN`), Petugas (`OFFICER`), dan Super Admin (`SUPERADMIN`).
  - Keamanan standar industri: JWT Access Token (15m), Refresh Token rotasi (7d) dengan hash SHA-256, Bcrypt password hashing, dan logout pembatalan sesi.
- [x] **Portal Pengguna Warga (PWA)**:
  - Form pelaporan aduan bencana/banjir lengkap dengan foto, tingkat keparahan, ketinggian air, dan titik koordinat GPS.
  - Tambah foto susulan pada laporan aktif dan opsi membatalkan laporan saat masih status `SUBMITTED`.
  - Dashboard pemantauan status aduan dan riwayat laporan warga.
  - Informasi direktori posko evakuasi dan nomor kontak darurat terpadu.
- [x] **Portal Petugas Lapangan**:
  - Dashboard penugasan lapangan (triage aduan masuk).
  - Pembaruan status penugasan (`IN_PROGRESS` ➔ `RESOLVED`) disertai pengunggahan foto bukti resolusi penanganan lapangan.
  - Manajemen logistik posko dan laporan telemetri kondisi wilayah terdampak.
- [x] **Portal Web Admin**:
  - Dashboard pemantauan statistik laporan darurat secara ringkas.
  - Manajemen verifikasi laporan, penolakan dengan alasan wajib, penandaan duplikat, dan penugasan ke petugas.
  - Modul Dering Evakuasi: estimasi sasaran penerima (*preview*), siaran konfirmasi darurat (*send*), dan riwayat pengiriman.
  - Audit log aktivitas administratif dan CRUD posko evakuasi.
- [x] **Backend REST API v1**:
  - 30+ endpoint aktif (Autentikasi, Pelaporan, Peta Publik terverifikasi dengan bounding box, Dering Evakuasi, Data Wilayah Kecamatan/Desa, dan Export Laporan).
  - Sistem pembuatan kode tiket otomatis (`DMY-YYYYMMDD-NNNN`) dan idempotensi unggahan.
- [x] **Integrasi Kecerdasan Buatan (AI CNN)**:
  - Integrasi asinkron backend ke layanan inferensi model CNN (`.h5`) untuk klasifikasi kebenaran foto banjir tanpa memblokir pengiriman laporan warga.
- [x] **Basis Data PostgreSQL**:
  - 18 tabel relasional lengkap menggunakan Prisma ORM beserta seeder data kecamatan asli Indramayu.

---

## 📡 Daftar Endpoint REST API v1

| Kategori | Method | Endpoint | Hak Akses | Keterangan |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | Publik | Pendaftaran akun warga |
| | `POST` | `/api/v1/auth/login` | Publik | Login & generate token JWT |
| | `POST` | `/api/v1/auth/logout` | Login | Cabut sesi refresh token |
| | `POST` | `/api/v1/auth/refresh` | Publik | Rotasi & perpanjangan access token |
| | `POST` | `/api/v1/auth/forgot-password` | Publik | Permintaan reset kata sandi |
| | `POST` | `/api/v1/auth/reset-password` | Publik | Eksekusi ubah kata sandi dengan token |
| **Profil** | `GET` / `PATCH` / `DELETE` | `/api/v1/me` | Login | Profil, ubah data, & hapus akun |
| **Laporan** | `POST` | `/api/v1/reports` | Warga | Buat laporan bencana (*multipart*) |
| | `GET` | `/api/v1/reports/mine` | Warga | Daftar laporan milik pelapor |
| | `GET` | `/api/v1/reports/:id` | Pemilik / Staff | Detail lengkap riwayat & media laporan |
| | `POST` | `/api/v1/reports/:id/media` | Pemilik | Unggah foto tambahan laporan aktif |
| | `PATCH` | `/api/v1/reports/:id/cancel` | Pemilik | Batalkan laporan (status SUBMITTED) |
| | `GET` | `/api/v1/reports/public` | Publik / Login | Peta bencana publik terverifikasi (filter bbox) |
| **Petugas** | `GET` | `/api/v1/officer/assignments` | Petugas | Daftar tugas laporan lapangan |
| | `PATCH` | `/api/v1/officer/assignments/:id/status` | Petugas | Update status penugasan (IN_PROGRESS/RESOLVED) |
| | `POST` | `/api/v1/officer/assignments/:id/proof` | Petugas | Unggah foto bukti resolusi penanganan |
| **Admin** | `GET` | `/api/v1/admin/reports` | Super Admin | Filter laporan lengkap & skor AI |
| | `GET` | `/api/v1/admin/reports/:id` | Super Admin | Detail verifikasi laporan |
| | `PATCH` | `/api/v1/admin/reports/:id/verify` | Super Admin | Verifikasi laporan warga |
| | `PATCH` | `/api/v1/admin/reports/:id/reject` | Super Admin | Tolak laporan (wajib alasan penolakan) |
| | `PATCH` | `/api/v1/admin/reports/:id/duplicate` | Super Admin | Tandai duplikat dari laporan lain |
| | `POST` | `/api/v1/admin/reports/:id/assign` | Super Admin | Penugasan laporan ke petugas lapangan |
| | `GET` / `POST` | `/api/v1/admin/alerts` | Super Admin | Riwayat & buat Dering Evakuasi |
| | `POST` | `/api/v1/admin/alerts/:id/preview` | Super Admin | Pratinjau estimasi jumlah penerima |
| | `POST` | `/api/v1/admin/alerts/:id/send` | Super Admin | Konfirmasi siaran peringatan darurat |
| | `POST` | `/api/v1/admin/alerts/:id/end` | Super Admin | Akhiri status darurat Dering |
| | `CRUD` | `/api/v1/admin/evacuation-points` | Super Admin | Kelola data posko pengungsian |
| | `GET` | `/api/v1/admin/stats/overview` | Super Admin | Statistik bencana & penanganan |
| | `GET` | `/api/v1/admin/audit-logs` | Super Admin | Log audit aktivitas administratif |
| **Informasi** | `GET` | `/api/v1/alerts` | Login | Dering Evakuasi aktif di wilayah |
| | `GET` | `/api/v1/evacuation-points` | Login | Titik lokasi posko pengungsian terdekat |
| | `GET` | `/api/v1/emergency-contacts` | Login | Kontak darurat (BPBD, PMI, Damkar, Polisi) |
| | `GET` | `/api/v1/notifications` | Login | Riwayat notifikasi pengguna |
| | `PATCH` | `/api/v1/notifications/:id/read` | Login | Tandai notifikasi sudah dibaca |
