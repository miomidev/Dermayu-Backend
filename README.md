# 🌊 DERMAYU — Backend API & Web Management

**Dering Evakuasi, Respons Masyarakat, dan Aduan Wilayah Indramayu**  
Platform pelaporan bencana & infrastruktur berbasis lokasi dengan integrasi validasi AI CNN untuk Kabupaten Indramayu.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router + React 19 + TypeScript)
- **Styling**: Tailwind CSS
- **Database**: MySQL 8 (Laragon)
- **ORM**: Prisma 6 Client
- **Authentication**: JWT (Access Token 15m + Refresh Token 7d) & Bcrypt 12 rounds
- **AI Microservice**: Python FastAPI + TensorFlow Keras (`model_banjir_indramayu.h5`)
- **Clients**: Android (Flutter Native) & iOS (PWA Web Push)

---

## 📂 Struktur Proyek

```
dermayu-backend/
├── ai_service/                # Microservice AI CNN (FastAPI)
│   ├── main.py                # Runner endpoint POST /v1/predict
│   └── requirements.txt
├── prisma/                    # Skema Database & Migrasi
│   ├── schema.prisma          # Skema MySQL lengkap (PRD Bab 12)
│   └── seed.ts                # Seeder akun admin, kategori & kecamatan
├── public/
│   └── uploads/               # Penyimpanan foto laporan terunggah
├── src/
│   ├── app/
│   │   ├── api/v1/            # REST API Route Handlers
│   │   │   ├── auth/          # Register, Login, Me (FR-AUTH)
│   │   │   ├── reports/       # Buat & daftar laporan (FR-RPT)
│   │   │   ├── alerts/        # Dering Evakuasi (FR-ALERT)
│   │   │   ├── categories/    # Kategori aduan
│   │   │   ├── evacuation-points/ # Titik posko pengungsian
│   │   │   └── emergency-contacts/ # BPBD, Damkar, PMI, Polisi
│   │   ├── layout.tsx
│   │   └── page.tsx           # Interactive API Explorer & Landing Portal
│   └── lib/
│       ├── db.ts              # Prisma singleton instance
│       ├── auth.ts            # Hashing & JWT helpers
│       ├── api-response.ts    # Standard response format (PRD 13.1)
│       ├── ai-service.ts      # Jembatan pemanggil AI asinkron
│       └── storage.ts         # Upload handler
├── .env                       # Konfigurasi environment
└── PRD.md                     # Dokumen PRD v0.1
```

---

## ⚡ Cara Menjalankan

### 1. Database MySQL (Laragon)
1. Buka **Laragon**, klik tombol **Start All** (memastikan MySQL aktif di port 3306).
2. Terapkan skema tabel ke database MySQL:
   ```bash
   npm run db:push
   ```
3. Isi data awal (Kategori, Kecamatan Indramayu, Kontak Darurat, dan Akun Demo):
   ```bash
   npm run db:seed
   ```

#### 🔑 Akun Default Hasil Seeder:
- **Super Admin**: `superadmin@dermayu.id` / `AdminDermayu2026!`
- **Admin Operator**: `admin@dermayu.id` / `AdminDermayu2026!`
- **Petugas Lapangan**: `petugas@dermayu.id` / `AdminDermayu2026!`
- **Warga Contoh**: `warga@dermayu.id` / `WargaDermayu2026!`

---

### 2. Menjalankan Server Next.js
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000) untuk mengakses portal web dan **Interactive API Explorer**.

---

### 3. Menjalankan Microservice AI (Untuk Teman AI)
1. Masuk ke folder `ai_service`:
   ```bash
   cd ai_service
   pip install -r requirements.txt
   ```
2. Letakkan file model `.h5` hasil training Google Colab (`model_banjir_indramayu.h5`) di dalam folder `ai_service/`.
3. Jalankan server:
   ```bash
   python main.py
   ```
   Server AI akan berjalan di `http://127.0.0.1:8000`.

---

## 📡 Daftar Endpoint REST API v1

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/health` | Cek status server |
| `POST` | `/api/v1/auth/register` | Registrasi akun warga |
| `POST` | `/api/v1/auth/login` | Login (mendapatkan access & refresh token) |
| `GET` / `PATCH` | `/api/v1/auth/me` | Profil pengguna saat ini |
| `GET` / `POST` | `/api/v1/reports` | Ambil & kirim laporan baru (*multipart*) |
| `GET` | `/api/v1/reports/public` | Peta publik laporan terverifikasi (bebas PII) |
| `GET` | `/api/v1/categories` | Kategori laporan |
| `GET` | `/api/v1/alerts` | Dering Evakuasi aktif |
| `GET` | `/api/v1/evacuation-points` | Titik posko pengungsian |
| `GET` | `/api/v1/emergency-contacts` | Nomor telepon darurat |
