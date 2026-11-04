# DERMAYU - AI Inference Microservice (CNN MobileNetV2)

Layanan microservice mandiri berbasis **FastAPI** dan **TensorFlow/Keras** untuk klasifikasi dan validasi foto laporan banjir di Kabupaten Indramayu, sesuai spesifikasi **PRD Bab 9**.

---

## 📁 Struktur Berkas

```text
ai_service/
├── model/
│   └── model_banjir_tflearning_fix_sementara.keras   # Model CNN Keras 3 (MobileNetV2 Transfer Learning)
├── main.py                         # REST API FastAPI (Endpoint /v1/predict)
├── test_predict.py                 # CLI tester mandiri untuk 1 gambar
├── requirements.txt                # Dependensi Python
├── run_ai.bat                      # Skrip 1-klik jalankan server di Windows
└── README.md
```

---

## ⚙️ Spesifikasi Model

- **Arsitektur:** CNN MobileNetV2 (`mobilenetv2_0.35_128`) + Custom Dense Head
- **Ukuran Input:** `128 x 128` pixel, 3 kanal RGB
- **Rentang Nilai:** `0 - 255` (Rescaling internal `1/127.5` dan offset `-1.0` sudah ada di dalam arsitektur model)
- **Output:** Nilai probabilitas Sigmoid tunggal `[0.0 - 1.0]`
  - Probabilitas $\ge 0.50$ ➔ `flood` (Banjir)
  - Probabilitas $< 0.50$ ➔ `non_flood` (Bukan Banjir)

---

## 🚀 Panduan Menjalankan Layanan

### 1. Persyaratan Python
Gunakan **Python 3.10, 3.11, atau 3.12** (karena library resmi `tensorflow` membutuhkan versi ini).

### 2. Buat Virtual Environment & Pasang Dependensi
Buka terminal / PowerShell di folder ini (`d:\laragon\www\dermayu-backend\ai_service`):

```bash
# 1. Buat virtual environment
python -m venv venv

# 2. Aktifkan venv
# Di Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Atau di Command Prompt (cmd):
venv\Scripts\activate.bat

# 3. Pasang paket yang dibutuhkan
pip install -r requirements.txt
```

### 3. Jalankan Server AI
```bash
# Opsi 1: Jalankan skrip batch
run_ai.bat

# Opsi 2: Jalankan via uvicorn manual
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Layanan akan berjalan di `http://127.0.0.1:8000`.  
Dokumentasi interaktif Swagger UI tersedia di `http://127.0.0.1:8000/docs`.

---

## 🔗 Kontrak Integrasi Backend Next.js

Backend utama Next.js (`src/lib/ai-service.ts`) otomatis memanggil endpoint ini secara asinkron setiap kali warga mengunggah laporan:

- **URL:** `POST http://127.0.0.1:8000/v1/predict`
- **Headers:**
  - `Authorization: Bearer internal_ai_secret_key_dermayu`
- **Body:** `multipart/form-data` dengan field `file`
- **Format Respon:**
  ```json
  {
    "label": "flood",
    "confidence": 0.942,
    "probabilities": {
      "flood": 0.942,
      "non_flood": 0.058
    },
    "model_version": "cnn-flood-indramayu-v1.0",
    "inference_ms": 115
  }
  ```

---

## 🧪 Uji Coba Cepat 1 Foto Gambar

Untuk mengetes apakah model membaca gambar dengan benar tanpa menyalakan server HTTP:
```bash
python test_predict.py <path_ke_file_gambar.jpg>
```
Contoh:
```bash
python test_predict.py D:\dataset\foto_banjir_eretan.jpg
```

