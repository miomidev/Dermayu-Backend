# DERMAYU (Dering Evakuasi, Respons Masyarakat, dan Aduan Wilayah Indramayu)

**DERMAYU** adalah platform pelaporan bencana dan infrastruktur berbasis lokasi yang dirancang untuk mempercepat respons penanganan banjir di Kabupaten Indramayu. Sistem ini mengintegrasikan validasi foto banjir otomatis berbasis kecerdasan buatan (AI Convolutional Neural Network) serta sistem peringatan dini **Dering Evakuasi** untuk keselamatan warga.

---

## 🛠️ Tech Stack

- **Frontend & Web Admin**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS, Lucide React Icons, Framer Motion
- **Backend API**: Next.js Route Handlers (RESTful API v1)
- **Database**: PostgreSQL 15+ (pgAdmin 4) atau MySQL 8 (Laragon)
- **ORM**: Prisma ORM 6
- **Authentication**: JSON Web Token (JWT Access & Refresh Token) + Bcrypt
- **AI Microservice**: Python 3.10+, FastAPI, TensorFlow / Keras (CNN Model Binary Classification)
- **Client Platforms**: Web / PWA (Desktop & iOS) & Mobile App Android (Flutter)

---

## 💻 Cara Menjalankan Project

Ikuti langkah-langkah berikut secara berurutan: **Clone ➔ Install ➔ Run**.

### 1. Clone Repository
```bash
git clone https://github.com/your-username/dermayu-backend.git
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
Jalankan migrasi skema Prisma ke database PostgreSQL dan isi data awal:
```bash
# Sinkronkan skema database
npx prisma db push

# Jalankan seeder (Akun default, Kecamatan Indramayu, Posko, Kontak Darurat)
npm run db:seed
```

> **🔑 Kredensial Akun Default (Hasil Seeder):**
> - **Super Admin**: `superadmin@dermayu.id` | Password: `AdminDermayu2026!`
> - **Admin Operator**: `admin@dermayu.id` | Password: `AdminDermayu2026!`
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
- [x] **Autentikasi & RBAC (Role-Based Access Control)**:
  - Sistem registrasi dan login multi-peran (Warga, Petugas, Admin, Super Admin).
  - Keamanan berbasis JWT Access Token (15m) dan Refresh Token (7d) serta password hashing Bcrypt.
- [x] **Portal Pengguna Warga (PWA)**:
  - Form pelaporan aduan bencana/banjir lengkap dengan foto, tingkat keparahan, ketinggian air, dan titik koordinat GPS.
  - Dashboard pemantauan status aduan dan riwayat laporan warga.
  - Informasi direktori posko evakuasi dan nomor kontak darurat terpadu.
- [x] **Portal Petugas Lapangan**:
  - Dashboard penugasan lapangan (triage aduan masuk).
  - Manajemen logistik posko dan laporan telemetri kondisi wilayah terdampak.
- [x] **Portal Web Admin**:
  - Dashboard pemantauan statistik laporan darurat secara ringkas.
  - Audit log aktivitas administratif.
- [x] **Backend REST API v1**:
  - 26+ endpoint aktif (Autentikasi, Pelaporan, Peta Publik terverifikasi, Dering Evakuasi, Data Wilayah Kecamatan/Desa, dan Export Laporan).
  - Sistem pembuatan kode tiket otomatis (`DMY-YYYYMMDD-NNNN`) dan idempotensi unggahan.
- [x] **Integrasi Kecerdasan Buatan (AI CNN)**:
  - Integrasi asinkron backend ke layanan inferensi model CNN (`.h5`) untuk klasifikasi kebenaran foto banjir tanpa memblokir pengiriman laporan warga.
- [x] **Basis Data PostgreSQL**:
  - 18 tabel relasional lengkap menggunakan Prisma ORM beserta seeder data kecamatan asli Indramayu.

---

## 📡 Daftar Endpoint Utama REST API

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/health` | Health check status server |
| `POST` | `/api/v1/auth/register` | Pendaftaran akun warga |
| `POST` | `/api/v1/auth/login` | Login & generate JWT token |
| `GET` / `PATCH` | `/api/v1/auth/me` | Informasi profil akun aktif |
| `GET` / `POST` | `/api/v1/reports` | Mengambil & mengirim laporan baru (*multipart*) |
| `GET` | `/api/v1/reports/public` | Peta publik laporan terverifikasi (bebas data pribadi) |
| `GET` | `/api/v1/categories` | Daftar kategori aduan bencana |
| `GET` | `/api/v1/alerts` | Daftar Dering Evakuasi aktif |
| `GET` | `/api/v1/evacuation-points` | Titik lokasi posko pengungsian |
| `GET` | `/api/v1/emergency-contacts` | Daftar kontak darurat (BPBD, PMI, Damkar, Kepolisian) |
